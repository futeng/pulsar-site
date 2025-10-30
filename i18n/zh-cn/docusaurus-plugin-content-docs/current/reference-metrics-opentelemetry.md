---
id: reference-metrics-opentelemetry
title: Pulsar OpenTelemetry Metrics
sidebar_label: "OpenTelemetry Metrics"
---

Pulsar 暴露以下 OpenTelemetry 指标。

## Broker

### 连接指标

#### pulsar.broker.connection.count
连接数量。
* 类型：UpDownCounter
* 单位：`{connection}`
* 属性：
  * `pulsar.connection.status` - 连接状态。可以是以下之一：
    * `active`
    * `open`
    * `close`

#### pulsar.broker.connection.create.operation.count
连接创建操作的数量。
* 类型：UpDownCounter
* 单位：`{operation}`
* 属性：
  * `pulsar.connection.create.operation.status` - 创建操作的状态。可以是以下之一：
    * `success`
    * `failure`

#### pulsar.broker.connection.rate_limit.count
连接被限流的次数。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.connection.rate_limit.operation.name` - 执行的限流操作名称。可以是以下之一：
    * `paused`
    * `resumed`
    * `throttled`
    * `unthrottled`

### Topic 消息指标

#### pulsar.broker.topic.subscription.count
此 Broker 服务的 Topic 的 Pulsar 订阅数量。
* 类型：UpDownCounter
* 单位：`{subscription}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.producer.count
连接到此 Broker 的 Topic 的活跃生产者数量。
* 类型：UpDownCounter
* 单位：`{producer}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.consumer.count
连接到此 Broker 的 Topic 的活跃消费者数量。
* 类型：UpDownCounter
* 单位：`{consumer}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.message.incoming.count
此 Topic 接收的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.message.outgoing.count
从此 Topic 读取的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.message.incoming.size
此 Topic 接收的消息字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.message.outgoing.size
从此 Topic 读取的消息字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.publish.latency
发布消息的延迟（以秒为单位）。
* 类型：Histogram
* 单位：`s`

#### pulsar.broker.topic.publish.rate.limit.count
发布速率限制被触发的次数。
* 类型：Counter
* 单位：`{event}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.size
此 Topic 中消息的总存储大小，包括副本使用的存储。
* 类型：UpDownCounter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.logical.size
此 Topic 中消息的存储大小，不包括副本使用的存储。
* 类型：UpDownCounter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.backlog.size
此 Topic 的 Backlog 存储大小。
* 类型：UpDownCounter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.offloaded.size
此 Topic 中卸载到分层存储的数据总量。
* 类型：UpDownCounter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.backlog.quota.limit.size
此 Topic 的基于大小的 Backlog 配额限制。
* 类型：UpDownCounter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.backlog.quota.limit.time
此 Topic 的基于时间的 Backlog 配额限制。
* 类型：Gauge
* 单位：`s`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.backlog.quota.eviction.count
Backlog 因超过配额而被驱逐的次数。
* 类型：Counter
* 单位：`{eviction}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.backlog.quota.type` - Backlog 配额类型。可以是以下之一：
    * `size`
    * `time`

#### pulsar.broker.topic.storage.backlog.age
最旧未确认消息（Backlog）的年龄。
* 类型：Gauge
* 单位：`s`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.entry.outgoing.count
为此 Topic 写入存储的消息批次（Entry）总数。
* 类型：Counter
* 单位：`{entry}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.storage.entry.incoming.count
为此 Topic 从存储读取的消息批次（Entry）总数。
* 类型：Counter
* 单位：`{entry}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.compaction.removed.message.count
通过压缩移除的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.compaction.operation.count
压缩操作的总数。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.compaction.status` - 压缩状态。可以是以下之一：
    * `success`
    * `failure

#### pulsar.broker.topic.compaction.duration
Topic 上压缩操作的总时间持续时间。
* 类型：DoubleUpDownCounter
* 单位：`s`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.compaction.incoming.size
压缩进程为此 Topic 读取的字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.compaction.outgoing.size
压缩进程为此 Topic 写入的字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.compaction.compacted.entry.count
压缩的 Entry 总数。
* 类型：Counter
* 单位：`{entry}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.compaction.compacted.entry.size
压缩的 Entry 的总大小。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.broker.topic.transaction.count
此 Topic 上的事务数量。
* 类型：UpDownCounter
* 单位：`{transaction}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.transaction.status` - 事务状态。可以是以下之一：
    * `active`
    * `committed`
    * `aborted`

