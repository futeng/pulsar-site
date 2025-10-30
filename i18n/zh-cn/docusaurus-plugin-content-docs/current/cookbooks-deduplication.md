---
id: cookbooks-deduplication
title: 消息去重
sidebar_label: "消息去重"
description: 了解 Pulsar 中的消息去重功能。
---

Pulsar 支持消息去重，确保即使生产者多次发送同一条消息，消息也只被传递给消费者一次。

## 概述

消息去重对于确保精确一次处理语义非常重要。当启用去重时，Pulsar 会跟踪每个生产者已发送的消息序列 ID，并在存储消息前检查是否已处理过具有相同序列 ID 的消息。

## 启用消息去重

您可以在生产者级别或主题级别启用消息去重：

### 生产者级别去重

```java
Producer<byte[]> producer = client.newProducer()
    .topic("my-topic")
    .enableMessageBatching(false)
    .sendTimeout(10, TimeUnit.SECONDS)
    .messageRoutingMode(MessageRoutingMode.SinglePartition)
    .create();
```

### 主题级别去重

主题级别去重可以通过代理配置启用，确保对该主题的所有生产者消息都进行去重。

## 使用场景

- 网络分区导致的生产者重试
- 生产者崩溃和恢复
- 不确定的消息传递状态
- 确保精确一次处理语义