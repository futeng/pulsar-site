---
id: concepts-overview
title: Pulsar 概述
sidebar_label: "概述"
original_id: concepts-overview
---

Pulsar 是一个多租户、高性能的服务器间消息传递解决方案。Pulsar 最初由 Yahoo 开发，现由 [Apache 软件基金会](https://www.apache.org/)管理。

## 关键特性

Pulsar 的关键特性如下：

* 原生支持在单个 Pulsar 实例中部署多个集群，并支持集群间消息的无缝[地理复制](administration-geo.md)。
* 极低的发布和端到端延迟。
* 可无缝扩展到超过一百万个主题。
* 简单的[客户端 API](concepts-clients.md)，提供 [Java](client-libraries-java.md)、[Go](client-libraries-go.md)、[Python](client-libraries-python.md) 和 [C++](client-libraries-cpp.md) 等语言的绑定。
* 支持多种[订阅类型](concepts-messaging.md#subscription-types)（[独占](concepts-messaging.md#exclusive)、[共享](concepts-messaging.md#shared) 和 [故障转移](concepts-messaging.md#failover)）。
* 通过 [Apache BookKeeper](http://bookkeeper.apache.org/) 提供的[持久化消息存储](concepts-architecture-overview.md#persistent-storage)保证消息投递。
* 无服务器轻量级计算框架 [Pulsar Functions](functions-overview.md) 提供流原生数据处理能力。
* 基于 Pulsar Functions 构建的无服务器连接器框架 [Pulsar IO](io-overview.md)，简化了数据进出 Apache Pulsar 的过程。
* [分层存储](tiered-storage-overview.md) 可将数据从热/温存储卸载到冷/长期存储（如 S3 和 GCS）。

## 内容

- [消息概念](concepts-messaging.md)
- [架构概述](concepts-architecture-overview.md)
- [Pulsar 客户端](concepts-clients.md)
- [地理复制](concepts-replication.md)
- [多租户](concepts-multi-tenancy.md)
- [身份验证和授权](concepts-authentication.md)
- [主题压缩](concepts-topic-compaction.md)
- [消息限流](concepts-throttling.md)
- [支持 SNI 路由的代理支持](concepts-proxy-sni-routing.md)
- [多个通告监听器](concepts-multiple-advertised-listeners.md)