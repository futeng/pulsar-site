---
id: client-libraries-readers
title: 使用读取器
sidebar_label: "使用读取器"
description: 学习如何在 Pulsar 中使用读取器。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

设置好客户端后，你可以探索更多以开始使用[读取器](concepts-clients.md#reader-interface)。

## 接收和读取消息

读取器只是一个没有游标的消费者。这意味着 Pulsar 不会跟踪你的进度，也不需要确认消息。

这是一个从主题上最早可用消息开始读取的示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C#","value":"C#"}]}>
<TabItem value="Java">

   ```java
   import org.apache.pulsar.client.api.Message;
   import org.apache.pulsar.client.api.MessageId;
   import org.apache.pulsar.client.api.Reader;

   // 在主题上创建一个读取器，用于特定消息（及后续消息）
   Reader<byte[]> reader = pulsarClient.newReader()
       .topic("reader-api-test")
       .startMessageId(MessageId.earliest)
       .create();

   while (true) {
       Message message = reader.readNext();

       // 处理消息
   }
   ```

  </TabItem>
  <TabItem value="C#">

   ```csharp
   await foreach (var message in reader.Messages())
   {
       Console.WriteLine("Received: " + Encoding.UTF8.GetString(message.Data.ToArray()));
   }
   ```

  </TabItem>
</Tabs>
````

### 读取`下一条`消息

创建从最新可用消息开始读取的读取器：

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
Reader<byte[]> reader = pulsarClient.newReader()
    .topic(topic)
    .startMessageId(MessageId.latest)
    .create();
```

  </TabItem>
  <TabItem value="Go">

```go
import (
    "context"
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

    reader, err := client.CreateReader(pulsar.ReaderOptions{
        Topic:          "topic-1",
        StartMessageID: pulsar.EarliestMessageID(),
    })
    if err != nil {
        log.Fatal(err)
    }
    defer reader.Close()

    for reader.HasNext() {
        msg, err := reader.Next(context.Background())
        if err != nil {
            log.Fatal(err)
        }

        fmt.Printf("Received message msgId: %#v -- content: '%s'\n",
            msg.ID(), string(msg.Payload()))
    }
}
```

在上面的示例中，读取器从最早可用消息开始读取（由 `pulsar.EarliestMessage` 指定）。读取器也可以从最新消息（`pulsar.LatestMessage`）开始读取，或者使用 `DeserializeMessageID` 函数从字节指定的其他消息 ID 开始读取，该函数接受字节数组并返回 `MessageID` 对象。这是一个示例：

```go
lastSavedId := // 从外部存储读取最后保存的消息 id 作为字节数组

reader, err := client.CreateReader(pulsar.ReaderOptions{
    Topic:          "my-golang-topic",
    StartMessageID: pulsar.DeserializeMessageID(lastSavedId),
})
```

  </TabItem>
</Tabs>
````

### 读取特定消息

创建从最早和最新之间的某个消息开始读取的读取器：

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
byte[] msgIdBytes = // 某个字节数组
MessageId id = MessageId.fromByteArray(msgIdBytes);
Reader<byte[]> reader = pulsarClient.newReader()
    .topic(topic)
    .startMessageId(id)
    .create();
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

topic := "topic-1"
ctx := context.Background()

// 创建生产者
producer, err := client.CreateProducer(pulsar.ProducerOptions{
    Topic:           topic,
    DisableBatching: true,
})
if err != nil {
    log.Fatal(err)
}
defer producer.Close()

// 发送 10 条消息
msgIDs := [10]pulsar.MessageID{}
for i := 0; i < 10; i++ {
    msgID, _ := producer.Send(ctx, &pulsar.ProducerMessage{
        Payload: []byte(fmt.Sprintf("hello-%d", i)),
    })
    msgIDs[i] = msgID
}

// 在第 5 条消息上创建读取器（不包含）
reader, err := client.CreateReader(pulsar.ReaderOptions{
    Topic:                   topic,
    StartMessageID:          msgIDs[4],
    StartMessageIDInclusive: false,
})

if err != nil {
    log.Fatal(err)
}
defer reader.Close()

// 接收剩余的 5 条消息
for i := 5; i < 10; i++ {
    msg, err := reader.Next(context.Background())
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Read %d-th msg: %s\n", i, string(msg.Payload()))
}
// 在第 5 条消息上创建读取器（包含）
readerInclusive, err := client.CreateReader(pulsar.ReaderOptions{
    Topic:                   topic,
    StartMessageID:          msgIDs[4],
    StartMessageIDInclusive: true,
})

if err != nil {
    log.Fatal(err)
}
defer readerInclusive.Close()
```

  </TabItem>
</Tabs>
````

## 配置分块

为读取器配置分块与为消费者配置分块类似。有关更多信息，请参阅[为消费者配置分块](#configure-chunking)。

以下是如何为读取器配置消息分块的示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
Reader<byte[]> reader = pulsarClient.newReader()
        .topic(topicName)
        .startMessageId(MessageId.earliest)
        .maxPendingChunkedMessage(12)
        .autoAckOldestChunkedMessageOnQueueFull(true)
        .expireTimeOfIncompleteChunkedMessage(12, TimeUnit.MILLISECONDS)
        .create();
```

  </TabItem>
</Tabs>
````

## 拦截消息

Pulsar 读取器拦截器拦截并可能在使用用户定义处理之前修改消息，然后[Pulsar 读取器](concepts-clients.md#reader-interface)读取它们。使用读取器拦截器，你可以在消息可以被读取之前应用统一的消息处理过程，如修改消息、添加属性、收集统计等，而无需分别创建类似的机制。

![Pulsar 中的读取器拦截器](/assets/reader-interceptor.svg)

Pulsar 读取器拦截器在 Pulsar 消费者拦截器之上工作。插件接口 `ReaderInterceptor` 可以被视为 `ConsumerInterceptor` 的子集，它有两个主要事件。
* `beforeRead` 在读取器读取消息之前触发。你可以在此事件中修改消息。
* `onPartitionsChange` 在检测到分区更改时触发。

要感知触发的事件并执行自定义处理，你可以在创建 `Reader` 时添加 `ReaderInterceptor`，如下所示。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
PulsarClient pulsarClient = PulsarClient.builder().serviceUrl("pulsar://localhost:6650").build();
Reader<byte[]> reader = pulsarClient.newReader()
        .topic("t1")
        .autoUpdatePartitionsInterval(5, TimeUnit.SECONDS)
        .intercept(new ReaderInterceptor<byte[]>() {
            @Override
            public void close() {
            }

            @Override
            public Message<byte[]> beforeRead(Reader<byte[]> reader, Message<byte[]> message) {
                // 用户定义的处理逻辑
                return message;
            }

            @Override
            public void onPartitionsChange(String topicName, int partitions) {
                // 用户定义的处理逻辑
            }
        })
        .startMessageId(MessageId.earliest)
        .create();
```

  </TabItem>
</Tabs>
````

## 粘性键范围读取器

在粘性键范围读取器中，broker 只分发消息键的哈希值包含在指定键哈希范围内的消息。可以在一个读取器上指定多个键哈希范围。

以下是创建粘性键范围读取器的示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
pulsarClient.newReader()
        .topic(topic)
        .startMessageId(MessageId.earliest)
        .keyHashRange(Range.of(0, 10000), Range.of(20001, 30000))
        .create();
```

  </TabItem>
</Tabs>
````

总哈希范围大小为 65536，因此范围的最大结束值应小于或等于 65535。