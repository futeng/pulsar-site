---
id: client-libraries-java-use
title: 使用 Java 客户端
sidebar_label: "使用"
description: 学习如何在 Pulsar 中使用 Java 客户端。
---

## 创建生产者

一旦您实例化了 [PulsarClient](/api/client/org/apache/pulsar/client/api/PulsarClient) 对象，就可以为特定的 Pulsar [主题](reference-terminology.md#topic)创建 [Producer](/api/client/org/apache/pulsar/client/api/Producer)。

```java
Producer<byte[]> producer = client.newProducer()
        .topic("my-topic")
        .create();

// 然后您可以将消息发送到您指定的 broker 和主题：
producer.send("My message".getBytes());
```

默认情况下，生产者产生由字节数组组成的消息。您可以通过指定消息 [Schema](#schema) 来产生不同类型的消息。

```java
Producer<String> stringProducer = client.newProducer(Schema.STRING)
        .topic("my-topic")
        .create();
stringProducer.send("My message");
```

> 确保在不需要时关闭您的生产者、消费者和客户端。

> ```java
> producer.close();
> consumer.close();
> client.close();
> ```

>
> 关闭操作也可以是异步的：

> ```java
> producer.closeAsync()
>    .thenRun(() -> System.out.println("Producer closed"))
>    .exceptionally((ex) -> {
>        System.err.println("Failed to close producer: " + ex);
>        return null;
>    });
> ```

## 创建消费者

在 Pulsar 中，消费者订阅主题并处理生产者发布到这些主题的消息。您可以通过首先实例化 [PulsarClient](/api/client/org/apache/pulsar/client/api/PulsarClient) 对象并传递一个 Pulsar broker 的 URL（如[上文](#client-configuration)所示）来实例化新的[消费者](reference-terminology.md#consumer)。

一旦您实例化了 [PulsarClient](/api/client/org/apache/pulsar/client/api/PulsarClient) 对象，您可以通过指定[主题](reference-terminology.md#topic)和[订阅](concepts-messaging.md#subscription-types)来创建 [Consumer](/api/client/org/apache/pulsar/client/api/Consumer)。

```java
Consumer consumer = client.newConsumer()
        .topic("my-topic")
        .subscriptionName("my-subscription")
        .subscribe();
```

`subscribe` 方法将自动将消费者订阅到指定的主题和订阅。让消费者监听主题的一种方法是设置 `while` 循环。在此示例循环中，消费者监听消息，打印任何接收到的消息的内容，然后[确认](reference-terminology.md#acknowledgment-ack)消息已被处理。如果处理逻辑失败，您可以使用[否定确认](reference-terminology.md#acknowledgment-ack)稍后重新传递消息。

```java
while (true) {
  // 等待消息
  Message msg = consumer.receive();

  try {
      // 对消息执行某些操作
      System.out.println("Message received: " + new String(msg.getData()));

      // 确认消息
      consumer.acknowledge(msg);
  } catch (Exception e) {
      // 消息处理失败，稍后重新传递
      consumer.negativeAcknowledge(msg);
  }
}
```

如果您不想阻塞主线程但持续监听新消息，请考虑使用 `MessageListener`。`MessageListener` 将使用 PulsarClient 内部的线程池。您可以在 ClientBuilder 中设置用于消息监听器的线程数。

```java
MessageListener myMessageListener = (consumer, msg) -> {
  try {
      System.out.println("Message received: " + new String(msg.getData()));
      consumer.acknowledge(msg);
  } catch (Exception e) {
      consumer.negativeAcknowledge(msg);
  }
}

Consumer consumer = client.newConsumer()
     .topic("my-topic")
     .subscriptionName("my-subscription")
     .messageListener(myMessageListener)
     .subscribe();
```

## 创建读取器

使用[读取器接口](concepts-clients.md#reader-interface)，Pulsar 客户端可以在主题内"手动定位"自己，并从指定消息开始读取所有消息。Pulsar Java API 使您能够通过指定主题和 [MessageId](/api/client/org/apache/pulsar/client/api/MessageId) 来创建 [Reader](/api/client/org/apache/pulsar/client/api/Reader) 对象。

以下是一个示例。

```java
byte[] msgIdBytes = // 某些消息 ID 字节数组
MessageId id = MessageId.fromByteArray(msgIdBytes);
Reader reader = pulsarClient.newReader()
        .topic(topic)
        .startMessageId(id)
        .create();

while (true) {
    Message message = reader.readNext();
    // 处理消息
}
```

在上面的示例中，为特定主题和消息（通过 ID）实例化了 `Reader` 对象；读取器在 `msgIdBytes` 标识的消息之后迭代主题中的每条消息（如何获得该值取决于应用程序）。

上面的代码示例显示将 `Reader` 对象指向特定消息（通过 ID），但您也可以使用 `MessageId.earliest` 指向主题上最早可用的消息，或使用 `MessageId.latest` 指向最近可用的消息。