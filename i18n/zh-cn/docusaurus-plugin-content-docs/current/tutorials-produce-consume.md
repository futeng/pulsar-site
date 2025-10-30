---
Id: tutorials-produce-consume
title: Produce and consume messages
sidebar_label: "Produce and consume messages"
description: Learn how to produce and consume messages in Pulsar.

---

在本教程中，我们将：
- 配置 Pulsar 客户端
- 创建订阅
- 创建生产者
- 发送测试消息
- 验证结果

## 前置条件

- [设置租户](tutorials-tenant.md)
- [创建命名空间](tutorials-namespace.md)
- [创建 Topic](tutorials-topic.md)

## 生产者和消费者消息

要生产和消费消息，请完成以下步骤。

1. 在 `${PULSAR_HOME}/conf/client.conf` 文件中，将 `webServiceUrl` 和 `brokerServiceUrl` 替换为您的服务 URL。

2. 创建订阅以消费来自 `apache/pulsar/test-topic` 的消息。

   ```bash
   bin/pulsar-client consume -s sub apache/pulsar/test-topic  -n 0
   ```

3. 在新的终端中，创建生产者并向 test-topic 发送 10 条消息。

   ```bash
   bin/pulsar-client produce apache/pulsar/test-topic  -m "---------hello apache pulsar-------" -n 10
   ```

4. 验证结果。

   ```
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------
   ----- got message -----
   ---------hello apache pulsar-------

   生产者端的输出显示消息已成功生产：
   18:15:15.489 [main] INFO  org.apache.pulsar.client.cli.PulsarClientTool - 10 messages successfully produced.
   ```

#### 相关主题

- [管理集群](admin-api-clusters.md)

