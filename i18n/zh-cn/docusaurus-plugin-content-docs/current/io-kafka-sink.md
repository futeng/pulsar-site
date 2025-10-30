---
id: io-kafka-sink
title: Kafka sink connector
sidebar_label: "Kafka sink connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

Kafka sink 连接器从 Pulsar topic 拉取消息，并将消息持久化到 Kafka topic。

本指南解释如何配置和使用 Kafka sink 连接器。

## 配置

Kafka sink 连接器的配置具有以下参数。

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
|`acks`|String|是|" " (空字符串) |生产者在请求完成前要求领导者接收的确认数。<br />这控制发送记录的持久性。
|`batchsize`|long|否|16384L|Kafka 生产者在将记录发送给代理之前尝试批处理记录的批次大小。
|`maxRequestSize`|long|否|1048576L|Kafka 请求的最大大小（字节）。
|`topic`|String|是|" " (空字符串) |从 Pulsar 接收消息的 Kafka topic。
| `keyDeserializationClass` | String|否 | org.apache.kafka.common.serialization.StringSerializer | Kafka 生产者用于序列化键的序列化器类。
| `valueDeserializationClass` | String|否 | org.apache.kafka.common.serialization.ByteArraySerializer | Kafka 生产者用于序列化值的序列化器类。<br /><br />序列化器由 [`KafkaAbstractSink`](https://github.com/apache/pulsar/blob/master/pulsar-io/kafka/src/main/java/org/apache/pulsar/io/kafka/KafkaAbstractSink.java) 的特定实现设置。
|`producerConfigProperties`|Map|否|" " (空字符串)|要传递给生产者的生产者配置属性。<br /><br />**注意：连接器配置文件中指定的其他属性优先于此配置**。


### 示例

在使用 Kafka sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "bootstrapServers": "localhost:6667",
        "topic": "test",
        "acks": "1",
        "batchSize": "16384",
        "maxRequestSize": "1048576",
        "producerConfigProperties": {
           "client.id": "test-pulsar-producer",
           "security.protocol": "SASL_PLAINTEXT",
           "sasl.mechanism": "GSSAPI",
           "sasl.kerberos.service.name": "kafka",
           "acks": "all"
        }
     }
  }
  ```

* YAML

  ```yaml
  configs:
      bootstrapServers: "localhost:6667"
      topic: "test"
      acks: "1"
      batchSize: "16384"
      maxRequestSize: "1048576"
      producerConfigProperties:
          client.id: "test-pulsar-producer"
          security.protocol: "SASL_PLAINTEXT"
          sasl.mechanism: "GSSAPI"
          sasl.kerberos.service.name: "kafka"
          acks: "all"
  ```