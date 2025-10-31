---
title: "Apache Pulsar 2.9.3 的新功能"
date: 2022-07-27
author: "mattisonchao, momo-jun"
---

Apache Pulsar 社区发布了 2.9.3 版本！50 位贡献者提供了改进和错误修复，共计 200+ 个提交。感谢您的所有贡献。

2.9.3 版本的亮点是引入了 30+ 个事务修复和改进。早期采用 Pulsar 事务的用户已经在生产环境中记录了长期使用情况，并在实际应用中报告了有价值的发现。这为 Pulsar 社区提供了产生影响的机会。

本博客将介绍最值得注意的更改。有关包含所有功能增强和错误修复的完整列表，请查看 [Pulsar 2.9.3 发布说明](https://pulsar.apache.org/release-notes/versioned/pulsar-2.9.3/)。

<!--truncate-->

### 启用游标数据压缩以减少持久游标数据大小。[14542](https://github.com/apache/pulsar/pull/14542)

#### 问题
游标数据由 ZooKeeper/Etcd 元数据存储管理。当数据大小增加时，拉取数据可能需要太多时间，并且 broker 可能最终会向 ZooKeeper/Etcd 元数据存储写入大块数据。

#### 解决方案
提供启用压缩机制的能力以减少游标数据大小和拉取时间。

### 减少 `metadataPositions` 占用的内存并避免 OOM。[15137](https://github.com/apache/pulsar/pull/15137)

#### 问题
MLPendingAckStore 中的映射 `metadataPositions` 用于清除 PendingAck 中的无用数据，其中键是持久化在 PendingAck 中的位置，值是操作确认的最大位置。它判断最大订阅游标位置是否小于订阅游标的 `markDeletePosition`。如果最大位置较小，则日志游标将标记删除该位置。这导致两个主要问题：
* 在正常情况下，这个映射存储所有事务确认操作。这是对内存和 CPU 的浪费。
* 如果一个长时间未提交的事务确认了较后位置的消息，映射将不会被清理，最终导致 OOM（内存不足）。

#### 解决方案
根据特定规则定期存储少量数据。有关更详细的实现，请参考 [PIP-153](https://github.com/apache/pulsar/issues/15073)。

### 在将事务条目附加到事务缓冲区之前检查 `lowWaterMark`。[15424](https://github.com/apache/pulsar/pull/15424)

#### 问题
当客户端使用先前提交的事务发送消息时，这些消息意外地对消费者可见。

#### 解决方案
添加一个映射来存储事务协调器在事务缓冲区中的 `lowWaterMark`，并在将事务条目附加到事务缓冲区之前检查 `lowWaterMark`。因此，当使用无效事务发送消息时，客户端将收到 `NotAllowedException`。

### 修复了消费性能回归问题。[PR-15162](https://github.com/apache/pulsar/pull/15162)

#### 问题
这个性能回归问题在 2.10.0、2.9.1 和 2.8.3 中引入。在使用 Java 客户端时，您可能会发现消息监听器的性能显著下降。根本原因是每条消息都会引入从外部线程池到内部线程池轮询，然后再到外部线程池的线程切换。

#### 解决方案
避免每条消息的线程切换以提高消费吞吐量。

### 修复了主题创建的死锁问题。[PR-15570](https://github.com/apache/pulsar/pull/15570)

#### 问题
这个死锁问题发生在主题创建期间，通过尝试从同一线程重新获取相同的 `StampedLock` 来删除它。这将导致主题停止服务很长时间，最终在去重或地理复制检查中失败。变通方法是重启 broker。

### 优化了 broker 的内存使用。

#### 问题
Pulsar 有一些内部数据结构，如 `ConcurrentLongLongPairHashMap` 和 `ConcurrentLongPairHashMap`，可以减少内存使用而不是使用装箱类型。然而，在早期版本中，即使数据被删除，数据结构也不支持收缩，这在某些情况下浪费了一定量的内存。

**Pull requests**
* https://github.com/apache/pulsar/pull/15354
* https://github.com/apache/pulsar/pull/15342
* https://github.com/apache/pulsar/pull/14663
* https://github.com/apache/pulsar/pull/14515
* https://github.com/apache/pulsar/pull/14497

#### 解决方案
支持内部数据结构的收缩，如 `ConcurrentSortedLongPairSet`、`ConcurrentOpenHashMap` 等。

# 下一步是什么？

如果您有兴趣了解更多关于 Pulsar 2.9.3 的信息，您可以立即[下载](https://pulsar.apache.org/versions/)并试用！

**Pulsar Summit San Francisco 2022** 将于 2022 年 8 月 18 日举行。[立即注册](https://pulsar-summit.org/)，并通过在社交媒体上传播消息来帮助我们取得更大的成功！

有关 Apache Pulsar 项目和当前进展的更多信息，请访问
[Pulsar 网站](https://pulsar.apache.org)，在 Twitter
[@apache_pulsar](https://twitter.com/apache_pulsar) 上关注项目，并加入 [Pulsar Slack](https://apache-pulsar.herokuapp.com/)！