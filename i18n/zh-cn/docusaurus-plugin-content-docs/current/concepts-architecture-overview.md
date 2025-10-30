---
id: concepts-architecture-overview
title: 架构概述
sidebar_label: "架构"
description: 全面了解 Apache Pulsar 的架构
---

在最高级别，Pulsar 实例由一个或多个 Pulsar 集群组成。实例内的集群可以彼此[复制](concepts-replication.md)数据。

Pulsar 集群由以下组件组成：

* 一个或多个代理处理和[负载均衡](administration-load-balance.md)来自生产者的传入消息，将消息分发给消费者，与 Pulsar 元数据存储通信以处理各种协调任务，将消息存储在 BookKeeper 实例（也称为 bookies）中，并通过元数据存储协调集群操作。
* 由一个或多个 bookies 组成的 BookKeeper 集群处理消息的[持久存储](#persistent-storage)。
* 元数据存储集群（ZooKeeper、etcd 或其他支持的后端）处理协调任务和特定于集群的元数据存储。

下图说明了一个 Pulsar 集群：

![Pulsar 架构图](/assets/pulsar-system-architecture.png)

在更广泛的实例级别，一个名为配置存储的实例级 ZooKeeper 集群处理涉及多个集群的协调任务，例如[地理复制](concepts-replication.md)。

## 代理

Pulsar 消息代理是一个无状态组件，主要负责运行另外两个组件：

* 一个 HTTP 服务器，暴露 {@inject: rest:REST:/} API，用于管理任务和生产者和消费者的[主题查找](concepts-clients.md#client-setup-phase)。生产者连接到代理以发布消息，消费者连接到代理以消费消息。
* 一个调度器，它是一个异步 TCP 服务器，使用自定义[二进制协议](developing-binary-protocol.md)用于所有数据传输

消息通常从[管理的Ledger](#managed-ledgers)缓存中分发出以获得性能，*除非*积压超过缓存大小。如果积压对缓存来说过大，代理将开始从 BookKeeper 读取条目。

最后，为了支持全局主题上的地理复制，代理管理复制器，这些复制器跟踪在本地区域发布的条目，并使用 Pulsar [Java 客户端库](client-libraries-java.md) 将它们重新发布到远程区域。

> 有关管理 Pulsar 代理的指南，请参阅[代理](admin-api-brokers.md)指南。

## 集群

Pulsar 实例由一个或多个 Pulsar *集群*组成。集群又由以下组成：

* 一个或多个 Pulsar [代理](#brokers)
* 用于集群级配置和协调的 ZooKeeper 仲裁
* 用于消息[持久存储](#persistent-storage) 的 bookies 集合

集群可以使用[地理复制](concepts-replication.md)在彼此之间复制。

> 有关管理 Pulsar 集群的指南，请参阅[集群](admin-api-clusters.md)指南。

## 元数据存储

Pulsar 元数据存储维护 Pulsar 集群的所有元数据，例如主题元数据、模式、代理负载数据等。Pulsar 支持多种元数据存储后端，以在部署架构和操作要求方面提供灵活性：

### 支持的元数据存储后端

- **[Apache ZooKeeper](https://zookeeper.apache.org/)** - 默认选项，具有强一致性保证的生产就绪元数据存储。
- **[etcd](https://etcd.io/)** - 云原生分布式键值存储，适用于 Kubernetes 环境和云部署。
- **[RocksDB](http://rocksdb.org/)** - 用于独立 Pulsar 部署的嵌入式键值存储，无需外部协调服务。
- **[Oxia](https://github.com/oxia-db/oxia/)** - 专为大规模分布式系统设计的强大、可扩展的元数据存储和协调系统，内置支持流索引存储以优化实时数据管理。

### 配置

您可以使用 `metadataStoreUrl` 参数配置元数据存储：

```bash
# ZooKeeper
metadataStoreUrl=zk:my-zk-1:2181,my-zk-2:2181,my-zk-3:2181

# etcd
metadataStoreUrl=etcd:my-etcd-1:2379,my-etcd-2:2379,my-etcd-3:2379

# RocksDB (standalone)
metadataStoreUrl=rocksdb:///path/to/data

# Oxia
metadataStoreUrl=oxia:oxia-server:6648
```

### 部署考虑

Pulsar 元数据存储可以部署在单独的集群上或与现有基础设施集成。您可以使用一个 ZooKeeper 集群来处理 Pulsar 元数据存储和 BookKeeper 元数据存储。如果您想部署连接到现有 BookKeeper 集群的 Pulsar 代理，您需要分别为 Pulsar 元数据存储和 BookKeeper 元数据存储部署单独的集群。

在 Pulsar 实例中：

* 配置存储仲裁存储租户、命名空间和其他需要全局一致的实体的配置。
* 每个集群都有自己的本地 ZooKeeper 集合，存储特定于集群的配置和协调，例如哪些代理负责哪些主题以及所有权元数据、代理负载报告、BookKeeper Ledger元数据等等。

## 配置存储

配置存储是一个用于配置特定任务的 ZooKeeper 仲裁，它维护 Pulsar 实例的所有配置，例如集群、租户、命名空间、分区主题相关配置等。Pulsar 实例可以有一个本地集群、多个本地集群或多个跨区域集群。因此，配置存储可以在 Pulsar 实例下的多个集群之间共享配置。配置存储可以部署在单独的 ZooKeeper 集群上或部署在现有的 ZooKeeper 集群上。

## 持久存储

Pulsar 为应用程序提供有保证的消息传递。如果消息成功到达 Pulsar 代理，它将被传递到其预期目标。

这种保证要求未确认的消息被持久存储，直到它们可以被传递给消费者并被消费者确认。这种消息模式通常称为*持久消息传递*。在 Pulsar 中，所有消息的 N 个副本被存储并同步到磁盘，例如，在两台服务器上复制 4 个副本，每台服务器都有镜像 [RAID](https://en.wikipedia.org/wiki/RAID) 卷。

### Apache BookKeeper

Pulsar 使用一个名为 [Apache BookKeeper](http://bookkeeper.apache.org/) 的系统进行持久消息存储。BookKeeper 是一个分布式[预写日志](https://en.wikipedia.org/wiki/Write-ahead_logging) (WAL) 系统，为 Pulsar 提供了几个关键优势：

* 它使 Pulsar 能够利用许多独立的日志，称为[Ledger](#ledgers)。可以为主题创建多个Ledger。
* 它为处理条目复制的顺序数据提供非常高效的存储。
* 它保证在各种系统故障存在的情况下Ledger的读取一致性。
* 它在 bookies 之间提供均匀的 I/O 分布。
* 它在容量和吞吐量方面都是水平可扩展的。可以通过向集群添加更多 bookies 来立即增加容量。
* Bookies 被设计为处理数千个具有并发读写操作的Ledger。通过使用多个磁盘设备---一个用于日志，另一个用于一般存储---bookies 可以将读取操作的影响与正在进行的写入操作的延迟隔离开来。

除了消息数据，*游标*也被持久存储在 BookKeeper 中。游标是[消费者](concepts-clients.md#consumer)的[订阅](concepts-messaging.md#subscriptions)位置。BookKeeper 使 Pulsar 能够以可扩展的方式存储消费者位置。

目前，Pulsar 支持持久消息存储。这解释了所有主题名称中的 `persistent`。这是一个示例：

```http
persistent://my-tenant/my-namespace/my-topic
```

> Pulsar 还支持临时[非持久](concepts-messaging.md#non-persistent-topics)消息存储。

您可以在下图中看到代理和 bookies 如何交互的说明：

![Pulsar 集群中的代理和 bookies](/assets/broker-bookie.png)


### Ledger

Ledger是一个仅追加的数据结构，具有单一写入者，分配给多个 BookKeeper 存储节点或 bookies。Ledger条目被复制到多个 bookies。Ledger本身具有非常简单的语义：

* Pulsar 代理可以创建Ledger，向Ledger追加条目，并关闭Ledger。
* Ledger关闭后---无论是显式还是因为写入者进程崩溃---它只能以只读模式打开。
* 最后，当Ledger中的条目不再需要时，整个Ledger可以从系统中删除（跨所有 bookies）。

#### Ledger读取一致性

Bookkeeper 的主要优势在于它保证在故障存在的情况下Ledger的读取一致性。由于Ledger只能由单个进程写入，该进程可以非常有效地自由追加条目，而无需获得共识。故障后，Ledger将经历恢复过程，该过程将最终确定Ledger的状态并建立哪个条目最后提交到日志。在那之后，保证Ledger的所有读者看到完全相同的内容。

#### 管理的Ledger

鉴于 Bookkeeper Ledger提供单一日志抽象，在Ledger之上开发了一个名为*管理的Ledger*的库，代表单个主题的存储层。管理的Ledger表示消息流的抽象，具有单一写入者在流末尾不断追加，以及多个消费流的游标，每个游标都有自己的关联位置。

在内部，单一管理的Ledger使用多个 BookKeeper Ledger来存储数据。拥有多个Ledger有两个原因：

1. 故障后，Ledger不再可写，需要创建新的Ledger。
2. 当所有游标都消费了Ledger包含的消息时，可以删除Ledger。这允许Ledger的定期滚动。

### 日志存储

在 BookKeeper 中，*日志*文件包含 BookKeeper 事务日志。在对[Ledger](#ledgers)进行更新之前，bookie 需要确保描述更新的事务被写入持久（非易失性）存储。一旦 bookie 启动或较旧的日志文件达到日志文件大小阈值（使用 [`journalMaxSizeMB`](reference-configuration.md#bookkeeper) 参数配置），就会创建新的日志文件。

## Pulsar 代理

Pulsar 客户端与 Pulsar [集群](#clusters)交互的一种方式是直接连接到 Pulsar 消息[代理](#brokers)。然而，在某些情况下，这种直接连接是不可行或不可取的，因为客户端没有直接访问代理地址的权限。例如，如果您在云环境或 [Kubernetes](https://kubernetes.io) 或类似平台上运行 Pulsar，那么直接的客户端到代理连接可能是不可能的。

**Pulsar 代理**通过充当集群中所有代理的单个网关为这个问题提供解决方案。如果您运行 Pulsar 代理（这又是可选的），所有与 Pulsar 集群的客户端连接都将通过代理流动，而不是与代理通信。

> 为了性能和容错性，您可以运行尽可能多的 Pulsar 代理实例。

在架构上，Pulsar 代理从元数据存储获取其所需的所有信息。在机器上启动代理时，您只需要提供集群特定和实例级配置存储集群的元数据存储连接字符串。这是一个示例：

```bash
cd /path/to/pulsar/directory
# 使用 ZooKeeper
bin/pulsar proxy \
    --metadata-store zk:my-zk-1:2181,my-zk-2:2181,my-zk-3:2181 \
    --configuration-metadata-store zk:my-zk-1:2181,my-zk-2:2181,my-zk-3:2181

# 使用 etcd
bin/pulsar proxy \
    --metadata-store etcd:my-etcd-1:2379,my-etcd-2:2379 \
    --configuration-metadata-store etcd:my-etcd-1:2379,my-etcd-2:2379
```

> #### Pulsar 代理文档
> 有关使用 Pulsar 代理的文档，请参阅 [Pulsar 代理管理文档](administration-proxy.md)。


关于 Pulsar 代理的一些重要事项：

* 连接客户端不需要提供*任何*特定配置来使用 Pulsar 代理。您除了更新用于服务 URL 的 IP（例如，如果您在 Pulsar 代理上运行负载均衡器）之外，不需要更新现有应用程序的客户端配置。
* [TLS 加密](security-tls-transport.md)和[mTLS 认证](security-tls-authentication.md) 受 Pulsar 代理支持

## 服务发现

服务发现是一种机制，使连接的[客户端](concepts-clients.md)能够仅使用单个 URL 与整个 Pulsar 实例交互。

如果您愿意，可以使用自己的服务发现系统。如果您使用自己的系统，只有一个要求：当客户端对端点（如 `http://pulsar.us-west.example.com:8080`）执行 HTTP 请求时，客户端需要被重定向到所需集群中的*某个*活动代理，无论是通过 DNS、HTTP 或 IP 重定向，还是其他某种方式。

下图说明了 Pulsar 服务发现：

![Pulsar 中的服务发现](/assets/pulsar-service-discovery.png)

在此图中，Pulsar 集群可以通过单个 DNS 名称访问：`pulsar-cluster.acme.com`。例如，[Python 客户端](client-libraries-python.md)可以像这样访问此 Pulsar 集群：

```python
from pulsar import Client

client = Client('pulsar://pulsar-cluster.acme.com:6650')
```

:::note

在 Pulsar 中，每个主题仅由一个代理处理。客户端读取、更新或删除主题的初始请求被发送到可能不是主题所有者的代理。如果代理无法处理此主题的请求，它会将请求重定向到适当的代理。

:::