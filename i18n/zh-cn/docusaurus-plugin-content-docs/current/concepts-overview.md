---
id: concepts-overview
title: Pulsar 概述
sidebar_label: "概述"
description: Pulsar 的关键功能。
---

Pulsar 是一个多租户、高性能的服务器到服务器消息传递解决方案。Pulsar 最初由 Yahoo 开发，现在由[Apache 软件基金会](https://www.apache.org/)管理。

## 关键功能

Pulsar 的关键功能如下：

* 原生支持 Pulsar 实例中的多个集群，具有跨集群的无缝[地理复制](administration-geo.md)。
* 非常低的发布和端到端延迟。
* 无缝扩展到超过一百万个主题。
* 简单的[客户端 API](concepts-clients.md)，支持[Java](client-libraries-java.md)、[Go](client-libraries-go.md)、[Python](client-libraries-python.md)、[C++](client-libraries-cpp.md)、[C#/.NET](client-libraries-dotnet.md)、[Node.js](client-libraries-node.md)和[WebSocket](client-libraries-websocket.md)的绑定。
* 主题的多种[订阅类型](concepts-messaging.md#subscription-types)（[独占](concepts-messaging.md#exclusive)、[共享](concepts-messaging.md#shared)、[故障转移](concepts-messaging.md#failover)和[key_shared](concepts-messaging.md#key_shared)）。
* 由[Apache BookKeeper](http://bookkeeper.apache.org/)提供的[持久消息存储](concepts-architecture-overview.md#persistent-storage)保证消息传递。
* 无服务器轻量级计算框架[Pulsar Functions](functions-overview.md)提供流原生数据处理能力。
* 无服务器连接器框架[Pulsar IO](io-overview.md)，基于 Pulsar Functions 构建，使数据更容易进出 Apache Pulsar。
* [分层存储](tiered-storage-overview.md)在数据老化时将数据从热/温存储卸载到冷/长期存储（如 S3 和 GCS）。
* 原生支持[事务](concepts-transactions.md)，实现跨主题和分区的原子操作。
* 灵活的[身份验证和授权](concepts-authentication.md)，支持多个提供程序，包括 OAuth/OIDC。

## 内容

- [消息传递概念](concepts-messaging.md)
- [架构概述](concepts-architecture-overview.md)
- [Pulsar 客户端](concepts-clients.md)
- [地理复制](concepts-replication.md)
- [集群级故障转移](concepts-cluster-level-failover.md)
- [多租户](concepts-multi-tenancy.md)
- [身份验证和授权](concepts-authentication.md)
- [主题压缩](concepts-topic-compaction.md)
- [消息节流](concepts-throttling.md)
- [支持 SNI 路由的代理](concepts-proxy-sni-routing.md)
- [多个公告监听器](concepts-multiple-advertised-listeners.md)