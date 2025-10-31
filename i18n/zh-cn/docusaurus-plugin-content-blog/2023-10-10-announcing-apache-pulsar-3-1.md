---
author: tison
title: "What's New in Apache Pulsar 3.1.0"
date: 2023-10-10
---

Apache Pulsar 社区宣布发布 Apache Pulsar 3.1，一个新的功能版本！这是一个了不起的社区努力，超过 80 位贡献者提交了超过 360 个功能增强和 bug 修复的提交。我们感谢所有贡献者的贡献！

<!--truncate-->

## Apache Pulsar 3.1 的新功能

### 可插拔的 Topic 压缩服务

Pulsar 的 [Topic 压缩](https://pulsar.apache.org/docs/3.1.x/concepts-topic-compaction/) 功能提供了一个基于键的数据保留机制，允许用户只保留与特定键关联的最新消息。这有助于减少存储空间并提高系统效率。

Topic 中的数据可以以各种格式存储。例如，KoP（Kafka 协议处理器）可以以 Kafka 格式存储数据。

以前，Pulsar 总是压缩 Topic 数据，假设消息采用 Pulsar 数据格式。然而，这种方法存在局限性，因为它阻止协议处理器利用 Topic 压缩功能和自定义数据格式，如 KoP 使用的 Kafka 格式。

这就是为什么 [PIP-278](https://github.com/apache/pulsar/pull/20624) 引入了一个可插拔的 Topic 压缩服务接口来支持实际压缩逻辑的定制化。这种定制化可以在主要压缩任务仍由 Pulsar Broker 控制的同时完成。这一变更主要使协议处理器开发者受益。

### 可插拔的分区分配策略

Pulsar 为[负载均衡](https://pulsar.apache.org/docs/3.1.x/concepts-broker-load-balancing-concepts/)提供了强大的支持，以确保 Pulsar 集群中的高效资源利用。

负载均衡的基本单位是 Topic Bundle，指的是同一命名空间内的一组 Topic。

以前，将 Topic 分配给 Topic Bundle 的唯一策略是一致性哈希。然而，这种策略并不适合所有场景。

[PIP-255](https://github.com/apache/pulsar/issues/19806) 引入了一个可插拔的 Topic Bundle（分区）分配接口，允许定制化分配算法。这使得用户可以根据他们的特定场景调整策略。

### 压缩的元数据大小阈值

以前，即使元数据很小，我们也必须应用压缩。现在，我们支持基于大小的阈值。

从 2.9 版本开始，Pulsar 支持压缩存储在元数据存储中的 Managed Ledger 信息和 Managed Cursor 信息。此功能可以显著减少大型元数据的大小。

然而，对于小型元数据，压缩不会提供显著好处，并可能消耗不必要的计算资源。

[PIP-270](https://github.com/apache/pulsar/issues/20307) 引入了两个配置选项：`managedLedgerInfoCompressionThresholdInBytes` 和 `managedCursorInfoCompressionThresholdInBytes`。这些选项允许用户自定义压缩元数据的大小阈值，默认值设置为 16 KB。

### 卸载资源的延迟创建

[分层存储](https://pulsar.apache.org/docs/3.1.x/tiered-storage-overview/) 是一项基本技术，它允许将旧的 Topic 数据从 BookKeeper 迁移到长期且更具成本效益的存储，同时保持对 Topic 数据的透明客户端访问。

分层存储通过卸载器（offloaders）运行。以前，当创建 Topic 时，卸载器会立即生成相关的卸载资源，即使这些资源在实际卸载任务触发之前保持未使用状态。

[PR-20775](https://github.com/apache/pulsar/pull/20775) 通过延迟创建卸载 Blob 存储来修改此行为。这意味着实际分配只在触发卸载任务时发生，防止资源的过度预分配。

## 版本之间的兼容性

升级现有的 Pulsar 安装时，按顺序执行组件升级至关重要。

从 3.0 版本开始，用户可以选择在两个连续的 LTS 版本之间或两个连续的功能版本（也包括 LTS 版本）之间执行实时升级或降级。

对于 3.1 系列，您应该能够直接从 3.0 版本升级或从后续发布的 3.2 版本降级。如果您当前使用的是较早版本，请确保在继续之前升级到 3.0 版本。

## 开始使用

Pulsar 3.1.0 现在可供 [下载](https://pulsar.apache.org/download/)。要开始使用 Pulsar，您可以 [在本地机器、Docker 或 Kubernetes 上运行 Pulsar 集群](https://pulsar.apache.org/docs/3.1.x/getting-started-home/)。

## 参与其中

Apache Pulsar 是增长最快的开源项目之一，被 [Apache 软件基金会](https://thestack.technology/top-apache-projects-in-2021-from-superset-to-nuttx/) 认定为基于参与度的前 5 项目。Pulsar 的活力依赖于持续的社区增长，没有项目的每一位贡献者，这是不可能的。Pulsar 社区欢迎任何对开源、消息和流处理以及分布式系统有热情的人的贡献！寻找更多与 Pulsar 社区保持联系的方式？查看以下资源：

- Pulsar Summit North America 2023 将于 2023 年 10 月 25 日星期三举行！[立即注册](https://registration.socio.events/e/pulsarsummitna2023) 并在 Twitter/X 上关注 [@PulsarSummit](https://twitter.com/pulsarsummit) 以获取这个备受期待的一日活动的更新和详情。
- 阅读 [Apache Pulsar 贡献指南](https://pulsar.apache.org/contribute/) 开始您的第一次贡献。
- 访问 [Pulsar GitHub 仓库](https://github.com/apache/pulsar)，在 Twitter/X 上关注 [@apache_pulsar](https://twitter.com/apache_pulsar)，并加入 [Slack 上的 Pulsar 社区](https://apache-pulsar.slack.com/)。