---
author: tison
title: "回顾：CommunityOverCode Asia 2023 中的 Apache Pulsar 分享"
date: 2023-08-30
---

[CommunityOverCode Asia 2023](https://apachecon.com/acasia2023/) 大会（前身为ApacheCon Asia）已于8月18日至8月20日举行。

本次大会汇集了来自全球最具影响力的开源社区的用户、开发者、工程师和技术专家。迄今为止，已收到来自AWS、华为、腾讯云、StreamNative、微众银行等机构的讲者提交的100多个议题。

我们很高兴在本次大会上看到各种与Apache Pulsar相关的分享，包括我们首个LTS版本发布的里程碑、与云应用的集成、Pulsar社区发展等等。

<!--truncate-->

## 精选分享

让我们快速浏览一些关于Apache Pulsar的精选分享。

### Apache Pulsar 3.0：首个LTS版本和新功能

杨子科（Zike Yang），软件工程师，StreamNative

Apache Pulsar社区最近发布了[Apache Pulsar 3.0](https://pulsar.apache.org/blog/2023/05/02/announcing-apache-pulsar-3-0/)，这是Pulsar的首个LTS版本。在这个分享中，我们将深入探讨Pulsar LTS版本的重要性。我们还将涵盖Pulsar 3.0中引入的主要功能，包括新的负载均衡器、大规模延迟消息支持和Direct IO优化。

### 华为终端云在容器场景下优化Apache Pulsar的实践

林琳（Lin Lin），SDE专家，华为

Apache Pulsar是一个云原生消息队列，基于其存储分离架构，可以在低流量期间经常收缩计算层以节省资源。我们在容器化场景下对Apache Pulsar进行了大量优化。例如，目前Pulsar负载均衡算法依赖于节点的过去负载数据，实现平衡的过程相对较慢。当启用HPA时，节点容量扩展可能在负载均衡期间触发，而容量扩展又会触发新的负载均衡。我们如何进行优化才能使Pulsar更加云原生化？

### Apache Pulsar限流原理与应用实践

王佳玲（Jialing Wang），软件开发工程师，中国移动云能力中心

结合移动云Pulsar和Kafka的限流实践，本演讲分析了Apache Pulsar生产和消费各级限流的工作原理以及ResourceGroup的实现方案，并介绍了移动云基于Pulsar和KoP的Kafka。在云原生场景下，如何基于ResourceGroup和负载均衡器管理多集群之间的流量？

### 优秀开发者体验的秘密：杀手级内容

刘宇（Yu Liu），Apache Pulsar PMC成员

近年来，软件行业进入云原生2.0时代。各种新技术的出现给开发者带来了甜蜜的负担。一方面，他们有更多选择；另一方面，他们面临更大的复杂性。随着"开发者优先"文化的兴起和开发者在产品选择中决策权重的增加，全球各大科技巨头正在从传统的销售理念转向以开发者为中心的理念（B2D）来推广产品，而高质量内容是最有效的营销策略。为了满足所有利益相关者的需求并加速飞轮效应，如何设计让开发者一见钟情的内容？为了改善开发体验，如何创造内容的"顿悟时刻"？为了增加用户粘性，如何通过内容让开发者永远爱上产品？为了增强品牌竞争力，如何区分开源项目和商业产品的内容策略？——本分享将分享Apache Pulsar社区的实践，深入探讨如何设计开发者会喜爱的杀手级内容。

## 更多资源

从提交到CommunityOverCode Asia 2023的议题可以看出，Apache Pulsar已成为[过去几年中最活跃的Apache项目之一](https://blogs.apache.org/foundation/entry/apache-in-2021-by-the)，拥有一个充满活力的社区，持续推动项目的创新和改进。

1. 预订Pulsar Summit北美2023的席位。大会将于2023年10月25日在旧金山举行。[立即报名](https://pulsar-summit.org/)加入Pulsar社区以及消息和事件流社区。
2. 加入Apache Pulsar社区。[订阅Pulsar邮件列表](https://pulsar.apache.org/community#section-welcome)进行用户相关或Pulsar开发讨论。你也可以[加入Pulsar Slack](https://communityinviter.com/apps/apache-pulsar/apache-pulsar)来提问快速问题或讨论专业话题。