---
id: client-libraries-java-initialize
title: 初始化 Java 客户端
sidebar_label: "初始化"
description: 学习如何在 Pulsar 中初始化 Java 客户端。
---


您可以使用目标 Pulsar [集群](reference-terminology.md#cluster)的 URL 来实例化 [PulsarClient](/api/client/org/apache/pulsar/client/api/PulsarClient) 对象，如下所示：

```java
PulsarClient client = PulsarClient.builder()
        .serviceUrl("pulsar://localhost:6650")
        .build();
```

如果您有多个 broker，可以按如下方式初始化 PulsarClient：

```java
PulsarClient client = PulsarClient.builder()
        .serviceUrl("pulsar://localhost:6650,localhost:6651,localhost:6652")
        .build();
```

:::note

如果您以[独立模式](getting-started-standalone.md)运行集群，默认情况下 broker 可通过 `pulsar://localhost:6650` URL 访问。

:::

有关详细的客户端配置，请参阅[参考文档](pathname:///reference/#/@pulsar:version_reference@/client/)。