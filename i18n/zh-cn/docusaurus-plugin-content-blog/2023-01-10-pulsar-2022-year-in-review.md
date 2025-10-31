---
author: Apache Pulsar Community
title: "Apache Pulsar 2022 Year in Review"
date: 2023-01-10
---

2022 年对 Apache Pulsar 来说是不可思议的一年，社区见证了强劲的增长，项目变得更加稳定、可扩展和安全。

我们感谢所有社区成员以及为项目做出贡献的更广泛开源社区的朋友。他们是 Pulsar 在过去一年中每一步前进背后的原因。

<!--truncate-->

现在，让我们看看 2022 年的一些亮点。

## 新的 Pulsar 网站

2022 年 5 月，Apache Pulsar 社区[推出了新网站](https://lists.apache.org/thread/7nx3rm3cmpbw0ws1b62k17935xgyw2tj)。新外观采用浅蓝色背景，重新设计了首页结构。更多细节请查看 [PIP-87](https://github.com/apache/pulsar/issues/12637) 和 [PIP-113](https://github.com/apache/pulsar/issues/13235)。以下是网站的对比。

之前：

![](/img/pulsar-website-before.png)

之后：

![](/img/pulsar-new-website-after-1.png)

![](/img/pulsar-new-website-after-2.png)

许多社区成员[参与了讨论并提供了宝贵的反馈](https://github.com/apache/pulsar/issues/15538#issuecomment-1125602899)。目前，Pulsar 社区仍在努力通过使关键信息更加可见和可访问来改善读者体验。

## 重要活动回顾

2022 年，Apache Pulsar 社区在全球范围内组织了许多聚会和活动，分享最新的消息和流处理技术。其中，两个 Pulsar Summit 受到了社区成员最多的关注。

- [Pulsar Summit San Francisco 2022](https://streamnative.io/blog/community/2022-08-25-pulsar-summit-sf-2022-community-event-recap/)：这次活动标志着在北美举办的首次线下 Pulsar Summit，有 200 多名参会者。活动邀请了来自 Google、AWS 和 Yahoo! 等公司的 20 位演讲者，5 个关于 Apache Pulsar 和其他流处理技术的主题演讲，以及 12 个关于技术深度探讨、用例和生态系统讨论的分会场。[观看演讲](https://streamnative.io/pulsar-summit-on-demand/)。
- [Pulsar Summit Asia 2022](pathname:///blog/2022/12/01/pulsar-summit-asia-2022-recap/)：拥有 1500+ 注册用户和全球 40000+ 浏览量，这个为期两天的虚拟活动聚集了 41 位演讲者，进行了 3 个主题演讲和 36 个环节。他们来自字节跳动、华为、腾讯、日本电报电话公司（NTT）、百胜中国、网易、vivo、Nutanix 和 StreamNative 等公司。[观看演讲](https://www.youtube.com/playlist?list=PLqRma1oIkcWgeNb3kgzqFyg5sywH8S4yy)。

要了解最新活动信息，您可以加入以下聚会或小组：

- [纽约市 Apache Pulsar 聚会](https://www.meetup.com/new-york-city-apache-pulsar-meetup/)
- [旧金山湾区 Apache Pulsar 聚会](https://www.meetup.com/sf-bay-area-apache-pulsar-meetup/)
- [荷兰 Apache Pulsar 聚会](https://www.meetup.com/netherlands-apache-pulsar-meetup/)
- [日本 Pulsar 用户组](https://japan-pulsar-user-group.connpass.com/)

## 社区增长

Pulsar 社区的发展离不开我们的贡献者。其中，Pulsar Committer 和 PMC 成员在贡献和推广项目方面发挥了带头作用。2022 年，许多新面孔加入了社区，同时也欢迎老朋友承担更多责任。让我们通过数字看看 Pulsar 社区。

- **598** 个 Pulsar 主 GitHub 仓库的全球贡献者
- **12.1K+** GitHub 星标
- **3.2K+** 分叉
- **16** 个新的 Committer
- **5** 个新的 PMC 成员
- **9560** 个 Pulsar Slack 成员
- **4.3K+** 下载量
- **14M+** Docker 拉取次数

Pulsar 社区欢迎各种类型的贡献。更多信息，请参见 [Apache Pulsar 贡献指南](pathname:///contribute/)。

## 项目发布

2022 年，Pulsar 社区努力改进项目功能并修复现有错误，发布了 1 个主要版本和 8 个次要版本。在这些发布中提供了许多重要的 Pulsar 功能，如[集群级自动故障恢复](https://github.com/apache/pulsar/pull/13316)和[为 PartitionedProducer 添加的延迟加载](https://github.com/apache/pulsar/pull/10279)。查看每个版本的详细信息：

- [2.10.2](https://github.com/apache/pulsar/releases/tag/v2.10.2)
- [2.10.1](https://github.com/apache/pulsar/releases/tag/v2.10.1)
- [2.10.0](https://github.com/apache/pulsar/releases/tag/v2.10.0)
- [2.9.3](https://github.com/apache/pulsar/releases/tag/v2.9.3)
- [2.9.2](https://github.com/apache/pulsar/releases/tag/v2.9.2)
- [2.8.4](https://github.com/apache/pulsar/releases/tag/v2.8.4)
- [2.8.3](https://github.com/apache/pulsar/releases/tag/v2.8.3)
- [2.8.2](https://github.com/apache/pulsar/releases/tag/v2.8.2)
- [2.7.5](https://github.com/apache/pulsar/releases/tag/v2.7.5)

更多信息，请参见[发布说明页面](pathname:///release-notes/)。

关于客户端、Pulsar Manager 和 Pulsar Helm Chart 的更新如下：

- [Pulsar C++ 客户端 3.1.0](https://github.com/apache/pulsar-client-cpp/releases/tag/v3.1.0)
- [Pulsar C++ 客户端 3.0.0](https://github.com/apache/pulsar-client-cpp/releases/tag/v3.0.0)
- [Pulsar Go 客户端 0.9.0](https://github.com/apache/pulsar-client-go/releases/tag/v0.9.0)
- [Pulsar Go 客户端 0.8.1](https://github.com/apache/pulsar-client-go/releases/tag/v0.8.1)
- [Pulsar Go 客户端 0.8.0](https://github.com/apache/pulsar-client-go/releases/tag/v0.8.0)
- [Pulsar Node.js 客户端 1.7.0](https://github.com/apache/pulsar-client-node/releases/tag/v1.7.0)
- [Pulsar Node.js 客户端 1.6.2](https://github.com/apache/pulsar-client-node/releases/tag/v1.6.2)
- [Pulsar Python 客户端 3.0.0](https://github.com/apache/pulsar-client-python/releases/tag/v3.0.0)
- [Apache Pulsar Reactive 客户端 0.1.0](https://github.com/apache/pulsar-client-reactive/releases/tag/v0.1.0)
- [Pulsar Manager 0.3.0](https://github.com/apache/pulsar-manager/releases/tag/v0.3.0)
- [Pulsar Helm Chart 3.0.0](https://github.com/apache/pulsar-helm-chart/releases/tag/pulsar-3.0.0)

更多信息，请参见[客户端发布说明页面](pathname:///release-notes/clients/)。

## Pulsar 生态系统

2022 年，Pulsar 社区与其他开源社区合作，为 Pulsar 生态系统添加了更多集成。值得注意的集成包括：

- [Spring for Apache Pulsar](https://spring.io/blog/2022/09/20/spring-for-apache-pulsar-0-1-0-m1-is-now-available)：该项目旨在提供 Spring 友好的 API、构建块和编程模型，用于编写与 Apache Pulsar 交互的 Java 应用程序。更多信息，请阅读博客 [Spring for Apache Pulsar 0.1.0 现已发布](https://spring.io/blog/2022/12/15/spring-for-apache-pulsar-0-1-0-available-now)。
- [Flink-Pulsar Sink 连接器](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-sink)：Flink-Pulsar Sink 连接器是 Flink-Pulsar DataStream 连接器的一部分。它实现了 Flink 新的 [SinkV2 API](https://cwiki.apache.org/confluence/display/FLINK/FLIP-177%3A+Extend+Sink+API)，允许您无缝地将 Flink 作业结果写回 Pulsar Topic。
- [HTTP Sink 连接器](https://github.com/apache/pulsar/issues/17719)：HTTP Sink 连接器将记录推送到任何 HTTP 服务器，记录值在 POST 方法的正文中。HTTP 请求的正文是记录值的 JSON 表示。

更多信息，请参见[生态系统页面](pathname:///ecosystem/)。

## 2023 年展望

Pulsar 社区寻求从不同方面进一步改进项目。例如，我们计划发布 Pulsar 的第一个长期支持（LTS）版本，以满足不同用户的需求。对于那些想要更稳定 Pulsar 版本的用户，可以选择 LTS 版本。Pulsar 社区将通过错误修复和安全补丁帮助改进和升级 LTS 版本。

此外，我们还将在 2023 年举办更多活动，包括 Pulsar Summit North America 和 Pulsar Summit APAC。要了解最新的社区新闻并与其他成员讨论热门话题，您可以订阅 Pulsar [用户](mailto:users-subscribe@pulsar.apache.org)和[开发者](mailto:dev-subscribe@pulsar.apache.org)邮件列表，在 [Twitter](https://twitter.com/apache_pulsar) 上关注我们，并加入 [Pulsar Slack 工作区](https://communityinviter.com/apps/apache-pulsar/apache-pulsar)。