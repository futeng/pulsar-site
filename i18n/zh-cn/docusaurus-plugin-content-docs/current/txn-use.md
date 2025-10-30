---
id: txn-use
title: Get started
sidebar_label: "Get started"
description: Get started to use Pulsar transaction API.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

Pulsar 事务主要是服务器端和协议级别的功能。本教程指导您如何使用 [Pulsar 事务 API](/api/admin/) 在 Java 客户端中发送和接收消息的每一步。

:::note

目前，[Pulsar 事务 API](/api/admin/) 在 **Pulsar 2.8.0 或更高版本**中可用。它仅适用于 **Java**、**Go** 和 **.NET** 客户端。

:::
## 前置条件

- [启动 Pulsar 2.8.0 或更高版本](getting-started-standalone.md)

## 步骤

要使用 Pulsar 事务 API，请完成以下步骤。

1. 启用事务。

    您可以在 [`broker.conf`](https://github.com/apache/pulsar/blob/master/conf/broker.conf) 或 [`standalone.conf`](https://github.com/apache/pulsar/blob/master/conf/standalone.conf) 文件中设置以下配置。

    ```conf
    // 必需配置，用于启用事务协调器
    transactionCoordinatorEnabled=true

    // 必需配置，用于创建系统 Topic 用于事务缓冲区快照
    systemTopicEnabled=true
    ```

    :::note

    **默认情况下**，Pulsar 事务是**禁用**的。

    :::

2. 初始化事务协调器元数据。

    事务协调器可以利用分区 Topic 的优势（如负载均衡）。

    **输入**

    ```shell
    bin/pulsar initialize-transaction-coordinator-metadata -cs 127.0.0.1:2181 -c standalone
    ```

    **输出**

    ```shell
    Transaction coordinator metadata setup success
    ```

3. 创建 Pulsar 客户端并启用事务。由于客户端需要从系统 Topic 了解事务协调器，请确保您的客户端角色具有系统命名空间 `pulsar/system` 的生产/消费权限。

4. 创建生产者和消费者。

5. 生产和接收消息。

6. 创建事务。

7. 使用事务生产和确认消息。

    :::note

    目前，消息只能单独确认，而不是累积确认。

    :::

8. 结束事务。

    :::tip

    下面的代码片段是步骤 3 - 步骤 8 的示例。

    :::

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Go","value":"Go"}]}>

<TabItem value="Java">

```java
PulsarClient client = PulsarClient.builder()
                // 步骤 3：创建 Pulsar 客户端并启用事务。
                .enableTransaction(true)
                .serviceUrl(jct.serviceUrl)
                .build();

// 步骤 4：创建三个生产者向输入和输出 Topic 生产消息。
ProducerBuilder<String> producerBuilder = client.newProducer(Schema.STRING);
Producer<String> inputProducer = producerBuilder.topic(inputTopic)
        .sendTimeout(0, TimeUnit.SECONDS).create();
Producer<String> outputProducerOne = producerBuilder.topic(outputTopicOne)
        .sendTimeout(0, TimeUnit.SECONDS).create();
Producer<String> outputProducerTwo = producerBuilder.topic(outputTopicTwo)
        .sendTimeout(0, TimeUnit.SECONDS).create();
// 步骤 4：创建三个消费者从输入和输出 Topic 消费消息。
Consumer<String> inputConsumer = client.newConsumer(Schema.STRING)
        .subscriptionName("your-subscription-name").topic(inputTopic).subscribe();
Consumer<String> outputConsumerOne = client.newConsumer(Schema.STRING)
        .subscriptionName("your-subscription-name").topic(outputTopicOne).subscribe();
Consumer<String> outputConsumerTwo = client.newConsumer(Schema.STRING)
        .subscriptionName("your-subscription-name").topic(outputTopicTwo).subscribe();

int count = 2;
// 步骤 5：向输入 Topic 生产消息。
for (int i = 0; i < count; i++) {
    inputProducer.send("Hello Pulsar! count : " + i);
}

// 步骤 5：消费消息并使用事务将它们生产到输出 Topic。
for (int i = 0; i < count; i++) {

    // 步骤 5：消费者成功接收消息。
    Message<String> message = inputConsumer.receive();

    // 步骤 6：创建事务。
    // 事务超时设置为 10 秒。
    // 如果事务在 10 秒内未提交，事务将自动中止。
    Transaction txn = null;
    try {
        txn = client.newTransaction()
                .withTransactionTimeout(10, TimeUnit.SECONDS).build().get();
        // 步骤 6：您可以根据您的用例和业务逻辑处理接收到的消息。

        // 步骤 7：生产者使用事务向输出 Topic 生产消息
        outputProducerOne.newMessage(txn).value("Hello Pulsar! outputTopicOne count : " + i).send();
        outputProducerTwo.newMessage(txn).value("Hello Pulsar! outputTopicTwo count : " + i).send();

        // 步骤 7：消费者使用事务*单独*确认输入消息。
        inputConsumer.acknowledgeAsync(message.getMessageId(), txn).get();
        // 步骤 8：提交事务。
        txn.commit().get();
    } catch (ExecutionException e) {
        if (!(e.getCause() instanceof PulsarClientException.TransactionConflictException)) {
            // 如果未抛出 TransactionConflictException，
            // 您需要重新传递或否定确认此消息，
            // 否则此消息将不会被再次接收。
            inputConsumer.negativeAcknowledge(message);
        }

        // 如果创建了新事务，
        // 那么应该中止旧事务。
        if (txn != null) {
            txn.abort();
        }
    }
}

// 最终结果：从输出 Topic 消费消息并打印它们。
for (int i = 0; i < count; i++) {
    Message<String> message =  outputConsumerOne.receive();
    System.out.println("Receive transaction message: " + message.getValue());
}

for (int i = 0; i < count; i++) {
    Message<String> message =  outputConsumerTwo.receive();
    System.out.println("Receive transaction message: " + message.getValue());
}
```

</TabItem>
<TabItem value="Go">

```go
// 步骤 3：创建 Pulsar 客户端并启用事务。
client, err := pulsar.NewClient(pulsar.ClientOptions{
  URL:               "<serviceUrl>",
  EnableTransaction: true,
})
if err != nil {
  log.Fatalf("create client fail, err = %v", err)
}
defer client.Close()
// 步骤 4：创建三个生产者向输入和输出 Topic 生产消息。
inputTopic := "inputTopic"
outputTopicOne := "outputTopicOne"
outputTopicTwo := "outputTopicTwo"
subscriptionName := "your-subscription-name"
inputProducer, _ := client.CreateProducer(pulsar.ProducerOptions{
  Topic:       inputTopic,
  SendTimeout: 0,
})
defer inputProducer.Close()
outputProducerOne, _ := client.CreateProducer(pulsar.ProducerOptions{
  Topic:       outputTopicOne,
  SendTimeout: 0,
})
defer outputProducerOne.Close()
outputProducerTwo, _ := client.CreateProducer(pulsar.ProducerOptions{
  Topic:       outputTopicTwo,
  SendTimeout: 0,
})
defer outputProducerTwo.Close()

// 步骤 4：创建三个消费者从输入和输出 Topic 消费消息。
inputConsumer, _ := client.Subscribe(pulsar.ConsumerOptions{
  Topic:            inputTopic,
  SubscriptionName: subscriptionName,
})
defer inputConsumer.Close()
outputConsumerOne, _ := client.Subscribe(pulsar.ConsumerOptions{
  Topic:            outputTopicOne,
  SubscriptionName: subscriptionName,
})
defer outputConsumerOne.Close()
outputConsumerTwo, _ := client.Subscribe(pulsar.ConsumerOptions{
  Topic:            outputTopicTwo,
  SubscriptionName: subscriptionName,
})
defer outputConsumerTwo.Close()

// 步骤 5：向输入 Topic 生产消息。
ctx := context.Background()
count := 2
for i := 0; i < count; i++ {
  inputProducer.Send(ctx, &pulsar.ProducerMessage{
    Payload: []byte(fmt.Sprintf("Hello Pulsar! count : %d", i)),
  })
}
// 步骤 5：消费消息并使用事务将它们生产到输出 Topic。
for i := 0; i < count; i++ {
  // 步骤 5：消费者成功接收消息。
  message, err := inputConsumer.Receive(ctx)
  if err != nil {
    log.Printf("receive message from %s fail, err = %v", inputTopic, err)
    continue
  }
  // 步骤 6：创建事务。
  // 事务超时设置为 10 秒。
  // 如果事务在 10 秒内未提交，事务将自动中止。
  txn, err := client.NewTransaction(10 * time.Second)
  if err != nil {
    log.Printf("create txn fail, err = %v", err)
    continue
  }
  // 步骤 6：您可以根据您的用例和业务逻辑处理接收到的消息。
  // processMessage(message)
  // 步骤 7：生产者使用事务向输出 Topic 生产消息
  _, err = outputProducerOne.Send(context.Background(), &pulsar.ProducerMessage{
    Transaction: txn,
    Payload:     []byte(fmt.Sprintf("Hello Pulsar! outputTopicOne count : %d", i)),
  })
  if err != nil {
    log.Printf("send to producerOne fail %v", err)
    txn.Abort(ctx)
  }
  _, err = outputProducerTwo.Send(context.Background(), &pulsar.ProducerMessage{
    Transaction: txn,
    Payload:     []byte(fmt.Sprintf("Hello Pulsar! outputTopicTwo count : %d", i)),
  })
  if err != nil {
    log.Printf("send to producerTwo fail %v", err)
    txn.Abort(ctx)
  }
  // 步骤 7：消费者使用事务*单独*确认输入消息。
  err = inputConsumer.AckWithTxn(message, txn)
  if err != nil {
    log.Printf("ack message fail %v", err)
    txn.Abort(ctx)
  }
  // 步骤 8：提交事务。
  err = txn.Commit(ctx)
  if err != nil {
    log.Printf("commit txn fail %v", err)
  }
}

// 最终结果：从输出 Topic 消费消息并打印它们。
for i := 0; i < count; i++ {
  message, _ := outputConsumerOne.Receive(ctx)
  log.Printf("Receive transaction message: %s", string(message.Payload()))
}
for i := 0; i < count; i++ {
  message, _ := outputConsumerTwo.Receive(ctx)
  log.Printf("Receive transaction message: %s", string(message.Payload()))
}
```

</TabItem>
</Tabs>
````

    **输出**

    ```java
    Receive transaction message: Hello Pulsar! count : 1
    Receive transaction message: Hello Pulsar! count : 2
    Receive transaction message: Hello Pulsar! count : 1
    Receive transaction message: Hello Pulsar! count : 2
    ```

## 相关主题

- 要了解可与事务一起使用的更多功能，请参阅 [Pulsar 事务 - 高级功能](txn-advanced-features.md)。