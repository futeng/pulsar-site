---
author: Sherlock Xu
title: "Pulsar Summit Asia 2022 Recap"
date: 2022-12-01
---

![](/img/pulsar-summit-asia-2022-recap-top.jpg)

自 2020 年创立以来，Pulsar Summit Asia 受到了亚洲及其他地区越来越多的关注。对于 Pulsar Summit Asia 2022，来自 Amazon、腾讯、IBM、华为、Dell、字节跳动和 Splunk 等公司的 1400 多人注册了这次在线活动，讨论支持教育、餐饮、游戏、电子商务和社交媒体等多种行业的最新消息和流处理技术。

在讨论峰会的一些亮点之前，我们要感谢整个 Apache Pulsar 社区以及来自其他开源社区的所有朋友，使这次活动取得了巨大成功！此外，没有我们的演讲者、项目委员会成员以及社区和媒体合作伙伴，这次活动不会吸引如此广泛的观众。感谢大家的帮助和热情！

<!--truncate-->

现在，让我们看看这次在线虚拟活动的一些亮点和总结：

* 全球 1400+ 注册用户和 40000+ 浏览量
* 41 位演讲者，来自字节跳动、华为、腾讯、日本电报电话公司（NTT）、百胜中国、网易、vivo、Nutanix 和 StreamNative 等公司
* 3 个关于 Apache Pulsar 和事件驱动应用的主题演讲
* 36 个关于用例、技术深度探讨和生态系统的演讲
* 14 位项目委员会成员
* 18 个社区和媒体合作伙伴

## 主题演讲和环节概览

这个为期两天的虚拟活动汇集了来自消息和流处理社区的工程师、架构师和数据科学家。他们讨论了 Pulsar 在不同用例中的采用、事件驱动平台、技术细节，甚至 Pulsar 与其他生态系统的集成。以下是一些主题演讲和环节的快速回顾。

### 主题演讲

* **面向现代数据基础设施的云原生统一消息和流处理系统（中文）**：Apache Pulsar PMC 成员贾佳介绍了 Apache Pulsar 的高级概述，并解释了它如何通过云原生特性满足消息和流处理的需求。
* **2022 年您应该了解的 Apache Pulsar（中文）**：Apache Pulsar PMC 成员李鹏辉讨论了 Pulsar 中存在的一些现有问题，以及 Pulsar 社区将如何在未来解决这些问题。
* **正确构建事件驱动应用（英文）**：Apache Pulsar PMC 主席 Matteo Merli 分享了他对现代事件驱动应用基础的见解。

### 用例

* **百胜中国的精彩 Pulsar 应用（英文）**：百胜中国的 Chauncey Yan 解释了为什么百胜中国选择 Pulsar 用于生产环境，并分享了他们的性能调优经验。
* **Pulsar + Envoy：在微服务上为不同业务场景构建 OTO 营销平台（中文）**：腾讯的 Jason Jiang 分享了他们使用 Pulsar 和 Envoy 为不同业务场景构建基于微服务的 OTO 营销平台的经验。
* **Pulsar 在智能教育中的应用：网易有道如何将 Pulsar 用于复杂业务场景（中文）**：网易的沈佳琪介绍了网易有道使用 Apache Pulsar 支持智能教育中复杂场景的实践。
* **流处理大战以及 Apache Pulsar 如何赢得战斗（英文）**：Nutanix 的 Shivji Kumar Jha 和 Sachidananda Maharana 讨论了他们如何为不同用例采用 Pulsar，并将应用程序从其他消息解决方案迁移到 Pulsar。
* **数十万亿条消息：Apache Pulsar 如何支持腾讯的大数据业务（中文）**：腾讯的张大伟讨论了他们如何使用 Apache Pulsar 支持大数据业务，以满足需要高可用性和强一致性的场景。

### 技术深度探讨

* **将 Jakarta JMS 带到新一代消息系统 - Apache Pulsar（英文）**：DataStax 的 Enrico Olivelli 和 Mary Grygleski 解释了 Pulsar 概念如何映射到 Jakarta 消息规范，并演示了如何将 Jakarta EE 应用程序连接到 Pulsar。
* **使用基础设施即代码管理 Pulsar 的新方式（中文）**：StreamNative 的 Max Xu 和王福树讨论了如何利用 Pulsar 的 Terraform Provider 和 Pulsar Resources Operator 来帮助更好地管理 Pulsar。
* **Pulsar 跨地域复制实现高可用性的深度探讨（中文）**：中国移动的王嘉玲讨论了异步和同步数据复制机制，并解释了他们如何在中国移动跨多个区域部署 Pulsar 并提高其性能。
* **Apache Pulsar 在火山引擎 E-MapReduce 中的应用：集成与场景（中文）**：字节跳动梁欣介绍了火山引擎 E-MapReduce，一个无状态的开源大数据平台，以及 Pulsar 如何适应平台生态系统支持不同用例。
* **使用一个 Topic 处理 10 万个消费者：实践与技术细节（英文）**：NTT 软件创新中心的翟宏杰分享了他们使用单个 Pulsar topic 处理 10 万个消费者的实践和技术细节。

