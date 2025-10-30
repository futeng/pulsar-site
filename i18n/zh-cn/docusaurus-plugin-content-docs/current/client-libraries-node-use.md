---
id: client-libraries-node-use
title: 使用 Node.js 客户端
sidebar_label: "使用"
description: 学习如何在 Pulsar 中使用 Node.js 客户端。
---

## 创建生产者

您可以使用[生产者配置](client-libraries-node-configs.md#producer-configuration)对象配置 Node.js 生产者。

以下是一个示例：

```javascript
const producer = await client.createProducer({
  topic: 'my-topic', // 或 'my-tenant/my-namespace/my-topic' 来指定主题的租户和命名空间
});

await producer.send({
  data: Buffer.from("Hello, Pulsar"),
});

await producer.close();
```

:::note

当您创建新的 Pulsar 生产者时，操作返回 `Promise` 对象，并通过执行器函数获取生产者实例或错误。在上面的示例中，使用 `await` 操作符而不是执行器函数。

:::

#### 生产者操作

Pulsar Node.js 生产者提供以下方法：

| 方法 | 描述 | 返回类型 |
| :----- | :---------- | :---------- |
| `send(Object)` | 将[消息](#messages)发布到生产者的主题。当消息被 Pulsar 代理成功确认或抛出错误时，结果为消息 ID 的 Promise 对象运行执行器函数。 | `Promise<Object>` |
| `flush()` | 将发送队列中的消息发送到 Pulsar 代理。当消息被 Pulsar 代理成功确认或抛出错误时，Promise 对象运行执行器函数。 | `Promise<null>` |
| `close()` | 关闭生产者并释放分配给它的所有资源。一旦调用 `close()`，发布者不再接受消息。此方法返回一个 Promise 对象。当所有挂起的发布请求被 Pulsar 持久化时，它运行执行器函数。如果抛出错误，不会重试挂起的写入。 | `Promise<null>` |
| `getProducerName()` | 生产者名称的 getter 方法。 | `string` |
| `getTopic()` | 主题名称的 getter 方法。 | `string` |

#### 生产者示例

此示例为 `my-topic` 主题创建一个 Node.js 生产者，并向该主题发送 10 条消息：

```javascript
const Pulsar = require('pulsar-client');

(async () => {
  // 创建客户端
  const client = new Pulsar.Client({
    serviceUrl: 'pulsar://localhost:6650',
  });

  // 创建生产者
  const producer = await client.createProducer({
    topic: 'my-topic',
  });

  // 发送消息
  for (let i = 0; i < 10; i += 1) {
    const msg = `my-message-${i}`;
    producer.send({
      data: Buffer.from(msg),
    });
    console.log(`Sent message: ${msg}`);
  }
  await producer.flush();

  await producer.close();
  await client.close();
})();
```

## 创建消费者

您可以使用[消费者配置](client-libraries-node-configs.md#consumer-configuration)对象配置 Node.js 消费者。

以下是一个示例：

```javascript
const consumer = await client.subscribe({
  topic: 'my-topic',
  subscription: 'my-subscription',
});

const msg = await consumer.receive();
console.log(msg.getData().toString());
consumer.acknowledge(msg);

await consumer.close();
```

:::note
当您创建新的 Pulsar 消费者时，操作返回 `Promise` 对象，并通过执行器函数获取消费者实例或错误。在此示例中，使用 `await` 操作符而不是执行器函数。
:::

#### 消费者操作

Pulsar Node.js 消费者提供以下方法：

| 方法 | 描述 | 返回类型 |
| :----- | :---------- | :---------- |
| `receive()` | 从主题接收单条消息。当消息可用时，Promise 对象运行执行器函数并获取消息对象。 | `Promise<Object>` |
| `receive(Number)` | 从主题接收单条消息，带有以毫秒为单位的特定超时时间。 | `Promise<Object>` |
| `acknowledge(Object)` | 通过消息对象向 Pulsar [代理](reference-terminology.md#broker)[确认](reference-terminology.md#acknowledgment-ack)消息。 | `void` |
| `acknowledgeId(Object)` | 通过消息 ID 对象向 Pulsar [代理](reference-terminology.md#broker)[确认](reference-terminology.md#acknowledgment-ack)消息。 | `void` |
| `acknowledgeCumulative(Object)` | [确认](reference-terminology.md#acknowledgment-ack)流中的*所有*消息，包括并直到指定的消息。`acknowledgeCumulative` 方法返回 void，并将确认异步发送到代理。之后，消息*不会*重新传递给消费者。累积确认不能与[共享](concepts-messaging.md#shared)订阅类型一起使用。 | `void` |
| `acknowledgeCumulativeId(Object)` | [确认](reference-terminology.md#acknowledgment-ack)流中的*所有*消息，包括并直到指定的消息 ID。 | `void` |
| `negativeAcknowledge(Message)`| 通过消息对象向 Pulsar 代理[否定确认](reference-terminology.md#negative-acknowledgment-nack)消息。 | `void` |
| `negativeAcknowledgeId(MessageId)` | 通过消息 ID 对象向 Pulsar 代理[否定确认](reference-terminology.md#negative-acknowledgment-nack)消息。 | `void` |
| `close()` | 关闭消费者，禁用其从代理接收消息的能力。 | `Promise<null>` |
| `unsubscribe()` | 取消订阅。 | `Promise<null>` |

#### 消费者示例

此示例在 `my-topic` 主题上创建一个具有 `my-subscription` 订阅的 Node.js 消费者，接收消息，打印到达的内容，并向 Pulsar 代理确认每条消息 10 次：

```javascript
const Pulsar = require('pulsar-client');

(async () => {
  // 创建客户端
  const client = new Pulsar.Client({
    serviceUrl: 'pulsar://localhost:6650',
  });

  // 创建消费者
  const consumer = await client.subscribe({
    topic: 'my-topic',
    subscription: 'my-subscription',
    subscriptionType: 'Exclusive',
  });

  // 接收消息
  for (let i = 0; i < 10; i += 1) {
    const msg = await consumer.receive();
    console.log(msg.getData().toString());
    consumer.acknowledge(msg);
  }

  await consumer.close();
  await client.close();
})();
```

或者，可以使用 `listener` 创建消费者来处理消息。

```javascript
// 创建消费者
const consumer = await client.subscribe({
  topic: 'my-topic',
  subscription: 'my-subscription',
  subscriptionType: 'Exclusive',
  listener: (msg, msgConsumer) => {
    console.log(msg.getData().toString());
    msgConsumer.acknowledge(msg);
  },
});
```

:::note

Pulsar Node.js 客户端使用 [AsyncWorker](https://github.com/nodejs/node-addon-api/blob/main/doc/async_worker)。创建消费者/生产者和接收/发送消息等异步操作在工作线程中执行。
在完成这些操作之前，工作线程被阻塞。
由于默认只有 4 个工作线程，调用的方法可能永远不会完成。
为避免这种情况，您可以设置 `UV_THREADPOOL_SIZE` 来增加工作线程的数量，或者定义 `listener` 而不是多次调用 `receive()`。

:::

## 创建读取器

Pulsar 读取器与消费者不同，因为使用读取器时，您需要明确指定要从流中的哪条消息开始（而消费者会自动从最近未确认的消息开始）。您可以使用[读取器配置](client-libraries-node-configs.md#reader-configuration)对象配置 Node.js 读取器。

以下是一个示例：

```javascript
const reader = await client.createReader({
  topic: 'my-topic',
  startMessageId: Pulsar.MessageId.earliest(),
});

const msg = await reader.readNext();
console.log(msg.getData().toString());

await reader.close();
```

#### 读取器操作

Pulsar Node.js 读取器提供以下方法：

| 方法 | 描述 | 返回类型 |
| :----- | :---------- | :---------- |
| `readNext()` | 接收主题上的下一条消息（类似于[消费者](#consumer-operations)的 `receive` 方法）。当消息可用时，Promise 对象运行执行器函数并获取消息对象。 | `Promise<Object>` |
| `readNext(Number)` | 从主题接收单条消息，带有以毫秒为单位的特定超时时间。 | `Promise<Object>` |
| `hasNext()` | 返回代理在目标主题中是否有下一条消息。 | `Boolean` |
| `close()` | 关闭读取器，禁用其从代理接收消息的能力。 | `Promise<null>` |

#### 读取器示例

此示例为 `my-topic` 主题创建一个 Node.js 读取器，读取消息，并打印到达的内容 10 次：

```javascript
const Pulsar = require('pulsar-client');

(async () => {
  // 创建客户端
  const client = new Pulsar.Client({
    serviceUrl: 'pulsar://localhost:6650',
    operationTimeoutSeconds: 30,
  });

  // 创建读取器
  const reader = await client.createReader({
    topic: 'my-topic',
    startMessageId: Pulsar.MessageId.earliest(),
  });

  // 读取消息
  for (let i = 0; i < 10; i += 1) {
    const msg = await reader.readNext();
    console.log(msg.getData().toString());
  }

  await reader.close();
  await client.close();
})();
```