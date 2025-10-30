---
id: developing-binary-protocol
title: Pulsar 二进制协议规范
sidebar_label: "二进制协议"
---

Pulsar 使用自定义二进制协议进行生产者/消费者与 Broker 之间的通信。该协议旨在支持所需功能，如确认和流控制，同时确保最大的传输和实现效率。

客户端和 Broker 相互交换*命令*。命令被格式化为二进制[协议缓冲区](https://developers.google.com/protocol-buffers/)（aka *protobuf*）消息。
protobuf 命令的格式在 [`PulsarApi.proto`](https://github.com/apache/pulsar/blob/master/pulsar-common/src/main/proto/PulsarApi.proto) 文件中指定，并在下面的 [Protobuf 接口](#protobuf-接口)部分中记录。

> ### 连接共享
> 不同生产者和消费者的命令可以交错并通过同一连接发送，不受限制。

与 Pulsar 协议相关的所有命令都包含在一个 [`BaseCommand`](#pulsar.protobufaseCommand) protobuf 消息中，该消息包括一个带有所有可能子命令作为可选字段的 [`Type`](#pulsar.proto.Type) [枚举](https://developers.google.com/protocol-buffers/docs/proto#enum)。
`BaseCommand` 消息只能指定一个子命令。

## 帧格式

由于 protobuf 不提供任何消息帧格式，Pulsar 协议中的所有消息都前缀一个 4 字节字段，用于指定帧的大小。单个帧的最大允许大小为 5 MB。

Pulsar 协议允许两种类型的命令：

1. **简单命令**，不携带消息负载。
2. **负载命令**，带有在发布或传递消息时使用的负载。在负载命令中，protobuf 命令数据后跟 protobuf [元数据](#消息元数据)，然后是负载，负载以原始格式在 protobuf 外部传递。所有大小都以 4 字节无符号大端整数传递。

> 消息负载以原始格式而不是 protobuf 格式传递是出于效率考虑。

### 简单命令

简单（无负载）命令具有以下基本结构：

| 组件         | 描述                                      | 大小（字节） |
|:--------------|:-----------------------------------------|:------------|
| `totalSize`   | 帧的大小，计算它后面的所有内容（字节）     | 4           |
| `commandSize` | protobuf 序列化命令的大小                 | 4           |
| `command`     | protobuf 序列化命令                       |             |

### 消息命令

负载命令具有以下基本结构：

| 组件                          | 必需或可选 | 描述                                                                                                                                                                                                    | 大小（字节） |
|:------------------------------|:-----------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------|
| `totalSize`                   | 必需       | 帧的大小，计算它后面的所有内容（字节）                                                                                                                                                                  | 4           |
| `commandSize`                 | 必需       | protobuf 序列化命令的大小                                                                                                                                                                               | 4           |
| `command`                     | 必需       | protobuf 序列化命令                                                                                                                                                                                     |             |
| `magicNumberOfBrokerEntryMetadata` | 可选       | 一个 2 字节字节数组（`0x0e02`），标识 Broker 条目元数据 <br /> **注意**：`magicNumberOfBrokerEntryMetadata`、`brokerEntryMetadataSize` 和 `brokerEntryMetadata` 应该**一起**使用。 | 2           |
| `brokerEntryMetadataSize`     | 可选       | Broker 条目元数据的大小                                                                                                                                                                                 | 4           |
| `brokerEntryMetadata`         | 可选       | 作为二进制 protobuf 消息存储的 Broker 条目元数据                                                                                                                                                        |             |
| `magicNumber`                 | 必需       | 一个 2 字节字节数组（`0x0e01`），标识当前格式                                                                                                                                                           | 2           |
| `checksum`                    | 必需       | 它后面所有内容的 [CRC32-C 校验和](http://www.evanjones.ca/crc32c.html)                                                                                                                                 | 4           |
| `metadataSize`                | 必需       | 消息[元数据](#消息元数据)的大小                                                                                                                                                                          | 4           |
| `metadata`                    | 必需       | 作为二进制 protobuf 消息存储的消息[元数据](#消息元数据)                                                                                                                                                  |             |
| `payload`                     | 必需       | 帧中剩下的任何内容都被认为是负载，可以包括任何字节序列                                                                                                                                                 |             |

## Broker 条目元数据

Broker 条目元数据与消息元数据一起存储为序列化的 protobuf 消息。
它由 Broker 在消息到达 Broker 时创建，如果配置了，会在不更改的情况下传递给消费者。

| 字段              | 必需或可选 | 描述                                                                                                     |
|:-------------------|:-----------|:--------------------------------------------------------------------------------------------------------|
| `broker_timestamp` | 可选       | 消息到达 Broker 的时间戳（即自 1970 年 1 月 1 日 UTC 以来的毫秒数）                                      |
| `index`            | 可选       | 消息的索引。它由 Broker 分配。                                                                          |

如果您想在 **Broker** 中使用 Broker 条目元数据，请在 `broker.conf` 文件中配置 [`brokerEntryMetadataInterceptors`](reference-configuration.md) 参数。

如果您想在 **消费者** 中使用 Broker 条目元数据：

1. 使用客户端协议版本 [18 或更高版本](https://github.com/apache/pulsar/blob/ca37e67211feda4f7e0984e6414e707f1c1dfd07/pulsar-common/src/main/proto/PulsarApi.proto#L259)。

2. 配置 [`brokerEntryMetadataInterceptors`](reference-configuration.md) 参数并将 [`exposingBrokerEntryMetadataToClientEnabled`](reference-configuration.md) 参数设置为 `true` 在 `broker.conf` 文件中。

## 消息元数据

消息元数据与应用程序指定的负载一起存储为序列化的 protobuf 消息。元数据由生产者创建并在不更改的情况下传递给消费者。

| 字段                    | 必需或可选 | 描述                                                                                                                                                                                                                                               |
|:-------------------------|:-----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `producer_name`          | 必需       | 发布消息的生产者名称                                                                                                                                                                                                                              |
| `sequence_id`            | 必需       | 消息的序列 ID，由生产者分配                                                                                                                                                                                                                       |
| `publish_time`           | 必需       | 发布时间戳，Unix 时间（即自 1970 年 1 月 1 日 UTC 以来的毫秒数）                                                                                                                                                                                 |
| `properties`             | 必需       | 键/值对序列（使用 [`KeyValue`](https://github.com/apache/pulsar/blob/master/pulsar-common/src/main/proto/PulsarApi.proto#L32) 消息）。这些是应用程序定义的键和值，对 Pulsar 没有特殊意义。 |
| `replicated_from`        | 可选       | 表示消息已被复制并指定最初发布消息的[集群](reference-terminology.md#cluster)名称                                                                                                                                                                 |
| `partition_key`          | 可选       | 在分区 Topic 上发布时，如果存在键，则使用键的哈希值来确定选择哪个分区。分区键用作消息键。                                                                                                                                                    |
| `compression`            | 可选       | 表示负载已被压缩以及使用哪个压缩库                                                                                                                                                                                                               |
| `uncompressed_size`      | 可选       | 如果使用压缩，生产者必须用原始负载大小填充未压缩大小字段                                                                                                                                                                                         |
| `num_messages_in_batch`  | 可选       | 如果此消息实际上是多个条目的[批处理](#批处理消息)，则此字段必须设置为批处理中的消息数量                                                                                                                                                          |

### 批处理消息

使用批处理消息时，负载将包含条目列表，
每个条目都有自己的单独元数据，由 `SingleMessageMetadata`
对象定义。

对于单个批处理，负载格式将如下所示：

| 字段           | 必需或可选 | 描述                                     |
|:----------------|:-----------|:----------------------------------------|
| `metadataSizeN` | 必需       | 单条消息元数据序列化 Protobuf 的大小      |
| `metadataN`     | 必需       | 单条消息元数据                            |
| `payloadN`      | 必需       | 应用程序传递的消息负载                    |

每个元数据字段看起来像这样：

| 字段           | 必需或可选 | 描述                                     |
|:----------------|:-----------|:----------------------------------------|
| `properties`    | 必需       | 应用程序定义的属性                       |
| `partition key` | 可选       | 指示哈希到特定分区的键                  |
| `payload_size`  | 必需       | 批处理中单条消息的负载大小              |

启用压缩时，整个批处理将被一次性压缩。

## 交互

### 连接建立

在打开到 Broker 的 TCP 连接后，通常在端口 6650，客户端负责启动会话。

![连接交互](/assets/binary-protocol-connect.png)

在收到 Broker 的 `Connected` 响应后，客户端可以认为连接已准备就绪。
或者，如果 Broker 不验证客户端身份验证，它将回复 `Error` 命令并关闭 TCP 连接。

示例：

```protobuf
message CommandConnect {
  "client_version" : "Pulsar-Client-Java-v1.15.2",
  "auth_method_name" : "my-authentication-plugin",
  "auth_data" : "my-auth-data",
  "protocol_version" : 6
}
```

字段：
 * `client_version`：基于字符串的标识符。格式未强制执行。
 * `auth_method_name`：*（可选）*如果启用身份验证，身份验证插件的名称。
 * `auth_data`：*（可选）*插件特定的身份验证数据。
 * `protocol_version`：表示客户端支持的协议版本。Broker 不会发送协议较新版本中引入的命令。Broker 可能强制要求最低版本。
 * `original_principal`：由代理添加。常规客户端不应提供此值。设置时并且启用授权时，`auth_data` 必须映射到 broker.conf 中的 `proxyRoles` 之一。
 * `original_auth_method`：由代理添加。常规客户端不应提供此值。
 * `original_auth_data`：代理在配置这样做时添加。常规客户端不应提供此值。
 * `proxy_version`：由代理添加。代理拒绝存在此字段的 `Connect` 命令。常规客户端不应提供此值。当在 Broker 中启用身份验证和授权时，只有配置的 `proxyRoles` 之一有权提供此字段。为了向后兼容，Broker 不要求 `proxyRole` 提供此字段。

```protobuf
message CommandConnected {
  "server_version" : "Pulsar-Broker-v1.15.2",
  "protocol_version" : 6
}
```

字段：
 * `server_version`：Broker 版本的字符串标识符。
 * `protocol_version`：Broker 支持的协议版本。客户端不得尝试发送协议较新版本中引入的命令。

### 保持连接

为了识别客户端和 Broker 之间长时间的网络分区或机器崩溃而不中断远程端的 TCP 连接的情况（例如：停电、内核恐慌、硬重启...），我们引入了一种机制来探测远程对等方的可用性状态。

客户端和 Broker 都定期发送 `Ping` 命令，如果在超时内未收到 `Pong` 响应（Broker 使用的默认值为 60 秒），它们将关闭套接字。

Pulsar 客户端的有效实现不需要发送 `Ping` 探测，但在收到来自 Broker 的探测后需要及时回复，以防止远程端强制关闭 TCP 连接。

### 生产者

为了发送消息，客户端需要建立一个生产者。创建生产者时，Broker 将首先验证此特定客户端是否被授权在 Topic 上发布。

一旦客户端收到生产者创建确认，它就可以向 Broker 发布消息，引用之前协商的生产者 ID。

![生产者交互](/assets/binary-protocol-producer.png)

如果客户端未收到指示生产者创建成功或失败的响应，
客户端应首先发送命令关闭原始生产者，然后再发送命令重新尝试创建生产者。

:::note

在创建或连接生产者之前，您需要首先执行 [Topic 查找](#topic-查找)。

:::

##### 命令 Producer

```protobuf
message CommandProducer {
  "topic" : "persistent://my-property/my-cluster/my-namespace/my-topic",
  "producer_id" : 1,
  "request_id" : 1
}
```

字段：
 * `topic`：要在其上创建生产者的完整 Topic 名称。
 * `producer_id`：客户端生成的生产者标识符。需要在同一连接内唯一。
 * `request_id`：此请求的标识符。用于将响应与原始请求匹配。需要在同一连接内唯一。
 * `producer_name`：*（可选）*如果指定了生产者名称，将使用该名称，否则 Broker 将生成唯一名称。生成的生产者名称保证全局唯一。实现预期在最初创建生产者时让 Broker 生成新的生产者名称，然后在重新连接后重新创建生产者时重用它。

Broker 将回复 `ProducerSuccess` 或 `Error` 命令。

##### 命令 ProducerSuccess

```protobuf
message CommandProducerSuccess {
  "request_id" :  1,
  "producer_name" : "generated-unique-producer-name"
}
```

字段：
 * `request_id`：`CreateProducer` 请求的原始 ID。
 * `producer_name`：生成的全局唯一生产者名称或客户端指定的名称（如果有）。

##### 命令 Send

命令 `Send` 用于在现有生产者的上下文中发布新消息。如果尚未为此连接创建生产者，Broker 将终止连接。此命令在包含命令和消息负载的帧中使用，其完整格式在 [消息命令](#消息命令) 部分指定。

```protobuf
message CommandSend {
  "producer_id" : 1,
  "sequence_id" : 0,
  "num_messages" : 1
}
```

字段：
 * `producer_id`：现有生产者的 ID。
 * `sequence_id`：每条消息都有一个关联的序列 ID，预期实现从 0 开始的计数器。确认消息有效发布的 `SendReceipt` 将通过其序列 ID 引用它。
 * `num_messages`：*（可选）*一次发布一批消息时使用。

##### 命令 SendReceipt

在消息持久化到配置数量的副本后，Broker 将向生产者发送确认回执。

```protobuf
message CommandSendReceipt {
  "producer_id" : 1,
  "sequence_id" : 0,
  "message_id" : {
    "ledgerId" : 123,
    "entryId" : 456
  }
}
```

字段：
 * `producer_id`：发起发送请求的生产者的 ID。
 * `sequence_id`：已发布消息的序列 ID。
 * `message_id`：系统分配给已发布消息的消息 ID。在单个集群内唯一。消息 ID 由 2 个 long 组成，`ledgerId` 和 `entryId`，反映了这个唯一 ID 是在追加到 BookKeeper ledger 时分配的。

##### 命令 CloseProducer

:::note

此命令可以由生产者或 Broker 发送。

:::

当收到 `CloseProducer` 命令时，Broker 将停止接受生产者的任何更多消息，等待所有挂起的消息持久化，然后向客户端回复 `Success`。

如果客户端在超时时间内未收到对 `Producer` 命令的响应，
客户端必须在发送另一个 `Producer` 命令之前首先发送 `CloseProducer` 命令。
客户端不需要等待对 `CloseProducer` 命令的响应，然后再发送下一个 `Producer` 命令。

当执行优雅故障转移时（例如：Broker 正在重启，或 Topic 正在被负载均衡器卸载以转移到不同的 Broker），Broker 可以向客户端发送 `CloseProducer` 命令。

收到 `CloseProducer` 后，客户端预期再次进行服务发现查找并重新创建生产者。TCP 连接不受影响。

### 消费者

消费者用于附加到订阅并从中消费消息。
每次重新连接后，客户端需要订阅 Topic。如果订阅尚不存在，将创建一个新订阅。

![消费者](/assets/binary-protocol-consumer.png)

:::note

在创建或连接消费者之前，您需要首先执行 [Topic 查找](#topic-查找)。

:::

如果客户端未收到指示消费者创建成功或失败的响应，
客户端应首先发送命令关闭原始消费者，然后再发送命令重新尝试创建消费者。

#### 流控制

消费者准备就绪后，客户端需要*给予许可*给 Broker 推送消息。这是通过 `Flow` 命令完成的。

`Flow` 命令给予额外的*许可*来向消费者发送消息。
典型的消费者实现将使用队列来累积这些消息，直到应用程序准备消费它们。

在应用程序将队列中的一半消息出队后，消费者向 Broker 发送许可以请求更多消息（等于队列中消息的一半）。

例如，如果队列大小为 1000，消费者消费队列中的 500 条消息。
然后消费者向 Broker 发送许可以请求 500 条消息。

##### 命令 Subscribe

```protobuf
message CommandSubscribe {
  "topic" : "persistent://my-property/my-cluster/my-namespace/my-topic",
  "subscription" : "my-subscription-name",
  "subType" : "Exclusive",
  "consumer_id" : 1,
  "request_id" : 1
}
```

字段：
 * `topic`：要在其上创建消费者的完整 Topic 名称。
 * `subscription`：订阅名称。
 * `subType`：订阅类型：Exclusive、Shared、Failover、Key_Shared。
 * `consumer_id`：客户端生成的消费者标识符。需要在同一连接内唯一。
 * `request_id`：此请求的标识符。用于将响应与原始请求匹配。需要在同一连接内唯一。
 * `consumer_name`：*（可选）*客户端可以指定消费者名称。此名称可用于在统计信息中跟踪特定消费者。此外，在故障转移订阅类型中，名称用于决定哪个消费者被选为*主*（接收消息的那个）：消费者按消费者名称排序，第一个被选为主。

##### 命令 Flow

```protobuf
message CommandFlow {
  "consumer_id" : 1,
  "messagePermits" : 1000
}
```

字段：
* `consumer_id`：已建立消费者的 ID。
* `messagePermits`：授予 Broker 推送更多消息的额外许可数量。

##### 命令 Message

命令 `Message` 被 Broker 用于向现有消费者推送消息，在给定许可的限制内。

此命令在也包含消息负载的帧中使用，其完整格式在 [消息命令](#消息命令) 部分指定。

```protobuf
message CommandMessage {
  "consumer_id" : 1,
  "message_id" : {
    "ledgerId" : 123,
    "entryId" : 456
  }
}
```

##### 命令 Ack

`Ack` 用于向 Broker 发出信号，表示给定消息已被应用程序成功处理，可以被 Broker 丢弃。

此外，Broker 还将根据已确认的消息维护消费者位置。

```protobuf
message CommandAck {
  "consumer_id" : 1,
  "ack_type" : "Individual",
  "message_id" : {
    "ledgerId" : 123,
    "entryId" : 456
  }
}
```

字段：
 * `consumer_id`：已建立消费者的 ID。
 * `ack_type`：确认类型：`Individual` 或 `Cumulative`。
 * `message_id`：要确认的消息的 ID。
 * `validation_error`：*（可选）*表示消费者因以下原因丢弃了消息：`UncompressedSizeCorruption`、`DecompressionError`、`ChecksumMismatch`、`BatchDeSerializeError`。
 * `properties`：*（可选）*保留的配置项。
 * `txnid_most_bits`：*（可选）*与事务协调器 ID 相同，`txnid_most_bits` 和 `txnid_least_bits` 唯一标识一个事务。
 * `txnid_least_bits`：*（可选）*在事务协调器中打开的事务的 ID，`txnid_most_bits` 和 `txnid_least_bits` 唯一标识一个事务。
 * `request_id`：*（可选）*用于处理响应和超时的 ID。

##### 命令 AckResponse

`AckResponse` 是 Broker 对客户端发送的确认请求的响应。它包含请求中发送的 `consumer_id`。
如果使用事务，它包含请求中发送的事务 ID 和请求 ID。
客户端根据请求 ID 完成特定请求。
如果设置了 `error` 字段，表示请求失败。

带有重定向的 `AckResponse` 示例：

```protobuf
message CommandAckResponse {
    "consumer_id" : 1,
    "txnid_least_bits" = 0,
    "txnid_most_bits" = 1,
    "request_id" = 5
}
```

##### 命令 CloseConsumer

:::note

此命令可以由生产者或 Broker 发送。

:::

此命令的行为与 [`CloseProducer`](#命令-closeproducer) 相同

如果客户端在超时时间内未收到对 `Subscribe` 命令的响应，
客户端必须在发送另一个 `Subscribe` 命令之前首先发送 `CloseConsumer` 命令。
客户端不需要等待对 `CloseConsumer` 命令的响应，然后再发送下一个 `Subscribe` 命令。

##### 命令 RedeliverUnacknowledgedMessages

消费者可以要求 Broker 重新传递推送给该特定消费者且尚未确认的部分或所有挂起消息。

protobuf 对象接受消费者希望重新传递的消息 ID 列表。如果列表为空，Broker 将重新传递所有挂起消息。

在重新传递时，消息可以发送给同一消费者，或者在共享订阅的情况下，分布在所有可用的消费者中。

##### 命令 ReachedEndOfTopic

这由 Broker 发送给特定消费者，当 Topic 已被"终止"并且订阅上的所有消息都已被确认时。

客户端应使用此命令通知应用程序，消费者不会再有更多消息到来。

##### 命令 ConsumerStats

此命令由客户端发送，用于从 Broker 获取订阅者和消费者级别的统计信息。

字段：
 * `request_id`：请求的 ID，用于关联请求和响应。
 * `consumer_id`：已建立消费者的 ID。

##### 命令 ConsumerStatsResponse

这是 Broker 对客户端发送的 ConsumerStats 请求的响应。
它包含请求中发送的 `consumer_id` 的订阅者和消费者级别统计信息。
如果设置了 `error_code` 或 `error_message` 字段，表示请求失败。

##### 命令 Unsubscribe

此命令由客户端发送，用于将 `consumer_id` 从关联的 Topic 取消订阅。

字段：
 * `request_id`：请求的 ID。
 * `consumer_id`：需要取消订阅的已建立消费者的 ID。

## 服务发现

### Topic 查找

每次客户端需要创建或重新连接生产者或消费者时，都需要执行 Topic 查找。查找用于发现哪个特定 Broker 正在服务我们要使用的 Topic。

查找可以通过 REST 调用完成，如 [管理 API](admin-api-topics.md#look-up-topics-owner-broker) 文档中所述。

从 Pulsar-1.16 开始，也可以在二进制协议中执行查找。

举例来说，假设我们有一个在 `pulsar://broker.example.com:6650` 运行的服务发现组件

单个 Broker 将在 `pulsar://broker-1.example.com:6650`、`pulsar://broker-2.example.com:6650`... 运行

客户端可以使用到发现服务主机的连接发出 `LookupTopic` 命令。响应可以是要连接的 Broker 主机名，也可以是要重试查找的 Broker 主机名。

`LookupTopic` 命令必须在已经经过 `Connect` / `Connected` 初始握手的连接中使用。

![Topic 查找](/assets/binary-protocol-topic-lookup.png)

```protobuf
message CommandLookupTopic {
  "topic" : "persistent://my-property/my-cluster/my-namespace/my-topic",
  "request_id" : 1,
  "authoritative" : false
}
```

字段：
 * `topic`：要查找的 Topic 名称。
 * `request_id`：将与其响应一起传递的请求的 ID。
 * `authoritative`：初始查找请求应使用 false。当遵循重定向响应时，客户端应传递响应中包含的相同值。

##### LookupTopicResponse

成功查找的响应示例：

```protobuf
message CommandLookupTopicResponse {
  "request_id" : 1,
  "response" : "Connect",
  "brokerServiceUrl" : "pulsar://broker-1.example.com:6650",
  "brokerServiceUrlTls" : "pulsar+ssl://broker-1.example.com:6651",
  "authoritative" : true
}
```

这是带有重定向的查找响应示例：

```protobuf
message CommandLookupTopicResponse {
  "request_id" : 1,
  "response" : "Redirect",
  "brokerServiceUrl" : "pulsar://broker-2.example.com:6650",
  "brokerServiceUrlTls" : "pulsar+ssl://broker-2.example.com:6651",
  "authoritative" : true
}
```

在第二种情况下，我们需要向 `broker-2.example.com` 重新发出 `LookupTopic` 命令请求，此 Broker 将能够给出查找请求的确定性答案。

### 分区 Topic 发现

分区 Topic 元数据发现用于找出 Topic 是否是"分区 Topic"以及设置了多少分区。

如果 Topic 被标记为"分区"，客户端预期将创建多个生产者或消费者，每个分区一个，使用 `partition-X` 后缀。

此信息只需要在第一次创建生产者或消费者时检索。重新连接后不需要这样做。

分区 Topic 元数据的发现工作方式与 Topic 查找非常相似。客户端向服务发现地址发送请求，响应将包含实际元数据。

##### 命令 PartitionedTopicMetadata

```protobuf
message CommandPartitionedTopicMetadata {
  "topic" : "persistent://my-property/my-cluster/my-namespace/my-topic",
  "request_id" : 1
}
```

字段：
 * `topic`：要检查分区元数据的 Topic。
 * `request_id`：将与其响应一起传递的请求的 ID。

##### 命令 PartitionedTopicMetadataResponse

带有元数据的响应示例：

```protobuf
message CommandPartitionedTopicMetadataResponse {
  "request_id" : 1,
  "response" : "Success",
  "partitions" : 32
}
```

## Protobuf 接口

所有 Pulsar 的 Protobuf 定义都可以在 {@inject: github:here:/pulsar-common/src/main/proto/PulsarApi.proto} 中找到。