#### pulsar.broker.topic.transaction.buffer.client.operation.count
事务缓冲区客户端上的操作数量。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.transaction.status` - Pulsar 事务的状态。可以是以下之一：
    * `aborted`
    * `committed`
  * `pulsar.transaction.buffer.client.operation.status` - Pulsar 事务缓冲区客户端操作的状态。可以是以下之一：
    * `failure`
    * `success`

#### pulsar.broker.topic.subscription.delayed.entry.count
延迟分发的消息批次（Entry）总数。
* 类型：UpDownCounter
* 单位：`{entry}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

### Topic 查找指标

#### pulsar.broker.lookup.request.duration
Topic 查找请求（二进制或 HTTP）的持续时间
* 类型：Histogram
* 单位：`second`
* 属性：
  * `pulsar.lookup.response` - 查找请求的响应类型
    * `failure`
    * `broker`
    * `redirect`

#### pulsar.broker.request.topic.lookup.concurrent.usage
Broker 中待处理查找操作的数量。当达到 broker.conf 中定义的阈值 "maxConcurrentLookupRequest" 时，新请求被拒绝。
* 类型：UpDownCounter
* 单位：`{operation}`

#### pulsar.broker.request.topic.lookup.concurrent.limit
Broker 中待处理查找操作的最大数量。等于 broker.conf 中定义的 "maxConcurrentLookupRequest"。
* 类型：UpDownCounter
* 单位：`{operation}`

#### pulsar.broker.topic.load.concurrent.usage
Broker 中待处理 Topic 加载操作的数量。当达到 broker.conf 中定义的阈值 "maxConcurrentTopicLoadRequest" 时，新请求被拒绝。
* 类型：UpDownCounter
* 单位：`{operation}`

#### pulsar.broker.topic.load.concurrent.limit
Broker 中待处理 Topic 加载操作的最大数量。等于 broker.conf 中定义的 "maxConcurrentTopicLoadRequest"。
* 类型：UpDownCounter
* 单位：`{operation}`

### 元数据存储指标

#### pulsar.broker.metadata.store.outgoing.size
写入元数据存储的数据总量。
* 类型：Counter
* 单位：`{By}`
* 属性：
  * `pulsar.metadata.store.name` - 元数据存储的名称。

#### pulsar.broker.metadata.store.executor.queue.size
元数据存储执行器队列中批处理操作的数量。
* 类型：UpDownCounter
* 单位：`{operation}`
* 属性：
  * `pulsar.metadata.store.name` - 元数据存储的名称。

### 消费者指标

#### pulsar.broker.consumer.message.outgoing.count
分发给此消费者的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.subscription.name` - Topic 订阅名称。
  * `pulsar.subscription.type` - 订阅类型。
  * `pulsar.consumer.name` - 消费者名称。
  * `pulsar.consumer.id` - 消费者 ID。

#### pulsar.broker.consumer.message.outgoing.size
分发给此消费者的消息字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.subscription.name` - Topic 订阅名称。
  * `pulsar.subscription.type` - 订阅类型。
  * `pulsar.consumer.name` - 消费者名称。
  * `pulsar.consumer.id` - 消费者 ID。

#### pulsar.broker.consumer.message.ack.count
从此消费者接收的消息确认总数。
* 类型：Counter
* 单位：`{ack}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.subscription.name` - Topic 订阅名称。
  * `pulsar.subscription.type` - 订阅类型。
  * `pulsar.consumer.name` - 消费者名称。
  * `pulsar.consumer.id` - 消费者 ID。

#### pulsar.broker.consumer.message.redeliver.count
已重新分发给此消费者的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.subscription.name` - Topic 订阅名称。
  * `pulsar.subscription.type` - 订阅类型。
  * `pulsar.consumer.name` - 消费者名称。
  * `pulsar.consumer.id` - 消费者 ID。

#### pulsar.broker.consumer.message.unack.count
当前未被此消费者确认的消息数量。
* 类型：UpDownCounter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.subscription.name` - Topic 订阅名称。
  * `pulsar.subscription.type` - 订阅类型。
  * `pulsar.consumer.name` - 消费者名称。
  * `pulsar.consumer.id` - 消费者 ID。

