---
author: Julien Jakubowski
title: "What's New in Apache Pulsar 3.2.0"
date: 2024-02-12
---

Apache Pulsar 社区激动地宣布发布 Apache Pulsar 3.2，一个新的功能版本！这一成就是重大社区合作的结果，涉及 57 位贡献者，他们进行了超过 88 次提交来添加新功能和修复 bug。我们衷心感谢每位贡献者的宝贵工作！

<!--truncate-->

## Apache Pulsar 3.2 的新功能

这个版本在 Broker、Pulsar IO/Pulsar Functions、CLI 等方面引入了 [180 多项改进、优化和修复](https://pulsar.apache.org/release-notes/versioned/pulsar-3.2.0/)。

它还推出了关键的​​新功能，重点介绍如下。

### 速率限制

越来越多的消息即服务平台团队正在采用 Apache Pulsar 作为他们在整个组织内提供消息服务的主要构建块。这清楚地证明了 Apache Pulsar 真正的多租户架构的价值正在产生效果，使 Apache Pulsar 成为在要求很高的应用环境中消息即服务平台团队的高效可靠解决方案。

在 Apache Pulsar 项目中，我们致力于进一步改进现有的多租户功能。一个改进领域是大型 Pulsar 系统的服务级别管理和容量管理。这也是消息即服务平台团队关注的关键问题。

Apache Pulsar 3.2.0 实现了 [PIP-322 Pulsar 速率限制重构](https://github.com/apache/pulsar/blob/master/pip/pip-322.md)。速率限制器充当 Pulsar 中更广泛的容量管理和质量服务（QoS）控制的管道。它们是 Pulsar 核心多租户功能不可或缺的一部分。这次重构为该领域的未来增强铺平了道路。

### 压缩期间的空键消息删除

Apache Pulsar 支持 [Topic 压缩](https://pulsar.apache.org/docs/3.2.x/concepts-topic-compaction/)。

在 Pulsar 3.1.0 及更早版本中，Topic 压缩保留具有空键的消息。

从 Pulsar 3.2.0 开始，默认行为已更改为在 Topic 压缩期间删除具有空键的消息，这有助于降低存储成本。但是，如有必要，您可以通过在 `broker.conf` 中设置 `topicCompactionRetainNullKey=true` 来恢复到以前的行为。

更多详细信息，请参阅 [PIP-318](https://github.com/apache/pulsar/blob/master/pip/pip-318.md) 中的描述。

### WebSockets 新功能

Pulsar WebSocket API 现在支持：
- 消费多个 Topic，如 [PIP-307](https://github.com/apache/pulsar/blob/master/pip/pip_307.md) 中所述。
- 端到端加密，如 [PIP-290](https://github.com/apache/pulsar/blob/master/pip/pip-290.md) 中所述。

### 增强 Pulsar Functions 和 Pulsar IO 的安全性

Pulsar 3.2.0 通过允许用户使用非明文密码配置 Pulsar 连接器，为 Pulsar Functions 和 Pulsar IO 提供了更高的安全性。更多详细信息请参见 [PIP-289](https://github.com/apache/pulsar/blob/master/pip/pip-289.md) 和以下 pull 请求：
- [使连接器从密钥中加载敏感字段](https://github.com/apache/pulsar/pull/21675)
- [支持配置密钥插值](https://github.com/apache/pulsar/pull/20901)

### CLI 用户体验改进

这个版本为 CLI 引入了一些方便的功能，包括：
- [添加用于配置内存限制的命令行选项](https://github.com/apache/pulsar/pull/20663)
- [允许使用正则表达式或文件批量删除 Topic](https://github.com/apache/pulsar/pull/21664)
- [在 `pulsar-admin clusters list` 中显示当前集群](https://github.com/apache/pulsar/pull/20614)

### 构建改进

Pulsar 3.2.0 还引入了对构建过程和可靠性的增强，包括物料清单（BOM）以简化依赖管理，如 [PIP-326](https://github.com/apache/pulsar/blob/master/pip/pip-326.md) 中概述。

### 更多

请随时探索[完整的发布说明](https://github.com/apache/pulsar/releases/tag/v3.2.0)以获取所有改进和修复的详细列表。

## 版本之间的兼容性

升级现有的 Pulsar 安装时，按顺序执行组件升级至关重要。

从 3.0 版本开始，用户可以选择在两个连续的 LTS 版本之间或两个连续的功能版本（也包括 LTS 版本）之间执行实时升级或降级。

对于 3.2 系列，您应该能够从 3.x 版本升级。

请参阅[发布策略](/contribute/release-policy/)以了解更多关于版本之间兼容性的信息。

## 开始使用

Pulsar 3.2.0 现在可供 [下载](https://pulsar.apache.org/download/)。要开始使用 Pulsar，您可以 [在本地机器、Docker 或 Kubernetes 上运行 Pulsar 集群](https://pulsar.apache.org/docs/3.2.x/getting-started-home/)。

## 参与其中

Apache Pulsar 是增长最快的开源项目之一，被 [Apache 软件基金会](https://thestack.technology/top-apache-projects-in-2021-from-superset-to-nuttx/) 认定为基于参与度的前 5 项目。Pulsar 的活力依赖于持续的社区增长，没有项目的每一位贡献者，这是不可能的。Pulsar 社区欢迎任何对开源、消息和流处理以及分布式系统有热情的人的贡献！寻找更多与 Pulsar 社区保持联系的方式？查看以下资源：

- Pulsar Summit North America 2023 于 2023 年 10 月 25 日星期三举行！[观看会议录像](https://pulsar-summit.org/event/north-america-2023/schedule)。在 Twitter/X 上关注 [@PulsarSummit](https://twitter.com/pulsarsummit) 以获取即将到来的 Pulsar Summit 活动的更新和详情。
- 阅读 [Apache Pulsar 贡献指南](https://pulsar.apache.org/contribute/) 开始您的第一次贡献。
- 访问 [Pulsar GitHub 仓库](https://github.com/apache/pulsar)，在 Twitter/X 上关注 [@apache_pulsar](https://twitter.com/apache_pulsar)，并加入 [Slack 上的 Pulsar 社区](https://apache-pulsar.slack.com/)。