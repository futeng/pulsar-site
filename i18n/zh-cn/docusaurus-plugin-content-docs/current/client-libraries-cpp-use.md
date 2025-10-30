---
id: client-libraries-cpp-use
title: 使用 C++ 客户端
sidebar_label: "使用"
description: 了解如何在 Pulsar 中使用 C++ 客户端。
---

## 创建生产者

要将 Pulsar 用作生产者，你需要在 C++ 客户端上创建一个生产者。使用生产者主要有两种方式：
- [阻塞式](#简单阻塞式示例)：每次调用 `send` 都会等待来自 broker 的确认。
- [非阻塞异步式](#非阻塞式示例)：调用 `sendAsync` 而不是 `send`，并在收到来自 broker 的确认时提供回调。

### 简单阻塞式示例

此示例使用阻塞式发送 100 条消息。虽然简单，但它不会产生高吞吐量，因为它会等待每次确认返回后再发送下一条消息。

```cpp
#include <pulsar/Client.h>
#include <thread>

using namespace pulsar;

int main() {
    Client client("pulsar://localhost:6650");

    Producer producer;

    Result result = client.createProducer("persistent://public/default/my-topic", producer);
    if (result != ResultOk) {
        std::cout << "Error creating producer: " << result << std::endl;
        return -1;
    }

    // 同步发送 100 条消息
    int ctr = 0;
    while (ctr < 100) {
        std::string content = "msg" + std::to_string(ctr);
        Message msg = MessageBuilder().setContent(content).setProperty("x", "1").build();
        Result result = producer.send(msg);
        if (result != ResultOk) {
            std::cout << "The message " << content << " could not be sent, received code: " << result << std::endl;
        } else {
            std::cout << "The message " << content << " sent successfully" << std::endl;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        ctr++;
    }

    std::cout << "Finished producing synchronously!" << std::endl;

    client.close();
    return 0;
}
```

### 非阻塞式示例

此示例使用非阻塞式，调用 `sendAsync` 而不是 `send` 来发送 100 条消息。这使得生产者可以同时有多个消息在传输中，从而提高吞吐量。

生产者配置 `blockIfQueueFull` 在这里很有用，可以避免当用于发送请求的内部队列变满时出现 `ResultProducerQueueIsFull` 错误。一旦内部队列变满，`sendAsync` 会变成阻塞式，这可以使你的代码更简单。

如果没有这个配置，结果代码 `ResultProducerQueueIsFull` 会传递给回调。你必须决定如何处理这种情况（重试、丢弃等）。

```cpp
#include <pulsar/Client.h>
#include <thread>
#include <atomic>

using namespace pulsar;

std::atomic<uint32_t> acksReceived;

void callback(Result code, const MessageId& msgId, std::string msgContent) {
    // 此处的消息处理逻辑
    std::cout << "Received ack for msg: " << msgContent << " with code: "
        << code << " -- MsgID: " << msgId << std::endl;
    acksReceived++;
}

int main() {
    Client client("pulsar://localhost:6650");

    ProducerConfiguration producerConf;
    producerConf.setBlockIfQueueFull(true);
    Producer producer;
    Result result = client.createProducer("persistent://public/default/my-topic",
                                          producerConf, producer);
    if (result != ResultOk) {
        std::cout << "Error creating producer: " << result << std::endl;
        return -1;
    }

    // 异步发送 100 条消息
    int ctr = 0;
    while (ctr < 100) {
        std::string content = "msg" + std::to_string(ctr);
        Message msg = MessageBuilder().setContent(content).setProperty("x", "1").build();
        producer.sendAsync(msg, std::bind(callback,
                                          std::placeholders::_1, std::placeholders::_2, content));

        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        ctr++;
    }

    // 等待 100 条消息被确认
    while (acksReceived < 100) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    std::cout << "Finished producing asynchronously!" << std::endl;

    client.close();
    return 0;
}
```

### 分区主题和延迟生产者

当扩展 Pulsar 主题时，你可能将主题配置为具有数百个分区。同样，你可能也已经扩展了生产者，所以有数百甚至数千个生产者。这可能会给 Pulsar broker 带来一些压力，因为当你在分区主题上创建生产者时，它内部会为每个分区创建一个内部生产者，每个内部生产者都需要与 broker 通信。因此，对于有 1000 个分区和 1000 个生产者的主题，最终会在生产者应用程序中创建 1,000,000 个内部生产者，每个内部生产者都必须与 broker 通信以确定应该连接到哪个 broker，然后执行连接握手。

你可以通过以下方式减少由大量分区和许多生产者组合造成的负载：
- 使用 SinglePartition 分区路由模式（这确保所有消息只发送到一个随机选择的单个分区）
- 使用非键控消息（当消息有键时，路由基于键的哈希值，因此消息最终会被发送到多个分区）
- 使用延迟生产者（这确保只有在需要将消息路由到分区时才按需创建内部生产者）

使用我们上面的示例，这将分散在 1000 个生产者应用程序中的内部生产者数量从 1,000,000 减少到仅 1000 个。

请注意，发送第一条消息可能会有额外的延迟。如果你设置了较低的发送超时时间，如果初始连接握手完成缓慢，可能会达到这个超时时间。

```cpp
ProducerConfiguration producerConf;
producerConf.setPartitionsRoutingMode(ProducerConfiguration::UseSinglePartition);
producerConf.setLazyStartPartitionedProducers(true);
```

## 创建消费者

要将 Pulsar 用作消费者，你需要在 C++ 客户端上创建一个消费者。使用消费者主要有两种方式：
- [阻塞式](#阻塞式示例)：同步调用 `receive(msg)`。
- [非阻塞式](#带有消息监听器的消费者）（基于事件）样式：使用消息监听器。

### 阻塞式示例

这种方法的好处是代码最简单。只需不断调用 `receive(msg)`，它会阻塞直到接收到消息。

此示例从最早的偏移量开始订阅并消费 100 条消息。

```cpp
#include <pulsar/Client.h>

using namespace pulsar;

int main() {
    Client client("pulsar://localhost:6650");

    Consumer consumer;
    ConsumerConfiguration config;
    config.setSubscriptionInitialPosition(InitialPositionEarliest);
    Result result = client.subscribe("persistent://public/default/my-topic", "consumer-1", config, consumer);
    if (result != ResultOk) {
        std::cout << "Failed to subscribe: " << result << std::endl;
        return -1;
    }

    Message msg;
    int ctr = 0;
    // 消费 100 条消息
    while (ctr < 100) {
        consumer.receive(msg);
        std::cout << "Received: " << msg
            << "  with payload '" << msg.getDataAsString() << "'" << std::endl;

        consumer.acknowledge(msg);
        ctr++;
    }

    std::cout << "Finished consuming synchronously!" << std::endl;

    client.close();
    return 0;
}
```