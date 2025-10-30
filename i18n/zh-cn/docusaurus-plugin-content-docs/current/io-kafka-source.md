---
id: io-kafka-source
title: Kafka source connector
sidebar_label: "Kafka source connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

Kafka source 连接器从 Kafka topic 拉取消息，并将消息持久化到 Pulsar topic。

本指南解释如何配置和使用 Kafka source 连接器。

## 配置

Kafka source 连接器的配置具有以下属性。

### 属性

| 名称 | 类型| 必需 | 默认值 | 描述
|------|----------|---------|-------------|-------------|
|  `bootstrapServers` |String| 是 | " " (空字符串) | 用于建立与 Kafka 集群初始连接的主机和端口对的逗号分隔列表。 |
|  `securityProtocol` |String| 否 | " " (空字符串) | 用于与 Kafka 代理通信的协议。 |
|  `saslMechanism` |String| 否 | " " (空字符串) | 用于 Kafka 客户端连接的 SASL 机制。 |
|  `saslJaasConfig` |String| 否 | " " (空字符串) | 用于 SASL 连接的 JAAS 登录上下文参数，格式与 JAAS 配置文件相同。 |
|  `sslEnabledProtocols` |String| 否 | " " (空字符串) | 为 SSL 连接启用的协议列表。 |
|  `sslEndpointIdentificationAlgorithm` |String| 否 | " " (空字符串) | 用于使用服务器证书验证服务器主机名的端点识别算法。 |
|  `sslTruststoreLocation` |String| 否 | " " (空字符串) | 信任存储文件的位置。 |
|  `sslTruststorePassword` |String| 否 | " " (空字符串) | 信任存储文件的密码。 |
| `groupId` |String| 是 | " " (空字符串) | 标识此消费者所属的消费者进程组的唯一字符串。 |
| `fetchMinBytes` | long|否 | 1 | 每次获取响应期望的最小字节数。 |
| `autoCommitEnabled` | boolean |否 | true | 如果设置为 true，消费者的偏移量会定期在后台提交。<br /><br /> 当进程失败时，这个提交的偏移量被用作新消费者开始的位置。 |
| `autoCommitIntervalMs` | long|否 | 5000 | 如果 `autoCommitEnabled` 设置为 true，消费者偏移量自动提交到 Kafka 的频率（毫秒）。 |
| `heartbeatIntervalMs` | long| 否 | 3000 | 使用 Kafka 组管理功能时向消费者发送心跳的间隔。<br /><br />**注意：`heartbeatIntervalMs` 必须小于 `sessionTimeoutMs`**。|
| `sessionTimeoutMs` | long|否 | 30000 | 使用 Kafka 组管理功能时用于检测消费者失败的超时时间。 |
| `topic` | String|是 | " " (空字符串)| 向 Pulsar 发送消息的 Kafka topic。 |
|  `consumerConfigProperties` | Map| 否 | " " (空字符串) | 要传递给消费者的消费者配置属性。<br /><br />**注意：连接器配置文件中指定的其他属性优先于此配置**。 |
| `keyDeserializationClass` | String|否 | org.apache.kafka.common.serialization.StringDeserializer | Kafka 消费者用于反序列化键的反序列化器类。<br />反序列化器由 [`KafkaAbstractSource`](https://github.com/apache/pulsar/blob/master/pulsar-io/kafka/src/main/java/org/apache/pulsar/io/kafka/KafkaAbstractSource.java) 的特定实现设置。
| `valueDeserializationClass` | String|否 | org.apache.kafka.common.serialization.ByteArrayDeserializer | Kafka 消费者用于反序列化值的反序列化器类。
| `autoOffsetReset` | String | 否 | earliest | 默认偏移量重置策略。 |

### 模式管理

此 Kafka source 连接器根据 Kafka topic 上存在的数据类型将模式应用到 topic。
您可以从 `keyDeserializationClass` 和 `valueDeserializationClass` 配置参数中检测数据类型。

如果 `valueDeserializationClass` 是 `org.apache.kafka.common.serialization.StringDeserializer`，您可以在 Pulsar topic 上设置 Schema.STRING() 作为模式类型。

如果 `valueDeserializationClass` 是 `io.confluent.kafka.serializers.KafkaAvroDeserializer`，Pulsar 会从 Confluent Schema Registry® 下载 AVRO 模式
并在 Pulsar topic 上正确设置它。

在这种情况下，您需要在 source 的 `consumerConfigProperties` 配置条目内设置 `schema.registry.url`。

如果 `keyDeserializationClass` 不是 `org.apache.kafka.common.serialization.StringDeserializer`，这意味着
您的键不是字符串，Kafka Source 使用具有 SEPARATED 编码的 KeyValue 模式类型。

Pulsar 支持键的 AVRO 格式。

在这种情况下，您可以具有以下属性的 Pulsar topic：
- 模式：具有 SEPARATED 编码的 KeyValue 模式
- 键：Kafka 消息的键内容（base64 编码）
- 值：Kafka 消息的值内容
- KeySchema：从 `keyDeserializationClass` 检测到的模式
- ValueSchema：从 `valueDeserializationClass` 检测到的模式

Topic 压缩和分区路由使用包含 Kafka 键的 Pulsar 键，因此它们由您在 Kafka 上拥有的相同值驱动。

当您从 Pulsar topic 消费数据时，您可以使用 `KeyValue` 模式。这样，您可以正确解码数据。
如果您想访问原始键，可以使用 `Message#getKeyBytes()` API。

### 示例

在使用 Kafka source 连接器之前，您需要通过以下方法之一创建配置文件。

- JSON

   ```json
     {
       "bootstrapServers": "pulsar-kafka:9092",
       "groupId": "test-pulsar-io",
       "topic": "my-topic",
       "sessionTimeoutMs": "10000",
       "autoCommitEnabled": false
     }
   ```

- YAML

   ```yaml
   configs:
      bootstrapServers: "pulsar-kafka:9092"
      groupId: "test-pulsar-io"
      topic: "my-topic"
      sessionTimeoutMs: "10000"
      autoCommitEnabled: false
   ```

## 使用

您可以将 Kafka source 连接器作为 Pulsar 内置连接器，并在独立集群或本地集群上使用它。

### 独立集群

此示例描述如何使用 Kafka source 连接器在独立模式下从 Kafka 获取数据并将数据写入 Pulsar topic。

#### 先决条件

- 安装 [Docker](https://docs.docker.com/get-docker/)（社区版）。

#### 步骤

1. 下载并启动 Confluent Platform。
   有关详细信息，请参阅[文档](https://docs.confluent.io/platform/current/quickstart/ce-docker-quickstart.html#step-1-download-and-start-cp)以在本地安装 Kafka 服务。

2. 拉取 Pulsar 镜像并以独立模式启动 Pulsar。

   ```bash
   docker pull apachepulsar/pulsar:latest

   docker run -d -it -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-kafka-standalone apachepulsar/pulsar:latest bin/pulsar standalone
   ```

3. 创建生产者文件 _kafka-producer.py_。

   ```python
   from kafka import KafkaProducer
   producer = KafkaProducer(bootstrap_servers='localhost:9092')
   future = producer.send('my-topic', b'hello world')
   future.get()
   ```

4. 创建消费者文件 _pulsar-client.py_。

   ```python
   import pulsar

   client = pulsar.Client('pulsar://localhost:6650')
   consumer = client.subscribe('my-topic', subscription_name='my-aa')

   while True:
       msg = consumer.receive()
       print msg
       print dir(msg)
       print("Received message: '%s'" % msg.data())
       consumer.acknowledge(msg)

   client.close()
   ```

5. 将以下文件复制到 Pulsar。

   ```bash
   docker cp pulsar-io-kafka.nar pulsar-kafka-standalone:/pulsar
   docker cp kafkaSourceConfig.yaml pulsar-kafka-standalone:/pulsar/conf
   ```

6. 打开一个新的终端窗口，以本地运行模式启动 Kafka source 连接器。

   ```bash
   docker exec -it pulsar-kafka-standalone /bin/bash

   ./bin/pulsar-admin source localrun \
      --archive $PWD/pulsar-io-kafka.nar \
      --tenant public \
      --namespace default \
      --name kafka \
      --destination-topic-name my-topic \
      --source-config-file $PWD/conf/kafkaSourceConfig.yaml \
      --parallelism 1
   ```

7. 打开一个新的终端窗口并在本地运行 Kafka 生产者。

   ```bash
   python3 kafka-producer.py
   ```

8. 打开一个新的终端窗口并在本地运行 Pulsar 消费者。

   ```bash
   python3 pulsar-client.py
   ```

以下信息出现在消费者终端窗口。

   ```bash
   Received message: 'hello world'
   ```

### 本地集群

此示例解释如何在本地集群中创建 Kafka source 连接器。

1. 将 Kafka 连接器的 NAR 包复制到 Pulsar 连接器目录。

   ```bash
   cp pulsar-io-kafka-{{connector:version}}.nar $PULSAR_HOME/connectors/pulsar-io-kafka-{{connector:version}}.nar
   ```

2. 重新加载所有[内置连接器](io-connectors.md)。

   ```bash
   PULSAR_HOME/bin/pulsar-admin sources reload
   ```

3. 检查 Kafka source 连接器是否在列表中可用。

   ```bash
   PULSAR_HOME/bin/pulsar-admin sources available-sources
   ```

4. 使用 [`pulsar-admin sources create`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/sources?id=create) 命令在 Pulsar 集群上创建 Kafka source 连接器。

   ```bash
   PULSAR_HOME/bin/pulsar-admin sources create \
   --source-config-file <kafka-source-config.yaml 的绝对路径>
   ```