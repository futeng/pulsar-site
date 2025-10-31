---
author: Xiaolong Ran
authorURL: https://twitter.com/wolf4j1
title: "Apache Pulsar 2.4.2"
---

我们很自豪地发布 Apache Pulsar 2.4.2。感谢 Apache Pulsar 社区的巨大努力，包含超过 110 个提交，涵盖改进和错误修复。

有关 2.4.2 版本的详细更改，请参考<b>[发布说明](/release-notes/#2.4.2)</b>。

我将在本博客中重点介绍一些改进和错误修复。

<!--truncate-->

## 使用 classLoaders 加载 Java 函数
在 Pulsar 2.4.2 中，无论 Java 函数实例使用 shaded JAR 还是 classLoaders，窗口函数都能正常工作，并且当启用 `--output-serde-classname` 选项时，functionClassLoader 被正确设置。

在 Pulsar 2.4.2 之前，Java 函数实例使用 shaded JAR 启动，并使用不同的 classLoaders 来加载内部 Pulsar 代码、用户代码以及两者相互交互的接口。这一变化导致了两个问题：
- 如果 Java 函数实例使用 classLoaders，窗口函数不能正常工作。
- 当使用 `--output-serde-classname` 选项时，functionClassLoader 没有正确设置。

## 与 Functions worker 一起启动 Broker
在 Pulsar 2.4.2 中，当 broker 客户端启用 TLS 时，我们可以与 Functions worker 一起启动 Broker。在 Pulsar 2.4.2 之前，当我们与 broker 一起运行 Functions worker 时，它会检查 `function_worker.yml` 文件中是否启用了 TLS。如果启用了 TLS，它使用 TLS 端口。但是，当在 Functions worker 上启用 TLS 时，它会检查 `broker.conf`。由于 Functions worker 与 broker 一起运行，检查 `broker.conf` 作为是否使用 TLS 的单一真实来源是合理的。

## 当键不存在时添加错误代码和错误消息
在 Pulsar Functions 中，支持使用 BookKeeper 存储 Functions 的状态。当用户尝试从函数状态中获取不存在的键时，会发生 NPE（NullPointerException）错误。在 Pulsar 2.4.2 中，我们为键不存在的情况添加了错误代码和错误消息。

## 去重
去重基于预持久化的最大序列 ID 删除消息。如果错误被持久化到 BookKeeper，重试尝试会被"去重"，而没有消息被持久化。在 2.4.2 版本中，我们从以下两个方面修复了这个问题：
- 再次检查待处理消息，当重复状态不确定时向生产者返回错误。例如，当消息仍在待处理时。
- 失败后将 lastPushed 映射同步回 lastStored 映射。

## 从最早位置消费数据
在 Pulsar 2.4.2 中，我们为 Pulsar Sinks 添加了 `--subs-position`，因此用户可以从最新和最早位置消费数据。在 2.4.2 版本之前，Pulsar Sinks 中的主题数据默认从最新位置消费，用户无法消费 sink 主题中的最早数据。

## 当订阅类型更改时关闭之前的调度器

在 Pulsar 2.4.2 中，当订阅的类型更改时，会创建一个新的调度器，并关闭旧的调度器，从而避免内存泄漏。在 2.4.2 之前，当主题的订阅类型更改时，会创建一个新的调度器并丢弃旧的调度器，但不会关闭，这会导致内存泄漏。如果游标不是持久的，当所有消费者被移除时，订阅会被关闭并从主题中移除。此时应该关闭调度器。否则，RateLimiter 实例不会被垃圾回收，导致内存泄漏。

## 基于订阅顺序选择活跃消费者
在 Pulsar 2.4.2 中，活跃消费者基于订阅顺序选择。消费者列表中的第一个消费者被选为活跃消费者，不进行排序。在 2.4.2 之前，活跃消费者基于优先级和消费者名称选择。在这种情况下，活跃消费者加入和离开，实际上没有消费者被选举为"活跃"或消费消息。

## 从连接中移除失败的过时生产者
在 Pulsar 2.4.2 中，失败的生产者从连接中被正确移除。在 Pulsar 2.4.2 之前，broker 无法从连接中正确清理旧的失败生产者。当 broker 尝试在失败的生产者中清理 `producer-future` 时，它移除的是新创建的 `producer-future` 而不是旧的失败生产者，在 broker 中出现以下错误。

```text

17:22:00.700 [pulsar-io-21-26] WARN  org.apache.pulsar.broker.service.ServerCnx - [/1.1.1.1:1111][453] Producer with id persistent://prop/cluster/ns/topic is already present on the connection

```

## 为 schema 添加新的 API
在 Pulsar 2.4.2 中，我们为 schema 添加了以下 API：
- `getAllVersions`：返回给定主题的 schema 版本列表。
- `testCompatibility`：能够在不注册 schema 的情况下测试其兼容性。
- `getVersionBySchema`：提供 schema 定义并为其提供 schema 版本。

## 在 consumerImpl 中暴露 `getLastMessageId()` 方法
在 Pulsar 2.4.2 中，我们在 consumerImpl 中暴露了 `getLastMessageId()` 方法。当用户想知道滞后消息或只消费当前时间之前的消息时，这很有好处。

## 在 C++/Go 中添加新的 `send()` 接口
在 Pulsar 2.4.2 中，我们在 C++/Go 中添加了新的 `send()` 接口，因此 `MessageID` 将返回给用户。逻辑与 Java 中的一致。在 Java 客户端中，`MessageId send(byte[] message)` 为用户返回 `MessageId`。

## 订阅失败后取消消费者后台任务
在 Pulsar 2.4.2 中，我们确保消费者后台任务在订阅失败后被取消。在 2.4.2 之前，一些后台消费者任务在 ConsumerImpl 构造函数中启动，但如果消费者创建失败，这些任务不会被取消，留下对这些对象的活跃引用。

## 删除附加了正则表达式消费者的主题
在 Pulsar 2.4.2 中，我们可以删除附加了正则表达式消费者的主题。以下是详细方法。
- 在 CommandSubscribe 中添加一个标志，使正则表达式消费者永远不会触发主题的创建。
- 订阅不存在的主题。当发生特定错误时，消费者被解释为永久失败，从而停止重试。

在 2.4.2 之前，当主题附加了正则表达式消费者时，无法删除主题。原因是正则表达式消费者会立即重新连接并重新创建主题。

## 参考

在[这里](https://pulsar.apache.org/download/)下载 Pulsar 2.4.2。

如果您有任何问题或建议，通过邮件列表或 slack 联系我们。
- [users@pulsar.apache.org](mailto:users@pulsar.apache.org)
- [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org)
- Pulsar slack 频道：https://apache-pulsar.slack.com/
- 您可以在 https://apache-pulsar.herokuapp.com/ 自行注册

期待您对 [Pulsar](https://github.com/apache/pulsar) 的贡献。