---
author: Apache Pulsar Community
title: "Apache Pulsar 2023 Year in Review"
date: 2024-01-12
---

2023 年对 Apache Pulsar 来说是不可思议的一年，它见证了强劲的社区增长，项目变得更加稳定、可扩展和安全。Apache Pulsar 社区在 2023 年迎来了一个重要的里程碑，项目贡献者超过了 600 人，为 [Pulsar 主 GitHub 仓库](https://github.com/apache/pulsar) 做出贡献。我们要感谢 Pulsar 社区中每一位为这一卓越成就做出贡献的人！

<!--truncate-->

自 Pulsar 于 2018 年 9 月毕业为顶级项目（TLP）以来，它一直由活跃的全球社区推动，拥有来自 **639** 位贡献者的 **12K+** 次提交、**12.2K+** 个星标、**3.5K** 个分支和 **10K+** Slack 用户。

我们感谢所有社区成员以及更广泛的开源社区中为 Apache Pulsar 项目做出贡献的人。他们是 Apache Pulsar 过去几年每一步发展的背后原因。

现在，让我们来看看 2023 年的一些亮点。

# 2023 年亮点

## Apache Pulsar 3.0 LTS 版本发布：社区的重大里程碑

Apache Pulsar 社区宣布发布 Apache Pulsar 3.0，这是第一个长期支持（LTS）版本！从 Pulsar 3.0 开始，Pulsar 社区计划发布 LTS 版本，以满足不同用户对稳定性和新功能的需求，同时也减少维护历史版本的负担。

之前的发布流程有大约 3 到 4 个月的短维护周期，而许多用户仍在使用旧版本。为了跟上新的更新和功能，他们可能被迫在短时间内进行升级，而在可用时间和所需精力方面他们并未做好准备。

因此，Pulsar 社区引入了 LTS 版本，并在它们之间发布功能版本。项目遵循语义化版本控制的变体，用 `LTS.feature.patch` 替代 `major.minor.patch`。例如：
- 2.11.0 是一个功能版本
- 3.0.0 是第一个 LTS 版本
- 3.0.1 是 LTS 版本的补丁版本
- 3.1.0 是一个功能版本
- 3.2.0 是一个功能版本
- 3.2.1 是一个补丁版本
- 4.0.0 是一个 LTS 版本

这种模式为寻求稳定性和寻求新功能的用户提供了版本支持。想要更稳定版本的用户可以使用 3.0.x 版本，而寻求新功能的用户可以使用 3.x 版本。这个新的发布模式对 Pulsar 社区来说是一个重大步骤，因为它：
- 允许用户根据对稳定性或新功能的需求选择不同的版本；
- 为维护者和用户明确了发布周期；
- 使维护者摆脱花费过多时间维护一长串旧版本。

随着新的发布模式，Pulsar 社区计划每 18 个月发布一次 LTS 版本，bug 修复持续 24 个月，安全漏洞补丁支持 36 个月。详情见下图。

![](/img/pulsar-new-release-model.png)

更多信息，请参见 [PIP-175](https://github.com/apache/pulsar/issues/15966) 和 [发布策略](pathname:///contribute/release-policy/)。

## 新网站

Apache Pulsar 网站焕然一新！感谢 Emidio Cardeira、Asaf Mesika、Tison Chen 和 Kiryl Valkovich 创建了一个引人入胜的设计，捕捉了我们蓬勃发展的社区和下一代解决方案的未来感。

## Pulsar Admin Go 库

[Pulsar Admin Go 库](https://github.com/apache/pulsar-client-go/tree/master/pulsaradmin) 提供了统一的 Go API，用于管理 Pulsar 资源，如租户、命名空间、Topic 等。

## 增强的基于 OTel 的指标系统

[PIP-264](https://github.com/apache/pulsar/blob/master/pip/pip-264.md) 已完成，获得社区批准并开始开发。它将解决 Pulsar 用户在大量 Topic（从 5 万到 100 万个 Topic）场景下的一个重大痛点：可观测性。Apache Pulsar 社区承担了一项重大任务，使 OpenTelemetry Java SDK 准备好用于 Pulsar 这样的极低延迟系统，包含两个正在开发的主要功能：[近零内存分配](https://github.com/open-telemetry/opentelemetry-java/issues/5105) 和[收集时的指标过滤](https://github.com/open-telemetry/opentelemetry-java/issues/6107)，后者也被添加到 [OpenTelemetry 规范](https://github.com/open-telemetry/opentelemetry-specification/issues/3324) 中。

## 关键活动回顾

2023 年，Apache Pulsar 社区在全球范围内举办了许多聚会和活动，分享最新的消息和流处理技术。其中，三个峰会最受社区成员关注。

- [Pulsar Summit Europe 2023](https://streamnative.io/blog/pulsar-virtual-summit-europe-2023-key-takeaways)：这个活动见证了一个显著的里程碑，超过 400 名来自 20 多个国家的参会者加入虚拟舞台，探索 Apache Pulsar 的最先进进展和 Pulsar 驱动公司的真实成功案例。Pulsar Summit 的这一破纪录出席率不仅证明了 Pulsar 的激增采用，也突显了围绕这个改变游戏规则的技术日益增长的热情和好奇心。活动包括 5 个关于 Apache Pulsar 的主题演讲和 12 个关于技术深度解析、用例和生态系统讨论的分论坛。演讲者来自 Lego、VMWare、DataStax、StreamNative、RisingWave、Axon、Zafin 等公司。[观看会议视频](https://www.youtube.com/watch?v=XjIu9nXSSiI&list=PLqRma1oIkcWjMn9ytQueYSP9HCc28756R)。

- [CommunityOverCode Asia 2023](https://pulsar.apache.org/blog/2023/08/28/pulsar-sessions-in-communityovercode-aisa-2023/) 会议（之前称为 ApacheCon Asia）已于 8 月 18 日至 8 月 20 日举行。会议汇集了来自世界上一些最具影响力的开源社区的采用者、开发者、工程师和技术专家。

- [CommunityOverCode NA 2023](https://communityovercode.org/past-sessions/community-over-code-na-2023/) 会议（之前称为 ApacheCon NA）已于 10 月 7 日至 10 月 10 日举行。会议汇集了来自世界上一些最具影响力的开源社区的采用者、开发者、工程师和技术专家。2023 年，CommunityOverCode 引入了流处理专题，包含三个关于 Pulsar 的演讲。如果您错过了会议，您仍然可以查看幻灯片！

- [Pulsar Summit NA 2023](https://streamnative.io/blog/pulsar-summit-north-america-2023-a-deep-dive-into-the-on-demand-summit-videos)：在旧金山著名的 Hotel Nikko（举办可以俯瞰城市的派对！）现场举办，峰会吸引了近 200 名参会者，展示了 20 个精心策划的会议，每个会议都是 Pulsar 生态系统内活力和创新的证明。演讲者来自 Cisco、Discord、Iterable、Attentive、VMware、Flipkart、Boomi 等公司。我们非常感谢有机会花一整天时间分享知识，见证社区成员互相联系和启发。[观看会议视频](https://www.youtube.com/playlist?list=PLqRma1oIkcWhOZ6W-g4D_3JNxJzYnwLNX)。

## 社区增长

Pulsar 社区的发展离不开我们的贡献者。其中，Pulsar 提交者和 PMC 成员在贡献和推广项目方面发挥了领导作用。2023 年，许多新面孔加入了社区，同时我们也欢迎老朋友承担更多责任。让我们通过数字来看看 Pulsar 社区。

- **639** 位 Pulsar 主 GitHub 仓库的全球贡献者
- **13.4K+** GitHub 星标
- **3.5K+** 分支
- **8** 位新提交者
- **6** 位新 PMC 成员
- **10k+** Pulsar Slack 成员
- **20M+** Docker 拉取次数

Pulsar 社区欢迎各种形式的贡献。更多信息，请参见 [Apache Pulsar 贡献指南](pathname:///contribute/)。

## 项目发布

2023 年，Pulsar 社区努力改进项目能力并修复现有 bug，发布了 2 个主要版本和 12 个次要版本。

Apache Pulsar 社区发布了 [2.11](https://pulsar.apache.org/blog/2023/01/20/Apache-Pulsar-2-11-0/) 版本，61 位贡献者提供了功能增强和修复，交付了 1617 个提交。

Apache Pulsar 社区的一个重要里程碑是发布 [Apache Pulsar 3.0](https://pulsar.apache.org/blog/2023/05/02/announcing-apache-pulsar-3-0/)，这是第一个长期支持（LTS）版本！社区正在变得更大！超过 140 位贡献者向 Pulsar 3.0 版本提交了大约 1500 个提交，这是该项目迄今为止最大的贡献，该项目正在快速成为最大的开源项目之一。它包括对 LTS 的支持，为大型企业团队提供了可预测性和稳定性，以交付可靠的消息和流处理服务。

感谢所有的贡献！

这些版本中交付了许多重要的 Pulsar 功能，如[可扩展负载均衡器](https://github.com/apache/pulsar/issues/16691)和[大规模延迟消息支持](https://github.com/apache/pulsar/issues/16763)。更多信息，请参见[发布说明页面](pathname:///release-notes/)。

客户端、Pulsar Manager 和 Pulsar Helm Chart 的更新如下：

- [Pulsar C++ 客户端 3.4.2](https://github.com/apache/pulsar-client-cpp/releases/tag/v3.4.2)
- [Pulsar Go 客户端 0.11.1](https://github.com/apache/pulsar-client-go/releases/tag/v0.11.1)
- [Pulsar Node.js 客户端 1.9.0](https://github.com/apache/pulsar-client-node/releases/tag/v1.9.0)
- [Pulsar Python 客户端 3.3.0](https://github.com/apache/pulsar-client-python/releases/tag/v3.3.0)
- [Pulsar Manager 0.4.0](https://github.com/apache/pulsar-manager/releases/tag/v0.4.0)
- [Pulsar Helm Chart 3.1.0](https://github.com/apache/pulsar-helm-chart/releases/tag/pulsar-3.1.0)
- [Pulsar dotnet 客户端 3.1.1](https://github.com/apache/pulsar-dotpulsar/blob/master/CHANGELOG.md#311---2023-12-11)
- [Apache Pulsar Reactive 客户端 0.1.0](https://github.com/apache/pulsar-client-reactive/releases/tag/v0.5.1)

更多信息，请参见[客户端发布说明页面](pathname:///release-notes/clients/)。

## Pulsar 生态系统

2023 年，Pulsar 社区与其他开源社区合作，为 Pulsar 生态系统添加了更多集成。值得注意的集成包括：

- [Quarkus Extension for Apache Pulsar](https://quarkus.io/guides/pulsar) 通过 SmallRye Reactive Messaging 框架提供对 Apache Pulsar 的支持。基于 Eclipse MicroProfile Reactive Messaging 规范 3.0，它提出了一个连接 CDI 和事件驱动的灵活编程模型。

- [Spring for Apache Pulsar](https://spring.io/blog/2023/11/21/spring-for-apache-pulsar-1-0-0-goes-ga/) 提供了用于发布到 Pulsar Topic 的 `PulsarTemplate` 和用于从 Pulsar Topic 消费的 `PulsarListener` 注解，以及各种方便的 API，帮助 Spring 开发者加速进入 Apache Pulsar 的开发旅程。Spring Boot 也通过[自动配置](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#messaging.pulsar)包含了对它的支持。

- [Oxia](https://github.com/streamnative/oxia)：目前，单个 Pulsar 集群可管理的 Topic 数量的实际限制约为 100 万个 Topic。Zookeeper 缺乏水平可扩展性是这一限制的原因之一。[Oxia](https://github.com/streamnative/oxia) 今年发布，是一个可扩展的元数据存储和协调系统。在 Pulsar 集群中用 Oxia 替换 Zookeeper 允许超过这个 100 万 Topic 的限制，尽管这不是唯一的前提条件。这有助于达到 1 亿个 Topic 的目标。

更多信息，请参见[生态系统页面](pathname:///ecosystem/)。

# 2024 年的下一步计划

Pulsar 社区寻求从不同方面进一步改进项目。

## 增强的基于 OTel 的指标系统

如上所述，[PIP-264](https://github.com/apache/pulsar/blob/master/pip/pip-264.md) 旨在增强在单个集群管理大量 Topic（从 5 万到 100 万个 Topic）场景下的可观测性。目前，有两个主要功能正在开发以支持此功能：
- [近零内存分配](https://github.com/open-telemetry/opentelemetry-java/issues/5105)
- [收集时的指标过滤](https://github.com/open-telemetry/opentelemetry-java/issues/6107)，后者也被添加到 [OpenTelemetry 规范](https://github.com/open-telemetry/opentelemetry-specification/issues/3324) 中。

## Pulsar 速率限制

越来越多的消息即服务平台团队正在采用 Apache Pulsar 作为他们在整个组织内提供消息服务的主要构建块。这清楚地证明了 Apache Pulsar 真正的多租户架构的价值正在产生效果，使 Apache Pulsar 成为在要求很高的应用环境中消息即服务平台团队的高效可靠解决方案。

在 Apache Pulsar 项目中，我们致力于进一步改进现有的多租户功能。一个改进领域是大型 Pulsar 系统的服务级别管理和容量管理。这也是消息即服务平台团队关注的关键问题。

2023 年 12 月，[PIP-322 Pulsar 速率限制重构](https://github.com/apache/pulsar/blob/master/pip/pip-322.md) 被接受并完成，将作为 Pulsar 3.2.0 版本的一部分发布。速率限制器充当 Pulsar 中更广泛的容量管理和质量服务（QoS）控制的管道。它们是 Pulsar 核心多租户功能不可或缺的一部分。这次重构将为该领域的未来增强铺平道路。

## Pulsar SQL 从主仓库移除

Pulsar SQL（Trino/Presto）将从主仓库移动到单独的仓库。此更改将提供以下好处：
- 显著减少 TGZ 和 Docker 镜像的大小，节省约 400MB。
- 减少构建时间。

## 安全

Docker 镜像漏洞扫描即将开始。

## 活动
我们还将为 2024 年举办更多活动，包括 Pulsar Summit North America 和 Pulsar Summit APAC。如果您错过了或想重温 Pulsar Summit North America 2023，您可以在这里查看我们优秀演讲者的视频 [这里](https://youtube.com/playlist?list=PLqRma1oIkcWhOZ6W-g4D_3JNxJzYnwLNX&si=o6G-fRcNgW9zqHGa)！

## 保持联系！
要了解社区最新消息并与其他成员讨论热门话题，您可以订阅 Pulsar 邮件列表（[用户](mailto:users-subscribe@pulsar.apache.org) 和 [开发者](mailto:dev-subscribe@pulsar.apache.org)），在 [X](https://twitter.com/apache_pulsar) 上关注我们，并加入在线进行的 [Pulsar Slack 工作区](https://communityinviter.com/apps/apache-pulsar/apache-pulsar) 和 [Pulsar 社区会议](https://github.com/apache/pulsar/wiki/Community-Meetings)。