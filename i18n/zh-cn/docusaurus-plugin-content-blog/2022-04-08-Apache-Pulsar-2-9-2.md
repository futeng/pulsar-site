---
author: gaoran10, Anonymitaet
title: "Apache Pulsar 2.9.2 的新功能"
---

Apache Pulsar 社区发布了 2.9.2 版本！60 位贡献者提供了改进和错误修复，共计 317 个提交。

<!--truncate-->

本版本的主要亮点如下：

- 事务性能测试工具可用。[PR-11933](https://github.com/apache/pulsar/pull/11933)

- Broker 减少未确认消息的数量。[PR-13383](https://github.com/apache/pulsar/pull/13383)

- Reader 继续从压缩账本读取数据。[PR-13629](https://github.com/apache/pulsar/pull/13629)

本博客将按受影响的功能分类介绍最值得注意的更改。有关包含所有功能、增强和错误修复的完整列表，请查看 [Pulsar 2.9.2 发布说明](https://github.com/apache/pulsar/releases/tag/v2.9.2)。

# 值得注意的错误修复和增强

### Reader 继续从压缩账本读取数据。[PR-13629](https://github.com/apache/pulsar/pull/13629)

#### 问题

以前，当主题卸载时，如果 reader 已经从某些压缩账本消费了一些消息，则一些数据会丢失无法被 reader 读取。

#### 解决方案

如果 `readCompacted = true`，则将 reader 游标回退到标记删除位置的下一个消息。

### Broker 减少未确认消息的数量。[PR-13383](https://github.com/apache/pulsar/pull/13383)

#### 问题

以前，如果启用了批量确认，broker 不会减少未确认消息的数量。因此，如果消费者达到 `maxUnackedMessagesPerConsumer` 限制，消费者会被阻塞。

#### 解决方案

当调用 `individualAckNormal` 时减少未确认消息的数量。

### 分块消息可以通过 Pulsar SQL 查询。[PR-12720](https://github.com/apache/pulsar/pull/12720)

#### 问题

以前，分块消息无法通过 Pulsar SQL 查询。

#### 解决方案

在 `PulsarRecordCursor` 中添加分块消息映射来维护不完整的分块消息。如果一个分块消息被完全接收，它将被放入消息队列中等待反序列化。

### 支持在 broker 级别启用或禁用 schema 上传。[PR-12786](https://github.com/apache/pulsar/pull/12786)

#### 问题

以前，Pulsar 不支持在 broker 级别启用或禁用 schema 上传。

#### 解决方案

在 broker 端添加了配置 `isSchemaAutoUploadEnabled`。

### Reader 可以读取压缩主题中的最新消息。[PR-14449](https://github.com/apache/pulsar/pull/14449)

#### 问题

以前，如果 reader 启用了 `readCompacted` 且主题的所有数据都已经压缩到压缩账本中，reader 无法读取压缩主题中的最新消息。

#### 解决方案

为托管游标添加了 `forceReset` 配置，以便游标可以重置到给定位置，reader 可以从压缩账本读取数据。

### 事务 sequenceId 可以正确恢复。[PR-13209](https://github.com/apache/pulsar/pull/13209)

#### 问题

以前，由于错误的 `managedLedger` 属性，恢复了错误的事务 sequenceId。

#### 解决方案

使用 `ManagedLedgerInterceptor` 将当前 sequenceId 更新到 `managedLedger` 属性等。

### 事务性能测试工具可用。[PR-11933](https://github.com/apache/pulsar/pull/11933)

#### 问题

以前，在开启事务时很难测试事务性能（如发送和消费消息的延迟和速率）。

#### 解决方案

添加了 `PerformanceTransaction` 类来支持此增强功能。

### Pulsar Proxy 中不再存在端口耗尽和连接问题。[PR-14078](https://github.com/apache/pulsar/pull/14078)

#### 问题

以前，Pulsar 代理会进入停止代理 broker 连接的状态，而 Admin API 代理继续工作。

#### 解决方案

优化了代理连接，如果目标 broker 不活跃则快速失败，为代理连接添加连接超时处理等。

### 发布消息时 `OpSendMsgQueue` 中没有竞争条件。[PR-14231](https://github.com/apache/pulsar/pull/14231)

#### 问题

在调用方法 `getPendingQueueSize()` 并收到发送回执后，从 `pendingMessages` 中 peek 的过程中可能会出现 NPE。

#### 解决方案

为每个计算进程在 `OpSendMsgQueue` 中添加线程安全的消息计数对象。

### 在 AdditionalServlet 中将 `ContextClassLoader` 更改为 `NarClassLoader`。[PR-13501](https://github.com/apache/pulsar/pull/13501)

#### 问题

以前，如果一个类被 `NarClassLoader` 动态加载，当它被默认类加载器使用时会发生 `ClassNotFoundException`。

#### 解决方案

在每次插件回调之前通过 `Thread.currentThread().setContextClassLoader(classLoader)` 更改上下文类加载器，之后将上下文类加载器更改回原始类加载器。

# 下一步是什么？

如果您有兴趣了解更多关于 Pulsar 2.9.2 的信息，您可以立即[下载](https://pulsar.apache.org/en/versions/)并试用！

**Pulsar Summit San Francisco 2022** 将于 2022 年 8 月 18 日举行。[立即注册](https://pulsar-summit.org/)，并通过在社交媒体上传播消息来帮助我们取得更大的成功！

有关 Apache Pulsar 项目和当前进展的更多信息，请访问
[Pulsar 网站](https://pulsar.apache.org)，在 Twitter [@apache_pulsar](https://twitter.com/apache_pulsar) 上关注项目，并加入 [Pulsar Slack](https://apache-pulsar.herokuapp.com/)！