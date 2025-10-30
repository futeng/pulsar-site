---
id: txn-advanced-features
title: Advanced features
sidebar_label: "Advanced features"
description: Get a comprehensive understanding of advanced features of transactions in Pulsar.
---

您可以在 Pulsar 中使用以下事务高级功能。

## 确认批量消息

如果您想使用事务确认批量消息，请在 [`broker.conf`](https://github.com/apache/pulsar/blob/master/conf/broker.conf) 或 [`standalone.conf`](https://github.com/apache/pulsar/blob/master/conf/standalone.conf) 文件中将 `acknowledgmentAtBatchIndexLevelEnabled` 设置为 `true`。


```conf
acknowledgmentAtBatchIndexLevelEnabled=true
```

此示例在消费者构建器中启用事务中的批量消息确认。

```java
Consumer<byte[]> consumer = pulsarClient
    .newConsumer()
    .topic(transferTopic)
    .subscriptionName("transaction-sub")
    .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
    .subscriptionType(SubscriptionType.Shared)
    .enableBatchIndexAcknowledgment(true) // 启用批量索引确认
    .subscribe();
```

## 启用认证

如果您想在使用事务时启用认证，请按照以下步骤操作。

1. [向 `persistent://pulsar/system/transaction_coordinator_assign` Topic 授予"消费"权限](admin-api-topics.md#grant-permission)。

2. 在 Pulsar 客户端中[配置认证](security-overview/#authentication)。

## 保证恰好一次语义

如果您想使用事务保证恰好一次语义，您可以[在 broker、命名空间或 Topic 级别启用消息去重](cookbooks-deduplication.md#enable-message-deduplication-at-namespace-or-topic-level)。

## 相关主题

- 要快速入门，请参阅 [Pulsar 事务 - 快速入门](txn-use.md)。