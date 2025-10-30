---
id: txn-what
title: What are transactions?
sidebar_label: "Concept"
escription: Get a comprehensive understanding of transactions in Pulsar.
---

事务增强了 Apache Pulsar 的消息传递语义和 [Pulsar Functions 的处理保证](functions-concepts.md#processing-guarantees-and-subscription-types)。Pulsar 事务 API 支持跨多个 Topic 的原子写入和确认。

事务允许：

- 生产者向多个 Topic 发送一批消息，其中批次中的所有消息最终对任何消费者可见，或者没有消息对消费者可见。

- 端到端恰好一次语义（恰好执行一次 `consume-process-produce` 操作）。

## 事务语义

Pulsar 事务具有以下语义：

* 事务中的所有操作作为单个单元提交。

  * 要么所有消息都被提交，要么没有消息被提交。

  * 每条消息只被写入或处理一次，没有数据丢失或重复（即使在发生故障的情况下）。

  * 如果事务被中止，此事务中的所有写入和确认都会回滚。

* 事务中的一组消息可以从多个分区接收、向多个分区生产并由多个分区确认。

  * 只允许消费者读取已提交（已确认）的消息。换句话说，broker 不传递属于开放事务的事务消息或属于已中止事务的消息。

  * 跨多个分区的消息写入是原子的。

  * 跨多个订阅的消息确认是原子的。当使用事务 ID 确认消息时，消息在订阅下只能被消费者成功确认一次。

## 事务和流处理

Pulsar 上的流处理是对 Pulsar Topic 的 `consume-process-produce` 操作：

* `Consume`：运行 Pulsar 消费者的源操作符从一个或多个 Pulsar Topic 读取消息。

* `Process`：处理操作符转换消息。

* `Produce`：运行 Pulsar 生产者的接收器操作符将结果消息写入一个或多个 Pulsar Topic。

![Stream processing on Pulsar](/assets/txn-2.png)

Pulsar 事务支持端到端恰好一次的流处理，这意味着消息不会从源操作符丢失，消息也不会重复到接收器操作符。

## 用例

在 Pulsar 2.8.0 之前，没有简单的方法可以使用 Pulsar 构建流处理应用程序来实现恰好一次的处理保证。随着 Pulsar 2.8.0 中引入事务，以下服务支持恰好一次语义：

* [Pulsar Flink 连接器](https://flink.apache.org/2021/01/07/pulsar-flink-connector-270.html)

  在 Pulsar 2.8.0 之前，如果您想使用 Pulsar 和 Flink 构建流应用程序，Pulsar Flink 连接器只支持恰好一次的源连接器和至少一次的接收器连接器，这意味着端到端的最高处理保证是至少一次，流应用程序的结果消息有可能向 Pulsar 中的结果 Topic 产生重复消息。

  随着 Pulsar 2.8.0 中引入事务，Pulsar Flink 接收器连接器可以通过实现指定的 `TwoPhaseCommitSinkFunction` 并将 Flink 接收器消息生命周期与 Pulsar 事务 API 挂钩来支持恰好一次语义。

* 对 Pulsar Functions 和其他连接器的支持将在未来版本中添加。