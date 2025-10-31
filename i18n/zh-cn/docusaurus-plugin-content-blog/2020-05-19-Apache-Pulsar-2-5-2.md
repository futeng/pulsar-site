---
author: Jia Zhai
authorURL: https://twitter.com/Jia_Zhai
title: "Apache Pulsar 2.5.2"
---

我们很自豪地发布 Apache Pulsar 2.5.2。这是社区巨大努力的结果，包含超过 56 个提交、通用改进和错误修复。

有关 2.5.2 版本的详细更改，请参考<b>[发布说明](/release-notes/#2.5.2)</b>和<b>[Pulsar 2.5.2 的 PR 列表](https://github.com/apache/pulsar/pulls?q=is:pr%20label:release/2.5.2%20is:closed)</b>。

以下重点介绍了此版本中的一些改进功能和修复的错误。

<!--truncate-->

## 通过命名空间级别覆盖实现自动主题创建

引入一个新的命名空间策略 `autoTopicCreationOverride`，它允许在命名空间级别覆盖 broker 的 `autoTopicCreation` 设置。您可以禁用 broker 的 `autoTopicCreation`，同时在特定命名空间上允许它。

## 为卸载策略添加每个命名空间的自定义 deletionLag 和阈值

支持在命名空间级别的卸载策略中配置 `deletionLag` 和阈值，以从卸载的分层存储中删除数据。

## 使 managed ledgers ZooKeeper 缓存失效而不是在监视器触发时重新加载

当主题频繁创建或删除时，ZooKeeper 子缓存会为 z-nodes 重新加载。这会给 ZooKeeper 和 broker 带来额外负载，减慢 broker 速度并使其稳定性降低。在此版本中，引入了 `ZooKeeperManagedLedgerCache` 来使 ZooKeeper 缓存失效而不是重新加载，当主题创建或删除时。这有助于减少 ZooKeeper 的压力。

## 在没有流量时遵守保留策略

在之前的版本中，保留在 ledger 翻转时检查。因此如果流量停止，即使所有消息都已被确认，ledger 也不会被清理。在 Pulsar 2.5.2 中，引入了 `retentionCheckIntervalInSeconds` 来检查消费的 ledger 是否需要在间隔之间被修剪。如果值设置为 0 或负数，系统不会检查消费的 ledger。

## 将 Netty 版本升级到 4.1.48.Final

Netty 4.1.x（4.1.46 之前）中的 ZlibDecoders 在解码 ZlibEncoded 字节流时允许无界内存分配。攻击者可以向 Netty 服务器发送大型 ZlibEncoded 字节流，强制服务器将其所有空闲内存分配给单个解码器。该错误在 Netty `4.1.48.Final` 中被修复。

## 增加加载主题的超时时间

加载复制的主题是相当昂贵的操作，涉及全局 ZooKeeper 查找和许多子进程的启动。在 Pulsar 2.5.2 中，我们将具有许多复制集群的主题的加载超时时间增加到 60 秒。

## 修复没有消费者的游标的不正确游标状态

如果订阅的消费者被关闭，游标被设置为非活动状态。但是在积压大小小于 `backloggedCursorThresholdEntries` 时，在 `PulsarStats.updateStats()` 期间游标被设置为活动状态。在 Pulsar 2.5.2 中，我们将 `checkBackloggedCursors()` 从 `ManagedLedger` 移动到 `Topic` 并检查消费者列表来修复这个错误。

## 将非持久游标更改为活动状态以提高性能

在非持久订阅模式下，游标不是活动的，这导致写入的条目不会被放入缓存。这会降低读取性能。在 Pulsar 2.5.2 中，我们将 `NonDurableCursorImpl` 设置为活动状态并移除三个重写方法 `setActive()`、`isActive()`、`setInactive()` 来提高读取性能。

## 为 TLS 添加密钥库配置

在 Pulsar 2.5.2 中，我们为 TLS 添加了密钥库配置，允许用户在内部通信使用内部 CA 证书的同时定义自己的 CA 证书。此更改保持原始 TLS 设置不变，并在需要的路径中添加新配置。

## 当主题不存在时关闭生产者

在之前的版本中，当我们为不存在的主题创建生产者时，`ProducerImpl` 对象会挂起在转储中。这导致微服务中的 OOM，这些微服务错误地尝试持续向不存在的主题生产。在 Pulsar 2.5.2 中，我们从以下两个方面修复了这个错误：

- 修复不存在主题的异常处理。
- 当生产者获得 `TopicDoesNotExists` 异常时将状态更改为 `Close`。

## 修复重启 broker 后 `topicPublishRateLimiter` 不生效

在之前的版本中，当在命名空间上配置发布速率时，它可以限制发布速率。但是当 broker 重启时，限制会过期。在 Pulsar 2.5.2 中，这个错误被修复。

## 为命名空间/订阅/消费者暴露 pulsar_out_bytes_total 和 pulsar_out_messages_total

为命名空间、订阅和消费者添加 pulsar_out_bytes_total 和 pulsar_out_messages_total。这有助于避免在 Prometheus 中计算的速率缺失或在抓取间隔内速率变化缺失。

## 修复 `ttlDurationDefaultInSeconds` 策略

命名空间的 TTL 应该在命名空间策略未配置时从 broker 配置中检索。在之前的版本中，代码只直接返回存储在命名空间策略中的值，而不判断 TTL 是否配置。在 Pulsar 2.5.2 中，我们添加一个条件来测试 TTL 是否在命名空间策略中配置。如果没有，broker 检索存储在 broker 配置中的值并将其作为输出返回。

## 修复 GenricJsonRecord 中的 long 字段解析

对于以 JSON schema 发送的消息，如果 long 字段的值小于 `Integer.MAX_VALUE`，则被解码为 int。否则，long 字段被解码为字符串。Pulsar 2.5.2 在 GenericJsonRecord 中引入了字段类型检查来修复这个错误。

## 修复 Avro schema 中消息编码失败时的游标重置泄漏

如果 Avro 对消息的编码在写入几个字节后失败，流中的游标不会被重置。通常重置游标的以下 `flush()` 在有异常时被跳过。在 Pulsar 2.5.2 中，我们在 finally 块中引入了一个 `flush()` 来修复这个错误。

## 自动更新主题分区

在 Pulsar 2.5.2 中，C++ 客户端支持先前创建的生产者和消费者在主题分区更新时自动更新分区。

- 向 `PartitionedConsumerImpl` 和 `PartitionedProducerImpl` 添加一个 `boost::asio::deadline_timer` 来注册查找任务以定期检测分区变化。
- 添加一个 unsigned int 配置参数来表示检测分区变化的周期。
- 在检查 `state_` 后在 `PartitionedConsumerImpl::receive` 中解锁 `mutex_`。

## 修复发送回调中的默认消息 ID

在之前的版本中，回调中的 `MessageId` 总是默认值（`-1, -1, -1, -1`）。在 Pulsar 2.5.2 中，我们移除了 `BatchMessageContainer::MessageContainer` 的无用字段 `messageId`，并向 `batchMessageCallBack` 添加了 `const MessageId&` 参数。因此，如果消息发送成功，我们可以在回调中获得正确的消息 ID。

## 修复发送到分区主题的消息 ID 错误

如果消息发送到分区主题，消息 ID 的 `partition` 字段总是设置为 -1，因为 `SendReceipt` 命令只包含 ledger ID 和 entry ID。在 Pulsar 2.5.2 中，我们通过向 `ProducerImpl` 添加一个 `partition` 字段并在 `ackReceived` 方法中用它设置消息 ID 的 `partition` 字段来修复这个错误。

## 为 Pulsar Functions 支持 Async 模式

在之前的版本中，Pulsar Functions 不支持 Async 模式，例如用户传入以下格式的 Function：

```

Function<I, CompletableFuture<O>>

```

如果 Pulsar Functions 使用 RPC 调用外部系统，这种函数很有用。因此，在 Pulsar 2.5.2 中，我们为 Pulsar Functions 引入了 Async 模式支持。

## 修复 localrunner netty 依赖问题

在 Pulsar 2.5.2 中，我们为 pulsar-functions-local-runner 添加了一个 Log4j2 配置文件，默认记录到控制台。这有助于解决当将 pulsar-functions-local-runner 作为依赖引入并尝试本地运行 Pulsar Functions 时缺少 Netty 库和找不到类的问题。

## 修复 Pulsar Functions 更新的 SerDe 验证

在之前的版本中，`outputSchemaType` 字段被不当用于验证 Pulsar Function 更新的参数。实际上，应该使用 `outputSerdeClassName` 参数。在 Pulsar 2.5.2 中，我们修复了这个错误。

## 避免将数据卸载到 HDFS 时预取太多数据

如果在将数据卸载到 HDFS 时预取太多数据，可能会导致严重的 OOM。在 Pulsar 2.5.2 中，引入了 `managedLedgerOffloadPrefetchRounds`，用于设置用于卸载数据的 ledger 读取的最大预取轮数。

## JDBC sink 处理 schema 中的 null 字段

JDBC sink 不处理 `null` 字段。在 Pulsar 中注册的 schema 允许它，并且 MySQL 中的表 schema 有一个同名的列。当消息发送到 JDBC sink 时没有该字段，会抛出异常。在 Pulsar 2.5.2 中，JDBC sink 使用 `setColumnNull` 方法来正确反映数据库行中的 null 字段值。

## 参考

要下载 Apache Pulsar 2.5.2，点击[这里](https://pulsar.apache.org/download/)。

如果您有任何问题或建议，通过邮件列表或 slack 联系我们。

- [users@pulsar.apache.org](mailto:users@pulsar.apache.org)
- [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org)
- Pulsar slack 频道：https://apache-pulsar.slack.com/
- 在 https://apache-pulsar.herokuapp.com/ 自行注册

期待您对 [Pulsar](https://github.com/apache/pulsar) 的贡献。