---
id: client-libraries-node-configs
title: Pulsar Node.js 客户端配置
sidebar_label: "配置"
description: 全面了解 Pulsar Node.js 客户端的可配置参数。
---


## 客户端配置

Pulsar Node.js 客户端提供以下可配置参数：

| 参数 | 描述 | 默认值 |
| :-------- | :---------- | :------ |
| `serviceUrl` | Pulsar 集群的连接 URL。详见[上方](#connection-urls)。 |  |
| `authentication` | 配置身份验证提供者。（默认：无身份验证）。详见[mTLS 身份验证](security-tls-authentication.md)。 | |
| `operationTimeoutSeconds` | Node.js 客户端操作的超时时间（创建生产者、订阅和取消订阅[主题](reference-terminology.md#topic)）。重试会一直进行，直到达到此阈值，此时操作失败。 | 30 |
| `ioThreads` | 用于处理与 Pulsar [代理](reference-terminology.md#broker)连接的线程数。 | 1 |
| `messageListenerThreads` | 消息监听器（[消费者](#consumers)和[读取器](#readers)）使用的线程数。 | 1 |
| `concurrentLookupRequest` | 每个代理连接上可以发送的并发查找请求数。设置最大值有助于防止代理过载。仅当客户端需要生产和/或订阅数千个 Pulsar 主题时，才应将值设置为超过默认的 50000。 | 50000 |
| `tlsTrustCertsFilePath` | 信任的 TLS 证书的文件路径。 | |
| `tlsValidateHostname` | 设置是否启用 TLS 主机名验证的布尔值。 | `false` |
| `tlsAllowInsecureConnection` | 设置 Pulsar 客户端是否接受来自代理的不受信任的 TLS 证书的布尔值。 | `false` |
| `statsIntervalInSeconds` | 每个统计信息之间的间隔。统计信息通过正的 statsInterval 激活。该值应至少设置为 1 秒 | 600 |
| `log` | 用于记录日志的函数。 | `console.log` |


## 生产者配置

| 参数 | 描述 | 默认值 |
| :-------- | :---------- | :------ |
| `topic` | 生产者发布消息的 Pulsar [主题](reference-terminology.md#topic)。主题格式为 `<topic-name>` 或 `<tenant-name>/<namespace-name>/<topic-name>`。例如，`sample/ns1/my-topic`。 | |
| `producerName` | 生产者的名称。如果您没有明确分配名称，Pulsar 会自动生成一个全局唯一的名称。如果您选择明确分配名称，它需要在*所有* Pulsar 集群中是唯一的，否则创建操作会抛出错误。 | |
| `sendTimeoutMs` | 当向主题发布消息时，生产者等待负责的 Pulsar [代理](reference-terminology.md#broker)的确认。如果消息在此参数设置的超时时间内未被确认，则抛出错误。如果将 `sendTimeoutMs` 设置为 -1，则超时设置为无穷大（从而被移除）。当使用 Pulsar 的[消息去重](cookbooks-deduplication.md)功能时，建议移除发送超时。 | 30000 |
| `initialSequenceId` | 消息的初始序列 ID。当生产者发送消息时，向消息添加序列 ID。每次发送时 ID 会增加。 | |
| `maxPendingMessages` | 保存待处理消息的队列的最大大小（即等待接收[代理](reference-terminology.md#broker)确认的消息）。默认情况下，当队列已满时，所有对 `send` 方法的调用都会失败，*除非* `blockIfQueueFull` 设置为 `true`。 | 1000 |
| `maxPendingMessagesAcrossPartitions` | 分区待处理队列总和的最大大小。 | 50000 |
| `blockIfQueueFull` | 如果设置为 `true`，当传出消息队列已满时，生产者的 `send` 方法会等待而不是失败并抛出错误（该队列的大小由 `maxPendingMessages` 参数决定）；如果设置为 `false`（默认），当队列已满时 `send` 操作会失败并抛出错误。 | `false` |
| `messageRoutingMode` | 消息路由逻辑（用于[分区主题](concepts-messaging.md#partitioned-topics)上的生产者）。此逻辑仅在消息上未设置键时应用。可用选项有：轮询（`RoundRobinDistribution`），或将所有消息发布到单个分区（`UseSinglePartition`，默认）。 | `UseSinglePartition` |
| `hashingScheme` | 确定特定消息发布到哪个分区的哈希函数（仅限分区主题）。可用选项有：`JavaStringHash`（相当于 Java 中的 `String.hashCode()`）、`Murmur3_32Hash`（应用 [Murmur3](https://en.wikipedia.org/wiki/MurmurHash) 哈希函数）或 `BoostHash`（应用 C++ [Boost](https://www.boost.org/doc/libs/1_62_0/doc/html/hash.html) 库中的哈希函数）。 | `BoostHash` |
| `compressionType` | 生产者使用的消息数据压缩类型。可用选项有 [`LZ4`](https://github.com/lz4/lz4)、[`Zlib`](https://zlib.net/)、[ZSTD](https://github.com/facebook/zstd/)、[SNAPPY](https://github.com/google/snappy/)。 | 无压缩 |
| `batchingEnabled` | 如果设置为 `true`，生产者以批处理方式发送消息。 | `true` |
| `batchingMaxPublishDelayMs` | 批处理中延迟发送消息的最大时间。 | 10 |
| `batchingMaxMessages` | 每次批处理中发送消息的最大数量。 | 1000 |
| `properties` | 生产者的元数据。 | |

## 消费者配置

| 参数 | 描述 | 默认值 |
| :-------- | :---------- | :------ |
| `topic` | 消费者建立订阅并监听消息的 Pulsar 主题。 | |
| `topics` | 主题数组。 | |
| `topicsPattern` | 主题的正则表达式。 | |
| `subscription` | 此消费者的订阅名称。 | |
| `subscriptionType` | 可用选项有 `Exclusive`、`Shared`、`Key_Shared` 和 `Failover`。 | `Exclusive` |
| `subscriptionInitialPosition` | 首次订阅主题时设置游标的初始位置。 | `SubscriptionInitialPosition.Latest` |
| `ackTimeoutMs` | 确认超时时间（毫秒）。 | 0 |
| `nAckRedeliverTimeoutMs` | 重新传递处理失败的消息之前的等待延迟。 | 60000 |
| `receiverQueueSize` | 设置消费者接收队列的大小，即在应用程序调用 `receive` 之前消费者可以累积的消息数量。高于默认 1000 的值可能会增加消费者吞吐量，但代价是更多内存使用。 | 1000 |
| `receiverQueueSizeAcrossPartitions` | 设置跨分区的最大总接收队列大小。如果总和超过此值，此设置用于减少各个分区的接收队列大小。 | 50000 |
| `consumerName` | 消费者的名称。当前（v2.4.1），[故障转移](concepts-messaging.md#failover)模式在排序中使用消费者名称。 | |
| `properties` | 消费者的元数据。 | |
| `listener`| 为收到的消息调用的监听器。 | |
| `readCompacted`| 如果启用 `readCompacted`，消费者从压缩主题读取消息，而不是读取主题的完整消息积压。<br /><br />消费者只看到压缩主题中每个键的最新值，直到达到主题消息中压缩积压的点。超过该点后，正常发送消息。<br /><br /> `readCompacted` 只能在对持久主题的订阅上启用，这些主题只有一个活跃消费者（如故障转移或独占订阅）。<br /><br />尝试在非持久主题的订阅上或共享订阅上启用它会导致订阅调用抛出 `PulsarClientException`。 | false |

## 读取器配置

| 参数 | 描述 | 默认值 |
| :-------- | :---------- | :------ |
| `topic` | 读取器建立订阅并监听消息的 Pulsar [主题](reference-terminology.md#topic)。 | |
| `startMessageId` | 初始读取器位置，即读取器开始处理消息的消息。选项有 `Pulsar.MessageId.earliest`（主题上最早可用的消息）、`Pulsar.MessageId.latest`（主题上最新可用的消息）或非最早或最新位置的消息 ID 对象。 | |
| `receiverQueueSize` | 设置读取器接收队列的大小，即在应用程序调用 `readNext` 之前读取器可以累积的消息数量。高于默认 1000 的值可能会增加读取器吞吐量，但代价是更多内存使用。 | 1000 |
| `readerName` | 读取器的名称。 |  |
| `subscriptionRolePrefix` | 订阅角色前缀。 | |
| `readCompacted` | 如果启用 `readCompacted`，消费者从压缩主题读取消息，而不是读取主题的完整消息积压。<br /><br />消费者只看到压缩主题中每个键的最新值，直到达到主题消息中压缩积压的点。超过该点后，正常发送消息。<br /><br /> `readCompacted` 只能在对持久主题的订阅上启用，这些主题只有一个活跃消费者（如故障转移或独占订阅）。<br /><br />尝试在非持久主题的订阅上或共享订阅上启用它会导致订阅调用抛出 `PulsarClientException`。 | `false` |