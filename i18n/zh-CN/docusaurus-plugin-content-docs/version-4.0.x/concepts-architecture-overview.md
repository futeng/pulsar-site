---
id: concepts-architecture-overview
title: 架构概述
sidebar_label: "架构"
description: 全面了解 Apache Pulsar 的架构
---

在最高层级，一个 Pulsar 实例由一个或多个 Pulsar 集群组成。实例中的集群可以在彼此之间[复制](concepts-replication.md)数据。

一个 Pulsar 集群由以下组件组成：

* 一个或多个代理（broker）处理来自生产者的传入消息并进行[负载均衡](administration-load-balance.md)，将消息分发给消费者，与 Pulsar 元数据存储通信以处理各种协调任务，将消息存储在 BookKeeper 实例（也称 bookie）中，并通过元数据存储协调集群操作。
* 由一个或多个 bookie 组成的 BookKeeper 集群处理消息的[持久化存储](#persistent-storage)。
* 元数据存储集群（ZooKeeper、etcd 或其他支持的后端）处理协调任务和集群特定的元数据存储。

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

Pulsar 元数据存储维护 Pulsar 集群的所有元数据，例如主题元数据、模式、代理负载数据等。Pulsar 支持多种元数据存储后端，为部署架构和操作需求提供灵活性：

### 支持的元数据存储后端

- **[Apache ZooKeeper](https://zookeeper.apache.org/)** - 默认选项，生产就绪的元数据存储，具有强一致性保证。
- **[etcd](https://etcd.io/)** - 云原生分布式键值存储，非常适合 Kubernetes 环境和云部署。
- **[RocksDB](http://rocksdb.org/)** - 用于独立 Pulsar 部署的嵌入式键值存储，无需外部协调服务。
- **[Oxia](https://github.com/oxia-db/oxia/)** - 一个健壮、可扩展的元数据存储和协调系统，专为大规模分布式系统设计，内置流索引存储支持以优化实时数据管理。

### 配置

您可以使用 `metadataStoreUrl` 参数配置元数据存储：

```bash
# ZooKeeper
metadataStoreUrl=zk:my-zk-1:2181,my-zk-2:2181,my-zk-3:2181

# etcd
metadataStoreUrl=etcd:my-etcd-1:2379,my-etcd-2:2379,my-etcd-3:2379

# RocksDB (独立模式)
metadataStoreUrl=rocksdb:///path/to/data

# Oxia
metadataStoreUrl=oxia:oxia-server:6648
```

### 部署考虑

Pulsar 元数据存储可以部署在单独的集群上或与现有基础设施集成。您可以使用一个 ZooKeeper 集群同时用于 Pulsar 元数据存储和 BookKeeper 元数据存储。如果您想部署连接到现有 BookKeeper 集群的 Pulsar 代理，您需要分别为 Pulsar 元数据存储和 BookKeeper 元数据存储部署单独的集群。

在 Pulsar 实例中：