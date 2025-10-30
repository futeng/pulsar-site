---
id: admin-api-features
title: Pulsar 管理接口 - 功能特性
sidebar_label: "功能特性"
description: 全面了解 Pulsar 管理 API 的功能特性。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

以下是您可能想要执行的常见任务。有关任务和执行这些任务的方法的详尽列表，请参阅[工具](admin-api-tools.md)。

![Pulsar 管理 API 的功能特性](/assets/admin-api-features.svg)

这些管理任务根据 Pulsar 组件进行分类。

类别 |组件|您想要做什么？
|---|---|---
服务器|Broker|对 Broker 进行操作。<br/><br/>例如，<br/>- 在 Broker 上设置动态配置<br/> - 对 Broker 运行健康检查<br/> - 关闭 Broker<br/> - 获取 Broker 级别的统计指标
存储|Bookie|对 Bookie 放置策略进行操作。 <br/><br/>例如，<br/> - 获取或设置 Bookie 替换策略
实体|- Topic <br/><br/> - Schema <br/><br/> - 命名空间  <br/><br/> - 租户 <br/><br/> - 集群|对 Topic、Schema、命名空间、租户或集群进行操作。<br/><br/> 例如，<br/> - 创建、更新或删除 Topic、租户、命名空间或集群 <br/> - 设置隔离策略、配置卸载阈值或为命名空间设置权限 <br/> - 上传、提取或删除 Schema
流处理|<br/><br/> - Function <br/><br/> - Connector <br/><br/> - Transaction <br/><br/> - Package |对 Function、Function Worker 或 Connector 进行操作。 <br/> 例如，<br/> - 创建、更新和删除 Function 或 Connector <br/> - 获取 Function Worker 的统计信息，触发 Function 到 Worker 的重新平衡 <br/><br/> 对 Transaction 进行操作。 <br/> 例如，<br/> - 获取 Transaction 的统计信息 <br/> - 更新 Transaction 协调器的规模 <br/><br/> 对 Package 进行操作。 <br/> 例如，<br/> - 上传、下载和删除 Package
其他| - Proxy <br/><br/> - 资源组 <br/><br/> - 资源配额 |对 Proxy 统计进行操作。 <br/> 例如，<br/> - 获取 Proxy 统计的各种监控指标 <br/><br/> 对资源组进行操作。<br/>例如，<br/> - 创建、更新和删除资源组 <br/><br/>对资源配额进行操作。<br/>例如，<br/> - 为命名空间 Bundle 设置资源配额

### 相关主题

- 要了解基础知识，请参阅 [Pulsar 管理 API - 概述](admin-api-overview.md)

- 要学习使用场景，请参阅 [Pulsar 管理 API - 用例](admin-api-use-cases.md)。

- 要执行管理操作，请参阅 [Pulsar 管理 API - 工具](admin-api-tools.md)。

- 要快速入门，请参阅 [Pulsar 管理 API - 快速入门](admin-get-started.md)。

- 要查看详细用法，请参阅下面的 API 参考。

  - [Java 管理 API](/api/admin/)

  - [REST API](reference-rest-api-overview.md)