#### pulsar.broker.consumer.permit.count
当前可用于此消费者的许可数量。
* 类型：UpDownCounter
* 单位：`{permit}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.subscription.name` - Topic 订阅名称。
  * `pulsar.subscription.type` - 订阅类型。
  * `pulsar.consumer.name` - 消费者名称。
  * `pulsar.consumer.id` - 消费者 ID。

### Managed Ledger Cursor 指标

#### pulsar.broker.managed_ledger.persist.operation.count
Ledger 上的确认操作数量。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.cursor.name` - Managed Cursor 的名称。
  * `pulsar.managed_ledger.cursor.operation.status` - Managed Cursor 操作的状态。可以是以下之一：
    * `success`
    * `failure`

#### pulsar.broker.managed_ledger.persist.mds.operation.count
元数据存储中的确认操作数量。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.cursor.name` - Managed Cursor 的名称。
  * `pulsar.managed_ledger.cursor.operation.status` - Managed Cursor 操作的状态。可以是以下之一：
    * `success`
    * `failure`

#### pulsar.broker.managed_ledger.message_range.count
非连续删除消息范围的数量。
* 类型：UpDownCounter
* 单位：`{range}`
* 属性：
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.cursor.name` - Managed Cursor 的名称。

#### pulsar.broker.managed_ledger.cursor.outgoing.size
写入 Ledger 的数据总量。
* 类型：Counter
* 单位：`{By}`
* 属性：
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.cursor.name` - Managed Cursor 的名称。

#### pulsar.broker.managed_ledger.cursor.outgoing.logical.size
写入 Ledger 的数据总量，不包括副本。
* 类型：Counter
* 单位：`{By}`
* 属性：
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.cursor.name` - Managed Cursor 的名称。

#### pulsar.broker.managed_ledger.cursor.incoming.size
从 Ledger 读取的数据总量。
* 类型：Counter
* 单位：`{By}`
* 属性：
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.cursor.name` - Managed Cursor 的名称。

### Managed Ledger 缓存指标

#### pulsar.broker.managed_ledger.count
Managed Ledger 的总数。
* 类型：UpDownCounter
* 单位：`{managed_ledger}`

#### pulsar.broker.managed_ledger.cache.eviction.count
缓存驱逐操作的总数。
* 类型：Counter
* 单位：`{eviction}`

#### pulsar.broker.managed_ledger.cache.entry.count
Entry 缓存中的 Entry 数量。
* 类型：UpDownCounter
* 单位：`{entry}`
* 属性：
  * `pulsar.managed_ledger.cache.entry.status` - 缓存 Entry 的状态。可以是以下之一：
    * `active` - 表示当前缓存中的 Entry 数量。等于 `evicted - inserted`。
    * `inserted` - 表示插入缓存中的 Entry 总数。
    * `evicted` - 表示从缓存中驱逐的 Entry 总数。

#### pulsar.broker.managed_ledger.cache.entry.size
存储在 Entry 缓存中的 Entry 的字节数量。
* 类型：UpDownCounter
* 单位：`{By}`

#### pulsar.broker.managed_ledger.cache.operation.count
缓存操作的数量。
* 类型：Counter
* 单位：`{entry}`
* 属性：
  * `pulsar.managed_ledger.cache.operation.status` - 缓存操作结果。可以是以下之一：
    * `hit` - 表示成功的缓存查找操作。
    * `miss` - 表示失败的缓存查找操作。

#### pulsar.broker.managed_ledger.cache.operation.size
从缓存操作中检索的数据字节数量。
* 类型：Counter
* 单位：`{By}`
* 属性：
  * `pulsar.managed_ledger.cache.operation.status` - 缓存操作结果。可以是以下之一：
    * `hit` - 表示成功的缓存查找操作。
    * `miss` - 表示失败的缓存查找操作。

#### pulsar.broker.managed_ledger.cache.pool.allocation.active.count
直接区域中当前活跃分配的数量。
* 类型：UpDownCounter
* 单位：`{allocation}`
* 属性：
  * `pulsar.managed_ledger.pool.arena.type` - 区域类型。可以是以下之一：
    * `small`
    * `normal`
    * `huge`

#### pulsar.broker.managed_ledger.cache.pool.allocation.size
直接区域中分配的内存。
* 类型：UpDownCounter
* 单位：`{By}`
* 属性：
  * `pulsar.managed_ledger.pool.chunk.allocation.type` - 块分配类型。可以是以下之一：
    * `allocated`
    * `used`

