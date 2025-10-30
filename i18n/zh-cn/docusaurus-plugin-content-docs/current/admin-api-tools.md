---
id: admin-api-tools
title: Pulsar 管理接口 - 工具
sidebar_label: "工具"
description: 全面了解 Pulsar 管理 CLI 和 Pulsar 管理 API 的概念和区别。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

您可以通过以下工具之一通过 Pulsar 管理层管理 Pulsar 实体：

- Pulsar 管理 API

  - [Java 管理 API](/api/admin/)：它是用 Java 编写的可编程接口。

  - Go 管理 API（即将推出）

  - [REST API](pathname:///admin-rest-api/?version=@pulsar:version_number@)：对 Broker 提供的管理 API 的 HTTP 调用。此外，Java 管理 API 和 pulsar-admin CLI 都使用 REST API。

- [pulsar-admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)：它是一个命令行工具，可在您的 Pulsar 安装的 bin 文件夹中找到。

![Pulsar 管理层的工具](/assets/admin-api-tools.svg)

以下是这些工具的说明和比较。

类别|工具|何时使用|注意事项
|---|---|---|---
Pulsar 管理 API|[Java 管理 API](/api/admin/)| - 如果您想使用 Java 实现自己的管理接口客户端并管理集群。<br/><br/> - 如果您想以编程方式管理资源，而不是依赖单元测试中的外部工具。<br/><br/> - 如果您想在 Java 应用程序中使用管理 API。| <br/><br/> - 此方法仅适用于 Java。<br/><br/> - 如果您想用它来构建应用程序，需要更多的开发工作。
Pulsar 管理 API | [REST API](pathname:///admin-rest-api/?version=@pulsar:version_number@)|- 如果您想使用其他语言实现自己的管理接口客户端并使用脚本管理集群。| - 此方法最为复杂。<br/><br/> - 如果您想用它来构建应用程序，需要更多的开发工作。
Pulsar 管理 CLI| [pulsar-admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) | - 如果您想以最小的努力开始使用 Pulsar 管理 API（例如，无需准备额外的环境）。<br/><br/> - 如果您想执行常见的管理任务。| - 此方法最易于使用。<br/><br/> - 使用此方法构建应用程序具有挑战性。<br/><br/> - 由于 JVM 启动缓慢，会花费更多时间。

### 相关主题

- 要了解基础知识，请参阅 [Pulsar 管理 API - 概述](admin-api-overview.md)

- 要学习使用场景，请参阅 [Pulsar 管理 API - 用例](admin-api-use-cases.md)。

- 要学习常见的管理任务，请参阅 [Pulsar 管理 API - 功能特性](admin-api-features.md)。

- 要快速入门，请参阅 [Pulsar 管理 API - 快速入门](admin-get-started.md)。

- 要查看详细用法，请参阅下面的 API 参考。

  - [Java 管理 API](/api/admin/)

  - [REST API](reference-rest-api-overview.md)