---
id: pulsar-api-overview
title: Pulsar APIs
sidebar_label: "Pulsar APIs"
description: Get a comprehensive understanding of concepts, functionalities, and distinctions of Pulsar APIs.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


Pulsar 是一个可跨各种规模组织扩展的消息和流处理平台。

作为 Pulsar 的核心构建块，Pulsar API 允许您：
- 使用客户端 API 构建基于 Pulsar 的应用程序
- 使用管理 API 管理 Pulsar 集群

![Pulsar API 定义](/assets/pulsar-api-definition.svg)

## Pulsar 客户端 API

Pulsar 客户端 API 封装并优化了 Pulsar 的客户端-Broker 通信协议，并使用 Pulsar 原语添加了额外功能。

使用 Pulsar 客户端 API，您可以：
- 创建和配置生产者、消费者和读取器
- 生产和消费消息
- 执行认证和授权任务

![客户端 API - 定义](/assets/client-api-definition.svg)

Pulsar 提供了多种语言绑定的客户端 API。有关 Pulsar 客户端的更多详细信息，包括特定语言的客户端库、功能矩阵、第三方客户端，请参见 [Pulsar 客户端 - 概述](client-libraries.md)。

## Pulsar 管理 API

请参见 [Pulsar 管理 API - 概述](admin-api-overview.md)。

## 比较

以下是 Pulsar 客户端 API 和 Pulsar 管理 API 之间的简单比较。

类别|Pulsar 客户端 API|Pulsar 管理 API
---|---|---
用户|开发者|DevOps
目标|使用 Pulsar 构建应用程序|管理 Pulsar 集群
用例|Pulsar 客户端 API 帮助您创建依赖实时数据的应用程序。<br/><br/> 例如，您可以构建一个处理欺诈警报的金融应用程序，或一个基于用户活动创建推荐的电子商务应用程序。| Pulsar 管理 API 让您从单一端点管理整个 Pulsar 实例，包括集群、租户、命名空间和 Topic。<br/><br/> 例如，您可以配置安全性和合规性，或获取 Broker 的信息，检查任何问题，然后进行故障排除。
关键功能|- 使用生产者、消费者、读取器和 TableView 处理数据 <br/><br/> - 通过认证和授权保护数据安全 <br/><br/> - 通过事务和 Schema 保护数据 <br/><br/> - 通过集群级自动故障转移稳定数据 | - 配置认证和授权 <br/><br/> - 设置数据保留和资源隔离策略 <br/><br/> - 促进应用程序开发工作流程<br/><br/> - Pulsar 故障排除
接口 | - [Java 客户端 API](/api/client/) <br/><br/> - [C++ 客户端 API](@pulsar:apidoc:cpp@) <br/><br/> - [Python 客户端 API](@pulsar:apidoc:python@) <br/><br/> -  [Go 客户端 API](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar) <br/><br/> - [Node.js 客户端 API](client-libraries-node.md) <br/><br/> - [WebSocket 客户端 API](client-libraries-websocket.md#api-reference) <br/><br/> - [C# 客户端 API](client-libraries-dotnet.md) | - [Java 管理 API](admin-api-overview.md) <br/><br/> - [REST API](reference-rest-api-overview.md)