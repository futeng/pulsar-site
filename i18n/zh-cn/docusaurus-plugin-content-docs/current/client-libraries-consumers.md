---
id: client-libraries-consumers
title: 使用消费者
sidebar_label: "使用消费者"
description: 了解如何在 Pulsar 中使用消费者。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

设置好客户端后，你可以进一步探索如何开始使用[消费者](concepts-clients.md#consumer)。

## 订阅主题

Pulsar 提供了多种[订阅类型](concepts-messaging.md#subscription-types)来适配不同的场景。一个主题可以有多个不同订阅类型的订阅。然而，一个订阅在同一时间只能有一种订阅类型。

订阅与订阅名称是相同的；一个订阅名称在同一时间只能指定一种订阅类型。要更改订阅类型，应该先停止该订阅的所有消费者。

不同的订阅类型有不同的消息分发方式。本节介绍不同订阅类型之间的差异以及如何使用它们。

为了更好地描述它们之间的差异，假设你有一个名为 "my-topic" 的主题，生产者已经发布了 10 条消息。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Producer<String> producer = client.newProducer(Schema.STRING)
        .topic("my-topic")
        .enableBatching(false)
        .create();
// 3 条消息使用 "key-1"，3 条消息使用 "key-2"，2 条消息使用 "key-3"，2 条消息使用 "key-4"
producer.newMessage().key("key-1").value("message-1-1").send();
producer.newMessage().key("key-1").value("message-1-2").send();
producer.newMessage().key("key-1").value("message-1-3").send();
producer.newMessage().key("key-2").value("message-2-1").send();
producer.newMessage().key("key-2").value("message-2-2").send();
producer.newMessage().key("key-2").value("message-2-3").send();
producer.newMessage().key("key-3").value("message-3-1").send();
producer.newMessage().key("key-3").value("message-3-2").send();
producer.newMessage().key("key-4").value("message-4-1").send();
producer.newMessage().key("key-4").value("message-4-2").send();
```

  </TabItem>
</Tabs>
````

#### 独占模式 (Exclusive)

创建新的消费者并使用 `Exclusive` 订阅类型进行订阅。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Consumer consumer = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Exclusive)
        .subscribe()
```

  </TabItem>
</Tabs>
````

只允许第一个消费者连接到订阅，其他消费者会收到错误。第一个消费者接收所有 10 条消息，消费顺序与生产顺序相同。

:::note

如果主题是分区主题，第一个消费者会订阅所有分区主题，其他消费者不会被分配到任何分区，并会收到错误。

:::

#### 故障转移模式 (Failover)

创建新的消费者并使用 `Failover` 订阅类型进行订阅。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Consumer consumer1 = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Failover)
        .subscribe()
Consumer consumer2 = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Failover)
        .subscribe()
//consumer1 是活跃消费者，consumer2 是备用消费者。
//consumer1 接收 5 条消息后崩溃，consumer2 接替成为活跃消费者。
```

  </TabItem>
</Tabs>
````

多个消费者可以连接到同一个订阅，但只有第一个消费者是活跃的，其他都是备用。当活跃消费者断开连接时，消息会被分发到某个备用消费者，该备用消费者随后成为活跃消费者。

如果第一个活跃消费者在接收 5 条消息后断开连接，备用消费者将成为活跃消费者。Consumer1 将会收到：

```
("key-1", "message-1-1")
("key-1", "message-1-2")
("key-1", "message-1-3")
("key-2", "message-2-1")
("key-2", "message-2-2")
```

consumer2 将会收到：

```
("key-2", "message-2-3")
("key-3", "message-3-1")
("key-3", "message-3-2")
("key-4", "message-4-1")
("key-4", "message-4-2")
```

:::note

如果一个主题是分区主题，每个分区只有一个活跃消费者，一个分区的消息只分发到一个消费者，多个分区的消息分发到多个消费者。

:::

#### 共享模式 (Shared)

创建新的消费者并使用 `Shared` 订阅类型进行订阅。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Consumer consumer1 = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Shared)
        .subscribe()

Consumer consumer2 = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Shared)
        .subscribe()
//consumer1 和 consumer2 都是活跃消费者。
```

  </TabItem>
