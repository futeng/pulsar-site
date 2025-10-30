---
id: concepts-throttling
title: 消息分发节流
sidebar_label: "消息节流"
description: 全面了解 Pulsar 中的消息分发节流。
---

## 概述

### 什么是消息分发节流？

大消息载荷可能导致内存使用激增，从而导致性能下降。Pulsar 采用速率限制节流机制进行消息分发，避免流量激增并提高消息可传递性。你可以设置阈值来限制可以传递给客户端的消息数量和条目的字节大小，当单位时间内的流量超过阈值时阻止后续传递。

例如，当你配置分发速率限制为每秒 10 条消息时，那么每秒可以传递给客户端的消息数量最多为 10 条。

![Pulsar 中的速率限制分发节流](/assets/throttling-dispatch.svg 'message throttling')

### 为什么使用消息分发节流？

消息分发节流详细带来以下好处：

- **限制 broker 对 BookKeeper 的读取请求负载**

  消息持久存储在 BookKeeper 集群中。如果大量读取请求无法使用缓存数据满足，BookKeeper 集群可能变得过于繁忙而无法响应，broker 的 I/O 或 CPU 资源可能被完全占用。使用消息分发节流功能可以调节数据流，以限制 broker 对 BookKeeper 的读取请求负载。

- **在主题/订阅级别平衡 broker 硬件资源的分配**

  broker 实例同时为多个主题提供服务。如果一个主题请求过载，它将消耗几乎所有的 broker I/O、CPU 和内存资源，阻止其他主题被读取。使用消息分发节流功能可以限制 broker 硬件资源在主题间的分配。

- **在主题/订阅级别限制客户端硬件资源的分配**

  当有大量消息积压需要消费时，客户端可能在短时间内接收大量数据，从而垄断其计算资源。由于客户端没有主动限制消费速率的机制，使用消息分发节流功能也可以调节客户端硬件资源的分配。

### 消息分发节流如何工作？

消息分发节流的过程可以分为以下步骤：
1. broker 通过计算剩余配额来近似要从 bookie 读取的条目数量。
2. broker 从 bookie 读取消息。
3. broker 将消息分发给客户端并更新计数器以减少配额。计划任务在节流周期结束时刷新配额。

:::note

- 在步骤 3 之前不能减少配额，因为 broker 在读取数据之前不知道每个条目的实际消息数量或实际条目大小。
- 像`seek`或`redeliver`这样的操作可能会多次向客户端传递消息。broker 将它们计为不同的消息并更新计数器。

:::

## 概念

### 节流级别

你可以在不同级别设置节流消息分发。

