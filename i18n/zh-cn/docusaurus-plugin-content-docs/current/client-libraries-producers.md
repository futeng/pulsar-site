---
id: client-libraries-producers
title: 使用生产者
sidebar_label: "使用生产者"
description: 学习如何在 Pulsar 中使用生产者。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

设置好客户端后，你可以探索更多以开始使用[生产者](concepts-clients.md#producers)。

## 创建生产者

此示例显示如何创建生产者。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"}]}>

  <TabItem value="Java">

  同步创建生产者：
  ```java
  Producer<String> producer = pulsarClient.newProducer(Schema.STRING)
                .topic("my-topic")
                .create();
  ```

  异步创建生产者：
  ```java
  pulsarClient.newProducer(Schema.STRING)
                .topic("my-topic")
                .createAsync()
                .thenAccept(p -> {
                    log.info("Producer created: {}", p.getProducerName());
                });
  ```

  </TabItem>

  <TabItem value="C++">

  ```cpp
  Producer producer;
  Result result = client.createProducer("my-topic", producer);
  ```

  </TabItem>
</Tabs>
````

## 发布消息

Pulsar 在大多数客户端中支持同步和异步发布消息。在一些特定语言的客户端中，如 Node.js 和 C#，你可以使用特定语言的机制（如 `await`）基于异步方法同步发布消息。

对于异步发布，生产者将消息放入阻塞队列并立即返回。然后客户端库在后台将消息发送到 broker。如果队列已满（最大大小可配置），根据传递给生产者的参数，生产者在调用 API 时会被阻塞或立即失败。

此示例显示如何使用生产者发布消息。发布操作会一直进行，直到 broker 告知你消息已成功发布。消息成功发布后，broker 返回消息 ID。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"},{"label":"Node.js","value":"Node.js"},{"label":"C#","value":"C#"}]}>
<TabItem value="Java">

  同步发布消息：
  ```java
  MessageId messageId = producer.newMessage()
                    .value("my-sync-message")
                    .send();
  ```

  异步发布消息：
  ```java
  producer.newMessage()
          .value("my-sync-message")
          .sendAsync()
          .thenAccept(messageId -> {
              log.info("Message ID: {}", messageId);
          });
  ```

  </TabItem>

  <TabItem value="C++">

  ```cpp
  Message msg = MessageBuilder()
                      .setContent("my-sync-message")
                      .build();
  Result res = producer.send(msg);
  ```

  </TabItem>

  <TabItem value="Go">

   ```go
    msg := pulsar.ProducerMessage{
        Payload: []byte("my-sync-message"),
    }

    if _, err := producer.send(msg); err != nil {
      log.Fatalf("Could not publish message due to: %v", err)
    }
   ```

  有关 `ProducerMessage` 对象的所有方法，请参阅 [Go API 文档](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#ProducerMessage)。

  </TabItem>
  <TabItem value="Node.js">

   ```javascript
   const msg = {
   data: Buffer.from('my-sync-message'),
   }

   await producer.send(msg);
   ```

生产者消息对象可以使用以下键：

| 参数 | 描述 |
| :-------- | :---------- |
| `data` | 消息的实际数据负载。 |
| `properties` | 一个 Object，用于附加到消息的任何应用程序特定的元数据。 |
| `eventTimestamp` | 与消息关联的时间戳。 |
| `sequenceId` | 消息的序列 ID。 |
| `partitionKey` | 与消息关联的可选键（对于主题压缩等特别有用）。 |
| `replicationClusters` | 此消息要复制到的集群。Pulsar broker 自动处理消息复制；只有当你想要覆盖 broker 默认设置时才应更改此设置。 |
| `deliverAt` | 消息被传递的绝对时间戳或之后的时间。 | |
| `deliverAfter` | 消息被传递的相对延迟。 | |

**消息对象操作**

在 Pulsar Node.js 客户端中，你可以接收（或读取）消息对象作为消费者（或读取器）。

消息对象具有以下可用方法：

| 方法 | 描述 | 返回类型 |
| :----- | :---------- | :---------- |
| `getTopicName()` | 主题名称的 getter 方法。 | `String` |
| `getProperties()` | 属性的 getter 方法。 | `Array<Object>` |
| `getData()` | 消息数据的 getter 方法。 | `Buffer` |
| `getMessageId()` | [消息 ID 对象](#message-id-object-operations)的 getter 方法。 | `Object` |
| `getPublishTimestamp()` | 发布时间戳的 getter 方法。 | `Number` |
| `getEventTimestamp()` | 事件时间戳的 getter 方法。 | `Number` |
| `getRedeliveryCount()` | 重新传递计数的 getter 方法。 | `Number` |
| `getPartitionKey()` | 分区键的 getter 方法。 | `String` |

**消息 ID 对象操作**

在 Pulsar Node.js 客户端中，你可以从消息对象获取消息 ID 对象。

消息 ID 对象具有以下可用方法：

| 方法 | 描述 | 返回类型 |
| :----- | :---------- | :---------- |
| `serialize()` | 将消息 ID 序列化为 Buffer 以供存储。 | `Buffer` |
| `toString()` | 将消息 ID 作为 String 获取。 | `String` |

客户端具有消息 ID 对象的静态方法。你可以将其作为 `Pulsar.MessageId.someStaticMethod` 访问。

消息 ID 对象可以使用以下静态方法：

| 方法 | 描述 | 返回类型 |
| :----- | :---------- | :---------- |
| `earliest()` | 表示主题中存储的最早或最旧可用消息的 MessageId。 | `Object` |
| `latest()` | 表示主题中最新或最后发布消息的 MessageId。 | `Object` |
| `deserialize(Buffer)` | 从 Buffer 反序列化消息 ID 对象。 | `Object` |

 </TabItem>

<TabItem value="C#">

```csharp
var data = Encoding.UTF8.GetBytes("Hello World");
await producer.Send(data);
```

  </TabItem>
</Tabs>
````

## 配置消息

你可以设置 Pulsar 消息的各种属性。这些属性的值存储在消息的元数据中。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"C#","value":"C#"}]}>