</Tabs>
````

在 `Shared` 订阅类型中，多个消费者可以连接到同一个订阅，消息通过轮询方式在消费者之间分发。

如果 broker 一次只分发一条消息，consumer1 会收到以下信息：

```
("key-1", "message-1-1")
("key-1", "message-1-3")
("key-2", "message-2-2")
("key-3", "message-3-1")
("key-4", "message-4-1")
```

consumer2 会收到以下信息：

```
("key-1", "message-1-2")
("key-2", "message-2-1")
("key-2", "message-2-3")
("key-3", "message-3-2")
("key-4", "message-4-2")
```

`Shared` 订阅与 `Exclusive` 和 `Failover` 订阅类型不同。`Shared` 订阅具有更好的灵活性，但无法提供顺序保证。

#### 键共享模式 (Key_shared)

这是自 2.4.0 版本以来的新订阅类型。创建新的消费者并使用 `Key_Shared` 订阅类型进行订阅。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Consumer consumer1 = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Key_Shared)
        .subscribe()

Consumer consumer2 = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscriptionType(SubscriptionType.Key_Shared)
        .subscribe()
//consumer1 和 consumer2 都是活跃消费者。
```

  </TabItem>
</Tabs>
````

就像 `Shared` 订阅一样，`Key_Shared` 订阅类型中的所有消费者都可以连接到同一个订阅。但 `Key_Shared` 订阅类型与 `Shared` 订阅不同。在 `Key_Shared` 订阅类型中，具有相同键的消息只分发到一个消费者且保证顺序。不同消费者之间的消息可能分发情况（默认情况下我们无法预先知道哪些键会被分配给哪个消费者，但一个键在同一时间只会被分配给一个消费者）。

consumer1 会收到以下信息：

```
("key-1", "message-1-1")
("key-1", "message-1-2")
("key-1", "message-1-3")
("key-3", "message-3-1")
("key-3", "message-3-2")
```

consumer2 会收到以下信息：

```
("key-2", "message-2-1")
("key-2", "message-2-2")
("key-2", "message-2-3")
("key-4", "message-4-1")
("key-4", "message-4-2")
```

如果在生产者端启用了批处理，默认情况下具有不同键的消息会被添加到同一个批次中。broker 会将该批次分发给消费者，因此默认的批处理机制可能会破坏 Key_Shared 订阅保证的消息分发语义。生产者需要使用 `KeyBasedBatcher`。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Producer producer = client.newProducer()
        .topic("my-topic")
        .batcherBuilder(BatcherBuilder.KEY_BASED)
        .create();
```

  </TabItem>
</Tabs>
````

或者生产者可以禁用批处理。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Producer producer = client.newProducer()
        .topic("my-topic")
        .enableBatching(false)
        .create();
```

  </TabItem>
</Tabs>
````

:::note

如果没有指定消息键，默认情况下无键的消息会按顺序分发给一个消费者。

:::

## 订阅多个主题

除了将消费者订阅到单个 Pulsar 主题外，你还可以使用[多主题订阅](concepts-messaging.md#multi-topic-subscriptions)同时订阅多个主题。要使用多主题订阅，你可以提供一个正则表达式 (regex) 或主题 `List`。如果你通过正则表达式选择主题，所有主题必须在同一个 Pulsar 命名空间中。

以下是一些示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Go","value":"Go"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.client.api.Consumer;
import org.apache.pulsar.client.api.PulsarClient;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

ConsumerBuilder consumerBuilder = pulsarClient.newConsumer()
        .subscriptionName(subscription);

// 订阅命名空间中的所有主题
Pattern allTopicsInNamespace = Pattern.compile("public/default/.*");
Consumer allTopicsConsumer = consumerBuilder
        .topicsPattern(allTopicsInNamespace)
        .subscribe();

// 订阅命名空间中基于正则表达式的主题子集
Pattern someTopicsInNamespace = Pattern.compile("public/default/foo.*");
Consumer allTopicsConsumer = consumerBuilder
        .topicsPattern(someTopicsInNamespace)
        .subscribe();
```

