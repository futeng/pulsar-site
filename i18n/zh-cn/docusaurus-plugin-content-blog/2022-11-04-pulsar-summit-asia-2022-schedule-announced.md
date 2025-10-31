---
author: Sherlock Xu
title: "Announcing Conference Schedule for Pulsar Summit Asia 2022"
date: 2022-11-04
---

![](/img/pulsar-summit-asia-2022-top-image.jpg)

今年8月，我们举办了 Pulsar Summit SF，这是我们在北美首次举办的线下活动。会议包含了超过 12 个分会场和 5 个主题演讲，吸引了来自 Apple、Blizzard、IBM、Optum、Iterable、Twitter、Uber 等公司的 200 多名参会者。从会议中我们可以看到，Pulsar 的采用率正在增长，对消息和流处理的兴趣也在不断提升。现在，我们很高兴邀请您参加 Pulsar Summit Asia 2022，探索最新的消息和流处理技术！

这个为期两天的虚拟活动将于 11 月 19 日至 20 日举行，将展示 36 个演讲，演讲者来自字节跳动、华为、腾讯、日本电报电话公司（NTT）软件创新中心、百胜中国、网易、vivo、微信、Nutanix、StreamNative 等公司的开发者、工程师、架构师和技术专家。会议将包括关于 Pulsar 用例、生态系统、运维和技术深度探讨的环节。

<!--truncate-->

## 特色演讲

让我们快速浏览一些特色演讲。

### 使用一个 Topic 处理 10 万个消费者：实践与技术细节（英文）

Hongjie Zhai，研究员，NTT 软件创新中心

随着智能工厂和互联汽车的发展，在大量设备之间交换消息对于监控和控制系统是必需的。在这方面，Apache Pulsar 是保持消息管道简单、实时和安全的最佳解决方案之一。由于当前的消息代理主要是为云服务设计的，当消费者数量过多时，用户可能会面临性能问题。本演讲将分享使用单个 Pulsar Topic 处理 10 万个消费者的实践和技术细节。

### 百胜中国的精彩 Pulsar 应用（英文）

Chauncey Yan，后端工程师，百胜中国

百胜中国控股有限公司是中国最大的餐饮公司，致力于成为餐饮行业最具创新力的先锋。在对下一代消息队列解决方案进行技术调研后，最终选择 Pulsar 作为其中台的消息中间件实现标准。到目前为止，Pulsar 已在百胜中国内部的不同场景中广泛应用，如业务中台和系统可观测性。本演讲将重点介绍百胜中国为什么选择 Pulsar 用于生产环境以及其性能调优经验。

### 流处理大战以及 Apache Pulsar 如何赢得战斗（英文）

Shivji Kumar Jha，高级工程师，Nutanix

Sachidananda Maharana，MTS IV，Nutanix

本演讲将涵盖 Nutanix 在过去 4 年运行 Pulsar 时面临的运维挑战，以及考虑到 Pulsar 的多租户和可配置性，它如何适应不同的用例。还将讨论 Nutanix 如何克服这些挑战坚持使用 Pulsar，甚至将应用程序从其他消息解决方案迁移到 Pulsar。最后将介绍从 Kafka 和 Kinesis 迁移到 Pulsar 的挑战和经验教训。

### Pulsar + Envoy：在微服务上为不同业务场景构建 OTO 营销平台（中文）

Jason Jiang，高级工程师，腾讯

在游戏营销中，OTO（一次性优惠）模式提供了一种提升用户体验的有效方式。一个非常常见的 OTO 场景是在玩家满足所需条件时推荐某些素材。要以低成本高效率提供这种能力，可以使用定制的 Envoy 插件来支持 Pulsar 协议。凭借 Envoy 灵活的路由配置和各种功能插件，可以为不同的 OTO 业务场景提供微服务解决方案。在本演讲中，腾讯的 Jason Jiang 将分享他们使用 Pulsar 和 Envoy 为不同业务场景构建基于微服务的 OTO 营销平台的经验。

### Apache Pulsar 在火山引擎 E-MapReduce 中的应用（中文）

Xin Liang，高级工程师，字节跳动

本演讲将介绍火山引擎 E-MapReduce，一个无状态的开源大数据平台，以及将 Pulsar 作为新集群类型集成到火山引擎 E-MapReduce 生态系统的动机。将涵盖 Pulsar 在火山引擎 E-MapReduce 中的一些用例，特别是在实时数据仓库和流处理中的应用。还将讨论典型的实时场景和常见问题，并提供由 Pulsar 与火山引擎 E-MapReduce 中相关服务支持的可能的解决方案。

### 使用基础设施即代码管理 Pulsar 的新方式（中文）

Max Xu，软件工程师，StreamNative

Fushu Wang，云工程师，StreamNative

基础设施即代码（IaC）是通过代码而不是手动配置来管理和配置基础设施资源的过程。IaC 相比传统手动配置提供了代码可理解、幂等性和一致性的优势。StreamNative 开发了 Pulsar 的 Terraform Provider 和 Pulsar Resources Operator，分别利用 Terraform 和 Kubernetes CRDs 提供 Pulsar 资源（如租户、命名空间和 Topic）的声明式管理。在本演讲中，StreamNative 的两位工程师将讨论如何利用这两个 IaC 工具帮助您更好地管理 Pulsar。

### Apache Pulsar 在华为移动服务的稳定性优化（中文）

林琳，Apache Pulsar PMC 成员，SDE 专家，华为

华为移动服务致力于通过下一代内容和服务丰富用户生活，满足每个可想象的需求，涵盖智能家居、健康健身、移动办公、应用程序、智能旅行和娱乐等不同领域。目前，华为运动健康、应用市场、华为视频和华为移动云都运行在华为移动服务之上。在本演讲中，华为的林琳将分享他们在华为移动服务复杂业务场景中使用 Apache Pulsar 的实践，并提出一些为更好稳定性而做的增强。

要了解更多当今公司和组织如何利用 Apache Pulsar 进行流处理和消息传递，特别是在生产环境中的关键任务部署，请查看 Pulsar Summit Asia 2022 的[完整演讲列表](https://pulsar-summit.org/event/asia-2022/schedule)。

## 如何参与

Pulsar Summit Asia 2022 是一个汇集来自不同地区演讲者和观众的虚拟会议。因此，我们安排会议日程时考虑了时区、地区和语言因素，以提供最佳可能的体验。

第一天的所有演讲将以中文进行，第二天的所有演讲将以英文进行。对于中国观众，您可以在 [活动行](https://www.huodongxing.com/event/8674136399923) 上使用微信账户注册。对于非中文或英文观众，您可以在[此页面](https://streamnative.zoom.us/webinar/register/8616668631199/WN_qKibcbEFTxKv6-MszyFeAg)注册以使用 Zoom 观看英文演讲。

立即免费注册！如果您有任何问题，请联系 [organizers@pulsar-summit.org](mailto:organizers@pulsar-summit.org)。

## 关于组织者

StreamNative 是 Pulsar Summit Asia 2022 的组织者。由 Apache Pulsar 和 Apache BookKeeper 的原始开发者创立，StreamNative 构建了一个云原生的事件流处理平台，使企业能够轻松地以实时事件流的形式访问数据。作为 Pulsar 的核心开发者，StreamNative 团队对技术、社区和用例有深入的了解。如今，StreamNative 专注于发展 Apache Pulsar 和 BookKeeper 社区，并将其在多样化 Pulsar 用例方面的丰富经验带给全球各地的公司。