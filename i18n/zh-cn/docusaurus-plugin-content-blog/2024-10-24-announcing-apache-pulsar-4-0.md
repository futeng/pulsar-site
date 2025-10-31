---
author: Lari Hotari
title: "What's New in Apache Pulsar 4.0"
date: 2024-10-24
---

Apache Pulsar 社区激动地宣布发布 Apache Pulsar 4.0，一个新的 LTS 版本！

<!--truncate-->

## Apache Pulsar 4.0 LTS 相较于 Pulsar 3.0 LTS 的新功能

自 2023 年 5 月上一个 LTS 版本 Pulsar 3.0 发布以来，Pulsar 4.0 [包含了大量的 Pulsar 改进提案（PIPs）](https://pulsar.apache.org/release-notes/versioned/pulsar-4.0.0/)。这些改进在多个方面增强了平台的能力。

由于有很多新功能和改进，这篇博客只会重点介绍最近的一些更新。我们邀请 Apache Pulsar 贡献者撰写额外的博客文章，详细介绍新功能和改进。

### 增强的 Key_Shared 订阅：在不影响消息顺序的情况下扩展

**Key_Shared 订阅**是 Pulsar 最有价值的功能之一，它使组织能够通过添加多个消费者来扩展消息处理能力，同时保持基于键的严格消息顺序。这个功能对于既需要高吞吐量又需要有序处理的应用程序至关重要，例如金融交易、事件处理和实时分析。

在 Pulsar 4.0 中，我们通过 [PIP-379 Key_Shared 排空哈希以改进消息顺序](https://github.com/apache/pulsar/blob/master/pip/pip-379.md) 显著改进了 Key_Shared 订阅实现。新设计确保具有相同键的消息一次只由一个消费者处理，同时消除了以前在消费者更改和应用程序重启期间影响系统性能的不必要消息阻塞。

运营团队可以通过 Pulsar Topic 统计数据中的综合故障排除指标快速识别和解决任何 Key_Shared 有序消息传递问题。

未来的改进将引入一个 REST API，通过提供对未确认消息细节的直接访问和强大的基于键的搜索能力来进一步简化故障排除，以解决消息传递问题，这些问题的根本原因通常是应用程序不确认消息，由于消息顺序约束，该键的后续消息被阻塞。基于 Web 的用户界面和 CLI 工具可以基于这个 REST API 构建，还允许自动化的故障排除或运营警报。相关的 Key_shared 故障排除指标也将在未来的更新中通过 Prometheus 和 OTel 接口暴露。

您可以在 [Pulsar 文档](https://pulsar.apache.org/docs/4.0.x/concepts-messaging/#preserving-order-of-message-delivery-by-key) 中了解有关 Key_Shared 订阅保持按键传递消息顺序和相关故障排除能力的更多信息。

### 基于 Alpine 和 Java 21 的增强安全 Docker 镜像运行时

Pulsar 4.0 包含对其 Docker 运行时环境的增强，结合了 Alpine Linux 的安全优势和 Java 21 运行时的性能改进。**PIP-324** 在 Pulsar 3.3.0 中引入，与我们的承诺一致，即为消息工作负载提供安全、高效和资源优化的平台。

新的 Docker 镜像现在基于 Alpine Linux 而不是 Ubuntu，减小了镜像大小同时提高了安全态势。

一个关键的安全增强是消除了基础镜像中的 CVE。虽然之前的基于 Ubuntu 的镜像带有 12 个无可用解决方案的中/低 CVE，但新的基于 Alpine 的镜像从零 CVE 开始，为生产部署提供更安全的基础。这个改进对于有严格安全要求和合规需求的组织特别有价值。

Docker 镜像现在包括带有 Generational ZGC 的 Java 21，在垃圾收集性能方面带来显著改进。与以前的垃圾收集器相比，Generational ZGC 提供亚毫秒级的暂停时间、更好的 CPU 利用率和改进的内存效率。这转化为 Pulsar 部署更可预测的延迟和更好的资源利用。

这些改进使 Pulsar 4.0 的 Docker 运行时成为在消息基础设施中需要安全性和性能的组织更有吸引力的选择。Alpine Linux 的最小攻击面和 Java 21 的先进垃圾收集的结合为在容器化环境中运行 Pulsar 提供了坚实的基础。

### 增强的质量服务（QoS）控制

消息系统中的多租户提出了独特的架构挑战，特别是在资源隔离和可预测性能方面。Apache Pulsar 对此的方法集中在提供对系统资源的细粒度控制，同时保持租户工作负载之间的一致性。

Pulsar 4.0 中的核心进展来自 [PIP-322 Pulsar 速率限制重构](https://github.com/apache/pulsar/blob/master/pip/pip-322.md)。其基础是一个令牌桶算法实现，统一了 Broker、Topic 和资源组级别的速率限制。这消除了以前"默认"和"精确"速率限制器之间的分割——这是一个在 IO 线程中引入不必要 CPU 开销和锁竞争的设计选择。

实际影响是直接的：多租户部署中更可预测的性能，特别是当多个速率限制条件相交时。虽然 Pulsar 已经支持生产者速率限制，但社区正在基于这个基础与 [PIP-385](https://lists.apache.org/thread/9wddmj4o5mrdst427r40rr7phqb05y6s) 改进生产者流控制——这是完成 Pulsar 端到端 QoS 能力的关键部分。

#### 现代消息平台中的速率限制和容量管理

Pulsar 4.0 中的速率限制为更全面的容量管理方法奠定了基础。目标很简单：在保持严格性能保证的同时实现动态资源分配，特别是在工作负载模式不可预测的环境中。

这很重要，因为传统的自动扩展方法通常响应 CPU 或内存指标，在消息系统中常常表现不佳。Andy Warfield 对 [S3 存储工作负载的分析突显了一个模式](https://youtu.be/sc3J4McebHE?feature=shared&t=1335)，这在消息中同样相关：工作负载本质上是突发性的，特征是在相对安静的时期中出现急剧峰值。传统的自动扩展无法有效处理这些模式，除非显著过度配置。

行业一直在汇聚解决这一挑战的方案。[Amazon DynamoDB 的准入控制系统](https://www.usenix.org/conference/atc22/presentation/elhemali)和 [TiDB 的资源控制框架](https://me.0xffff.me/dbaas3.html)展示了在多租户环境中管理容量的实用方法。两个系统都使用令牌桶算法进行基本速率限制，但扩展到动态配额管理。

解决方案在于复杂的容量管理系统，可以平滑平台总容量上的这些峰值。这种方法与 Marc Brooker 对[负载均衡系统经济学的见解](https://brooker.co.za/blog/2020/08/06/erlang.html)完美一致，其中云原生架构的效率增益在大规模时最为明显。

Pulsar 的资源组概念，2021 年 6 月在 Pulsar 2.8 中通过 [PIP 82：租户和命名空间级别速率限制](https://github.com/apache/pulsar/wiki/PIP-82%3A-Tenant-and-namespace-level-rate-limiting) 引入，为类似能力奠定了初步基础。虽然文档需要扩展，但技术基础是坚实的。来自 PIP-322 的令牌桶实现为向动态配额管理和准入控制演进提供了基础，与 Pulsar 的负载均衡协同工作以有效管理容量。

展望未来，这为更复杂的容量管理创造了一条路径：基于实时负载的动态限制调整、跨租户优先级排序，以及向特定租户或命名空间的精确容量分配。重点是在保持性能可预测性的同时处理要求高的工作负载——而不使用传统的过度配置答案。

这些能力的开发仍然是开放的和社区驱动的。技术讨论和决策在 [Apache Pulsar 开发邮件列表](https://pulsar.apache.org/contact) 上公开进行，并在 [Pulsar 改进提案（PIPs）](https://github.com/apache/pulsar/tree/master/pip#pulsar-improvement-proposal-pip) 中记录。

### 开始使用 Pulsar 4.0

Pulsar 4.0.0 现在可供 [下载](https://pulsar.apache.org/download/)。下载页面还包括有关 Docker 镜像的详细信息。要开始使用 Pulsar，您可以 [在本地机器、Docker 或 Kubernetes 上运行 Pulsar 集群](https://pulsar.apache.org/docs/4.0.x/getting-started-home/)。

### 将现有集群升级到 Pulsar 4.0

从 3.0 版本开始，用户可以选择在两个连续的 LTS 版本之间或两个连续的功能版本（也包括 LTS 版本）之间执行实时升级或降级。

Pulsar 版本中的更改设计为允许将现有 Pulsar 集群升级到较新版本，然后在出现问题时回滚到原始版本。这在 Pulsar 和 Pulsar 的默认 BookKeeper 配置中进行更改时会考虑。由于 Apache Pulsar 是一个开源项目，不能保证特定配置可以升级和降级。

在许多情况下，如果升级来自比特定发布系列中最新发布版本更旧的版本，降级能力将不起作用。
例如，升级到 Pulsar 3.0.x 在 2.10.6 和 3.0.7 之间有效，但在 2.10.5 和 3.0.7 之间无效。

每个 Pulsar 用户都负责运营其集群，Pulsar 集群升级应在测试和暂存环境中进行测试，以确保特定配置可以升级和降级。当 Apache 项目中支持某些功能时，意味着项目致力于解决报告的问题。这也适用于发布升级兼容性。

根据此策略，用户在升级到 Pulsar 4.0.0 之前应先将集群升级到 Pulsar 3.0.x 或 3.3.x。
如果您从 Pulsar 2.x 升级，应先升级到 Pulsar 2.10.6 或 2.11.3，然后升级到 Pulsar 3.0.7，最后升级到 Pulsar 4.0.0。

### 升级客户端以使用 Pulsar 4.0

较旧的 Pulsar 客户端与 Pulsar 4.0.0 兼容，Pulsar Java 客户端 4.0.0 与较旧的 Pulsar 集群兼容。
升级客户端时，您可以直接升级到最新的支持版本。建议保持客户端最新以获取最新的安全补丁和 bug 修复。

在 3.0.7、3.3.2 和 4.0.0 之前的所有 Pulsar Java 客户端中存在一个关键安全漏洞 [CVE-2024-47561](https://github.com/advisories/GHSA-r7pg-v2c8-mfg3)。请查看 [Apache Pulsar 安全页面获取更多详细信息](https://pulsar.apache.org/security/#security-advisories)。建议所有 Pulsar Java 客户端用户升级到 3.0.7、3.3.2 或 4.0.0。

升级 Java 客户端时，客户端模块库版本不齐是一个常见问题。建议使用 [Pulsar BOM](https://pulsar.apache.org/docs/4.0.x/client-libraries-java-setup/#pulsar-bom) 在 Maven 和 Gradle 构建中管理 Pulsar Java 客户端版本。还有关于 [在 Spring Boot 项目中选择 Pulsar 客户端版本的特定说明](https://pulsar.apache.org/docs/4.0.x/client-libraries-java-setup/#spring-boot)。

### 感谢 Apache Pulsar 贡献者

Apache Pulsar 4.0 代表了充满活力的开源社区的协作努力。这个版本展示了全球开发者、组织和用户的奉献精神，他们为使数据流处理更易访问和可扩展做出了贡献。

我们向我们最深的感激致以：

* 开发新功能、报告 bug、修复 bug 和改进文档的个人贡献者
* 参与 Apache Pulsar 项目安全问题处理、PIP 决策制定和版本投票的提交者和 PMC 成员
* 在生产环境中部署 Pulsar 并分享宝贵反馈的组织
* 在发布过程中参与测试并提供宝贵意见的用户
* 更广泛的 Apache 软件基金会社区的持续支持

该项目面临典型的开源挑战——我们在志愿者工作力下运营，目前 pull request 审查存在积压。虽然这在成功的 Apache 项目中是常见情况，但我们正在积极处理流程以更有效地处理贡献。

Apache Pulsar 的力量在于其社区驱动的开发。无论您是在生产环境中运行 Pulsar 还是为您的技术栈评估它，我们都鼓励您在 [dev@pulsar.apache.org](https://pulsar.apache.org/contact/#mailing-lists) 邮件列表或 [Pulsar Slack 社区](https://pulsar.apache.org/community/#section-discussions) 中加入对话。您的经验和反馈有助于塑造这个平台的未来。