在上述示例中，消费者订阅了可以匹配主题名称模式的 `persistent` 主题。如果你希望消费者订阅可以匹配主题名称模式的所有 `persistent` 和 `non-persistent` 主题，请将 `subscriptionTopicsMode` 设置为 `RegexSubscriptionMode.AllTopics`。

```java
Pattern pattern = Pattern.compile("public/default/.*");
pulsarClient.newConsumer()
        .subscriptionName("my-sub")
        .topicsPattern(pattern)
        .subscriptionTopicsMode(RegexSubscriptionMode.AllTopics)
        .subscribe();
```

:::note

默认情况下，消费者的 `subscriptionTopicsMode` 是 `PersistentOnly`。`subscriptionTopicsMode` 的可用选项包括 `PersistentOnly`、`NonPersistentOnly` 和 `AllTopics`。

:::

你也可以订阅明确的主题列表（如果你愿意，可以跨命名空间）：

```java
List<String> topics = Arrays.asList(
        "topic-1",
        "topic-2",
        "topic-3"
);

Consumer multiTopicConsumer = consumerBuilder
        .topics(topics)
        .subscribe();

// 或者：
Consumer multiTopicConsumer = consumerBuilder
        .topic(
            "topic-1",
            "topic-2",
            "topic-3"
        )
        .subscribe();
```

你也可以使用 `subscribeAsync` 方法而不是同步的 `subscribe` 方法来异步订阅多个主题。以下是一个示例。

```java
Pattern allTopicsInNamespace = Pattern.compile("persistent://public/default.*");
consumerBuilder
        .topics(topics)
        .subscribeAsync()
        .thenAccept(this::receiveMessageFromConsumer);

private void receiveMessageFromConsumer(Object consumer) {
    ((Consumer)consumer).receiveAsync().thenAccept(message -> {
                // 对收到的消息执行某些操作
                receiveMessageFromConsumer(consumer);
            });
}
```

  </TabItem>
  <TabItem value="Go">

```go
client, err := pulsar.NewClient(pulsar.ClientOptions{
    URL: "pulsar://localhost:6650",
})
if err != nil {
    log.Fatal(err)
}

topics := []string{"topic-1", "topic-2"}
consumer, err := client.Subscribe(pulsar.ConsumerOptions{
    // 填写 `Topics` 字段会创建多主题消费者
    Topics:           topics,
    SubscriptionName: "multi-topic-sub",
})
if err != nil {
    log.Fatal(err)
}
defer consumer.Close()
```

  </TabItem>
  <TabItem value="Python">

```python
import re
consumer = client.subscribe(re.compile('persistent://public/default/topic-*'), 'my-subscription')
while True:
    msg = consumer.receive()
    try:
        print("Received message '{}' id='{}'".format(msg.data(), msg.message_id()))
        # 确认消息已成功处理
        consumer.acknowledge(msg)
    except Exception:
        # 消息处理失败
        consumer.negative_acknowledge(msg)
client.close()
```

  </TabItem>
</Tabs>
````

## 取消订阅主题

此示例展示了消费者如何取消订阅主题。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C#","value":"C#"}]}>
<TabItem value="Java">

   ```java
   consumer.unsubscribe();
   ```

  </TabItem>

<TabItem value="C#">

   ```csharp
   await consumer.Unsubscribe();
   ```

  </TabItem>
</Tabs>
````

:::note

一旦消费者取消订阅主题，就不能再使用该消费者，并且该消费者会被释放。

:::

## 接收消息

此示例展示了消费者如何从主题接收消息。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}, {"label":"C#","value":"C#"}]}>
<TabItem value="Java">

   ```java
   Message message = consumer.receive();
   ```

 </TabItem>