<TabItem value="Java">

  ```java
  producer.newMessage()
                .key("my-key") // 设置消息键
                .eventTime(System.currentTimeMillis()) // 设置事件时间
                .sequenceId(1203) // 为去重目的设置 sequenceId
                .deliverAfter(1, TimeUnit.HOURS) // 延迟消息传递 1 小时
                .property("my-key", "my-value") // 设置自定义元数据
                .property("my-other-key", "my-other-value")
                .replicationClusters(
                        Lists.newArrayList("r1", "r2")) // 设置此消息的地理位置复制集群。
                .value("content")
                .send();
  ```

  对于 Java 客户端，你也可以使用 `loadConf` 来配置消息元数据。这是一个示例：
  ```java
  Map<String, Object> conf = new HashMap<>();
  conf.put("key", "my-key");
  conf.put("eventTime", System.currentTimeMillis());
  producer.newMessage()
          .value("my-message")
          .loadConf(conf)
          .send();
  ```

</TabItem>

<TabItem value="C++">

  ```cpp
  Message msg = MessageBuilder()
                    .setContent("content")
                    .setProperty("my-key", "my-value")
                    .setProperty("my-other-key", "my-other-value")
                    .setDeliverAfter(std::chrono::minutes(3)) // 延迟消息传递 3 分钟
                    .build();
  Result res = producer.send(msg);
  ```

</TabItem>

<TabItem value="Go">

  ```go
  ID, err := producer.Send(context.Background(), &pulsar.ProducerMessage{
       Payload:      []byte(fmt.Sprintf("content")),
       DeliverAfter: 3 * time.Second, // 延迟消息传递 3 秒
   })
   if err != nil {
       log.Fatal(err)
   }
  ```

</TabItem>

<TabItem value="C#">

  ```csharp
  var messageId = await producer.NewMessage()
                              .Property("SomeKey", "SomeValue")
                              .Send(data);
  ```

</TabItem>
</Tabs>
````

## 向分区主题发布消息

默认情况下，Pulsar 主题由单个 broker 提供服务，这限制了主题的最大吞吐量。*分区主题*可以跨越多个 broker，从而允许更高的吞吐量。

你可以使用 Pulsar 客户端库向分区主题发布消息。向分区主题发布消息时，必须指定路由模式。如果在创建新生产者时未指定任何路由模式，则使用轮循路由模式。

### 使用内置消息路由器

路由模式确定每条消息应发布到哪个分区（内部主题）。

以下是一个示例：

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"}]}>
  <TabItem value="Java">

   ```java
   Producer<byte[]> producer = pulsarClient.newProducer()
      .topic("my-topic")
      .messageRoutingMode(MessageRoutingMode.SinglePartition)
      .create();
   ```

  </TabItem>

  <TabItem value="C++">

   ```cpp
   #include "lib/RoundRobinMessageRouter.h" // 确保包含此头文件

  Producer producer;
  Result result = client.createProducer(
      "my-topic",
      ProducerConfiguration().setMessageRouter(std::make_shared<RoundRobinMessageRouter>(
          ProducerConfiguration::BoostHash, true, 1000, 100000, boost::posix_time::seconds(1))),
      producer);
   ```

  </TabItem>

  <TabItem value="Go">

   ```go
    producer, err := client.CreateProducer(pulsar.ProducerOptions{
        Topic: "my-topic",
        MessageRouter: func(msg *pulsar.ProducerMessage, tm pulsar.TopicMetadata) int {
            fmt.Println("Topic has", tm.NumPartitions(), "partitions. Routing message ", msg, " to partition 2.")
            // 总是将消息推送到分区 2
            return 2
        },
    })
   ```

  </TabItem>
