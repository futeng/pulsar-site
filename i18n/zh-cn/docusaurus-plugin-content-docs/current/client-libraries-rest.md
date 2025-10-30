---
id: client-libraries-rest
title: Pulsar REST
sidebar_label: "REST"
description: 学习如何使用 Pulsar REST 在不使用客户端库的情况下与 Pulsar 交互。
---

Pulsar 不仅提供了用于管理 Pulsar 集群中资源的 REST 端点，还提供了查询这些资源状态的方法。此外，Pulsar REST 提供了一种简单的方式与 Pulsar **交互而无需使用客户端库**，这对于应用程序使用 HTTP 与 Pulsar 交互很方便。

## 连接

要连接到 Pulsar，你需要指定一个 URL。

- 向非分区或分区主题生成消息

  ```
  brokerUrl:{8080/8081}/topics/{persistent/non-persistent}/{my-tenant}/{my-namespace}/{my-topic}
  ```

- 向分区主题的特定分区生成消息

  ```
  brokerUrl:{8080/8081}/topics/{persistent/non-persistent}/{my-tenant}/{my-namespace}/{my-topic}/partitions/{partition-number}
  ```

## 生产者

目前，你可以通过 REST 使用 cURL 或 Postman 等工具向以下目标生成消息。

- 非分区或分区主题

- 分区主题的特定分区

:::note

你只能通过 REST 向 Pulsar 中**已存在**的主题生成消息。

:::

通过 REST 消费和读取消息将在未来得到支持。

### 消息

- 以下是请求负载的结构。

  参数|必需?|描述
  |---|---|---
  `schemaVersion`|否|用于此消息的现有模式的模式版本 <br /><br />你需要提供以下之一：<br /><br /> - `schemaVersion` <br /> - `keySchema`/`valueSchema`<br /><br />如果两者都提供，则使用 `schemaVersion`
  `keySchema/valueSchema`|否|用于此消息的键模式 / 值模式
  `producerName`|否|生产者名称
  `Messages[] SingleMessage`|是|要发送的消息

- 以下是消息的结构。

  参数|必需?|类型|描述
  |---|---|---|---
  `payload`|是|`String`|实际消息负载 <br /><br />消息以字符串发送，并在服务器端使用给定模式编码
  `properties`|否|`Map<String, String>`|自定义属性
  `key`|否|`String`|分区键
  `replicationClusters`|否|`List<String>`|消息复制到的集群
  `eventTime`|否|`String`|消息事件时间
  `sequenceId`|否|`long`|消息序列 ID
  `disableReplication`|否|`boolean`|是否禁用消息复制
  `deliverAt`|否|`long`|仅在指定绝对时间戳或之后传递消息
  `deliverAfterMs`|否|`long`|仅在指定相对延迟后传递消息（以毫秒为单位）

### 模式

- 目前支持 Primitive、Avro、JSON 和 KeyValue 模式。

- 对于 Primitive、Avro 和 JSON 模式，模式应作为完整模式以字符串形式提供。

- 如果未设置模式，消息将使用字符串模式编码。

### 示例

以下是通过 REST 使用 JSON 模式向主题发送消息的示例。

假设你发送表示以下类的消息。

```java
   class Seller {
        public String state;
        public String street;
        public long zipCode;
    }

    class PC {
        public String brand;
        public String model;
        public int year;
        public GPU gpu;
        public Seller seller;
    }
```

使用以下命令向带有 JSON 模式的主题发送消息。

