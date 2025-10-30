---
id: adaptors-kafka
title: Pulsar 的 Apache Kafka 适配器
sidebar_label: "Kafka 客户端包装器"
description: 学习如何使用 Pulsar Kafka 兼容性包装器并配置 Pulsar 认证提供者。
---


Pulsar 为当前使用 [Apache Kafka](http://kafka.apache.org) Java 客户端 API 编写的应用程序提供了一个简单的选项。

## 使用 Pulsar Kafka 兼容性包装器

要使用 Pulsar Kafka 兼容性包装器，请完成以下步骤。

**步骤 1：** 在现有应用程序中，更改常规的 Kafka 客户端依赖并将其替换为 Pulsar Kafka 包装器。在 `pom.xml` 中移除以下依赖：

```xml
<dependency>
  <groupId>org.apache.kafka</groupId>
  <artifactId>kafka-clients</artifactId>
  <version>0.10.2.1</version>
</dependency>
```

**步骤 2：** 然后包含 Pulsar Kafka 包装器的依赖：

```xml
<dependency>
  <groupId>org.apache.pulsar</groupId>
  <artifactId>pulsar-client-kafka</artifactId>
  <version>@pulsar:version@</version>
</dependency>
```

使用新的依赖后，现有代码无需任何更改即可工作。您需要调整配置，确保生产者和消费者指向 Pulsar 服务而不是 Kafka，并使用特定的 Pulsar Topic。

## 与现有 Kafka 客户端一起使用 Pulsar Kafka 兼容性包装器

从 Kafka 迁移到 Pulsar 时，应用程序可能在迁移期间同时使用原始 Kafka 客户端和 Pulsar Kafka 包装器。您应该考虑使用未着色的 Pulsar Kafka 客户端包装器。

```xml
<dependency>
  <groupId>org.apache.pulsar</groupId>
  <artifactId>pulsar-client-kafka-original</artifactId>
  <version>@pulsar:version@</version>
</dependency>
```

使用此依赖时，使用 `org.apache.kafka.clients.producer.PulsarKafkaProducer` 而不是 `org.apache.kafka.clients.producer.KafkaProducer` 来构造生产者，对于消费者使用 `org.apache.kafka.clients.producer.PulsarKafkaConsumer`。

## 生产者示例

```java
// Topic 需要是常规的 Pulsar topic
String topic = "persistent://public/default/my-topic";

Properties props = new Properties();
// 指向 Pulsar 服务
props.put("bootstrap.servers", "pulsar://localhost:6650");

props.put("key.serializer", IntegerSerializer.class.getName());
props.put("value.serializer", StringSerializer.class.getName());

Producer<Integer, String> producer = new KafkaProducer(props);

for (int i = 0; i < 10; i++) {
    producer.send(new ProducerRecord<Integer, String>(topic, i, "hello-" + i));
    log.info("消息 {} 发送成功", i);
}

producer.close();
```

## 消费者示例

```java
String topic = "persistent://public/default/my-topic";

Properties props = new Properties();
// 指向 Pulsar 服务
props.put("bootstrap.servers", "pulsar://localhost:6650");
props.put("group.id", "my-subscription-name");
props.put("enable.auto.commit", "false");
props.put("key.deserializer", IntegerDeserializer.class.getName());
props.put("value.deserializer", StringDeserializer.class.getName());

Consumer<Integer, String> consumer = new KafkaConsumer(props);
consumer.subscribe(Arrays.asList(topic));

while (true) {
    ConsumerRecords<Integer, String> records = consumer.poll(100);
    records.forEach(record -> {
        log.info("收到记录: {}", record);
    });

    // 提交最后偏移量
    consumer.commitSync();
}
```

## 完整示例

您可以在[这里](https://github.com/apache/pulsar-adapters/tree/master/pulsar-client-kafka-compat/pulsar-client-kafka-tests/src/test/java/org/apache/pulsar/client/kafka/compat/examples)找到完整的生产者和消费者示例。

## 兼容性矩阵

目前，Pulsar Kafka 包装器支持 Kafka API 提供的大部分操作。

### 生产者

API：

| 生产者方法                                                                 | 是否支持 | 注释                                                                    |
|:---------------------------------------------------------------------------|:---------|:-------------------------------------------------------------------------|
| `Future<RecordMetadata> send(ProducerRecord<K, V> record)`                 | 是       |                                                                          |
| `Future<RecordMetadata> send(ProducerRecord<K, V> record, Callback callback)` | 是       |                                                                          |
| `void flush()`                                                              | 是       |                                                                          |
| `List<PartitionInfo> partitionsFor(String topic)`                           | 否       |                                                                          |
| `Map<MetricName, ? extends Metric> metrics()`                               | 否       |                                                                          |
| `void close()`                                                              | 是       |                                                                          |
| `void close(long timeout, TimeUnit unit)`                                   | 是       |                                                                          |

属性：

| 配置属性                                 | 是否支持 | 注释                                                                         |
|:------------------------------------------|:---------|:------------------------------------------------------------------------------|
| `acks`                                    | 忽略     | 持久性和 Quorum 写入在命名空间级别配置                                         |
| `auto.offset.reset`                       | 是       | 如果您没有给出特定设置，它使用 `earliest` 作为默认值。                         |
| `batch.size`                              | 忽略     |                                                                               |
| `bootstrap.servers`                       | 是       |                                 |
| `buffer.memory`                           | 忽略     |                                                                               |
| `client.id`                               | 忽略     |                                                                               |
| `compression.type`                        | 是       | 允许 `gzip` 和 `lz4`。不支持 `snappy`。                                        |
| `connections.max.idle.ms`                 | 是       | 仅支持最多 2,147,483,647,000(Integer.MAX_VALUE * 1000) 毫秒的空闲时间         |
| `interceptor.classes`                     | 是       |                                                                               |
| `key.serializer`                          | 是       |                                                                               |
| `linger.ms`                               | 是       | 控制批量消息时的组提交时间                                                    |
| `max.block.ms`                            | 忽略     |                                                                               |
| `max.in.flight.requests.per.connection`   | 忽略     | 在 Pulsar 中，即使有多个请求在飞行中也保持顺序                                 |
| `max.request.size`                        | 忽略     |                                                                               |
| `metric.reporters`                        | 忽略     |                                                                               |
| `metrics.num.samples`                     | 忽略     |                                                                               |
| `metrics.sample.window.ms`                | 忽略     |                                                                               |
| `partitioner.class`                       | 是       |                                                                               |
| `receive.buffer.bytes`                    | 忽略     |                                                                               |
| `reconnect.backoff.ms`                    | 忽略     |                                                                               |
| `request.timeout.ms`                      | 忽略     |                                                                               |
| `retries`                                 | 忽略     | Pulsar 客户端使用指数退避重试，直到发送超时过期。                              |
| `send.buffer.bytes`                       | 忽略     |                                                                               |
| `timeout.ms`                              | 是       |                                                                               |
| `value.serializer`                        | 是       |                                                                               |


### 消费者

下表列出了消费者 API。

| 消费者方法                                                                                                 | 是否支持 | 注释 |
|:-----------------------------------------------------------------------------------------------------------|:---------|:------|
| `Set<TopicPartition> assignment()`                                                                        | 否       |       |
| `Set<String> subscription()`                                                                              | 是       |       |
| `void subscribe(Collection<String> topics)`                                                               | 是       |       |
| `void subscribe(Collection<String> topics, ConsumerRebalanceListener callback)`                            | 否       |       |
| `void assign(Collection<TopicPartition> partitions)`                                                      | 否       |       |
| `void subscribe(Pattern pattern, ConsumerRebalanceListener callback)`                                     | 否       |       |
| `void unsubscribe()`                                                                                      | 是       |       |
| `ConsumerRecords<K, V> poll(long timeoutMillis)`                                                          | 是       |       |
| `void commitSync()`                                                                                       | 是       |       |
| `void commitSync(Map<TopicPartition, OffsetAndMetadata> offsets)`                                         | 是       |       |
| `void commitAsync()`                                                                                      | 是       |       |
| `void commitAsync(OffsetCommitCallback callback)`                                                         | 是       |       |
| `void commitAsync(Map<TopicPartition, OffsetAndMetadata> offsets, OffsetCommitCallback callback)`         | 是       |       |
| `void seek(TopicPartition partition, long offset)`                                                        | 是       |       |
| `void seekToBeginning(Collection<TopicPartition> partitions)`                                             | 是       |       |
| `void seekToEnd(Collection<TopicPartition> partitions)`                                                   | 是       |       |
| `long position(TopicPartition partition)`                                                                  | 是       |       |
| `OffsetAndMetadata committed(TopicPartition partition)`                                                    | 是       |       |
| `Map<MetricName, ? extends Metric> metrics()`                                                              | 否       |       |
| `List<PartitionInfo> partitionsFor(String topic)`                                                          | 否       |       |
| `Map<String, List<PartitionInfo>> listTopics()`                                                            | 否       |       |
| `Set<TopicPartition> paused()`                                                                             | 否       |       |
| `void pause(Collection<TopicPartition> partitions)`                                                        | 否       |       |
| `void resume(Collection<TopicPartition> partitions)`                                                       | 否       |       |
| `Map<TopicPartition, OffsetAndTimestamp> offsetsForTimes(Map<TopicPartition, Long> timestampsToSearch)`   | 否       |       |
| `Map<TopicPartition, Long> beginningOffsets(Collection<TopicPartition> partitions)`                        | 否       |       |
| `Map<TopicPartition, Long> endOffsets(Collection<TopicPartition> partitions)`                              | 否       |       |
| `void close()`                                                                                             | 是       |       |
| `void close(long timeout, TimeUnit unit)`                                                                  | 是       |       |
| `void wakeup()`                                                                                            | 否       |       |

属性：

| 配置属性                     | 是否支持 | 注释                                                 |
|:------------------------------|:---------|:------------------------------------------------------|
| `group.id`                    | 是       | 映射到 Pulsar 订阅名称                              |
| `max.poll.records`            | 是       |                                                       |
| `max.poll.interval.ms`        | 忽略     | 消息从 Broker"推送"而来                              |
| `session.timeout.ms`          | 忽略     |                                                       |
| `heartbeat.interval.ms`       | 忽略     |                                                       |
| `bootstrap.servers`           | 是       | 需要指向单个 Pulsar 服务 URL                         |
| `enable.auto.commit`          | 是       |                                                       |
| `auto.commit.interval.ms`     | 忽略     | 使用自动提交时，确认会立即发送到 Broker               |
| `partition.assignment.strategy` | 忽略     |                                                       |
| `auto.offset.reset`           | 是       | 仅支持 earliest 和 latest。                          |
| `fetch.min.bytes`             | 忽略     |                                                       |
| `fetch.max.bytes`             | 忽略     |                                                       |
| `fetch.max.wait.ms`           | 忽略     |                                                       |
| `interceptor.classes`         | 是       |                                                       |
| `metadata.max.age.ms`         | 忽略     |                                                       |
| `max.partition.fetch.bytes`   | 忽略     |                                                       |
| `send.buffer.bytes`           | 忽略     |                                                       |
| `receive.buffer.bytes`        | 忽略     |                                                       |
| `client.id`                   | 忽略     |                                                       |


## 自定义 Pulsar 配置

您可以直接从 Kafka 属性配置 Pulsar 认证提供者。

### Pulsar 客户端属性

| 配置属性                        | 默认值   | 注释                                                                                  |
|:--------------------------------|:---------|:---------------------------------------------------------------------------------------|
| [`pulsar.authentication.class`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setAuthentication-org.apache.pulsar.client.api.Authentication-)          |          | 配置认证提供者。例如，`org.apache.pulsar.client.impl.auth.AuthenticationTls`。|
| [`pulsar.authentication.params.map`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setAuthentication-java.lang.String-java.util.Map-)          |          | 表示认证插件参数的映射。                                                                |
| [`pulsar.authentication.params.string`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setAuthentication-java.lang.String-java.lang.String-)          |          | 表示认证插件参数的字符串，例如，`key1:val1,key2:val2`。                                   |
| [`pulsar.use.tls`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setUseTls-boolean-)                       | `false`  | 启用 TLS 传输加密。                                                                     |
| [`pulsar.tls.trust.certs.file.path`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setTlsTrustCertsFilePath-java.lang.String-)   |          | TLS 信任证书存储的路径。                                                                |
| [`pulsar.tls.allow.insecure.connection`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setTlsAllowInsecureConnection-boolean-) | `false`  | 接受来自 Broker 的自签名证书。                                                         |
| [`pulsar.operation.timeout.ms`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setOperationTimeout-int-java.util.concurrent.TimeUnit-) | `30000`  | 常规操作超时。                                                                          |
| [`pulsar.stats.interval.seconds`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setStatsInterval-long-java.util.concurrent.TimeUnit-) | `60`     | Pulsar 客户端库统计打印间隔。                                                           |
| [`pulsar.num.io.threads`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setIoThreads-int-) | `1`      | 要使用的 Netty IO 线程数。                                                              |
| [`pulsar.connections.per.broker`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setConnectionsPerBroker-int-) | `1`      | 每个 Broker 的最大连接数。                                                              |
| [`pulsar.use.tcp.nodelay`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setUseTcpNoDelay-boolean-) | `true`   | TCP 无延迟。                                                                            |
| [`pulsar.concurrent.lookup.requests`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setConcurrentLookupRequest-int-) | `50000`  | 并发 Topic 查找的最大数量。                                                             |
| [`pulsar.max.number.rejected.request.per.connection`](/api/client/org/apache/pulsar/client/api/ClientConfiguration.html#setMaxNumberOfRejectedRequestPerConnection-int-) | `50`     | 强制关闭连接的错误阈值。                                                                |
| [`pulsar.keepalive.interval.ms`](/api/client/org/apache/pulsar/client/api/ClientBuilder.html#keepAliveInterval-int-java.util.concurrent.TimeUnit-)| `30000`  | 每个客户端-Broker-连接的保持活跃间隔。                                                  |


### Pulsar 生产者属性

| 配置属性                        | 默认值   | 注释                                                                                  |
|:--------------------------------|:---------|:---------------------------------------------------------------------------------------|
| [`pulsar.producer.name`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setProducerName-java.lang.String-) |          | 指定生产者名称。                                                                        |
| [`pulsar.producer.initial.sequence.id`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setInitialSequenceId-long-) |          | 指定此生产者的序列 ID 基准。                                                           |
| [`pulsar.producer.max.pending.messages`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setMaxPendingMessages-int-) | `1000`   | 设置等待接收来自 Broker 的确认的消息队列的最大大小。                                    |
| [`pulsar.producer.max.pending.messages.across.partitions`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setMaxPendingMessagesAcrossPartitions-int-) | `50000`  | 设置所有分区中待处理消息的最大数量。                                                   |
| [`pulsar.producer.batching.enabled`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setBatchingEnabled-boolean-) | `true`   | 控制是否为生产者启用消息的自动批处理。                                                 |
| [`pulsar.producer.batching.max.messages`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setBatchingMaxMessages-int-) | `1000`   | 批处理中的最大消息数。                                                                 |
| [`pulsar.block.if.producer.queue.full`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setBlockIfQueueFull-boolean-) |          | 如果队列已满，指定阻塞生产者。                                                         |
| [`pulsar.crypto.reader.factory.class.name`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setCryptoKeyReader-org.apache.pulsar.client.api.CryptoKeyReader-) |          | 指定允许生产者创建 CryptoKeyReader 的 CryptoReader-Factory(`CryptoKeyReaderFactory`) 类名。 |


### Pulsar 消费者属性

| 配置属性                        | 默认值   | 注释                                                                                  |
|:--------------------------------|:---------|:---------------------------------------------------------------------------------------|
| [`pulsar.consumer.name`](/api/client/org/apache/pulsar/client/api/ConsumerConfiguration.html#setConsumerName-java.lang.String-) |          | 指定消费者名称。                                                                        |
| [`pulsar.consumer.receiver.queue.size`](/api/client/org/apache/pulsar/client/api/ConsumerConfiguration.html#setReceiverQueueSize-int-) | 1000     | 设置消费者接收队列的大小。                                                              |
| [`pulsar.consumer.acknowledgments.group.time.millis`](/api/client/org/apache/pulsar/client/api/ConsumerBuilder.html#acknowledgmentGroupTime-long-java.util.concurrent.TimeUnit-) | 100      | 设置消费者向 Broker 发送确认的最大组时间。                                              |
| [`pulsar.consumer.total.receiver.queue.size.across.partitions`](/api/client/org/apache/pulsar/client/api/ConsumerConfiguration.html#setMaxTotalReceiverQueueSizeAcrossPartitions-int-) | 50000    | 设置跨分区的总接收队列的最大大小。                                                      |
| [`pulsar.consumer.subscription.topics.mode`](/api/client/org/apache/pulsar/client/api/ConsumerBuilder.html#subscriptionTopicsMode-Mode-) | PersistentOnly | 设置消费者的订阅 Topic 模式。                                                           |
| [`pulsar.crypto.reader.factory.class.name`](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.html#setCryptoKeyReader-org.apache.pulsar.client.api.CryptoKeyReader-) |          | 指定允许消费者创建 CryptoKeyReader 的 CryptoReader-Factory(`CryptoKeyReaderFactory`) 类名。 |