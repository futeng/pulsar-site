---
id: transactions-api
title: Transactions API
sidebar_label: "Transactions API"
---

事务中的所有消息只有在事务提交后才对消费者可用。如果事务被中止，则此事务中的所有写入和确认都会回滚。

## 前提条件
1. 要在 Pulsar 中启用事务，您需要在 `broker.conf` 文件或 `standalone.conf` 文件中配置参数。

```conf
transactionCoordinatorEnabled=true
```

2. 初始化事务协调器元数据，以便事务协调器可以利用分区主题的优势，如负载均衡。

```shell
bin/pulsar initialize-transaction-coordinator-metadata -cs 127.0.0.1:2181 -c standalone
```

初始化事务协调器元数据后，您可以使用事务 API。以下 API 可用。

## 初始化 Pulsar 客户端

您可以为事务客户端启用事务并初始化事务协调器客户端。

```java
PulsarClient pulsarClient = PulsarClient.builder()
        .serviceUrl("pulsar://localhost:6650")
        .enableTransaction(true)
        .build();
```

## 启动事务
您可以通过以下方式启动事务。

```java
Transaction txn = pulsarClient
        .newTransaction()
        .withTransactionTimeout(5, TimeUnit.MINUTES)
        .build()
        .get();
```

## 生产事务消息

生产新的事务消息时需要事务参数。Pulsar 中事务消息的语义是 `read-committed`（读已提交），因此在事务提交之前，消费者无法接收正在进行的消息。

```java
producer.newMessage(txn).value("Hello Pulsar Transaction".getBytes()).sendAsync();
```

## 使用事务确认消息

事务确认需要事务参数。事务确认将消息状态标记为待确认状态。当事务提交时，待确认状态变为已确认状态。如果事务被中止，待确认状态变为未确认状态。

```
Message<byte[]> message = consumer.receive();
consumer.acknowledgeAsync(message.getMessageId(), txn);
```

## 提交事务

当事务提交时，消费者接收事务消息，待确认状态变为已确认状态。

```java
txn.commit().get();
```

## 中止事务

当事务被中止时，事务确认被取消，待确认的消息被重新传递。

```java
txn.abort().get();
```

### 示例
以下示例显示如何在事务中处理消息。

```java
PulsarClient pulsarClient = PulsarClient.builder()
        .serviceUrl(getPulsarServiceList().get(0).getBrokerServiceUrl())
        .statsInterval(0, TimeUnit.SECONDS)
        .enableTransaction(true)
        .build();

String sourceTopic = "public/default/source-topic";
String sinkTopic = "public/default/sink-topic";

Producer<String> sourceProducer = pulsarClient
        .newProducer(Schema.STRING)
        .topic(sourceTopic)
        .create();
sourceProducer.newMessage().value("hello pulsar transaction").sendAsync();

Consumer<String> sourceConsumer = pulsarClient
        .newConsumer(Schema.STRING)
        .topic(sourceTopic)
        .subscriptionName("test")
        .subscriptionType(SubscriptionType.Shared)
        .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
        .subscribe();

Producer<String> sinkProducer = pulsarClient
        .newProducer(Schema.STRING)
        .topic(sinkTopic)
        .sendTimeout(0, TimeUnit.MILLISECONDS)
        .create();

Transaction txn = pulsarClient
        .newTransaction()
        .withTransactionTimeout(5, TimeUnit.MINUTES)
        .build()
        .get();

// 源消息确认和汇消息生产属于一个事务，
// 它们被组合成一个原子操作。
Message<String> message = sourceConsumer.receive();
sourceConsumer.acknowledgeAsync(message.getMessageId(), txn);
sinkProducer.newMessage(txn).value("sink data").sendAsync();

txn.commit().get();
```

## 在事务中启用批量消息

要在事务中启用批量消息，您需要启用批量索引确认功能。事务确认检查批量索引确认是否冲突。

要启用批量索引确认，您需要在 `broker.conf` 或 `standalone.conf` 文件中将 `acknowledgmentAtBatchIndexLevelEnabled` 设置为 `true`。

```conf
acknowledgmentAtBatchIndexLevelEnabled=true
```

然后您需要在消费者构建器中调用 `enableBatchIndexAcknowledgment(true)` 方法。

```java
Consumer<byte[]> sinkConsumer = pulsarClient
        .newConsumer()
        .topic(transferTopic)
        .subscriptionName("sink-topic")
        .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
        .subscriptionType(SubscriptionType.Shared)
        .enableBatchIndexAcknowledgment(true) // 启用批量索引确认
        .subscribe();
```