</Tabs>
````

### 自定义消息路由器

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

要使用自定义消息路由器，你需要提供 [MessageRouter](/api/client/org/apache/pulsar/client/api/MessageRouter) 接口的实现，该接口只有一个 `choosePartition` 方法：

```java
public interface MessageRouter extends Serializable {
    int choosePartition(Message msg);
}
```

以下路由器将每条消息路由到分区 10：

```java
public class AlwaysTenRouter implements MessageRouter {
    public int choosePartition(Message msg) {
        return 10;
    }
}
```

使用该实现，你可以如下所示向分区主题发送消息。

```java
Producer<byte[]> producer = pulsarClient.newProducer()
        .topic("my-topic")
        .messageRouter(new AlwaysTenRouter())
        .create();
producer.send("Partitioned topic message".getBytes());
```

  </TabItem>

  <TabItem value="C++">

要使用自定义消息路由器，你需要提供 `MessageRoutingPolicy` 接口的实现，该接口有一个 `getPartition` 方法：

```cpp
class MessageRouter : public MessageRoutingPolicy {
   public:
    MessageRouter() : {}

    int getPartition(const Message& msg, const TopicMetadata& topicMetadata) {
        // getPartition 的实现
    }

};
```

以下路由器将每条消息路由到分区 10：
```cpp
class MessageRouter : public MessageRoutingPolicy {
   public:
    MessageRouter() {}

    int getPartition(const Message& msg, const TopicMetadata& topicMetadata) {
        return 10;
    }
};
```

使用该实现，你可以如下所示向分区主题发送消息。
```cpp
Producer producer;
Result result = client.createProducer(
    "my-topic",
    ProducerConfiguration().setMessageRouter(std::make_shared<MessageRouter>()),
    producer);
Message msg = MessageBuilder().setContent("content").build();
result = producer.send(msg);
```
  </TabItem>

  <TabItem value="Go">

  在 Go 客户端中，你可以通过传递函数来配置自定义消息路由器。
   ```go
    producer, err := client.CreateProducer(pulsar.ProducerOptions{
        Topic: "my-topic",
        MessageRouter: func(msg *pulsar.ProducerMessage, tm pulsar.TopicMetadata) int {
            fmt.Println("Topic has", tm.NumPartitions(), "partitions. Routing message ", msg, " to partition 10.")
            // 总是将消息推送到分区 10
            return 10
        },
    })
   ```

  </TabItem>
</Tabs>
````

### 使用键时选择分区

如果消息有键，它会覆盖轮循路由策略。以下 Java 示例代码说明了如何在使用键时选择分区。

```java
// 如果消息有键，它会覆盖轮循路由策略
if (msg.hasKey()) {
    return signSafeMod(hash.makeHash(msg.getKey()), topicMetadata.numPartitions());
}

if (isBatchingEnabled) { // 如果启用了批处理，在 `partitionSwitchMs` 边界上选择分区。
    long currentMs = clock.millis();
    return signSafeMod(currentMs / partitionSwitchMs + startPtnIdx, topicMetadata.numPartitions());
} else {
    return signSafeMod(PARTITION_INDEX_UPDATER.getAndIncrement(this), topicMetadata.numPartitions());
}
```

## 启用分块

