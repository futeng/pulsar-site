---
id: client-libraries-dotnet-use
title: 使用 C# 客户端
sidebar_label: "使用"
description: 学习如何在 Pulsar 中使用 C# 客户端。
---

本节介绍一些实践示例，帮助您开始使用 Pulsar C# 客户端。

## 创建生产者

本节描述如何创建生产者。

- 使用构建器创建生产者。

  ```csharp
  using DotPulsar;
  using DotPulsar.Extensions;

  var producer = client.NewProducer()
                       .Topic("persistent://public/default/mytopic")
                       .Create();
  ```

- 不使用构建器创建生产者。

  ```csharp
  using DotPulsar;

  var options = new ProducerOptions<byte[]>("persistent://public/default/mytopic", Schema.ByteArray);
  var producer = client.CreateProducer(options);
  ```

### 监控

此示例显示如何监控生产者的状态。

```csharp
private static async ValueTask Monitor(IProducer producer, CancellationToken cancellationToken)
{
    var state = ProducerState.Disconnected;

    while (!cancellationToken.IsCancellationRequested)
    {
        state = (await producer.StateChangedFrom(state, cancellationToken)).ProducerState;

        var stateMessage = state switch
        {
            ProducerState.Connected => $"生产者已连接",
            ProducerState.Disconnected => $"生产者已断开连接",
            ProducerState.Closed => $"生产者已关闭",
            ProducerState.Faulted => $"生产者发生故障",
            ProducerState.PartiallyConnected => $"生产者部分连接。",
            _ => $"生产者处于未知状态 '{state}'"
        };

        Console.WriteLine(stateMessage);

        if (producer.IsFinalState(state))
            return;
    }
}
```

下表列出了生产者的可用状态。

| 状态 | 描述 |
| ---- | ----|
| Closed | 生产者或 Pulsar 客户端已被释放。 |
| Connected | 一切正常。 |
| Disconnected | 连接丢失，正在尝试重新连接。 |
| Faulted | 发生了不可恢复的错误。 |
| PartiallyConnected | 部分子生产者已断开连接。 |

## 创建消费者

本节描述如何创建消费者。

- 使用构建器创建消费者。

  ```csharp
  using DotPulsar;
  using DotPulsar.Extensions;

  var consumer = client.NewConsumer()
                       .SubscriptionName("MySubscription")
                       .Topic("persistent://public/default/mytopic")
                       .Create();
  ```

- 不使用构建器创建消费者。

  ```csharp
  using DotPulsar;

  var options = new ConsumerOptions<byte[]>("MySubscription", "persistent://public/default/mytopic", Schema.ByteArray);
  var consumer = client.CreateConsumer(options);
  ```

### 监控

此示例显示如何监控消费者的状态。

```csharp
private static async ValueTask Monitor(IConsumer consumer, CancellationToken cancellationToken)
{
    var state = ConsumerState.Disconnected;

    while (!cancellationToken.IsCancellationRequested)
    {
        state = (await consumer.StateChangedFrom(state, cancellationToken)).ConsumerState;

        var stateMessage = state switch
        {
            ConsumerState.Active => "消费者处于活动状态",
            ConsumerState.Inactive => "消费者处于非活动状态",
            ConsumerState.Disconnected => "消费者已断开连接",
            ConsumerState.Closed => "消费者已关闭",
            ConsumerState.ReachedEndOfTopic => "消费者已到达主题末尾",
            ConsumerState.Faulted => "消费者发生故障",
            ConsumerState.Unsubscribed => "消费者已取消订阅。",
            _ => $"消费者处于未知状态 '{state}'"
        };

        Console.WriteLine(stateMessage);

        if (consumer.IsFinalState(state))
            return;
    }
}
```

下表列出了消费者的可用状态。

| 状态 | 描述 |
| ---- | ----|
| Active | 一切正常。 |
| Inactive | 一切正常。订阅类型为 `Failover`，但您不是活动消费者。 |
| Closed | 消费者或 Pulsar 客户端已被释放。 |
| Disconnected | 连接丢失，正在尝试重新连接。 |
| Faulted | 发生了不可恢复的错误。 |
| ReachedEndOfTopic | 不再传递更多消息。 |
| Unsubscribed | 消费者已取消订阅。 |

## 创建读取器

本节描述如何创建读取器。

- 使用构建器创建读取器。

  ```csharp
  using DotPulsar;
  using DotPulsar.Extensions;

  var reader = client.NewReader()
                     .StartMessageId(MessageId.Earliest)
                     .Topic("persistent://public/default/mytopic")
                     .Create();
  ```

- 不使用构建器创建读取器。

  ```csharp
  using DotPulsar;

  var options = new ReaderOptions<byte[]>(MessageId.Earliest, "persistent://public/default/mytopic", Schema.ByteArray);
  var reader = client.CreateReader(options);
  ```

### 监控

此示例显示如何监控读取器的状态。

```csharp
private static async ValueTask Monitor(IReader reader, CancellationToken cancellationToken)
{
    var state = ReaderState.Disconnected;

    while (!cancellationToken.IsCancellationRequested)
    {
        state = (await reader.StateChangedFrom(state, cancellationToken)).ReaderState;

        var stateMessage = state switch
        {
            ReaderState.Connected => "读取器已连接",
            ReaderState.Disconnected => "读取器已断开连接",
            ReaderState.Closed => "读取器已关闭",
            ReaderState.ReachedEndOfTopic => "读取器已到达主题末尾",
            ReaderState.Faulted => "读取器发生故障",
            _ => $"读取器处于未知状态 '{state}'"
        };

        Console.WriteLine(stateMessage);

        if (reader.IsFinalState(state))
            return;
    }
}
```

下表列出了读取器的可用状态。

| 状态 | 描述 |
| ---- | ----|
| Closed | 读取器或 Pulsar 客户端已被释放。 |
| Connected | 一切正常。 |
| Disconnected | 连接丢失，正在尝试重新连接。 |
| Faulted | 发生了不可恢复的错误。 |
| ReachedEndOfTopic | 不再传递更多消息。 |