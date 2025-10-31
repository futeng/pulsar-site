---
title: "Announcing Apache Pulsar 3.0: The First Long-Term Support Release"
date: 2023-05-02
author: Apache Pulsar Community
---

**Apache Pulsar 社区今天宣布发布 Apache Pulsar 3.0，这是第一个长期支持（LTS）版本！** 这是一个了不起的社区努力，超过 140 位贡献者提交了大约 1500 个功能增强和 bug 修复的提交。我们感谢所有贡献者的贡献！

![](/img/annoucing-pulsar-3-0.jpeg)

<!--truncate-->

## 介绍长期支持版本

从 Pulsar 3.0 开始，Pulsar 社区计划发布 LTS 版本，以满足不同用户对稳定性和新功能的需求，同时也减少维护历史版本的负担。

之前的发布流程有大约 3 到 4 个月的短维护周期，而许多用户仍在使用旧版本。为了跟上新的更新和功能，他们可能被迫在短时间内进行升级，而在可用时间和所需精力方面他们并未做好准备。

因此，Pulsar 社区引入了 LTS 版本，并在它们之间发布功能版本。项目遵循语义化版本控制的变体，用 `LTS.feature.patch` 替代 `major.minor.patch`。例如：

- 2.11.0 是一个功能版本；
- 3.0.0 是第一个 LTS 版本；
- 3.0.1 是 LTS 版本的补丁版本；
- 3.1.0 是一个功能版本；
- 3.2.0 是一个功能版本；
- 3.2.1 是一个补丁版本；
- 4.0.0 是一个 LTS 版本。

这种模式为寻求稳定性和寻求新功能的用户提供了版本支持。想要更稳定版本的用户可以使用 3.0.x 版本，而寻求新功能的用户可以使用 3.x 版本。这个新的发布模式对 Pulsar 社区来说是一个重大步骤，因为它：

- 允许用户根据对稳定性或新功能的需求选择不同的版本；
- 为维护者和用户明确了发布周期；
- 使维护者摆脱花费过多时间维护一长串旧版本。

随着新的发布模式，Pulsar 社区计划每 18 个月发布一次 LTS 版本，bug 修复持续 24 个月，安全漏洞补丁支持 36 个月。详情见下图。

![](/img/pulsar-new-release-model.png)

