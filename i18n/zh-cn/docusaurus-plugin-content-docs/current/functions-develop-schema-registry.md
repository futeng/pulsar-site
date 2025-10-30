---
id: functions-develop-schema-registry
title: 使用 Schema 注册中心
sidebar_label: "使用 Schema 注册中心"
description: 学习在 Pulsar 中使用 Schema 注册中心开发函数。
---

Pulsar 具有内置的 [Schema 注册中心](schema-overview.md) 并捆绑了流行的 [Schema 类型](schema-understand.md#schema-type)。Pulsar Functions 可以利用输入 Topic 的现有 Schema 信息并派生输入类型。Schema 注册中心也适用于输出 Topic。

下表概述了 Pulsar Functions 中 Schema 类型的支持情况。

| Schema 类型    | Java 函数 | Python 函数 | Go 函数 |
|----------------|---------------|-----------------|-------------|
| String         | ✅             | ✅               |             |
| Avro           | ✅             | ✅               |             |
| JSON           | ✅             | ✅               |             |
| Protobuf       | ✅             |                 |             |
| ProtobufNative | ✅             |                 |             |
| Key/Value      | ✅             |                 |             |
| AUTO_PRODUCE   | ✅             |                 |             |
| AUTO_CONSUME   | ✅             |                 |             |

有关更多代码示例，请参阅 [Java 函数](https://github.com/apache/pulsar/blob/master/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/AutoSchemaFunction.java) 和 [Python 函数]( https://github.com/apache/pulsar/blob/master/pulsar-functions/python-examples/)。