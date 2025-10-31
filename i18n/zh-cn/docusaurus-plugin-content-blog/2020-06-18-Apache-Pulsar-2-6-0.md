---
author: Penghui Li
authorURL: https://twitter.com/lipenghui6
title: "Apache Pulsar 2.6.0"
---
我们很高兴看到 Apache Pulsar 社区在经过不懈努力后成功发布了精彩的 2.6.0 版本。对于这个快速发展的项目和整个 Pulsar 社区来说，这是一个伟大的里程碑。这是社区巨大努力的结果，包含超过 450 个提交和一长列新功能、改进和错误修复。

以下是在 Pulsar 2.6.0 中添加的一些最有趣和主要功能的选择。

<!--truncate-->

## 核心 Pulsar

### [PIP-37] 大消息大小支持

这个 PIP 通过将大消息拆分为多个块来支持生产和消费大消息。这是发送和消费非常大消息的非常强大的功能。

目前，此功能仅适用于非共享订阅，并且有客户端更改。您需要将 Pulsar 客户端版本升级到 2.6.0。您可以按如下方式在生产者端启用消息分块。

```java

client.newProducer()
	.topic("my-topic")
	.enableChunking(true)
	.create();

```

有关 PIP-37 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-37:-Large-message-size-handling-in-Pulsar)。<br /> 有关实现细节的更多信息，请参见 [PR-4440](https://github.com/apache/pulsar/pull/4400)。

### [PIP-39] 命名空间更改事件（系统主题）

这个 PIP 引入了系统主题来存储命名空间更改事件。以前，Pulsar 只允许您设置命名空间策略，命名空间下的所有主题都遵循命名空间策略。许多用户希望为主题设置策略。不使用与命名空间级别策略相同方式的主要原因是避免在 ZooKeeper 上引入更多工作负载。

系统主题的初衷是能够在主题中而不是 ZooKeeper 中存储主题策略。所以这是实现主题级别策略的第一步。有了这个功能，我们可以轻松地为主题级别策略添加支持。

有关 PIP-39 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-39%3A-Namespace-Change-Events)。<br /> 有关实现细节的更多信息，请参见 [PR-4955](https://github.com/apache/pulsar/pull/4955)。

### [PIP-45] 可插拔元数据接口

我们一直在推进使 Pulsar 能够使用其他元数据存储服务而不是 ZooKeeper。这个 PIP 将 `ManagedLedger` 转换为使用 `MetadataStore` 接口。这促进了元数据服务器插件过程。通过 `MetadataStore` 接口，可以轻松地将其他元数据服务器添加到 Pulsar 中，如 [etcd](https://github.com/etcd-io/etcd)。

有关 PIP-45 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-45%3A-Pluggable-metadata-interface)。<br /> 有关实现细节的更多信息，请参见 [PR-5358](https://github.com/apache/pulsar/pull/5358)。

### [PIP-54] 支持批处理索引级别的确认

以前，broker 只在批处理消息级别跟踪确认状态。如果批处理消息的子集被确认，当批处理消息重新传递发生时，消费者仍然可以获得该批处理消息的已确认消息。

这个 PIP 添加了支持确认批处理的本地批处理索引。此功能默认未启用。您可以按如下方式在 `broker.conf` 中启用它。

```

acknowledgmentAtBatchIndexLevelEnabled=true

```

有关 PIP-54 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-54:-Support-acknowledgment-at-batch-index-level)。<br /> 有关实现细节的更多信息，请参见 [PR-6052](https://github.com/apache/pulsar/pull/6052)。

### [PIP-58] 支持消费者设置自定义消息重试延迟

对于许多在线业务系统，业务逻辑处理中通常会发生各种异常，因此需要重新消费消息，但用户希望这个延迟时间可以灵活控制。以前，处理方法通常是将消息发送到特殊的重试主题，因为生产可以指定任何延迟，所以消费者同时订阅业务主题和重试主题。现在您可以按如下方式为每条消息设置重试延迟。

```java

Consumer<byte[]> consumer = pulsarClient.newConsumer(Schema.BYTES)
    .enableRetry(true)
    .receiverQueueSize(100)
    .deadLetterPolicy(DeadLetterPolicy.builder()
        .maxRedeliverCount(maxRedeliveryCount)
        .retryLetterTopic("persistent://my-property/my-ns/my-subscription-custom-Retry")
        .build())
    .subscribe();

consumer.reconsumeLater(message, 10, TimeUnit.SECONDS);

```

有关 PIP-58 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-58-%3A-Support-Consumers--Set-Custom-Retry-Delay)。<br /> 有关实现细节的更多信息，请参见 [PR-6449](https://github.com/apache/pulsar/pull/6449)。

### [PIP-60] 支持 SNI 路由以支持各种代理服务器

以前，Pulsar 不提供使用其他代理的支持，如 Apache Traffic Server (ATS)、HAProxy、Nginx 和 Envoy，这些代理更可扩展和安全。大多数这些代理服务器支持 SNI 路由，可以将流量路由到目标而无需终止 SSL 连接。这个 PIP 添加了 SNI 路由并对 Pulsar 客户端进行了更改。

有关 PIP-60 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-60:-Support-Proxy-server-with-SNI-routing)。<br /> 有关实现细节的更多信息，请参见 [PR-6566](https://github.com/apache/pulsar/pull/6566)。

### [PIP-61] 宣布多个地址

这个 PIP 允许 broker 暴露多个宣传的监听器并支持内部和外部网络流量的分离。您可以按如下方式在 `broker.conf` 中指定多个宣传的监听器。

```

advertisedListeners=internal:pulsar://192.168.1.11:6660,external:pulsar://110.95.234.50:6650

```

从客户端方面，您可以按如下方式为客户端指定监听器名称。

```java

PulsarClient.builder()
    .serviceUrl(url)
    .listenerName("internal")
    .build();

```

有关 PIP-61 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-61%3A-Advertised-multiple-addresses)。<br /> 有关实现细节的更多信息，请参见 [PR-6903](https://github.com/apache/pulsar/pull/6903)。

### [PIP-65] 使 Pulsar IO 源适应支持 `BatchSources`

这个 PIP 引入 `BatchSource` 作为编写基于批处理连接器的新接口。它还引入 `BatchSourceTriggerer` 作为触发 `BatchSource` 数据收集的接口。然后在 `BatchSourceExecutor` 中提供系统实现。

有关 PIP-65 的更多信息，请参见[这里](https://github.com/apache/pulsar/wiki/PIP-65%3A-Adapting-Pulsar-IO-Sources-to-support-Batch-Sources)。<br /> 有关实现细节的更多信息，请参见 [PR-7090](https://github.com/apache/pulsar/pull/7090)。

### [负载均衡器] 为负载均衡器添加 `ThresholdShedder` 策略

`ThresholdShedder` 策略比 Pulsar 的 `LoadSheddingStrategy` 更灵活。`ThresholdShedder` 计算 broker 的平均资源使用率，单个 broker 资源使用率与平均值比较。如果大于平均值加上阈值，则触发过载卸载器。您可以按如下方式在 `broker.conf` 中启用它。

```

loadBalancerLoadSheddingStrategy=org.apache.pulsar.broker.loadbalance.impl.ThresholdShedder

```

如果需要，您可以按如下方式为 `ThresholdShedder` 自定义更多参数。

```

# Broker 资源使用率阈值。
# 当 broker 资源使用率大于 pulsar 集群平均资源使用率时，
# 阈值卸载器将被触发以从 broker 卸载 bundle。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerBrokerThresholdShedderPercentage=10

# 计算新资源使用率时，历史使用率占的比例。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerHistoryResourcePercentage=0.9

# 计算新资源使用率时的带宽输入使用率权重。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerBandwithInResourceWeight=1.0

# 计算新资源使用率时的带宽输出使用率权重。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerBandwithOutResourceWeight=1.0

# 计算新资源使用率时的 CPU 使用率权重。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerCPUResourceWeight=1.0

# 计算新资源使用率时的堆内存使用率权重。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerMemoryResourceWeight=1.0

# 计算新资源使用率时的直接内存使用率权重。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerDirectMemoryResourceWeight=1.0

# Bundle 卸载最小吞吐量阈值（MB），避免频繁卸载 bundle。
# 它仅在 ThresholdShedder 策略中生效。
loadBalancerBundleUnloadMinThroughputThreshold=10

```

有关实现细节的更多信息，请参见 [PR-6772](https://github.com/apache/pulsar/pull/6772)。

### [键共享] 在键共享分发中添加一致性哈希

以前，键共享订阅的实现使用一种机制将它们的哈希空间分配给可用的消费者。这是基于在新消费者加入或离开时划分当前分配的哈希范围。Pulsar 2.6.0 为键共享订阅引入了新的一致性哈希分发。您可以在 `broker.conf` 中启用一致性哈希分发，自动分割方法仍然默认选择。

```

# 在键共享订阅上，默认 AUTO_SPLIT 模式，使用分割范围或
# 一致性哈希将键重新分配给新消费者
subscriptionKeySharedUseConsistentHashing=false

# 在键共享订阅上，一致性哈希环中的点数。
# 数字越高，键对消费者的分配越均匀
subscriptionKeySharedConsistentHashingReplicaPoints=100

```

我们计划在后续版本中默认使用一致性哈希分发。
有关实现细节的更多信息，请参见 [PR-6791](https://github.com/apache/pulsar/pull/6791)。

### [键共享] 修复添加消费者时 KeyShared 调度器中的排序问题

这是键共享订阅的一个重大修复。以前，如果新消费者 c2 进入而现有消费者 c1 离开，排序在 KeyShared 调度器中被破坏。这是因为先前分配给 c1 的键的消息可能路由到 c2，这可能会破坏键共享订阅中的消息排序分发保证。这个 PR 引入新消费者以"暂停"状态加入，直到先前的消息被确认为止，以确保消息有序分发。

如果您仍然想要宽松的排序，可以在消费者端按如下方式设置。

```java

pulsarClient.newConsumer()
	.keySharedPolicy(KeySharedPolicy.autoSplitHashRange().setAllowOutOfOrderDelivery(true))
	.subscribe();

```

有关实现细节的更多信息，请参见 [PR-7106](https://github.com/apache/pulsar/pull/7106) 和 [PR-7108](https://github.com/apache/pulsar/pull/7108)。

### [键共享] 添加对键哈希范围读取的支持

这个 PR 支持粘性键哈希范围读取器。broker 只分发消息键的哈希包含在指定键哈希范围内的消息。此外，可以在读取器上指定多个键哈希范围。

```java

pulsarClient.newReader()
    .topic(topic)
    .startMessageId(MessageId.earliest)
    .keyHashRange(Range.of(0, 10000), Range.of(20001, 30000))
    .create();

```

有关实现细节的更多信息，请参见 [PR-5928](https://github.com/apache/pulsar/pull/5928)。

### 使用纯 Java Air-Compressor 而不是基于 JNI 的库

以前，使用基于 JNI 的库来执行数据压缩。虽然这些库在大小方面确实有开销并影响 JNI 开销，这通常在压缩许多小负载时是可测量的。这个 PR 用 [AirCompressor](https://github.com/airlift/aircompressor) 替换了 LZ4、ZStd 和 Snappy 的压缩库，这是 Presto 使用的纯 Java 压缩库。

有关实现细节的更多信息，请参见 [PR-5390](https://github.com/apache/pulsar/pull/5390)。

### 支持多个 Pulsar 集群使用同一个 BookKeeper 集群

这个 PR 允许多个 pulsar 集群通过将 BookKeeper 客户端指向 BookKeeper 集群的 ZooKeeper 连接字符串来使用指定的 BookKeeper 集群。这个 PR 添加了一个配置（`bookkeeperMetadataServiceUri`）来发现 BookKeeper 集群元数据存储并使用元数据服务 URI 初始化 BookKeeper 客户端。

```

# BookKeeper 使用的元数据服务 uri，用于加载相应的元数据驱动程序
# 并解析其元数据服务位置。
# 此值可以使用 BookKeeper 集群中的 `bookkeeper shell whatisinstanceid` 命令获取。
# 例如：zk+hierarchical://localhost:2181/ledgers
# 元数据服务 uri 列表也可以是分号分隔的值，如下所示：
# zk+hierarchical://zk1:2181;zk2:2181;zk3:2181/ledgers
bookkeeperMetadataServiceUri=

```

有关实现细节的更多信息，请参见 [PR-5985](https://github.com/apache/pulsar/pull/5985)。

### 支持在订阅赶上时删除非活动主题

以前，Pulsar 支持删除没有活跃生产者和订阅的非活动主题。这个 PR 支持当主题的所有订阅都赶上并且没有活跃生产者或消费者时删除非活动主题。这个 PR 在 `broker.conf` 中暴露非活动主题删除模式。未来，我们可以支持非活动主题删除模式的命名空间级别配置。

```

# 设置非活动主题删除模式。默认是 delete_when_no_subscriptions
# 'delete_when_no_subscriptions' 模式只删除没有订阅和没有活跃生产者的主题
# 'delete_when_subscriptions_caught_up' 模式只删除所有订阅没有积压（赶上）并且没有活跃生产者/消费者的主题
brokerDeleteInactiveTopicsMode=delete_when_no_subscriptions

```

有关实现细节的更多信息，请参见 [PR-6077](https://github.com/apache/pulsar/pull/6077)。

### 添加标志以在瞬态 OOM 时跳过 broker 关闭

某个主题上的高分发速率可能导致 broker 暂时 OOM。这是一个瞬态错误，broker 可以在几秒钟内恢复，只要一些内存被释放。但是，在 2.4 版本（[#4196](https://github.com/apache/pulsar/pull/4196)）中，"OOM 时重启 broker" 功能可能导致集群中的巨大不稳定性，其中主题从一个 broker 移动到另一个 broker 并重启多个 broker 并干扰其他主题。所以这个 PR 提供了一个动态标志来跳过 OOM 时的 broker 关闭以避免集群中的不稳定性。

有关实现细节的更多信息，请参见 [PR-6634](https://github.com/apache/pulsar/pull/6634)。

### 使 ZooKeeper 缓存过期时间可配置

以前，ZooKeeper 缓存过期时间是硬编码的，需要可配置以基于各种要求刷新值，例如，在 zk-watch 错过的情况下快速刷新值，避免频繁缓存刷新以避免 zk-read 或避免由于 zk 读取超时引起的问题，等等。现在您可以按如下方式在 `broker.conf` 中配置 ZooKeeper 缓存过期时间。

```

# ZooKeeper 缓存过期时间（秒）
zooKeeperCacheExpirySeconds=300

```

有关实现细节的更多信息，请参见 [PR-6668](https://github.com/apache/pulsar/pull/6668)。

### 优化批处理消息情况下的消费者获取消息

当消费者向 broker 服务器发送获取请求时，它包含获取消息数量，告诉服务器应该推送多少消息给消费者客户端。但是，broker 服务器根据条目而不是单个消息将数据存储在 BookKeeper 或 broker 缓存中，如果生产者使用批处理功能生产消息。在处理消费者获取请求时，将消息数量映射到条目数量存在差距。这个 PR 添加了一个变量 `avgMessagesPerEntry` 来记录一个条目中存储的平均消息数。它在 broker 服务器向消费者推送消息时更新。在处理消费者获取请求时，它将获取请求数量映射到条目数量。此外，这个 PR 将 `avgMessagePerEntry` 静态值暴露给消费者统计指标 json。

您可以按如下方式在 `broker.conf` 中启用 `preciseDispatcherFlowControl`。

```

# 根据每个条目的历史消息数量进行精确调度器流控制
preciseDispatcherFlowControl=false

```

有关实现细节的更多信息，请参见 [PR-6719](https://github.com/apache/pulsar/pull/6719)

### 引入精确主题发布速率限制

以前，Pulsar 支持发布速率限制但它不是精确控制。现在，对于需要精确控制的一些用例，您可以按如下方式在 `broker.conf` 中启用它。

```

preciseTopicPublishRateLimiterEnable=true

```

有关实现细节的更多信息，请参见 [PR-7078](https://github.com/apache/pulsar/pull/7078)。

### 在 `broker.conf` 中暴露新条目的检查延迟

以前，新条目的检查延迟是 10 毫秒，用户无法更改。目前，对于消费延迟敏感场景，您可以按如下方式在 `broker.conf` 中将新条目的检查延迟值设置为较小的值或 0。使用较小的值可能会降低消费吞吐量。

```

managedLedgerNewEntriesCheckDelayInMillis=10

```

有关实现细节的更多信息，请参见 [PR-7154](https://github.com/apache/pulsar/pull/7154)。

### [Schema] 在 KeyValue schema 中支持 `null` 键和 `null` 值

有关实现细节的更多信息，请参见 [PR-7139](https://github.com/apache/pulsar/pull/7139)。

### 支持在满足 `maxLedgerRolloverTimeMinutes` 时触发 ledger 翻转

这个 PR 实现了一个监控线程来检查当前主题 ledger 是否满足 `managedLedgerMaxLedgerRolloverTimeMinutes` 的约束并触发翻转以使配置生效。另一个重要的想法是，如果您触发翻转，可以关闭当前 ledger 以便释放当前 ledger 的存储。对于一些不常用的主题，当前 ledger 数据很可能过期，当前翻转逻辑仅在添加新条目时触发。显然，这导致了磁盘空间的浪费。监控线程以固定时间间隔调度，间隔设置为 `managedLedgerMaxLedgerRolloverTimeMinutes`。每次检查同时进行两个判断，例如，`currentLedgerEntries > 0` 和 `currentLedgerIsFull()`。当当前条目数等于 0 时，它不会触发新的翻转，您可以使用它来减少 ledger 创建。

有关实现细节的更多信息，请参见 [PR-7116](https://github.com/apache/pulsar/pull/7111)。

## 代理

### 添加 REST API 以获取连接和主题统计

以前，Pulsar 代理没有有用的统计来获取代理的内部信息。最好有代理的内部统计来获取信息，如活跃连接、主题统计（具有更高的日志级别）等。这个 PR 添加 REST API 来获取代理服务的连接和主题的统计。

有关实现细节的更多信息，请参见 [PR-6473](https://github.com/apache/pulsar/pull/6473)。

## 管理

### 支持在 pulsar-admin 中通过消息 ID 获取消息

这个 PR 向 pulsar-admin 添加了一个新命令 `get-message-by-id`。它允许用户通过提供 ledger ID 和 entry ID 来检查单个消息。

有关实现细节的更多信息，请参见 [PR-6331](https://github.com/apache/pulsar/pull/6331)。

### 支持强制删除订阅

这个 PR 添加了方法 `deleteForcefully` 来支持强制删除订阅。

有关实现细节的更多信息，请参见 [PR-6383](https://github.com/apache/pulsar/pull/6383)。

## 函数

### 内置函数

这个 PR 实现了以添加内置连接器相同的方式创建内置函数的可能性。

有关实现细节的更多信息，请参见 [PR-6895](https://github.com/apache/pulsar/pull/6895)。

### 为生产使用添加 Go Function 心跳（和 gRPC 服务）

有关实现细节的更多信息，请参见 [PR-6031](https://github.com/apache/pulsar/pull/6031)。

### 向函数添加自定义属性选项

这个 PR 允许用户在提交函数时设置自定义系统属性。这可以用于通过系统属性传递凭据。

有关实现细节的更多信息，请参见 [PR-6348](https://github.com/apache/pulsar/pull/6348)。

### 分离函数 worker 和 broker 的 TLS 配置

有关实现细节的更多信息，请参见 [PR-6602](https://github.com/apache/pulsar/pull/6602)。

### 添加在函数和源中构建消费者的能力

以前，函数和源上下文给它们的写入者创建发布者的能力而不是消费者。这个 PR 修复了这个问题。

有关实现细节的更多信息，请参见 [PR-6954](https://github.com/apache/pulsar/pull/6954)。

## Pulsar SQL

### 支持 KeyValue schema

以前，Pulsar SQL 无法读取 KeyValue schema 数据。

这个 PR 为 Pulsar SQL 添加了 KeyValue schema 支持。它为键字段名添加前缀 `key.`，为值字段名添加前缀 `value.`。

有关实现细节的更多信息，请参见 [PR-6325](https://github.com/apache/pulsar/pull/6325)。

### 支持多个 Avro schema 版本

以前，如果您有一个主题的多个 Avro schema 版本，使用 Pulsar SQL 从这个主题查询数据会引入一些问题。有了这个更改，您可以发展主题的 schema 并保持主题的所有 schema 的传递向后兼容性，如果您想从这个主题查询数据。

有关实现细节的更多信息，请参见 [PR-4847](https://github.com/apache/pulsar/pull/4847)。

## Java 客户端

### 支持在关闭生产者时等待进行中的消息

以前，当您关闭生产者时，pulsar-client 立即使进行中的消息失败，即使它在 broker 成功持久化。大多数时候，用户想要等待那些进行中的消息而不是使它们失败。而 pulsar-client 库没有提供在关闭生产者之前等待进行中消息的方法。这个 PR 支持带标志的关闭 API，您可以在其中控制等待进行中消息。有了这个更改，您可以通过等待进行中消息来关闭生产者，pulsar-client 不会立即使那些消息失败。
以前，当您关闭生产者时，pulsar-client 立即使进行中的消息失败，即使它在 broker 成功持久化。大多数时候，用户想要等待那些进行中的消息而不是使它们失败。而 pulsar-client 库没有提供在关闭生产者之前等待进行中消息的方法。这个 PR 支持带标志的关闭 API，您可以在其中控制等待进行中消息。有了这个更改，您可以通过等待进行中消息来关闭生产者，pulsar-client 不会立即使那些消息失败。

有关实现细节的更多信息，请参见 [PR-6648](https://github.com/apache/pulsar/pull/6648)。

### 支持从输入流动态加载 TLS 证书/密钥

以前，pulsar-client 提供 TLS 认证支持，默认 TLS 提供者 `AuthenticationTls` 期望证书和密钥文件的文件路径。但是，在某些用例中，用户应用程序很难将证书/密钥文件本地存储以进行 TLS 认证。这个 PR 在 `AuthenticationTls` 中添加流支持以提供 X509Certs 和 PrivateKey，它们也在给定提供者中的流更改时执行自动刷新。

有关实现细节的更多信息，请参见 [PR-6760](https://github.com/apache/pulsar/pull/6760)。

### 支持在异步发送消息抛出异常时返回序列 ID

以前，当异步发送消息失败时，抛出异常，但不知道哪条消息异常，用户不知道哪些消息需要重试。这个 PR 在客户端进行支持的更改。抛出异常时，设置 sequenceId `org.apache.pulsar.client.api.PulsarClientException`。

有关实现细节的更多信息，请参见 [PR-6825](https://github.com/apache/pulsar/pull/6825)。

## 更多信息

- 要下载 Apache Pulsar 2.6.0，点击[这里](https://pulsar.apache.org/download/)。
- 有关 Apache Pulsar 2.6.0 的更多信息，请参见 [2.6.0 发布说明](https://pulsar.apache.org/release-notes/#2.6.0) 和 [2.6.0 PR 列表](https://github.com/apache/pulsar/pulls?q=milestone%3A2.6.0+-label%3Arelease%2F2.5.2+-label%3Arelease%2F2.5.1+)。

如果您有任何问题或建议，通过邮件列表或 slack 联系我们。

- [users@pulsar.apache.org](mailto:users@pulsar.apache.org)
- [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org)
- Pulsar slack 频道：https://apache-pulsar.slack.com/
- 在 https://apache-pulsar.herokuapp.com/ 自行注册

期待您对 [Pulsar](https://github.com/apache/pulsar) 的贡献。