更多信息，请参见 [PIP-175](https://github.com/apache/pulsar/issues/15966) 和 [发布策略](pathname:///contribute/release-policy/)。

## Apache Pulsar 3.0 的新功能

Apache Pulsar 3.0 是一个 LTS 版本，包含许多重要功能、增强和修复。以下是一些亮点。

### 新的 Pulsar Broker 负载均衡器

[PIP-192](https://github.com/apache/pulsar/issues/16691) 引入了一个新的负载管理器实现，旨在尽可能均衡集群利用率，同时最小化延迟并减少对 ZooKeeper 的依赖。

之前负载管理器的问题包括：

- 所有 Broker 和 Bundle 的负载数据通过 ZK 监听器复制到所有 Broker。当 Pulsar 集群增长到数千个 Broker 和数百万个 Topic 时，这种 N 复制会造成可扩展性问题。
- 查找需要重定向到 Leader Broker。

在 Pulsar 3.0 中，Broker 和 Bundle 负载数据被重新评估。新的负载管理器将这个负载数据存储在非持久 Topic 中，而 Topic 所有权信息保存在系统 Topic 中，并通过状态机维护以实现最终一致性。客户端现在可以连接到任何 Broker 进行查找，无需重定向。

### 大规模延迟消息支持

定时和延迟消息传递是消息系统中的常见功能。[PIP-195](https://github.com/apache/pulsar/issues/16763) 旨在解决这个功能的限制，该功能自 2.4.0 版本以来一直得到支持。当前实现的问题包括：

- 内存限制：延迟消息索引通常在内存中维护，当有大量延迟消息时会导致高内存开销。虽然可以通过为 Topic 创建多个分区并将它们分布在多个 Broker 上来利用多个 Broker 的内存，但总体内存消耗保持不变。
- 昂贵的索引重建：在大量延迟消息（例如数亿个）的情况下，当将 Topic 迁移到不同的 Broker 或从 Broker 停机中恢复时，重建索引需要重放日志。这个过程消耗大量资源，影响客户端和追赶读取。

Pulsar 3.0 中引入的新延迟消息机制的目标是：

- 支持延迟消息索引快照，以最小化重建索引的成本；
- 减少维护延迟消息索引的内存使用。

### 构建多架构 Docker 镜像

从 3.0 开始，Pulsar 将开始发布同时支持 Intel x86-64 和 Arm64 架构的 Docker 镜像。

尝试使用 Pulsar 独立模式，或在 Mac M1/M2 笔记本电脑上运行 TestContainer 测试的用户现在将看到大大改进的性能，并避免 Docker 容器引擎在 Arm64 主机上模拟 x86-64 CPU 时的所有问题。

同时，这个镜像将使在 Arm64 机器上的 Docker/Kubernetes 生产环境中运行 Pulsar 成为可能。

从用户角度来看，无需任何更改：拉取镜像时，Docker 将根据主机架构选择适当的版本。

更多信息，请参见 [PR-19432](https://github.com/apache/pulsar/pull/19432)。

### BookKeeper 直接 I/O 逻辑优化

BookKeeper 中当前的 Ledger 读/写逻辑涉及多个缓冲和缓存层，由于内存消耗、低效的缓存利用和驱逐问题，导致读/写吞吐量存在限制。

更具体地说，当写入条目时，数据既缓冲在内存表中，也缓冲在 OS PageCache 中（在内存表满之后）。当读取条目时，数据可能根据缓存命中从内存表、读缓存获取，或从条目日志文件读取，这可能导致内存浪费和缓存命中率降低。由于 OS PageCache 由所有读/写文件共享，并且 OS 在读取文件时会预取固定数量的数据，容易导致 OS PageCache 污染并影响读/写性能。

[BP-47](https://github.com/apache/bookkeeper/issues/2943#issuecomment-1086446251) 引入可选支持，使用 O_DIRECT 标志绕过 OS PageCache，用于支持的系统（Linux 和 macOS）上的 [open(2)](https://man7.org/linux/man-pages/man2/open.2.html) 和 [fallocate(2)](https://man7.org/linux/man-pages/man2/fallocate.2.html) 系统调用。新实现使用 JNI 进行直接 I/O，并纳入写缓冲池和读缓冲区管理。它有助于减少内存消耗并更好地控制缓存利用率。它修改了现有的 Ledger 读/写逻辑，同时保持条目日志文件的原始组织。

### 事务缓冲区分段快照优化

Pulsar 中当前的事务缓冲区涉及处理带有事务发送的消息，并定期进行快照以避免重放原始 Topic 的所有消息。然而，当一个 Topic 有长期数据保留和许多中止事务时，快照可能成为瓶颈，随着快照大小的增加导致成本上升。

[PIP-196](https://github.com/apache/pulsar/issues/16913) 引入了分段事务缓冲区快照，允许将快照分割成多个部分，每个部分具有固定数量的中止事务和一个 maxReadPosition 标识。这种方法旨在支持大量中止事务，改进事务缓冲区恢复速度，并解决系统 Topic 快照中的写放大问题。

在 Pulsar 3.0 中，新设计通过次级索引纳入多个快照段，索引和快照段存储在不同的压缩 Topic 中。快照段是一个不可变段，可以配置大小。一个新的系统 Topic 用于存储快照段，而一个单独的索引 Topic 存储快照段索引，允许更高效的恢复并减少内存开销。

该提案修改了现有的事务缓冲区逻辑，同时保持事务缓冲区的原始组织，目标是提高整体性能和资源利用率。

### 蓝绿集群部署支持

蓝绿部署是一种广泛使用的解决方案，用于将实时流量从一个集群迁移到另一个集群。在这个模型中，流量逐渐从蓝色集群转移到绿色集群，允许平滑升级，并在必要时进行回滚。

[PIP-188](https://github.com/apache/pulsar/issues/16551) 通过对 Broker、客户端和 managedLedger 进行更改，在 Pulsar 中实现了蓝绿部署。Broker 将支持一个管理 API，允许标记集群用于迁移并指定重定向 URL。迁移状态和重定向 URL 持久化在集群元数据中。Broker 异步地将该 Broker 拥有的每个 Topic 标记为已迁移，并使用名为"Migrated-Topic"的新客户端协议命令通知所有生产者和消费者（他们已经为订阅清空了积压），该命令具有到绿色集群的重定向 URL。这些 Topic 的生产者和消费者缓存重定向 URL，并使用该 URL 重试连接到 Broker，该 Broker 将它们重定向到绿色集群。

通过在 Pulsar 3.0 中引入这样的功能，用户可以实现集群之间的无缝流量迁移，而不会导致 Topic 停机。

有关 Pulsar 3.0 发布的更多信息，请参见[发布说明](pathname:///release-notes/versioned/pulsar-3.0.0/)。

## 版本之间的兼容性

升级现有 Pulsar 版本时，线性升级组件很重要。

在 Pulsar 3.0 之前，应该通过每个功能版本线性执行升级。例如，从 2.8 升级到 2.10 时，在进入 2.10 之前升级到 2.9 很重要。

从 3.0 开始，用户可以在两个连续的 LTS 版本之间进行实时升级或降级。例如：

- ✅ 3.0 -> 4.0 -> 3.0；
- ✅ 3.2 -> 4.0 -> 3.2；
- ✅ 3.2 -> 4.4 -> 3.2；
- ❌ 3.2 -> 5.0。

## 开始使用

Pulsar 3.0.0 现在可在 GitHub 上下载。要开始使用 Pulsar，你可以 [在本地机器、Docker 或 Kubernetes 上运行 Pulsar 集群](pathname:///docs/3.0.x/getting-started-home/)。

## 展望未来

通过 Pulsar 3.0 LTS 模型，用户可以更容易地选择保持在 LTS 稳定版本或具有最新功能和改进的新版本上，所有这些都保证更长的支持和到下一个 LTS 版本的实时升级路径。

同时，3.0 中引入的几个功能为进一步改进奠定了基础。其中一个例子是新的负载均衡器（PIP-192）：虽然立即有用且明显改进，但它也为许多更多优化铺平了道路，这些优化涉及如何将 Topic 从一个 Broker 传输到另一个 Broker，目标是最小化此类操作的延迟影响。

另一个令人兴奋的发展领域是 [PIP-264](https://github.com/apache/pulsar/issues/20197) 中描述的重新设计指标收集和聚合系统的提案。

最后，Pulsar 3.0 受益于 Apache BookKeeper 4.16 中引入的性能改进。我们看到进一步提高 BookKeeper 性能以获得更快 Pulsar 的巨大潜力！

## 参与其中

Apache Pulsar 是增长最快的开源项目之一，被 [Apache 软件基金会](https://thestack.technology/top-apache-projects-in-2021-from-superset-to-nuttx/) 认定为基于参与度的前 5 项目。Pulsar 的活力依赖于持续的社区增长，没有项目的每一位贡献者，这是不可能的。Pulsar 社区欢迎任何对开源、消息和流处理以及分布式系统有热情的人的贡献！寻找更多与 Pulsar 社区保持联系的方式？查看以下资源：

- Pulsar Virtual Summit Europe 2023 将于 2023 年 5 月 23 日星期二举行！[立即免费注册](https://events.zoom.us/ev/Ap6rsDg9LeVfmdajJ_eB13HH026J1d_o8OoTKkQnl_jzVl-srhwB~AggLXsr32QYFjq8BlYLZ5I06Dg)，并在 Twitter 上关注 @PulsarSummit 以获取这个备受期待的一日活动的更新和详情。
- 阅读 [Apache Pulsar 贡献指南](pathname:///contribute/) 开始你的第一次贡献。
- 访问 [Pulsar GitHub 仓库](https://github.com/apache/pulsar)，在 Twitter 上关注项目 [@apache_pulsar](https://twitter.com/apache_pulsar)，并加入 [Slack 上的 Pulsar 社区](https://apache-pulsar.slack.com/)。