### 生产者指标

#### pulsar.broker.producer.message.incoming.count
从此生产者接收的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.producer.name` - 生产者名称。
  * `pulsar.producer.id` - 生产者 ID。
  * `pulsar.producer.access_mode` - 生产者的访问模式。可以是以下之一：
    * `shared`
    * `exclusive`
    * `wait_for_exclusive`
    * `exclusive_with_fencing`

#### pulsar.broker.producer.message.incoming.size
从此生产者接收的消息字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.producer.name` - 生产者名称。
  * `pulsar.producer.id` - 生产者 ID。
  * `pulsar.producer.access_mode` - 生产者的访问模式。可以是以下之一：
    * `shared`
    * `exclusive`
    * `wait_for_exclusive`
    * `exclusive_with_fencing`

#### pulsar.broker.producer.message.drop.count
从此生产者丢弃的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.producer.name` - 生产者名称。
  * `pulsar.producer.id` - 生产者 ID。
  * `pulsar.producer.access_mode` - 生产者的访问模式。可以是以下之一：
    * `shared`
    * `exclusive`
    * `wait_for_exclusive`
    * `exclusive_with_fencing`

### Managed Ledger 指标

#### pulsar.broker.managed_ledger.message.outgoing.count
写入此 Ledger 的操作数量。
* 类型：UpDownCounter
* 单位：`{operation}`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.operation.status` - Managed Ledger 操作的状态。可以是以下之一：
    * `success`
    * `failure`

#### pulsar.broker.managed_ledger.message.outgoing.logical.size
写入此 Ledger 的消息字节总数，不包括副本。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。

#### pulsar.broker.managed_ledger.message.outgoing.replicated.size
写入此 Ledger 的消息字节总数，包括副本。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。

#### pulsar.broker.managed_ledger.backlog.count
此 Ledger 中所有消费者的 Backlog 消息数量。
* 类型：UpDownCounter
* 单位：`{message}`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。

#### pulsar.broker.managed_ledger.message.incoming.count
从此 Ledger 读取的操作数量。
* 类型：UpDownCounter
* 单位：`{operation}`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。
  * `pulsar.managed_ledger.operation.status` - Managed Ledger 操作的状态。可以是以下之一：
    * `success`
    * `failure`

#### pulsar.broker.managed_ledger.message.incoming.size
从此 Ledger 读取的消息字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。

#### pulsar.broker.managed_ledger.message.incoming.cache.miss.count
从此 Ledger 读取操作期间的缓存未命中次数。
* 类型：UpDownCounter
* 单位：`{operation}`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。

#### pulsar.broker.managed_ledger.mark_delete.count
此 Ledger 的标记删除操作总数。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。
  * `pulsar.managed_ledger.name` - Managed Ledger 的名称。

#### pulsar.broker.managed_ledger.message.outgoing.latency
端到端写入延迟，包括在执行器队列中花费的时间。
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。

#### pulsar.broker.managed_ledger.message.outgoing.ledger.latency
端到端写入延迟。
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。

#### pulsar.broker.managed_ledger.ledger.switch.latency
切换到新 Ledger 所需的时间。
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。

#### pulsar.broker.managed_ledger.entry.size
写入 Ledger 的 Entry 大小。
* 类型：Histogram
* 单位：`By`
* 属性：
  * `pulsar.namespace` - Managed Ledger 命名空间。

#### pulsar.broker.managed_ledger.inflight.read.limit
可以从存储或缓存读取的 Managed Ledger 数据保留的最大字节数。
* 类型：Counter
* 单位：`By`

