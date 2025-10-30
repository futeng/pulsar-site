---
id: get-started-pulsar-admin
title: pulsar-admin CLI 工具入门
sidebar_label: "pulsar-admin 入门"
---

本教程指导你使用 pulsar-admin CLI 管理 Topic 的每一步。它包含以下步骤：

1. 设置服务 URL。

2. 创建分区 Topic。

3. 更新分区数量。

4. 向 Topic 发送消息。

5. 检查 Topic 统计信息。

6. 删除 Topic。

## 前置条件

- [安装并启动 Pulsar 独立模式](getting-started-standalone.md)。本教程以运行 Pulsar 2.11 为例。

## 步骤

1. 在 [client.conf](https://github.com/apache/pulsar/blob/master/conf/client.conf) 中设置服务 URL 指向 broker 服务。

    ```bash
    webServiceUrl=http://localhost:8080/
    brokerServiceUrl=pulsar://localhost:6650/
    ```

2. 创建一个名为 test-topic-1 的持久化 Topic，包含 6 个分区。

    **输入**

    ```bash
    bin/pulsar-admin topics create-partitioned-topic \
    persistent://public/default/test-topic-1 \
    --partitions 6
    ```

    **输出**

    没有输出。你可以在步骤 5 中检查 Topic 的状态。

3. 将分区数量更新为 8。

    **输入**

    ```bash
    bin/pulsar-admin topics update-partitioned-topic \
    persistent://public/default/test-topic-1 \
    --partitions 8
    ```

    **输出**

    没有输出。你可以在步骤 5 中检查分区数量。

4. 向分区 Topic test-topic-1 发送一些消息。

    **输入**

    ```bash
    bin/pulsar-perf produce -u pulsar://localhost:6650 -r 1000 -i 1000 persistent://public/default/test-topic-1
    ```

    **输出**

    ```bash
    2023-03-07T15:33:56,832+0800 [main] INFO  org.apache.pulsar.testclient.PerformanceProducer - Starting Pulsar perf producer with config: {
      "confFile" : "/Users/yu/apache-pulsar-2.11.0/conf/client.conf",
      "serviceURL" : "pulsar://localhost:6650",
      "authPluginClassName" : "",
      "authParams" : "",
      "tlsTrustCertsFilePath" : "",
      "tlsAllowInsecureConnection" : false,
      "tlsHostnameVerificationEnable" : false,
      "maxConnections" : 1,
      "statsIntervalSeconds" : 1000,
      "ioThreads" : 1,
      "enableBusyWait" : false,
      "listenerName" : null,
      "listenerThreads" : 1,
      "maxLookupRequest" : 50000,
      "topics" : [ "persistent://public/default/test-topic-1" ],
      "numTestThreads" : 1,
      "msgRate" : 1000,
      "msgSize" : 1024,
      "numTopics" : 1,
    "numProducers" : 1,
      "separator" : "-",
      "sendTimeout" : 0,
      "producerName" : null,
      "adminURL" : "http://localhost:8080/",

    ...

    2023-03-07T15:35:03,769+0800 [Thread-0] INFO  org.apache.pulsar.testclient.PerformanceProducer - Aggregated latency stats --- Latency: mean:   8.931 ms - med:   3.775 - 95pct:  32.144 - 99pct:  98.432 - 99.9pct: 216.088 - 99.99pct: 304.807 - 99.999pct: 349.391 - Max: 351.235
    ```

5. 检查分区 Topic _test-topic-1_ 的内部统计信息。

    **输入**

    ```bash
    bin/pulsar-admin topics partitioned-stats-internal \
    persistent://public/default/test-topic-1
    ```

    **输出**

    以下是输出的一部分。有关 Topic 统计信息的详细说明，请参阅 [Pulsar 统计信息](administration-stats.md)。

    ```bash
    {
      "metadata" : {
        "partitions" : 8
      },
      "partitions" : {
        "persistent://public/default/test-topic-1-partition-1" : {
          "entriesAddedCounter" : 4213,
          "numberOfEntries" : 4213,
          "totalSize" : 8817693,
          "currentLedgerEntries" : 4212,
          "currentLedgerSize" : 8806289,
          "lastLedgerCreatedTimestamp" : "2023-03-07T15:33:59.367+08:00",
          "waitingCursorsCount" : 0,
          "pendingAddEntriesCount" : 0,
          "lastConfirmedEntry" : "65:4211",
          "state" : "LedgerOpened",
          "ledgers" : [ {
            "ledgerId" : 49,
            "entries" : 1,
            "size" : 11404,
            "offloaded" : false,
            "underReplicated" : false
          }, {
            "ledgerId" : 65,
            "entries" : 0,
            "size" : 0,
            "offloaded" : false,
            "underReplicated" : false
          } ],
          "cursors" : {
            "test-subscriptio-1" : {
              "markDeletePosition" : "49:-1",
              "readPosition" : "49:0",
              "waitingReadOp" : false,
              "pendingReadOps" : 0,
              "messagesConsumedCounter" : 0,
              "cursorLedger" : -1,
              "cursorLedgerLastEntry" : -1,
      "individuallyDeletedMessages" : "[]",
              "lastLedgerSwitchTimestamp" : "2023-03-06T16:41:32.801+08:00",
              "state" : "NoLedger",
              "numberOfEntriesSinceFirstNotAckedMessage" : 1,
              "totalNonContiguousDeletedMessagesRange" : 0,
              "subscriptionHavePendingRead" : false,
              "subscriptionHavePendingReplayRead" : false,
              "properties" : { }
            },
            "test-subscription-1" : {
              "markDeletePosition" : "49:-1",
              "readPosition" : "49:0",
              "waitingReadOp" : false,
              "pendingReadOps" : 0,
              "messagesConsumedCounter" : 0,
              "cursorLedger" : -1,
              "cursorLedgerLastEntry" : -1,
              "individuallyDeletedMessages" : "[]",
              "lastLedgerSwitchTimestamp" : "2023-03-06T16:41:32.801+08:00",
              "state" : "NoLedger",
              "numberOfEntriesSinceFirstNotAckedMessage" : 1,
              "totalNonContiguousDeletedMessagesRange" : 0,
              "subscriptionHavePendingRead" : false,
              "subscriptionHavePendingReplayRead" : false,
              "properties" : { }
            }
          },
          "schemaLedgers" : [ ],
          "compactedLedger" : {
            "ledgerId" : -1,
            "entries" : -1,
            "size" : -1,
            "offloaded" : false,
            "underReplicated" : false
          }
        },
    ...

    ```

6. 删除 Topic _test-topic-1_。

    **输入**

    ```bash
    bin/pulsar-admin topics delete-partitioned-topic persistent://public/default/test-topic-1
    ```

    **输出**

    没有输出。你可以使用以下命令验证 _test-topic-1_ 是否存在。

    **输入**

    列出 `public/default` 命名空间中的 Topic。

    ```bash
    bin/pulsar-admin topics list public/default
    ```

## 相关主题

要查看 pulsar-admin CLI 的详细用法，请参阅 [pulsar-admin CLI 参考](pathname:///reference/#/@pulsar:version_reference@/)。