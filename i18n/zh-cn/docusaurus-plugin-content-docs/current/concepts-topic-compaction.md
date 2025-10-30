---
id: concepts-topic-compaction
title: 主题压缩
sidebar_label: "主题压缩"
descriptions: 全面了解 Apache Pulsar 中主题压缩的概念、功能和工作流程。
---

Pulsar 的构建以消息数据的高度可扩展[持久存储](concepts-architecture-overview.md#persistent-storage)为主要目标。Pulsar 主题使你能够持久存储所需数量的未确认消息，同时保持消息顺序。默认情况下，Pulsar 存储主题上产生的*所有*未确认/未处理消息。在主题上累积许多未确认消息对于许多 Pulsar 用例是必要的，但对于 Pulsar 消费者来说，通过整个消息日志"倒带"可能非常耗时。

> 有关主题压缩的更实用指南，请参见[主题压缩 cookbook](cookbooks-compaction.md)。

对于某些用例，消费者不需要主题日志的完整"图像"。他们可能只需要一些值来构建日志的更"浅"图像，甚至可能只需要最新值。对于这些类型的用例，Pulsar 提供**主题压缩**。当你在主题上运行压缩时，Pulsar 遍历主题的积压并删除被后续消息*遮蔽*的消息，即主题压缩基于每个键遍历主题，只保留与该键关联的最新消息。

Pulsar 的主题压缩功能：

* 允许更快地"倒带"主题日志
* 仅适用于[持久主题](concepts-architecture-overview.md#persistent-storage)
* 当积压达到一定大小时自动触发，或可以通过命令行手动触发。参见[主题压缩 cookbook](cookbooks-compaction.md)
* 在概念和操作上与[保留和过期](concepts-messaging.md#message-retention-and-expiry)不同。但是，主题压缩*确实*尊重保留。如果保留已从主题的消息积压中删除消息，该消息也将无法从压缩的主题Ledger中读取。

> #### 主题压缩示例：股票行情
> 压缩的 Pulsar 主题的示例用例是股票行情主题。在股票行情主题上，每条消息都带有购买股票的时间戳美元价值（消息键保存股票代码，例如`AAPL`或`GOOG`）。对于股票行情，你可能只关心股票的最新值，对历史数据不感兴趣（即你不需要构建每个键的主题消息序列的完整图像）。在这种情况下，压缩将非常有益，因为它将使消费者不需要通过被遮蔽的消息倒带。


## 主题压缩如何工作

当主题压缩[通过 CLI](cookbooks-compaction.md)触发时，它按以下步骤工作：

1. Pulsar 将从头到尾遍历整个主题。