#### pulsar.broker.managed_ledger.inflight.read.usage
从存储或缓存读取的 Managed Ledger 数据保留的估计字节数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.managed_ledger.inflight.read.usage.state` - 表示 Managed Ledger 内存限制器使用状态。可以是以下之一：
    * `used`
    * `free`

### Web 执行器服务指标

#### pulsar.web.executor.thread.limit
pulsar-web 执行器池的线程限制。
* 类型：UpDownCounter
* 单位：`{thread}`
* 属性：
  * `pulsar.web.executor.thread.limit.type` - 线程池的限制类型。
    * `max`
    * `min`

#### pulsar.web.executor.thread.usage
pulsar-web 执行器池中线程的当前使用情况。
* 类型：UpDownCounter
* 单位：`{thread}`
* 属性：
  * `pulsar.web.executor.thread.usage.type` - 线程池的使用类型。
    * `active` - 表示主动服务请求的线程数量。
    * `current` - 表示当前与池关联的线程总数。
    * `idle` - 表示可用于服务请求的线程数量。

### 复制器指标

#### pulsar.broker.replication.message.incoming.count
通过此复制器从远程集群接收的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

#### pulsar.broker.replication.message.outgoing.count
通过此复制器发送到远程集群的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

#### pulsar.broker.replication.message.incoming.size
通过此复制器从远程集群接收的消息字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

#### pulsar.broker.replication.message.outgoing.size
通过此复制器发送到远程集群的消息字节总数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

#### pulsar.broker.replication.message.backlog.count
此复制器的 Backlog 中的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

#### pulsar.broker.replication.message.backlog.age
复制器 Backlog 中最旧消息的年龄。
* 类型：Gauge
* 单位：`s`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

#### pulsar.broker.replication.message.expired.count
此复制器过期的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

#### pulsar.broker.replication.message.dropped.count
此复制器丢弃的消息总数。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.domain` - Topic 的域。可以是以下之一：
    * `persistent`
    * `non-persistent`
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.replication.remote.cluster.name` - 远程集群的名称。

### Schema 注册中心指标

#### pulsar.broker.request.schema_registry.duration
Schema 注册中心请求的持续时间
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.namespace` - Schema 注册中心请求引用的命名空间
  * `pulsar.schema_registry.request` - Schema 注册中心请求类型
    * `get`
    * `list`
    * `put`
    * `delete`
  * `pulsar.schema_registry.response` - Schema 注册中心响应类型
    * `success`
    * `failure`

#### pulsar.broker.operation.schema_registry.compatibility_check.count
Broker 执行的 Schema 注册中心兼容性检查操作数量。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.namespace` - 兼容性检查操作引用的命名空间
  * `pulsar.schema_registry.compatibility_check.response` - 兼容性检查响应类型
    * `compatible`
    * `incompatible`

### HTTP 请求过滤器指标

#### pulsar.web.filter.rate_limit.request.count
限流过滤器处理的 HTTP 请求计数器。
* 类型：Counter
* 单位：`{request}`
* 属性：
  * `pulsar.web.filter.rate_limit.result` - 限流操作的结果。可以是以下之一：
    * `accepted`
    * `rejected`

### 事务协调器指标

#### pulsar.broker.transaction.coordinator.transaction.count
协调器处理的事务数量。
* 类型：UpDownCounter
* 单位：`{transaction}`
* 属性：
  * `pulsar.transaction.coordinator.id` - Pulsar 事务协调器的 ID。
  * `pulsar.transaction.status` - Pulsar 事务的状态。可以是以下之一：
    * `aborted`
    * `active`
    * `created`
    * `committed`
    * `timeout`

#### pulsar.broker.transaction.coordinator.append.log.count
协调器追加的事务元数据 Entry 数量。
* 类型：Counter
* 单位：`{entry}`
* 属性：
  * `pulsar.transaction.coordinator.id` - Pulsar 事务协调器的 ID。
  * `pulsar.transaction.status` - Pulsar 事务的状态。可以是以下之一：
    * `aborted`
    * `active`
    * `created`
    * `committed`
    * `timeout`

### 事务待处理确认存储指标

#### pulsar.broker.transaction.pending.ack.store.transaction.count
持久化确认存储处理的事务数量。
* 类型：Counter
* 单位：`{transaction}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition.index` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription.name` - Pulsar 订阅的名称。
  * `pulsar.transaction.status` - Pulsar 事务状态。可以是以下之一：
    * `aborted`
    * `committed`
  * `pulsar.transaction.pending.ack.store.operation.status` - 待处理确认存储操作的状态。可以是以下之一：
    * `failure`
    * `success`

### 认证指标

#### pulsar.authentication.operation.count
认证操作的数量。
* 类型：Counter
* 单位：`{operation}`
* 属性：
  * `pulsar.authentication.provider` - 认证提供者类的名称。
  * `pulsar.authentication.method` - 认证方法的名称。
  * `pulsar.authentication.result` - 认证结果。可以是以下之一：
    * `success`
    * `failure`
  * `pulsar.authentication.error` - 认证错误（如果结果是 `failure`）。