级别 | 描述
:-----|:------------
每 broker | 单个 broker 中的所有订阅共享配额。
每主题 | 同一主题中的所有订阅共享配额。<br /><li>如果是非分区主题，配额等于主题可以在单位时间内传递的最大消息数量。</li><li>如果主题有多个分区，配额指的是每个分区可以在单位时间内传递的最大消息数量。换句话说，[分区主题](concepts-messaging.md#partitioned-topics)的实际分发速率限制是配置的 N 倍（N 是主题内的分区数）。例如，主题`t0`有两个分区。如果你将配额设置为`10/s`，那么`t0-p0`和`t0-p1`的速率限制都是`10/s`，而`t0`的总速率限制是`20/s`。请注意，配额不能在分区间共享，但可以在分区内的订阅间共享。</li>
每订阅 | <li>如果是非分区主题，速率限制指的是订阅可以在单位时间内向客户端传递的最大消息数量。</li><li>如果订阅的主题有多个分区，速率限制指的是订阅可以在每个分区在单位时间内传递的最大消息数量。换句话说，订阅对[分区主题](concepts-messaging.md#partitioned-topics)的实际分发速率限制是配置的 N 倍（N 是主题内的分区数）。例如，主题`t1`有两个分区，订阅`s1`。如果你将速率限制设置为`10/s`，那么`s1`在`t1-p0`和`t1-p1`中的速率限制都是`10/s`，而`s1`的总速率限制是`20/s`。</li>

:::note

在多个级别配置的分发速率限制同时生效（逻辑 AND）。

:::

### 节流方法

你可以使用多种节流方法在不同级别配置分发速率限制。

方法 | 每集群 | 每主题 | 每订阅
:--------|:------------|:----------|:----------------
设置 [broker 配置](#throttling-configurations) 或 [动态 broker 配置](admin-api-brokers.md#dynamic-broker-configuration) | <li>`dispatchThrottlingRateInMsg`</li><li>`dispatchThrottlingRateInByte`</li> | <li>`dispatchThrottlingRatePerTopicInMsg`</li><li>`dispatchThrottlingRatePerTopicInByte`</li><br />适用于集群中的所有主题。 | <li>`dispatchThrottlingRatePerSubscriptionInMsg`</li><li>`dispatchThrottlingRatePerSubscriptionInByte`</li><br />适用于集群中的所有订阅。
设置命名空间策略 | N/A | 参考[为主题配置分发节流](admin-api-namespaces.md#configure-dispatch-throttling-for-topics)。 | 参考[为订阅配置分发节流](admin-api-namespaces.md#configure-dispatch-throttling-for-subscription)。
设置主题策略 | N/A | 参考[设置主题级分发速率](pathname:///admin-rest-api/?version=@pulsar:version_number@/#operation/PersistentTopics_setDispatchRate)。 | 参考[设置订阅级分发速率](pathname:///admin-rest-api/?version=@pulsar:version_number@/#operation/PersistentTopics_setSubscriptionDispatchRate)。<br />适用于主题中的所有订阅。

:::note

通过上述三种方法配置的分发速率限制按优先级生效，优先级为"主题策略" > "命名空间策略" > "broker 配置"。例如，如果你使用所有这三种方法为订阅配置了分发速率限制，只有通过"主题策略"配置的生效。

:::

### 节流配置

下表概述了你可以在`conf/broker.conf`文件中为消息分发节流配置的参数。

参数 | 描述 | 默认值
:---------|:------------|:-------------
dispatchThrottlingRateInMsg | 每集群每个节流周期可以传递的消息总数。<br /><br />要设置主题级或订阅级，配置`dispatchThrottlingRatePerTopicInMsg`或`dispatchThrottlingRatePerSubscriptionInMsg`。 | '-1'，表示无限制。
dispatchThrottlingRateInByte | 每集群每个节流周期可以传递的消息总字节大小。<br /><br />要设置主题级或订阅级，配置`dispatchThrottlingRatePerTopicInByte`或`dispatchThrottlingRatePerSubscriptionInByte`。 | '-1'，表示无限制。
ratePeriodInSecond | 分发节流的时间周期（秒）。计数器在周期结束时重置。<br />例如，如果你想配置速率限制为`每分钟 10,000 条消息`，你需要将`ratePeriodInSecond`设置为`60`，将`dispatchThrottlingRateInMsg`设置为`10,000`。 | 1（秒）
preciseDispatcherFlowControl | 是否对分发节流应用精确控制。默认情况下禁用，这意味着 broker 使用剩余的`consumer.receiverQueueSize`（默认为 1000）和`dispatcherMaxReadBatchSize`（默认为 100）之间的最小值来近似`要从 bookie 读取的消息数量`。<br /><br />当设置为`true`时，broker 通过以下方程近似$$要从 \ bookie \ 读取的 \ 条目 \ 数量$$：<br /><br />$$要从 \ bookie \ 读取的 \ 条目 \ 数量 = {{要 \ 读取的 \ 消息 \ 数量} \over{每个 \ 条目 \ 的 \ 平均 \ 消息 \ 数量}}$$<br /><br />例如，假设你设置了速率限制为`10/s`。当每个条目的平均消息数量为`6`时，这意味着 broker 每秒读取 2 个条目，要读取的消息总数超过配额。然而，当设置为`false`时，broker 读取 10 个条目（约 60 条消息），这更超过配额。 | false
dispatchThrottlingOnBatchMessageEnabled | 是否按条目（批处理）计算消息。默认情况下禁用。<br /><br />请注意，将其设置为`true`可能导致消息总数近似不准确，但保持对 bookie 的稳定读取请求的同时最大化 Pulsar 的吞吐量。例如，假设你设置了速率限制为`10/s`，如果你将`dispatchThrottlingOnBatchMessageEnabled`设置为`true`，broker 只读取 10 个条目并每秒传递给客户端，不管每个条目的消息数量。 | false
dispatchThrottlingOnNonBacklogConsumerEnabled | 是否启用对非积压消费者的分发节流。默认情况下启用。<br />当设置为`false`时：<br /><li>如果一个订阅中的所有消费者都没有积压，即使配置了`dispatchThrottlingRateInMsg`和`dispatchThrottlingRateInByte`，消息分发节流也会自动关闭。</li><li>如果至少有一个消费者有积压，节流会自动开启。</li> | true

:::note

- 你可以同时使用`dispatchThrottlingRateInMsg`和`dispatchThrottlingRateInByte`（逻辑 AND）。
- 确保一次只启用`preciseDispatcherFlowControl`和`dispatchThrottlingOnBatchMessageEnabled`中的一个，因为它们互斥。这两个参数都可以用来改善过度传递问题（参见[限制](#limitations)）。它们之间的区别是：
  - 当启用`preciseDispatcherFlowControl`时，Pulsar 考虑每个条目的消息数量。此参数在 broker 从 bookie 读取条目时生效。
  - 当启用`dispatchThrottlingOnBatchMessageEnabled`时，Pulsar 忽略每个条目的消息数量。此参数在 broker 向客户端发送消息后更新计数器时生效。

:::

## 消息分发节流的限制

消息分发节流可能由于以下原因导致单位时间内消息过度传递：

1. **broker 可能从 bookie 读取比节流限制更多的条目或字节。**

   a) **传递给客户端的消息字节大小可能超过配置的阈值。**

     当你以字节/节流周期设置分发速率限制（`dispatchThrottlingRateInByte`/`ratePeriodInSecond`）时，broker 通过以下方程计算一个节流周期内$$要从 \ bookie \ 读取的 \ 条目 \ 数量$$：

     $$
     要从 \ bookie \ 读取的 \ 条目 \ 数量 = {{要 \ 读取的 \ 总 \ 字节 \ 大小} \over{每个 \ 条目 \ 的 \ 平均 \ 字节 \ 大小}}
     $$

     通过控制$$要从 \ bookie \ 读取的 \ 条目 \ 数量$$，broker 尝试在每个节流周期内将`要读取的总字节大小`限制在`分发速率`以下。它以`条目`为单位从 bookie 读取消息，并在读取之前近似下一个要读取条目的字节，因为它不知道每个条目的确切字节大小。

     broker 使用以下两个指标来获取每个条目的平均字节大小：

      * 平均发布大小（`brk_ml_EntrySizeBuckets`）：当 broker 接收到发布请求时存储在 bookie 中的每个条目的平均字节大小。

      * 平均分发大小（`entriesReadSize`/`entriesReadCount`）：从 bookie 读取的每个条目的平均字节大小，即发送给客户端的每个条目的平均字节大小。

     broker 优先使用平均发布大小而不是平均分发大小。如果平均发布大小不可用，则使用平均分发大小。当两个指标都不可用时，broker 在第一次尝试时只读取一个条目。

   b) **传递给客户端的消息数量可能超过配置的阈值。**

     当你以消息数量/节流周期设置分发速率限制（`dispatchThrottlingRateInMsg`/`ratePeriodInSecond`）并启用批处理（`batch-send`）时，broker 将一个条目计为一条消息（不管每个条目的消息数量）并通过以下方程计算$$要从 \ bookie \ 读取的 \ 条目 \ 数量$$：

     $$
     要从 \ bookie \ 读取的 \ 条目 \ 数量 = {{要 \ 读取的 \ 消息 \ 总数} \over{每个 \ 条目 \ 的 \ 平均 \ 消息 \ 数量} \ (=1)}
     $$

     由于每个条目有一定数量的消息，传递给客户端的消息数量总是超过或等于配置的阈值。

   **解决方法**

   配置`preciseDispatcherFlowControl`或`dispatchThrottlingOnBatchMessageEnabled`可以缓解过度传递问题。例如，开启`preciseDispatcherFlowControl`可以通过使用近似的每个条目平均消息数量预先减少配额来缓解限制。有关详细信息，请参见[节流配置](#throttling-configurations)。

2. **并发节流过程可能不会及时减少配额。**

   如[工作原理](#how-it-works)中介绍，分发节流过程是`1.获取剩余配额` $$\to$$ `2.加载数据` $$\to$$ `3.减少配额`。

   当同一订阅中的两个进程"分发重放消息（process-R）"和"分发非重放消息（process-N）"并发执行时，它们的节流过程可以按以下顺序交织：

     1) process-R：`1.获取剩余配额`

     2) process-R：`2.加载数据`

     3) process-N：`1.获取剩余配额`

     4) process-N：`2.加载数据`

     5) process-R：`3.减少配额`

     6) process-N：`3.减少配额`

   结果，分发的消息总数可能超过配额。

   :::note

   当发生过度传递，并且传递的消息数量在当前周期超过配额时，下一个周期的配额将相应减少。例如，如果速率限制设置为`10/s`，在第一个周期已向客户端传递了`11`条消息，那么在下一个周期最多只能向客户端传递`9`条消息；如果在最后一个周期传递了 30 条消息，接下来两个周期要传递的消息数量为`0`。

   ![Pulsar 节流周期内发生过度传递](/assets/throttling-limitation.svg)

   :::