消息[分块](concepts-messaging.md#chunking)使 Pulsar 能够通过在生产者端将消息分割为块并在消费者端聚合分块消息来处理大负载消息。

消息分块功能默认关闭。以下是在创建生产者时如何启用消息分块的示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

   ```java
     Producer<byte[]> producer = client.newProducer()
        .topic(topic)
        .enableChunking(true)
        .enableBatching(false)
        .create();
   ```

  </TabItem>
  <TabItem value="C++">

   ```cpp
   ProducerConfiguration conf;
   conf.setBatchingEnabled(false);
   conf.setChunkingEnabled(true);
   Producer producer;
   client.createProducer("my-topic", conf, producer);
   ```

  </TabItem>
  <TabItem value="Go">

   ```go
   // 消息分块功能默认关闭。
   // 默认情况下，生产者根据在 broker 端配置的最大消息大小（`maxMessageSize`）对大消息进行分块（例如，5MB）。
   // 客户端也可以使用生产者配置 `ChunkMaxMessageSize` 配置最大分块大小。
   // 注意：要启用分块，你需要同时禁用批处理（`DisableBatching=true`）。
   producer, err := client.CreateProducer(pulsar.ProducerOptions{
     Topic:               "my-topic",
     DisableBatching:     true,
     EnableChunking:      true,
   })

   if err != nil {
   	log.Fatal(err)
   }
   defer producer.Close()
   ```

  </TabItem>
  <TabItem value="Python">

   ```python
   producer = client.create_producer(
            topic,
            chunking_enabled=True
        )
   ```

  </TabItem>
</Tabs>
````

默认情况下，生产者根据在 broker 配置的最大消息大小（`maxMessageSize`）对大消息进行分块（例如：5MB）。但是，客户端也可以使用生产者配置 `chunkMaxMessageSize` 配置最大分块大小。

:::note

要启用分块，你需要同时禁用批处理（`enableBatching`=`false`）。

:::

## 拦截消息

`ProducerInterceptor` 拦截并可能修改生产者接收到的消息，然后将其发布到 broker。

该接口有三个主要事件：
* `eligible` 检查拦截器是否可以应用于消息。
* `beforeSend` 在生产者将消息发送到 broker 之前触发。你可以在此事件中修改消息。
* `onSendAcknowledgement` 在消息被 broker 确认或发送失败时触发。

要拦截消息，你可以在创建 `Producer` 时添加一个 `ProducerInterceptor` 或多个拦截器，如下所示。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"}]}>
<TabItem value="Java">

   ```java
   Producer<byte[]> producer = client.newProducer()
        .topic(topic)
        .intercept(new ProducerInterceptor {
			@Override
			boolean eligible(Message message) {
			    return true;  // 处理所有消息
			}

			@Override
			Message beforeSend(Producer producer, Message message) {
			    // 用户定义的处理逻辑
			}

			@Override
			void onSendAcknowledgement(Producer producer, Message message, MessageId msgId, Throwable exception) {
			    // 用户定义的处理逻辑
			}
        })
        .create();
   ```

  </TabItem>

  <TabItem value="C++">
    实现自定义拦截器：

   ```cpp
    class MyInterceptor : public ProducerInterceptor {
      public:
        MyInterceptor() {}

        Message beforeSend(const Producer& producer, const Message& message) override {
          // 你的实现代码
          return message;
        }

        void onSendAcknowledgement(const Producer& producer, Result result, const Message& message,
                                  const MessageId& messageID) override {
          // 你的实现代码
        }

        void close() override {
          // 你的实现代码
        }
    };
   ```

   配置生产者：

   ```cpp
    ProducerConfiguration conf;
    conf.intercept({std::make_shared<MyInterceptor>(),
                    std::make_shared<MyInterceptor>()}); // 你可以向同一个生产者添加多个拦截器
    Producer producer;
    client.createProducer(topic, conf, producer);
   ```

  </TabItem>
</Tabs>
````

:::note

多个拦截器按照传递给 `intercept` 方法的顺序应用。

:::

## 配置加密策略

Pulsar C# 客户端支持四种加密策略：

- `EnforceUnencrypted`：始终使用未加密连接。
- `EnforceEncrypted`：始终使用加密连接。
- `PreferUnencrypted`：如果可能，使用未加密连接。
- `PreferEncrypted`：如果可能，使用加密连接。

此示例显示如何设置 `EnforceUnencrypted` 加密策略。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="C#"
  values={[{"label":"C#","value":"C#"}]}>
<TabItem value="C#">

   ```csharp
   using DotPulsar;

   var client = PulsarClient.Builder()
                         .ConnectionSecurity(EncryptionPolicy.EnforceEncrypted)
                         .Build();
   ```

  </TabItem>
</Tabs>
````

## 配置访问模式

[访问模式](concepts-clients.md#access-mode)允许应用程序要求对主题的独占生产者访问以实现"单一写入者"情况。

此示例显示如何设置生产者访问模式。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"}]}>
<TabItem value="Java">

:::note

此功能在 Java 客户端 2.8.0 或更高版本中受支持。

:::

   ```java
   Producer<byte[]> producer = client.newProducer()
        .topic(topic)
        .accessMode(ProducerAccessMode.Exclusive)
        .create();
   ```

  </TabItem>

<TabItem value="C++">

:::note

此功能在 C++ 客户端 3.1.0 或更高版本中受支持。

:::

   ```cpp
    Producer producer;
    ProducerConfiguration producerConfiguration;
    producerConfiguration.setAccessMode(ProducerConfiguration::Exclusive);
    client.createProducer(topicName, producerConfiguration, producer);
   ```

  </TabItem>

</Tabs>
````