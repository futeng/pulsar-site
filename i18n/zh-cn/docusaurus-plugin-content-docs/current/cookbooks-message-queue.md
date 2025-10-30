---
id: cookbooks-message-queue
title: 使用 Pulsar 作为消息队列
sidebar_label: "消息队列"
description: 学习如何使用 Pulsar 作为消息队列。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

消息队列是许多大规模数据架构的重要组成部分。如果通过系统的每个工作对象都绝对*必须*被处理，尽管某个系统组件的缓慢或完全失败，您很可能需要一个消息队列介入，确保未处理的数据被保留---具有正确的顺序---直到采取所需的操作。

Pulsar 是消息队列的绝佳选择，因为：

* 它的构建考虑了[持久消息存储](concepts-architecture-overview.md#persistent-storage)
* 它为主题上的消息在[消费者](reference-terminology.md#consumer)之间提供自动负载均衡（如果您愿意，也可以提供自定义负载均衡）

:::tip

您可以使用相同的 Pulsar 安装同时作为实时消息总线和消息队列（或者只使用其中一个）。您可以为实时目的设置一些主题，为消息队列目的设置其他主题（或者如果您愿意，可以为任一目的使用特定的命名空间）。

:::

## 客户端配置更改

要将 Pulsar [主题](reference-terminology.md#topic)用作消息队列，您应该将该主题上的接收者负载分布到多个消费者（消费者的最佳数量取决于负载）。

每个消费者必须建立[共享订阅](concepts-messaging.md#shared)并使用与其他消费者相同的订阅名称（否则订阅不共享，消费者不能作为处理集合工作）。

如果您想严格控制消费者之间的消息分发，请将消费者的**接收者队列**大小设置得非常低（如有必要，甚至设置为 0）。每个消费者都有一个接收者队列，确定消费者一次尝试获取多少消息。例如，1000 的接收者队列（默认值）意味着消费者尝试在连接时处理主题积压中的 1000 条消息。将接收者队列设置为 0 本质上意味着确保每个消费者一次只做一件事。

:::tip

分区主题消费者的接收者队列大小采用以下两个值中的最小值：
* `receiver_queue_size`
* `max_total_receiver_queue_size_across_partitions`/`NumPartitions`

:::

## 示例

这是一个使用共享订阅的示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">