<TabItem value="C#">

   ```csharp
   await foreach (var message in consumer.Messages())
   {
       Console.WriteLine("Received: " + Encoding.UTF8.GetString(message.Data.ToArray()));
   }
   ```

 </TabItem>
</Tabs>
````

## 带超时的接收消息

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}, {"label":"Go","value":"Go"}]}>
<TabItem value="Java">

   ```java
   consumer.receive(10, TimeUnit.SECONDS);
   ```

 </TabItem>

  <TabItem value="Go">


   ```go
   client, err := pulsar.NewClient(pulsar.ClientOptions{
       URL: "pulsar://localhost:6650",
   })
   if err != nil {
       log.Fatal(err)
   }
   defer client.Close()

   topic := "test-topic-with-no-messages"
   ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
   defer cancel()

   // 创建消费者
   consumer, err := client.Subscribe(pulsar.ConsumerOptions{
       Topic:            topic,
       SubscriptionName: "my-sub1",
       Type:             pulsar.Shared,
   })
   if err != nil {
       log.Fatal(err)
   }
   defer consumer.Close()

   // 带超时的接收消息
   msg, err := consumer.Receive(ctx)
   if err != nil {
       log.Fatal(err)
   }
   fmt.Println(msg.Payload())
   ```

  </TabItem>
</Tabs>
````

## 异步接收消息

