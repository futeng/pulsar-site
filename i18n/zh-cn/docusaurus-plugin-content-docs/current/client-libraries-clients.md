---
id: client-libraries-clients
title: 使用客户端
sidebar_label: "使用客户端"
description: 学习如何在 Pulsar 中使用客户端。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

在设置客户端库并创建客户端对象后，您可以探索更多功能以开始使用您的客户端。

## 创建带有多个通告监听器的客户端

为确保内部网络和外部网络中的客户端都能连接到 Pulsar 集群，Pulsar 引入了 [advertisedListeners](concepts-multiple-advertised-listeners.md)。

以下示例演示如何使用多个通告监听器创建 Python 客户端：


````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Python","value":"Python"}]}>
  <TabItem value="Java">

  ```java
  PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://xxxx:6650")
    .listenerName("external")
    .build();
  ```

  </TabItem>
  <TabItem value="C++">

  ```cpp
  ClientConfiguration clientConfiguration;
  clientConfiguration.setListenerName("external");
  Client client("pulsar://xxxx:6650", clientConfiguration);
  ```

  </TabItem>
  <TabItem value="Python">

  ```python
  import pulsar

  client = pulsar.Client('pulsar://localhost:6650', listener_name='external')
  ```

  </TabItem>
</Tabs>
````

## 设置内存限制

您可以使用内存限制参数来控制总的客户端内存使用量，
此客户端下的生产者和消费者将竞争分配的内存。有关实现详情，请参阅 [PIP 74：Pulsar 客户端内存限制](https://github.com/apache/pulsar/wiki/PIP-74%3A-Pulsar-client-memory-limits)。

````mdx-code-block
<Tabs groupId="lang-choice"
defaultValue="Java"
values={[{"label":"Java","value":"Java"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

  ```java
  PulsarClient client = PulsarClient.builder()
  .serviceUrl("pulsar://xxxx:6650")
  .memoryLimit(64, SizeUnit.MEGA_BYTES)
  .build();
  ```

</TabItem>
<TabItem value="Go">

  ```go
  client, err := pulsar.NewClient(pulsar.ClientOptions{
    URL: "pulsar://xxxx:6650",
    MemoryLimitBytes: 64 * 1024 * 1024, // 单位：字节
  })
  ```

</TabItem>
</Tabs>
````