### Token 指标

#### pulsar.authentication.token.expired.count
过期 Token 的总数。
* 类型：Counter
* 单位：`{token}`

#### pulsar.authentication.token.expiry.duration
过期 Token 的剩余时间（以秒为单位）。
* 类型：Histogram
* 单位：`s`

### 复制订阅指标

#### pulsar.broker.replication.subscription.snapshot.operation.count
尝试的快照操作数量。
* 类型：Counter
* 单位：`{operation}`

#### pulsar.broker.replication.subscription.snapshot.operation.duration
完成跨集群一致性快照操作所需的时间。
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.replication.subscription.snapshot.operation.result` - 快照操作的结果。可以是以下之一：
    * `success`
    * `timeout`

## Java 客户端

### 生产者指标

#### pulsar.client.producer.message.send.duration
应用程序体验的发布延迟，包括客户端批处理时间。
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.response.status` - 响应状态。可以是以下之一：
    * `success`
    * `failed`

#### pulsar.client.producer.rpc.send.duration
客户端在发送数据到接收确认时内部体验的发布 RPC 延迟。
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.response.status` - 响应状态。可以是以下之一：
    * `success`
    * `failed`

#### pulsar.client.producer.message.send.size
发布的字节数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.client.producer.message.pending.count
生产者内部发送队列中等待发送的消息数量。
* 类型：UpDownCounter
* 单位：`{message}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.client.producer.message.pending.size
生产者内部队列中等待发送的消息大小。
* 类型：UpDownCounter
* 单位：`By`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.client.producer.opened
打开的生产者会话数量。
* 类型：Counter
* 单位：`{session}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

#### pulsar.client.producer.closed
关闭的生产者会话数量。
* 类型：Counter
* 单位：`{session}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。

### 消费者指标

#### pulsar.client.consumer.opened
打开的消费者会话数量。
* 类型：Counter
* 单位：`{session}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.closed
关闭的消费者会话数量。
* 类型：Counter
* 单位：`{session}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.message.received.count
消费者应用程序显式接收的消息数量。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.message.received.size
消费者应用程序显式接收的字节数。
* 类型：Counter
* 单位：`By`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.receive_queue.count
当前位于消费者接收队列中的消息数量。
* 类型：UpDownCounter
* 单位：`{message}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.receive_queue.size
当前位于消费者接收队列中的消息总大小（字节）。
* 类型：UpDownCounter
* 单位：`By`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.message.ack
已确认消息的数量。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.message.nack
否定确认消息的数量。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.message.dlq
发送到死信队列的消息数量。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

#### pulsar.client.consumer.message.ack.timeout
在配置的超时期间内未被确认的消息数量，因此客户端请求重新分发。
* 类型：Counter
* 单位：`{message}`
* 属性：
  * `pulsar.tenant` - Topic 租户。
  * `pulsar.namespace` - Topic 命名空间。
  * `pulsar.topic` - Topic 名称。
  * `pulsar.partition` - Topic 的分区索引。仅当 Topic 是分区 Topic 时存在。
  * `pulsar.subscription` - 订阅名称。

### 连接指标

#### pulsar.client.connection.opened
打开的连接数量。
* 类型：Counter
* 单位：`{connection}`

#### pulsar.client.connection.closed
关闭的连接数量。
* 类型：Counter
* 单位：`{connection}`

#### pulsar.client.connection.failed
失败的连接尝试数量。
* 类型：Counter
* 单位：`{connection}`
* 属性：
  * `pulsar.failure.type` - 连接失败的类型。可以是以下之一：
    * `tcp-failed`
    * `handshake`

### 查找服务指标

#### pulsar.client.lookup.duration
查找操作的持续时间。
* 类型：Histogram
* 单位：`s`
* 属性：
  * `pulsar.lookup.transport-type` - 用于查找的传输类型。可以是以下之一：
    * `http`
    * `binary`
  * `pulsar.response.status` - 响应状态。可以是以下之一：
    * `success`
    * `failed`

### 内存缓冲区指标

#### pulsar.client.memory.buffer.usage
客户端当前的内存缓冲区使用情况。
* 类型：UpDownCounter
* 单位：`By`

#### pulsar.client.memory.buffer.limit
为客户端配置的内存缓冲区限制。
* 类型：UpDownCounter
* 单位：`By`