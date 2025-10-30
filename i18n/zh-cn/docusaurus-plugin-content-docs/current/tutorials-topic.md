---
Id: tutorials-topic
title: How to create a topic
sidebar_label: "Create a topic"
description: Learn how to create a topic in Pulsar.

---


Apache Pulsar 是一个分布式消息系统，支持高性能和低延迟。[Topic](concepts-messaging.md#topics) 是在 Apache Pulsar 中构建数据的主要方式。Topic 中的每条消息都有一个偏移量，它唯一地标识该 Topic 中的消息。

## 前置条件
[发布到分区 Topic](admin-api-topics.md#publish-to-partitioned-topics)

## 创建 Topic

要创建 Topic，请完成以下步骤。

1. 在命名空间 `apache/pulsar` 中创建具有 4 个分区的 `test-topic`。

   ```bash
   bin/pulsar-admin topics create-partitioned-topic apache/pulsar/test-topic -p 4
   ```

2. 列出命名空间 `apache/pulsar` 中的所有分区 Topic。

   ```bash
   bin/pulsar-admin topics list-partitioned-topics apache/pulsar
   ```

#### 相关主题

- [设置租户](tutorials-tenant.md)
- [创建命名空间](tutorials-namespace.md)
- [生产和消费消息](tutorials-produce-consume.md)