```shell
curl --location --request POST 'brokerUrl:{8080/8081}/topics/{persistent/non-persistent}/{my-tenant}/{my-namespace}/{my-topic}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "valueSchema": "{\"name\":\"\",\"schema\":\"eyJ0eXBlIjoicmVjb3JkIiwibmFtZSI6IlBDIiwibmFtZXNwYWNlIjoib3JnLmFwYWNoZS5wdWxzYXIuYnJva2VyLmFkbWluLlRvcGljc1Rlc3QiLCJmaWVsZHMiOlt7Im5hbWUiOiJicmFuZCIsInR5cGUiOlsibnVsbCIsInN0cmluZyJdLCJkZWZhdWx0IjpudWxsfSx7Im5hbWUiOiJncHUiLCJ0eXBlIjpbIm51bGwiLHsidHlwZSI6ImVudW0iLCJuYW1lIjoiR1BVIiwic3ltYm9scyI6WyJBTUQiLCJOVklESUEiXX1dLCJkZWZhdWx0IjpudWxsfSx7Im5hbWUiOiJtb2RlbCIsInR5cGUiOlsibnVsbCIsInN0cmluZyJdLCJkZWZhdWx0IjpudWxsfSx7Im5hbWUiOiJzZWxsZXIiLCJ0eXBlIjpbIm51bGwiLHsidHlwZSI6InJlY29yZCIsIm5hbWUiOiJTZWxsZXIiLCJmaWVsZHMiOlt7Im5hbWUiOiJzdGF0ZSIsInR5cGUiOlsibnVsbCIsInN0cmluZyJdLCJkZWZhdWx0IjpudWxsfSx7Im5hbWUiOiJzdHJlZXQiLCJ0eXBlIjpbIm51bGwiLCJzdHJpbmciXSwiZGVmYXVsdCI6bnVsbH0seyJuYW1lIjoiemlwQ29kZSIsInR5cGUiOiJsb25nIn1dfV0sImRlZmF1bHQiOm51bGx9LHsibmFtZSI6InllYXIiLCJ0eXBlIjoiaW50In1dfQ==\",\"type\":\"JSON\",\"properties\":{\"__jsr310ConversionEnabled\":\"false\",\"__alwaysAllowNull\":\"true\"},\"schemaDefinition\":\"{\\\"type\\\":\\\"record\\\",\\\"name\\\":\\\"PC\\\",\\\"namespace\\\":\\\"org.apache.pulsar.broker.admin.TopicsTest\\\",\\\"fields\\\":[{\\\"name\\\":\\\"brand\\\",\\\"type\\\":[\\\"null\\\",\\\"string\\\"],\\\"default\\\":null},{\\\"name\\\":\\\"gpu\\\",\\\"type\\\":[\\\"null\\\",{\\\"type\\\":\\\"enum\\\",\\\"name\\\":\\\"GPU\\\",\\\"symbols\\\":[\\\"AMD\\\",\\\"NVIDIA\\\"]}],\\\"default\\\":null},{\\\"name\\\":\\\"model\\\",\\\"type\\\":[\\\"null\\\",\\\"string\\\"],\\\"default\\\":null},{\\\"name\\\":\\\"seller\\\",\\\"type\\\":[\\\"null\\\",{\\\"type\\\":\\\"record\\\",\\\"name\\\":\\\"Seller\\\",\\\"fields\\\":[{\\\"name\\\":\\\"state\\\",\\\"type\\\":[\\\"null\\\",\\\"string\\\"],\\\"default\\\":null},{\\\"name\\\":\\\"street\\\",\\\"type\\\":[\\\"null\\\",\\\"string\\\"],\\\"default\\\":null},{\\\"name\\\":\\\"zipCode\\\",\\\"type\\\":\\\"long\\\"}]}],\\\"default\\\":null},{\\\"name\\\":\\\"year\\\",\\\"type\\\":\\\"int\\\"}]}\"}",

// 模式数据只是 base64 编码的 schemaDefinition。

  "producerName": "rest-producer",
  "messages": [
    {
      "key":"my-key",
      "payload":"{\"brand\":\"dell\",\"model\":\"alienware\",\"year\":2021,\"gpu\":\"AMD\",\"seller\":{\"state\":\"WA\",\"street\":\"main street\",\"zipCode\":98004}}",
      "eventTime":1603045262772,
      "sequenceId":1
    },
    {
      "key":"my-key",
      "payload":"{\"brand\":\"asus\",\"model\":\"rog\",\"year\":2020,\"gpu\":\"NVIDIA\",\"seller\":{\"state\":\"CA\",\"street\":\"back street\",\"zipCode\":90232}}",
      "eventTime":1603045262772,
      "sequenceId":2
    }
  ]
}
`
// 示例消息
```