### 生态系统

* **Pulsar + Flink + Camel：Vertice 如何构建基于 CMDB 的实时数据平台（中文）**：Vertice 的王巍分享了如何使用 Pulsar、Flink 和 Camel 构建基于 CMDB 的实时数据平台的见解。
* **使用 SQL 简化 Pulsar Functions 开发（中文）**：StreamNative 的傅瑞讨论了 SQL 语法、Pulsar Functions 和 Function Mesh 如何协同工作，为云环境中的实时数据作业提供独特的用户开发体验。
* **Apache Pulsar + KubeEdge：使用低延迟和持久存储管理边缘设备（中文）**：华为云的赵岩介绍了一种通过 KubeEdge 的设备管理接口和 Apache Pulsar 实现的边缘设备管理解决方案。
* **使从 Pulsar 查询更容易：介绍 Flink Pulsar SQL 连接器（英文）**：StreamNative 的张宇飞介绍了使用 Pulsar SQL 连接器的基本概念和示例，并讨论了 PulsarCatalog 使用 Pulsar 作为元数据存储的两种不同模式。
* **从 RabbitMQ 迁移到 Apache Pulsar：在电子商务行业使用 AMQP-on-Pulsar（AoP）（中文）**：Access Corporate Group 的张艺飞分享了他们使用 AMQP-on-Pulsar 项目将 RabbitMQ 工作负载迁移到 AoP 的经验。

## Pulsar 社区的新动态

除了主题演讲和环节，我们还在峰会上分享了一些令人兴奋的消息。

Apache Pulsar 自 2018 年 9 月成为顶级项目以来，已被全球各地的组织和用户采用。最近，项目迎来了第 580 位贡献者，几乎达到了 600 人的里程碑！

![](/img/pulsar-github-contributor-20221114.png)

<small><center>图 1. Pulsar GitHub 仓库贡献者</center></small>

今年到目前为止，我们已经欢迎了 16 位新的 Apache Pulsar [Committer](https://www.apache.org/foundation/how-it-works.html#committers) 加入 Pulsar 大家庭。他们对 Pulsar 社区做出了持续贡献，作为 Pulsar Committer，他们现在拥有 Pulsar 仓库的写权限。他们是：

* [@RobertIndie](https://github.com/RobertIndie)
* [@yuruguo](https://github.com/yuruguo)
* [@gaozhangmin](https://github.com/gaozhangmin)
* [@nodece](https://github.com/nodece)
* [@Shoothzj](https://github.com/Shoothzj)
* [@hqebupt](https://github.com/hqebupt)
* [@StevenLuMT](https://github.com/StevenLuMT)
* [@lordcheng10](https://github.com/lordcheng10)
* [@tisonkun](https://github.com/tisonkun)
* [@aloyszhang](https://github.com/aloyszhang)
* [@mattisonchao](https://github.com/mattisonchao)
* [@urfreespace](https://github.com/urfreespace)
* [@dlg99](https://github.com/dlg99)
* [@nicoloboschi](https://github.com/nicoloboschi)
* [@liudezhi2098](https://github.com/liudezhi2098)
* [@cbornet](https://github.com/cbornet)

我们还有 4 位新成员加入 Apache Pulsar [项目管理委员会（PMC）](https://www.apache.org/foundation/how-it-works.html#pmc-members)，以表彰他们对项目发展的贡献。他们是：

* [@lhotari](https://github.com/lhotari)
* [@michaeljmarshall](https://github.com/michaeljmarshall)
* [@Technoboy-](https://github.com/Technoboy-)
* [@Jason918](https://github.com/Jason918)

祝贺他们所有人 🎉！我们期待更广泛开源社区中的更多朋友做出更多贡献。

## 更多关于 Pulsar Summit Asia 2022 的信息

Pulsar Summit Asia 2022 中的所有演讲都是预先录制的，它们将很快上传到这个 [YouTube 账户](https://www.youtube.com/@streamnative7594)。您也可以在这个[页面](https://pulsar-summit.org/event/asia-2022/schedule)上找到峰会的完整演讲列表。

同时，我们将与一些演讲者合作，将他们的演讲转换为博客和案例研究，这些将很快发布。

如果您有任何问题，请随时联系 [organizers@pulsar-summit.org](mailto:organizers@pulsar-summit.org)，下次峰会再见！