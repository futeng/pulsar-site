---
author: Hang Chen, Anonymitaet
title: "Apache Pulsar 2.8.1"
---

# Apache Pulsar 2.8.1 的新功能

Apache Pulsar 社区发布了 2.8.1 版本！49 位贡献者提供了改进和错误修复，共计 213 个提交。

<!--truncate-->

本版本的主要亮点如下：

- Key-shared 订阅在重复打开和关闭消费者时不再停止向消费者分发消息。[PR-10920](https://github.com/apache/pulsar/pull/10920)

- 系统主题在未配置压缩时不再有潜在的数据丢失。[PR-11003](https://github.com/apache/pulsar/pull/11003)

- 不允许消费者读取其未订阅的主题上的数据。[PR-11912](https://github.com/apache/pulsar/pull/11912)

本博客将按组件分类介绍最值得注意的更改。有关包含所有功能、增强和错误修复的完整列表，请查看 [Pulsar 2.8.1 发布说明](https://pulsar.apache.org/release-notes/#281-mdash-2021-09-10-a-id281a)。

# 值得注意的错误修复和增强

## Broker

### 精确发布速率限制按预期生效。[PR-11446](https://github.com/apache/pulsar/pull/11446)

**问题**：以前，在主题上设置精确发布速率限制时，它不起作用。

**解决方案**：使用 `LeakingBucket` 和 `FixedWindow` 算法实现了新的 `RateLimiter`。

### 具有相同键的消息被传递到 Key-Shared 订阅上的正确消费者。[PR-10762](https://github.com/apache/pulsar/pull/10762)

**问题**：当在 Key-Shared 订阅上发生消息重新传递时，具有相同键的消息会乱序。

**解决方案**：当向 `messagesToRedeliver` 发送消息时，broker 保存了键的哈希值。如果调度器尝试向具有对应任何保存哈希值的键的消费者发送新消息，这些消息会被添加到 `messagesToRedeliver` 中而不是被发送。这防止了具有相同键的消息乱序。

### 具有相同名称的活动生产者不再从主题映射中删除。[PR-11804](https://github.com/apache/pulsar/pull/11804)

**问题**：以前，当存在具有相同名称的生产者时，会触发错误并删除旧生产者，即使它仍在向主题写入数据。

**解决方案**：基于连接 ID（本地和远程地址以及唯一 ID）和该连接内的生产者 ID 而不是生产者名称来验证生产者。

### 处于隔离状态的主题在生产者继续重新连接到 broker 时可以恢复。[PR-11737](https://github.com/apache/pulsar/pull/11737)

**问题**：以前，当生产者继续重新连接到 broker 时，主题的隔离状态总是设置为 true，这导致主题无法恢复。

**解决方案**：当轮询操作不等于当前操作时，向 `ManagedLedgerException` 添加一个条目。

### 主题正确初始化游标以防止数据丢失。[PR-11547](https://github.com/apache/pulsar/pull/11547)

**问题**：以前，当以最早位置订阅主题时，数据会丢失，因为 `ManagedLedger` 使用了错误的位置来初始化游标。

**解决方案**：添加了一个测试来检查以最早位置订阅主题时游标的位置。

### 使用 `hasMessageAvailableAsync` 和 `readNextAsync` 时不再发生死锁。[PR-11183](https://github.com/apache/pulsar/pull/11183)

**问题**：以前，当消息被添加到传入队列时，可能会发生死锁。死锁可能在两种可能的情况下发生。首先，如果在消息被读取之前将消息添加到队列中。其次，如果 `readNextAsync` 在调用 `future.whenComplete` 之前完成。

**解决方案**：使用内部线程来处理 `hasMessageAvailableAsync` 的回调。

### 调用 getLastMessageId API 时不会发生内存泄漏。[PR-10977](https://github.com/apache/pulsar/pull/10977)

**问题**：以前，调用 `getLastMessageId` API 时 broker 会耗尽内存。

**解决方案**：在 `PersistentTopic.getLastMessageId` 中添加了 `entry.release()` 调用。

### 为系统主题触发压缩。[PR-10941](https://github.com/apache/pulsar/pull/10941)

**问题**：以前，当主题只有非持久订阅时，压缩不会被触发，因为它有 0 估计积压大小。

**解决方案**：使用总积压大小来触发压缩。在没有持久订阅的情况下改变了行为，使用总积压大小。

### Key-shared 订阅在重复打开和关闭消费者时不再停止向消费者分发消息。[PR-10920](https://github.com/apache/pulsar/pull/10920)

**问题**：重复打开和关闭具有 Key-Shared 订阅的消费者可能偶尔停止向所有消费者分发消息。

**解决方案**：在调用 `removeConsumer()` 之前移动标记删除位置并从选择器中移除消费者。

### 不允许消费者读取其未订阅的主题上的数据。[PR-11912](https://github.com/apache/pulsar/pull/11912)

**问题**：以前，请求分类账未被检查是否属于消费者连接的主题，这允许消费者读取不属于连接主题的数据。

**解决方案**：在执行读取操作之前在 `ManagedLedger` 级别添加检查。

## Topic Policy

### 保留策略按预期工作。[PR-11021](https://github.com/apache/pulsar/pull/11021)

**问题**：以前，保留策略不起作用，因为它没有在 `managedLedger` 配置中设置。

**解决方案**：将 `managedLedger` 配置中的保留策略设置到 `onUpdate` 监听器方法中。

### 系统主题在未配置压缩时不再有潜在的数据丢失。[PR-11003](https://github.com/apache/pulsar/pull/11003)

**问题**：以前，如果主题上没有持久订阅，数据可能会丢失。

**解决方案**：利用主题压缩游标来保留数据。

## Proxy

### Pulsar 代理正确关闭出站连接。[PR-11848](https://github.com/apache/pulsar/pull/11848)

**问题**：以前，Pulsar 代理中的传出 TCP 连接存在内存泄漏，因为 `ProxyConnectionPool` 实例在 `PulsarClientImpl` 实例外部创建，并且在客户端关闭时没有关闭。

**解决方案**：正确关闭 `ConnectionPool`。

## Function

### Pulsar Functions 支持 Protobuf schema。[PR-11709](https://github.com/apache/pulsar/pull/11709)

**问题**：以前，使用 Protobuf schema 时抛出 `GeneratedMessageV3 is not assignable` 异常。

**解决方案**：向 Pulsar 实例添加了相关依赖。

## Client

### 分区主题消费者在失败后清理资源。[PR-11754](https://github.com/apache/pulsar/pull/11754)

**问题**：以前，分区主题消费者在创建消费者失败时不会清理资源。如果此失败发生不可恢复的错误，会触发内存泄漏，使应用程序不稳定。

**解决方案**：关闭并清理计时器任务引用。

### 多主题消费者上不会发生竞争条件。[PR-11764](https://github.com/apache/pulsar/pull/11764)

**问题**：以前，当其中一个单独消费者处于"暂停"状态且共享队列已满时，2 个线程之间存在竞争条件。

**解决方案**：在将消费者标记为"暂停"后验证共享队列的状态。如果其他线程在此期间已清空队列，消费者不会被阻塞。

### 消费者在 `batchReceive` 上不会被阻塞。[PR-11691](https://github.com/apache/pulsar/pull/11691)

**问题**：以前，由于 `ConsumerBase.java` 中的竞争条件，当 `Consumer.batchReceive()` 被不同线程并发调用时，消费者会被阻塞。

**解决方案**：将 `pinnedInternalExecutor` 放入 `ConsumerBase` 中，以允许批处理计时器、`ConsumerImpl` 和 `MultiTopicsConsumerImpl` 在单个线程中提交工作。

### Python 客户端正确启用自定义日志记录。[PR-11882](https://github.com/apache/pulsar/pull/11882)

**问题**：以前，在 Python 客户端中启用自定义日志记录时可能会发生死锁。

**解决方案**：分离工作线程并降低日志级别。

# 下一步是什么？

如果您有兴趣了解更多关于 Pulsar 2.8.1 的信息，您可以立即[下载](https://pulsar.apache.org/download/)并试用！

首届 Pulsar Virtual Summit Europe 2021 将于 10 月举行。[立即注册](https://hopin.com/events/pulsar-summit-europe-2021)，并通过在社交媒体上传播消息来帮助我们取得更大的成功！

有关 Apache Pulsar 项目和进展的更多信息，请访问
[Pulsar 网站](https://pulsar.apache.org)，在 Twitter [@apache_pulsar](https://twitter.com/apache_pulsar) 上关注项目，并加入 [Pulsar Slack](https://apache-pulsar.herokuapp.com/)！