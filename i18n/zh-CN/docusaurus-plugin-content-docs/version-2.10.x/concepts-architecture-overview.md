---
id: concepts-architecture-overview
title: 架构概述
sidebar_label: "架构"
original_id: concepts-architecture-overview
---

在最高层级，一个 Pulsar 实例由一个或多个 Pulsar 集群组成。实例中的集群可以在彼此之间[复制](concepts-replication.md)数据。

在 Pulsar 集群中：

* 一个或多个代理处理来自生产者的传入消息并进行负载均衡，将消息分发给消费者，与 Pulsar 配置存储通信以处理各种协调任务，将消息存储在 BookKeeper 实例（也称 bookie）中，依赖集群特定的 ZooKeeper 集群执行某些任务，等等。
* 由一个或多个 bookie 组成的 BookKeeper 集群处理消息的[持久化存储](#persistent-storage)。
* 特定于该集群的 ZooKeeper 集群处理 Pulsar 集群之间的协调任务。

下图展示了一个 Pulsar 集群：

![Pulsar 架构图](/assets/pulsar-system-architecture.png)

在更广泛的实例级别，一个实例范围的 ZooKeeper 集群称为配置存储，处理涉及多个集群的协调任务，例如[地理复制](concepts-replication.md)。

## 代理

Pulsar 消息代理是一个无状态组件，主要负责运行另外两个组件：

* 一个 HTTP 服务器，暴露 {@inject: rest:REST:/} API，用于管理任务和生产者和消费者的[主题查找](concepts-clients.md#client-setup-phase)。生产者连接到代理发布消息，消费者连接到代理消费消息。
* 一个调度器（dispatcher），它是一个异步 TCP 服务器，使用自定义的[二进制协议](developing-binary-protocol.md)进行所有数据传输

为了性能考虑，消息通常从[管理账本](#managed-ledgers)缓存中分发，*除非*积压超过了缓存大小。如果积压增长到超过缓存大小，代理将开始从 BookKeeper 读取条目。

最后，为了支持全局主题上的地理复制，代理管理复制器，复制器跟踪在本地区域发布的条目，并使用 Pulsar [Java 客户端库](client-libraries-java.md)将它们重新发布到远程区域。

> 有关管理 Pulsar 代理的指南，请参阅[代理](admin-api-brokers.md)指南。

## 集群

一个 Pulsar 实例由一个或多个 Pulsar *集群*组成。集群又包括：

* 一个或多个 Pulsar [代理](#brokers)
* 用于集群级配置和协调的 ZooKeeper 仲裁
* 用于消息[持久化存储](#persistent-storage)的 bookie 集群

集群可以使用[地理复制](concepts-replication.md)在彼此之间复制数据。

> 有关管理 Pulsar 集群的指南，请参阅[集群](admin-api-clusters.md)指南。

## 元数据存储

Pulsar 元数据存储维护 Pulsar 集群的所有元数据，例如主题元数据、模式、代理负载数据等。Pulsar 使用 [Apache ZooKeeper](https://zookeeper.apache.org/) 进行元数据存储、集群配置和协调。Pulsar 元数据存储可以部署在单独的 ZooKeeper 集群上或部署在现有的 ZooKeeper 集群上。您可以使用一个 ZooKeeper 集群同时用于 Pulsar 元数据存储和 BookKeeper 元数据存储。如果您想部署连接到现有 BookKeeper 集群的 Pulsar 代理，您需要分别为 Pulsar 元数据存储和 BookKeeper 元数据存储部署单独的 ZooKeeper 集群。

> Pulsar 还支持更多元数据后端服务，包括 [etcd](https://etcd.io/) 和 [RocksDB](http://rocksdb.org/)（仅适用于独立 Pulsar）。

在 Pulsar 实例中：

* 配置存储仲裁存储租户、命名空间以及其他需要全局一致性的实体的配置。
* 每个集群都有自己的本地 ZooKeeper 集群，存储集群特定的配置和协调信息，例如哪些代理负责哪些主题以及所有权元数据、代理负载报告、BookKeeper 账本元数据等等。

## 配置存储

配置存储维护 Pulsar 实例的所有配置，例如集群、租户、命名空间、分区主题相关配置等。Pulsar 实例可以有一个本地集群、多个本地集群或多个跨区域集群。因此，配置存储可以在 Pulsar 实例下的多个集群间共享配置。配置存储可以部署在单独的 ZooKeeper 集群上或部署在现有的 ZooKeeper 集群上。

## 持久化存储

Pulsar 为应用程序提供有保证的消息传递。如果消息成功到达 Pulsar 代理，它将被传递到其预定目标。

这种保证要求未被确认的消息以持久化方式存储，直到它们可以被传递给消费者并被确认。这种消息模式通常称为*持久化消息传递*。在 Pulsar 中，所有消息的 N 个副本都被存储并同步到磁盘，例如，在两个服务器上存储 4 个副本，每个服务器上有镜像的 [RAID](https://en.wikipedia.org/wiki/RAID) 卷。

### Apache BookKeeper

Pulsar 使用一个名为 [Apache BookKeeper](http://bookkeeper.apache.org/) 的系统进行持久化消息存储。BookKeeper 是一个分布式[预写日志](https://en.wikipedia.org/wiki/Write-ahead_logging)（WAL）系统，为 Pulsar 提供了几个关键优势：

* 它使 Pulsar 能够利用许多独立的日志，称为[账本](#ledgers)。随着时间的推移，可以为主题创建多个账本。
* 它为处理条目复制的顺序数据提供非常高效的存储。
* 它在各种系统故障的情况下保证账本的读取一致性。
* 它在 bookies 之间提供均匀的 I/O 分布。
* 它在容量和吞吐量方面都是水平可扩展的。可以通过向集群添加更多 bookies 来立即增加容量。
* Bookies 被设计为处理数千个账本的并发读写操作。通过使用多个磁盘设备——一个用于日志，另一个用于一般存储——bookies 能够将读取操作的影响与正在进行写入操作的延迟隔离开来。

除了消息数据，*游标*（cursors）也被持久化存储在 BookKeeper 中。游标是[消费者](reference-terminology.md#consumer)的[订阅](reference-terminology.md#subscription)位置。BookKeeper 使 Pulsar 能够以可扩展的方式存储消费者位置。