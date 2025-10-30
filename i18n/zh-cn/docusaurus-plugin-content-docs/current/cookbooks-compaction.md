---
id: cookbooks-compaction
title: 主题压缩
sidebar_label: "主题压缩"
description: 全面了解 Pulsar 中主题压缩的使用和配置方法。
---

Pulsar 的[主题压缩](concepts-topic-compaction.md#topic-compaction-example-the-stock-ticker)功能使你能够创建**压缩的**主题，其中较旧的、"被遮蔽"的条目从主题中修剪，允许更快地读取主题的历史（哪些消息被视为被遮蔽/过时/无关将取决于你的用例）。

要使用压缩：

* 你需要给消息赋予键，因为 Pulsar 中的主题压缩在*每个键的基础上*进行（即消息根据它们的键进行压缩）。对于股票行情用例，股票代码---例如`AAPL`或`GOOG`---可以作为键（更多关于[下面](#when-should-i-use-compacted-topics)的内容）。没有键的消息将被压缩过程单独留下。
* 可以配置压缩[自动运行](#configure-compaction-to-run-automatically)，或者你可以使用 Pulsar 管理 API 手动[触发](#trigger-compaction-manually)压缩。
* 你的消费者必须[配置](#configure-consumers)为从压缩主题读取（例如，Java 消费者有一个必须设置为`true`的`readCompacted`设置）。如果未设置此配置，消费者仍然可以从非压缩主题读取。

:::tip

压缩只适用于有键的消息（如在股票行情示例中，股票代码作为每条消息的键）。因此，键可以被认为是应用压缩的轴。没有键的消息被压缩简单地忽略。

PIP-318 在 broker 端引入了`topicCompactionRetainNullKey`配置，允许你配置在压缩期间是否保留没有键的消息。从 3.2.0+ 版本开始，默认在主题压缩期间不保留空键消息。
更多信息，请参见[PIP-318](https://github.com/apache/pulsar/blob/master/pip/pip-318.md)。

:::

## 我应该什么时候使用压缩主题？