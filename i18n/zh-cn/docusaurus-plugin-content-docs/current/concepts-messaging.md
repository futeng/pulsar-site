---
id: concepts-messaging
title: 消息传递
sidebar_label: "消息传递"
description: 全面了解 Pulsar 内的基本消息传递概念，包括主题、命名空间、订阅等。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


Pulsar 基于[发布-订阅](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)模式构建（通常缩写为 pub-sub）。在此模式中，[生产者](concepts-clients.md#producer)向[主题](#topics)发布消息；[消费者](concepts-clients.md#consumer)[订阅](#subscriptions)这些主题，处理传入的消息，并在处理完成时向 broker 发送[确认](#acknowledgment)。

![Pulsar 中的发布-订阅模式](/assets/pub-sub-border.svg)

当创建订阅时，Pulsar 会[保留](concepts-architecture-overview.md#persistent-storage)所有消息，即使消费者断开连接。只有当消费者确认所有这些消息都已成功处理时，保留的消息才会被丢弃。

如果消息消费失败，并且你希望此消息被再次消费，可以启用[消息重新投递机制](#message-redelivery)来请求 broker 重新发送此消息。

## 消息

消息是 Pulsar 的基本"单元"。它们是生产者发布到主题的内容，也是消费者从主题消费的内容。下表列出了消息的组件。

| 组件              | 描述                                                                                                                                                                                                                                                                                                                                                                                                                    |
|:-------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 值/数据载荷       | 消息携带的数据。所有 Pulsar 消息都包含原始字节，尽管消息数据也可以符合数据[模式](schema-get-started.md)。                                                                                                                                                                                                                                                                                                               |
| 键                | 消息的键（字符串类型）。它是消息键或分区键的简称。消息可以选择性地用键标记，这对[主题压缩](concepts-topic-compaction.md)等功能很有用。                                                                                                                                                                                                                                                                                   |
| 属性              | 用户定义属性的可选键/值映射。                                                                                                                                                                                                                                                                                                                                                                                         |
| 生产者名称        | 生产消息的生产者的名称。如果未指定生产者名称，则使用默认名称。                                                                                                                                                                                                                                                                                                                                                       |
| 主题名称          | 消息发布到的主题名称。                                                                                                                                                                                                                                                                                                                                                                                                |
| 模式版本          | 消息生产时使用的模式版本号。                                                                                                                                                                                                                                                                                                                                                                                          |
| 序列 ID           | 每个 Pulsar 消息都属于其主题上的有序序列。消息的序列 ID 最初由其生产者分配，指示其在该序列中的顺序，也可以自定义。<br />序列 ID 可用于消息去重。如果`brokerDeduplicationEnabled`设置为`true`，则每个消息的序列 ID 在主题（非分区）的生产者或分区内是唯一的。                                                                       |
| 消息 ID           | 消息的消息 ID 在消息持久存储后立即由 bookie 分配。消息 ID 指示消息在Ledger中的特定位置，在 Pulsar 集群内是唯一的。                                                                                                                                                                                                                                                                                                      |
| 发布时间          | 消息发布时的时间戳。时间戳由生产者自动应用。                                                                                                                                                                                                                                                                                                                                                                          |
| 事件时间          | 由应用程序附加到消息的可选时间戳。例如，应用程序在处理消息时附加时间戳。如果未设置事件时间，则值为`0`。                                                                                                                                                                                                                                                                                                                |

消息的默认最大大小为 5 MB。你可以使用以下配置选项配置消息的最大大小。

- 在`broker.conf`文件中。

  ```bash
  # 消息的最大大小（字节）。
  maxMessageSize=5242880
  ```

- 在`bookkeeper.conf`文件中。

  ```bash
  # netty 帧的最大大小（字节）。任何大于此值的接收消息都会被拒绝。默认值为 5 MB。
  nettyMaxFrameSizeBytes=5253120
  ```

> 有关 Pulsar 消息的更多信息，请参见 Pulsar[二进制协议](developing-binary-protocol.md)。

### 确认

消息确认是消费者在成功消费消息后发送给 broker 的确认。然后，此消费的消息将被永久存储，并且只有在所有订阅都确认后才会被删除。确认（ack）是 Pulsar 知道消息可以从系统中删除的方式。如果你想存储已被消费者确认的消息，需要配置[消息保留策略](concepts-messaging.md#message-retention-and-expiry)。

对于批处理消息，可以启用批索引确认以避免向消费者投递已确认的消息。有关批索引确认的详细信息，请参见[批处理](#batching)。

消息可以通过以下两种方式之一进行确认：

- 单独确认

  使用单独确认时，消费者确认每条消息并向 broker 发送确认请求。

- 累积确认

  使用累积确认时，消费者**仅**确认它接收到的最后一条消息。流中直到（并包括）所提供消息的所有消息都不会重新投递给该消费者。

如果要单独确认消息，可以使用以下 API。

```java
consumer.acknowledge(msg);
```

如果要累积确认消息，可以使用以下 API。

```java
consumer.acknowledgeCumulative(msg);
```

:::note

累积确认不能用于[共享或 Key_shared 订阅类型](#subscription-types)，因为共享或 Key_Shared 订阅类型涉及多个消费者访问同一订阅。在共享和 Key_Shared 订阅类型中，应该单独确认消息。

:::

### 否定确认

[否定确认](#negative-acknowledgment)机制允许你向 broker 发送通知，指示消费者未处理消息。当消费者未能消费消息并需要重新消费时，消费者向 broker 发送否定确认（nack），触发 broker 重新向消费者投递此消息。

消息可以单独或累积地进行否定确认，具体取决于消费订阅类型。

在独占和故障转移订阅类型中，消费者只否定确认他们接收到的最后一条消息。

在共享和 Key_Shared 订阅类型中，消费者可以单独否定确认消息。

请注意，有序订阅类型（如独占、故障转移和 Key_Shared）的否定确认可能导致失败的消息按非原始顺序发送给消费者。

如果要对消息使用否定确认，确保在确认超时之前对其进行否定确认。

使用以下 API 对消息消费进行否定确认。

```java
Consumer<byte[]> consumer = pulsarClient.newConsumer()
                .topic(topic)
                .subscriptionName("sub-negative-ack")
                .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
                .negativeAckRedeliveryDelay(2, TimeUnit.SECONDS) // 默认值为 1 分钟
                .subscribe();

Message<byte[]> message = consumer.receive();

// 调用 API 发送否定确认
consumer.negativeAcknowledge(message);

message = consumer.receive();
consumer.acknowledge(message);
```

要以不同延迟重新投递消息，可以通过设置消息重试次数使用**重新投递退避机制**。
使用以下 API 启用`否定重新投递退避`。

```java
Consumer<byte[]> consumer = pulsarClient.newConsumer()
        .topic(topic)
        .subscriptionName("sub-negative-ack")
        .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
        .negativeAckRedeliveryBackoff(MultiplierRedeliveryBackoff.builder()
            .minDelayMs(1000)
            .maxDelayMs(60 * 1000)
            .multiplier(2)
            .build())
        .subscribe();
```

消息重新投递行为应如下所示。

| 重新投递次数 | 重新投递延迟 |
|:-------------|:-------------|
| 1            | 1 秒         |
| 2            | 2 秒         |
| 3            | 4 秒         |
| 4            | 8 秒         |
| 5            | 16 秒        |
| 6            | 32 秒        |
| 7            | 60 秒        |
| 8            | 60 秒        |

:::note

如果启用了批处理，则一个批次中的所有消息都会重新投递给消费者。

:::

### 确认超时

:::note

默认情况下，确认超时是禁用的，这意味着发送给消费者的消息不会重新投递，除非消费者崩溃。

:::

确认超时机制允许你设置一个时间范围，在此期间客户端跟踪未确认的消息。在此确认超时（`ackTimeout`）期之后，客户端向 broker 发送`重新投递未确认消息`请求，因此 broker 将未确认的消息重新发送给消费者。

你可以配置确认超时机制，在`ackTimeout`之后未确认的消息重新投递，或在每个`ackTimeoutTickTime`期间执行计时器任务来检查确认超时的消息。

你也可以使用重新投递退避机制，通过设置消息重试次数来以不同延迟重新投递消息。

如果要使用重新投递退避，可以使用以下 API。

```java
consumer.ackTimeout(10, TimeUnit.SECOND)
        .ackTimeoutRedeliveryBackoff(MultiplierRedeliveryBackoff.builder()
            .minDelayMs(1000)
            .maxDelayMs(60 * 1000)
            .multiplier(2)
            .build());
```

消息重新投递行为应如下所示。

| 重新投递次数 | 重新投递延迟 |
|:-------------|:-------------|
| 1            | 10 + 1 秒    |
| 2            | 10 + 2 秒    |
| 3            | 10 + 4 秒    |
| 4            | 10 + 8 秒    |
| 5            | 10 + 16 秒   |
| 6            | 10 + 32 秒   |
| 7            | 10 + 60 秒   |
| 8            | 10 + 60 秒   |

:::note

- 如果启用了批处理，则一个批次中的所有消息都会重新投递给消费者。
- 与确认超时相比，否定确认是首选。首先，很难设置超时值。其次，当消息处理时间超过确认超时时，broker 会重新发送消息，但这些消息可能不需要重新消费。

:::

使用以下 API 启用确认超时。

```java
Consumer<byte[]> consumer = pulsarClient.newConsumer()
                .topic(topic)
                .ackTimeout(2, TimeUnit.SECONDS) // 默认值为 0
                .ackTimeoutTickTime(1, TimeUnit.SECONDS)
                .subscriptionName("sub")
                .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
                .subscribe();

Message<byte[]> message = consumer.receive();

// 等待至少 2 秒
message = consumer.receive();
consumer.acknowledge(message);
```

### 重试信件主题

重试信件主题允许你存储消费失败的消息并在以后重试消费。使用此方法，你可以自定义消息重新投递的时间间隔。原始主题上的消费者也会自动订阅重试信件主题。一旦达到最大重试次数，未消费的消息将被移动到[死信主题](#dead-letter-topic)进行手动处理。重试信件主题的功能由消费者实现。

下图说明了重试信件主题的概念。
![重试信件主题概念](/assets/retry-letter-topic.svg)

使用重试信件主题的意图与使用[延迟消息传递](#delayed-message-delivery)不同，尽管两者都旨在稍后消费消息。重试信件主题通过消息重新投递来服务故障处理，以确保关键数据不会丢失，而延迟消息传递旨在以指定的时间延迟传递消息。

默认情况下，自动重试是禁用的。你可以将`enableRetry`设置为`true`来为消费者启用自动重试。

使用以下 API 从重试信件主题消费消息。当达到`maxRedeliverCount`的值时，未消费的消息被移动到死信主题。

```java
Consumer<byte[]> consumer = pulsarClient.newConsumer(Schema.BYTES)
                .topic("my-topic")
                .subscriptionName("my-subscription")
                .subscriptionType(SubscriptionType.Shared)
                .enableRetry(true)
                .deadLetterPolicy(DeadLetterPolicy.builder()
                        .maxRedeliverCount(maxRedeliveryCount)
                        .build())
                .subscribe();
```

默认重试信件主题使用以下格式：

```text
<topicname>-<subscriptionname>-RETRY
```

:::note

- 对于 Pulsar 2.6.x 和 2.7.x，默认重试信件主题使用`<subscriptionname>-RETRY`格式。如果你从 2.6.x~2.7.x 升级到 2.8.x 或更高版本，需要删除历史重试信件主题和重试信件分区主题。否则，Pulsar 将继续使用原始主题，格式为`<subscriptionname>-RETRY`。
- 不建议使用`<subscriptionname>-RETRY`，因为如果同一命名空间下的多个主题具有相同的订阅，则多个主题的重试消息主题名称可能相同，这将导致相互消费。

:::

使用 Java 客户端指定重试信件主题的名称并配置重试信件主题的生产者。

```java
// 为重试信件主题生产者启用批处理并禁用分块
// 默认情况下，批处理功能被禁用，分块功能被启用
DeadLetterProducerBuilderCustomizer producerBuilderCustomizer = (context, producerBuilder) -> {
    producerBuilder.enableBatching(true);
    producerBuilder.enableChunking(false);
};
Consumer<byte[]> consumer = pulsarClient.newConsumer(Schema.BYTES)
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Shared)
        .enableRetry(true)
        .deadLetterPolicy(DeadLetterPolicy.builder()
                .maxRedeliverCount(maxRedeliveryCount)
                .retryLetterTopic("my-retry-letter-topic-name")
                .retryLetterProducerBuilderCustomizer(producerBuilderCustomizer)
                .build())
        .subscribe();
```

重试信件主题中的消息包含一些由客户端自动创建的特殊属性。

| 特殊属性           | 描述                                     |
|:--------------------|:------------------------------------------|
| `REAL_TOPIC`        | 真实主题名称。                            |
| `ORIGIN_MESSAGE_ID` | 原始消息 ID。它对消息跟踪至关重要。       |
| `RECONSUMETIMES`    | 重试消费消息的次数。                      |
| `DELAY_TIME`        | 消息重试间隔（毫秒）。                    |

**示例**

```conf
REAL_TOPIC = persistent://public/default/my-topic
ORIGIN_MESSAGE_ID = 1:0:-1:0
RECONSUMETIMES = 6
DELAY_TIME = 3000
```

使用以下 API 将消息存储在重试队列中。

```java
consumer.reconsumeLater(msg, 3, TimeUnit.SECONDS);
```

使用以下 API 为`reconsumeLater`函数添加自定义属性。在下一次消费尝试中，可以从 message#getProperty 获取自定义属性。

```java
Map<String, String> customProperties = new HashMap<String, String>();
customProperties.put("custom-key-1", "custom-value-1");
customProperties.put("custom-key-2", "custom-value-2");
consumer.reconsumeLater(msg, customProperties, 3, TimeUnit.SECONDS);
```

:::note

* 目前，重试信件主题在共享订阅类型中启用。
* 与否定确认相比，重试信件主题更适合需要大量重试且具有可配置重试间隔的消息。因为重试信件主题中的消息持久化到 BookKeeper，而由于否定确认需要重试的消息缓存在客户端。

:::

### 死信主题

死信主题允许你即使在某些消息消费不成功的情况下也能继续消息消费。未能消费的消息存储在特定的主题中，称为死信主题。死信主题的功能由消费者实现。你可以决定如何处理死信主题中的消息。

使用默认死信主题在 Java 客户端中启用死信主题。

```java
Consumer<byte[]> consumer = pulsarClient.newConsumer(Schema.BYTES)
                .topic("my-topic")
                .subscriptionName("my-subscription")
                .subscriptionType(SubscriptionType.Shared)
                .deadLetterPolicy(DeadLetterPolicy.builder()
                      .maxRedeliverCount(maxRedeliveryCount)
                      .build())
                .subscribe();
```

默认死信主题使用以下格式：

```
<topicname>-<subscriptionname>-DLQ
```

死信 producerName 使用以下格式：

```
<topicname>-<subscriptionname>-<consumername>-<randomstring>-DLQ
```

:::note
- 对于 Pulsar 2.6.x 和 2.7.x，默认死信主题使用`<subscriptionname>-DLQ`格式。如果你从 2.6.x~2.7.x 升级到 2.8.x 或更高版本，需要删除历史死信主题和重试信件分区主题。否则，Pulsar 将继续使用原始主题，格式为`<subscriptionname>-DLQ`。
- 不建议使用`<subscriptionname>-DLQ`，因为如果同一命名空间下的多个主题具有相同的订阅，则多个主题的死信消息主题名称可能相同，这将导致相互消费。
- 从 Pulsar 2.3.x 到 2.10.x，Java SDK 死信策略将在没有用户定义确认超时时设置 30 秒确认超时。自 3.0.x 起，此默认超时策略已被移除。
:::

使用 Java 客户端指定死信主题的名称并配置重试/死信主题的生产者。

```java
// 为死信主题生产者启用批处理并禁用分块
// 默认情况下，批处理功能被禁用，分块功能被启用
DeadLetterProducerBuilderCustomizer producerBuilderCustomizer = (context, producerBuilder) -> {
    producerBuilder.enableBatching(true);
    producerBuilder.enableChunking(false);
};
Consumer<byte[]> consumer = pulsarClient.newConsumer(Schema.BYTES)
                .topic("my-topic")
                .subscriptionName("my-subscription")
                .subscriptionType(SubscriptionType.Shared)
                .deadLetterPolicy(DeadLetterPolicy.builder()
                      .maxRedeliverCount(maxRedeliveryCount)
                      .deadLetterTopic("my-dead-letter-topic-name")
                      .deadLetterProducerBuilderCustomizer(producerBuilderCustomizer)
                      .retryLetterProducerBuilderCustomizer(producerBuilderCustomizer)
                      .build())
                .subscribe();
```

默认情况下，DLQ 主题创建期间没有订阅。如果没有对 DLQ 主题的及时订阅，你可能会丢失消息。要为 DLQ 自动创建初始订阅，可以指定`initialSubscriptionName`参数。如果设置了此参数但 broker 的`allowAutoSubscriptionCreation`被禁用，DLQ 生产者将无法创建。

```java
Consumer<byte[]> consumer = pulsarClient.newConsumer(Schema.BYTES)
                .topic("my-topic")
                .subscriptionName("my-subscription")
                .subscriptionType(SubscriptionType.Shared)
                .deadLetterPolicy(DeadLetterPolicy.builder()
                      .maxRedeliverCount(maxRedeliveryCount)
                      .deadLetterTopic("my-dead-letter-topic-name")
                      .initialSubscriptionName("init-sub")
                      .build())
                .subscribe();
```

死信主题服务消息重新投递，由[确认超时](#acknowledgment-timeout)或[否定确认](#negative-acknowledgment)或[重试信件主题](#retry-letter-topic)触发。

:::note

目前，死信主题在共享和 Key_Shared 订阅类型中启用。

:::

### 压缩

消息压缩可以通过付出一些 CPU 开销来减少消息大小。Pulsar 客户端支持以下压缩类型：
* [LZ4](https://github.com/lz4/lz4)
* [ZLIB](https://zlib.net/)
* [ZSTD](https://facebook.github.io/zstd/)
* [SNAPPY](https://google.github.io/snappy/)

压缩类型存储在消息元数据中，因此消费者可以根据需要自动采用不同的压缩类型。

下面的示例代码显示了如何为生产者启用压缩类型：

```java
client.newProducer()
    .topic("topic-name")
    .compressionType(CompressionType.LZ4)
    .create();
```

### 批处理

启用批处理时，生产者累积并在单个请求中发送一批消息。批处理大小由最大消息数和最大发布延迟定义。因此，积压大小表示批处理总数而不是消息总数。

![Pulsar 中的批处理](/assets/batching.svg)

在 Pulsar 中，批处理被跟踪并作为单个单元存储，而不是作为单个消息。消费者将批处理解包为单个消息。但是，计划消息（通过`deliverAt`或`deliverAfter`参数配置）即使在启用批处理时也始终作为单个消息发送。

通常，当批处理中的所有消息都被消费者确认时，批处理才会被确认。这意味着当**并非所有**批处理消息都被确认时，意外的故障、否定确认或确认超时可能导致此批处理中的所有消息重新投递。

为避免将批处理中已确认的消息重新投递给消费者，Pulsar 自 2.6.0 起引入了批索引确认。启用批索引确认时，消费者过滤掉已确认的批索引，并向 broker 发送批索引确认请求。broker 维护批索引确认状态并跟踪每个批索引的确认状态，以避免向消费者投递已确认的消息。当批处理中消息的所有索引都被确认时，批处理被删除。

默认情况下，批索引确认被禁用（`acknowledgmentAtBatchIndexLevelEnabled=false`）。你可以通过在 broker 端将`acknowledgmentAtBatchIndexLevelEnabled`参数设置为`true`来启用批索引确认。启用批索引确认会导致更多的内存开销。

还必须通过调用`.enableBatchIndexAcknowledgment(true);`在消费者中启用批索引确认

例如：

```java
Consumer<byte[]> consumer = pulsarClient.newConsumer()
        .topic(topicName)
        .subscriptionName(subscriptionName)
        .subscriptionType(subType)
        .enableBatchIndexAcknowledgment(true)
        .subscribe();
```

:::note

当使用同步`send`方法生产消息时，即使批次未满也会立即发送。这有助于减少消息发送延迟并防止调用者线程阻塞。在单个线程中生产消息时，应使用异步`sendAsync`方法以批处理方式发送消息。

:::

### 分块
消息分块使 Pulsar 能够通过在生产者端将消息拆分为分块并在消费者端聚合分块消息来处理大载荷消息。

启用消息分块后，当消息大小超过允许的最大载荷大小（broker 的`maxMessageSize`参数）时，消息传递的工作流程如下：
1. 生产者将原始消息拆分为分块消息，并分别按顺序将它们与分块元数据一起发布到 broker。
2. broker 以与普通消息相同的方式将分块消息存储在一个ManagedLedger中，并使用`chunkedMessageRate`参数记录主题上的分块消息速率。
3. 消费者缓冲分块消息，并在接收到消息的所有分块时将它们聚合到接收队列中。
4. 客户端从接收队列消费聚合的消息。

:::note

- 分块仅适用于持久主题。
- 分块不能与批处理同时启用。启用分块之前，需要禁用批处理。

:::

#### 使用一个有序消费者处理连续的分块消息

下图显示了一个主题，其中一个生产者发布大载荷消息的分块消息以及常规非分块消息。生产者以标记为 M1-C1、M1-C2 和 M1-C3 的三个分块发布消息 M1。broker 将所有三个分块消息存储在[ManagedLedger](concepts-architecture-overview.md#managed-ledgers)中，并以相同顺序将它们分派给有序的（独占/故障转移）消费者。消费者在内存中缓冲所有分块消息，直到接收到所有分块消息，将它们聚合成一条消息，然后将原始消息 M1 交给客户端。

![Pulsar 中的连续分块消息](/assets/chunking-01.png)

#### 使用一个有序消费者处理交织的分块消息

当多个生产者向单个主题发布分块消息时，broker 将来自不同生产者的所有分块消息存储在同一个[ManagedLedger](concepts-architecture-overview.md#managed-ledgers)中。ManagedLedger中的分块消息可能相互交织。如下所示，生产者 1 以三个分块 M1-C1、M1-C2 和 M1-C3 发布消息 M1。生产者 2 以三个分块 M2-C1、M2-C2 和 M2-C3 发布消息 M2。特定消息的所有分块消息仍然是有序的，但在ManagedLedger中可能不是连续的。

![Pulsar 中的交织分块消息](/assets/chunking-02.png)

:::note

在这种情况下，交织的分块消息可能会给消费者带来一些内存压力，因为消费者为每个大消息保留单独的缓冲区以在一个消息中聚合其所有分块。你可以通过配置`maxPendingChunkedMessage`参数来限制消费者同时维护的分块消息的最大数量。当达到阈值时，消费者通过静默确认未完成的消息或要求 broker 稍后重新投递它们来丢弃未完成的消息，优化内存利用率。

:::

#### 启用消息分块

**先决条件：**通过将`enableBatching`参数设置为`false`来禁用批处理。

消息分块功能默认关闭。
要启用消息分块，请在创建生产者时将`chunkingEnabled`参数设置为`true`。

:::note

如果消费者未能在指定时间内接收到消息的所有分块，它将使不完整的分块过期。默认值为 1 分钟。有关`expireTimeOfIncompleteChunkedMessage`参数的更多信息，请参考 [org.apache.pulsar.client.api](/api/client/)。

:::

## 主题

Pulsar 主题是组织消息为流的存储单元。与其他 pub-sub 系统一样，Pulsar 中的主题是用于从生产者向消费者传输消息的命名通道。主题名称是具有明确定义结构的 URL：

```http
{persistent|non-persistent}://tenant/namespace/topic
```

| 主题名称组件               | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|:---------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `persistent` / `non-persistent` | 这标识主题类型。Pulsar 支持两种主题：[持久](concepts-architecture-overview.md#persistent-storage)和[非持久](#non-persistent-topics)。默认为持久，因此如果未指定类型，主题是持久的。使用持久主题，所有消息都持久保存在磁盘上（如果 broker 不是独立的，消息持久保存在多个磁盘上），而非持久主题的数据不会持久保存到存储磁盘。 |
| `tenant`                   | 实例中主题的租户。租户对 Pulsar 中的多租户至关重要，并跨集群分布。                                                                                                                                                                                                                                                                                                                                                               |
| `namespace`                | 主题的管理单元，作为相关主题的分组机制。大多数主题配置在[命名空间](#namespaces)级别执行。每个租户有一个或多个命名空间。                                                                                                                                                                                                                                                                                                     |
| `topic`                    | 名称的最后一部分。主题名称在 Pulsar 实例中没有特殊含义。                                                                                                                                                                                                                                                                                                                                                                               |

:::note

你不需要在 Pulsar 中显式创建主题。如果客户端尝试向/从不存在的主题写入/接收消息，Pulsar 会自动在[主题名称](#topics)中提供的命名空间下创建该主题。
如果客户端创建主题时未指定租户或命名空间，则主题在默认租户和命名空间中创建。你也可以在指定的租户和命名空间中创建主题，如`persistent://my-tenant/my-namespace/my-topic`。`persistent://my-tenant/my-namespace/my-topic`表示`my-topic`主题在`my-tenant`租户的`my-namespace`命名空间中创建。

:::

## 命名空间

Pulsar 命名空间是主题的逻辑分组，也是租户内的逻辑命名法。租户通过[管理 API](admin-api-namespaces.md#create-namespaces)创建命名空间。例如，具有不同应用程序的租户可以为每个应用程序创建单独的命名空间。命名空间允许应用程序创建和管理主题的层次结构。主题`my-tenant/app1`是`my-tenant`的应用程序`app1`的命名空间。你可以在命名空间下创建任意数量的[主题](#topics)。

## 订阅

Pulsar 订阅是确定消息如何传递给消费者的命名配置规则。它是由一组消费者在主题上建立的租约。Pulsar 中有四种订阅类型：

- [独占](#exclusive)
- [共享](#shared)
- [故障转移](#failover)
- [key_shared](#key_shared)

这些类型在下图中说明。

![Pulsar 中的订阅类型](/assets/pulsar-subscription-types.png)

:::tip

**Pub-Sub 或队列**
  在 Pulsar 中，你可以灵活地使用不同的订阅。
  * 如果你想在消费者之间实现传统的"扇出 pub-sub 消息传递"，为每个消费者指定唯一的订阅名称。这是独占订阅类型。
  * 如果你想在消费者之间实现"消息队列"，在多个消费者之间共享相同的订阅名称（共享、故障转移、key_shared）。
  * 如果你想同时实现两种效果，为消费者组合独占订阅类型与其他订阅类型。

:::

### 订阅类型

当订阅没有消费者时，其订阅类型未定义。订阅的类型在消费者连接到它时定义，可以通过使用不同配置重新启动所有消费者来更改类型。

#### 独占

独占类型是只允许单个消费者附加到订阅的订阅类型。如果多个消费者使用相同的订阅订阅主题，则会发生错误。请注意，如果主题是分区的，所有分区将由允许连接到订阅的单个消费者消费。

在下图中，只允许**消费者 A**消费消息。

:::tip

独占是默认订阅类型。

:::

![Pulsar 中的独占订阅类型](/assets/pulsar-exclusive-subscriptions.svg)

#### 故障转移

故障转移类型是多个消费者可以附加到同一订阅的订阅类型。

为非分区主题或分区主题的每个分区选择一个主消费者并接收消息。

当主消费者断开连接时，所有（未确认和后续）消息都传递给队列中的下一个消费者。

:::note

在某些情况下，分区可能有一个较旧的活跃消费者在处理消息，而新切换的活跃消费者开始接收新消息。这可能导致消息重复或乱序。

:::

##### 故障转移 | 分区主题

对于分区主题，broker 按优先级和消费者名称的字典顺序对消费者进行排序。

broker 尝试将分区均匀分配给具有最高优先级的消费者。

通过运行模块操作`mod (partition index, consumer index)`来选择消费者。

- 如果分区主题中的分区数**少于**消费者数：

  例如，在下图中，此分区主题有 2 个分区，有 4 个消费者。

  每个分区有 1 个活跃消费者和 3 个备用消费者。

    - 对于 P0，消费者 A 是主消费者，如果消费者 A 断开连接，消费者 B、消费者 C 和消费者 D 将是接收消息的下一个消费者。

    - 对于 P1，消费者 B 是主消费者，如果消费者 B 断开连接，消费者 A、消费者 C 和消费者 D 将是接收消息的下一个消费者。

    - 此外，如果消费者 A 和消费者 B 断开连接，则

      - 对于 P0：消费者 C 是活跃消费者，消费者 D 是备用消费者。

      - 对于 P1：消费者 D 是活跃消费者，消费者 C 是备用消费者。

  ![Pulsar 中故障转移订阅类型的工作流](/assets/pulsar-failover-subscriptions-5.png)

- 如果分区主题中的分区数**多于**消费者数：

  例如，在下图中，此分区主题有 9 个分区和 3 个消费者。

  - P0、P3 和 P6 分配给消费者 A。消费者 A 是它们的活跃消费者。消费者 B 和消费者 C 是它们的备用消费者。

  - P1、P4 和 P7 分配给消费者 B。消费者 B 是它们的活跃消费者。消费者 A 和消费者 C 是它们的备用消费者。

  - P2、P5 和 P8 分配给消费者 C。消费者 C 是它们的活跃消费者。消费者 A 和消费者 B 是它们的备用消费者。

  ![Pulsar 中故障转移订阅类型的工作流](/assets/pulsar-failover-subscriptions-1.svg)

##### 故障转移 | 非分区主题

- 如果有一个非分区主题。broker 按消费者订阅非分区主题的顺序选择消费者。

  例如，在下图中，此非分区主题有 1 个主题，有 2 个消费者。

  该主题有 1 个活跃消费者和 1 个备用消费者。

  消费者 A 是主消费者，如果消费者 A 断开连接，消费者 B 将是接收消息的下一个消费者。

  ![Pulsar 中故障转移订阅类型的工作流](/assets/pulsar-failover-subscriptions-2.svg)

- 如果有多个非分区主题，基于**消费者名称哈希**和**主题名称哈希**选择消费者。客户端使用相同的消费者名称订阅所有主题。

  例如，在下图中，有 4 个非分区主题和 2 个消费者。

  - 非分区主题 1 和非分区主题 4 分配给消费者 B。消费者 A 是它们的备用消费者。

  - 非分区主题 2 和非分区主题 3 分配给消费者 A。消费者 B 是它们的备用消费者。

  ![Pulsar 中故障转移订阅类型的工作流](/assets/pulsar-failover-subscriptions-3.svg)

#### 共享

Pulsar 中的共享订阅类型允许多个消费者附加到同一订阅。消息在消费者之间以轮询分发方式传递，任何给定的消息只传递给一个消费者。当消费者断开连接时，发送给它且未确认的所有消息都将重新安排发送给剩余的消费者。

在下图中，**消费者 A**、**消费者 B**和**消费者 C**都能够订阅主题。

:::note

共享订阅不保证消息顺序或支持累积确认。

:::

![Pulsar 中的共享订阅类型](/assets/pulsar-shared-subscriptions.svg)

#### Key_Shared

Pulsar 中的 Key_Shared 订阅类型允许多个消费者附加到同一订阅。但与共享类型不同，Key_Shared 类型中的消息在消费者之间分发，具有相同键或相同排序键的消息只传递给一个消费者。无论消息重新投递多少次，它都传递给同一个消费者。

![Pulsar 中的 Key_Shared 订阅类型](/assets/pulsar-key-shared-subscriptions.svg)

:::note

如果有新切换的活跃消费者，它将从旧的非活跃消费者确认消息的位置开始读取消息。

例如，如果 P0 分配给消费者 A。消费者 A 是活跃消费者，消费者 B 是备用消费者。

- 如果消费者 A 断开连接且未从 P0 读取任何消息，当消费者 C 添加并成为新的活跃消费者时，消费者 C 将直接从 P0 开始读取消息。

- 如果消费者 A 在从 P0 读取消息（0,1,2,3）后断开连接，当消费者 C 添加并成为活跃消费者时，消费者 C 将从 P0 开始读取消息（4,5,6,7）。

:::

有三种类型的映射算法决定如何为给定的消息键（或排序键）选择消费者：

- 自动拆分哈希范围
- 自动拆分一致性哈希
- 粘性

所有映射算法的步骤是：
1. 消息键（或排序键）被传递给哈希函数（例如，Murmur3 32-bit），产生一个 32 位整数哈希。
2. 该哈希数被输入算法以从现有连接的消费者中选择一个消费者。

```
                      +--------------+                              +-----------+
Message Key ----->  / Hash Function / ----- hash (32-bit) -------> / Algorithm / ----> Consumer
                   +---------------+                               +----------+
```


当新消费者连接并因此添加到连接的消费者列表时，算法重新调整映射，使得当前映射到现有消费者的一些键将映射到新添加的消费者。当消费者断开连接，因此从连接的消费者列表中移除时，映射到它的键将映射到其他消费者。下面的部分将解释如何根据消息哈希选择消费者，以及对于每种算法，当新消费者连接或现有消费者断开连接时如何调整映射。

##### 自动拆分哈希范围

自动拆分哈希范围假设每个消费者映射到 0 到 `2^16`（65,536）之间数字范围内的单个区域。因此所有映射的区域覆盖整个范围，并且区域不重叠。通过在消息哈希上对范围大小（65,536）执行取模操作来为给定键选择消费者。接收到的数字`（0 <= i < 65,536）`包含在单个区域内。映射到该区域的消费者就是被选择的消费者。

示例：

假设我们有 4 个消费者（C1、C2、C3 和 C4），那么：

```
 0               16,384            32,768           49,152             65,536
 |------- C3 ------|------- C2 ------|------- C1 ------|------- C4 ------|
```

给定消息键`Order-3459134`，其哈希将是`murmur32("Order-3459134") = 3112179635`，其在范围内的索引将是`3112179635 mod 65536 = 6067`。该索引包含在区域`[0, 16384)`中，因此消费者 C3 将映射到此消息键。

当新消费者连接时，选择最大的区域，然后将其拆分为两半 - 下半部分将映射到新添加的消费者，上半部分将映射给拥有该区域的消费者。从 1 个到 4 个消费者的外观如下：

```
C1 connected:
|---------------------------------- C1 ---------------------------------|

C2 connected:
|--------------- C2 ----------------|---------------- C1 ---------------|

C3 connected:
|------- C3 ------|------- C2 ------|---------------- C1 ---------------|

C4 connected:
|------- C3 ------|------- C2 ------|------- C4 ------|------- C1 ------|
```

当消费者断开连接时，其区域将合并到其右侧的区域。例如：

C4 断开连接：

```
|------- C3 ------|------- C2 ------|---------------- C1 ---------------|
```

C1 断开连接：

```
|------- C3 ------|-------------------------- C2 -----------------------|
```

该算法的优点是在添加/删除消费者时只影响单个现有消费者，代价是区域大小不均匀。这意味着一些消费者比其他消费者获得更多的键。下一个算法则相反。

##### 自动拆分一致性哈希

自动拆分一致性哈希假设每个消费者映射到一个哈希环。它是一个从 0 到 65,535 的数字范围，如果你遍历该范围，当到达 65,535 时，下一个数字将是零。这就像你取一条从 0 开始到 65,535 结束的线，并将其弯曲成一个圆，使得端点粘合到起点：

```
 65,535 ------++--------- 0
              ||
         , - ~ ~ ~ - ,
     , '               ' ,
   ,                       ,
  ,                         ,
 ,                           ,
 ,                           ,
 ,                           ,
  ,                         ,
   ,                       ,
     ,                  , '
       ' - , _ _ _ ,  '
```

添加消费者时，我们在该圆上标记 100 个点并将它们与新添加的消费者关联。对于 1 到 100 之间的每个数字，我们将消费者名称连接到该数字并对其运行哈希函数以获取圆上将标记的点的位置。例如，如果消费者名称是"orders-aggregator-pod-2345-consumer"，那么我们将在该圆上标记 100 个点：

```
    murmur32("orders-aggregator-pod-2345-consumer␀0␀1") = 1003084738 % 65535 = 6028
    murmur32("orders-aggregator-pod-2345-consumer␀0␀2") = 373317202 % 65535 = 29842
    ...
    murmur32("orders-aggregator-pod-2345-consumer␀0␀100") = 320276078 % 65535 = 6533
```

由于哈希函数具有均匀分布属性，这些点将按随机顺序均匀分布在圆上。

```
    C1-33
         , - ~ ~ ~ - ,   C1-3
     , '               ' ,
   ,                       ,
  ,                         , C1-45
 ,                           ,
 ,                           ,
 ,                           ,
  ,                         ,  C1-23
   ,                       ,
     ,                  , '
       ' - , _ _ _ ,  '      ...

```

通过将其哈希放在圆上然后继续在圆上顺时针移动直到到达标记点来为给定消息键选择消费者。该点上可能有多个消费者（哈希函数可能有冲突）。在冲突的情况下，首先添加的消费者将处理哈希范围。当它离开时，特定哈希环点的冲突消费者中的下一个消费者将接管。

添加消费者时，我们按前述方式向圆添加 100 个标记点。由于哈希函数的均匀分布，这 100 个点就像是新消费者从每个现有消费者中取出了一小部分键。它保持了均匀分布，代价是影响所有现有消费者。[此视频](https://www.youtube.com/watch?v=zaRkONvyGr8)很好地解释了一致性哈希的概念（唯一的区别是，在 Pulsar 的情况下，我们使用 K 个点而不是 K 个哈希函数，如注释中所述）

##### 粘性

粘性假设每个消费者映射到 0 到 `2^16`（65,536）之间数字范围内的多个区域，并且区域之间没有重叠。通过在消息哈希上对范围大小（65,536）执行取模操作来选择消费者，接收到的数字`（0 <= i < 65,536）`包含在单个区域内。映射到该区域的消费者就是被选择的消费者。

在此算法中，你完全控制。每个新添加的消费者通过使用消费者 API 指定希望映射的区域范围。构造消费者对象时，可以指定区域列表。你有责任确保没有重叠并且所有范围都被区域覆盖。

示例：

假设我们有 2 个消费者（C1 和 C2）各自指定了它们的区域范围，那么：

```
C1 = [0, 16384), [32768, 49152)
C2 = [16384, 32768), [49152, 65536)

 0               16,384            32,768           49,152             65,536
 |------- C1 ------|------- C2 ------|------- C1 ------|------- C2 ------|
```

给定消息键`Order-3459134`，它的哈希将是`murmur32("Order-3459134") = 3112179635`，它在范围内的索引将是`3112179635 mod 65536 = 6067`。该索引包含在`[0, 16384)`中，因此消费者 C1 将映射到此消息键。

如果新连接的消费者未提供其区域范围，或者它们与现有消费者区域范围重叠，则它断开连接，从消费者列表中移除，并恢复为从未尝试连接。

##### 如何使用映射算法？

要使用上述映射算法，可以在构建消费者时指定 Key_Shared 模式：

- `AUTO_SPLIT` - 自动拆分哈希范围
- `STICKY` - 粘性

如果 broker 配置`subscriptionKeySharedUseConsistentHashing`启用，则一致性哈希将用于自动拆分而不是哈希范围。

##### 保留按键的消息传递顺序

在 Pulsar 4.0.0 中，Key_Shared 订阅已改进为在使用`AUTO_SPLIT`模式时保留具有相同键的消息传递顺序。当新消费者加入或离开时，消息传递将不再完全被阻塞。

对于 Key_Shared 订阅，具有相同键的消息一次只传递给一个消费者并允许处于未确认状态。这确保了按键的消息传递顺序得到保留。

当新消费者加入或离开时，使用默认的`AUTO_SPLIT`模式时，处理消息键的消费者可能会改变，但只有在特定键的所有未确认消息都被确认或原始消费者断开连接之后。

:::note

Key_Shared 订阅不阻止使用消费者 API 中的任何方法。例如，应用程序可能调用`negativeAcknowledge`或`redeliverUnacknowledgedMessages`方法。当消息由于这些方法而被安排传递时，它们将尽快重新投递。在这些情况下没有顺序保证，但是一次将消息键传递给单个消费者的保证将继续保留。

:::

##### Key_Shared 订阅`AUTO_SPLIT`模式中键的消息传递被阻塞时的问题排查

Pulsar 4.0.0 添加了消费者级别的主题统计，用于观察在使用`AUTO_SPLIT`模式的 Key_Shared 订阅中阻塞键的消息传递的未确认消息。

- `drainingHashesCount` - 此消费者处于排出状态的哈希的当前数量
- `drainingHashesClearedTotal` - 自消费者连接以来从排出状态清除的哈希总数
- `drainingHashesUnackedMessages` - 此消费者所有排出哈希的未确认消息总数
- `drainingHashes` - 此消费者的排出哈希信息
  - `hash` - 正在排出的粘性键哈希
  - `unackMsgs` - 此哈希的未确认消息数
  - `blockedAttempts` - 哈希阻塞消息传递尝试的次数

不是跟踪单个阻塞的键，`drainingHashes`字段跟踪处于排出状态并被未确认消息阻塞的哈希。跟踪哈希而不是键的原因是避免跟踪单个键的开销，以便当有大量键时 broker 可以更好地扩展。哈希空间在 Pulsar 4.0.0 中已减少到 `2^16`（65,536），而在之前的 Pulsar 版本中是 `2^32`。

可以通过使用 Murmur3 32-bit 哈希函数计算键的哈希。计算键哈希的伪代码是：

```
hash = murmur32("key") % 65536 + 1
```

此外，消费者级别的主题统计包含以下字段：

- `keyHashRangeArrays` - 消费者的哈希范围分配，以列表的列表形式，其中每个项目包含开始和结束作为元素。
  - 示例`[ [ 2960, 5968 ], [ 22258, 43033 ], [ 49261, 54464 ], [ 55155, 61273 ] ]`

此字段`keyHashRangeArrays`替换了早期 Pulsar 版本中可用的`keyHashRange`字段。字段的格式不同。

两个字段差异可见的示例：

```json
{
        "keyHashRangeArrays" : [ [ 2960, 5968 ], [ 22258, 43033 ], [ 49261, 54464 ], [ 55155, 61273 ] ],
        "keyHashRanges" : [ "[2960, 5968]", "[22258, 43033]", "[49261, 54464]", "[55155, 61273]" ],
}
```

字段`keyHashRanges`将信息包含为字符串值列表，这对大多数用例不太有用，因为在使用前需要解析。

订阅的主题统计中消费者统计部分的示例：

```json
{
      "consumers" : [ {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 1560,
        "msgOutCounter" : 30,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "c1",
        "availablePermits" : 70,
        "unackedMessages" : 30,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 5,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 10,
        "drainingHashes" : [ {
          "hash" : 2862,
          "unackMsgs" : 2,
          "blockedAttempts" : 5
        }, {
          "hash" : 11707,
          "unackMsgs" : 2,
          "blockedAttempts" : 9
        }, {
          "hash" : 15786,
          "unackMsgs" : 2,
          "blockedAttempts" : 6
        }, {
          "hash" : 43539,
          "unackMsgs" : 2,
          "blockedAttempts" : 6
        }, {
          "hash" : 45436,
          "unackMsgs" : 2,
          "blockedAttempts" : 9
        } ],
        "address" : "/127.0.0.1:55829",
        "connectedSince" : "2024-10-21T05:39:39.077284+03:00",
        "clientVersion" : "Pulsar-Java-v4.0.0",
        "lastAckedTimestamp" : 0,
        "lastConsumedTimestamp" : 1728527979411,
        "lastConsumedFlowTimestamp" : 1728527979106,
        "keyHashRangeArrays" : [ [ 2960, 5968 ], [ 22258, 43033 ], [ 49261, 54464 ], [ 55155, 61273 ] ],
        "metadata" : { },
        "lastAckedTime" : "1970-01-01T02:00:00+02:00",
        "lastConsumedTime" : "2024-10-21T05:39:39.411+03:00"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 0,
        "msgOutCounter" : 0,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "c2",
        "availablePermits" : 1000,
        "unackedMessages" : 0,
        "avgMessagesPerEntry" : 0,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "drainingHashes" : [ ],
        "address" : "/127.0.0.1:55829",
        "connectedSince" : "2024-10-21T05:39:39.294216+03:00",
        "clientVersion" : "Pulsar-Java-v4.0.0",
        "lastAckedTimestamp" : 0,
        "lastConsumedTimestamp" : 0,
        "lastConsumedFlowTimestamp" : 1728527979297,
        "keyHashRangeArrays" : [ [ 1, 2959 ], [ 5969, 22257 ], [ 43034, 49260 ], [ 54465, 55154 ], [ 61274, 65535 ] ],
        "metadata" : { },
        "lastAckedTime" : "1970-01-01T02:00:00+02:00",
        "lastConsumedTime" : "1970-01-01T02:00:00+02:00"
      } ]
}
```

消费者 c1 的相关信息：

```json
{
        "drainingHashesCount" : 5,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 10,
        "drainingHashes" : [ {
          "hash" : 2862,
          "unackMsgs" : 2,
          "blockedAttempts" : 5
        }, {
          "hash" : 11707,
          "unackMsgs" : 2,
          "blockedAttempts" : 9
        }, {
          "hash" : 15786,
          "unackMsgs" : 2,
          "blockedAttempts" : 6
        }, {
          "hash" : 43539,
          "unackMsgs" : 2,
          "blockedAttempts" : 6
        }, {
          "hash" : 45436,
          "unackMsgs" : 2,
          "blockedAttempts" : 9
        } ],
}
```

本例中关于消费者 c2 的相关信息：

```json
{
        "keyHashRangeArrays" : [ [ 1, 2959 ], [ 5969, 22257 ], [ 43034, 49260 ], [ 54465, 55154 ], [ 61274, 65535 ] ],
}
```

在 Pulsar 4.0.0 中，Key_Shared 实现只阻塞必要的哈希。对于每个哈希，有一种方法可以获取详细信息以确定为什么传递被阻塞。与之前的`readPositionWhenJoining`解决方案的主要区别是，现在可以自动构建 CLI 和 Web 用户界面工具来帮助用户，使得在 Key_Shared `AUTO_SPLIT` 订阅中消息传递被未确认消息阻塞时非常容易排查问题。

未来的改进将是添加一个 REST API 来检索哈希的未确认消息 ID 信息。使用此信息，可以找出阻塞特定哈希传递给消费者的消息的详细信息。REST API 还可以有其他功能，如按键搜索或计算给定键的哈希。

##### Key_Shared 订阅的批处理

:::note

当消费者使用 Key_Shared 订阅类型时，你需要**禁用批处理**或**使用基于键的批处理**用于生产者。

:::

基于键的批处理对 Key_Shared 订阅类型是必要的，有两个原因：
1. broker 根据消息的键分发消息，但默认的批处理方法可能无法将具有相同键的消息打包到同一批中。
2. 由于是消费者而不是 broker 从批处理中分发消息，一个批次中第一条消息的键被视为该批次中所有消息的键，从而导致上下文错误。

基于键的批处理旨在解决上述问题。这种批处理方法确保生产者将具有相同键的消息打包到同一批中。没有键的消息被打包到一个批次中，该批次没有键。当 broker 从此批次分发消息时，它使用`NON_KEY`作为键。此外，每个消费者与**只有一个**键关联，应该只接收**一个**消息批次用于连接的键。默认情况下，你可以通过配置生产者允许发送的消息数来限制批处理。

以下是在 Key_Shared 订阅类型下启用基于键的批处理的示例，其中`client`是你创建的 Pulsar 客户端。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

```java
Producer<byte[]> producer = client.newProducer()
        .topic("my-topic")
        .batcherBuilder(BatcherBuilder.KEY_BASED)
        .create();
```

</TabItem>
<TabItem value="C++">

```cpp
ProducerConfiguration producerConfig;
producerConfig.setBatchingType(ProducerConfiguration::BatchingType::KeyBasedBatching);
Producer producer;
client.createProducer("my-topic", producerConfig, producer);
```

</TabItem>
<TabItem value="Python">

```python
producer = client.create_producer(topic='my-topic', batching_type=pulsar.BatchingType.KeyBased)
```

</TabItem>

</Tabs>
````

:::note

使用 Key_Shared 订阅时，请注意：
  * 你需要为消息指定键或排序键。
  * 你不能使用累积确认。
  * 当主题中最新消息的位置是`X`时，新附加到同一订阅并连接到主题的 key_shared 消费者将**不会**接收任何消息，直到`X`之前的所有消息都被确认。

:::

### 订阅模式

#### 什么是订阅模式

订阅模式指示游标属于持久类型还是非持久类型。

- 创建订阅时，会创建关联的游标来记录最后消费的位置。

- 当订阅的消费者重新启动时，它可以继续从它最后消费的消息开始消费。

| 订阅模式 | 描述                                                                                                                                                                                                                                                                   | 注意                                                                                                                                                                |
|:----------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| `Durable` | 游标是持久的，保留消息并持久保存当前位置。<br />如果 broker 从故障中重新启动，它可以从持久存储（BookKeeper）恢复游标，以便消息可以继续从最后消费的位置消费。 | `Durable`是**默认**订阅模式。                                                                                                                     |
| `NonDurable` | 游标是非持久的。<br />一旦 broker 停止，游标就丢失并且永远无法恢复，因此消息**不能**继续从最后消费的位置消费。                                                                                    | 读取器的订阅模式本质上是`NonDurable`，它不会阻止主题中的数据被删除。读取器的订阅模式**不能**更改。 |

[订阅](#subscriptions)可以有一个或多个消费者。当消费者订阅主题时，必须指定订阅名称。持久订阅和非持久订阅可以有相同的名称，它们彼此独立。如果消费者指定之前不存在的订阅，则会自动创建订阅。

#### 何时使用

默认情况下，没有任何持久订阅的主题消息被标记为已删除。如果你想防止消息被标记为已删除，可以为此主题创建持久订阅。在这种情况下，只有已确认的消息被标记为已删除。更多信息，请参见[消息保留和过期](cookbooks-retention-expiry.md)。

#### 如何使用

创建消费者后，消费者的默认订阅模式是`Durable`。你可以通过更改消费者的配置将订阅模式更改为`NonDurable`。

````mdx-code-block
<Tabs
  defaultValue="Durable"
  values={[{"label":"Durable","value":"Durable"},{"label":"Non-durable","value":"Non-durable"}]}>

<TabItem value="Durable">

```java
        Consumer<byte[]> consumer = pulsarClient.newConsumer()
                .topic("my-topic")
                .subscriptionName("my-sub")
                .subscriptionMode(SubscriptionMode.Durable)
                .subscribe();
```

</TabItem>
<TabItem value="Non-durable">

```java
        Consumer<byte[]> consumer = pulsarClient.newConsumer()
                .topic("my-topic")
                .subscriptionName("my-sub")
                .subscriptionMode(SubscriptionMode.NonDurable)
                .subscribe();
```

</TabItem>

</Tabs>
````

有关如何创建、检查或删除持久订阅，请参见[管理订阅](admin-api-topics.md#manage-subscriptions)。

## 多主题订阅

当消费者订阅 Pulsar 主题时，默认情况下它订阅一个特定主题，如`persistent://public/default/my-topic`。然而，从 Pulsar 版本 1.23.0-incubating 开始，Pulsar 消费者可以同时订阅多个主题。你可以通过两种方式定义主题列表：

* 基于[**正则**表**达**式](https://en.wikipedia.org/wiki/Regular_expression)（regex），例如，`persistent://public/default/finance-.*`
* 通过显式定义主题列表

:::note

通过 regex 订阅多个主题时，所有主题必须在同一个[命名空间](#namespaces)中。

:::

订阅多个主题时，Pulsar 客户端自动调用 Pulsar API 来发现匹配 regex 模式/列表的主题，然后订阅所有主题。如果任何主题不存在，一旦主题创建，消费者将自动订阅它们。

:::note

 **跨多个主题无顺序保证**
 当生产者向单个主题发送消息时，保证所有消息都以相同顺序从该主题读取。但是，这些保证不适用于多个主题。因此，当生产者向多个主题发送消息时，从这些主题读取消息的顺序不保证相同。

:::

以下是 Java 的多主题订阅示例。

```java
import java.util.regex.Pattern;

import org.apache.pulsar.client.api.Consumer;
import org.apache.pulsar.client.api.PulsarClient;

PulsarClient pulsarClient = // 实例化 Pulsar 客户端对象

// 订阅命名空间中的所有主题
Pattern allTopicsInNamespace = Pattern.compile("persistent://public/default/.*");
Consumer<byte[]> allTopicsConsumer = pulsarClient.newConsumer()
                .topicsPattern(allTopicsInNamespace)
                .subscriptionName("subscription-1")
                .subscribe();

// 基于 regex 订阅命名空间中主题的子集
Pattern someTopicsInNamespace = Pattern.compile("persistent://public/default/foo.*");
Consumer<byte[]> someTopicsConsumer = pulsarClient.newConsumer()
                .topicsPattern(someTopicsInNamespace)
                .subscriptionName("subscription-1")
                .subscribe();
```

有关代码示例，请参见[Java](client-libraries-java.md#multi-topic-subscriptions)。

## 分区主题

普通主题仅由单个 broker 提供服务，这限制了主题的最大吞吐量。分区主题是由多个 broker 处理的特殊类型主题，从而允许更高的吞吐量。

分区主题实现为 N 个内部主题，其中 N 是分区数。向分区主题发布消息时，每个消息被路由到几个 broker 中的一个。分区在 broker 之间的分布由 Pulsar 自动处理。

下图说明了这一点：

![Pulsar 中的分区分布](/assets/partitioning.png)

**主题 1**主题有五个分区（**P0**到**P4**）分布在三个 broker 上。由于分区多于 broker，两个 broker 各处理两个分区，而第三个只处理一个（同样，Pulsar 自动处理分区的这种分布）。

此主题的消息广播给两个消费者。[路由模式](#routing-modes)确定每个消息应该发布到哪个分区，而[订阅类型](#subscription-types)确定哪些消息传递给哪些消费者。

路由和订阅模式的决策在大多数情况下可以分开做出。通常，吞吐量问题应指导分区/路由决策，而订阅决策应由应用程序语义指导。

分区主题和普通主题在订阅类型工作方式方面没有区别，因为分区只确定在消息由生产者发布并由消费者处理和确认之间发生的情况。

分区主题需要通过[管理 API](admin-api-overview.md)显式创建。可以在创建主题时指定分区数。

### 路由模式

向分区主题发布时，必须指定*路由模式*。路由模式确定每个消息应该发布到哪个分区或哪个内部主题。

有三种[MessageRoutingMode](/api/client/org/apache/pulsar/client/api/MessageRoutingMode)可用：

| 模式                  | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|:----------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `RoundRobinPartition` | 如果未提供键，生产者将以轮询方式在所有分区上发布消息以实现最大吞吐量。请注意，轮询不是针对单个消息进行的，而是设置为批处理延迟的相同边界，以确保批处理有效。如果在消息上指定了键，分区生产者将对键进行哈希并将消息分配给特定分区。这是默认模式。 |
| `SinglePartition`     | 如果未提供键，生产者将随机选择一个单个分区并将所有消息发布到该分区。如果在消息上指定了键，分区生产者将对键进行哈希并将消息分配给特定分区。                                                                                                                                                                                                                                                                |
| `CustomPartition`     | 使用自定义消息路由器实现，该实现将被调用以确定特定消息的分区。用户可以通过使用[Java 客户端](client-libraries-java.md)并实现[MessageRouter](/api/client/org/apache/pulsar/client/api/MessageRouter)接口来创建自定义路由模式。                                                                                                                                                                                                  |

### 顺序保证

消息的顺序与 MessageRoutingMode 和消息键相关。通常，用户希望每个键分区的顺序保证。

如果消息附加了键，消息将基于[HashingScheme](/api/client/org/apache/pulsar/client/api/HashingScheme)在[ProducerBuilder](/api/client/org/apache/pulsar/client/api/ProducerBuilder)中指定的哈希方案路由到相应的分区，当使用`SinglePartition`或`RoundRobinPartition`模式时。

| 顺序保证 | 描述 | 路由模式和键 |
|:-----------|:------------|:-----------------------------|
| 每键分区 | 具有相同键的所有消息将有序并放置在同一分区中。 | 使用`SinglePartition`或`RoundRobinPartition`模式，每条消息都提供键。 |
| 每生产者 | 来自同一生产者的所有消息将有序。 | 使用`SinglePartition`模式，每条消息都不提供键。 |

### 哈希方案

[哈希方案](/api/client/org/apache/pulsar/client/api/HashingScheme)是一个枚举，表示在选择用于特定消息的分区时可用的标准哈希函数集。

有 2 种类型的标准哈希函数可用：

- JavaStringHash
- Murmur3_32Hash

生产者的默认哈希函数是`JavaStringHash`。
请注意，当生产者可以来自不同的多语言客户端时，`JavaStringHash`没有用，在这种用例下，建议使用`Murmur3_32Hash`。



## 非持久主题

默认情况下，Pulsar 在多个[BookKeeper](concepts-architecture-overview.md#persistent-storage) bookie（存储节点）上持久存储*所有*未确认的消息。持久主题上的消息数据因此可以在 broker 重新启动和订阅者故障转移中幸存。

然而，Pulsar 也支持**非持久主题**。非持久主题是 Pulsar 主题，其中消息数据*从不*[持久存储](concepts-architecture-overview.md#persistent-storage)到磁盘，仅保留在内存中。使用非持久传递时，杀死 Pulsar broker 或断开主题的订阅者意味着该（非持久）主题上的所有传输中消息都将丢失，这意味着客户端可能会看到消息丢失。

非持久主题具有以下形式（注意名称中的`non-persistent`）：

```http
non-persistent://tenant/namespace/topic
```

有关使用非持久主题的更多信息，请参见[非持久消息传递 cookbook](cookbooks-non-persistent.md)。

在非持久主题中，broker 立即将消息传递给所有连接的订阅者，而无需在[BookKeeper](concepts-architecture-overview.md#persistent-storage)中*持久保存*它们。如果订阅者断开连接，broker 将无法传递那些传输中的消息，订阅者将永远无法再次接收这些消息。消除持久存储步骤使得在某些情况下非持久主题上的消息传递比持久主题上的消息传递稍快，但代价是失去 Pulsar 的一些核心好处。

> 对于非持久主题，消息数据仅存在于内存中，没有特定的缓冲区 - 这意味着数据*不会*在内存中缓冲。接收到的消息立即传输给所有*连接的消费者*。如果消息 broker 发生故障或消息数据无法从内存中检索，你的消息数据可能会丢失。只有在你*确定*你的用例需要它并且可以承受它时才使用非持久主题。

默认情况下，Pulsar broker 上启用了非持久主题。你可以在 broker 的[配置](reference-configuration.md#broker-enableNonPersistentTopics)中禁用它们。你可以使用`pulsar-admin topics`命令管理非持久主题。更多信息，请参见[`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

目前，未分区的非持久主题不会持久保存到 ZooKeeper，这意味着如果拥有它们的 broker 崩溃，它们不会重新分配给另一个 broker，因为它们只存在于所有者 broker 内存中。当前的解决方法是在 broker 配置中将`allowAutoTopicCreation`的值设置为`true`，将`allowAutoTopicCreationType`设置为`non-partitioned`（它们是默认值）。

### 性能

使用持久主题时，所有消息都持久保存在磁盘上，而使用非持久主题时，broker 不持久保存消息，并在消息传递给连接的 broker 后立即向生产者发回 ack，因此非持久消息传递通常比持久消息传递更快。因此，生产者在使用非持久主题时看到相对较低的发布延迟。

### 客户端 API

生产者和消费者可以以与持久主题相同的方式连接到非持久主题，关键区别是主题名称必须以`non-persistent`开头。所有订阅类型---[独占](#exclusive)、[共享](#shared)、[key_shared](#key_shared)和[故障转移](#failover)---都支持非持久主题。

以下是非持久主题的[Java 消费者](client-libraries-java-use.md#create-a-consumer)示例：

```java
PulsarClient client = PulsarClient.builder()
        .serviceUrl("pulsar://localhost:6650")
        .build();
String npTopic = "non-persistent://public/default/my-topic";
String subscriptionName = "my-subscription-name";

Consumer<byte[]> consumer = client.newConsumer()
        .topic(npTopic)
        .subscriptionName(subscriptionName)
        .subscribe();
```

以下是同一非持久主题的[Java 生产者](client-libraries-java-use/#create-a-producer)示例：

```java
Producer<byte[]> producer = client.newProducer()
                .topic(npTopic)
                .create();
```

## 系统主题

系统主题是 Pulsar 内部使用的预定义主题。它可以是持久主题或非持久主题。

系统主题用于实现某些功能并消除对第三方组件的依赖，如事务、心跳检测、主题级策略和资源组服务。系统主题使这些功能的实现变得简化、依赖性和灵活性。以心跳检测为例，你可以利用系统主题进行健康检查，在内部启用生产者/读取器在心跳命名空间下生产/消费消息，这可以检测当前服务是否仍然存活。

下表概述了每个特定命名空间的可用系统主题。

| 命名空间 | 主题名称 | 域 | 数量 | 用途 |
|-----------|-----------|--------|-------|-------|
| pulsar/system | `transaction_coordinator_assign_\${id}` | 持久 | 默认 16 | 事务协调器 |
| pulsar/system | `__transaction_log_\${tc_id}` | 持久 | 默认 16 | 事务日志 |
| pulsar/system | `resource-usage` | 非持久 | 默认 4 | 资源组服务 |
| host/port | `heartbeat` | 持久 | 1 | 心跳检测 |
| 用户定义命名空间 | [`__change_events`](concepts-multi-tenancy.md#namespace-change-events-and-topic-level-policies) | 持久 | 默认 4 | 主题事件 |
| 用户定义命名空间 | `__transaction_buffer_snapshot` | 持久 | 每命名空间一个 | 事务缓冲区快照 |
| 用户定义命名空间 | `\${topicName}__transaction_pending_ack` | 持久 | 每个使用事务确认的主题订阅一个 | 带事务的确认 |

:::note

* 你不能创建任何系统主题。要列出系统主题，可以在使用[Pulsar 管理 API](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)获取主题列表时添加选项`--include-system-topic`。

* 自 Pulsar 版本 2.11.0 起，系统主题默认启用。
  在早期版本中，你需要在`conf/broker.conf`或`conf/standalone.conf`文件中更改以下配置来启用系统主题。

  ```properties
  systemTopicEnabled=true
  topicLevelPoliciesEnabled=true
  ```

:::

## 消息重新投递

Apache Pulsar 支持优雅的故障处理并确保关键数据不会丢失。软件总是会有意外情况，有时消息可能无法成功传递。因此，拥有内置的故障处理机制很重要，特别是在异步消息传递中，如下面的示例所示。

- 消费者与数据库或 HTTP 服务器断开连接。当发生这种情况时，数据库暂时离线，而消费者向其写入数据，消费者调用的外部 HTTP 服务器暂时不可用。
- 消费者由于消费者崩溃、连接断开等原因与 broker 断开连接。因此，未确认的消息被传递给其他可用的消费者。

Apache Pulsar 中的消息重新投递避免异步消息传递中的故障和其他消息传递故障，使用至少一次传递语义确保 Pulsar 多次处理消息。

要利用消息重新投递，你需要在 broker 可以重新发送 Apache Pulsar 客户端中未确认的消息之前启用此机制。你可以使用三种方法在 Apache Pulsar 中激活消息重新投递机制。

- [否定确认](#negative-acknowledgment)
- [确认超时](#acknowledgment-timeout)
- [重试信件主题](#retry-letter-topic)


## 消息保留和过期

默认情况下，Pulsar 消息 broker：

* 立即删除*所有*已被消费者确认的消息，并且
* [持久存储](concepts-architecture-overview.md#persistent-storage)所有未确认的消息在消息积压中。

然而，Pulsar 有两个功能可以让你覆盖此默认行为：

* 消息**保留**使你能够存储已被消费者确认的消息
* 消息**过期**使你能够为尚未确认的消息设置生存时间（TTL）

:::tip

所有消息保留和过期都在[命名空间](#namespaces)级别管理。有关操作方法，请参见[消息保留和过期](cookbooks-retention-expiry.md) cookbook。

:::

![消息保留和过期](/assets/retention-expiry.svg)

使用消息保留（顶部显示），应用于命名空间中所有主题的保留策略指示某些消息即使已被确认也会持久保存在 Pulsar 中。未被保留策略覆盖的已确认消息被删除。没有保留策略，所有已确认的消息都将被删除。

使用消息过期（底部显示），一些消息被删除，即使它们尚未被确认，因为它们根据应用于命名空间的 TTL 已过期（例如，因为应用了 5 分钟的 TTL，消息尚未确认但已有 10 分钟历史）。

## 消息去重

当消息被 Pulsar [持久化](concepts-architecture-overview.md#persistent-storage)超过一次时，会发生消息重复。消息去重确保在 Pulsar 主题上生产的每条消息只持久保存到磁盘一次，即使消息被生产多次。消息去重在服务器端自动处理。

下图说明了禁用与启用消息去重时发生的情况：

![Pulsar 消息去重](/assets/message-deduplication.svg)

在顶部显示的场景中禁用了消息去重。这里，生产者在主题上发布消息 1；消息到达 Pulsar broker 并[持久化](concepts-architecture-overview.md#persistent-storage)到 BookKeeper。然后生产者再次发送消息 1（在这种情况下由于某些重试逻辑），消息被 broker 接收并再次存储在 BookKeeper 中，这意味着发生了重复。

在底部显示的第二个场景中，生产者发布消息 1，与第一个场景一样，消息被 broker 接收并持久化。然而，当生产者尝试再次发布消息时，broker 知道它已经看到过消息 1，因此不持久化该消息。

:::tip

- 消息去重在命名空间级别或主题级别处理。有关更多说明，请参见[消息去重 cookbook](cookbooks-deduplication.md)。
- 你可以在 [PIP-6](https://github.com/aahmed-se/pulsar-wiki/blob/master/PIP-6:-Guaranteed-Message-Deduplication.md) 中阅读消息去重的设计。

:::

### 生产者幂等性

消息去重的另一种可用方法是**生产者幂等性**，这意味着每条消息*只生产一次*而没有数据丢失和重复。这种方法的缺点是它将消息去重的工作推迟到应用程序。在 Pulsar 中，这在[broker](reference-terminology.md#broker)级别处理，因此你不需要修改你的 Pulsar 客户端代码。相反，你只需要进行管理更改。有关详细信息，请参见[管理消息去重](cookbooks-deduplication.md)。

### 去重和有效一次语义

消息去重使 Pulsar 成为与流处理引擎（SPE）和其他寻求提供有效一次处理语义的系统一起使用的理想消息传递系统。不提供自动消息去重的消息传递系统要求 SPE 或其他系统保证去重，这意味着严格的消息排序以让应用程序承担去重责任为代价。使用 Pulsar，严格的排序保证在应用程序级别没有任何成本。


## 延迟消息传递
延迟消息传递使你能够在稍后消费消息。在此机制中，消息存储在 BookKeeper 中。`DelayedDeliveryTracker`在消息发布到 broker 后在内存中维护时间索引（时间 -> messageId）。一旦指定的延迟结束，此消息将传递给消费者。

:::note

只有共享和键共享订阅支持延迟消息传递。在其他订阅中，延迟消息立即分发。

:::

下图说明了延迟消息传递的概念：

![延迟消息传递](/assets/message-delay.svg)

broker 保存消息而不进行任何检查。当消费者消费消息时，如果消息设置为延迟，则消息被添加到`DelayedDeliveryTracker`。订阅检查并从`DelayedDeliveryTracker`获取超时消息。

:::note

与保留策略一起工作：在 Pulsar 中，Ledger在其中的消息被消费后会自动删除。Pulsar 将删除主题的前面Ledger，但不会删除主题中间的Ledger。这意味着如果你发送延迟很长时间的消息，该消息将在达到延迟时间之前不会被消费。这意味着此主题上的所有Ledger都不能被删除，直到延迟消息被消费，即使某些后续Ledger已完全消费。

与积压配额策略一起工作：使用延迟消息后，建议谨慎使用积压配额策略。这是因为延迟消息可能导致长时间不被消费，触发积压配额策略并导致后续消息发送被拒绝。

与积压 TTL 策略一起工作：当 TTL 过期时，Pulsar 自动将消息移动到已确认状态（因此使其准备好删除），即使消息是延迟消息并且不关心预期的延迟时间是什么。

:::

### Broker
延迟消息传递默认启用。你可以在 broker 配置文件中更改它，如下所示：

```conf
# 是否为消息启用延迟传递。
# 如果禁用，消息立即传递，没有跟踪开销。
delayedDeliveryEnabled=true

# 控制延迟消息传递重试的计时时间，
# 影响传递时间与计划时间的准确性。
# 注意，此时间用于配置 HashedWheelTimer 的计时时间
# 用于 InMemoryDelayedDeliveryTrackerFactory（默认的 DelayedDeliverTrackerFactory）。
# 默认为 1 秒。
delayedDeliveryTickTimeMillis=1000

# 当使用 InMemoryDelayedDeliveryTrackerFactory（默认的 DelayedDeliverTrackerFactory）时，
# 是否严格遵循 deliverAt 时间。当为 false（默认）时，消息可能比 deliverAt 时间早最多
# tickTimeMillis 发送给消费者。这可以减少 broker 为潜在的非常短时间段维护延迟索引的开销。
# 当为 true 时，消息不会发送给消费者，直到 deliverAt 时间过去，并且它们可能晚到
# deliverAt 时间加上主题的 tickTimeMillis 加上 delayedDeliveryTickTimeMillis。
isDelayedDeliveryDeliverAtTimeStrict=false

# 每个分发器的最大延迟消息数。一旦达到此限制，不允许更多延迟消息。
maxNumDelayedDeliveryTrackerMemoryEntries=100000
```

### 生产者
以下是 Java 中生产者的延迟消息传递示例：

```java
// 在配置的延迟间隔传递的消息
producer.newMessage().deliverAfter(3L, TimeUnit.Minute).value("Hello Pulsar!").send();
```