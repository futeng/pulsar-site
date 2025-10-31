---
title: "What’s New in Apache Pulsar 2.7.5"
date: 2022-09-09
author: "Jason918, momo-jun"
---

Apache Pulsar 社区发布了 2.7.5 版本！23 位贡献者提供了改进和错误修复，共提交了 89 个代码变更。感谢所有贡献者的付出。

2.7.5 版本的亮点是修复了 broker、proxy 和存储上的一些关键错误，包括消息/数据丢失、broker 死锁和连接泄漏。请注意，2.7.5 是 2.7.x 的最后一个版本。

这篇博客介绍了最值得注意的变更。如需完整的变更列表，包括所有功能增强和错误修复，请查看 [Pulsar 2.7.5 发布说明](https://pulsar.apache.org/release-notes/versioned/pulsar-2.7.5/)。

<!--truncate-->

### 修复了检查复制时元数据缓存缺失导致的死锁问题。[PR-16889](https://github.com/apache/pulsar/pull/16889)

#### 问题描述
在 [#12340](https://github.com/apache/pulsar/pull/12340) 中的变更之后，仍然有几个地方进行阻塞调用。这些调用占用了所有有序调度器线程，导致回调无法完成，直到 30 秒超时过期。

#### 解决方案
在元数据回调线程上将阻塞调用改为异步模式。

### 修复了使用 key_shared 模式时的死锁问题。[PR-11965](https://github.com/apache/pulsar/pull/11965)

#### 问题描述
当消费者使用 key_shared 模式时，由于一些竞态条件，broker 中可能会发生死锁，导致大量连接处于 `CLOSE_WAIT` 状态。

#### 解决方案
在 `ManagedCursorImpl` 的 `asyncDelete` 函数中，在回调之前进行解锁。

### 修复了由于 ledger 轮换导致的消息丢失问题。[PR-14703](https://github.com/apache/pulsar/pull/14703)

#### 问题描述
如果用户配置 `managedLedgerMaxLedgerRolloverTimeMinutes > 0`，并且当 ManagedLedger 状态为 `CreatingLedger` 时发生轮换，那么在此期间写入的消息将会丢失。

#### 解决方案
仅当 ledger 状态为 `LedgerOpened` 时才进行轮换。

### 修复了 Pulsar Proxy 中的端口耗尽和连接问题。[PR-14078](https://github.com/apache/pulsar/pull/14078)

#### 问题描述
Pulsar Proxy 可能进入停止代理 Broker 连接的状态，而 Admin API 代理仍然正常工作。

#### 解决方案
当目标 broker 不活跃时，优化代理连接以快速失败。
修复 Pulsar Proxy 建立连接时的竞态条件，这些条件会导致无效状态和挂起连接。
为代理连接添加连接超时处理。
为传入连接和代理连接添加读取超时处理。

### 修复了由于游标重置期间错过压缩属性导致的压缩数据丢失问题。[PR-16404](https://github.com/apache/pulsar/pull/16404)

#### 问题描述
压缩读取器会搜索最早位置以从 Topic 读取数据，但在游标重置期间错过了压缩属性，这导致初始化的压缩订阅没有压缩范围，因此压缩读取器跳过最后压缩的数据。这只在初始化压缩订阅时发生，可能由负载均衡或手动 Topic 卸载引起。

#### 解决方案
当游标用于数据压缩时，保留重置游标的属性。
当游标前进时（由 managed ledger 内部触发），将属性复制到新的标记删除条目。这不仅适用于压缩的 Topic，内部任务在修剪游标时也不应该丢失属性。

# 接下来是什么？

如果您有兴趣了解更多关于 Pulsar 2.7.5 的信息，现在就可以[下载](https://pulsar.apache.org/en/versions/)并试用！

有关 Apache Pulsar 项目和当前进展的更多信息，请访问 [Pulsar 网站](https://pulsar.apache.org)，在 Twitter 上关注项目 [@apache_pulsar](https://twitter.com/apache_pulsar)，并加入 [Pulsar Slack](https://apache-pulsar.herokuapp.com/)！