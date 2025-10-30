---
id: adaptors-storm
title: Pulsar 的 Apache Storm 适配器
sidebar_label: "Apache Storm"
description: 全面了解 Pulsar 的 Apache Storm 适配器。
---

Pulsar Storm 是用于与 [Apache Storm](http://storm.apache.org/) 拓扑集成的适配器。它提供了用于发送和接收数据的核心 Storm 实现。

应用程序可以通过通用的 Pulsar spout 将数据注入到 Storm 拓扑中，也可以通过通用的 Pulsar bolt 从 Storm 拓扑消费数据。

## 使用 Pulsar Storm 适配器

要使用 Pulsar Storm 适配器，您需要包含 Pulsar Storm 适配器的依赖：

```xml
<dependency>
  <groupId>org.apache.pulsar</groupId>
  <artifactId>pulsar-storm</artifactId>
  <version>${pulsar.version}</version>
</dependency>
```

## Pulsar Spout

Pulsar Spout 允许 Storm 拓扑消费在 topic 上发布的数据。它根据接收到的消息和客户端提供的 `MessageToValuesMapper` 发出 Storm tuple。

未能被下游 bolt 处理的 tuple 将由 spout 以指数退避的方式重新注入，在可配置的超时时间（默认为 60 秒）或可配置的重试次数内（以先到者为准），之后将被消费者确认。以下是 spout 的构造示例：

```java
MessageToValuesMapper messageToValuesMapper = new MessageToValuesMapper() {

    @Override
    public Values toValues(Message msg) {
        return new Values(new String(msg.getData()));
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {
        // 声明输出字段
        declarer.declare(new Fields("string"));
    }
};

// 配置 Pulsar Spout
PulsarSpoutConfiguration spoutConf = new PulsarSpoutConfiguration();
spoutConf.setServiceUrl("pulsar://broker.messaging.usw.example.com:6650");
spoutConf.setTopic("persistent://my-property/usw/my-ns/my-topic1");
spoutConf.setSubscriptionName("my-subscriber-name1");
spoutConf.setMessageToValuesMapper(messageToValuesMapper);

// 创建 Pulsar Spout
PulsarSpout spout = new PulsarSpout(spoutConf);
```

完整示例请点击[这里](https://github.com/apache/pulsar-adapters/blob/master/pulsar-storm/src/test/java/org/apache/pulsar/storm/PulsarSpoutTest.java)。

## Pulsar Bolt

Pulsar bolt 允许 Storm 拓扑中的数据在 topic 上发布。它根据接收到的 Storm tuple 和客户端提供的 `TupleToMessageMapper` 发布消息。

也可以使用分区 topic 在不同的 topic 上发布消息。在 `TupleToMessageMapper` 的实现中，需要在消息中提供"key"，这将把具有相同 key 的消息发送到相同的 topic。以下是 bolt 示例：

```java
TupleToMessageMapper tupleToMessageMapper = new TupleToMessageMapper() {

    @Override
    public TypedMessageBuilder<byte[]> toMessage(TypedMessageBuilder<byte[]> msgBuilder, Tuple tuple) {
        String receivedMessage = tuple.getString(0);
        // 消息处理
        String processedMsg = receivedMessage + "-processed";
        return msgBuilder.value(processedMsg.getBytes());
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {
        // 声明输出字段
    }
};

// 配置 Pulsar Bolt
PulsarBoltConfiguration boltConf = new PulsarBoltConfiguration();
boltConf.setServiceUrl("pulsar://broker.messaging.usw.example.com:6650");
boltConf.setTopic("persistent://my-property/usw/my-ns/my-topic2");
boltConf.setTupleToMessageMapper(tupleToMessageMapper);

// 创建 Pulsar Bolt
PulsarBolt bolt = new PulsarBolt(boltConf);
```