`receive` 方法同步接收消息（消费者进程被阻塞，直到有消息可用）。你也可以使用[异步接收](concepts-clients.md#receive-modes)，它在新消息可用时立即返回一个 [`CompletableFuture`](http://www.baeldung.com/java-completablefuture) 对象。

以下是一个示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

   ```java
   CompletableFuture<Message> asyncMessage = consumer.receiveAsync();
   ```

   异步接收操作返回一个包装在 [`CompletableFuture`](http://www.baeldung.com/java-completablefuture) 中的 [Message](/api/client/org/apache/pulsar/client/api/Message)。

 </TabItem>
</Tabs>
````

## 批量接收消息

使用 `batchReceive` 为每次调用接收多条消息。

以下是一个示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Messages messages = consumer.batchReceive();
for (Object message : messages) {
  // 执行某些操作
}
consumer.acknowledge(messages)
```

  </TabItem>
</Tabs>
````

:::note

批量接收策略限制单个批次中消息的数量和字节数。你可以指定超时时间以等待足够的消息。
如果满足以下任一条件，批量接收就完成：足够数量的消息、消息的字节数、等待超时。

```java
Consumer consumer = client.newConsumer()
.topic("my-topic")
.subscriptionName("my-subscription")
.batchReceivePolicy(BatchReceivePolicy.builder()
.maxNumMessages(100)
.maxNumBytes(1024 * 1024)
.timeout(200, TimeUnit.MILLISECONDS)
.build())
.subscribe();
```

默认的批量接收策略是：

```java
BatchReceivePolicy.builder()
.maxNumMessage(-1)
.maxNumBytes(10 * 1024 * 1024)
.timeout(100, TimeUnit.MILLISECONDS)
.build();
```

:::

## 确认消息

消息可以单独确认或累积确认。关于消息确认的详细信息，请参阅[确认](concepts-messaging.md#acknowledgment)。

### 单独确认消息

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C#","value":"C#"}]}>
<TabItem value="Java">

  ```java
  consumer.acknowledge(msg);
  ```


  </TabItem>
  <TabItem value="C#">

  ```csharp
  await consumer.Acknowledge(message);
  ```

  </TabItem>
</Tabs>
````

### 累积确认消息

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C#","value":"C#"}]}>
<TabItem value="Java">

  ```java
  consumer.acknowledgeCumulative(msg);
  ```

  </TabItem>
  <TabItem value="C#">

  ```csharp
  await consumer.AcknowledgeCumulative(message);
  ```

  </TabItem>
</Tabs>
````

## 否认确认重发退避

`RedeliveryBackoff` 引入了重发退避机制。你可以通过设置消息的重发次数来实现不同的延迟重发。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Consumer consumer =  client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .negativeAckRedeliveryBackoff(MultiplierRedeliveryBackoff.builder()
                .minDelayMs(1000)
                .maxDelayMs(60 * 1000)
                .build())
        .subscribe();
```

  </TabItem>
</Tabs>
````

## 确认超时重发退避

`RedeliveryBackoff` 引入了重发退避机制。你可以通过设置消息的重试次数来实现不同的延迟重发。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Consumer consumer =  client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .ackTimeout(10, TimeUnit.SECOND)
        .ackTimeoutRedeliveryBackoff(MultiplierRedeliveryBackoff.builder()
                .minDelayMs(1000)
                .maxDelayMs(60000)
                .multiplier(2)
                .build())
        .subscribe();
```

  </TabItem>
</Tabs>
````

消息重发行为应该如下所示。

重发次数 | 重发延迟
:--------------------|:-----------
1 | 10 + 1 秒
2 | 10 + 2 秒
3 | 10 + 4 秒
4 | 10 + 8 秒
5 | 10 + 16 秒
6 | 10 + 32 秒
7 | 10 + 60 秒
8 | 10 + 60 秒

:::note

- `negativeAckRedeliveryBackoff` 不适用于 `consumer.negativeAcknowledge(MessageId messageId)`，因为你无法从消息 ID 中获取重发次数。
- 如果消费者崩溃，它会触发未确认消息的重发。在这种情况下，`RedeliveryBackoff` 不会生效，消息可能会比退避的延迟时间更早被重发。

:::

## 配置分块

你可以通过配置特定参数来限制消费者同时维护的分块消息的最大数量。当达到配置的阈值时，消费者会通过静默确认这些待处理消息或要求 broker 稍后重新分发它们来丢弃这些消息。

以下是如何配置消息分块的示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

   ```java
   Consumer<byte[]> consumer = client.newConsumer()
        .topic(topic)
        .subscriptionName("test")
        .autoAckOldestChunkedMessageOnQueueFull(true)
        .maxPendingChunkedMessage(100)
        .expireTimeOfIncompleteChunkedMessage(10, TimeUnit.MINUTES)
        .subscribe();
   ```

 </TabItem>
 <TabItem value="C++">

   ```cpp
   ConsumerConfiguration conf;
   conf.setAutoAckOldestChunkedMessageOnQueueFull(true);
   conf.setMaxPendingChunkedMessage(100);
   Consumer consumer;
   client.subscribe("my-topic", "my-sub", conf, consumer);
   ```

 </TabItem>
 <TabItem value="Go">
Coming soon...

 </TabItem>
 <TabItem value="Python">

   ```python
   consumer = client.subscribe(topic, "my-subscription",
                    max_pending_chunked_message=10,
                    auto_ack_oldest_chunked_message_on_queue_full=False
                    )
   ```

  </TabItem>
</Tabs>
````

## 使用消息监听器创建消费者

你可以通过使用消息监听器来避免运行带有阻塞调用的循环，监听器会在每条收到的消息时被调用。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
Consumer<String> consumer = pulsarClient.newConsumer(Schema.STRING)
                      .topic("persistent://my-property/my-ns/my-topic")
                      .subscriptionName("my-subscription")
                      .messageListener((c, m) -> {
                          try {
                              c.acknowledge(m);
                          } catch (Exception e) {
                              Assert.fail("Failed to acknowledge", e);
                          }
                      })
                      .subscribe();
```

</TabItem>


<TabItem value="C++">

此示例从最早的偏移量开始订阅并消费 100 条消息。

```cpp
#include <pulsar/Client.h>
#include <atomic>
#include <thread>

using namespace pulsar;

std::atomic<uint32_t> messagesReceived;

void handleAckComplete(Result res) {
    std::cout << "Ack res: " << res << std::endl;
}

void listener(Consumer consumer, const Message& msg) {
    std::cout << "Got message " << msg << " with content '" << msg.getDataAsString() << "'" << std::endl;
    messagesReceived++;
    consumer.acknowledgeAsync(msg.getMessageId(), handleAckComplete);
}

int main() {
    Client client("pulsar://localhost:6650");

    Consumer consumer;
    ConsumerConfiguration config;
    config.setMessageListener(listener);
    config.setSubscriptionInitialPosition(InitialPositionEarliest);
    Result result = client.subscribe("persistent://public/default/my-topic", "consumer-1", config, consumer);
    if (result != ResultOk) {
        std::cout << "Failed to subscribe: " << result << std::endl;
        return -1;
    }

    // 等待消费 100 条消息
    while (messagesReceived < 100) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    std::cout << "Finished consuming asynchronously!" << std::endl;

    client.close();
    return 0;
}
```

</TabItem>
<TabItem value="Go">

```go
import (
    "fmt"
    "log"

    "github.com/apache/pulsar-client-go/pulsar"
)

func main() {
    client, err := pulsar.NewClient(pulsar.ClientOptions{URL: "pulsar://localhost:6650"})
    if err != nil {
        log.Fatal(err)
    }

    defer client.Close()

    // 我们可以监听这个通道
    channel := make(chan pulsar.ConsumerMessage, 100)

    options := pulsar.ConsumerOptions{
        Topic:            "topic-1",
        SubscriptionName: "my-subscription",
        Type:             pulsar.Shared,
        // 填写 `MessageChannel` 字段会创建一个监听器
        MessageChannel: channel,
    }

    consumer, err := client.Subscribe(options)
    if err != nil {
        log.Fatal(err)
    }

    defer consumer.Close()

    // 从通道接收消息。通道返回一个 struct `ConsumerMessage`，它包含消息和接收消息的消费者。
    // 这里不是必需的，因为我们只有一个消费者，但该通道也可以在多个消费者之间共享
    for cm := range channel {
        consumer := cm.Consumer
        msg := cm.Message
        fmt.Printf("Consumer %s received a message, msgId: %v, content: '%s'\n",
            consumer.Name(), msg.ID(), string(msg.Payload()))

        consumer.Ack(msg)
    }
}
```

  </TabItem>
</Tabs>
````

## 拦截消息

`ConsumerInterceptor` 可以拦截并可能修改消费者收到的消息。

该接口有六个主要事件：
* `beforeConsume` 在消息通过 `receive()` 或 `receiveAsync()` 返回之前触发。你可以在该事件内修改消息。
* `onAcknowledge` 在消费者向 broker 发送确认之前触发。
* `onAcknowledgeCumulative` 在消费者向 broker 发送累积确认之前触发。
* `onNegativeAcksSend` 在发生否认确认的重发时触发。
* `onAckTimeoutSend` 在发生确认超时的重发时触发。
* `onPartitionsChange` 在（分区）主题的分区发生变化时触发。

要拦截消息，你可以在创建 `Consumer` 时添加一个或多个 `ConsumerInterceptor`，如下所示。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

   ```java
   Consumer<String> consumer = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .intercept(new ConsumerInterceptor<String> {
              @Override
              public Message<String> beforeConsume(Consumer<String> consumer, Message<String> message) {
                  // 用户自定义的处理逻辑
              }

              @Override
              public void onAcknowledge(Consumer<String> consumer, MessageId messageId, Throwable cause) {
                  // 用户自定义的处理逻辑
              }

              @Override
              public void onAcknowledgeCumulative(Consumer<String> consumer, MessageId messageId, Throwable cause) {
                  // 用户自定义的处理逻辑
              }

              @Override
              public void onNegativeAcksSend(Consumer<String> consumer, Set<MessageId> messageIds) {
                  // 用户自定义的处理逻辑
              }

              @Override
              public void onAckTimeoutSend(Consumer<String> consumer, Set<MessageId> messageIds) {
                  // 用户自定义的处理逻辑
              }

              @Override
              public void onPartitionsChange(String topicName, int partitions) {
                  // 用户自定义的处理逻辑
              }
        })
        .subscribe();
   ```

  </TabItem>
</Tabs>
````

:::note

如果你正在使用多个拦截器，它们会按照传递给 `intercept` 方法的顺序应用。

:::