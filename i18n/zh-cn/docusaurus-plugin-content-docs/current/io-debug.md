---
id: io-debug
title: How to debug Pulsar connectors
sidebar_label: "Debug"
description: Learn how to debug Pulsar connectors.
---
本指南解释了如何在 localrun 或集群模式下调试连接器，并提供了调试清单。
为了更好地演示如何调试 Pulsar 连接器，以 Mongo sink 连接器为例。

**部署 Mongo sink 环境**
1. 启动 Mongo 服务。

   ```bash
   docker pull mongo:4
   docker run -d -p 27017:27017 --name pulsar-mongo -v $PWD/data:/data/db mongo:4
   ```

2. 创建数据库和集合。

   ```bash
   docker exec -it pulsar-mongo /bin/bash
   mongo
   > use pulsar
   > db.createCollection('messages')
   > exit
   ```

3. 启动 Pulsar standalone。

   ```bash
   docker pull apachepulsar/pulsar:2.4.0
   docker run -d -it -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --link pulsar-mongo --name pulsar-mongo-standalone apachepulsar/pulsar:2.4.0 bin/pulsar standalone
   ```

4. 使用 `mongo-sink-config.yaml` 文件配置 Mongo sink。

   ```bash
   configs:
     mongoUri: "mongodb://pulsar-mongo:27017"
     database: "pulsar"
     collection: "messages"
     batchSize: 2
     batchTimeMs: 500
   ```

   ```bash
   docker cp mongo-sink-config.yaml pulsar-mongo-standalone:/pulsar/
   ```

5. 下载 Mongo sink nar 包。

   ```bash
   docker exec -it pulsar-mongo-standalone /bin/bash
   curl -O http://apache.01link.hk/pulsar/pulsar-2.4.0/connectors/pulsar-io-mongo-2.4.0.nar
   ```

## 在 localrun 模式下调试
使用 `localrun` 命令以 localrun 模式启动 Mongo sink。

:::tip

有关 `localrun` 命令的更多信息，请参阅 [`localrun`](reference-connector-admin.md)。

:::

```bash
./bin/pulsar-admin sinks localrun \
    --archive $PWD/connectors/pulsar-io-mongo-@pulsar:version@.nar \
    --tenant public --namespace default \
    --inputs test-mongo \
    --name pulsar-mongo-sink \
    --sink-config-file $PWD/mongo-sink-config.yaml \
    --parallelism 1
```

### 使用连接器日志
要在 localrun 模式下调试连接器，您可以使用以下方法之一获取连接器日志：
* 执行 `localrun` 命令后，**日志会自动打印在控制台上**。
* 日志位置在：

  ```bash
  logs/functions/tenant/namespace/function-name/function-name-instance-id.log
  ```

  **示例**

  Mongo sink 连接器的路径是：

  ```bash
  logs/functions/public/default/pulsar-mongo-sink/pulsar-mongo-sink-0.log
  ```

为了清楚地解释日志信息，以下将其分解为较小的块并添加描述。
* 这段日志信息显示了 nar 包解压后的存储路径。

  ```bash
  08:21:54.132 [main] INFO  org.apache.pulsar.common.nar.NarClassLoader - Created class loader with paths: [file:/tmp/pulsar-nar/pulsar-io-mongo-2.4.0.nar-unpacked/, file:/tmp/pulsar-nar/pulsar-io-mongo-2.4.0.nar-unpacked/META-INF/bundled-dependencies/,
  ```

  :::tip

  如果抛出 `class cannot be found` 异常，检查 nar 文件是否在文件夹 `file:/tmp/pulsar-nar/pulsar-io-mongo-2.4.0.nar-unpacked/META-INF/bundled-dependencies/` 中解压。

  :::

* 这段日志信息说明了 Mongo sink 连接器的基本信息，如租户、命名空间、名称、并行度、资源等，可用于**检查 Mongo sink 连接器是否配置正确**。

  ```bash
  08:21:55.390 [main] INFO  org.apache.pulsar.functions.runtime.ThreadRuntime - ThreadContainer starting function with instance config InstanceConfig(instanceId=0, functionId=853d60a1-0c48-44d5-9a5c-6917386476b2, functionVersion=c2ce1458-b69e-4175-88c0-a0a856a2be8c, functionDetails=tenant: "public"
  namespace: "default"
  name: "pulsar-mongo-sink"
  className: "org.apache.pulsar.functions.api.utils.IdentityFunction"
  autoAck: true
  parallelism: 1
  source {
  typeClassName: "[B"
  inputSpecs {
      key: "test-mongo"
      value {
      }
  }
  cleanupSubscription: true
  }
  sink {
  className: "org.apache.pulsar.io.mongodb.MongoSink"
  configs: "{\"mongoUri\":\"mongodb://pulsar-mongo:27017\",\"database\":\"pulsar\",\"collection\":\"messages\",\"batchSize\":2,\"batchTimeMs\":500}"
  typeClassName: "[B"
  }
  resources {
  cpu: 1.0
  ram: 1073741824
  disk: 10737418240
  }
  componentType: SINK
  , maxBufferedTuples=1024, functionAuthenticationSpec=null, port=38459, clusterName=local)
  ```

* 这段日志信息展示了与 Mongo 的连接状态和配置信息。

  ```bash
  08:21:56.231 [cluster-ClusterId{value='5d6396a3c9e77c0569ff00eb', description='null'}-pulsar-mongo:27017] INFO  org.mongodb.driver.connection - Opened connection [connectionId{localValue:1, serverValue:8}] to pulsar-mongo:27017
  08:21:56.326 [cluster-ClusterId{value='5d6396a3c9e77c0569ff00eb', description='null'}-pulsar-mongo:27017] INFO  org.mongodb.driver.cluster - Monitor thread successfully connected to server with description ServerDescription{address=pulsar-mongo:27017, type=STANDALONE, state=CONNECTED, ok=true, version=ServerVersion{versionList=[4, 2, 0]}, minWireVersion=0, maxWireVersion=8, maxDocumentSize=16777216, logicalSessionTimeoutMinutes=30, roundTripTimeNanos=89058800}
  ```

* 这段日志信息解释了消费者和客户端的配置，包括 topic 名称、订阅名称、订阅类型等。

  ```bash
  08:21:56.719 [pulsar-client-io-1-1] INFO  org.apache.pulsar.client.impl.ConsumerStatsRecorderImpl - Starting Pulsar consumer status recorder with config: {
  "topicNames" : [ "test-mongo" ],
  "topicsPattern" : null,
  "subscriptionName" : "public/default/pulsar-mongo-sink",
  "subscriptionType" : "Shared",
  "receiverQueueSize" : 1000,
  "acknowledgementsGroupTimeMicros" : 100000,
  "negativeAckRedeliveryDelayMicros" : 60000000,
  "maxTotalReceiverQueueSizeAcrossPartitions" : 50000,
  "consumerName" : null,
  "ackTimeoutMillis" : 0,
  "tickDurationMillis" : 1000,
  "priorityLevel" : 0,
  "cryptoFailureAction" : "CONSUME",
  "properties" : {
      "application" : "pulsar-sink",
      "id" : "public/default/pulsar-mongo-sink",
      "instance_id" : "0"
  },
  "readCompacted" : false,
  "subscriptionInitialPosition" : "Latest",
  "patternAutoDiscoveryPeriod" : 1,
  "regexSubscriptionMode" : "PersistentOnly",
  "deadLetterPolicy" : null,
  "autoUpdatePartitions" : true,
  "replicateSubscriptionState" : false,
  "resetIncludeHead" : false
  }
  08:21:56.726 [pulsar-client-io-1-1] INFO  org.apache.pulsar.client.impl.ConsumerStatsRecorderImpl - Pulsar client config: {
  "serviceUrl" : "pulsar://localhost:6650",
  "authPluginClassName" : null,
  "authParams" : null,
  "operationTimeoutMs" : 30000,
  "statsIntervalSeconds" : 60,
  "numIoThreads" : 1,
  "numListenerThreads" : 1,
  "connectionsPerBroker" : 1,
  "useTcpNoDelay" : true,
  "useTls" : false,
  "tlsTrustCertsFilePath" : null,
  "tlsAllowInsecureConnection" : false,
  "tlsHostnameVerificationEnable" : false,
  "concurrentLookupRequest" : 5000,
  "maxLookupRequest" : 50000,
  "maxNumberOfRejectedRequestPerConnection" : 50,
  "keepAliveIntervalSeconds" : 30,
  "connectionTimeoutMs" : 10000,
  "requestTimeoutMs" : 60000,
  "defaultBackoffIntervalNanos" : 100000000,
  "maxBackoffIntervalNanos" : 30000000000
  }
  ```

## 在集群模式下调试
要在集群模式下调试连接器，您可以使用以下方法：
* [使用连接器日志](#使用连接器日志)
* [使用管理 CLI](#使用管理-cli)

### 使用连接器日志
在集群模式下，多个连接器可以在一个 worker 上运行。要查找指定连接器的日志路径，使用 `workerId` 来定位连接器日志。

### 使用管理 CLI
Pulsar 管理 CLI 帮助您使用以下子命令调试 Pulsar 连接器：
* [`get`](#get)
* [`status`](#status)
* [`topics stats`](#topics-stats)

**创建 Mongo sink**

```bash
./bin/pulsar-admin sinks create \
    --archive $PWD/pulsar-io-mongo-2.4.0.nar \
    --tenant public \
    --namespace default \
    --inputs test-mongo \
    --name pulsar-mongo-sink \
    --sink-config-file $PWD/mongo-sink-config.yaml \
    --parallelism 1
```

### `get`

使用 `get` 命令获取 Mongo sink 连接器的基本信息，如租户、命名空间、名称、并行度等。

```bash
./bin/pulsar-admin sinks get --tenant public --namespace default  --name pulsar-mongo-sink
```

输出：

```json
{
  "tenant": "public",
  "namespace": "default",
  "name": "pulsar-mongo-sink",
  "className": "org.apache.pulsar.io.mongodb.MongoSink",
  "inputSpecs": {
    "test-mongo": {
      "isRegexPattern": false
    }
  },
  "configs": {
    "mongoUri": "mongodb://pulsar-mongo:27017",
    "database": "pulsar",
    "collection": "messages",
    "batchSize": 2.0,
    "batchTimeMs": 500.0
  },
  "parallelism": 1,
  "processingGuarantees": "ATLEAST_ONCE",
  "retainOrdering": false,
  "autoAck": true
}
```

:::tip

有关 `get` 命令的更多信息，请参阅 [`get`](reference-connector-admin.md)。

:::

### `status`
使用 `status` 命令获取 Mongo sink 连接器的当前状态，如实例数量、运行实例数量、instanceId、workerId 等。

```bash
./bin/pulsar-admin sinks status
--tenant public \
--namespace default  \
--name pulsar-mongo-sink
```

输出：

```json
{
"numInstances" : 1,
"numRunning" : 1,
"instances" : [ {
    "instanceId" : 0,
    "status" : {
    "running" : true,
    "error" : "",
    "numRestarts" : 0,
    "numReadFromPulsar" : 0,
    "numSystemExceptions" : 0,
    "latestSystemExceptions" : [ ],
    "numSinkExceptions" : 0,
    "latestSinkExceptions" : [ ],
    "numWrittenToSink" : 0,
    "lastReceivedTime" : 0,
    "workerId" : "c-standalone-fw-5d202832fd18-8080"
    }
} ]
}
```

:::tip

有关 `status` 命令的更多信息，请参阅 [`status`](reference-connector-admin.md)。
如果一个 worker 上运行多个连接器，`workerId` 可以定位指定连接器运行的 worker。

:::

### `topics stats`

使用 `topics stats` 命令获取 topic 及其连接的生产者和消费者的统计信息，如 topic 是否收到消息、是否有消息积压、可用许可证和其他关键信息。所有速率都是在 1 分钟窗口内计算的，并且相对于最后完成的 1 分钟期间。

```bash
./bin/pulsar-admin topics stats test-mongo
```

输出：

```json
{
  "msgRateIn" : 0.0,
  "msgThroughputIn" : 0.0,
  "msgRateOut" : 0.0,
  "msgThroughputOut" : 0.0,
  "averageMsgSize" : 0.0,
  "storageSize" : 1,
  "publishers" : [ ],
  "subscriptions" : {
    "public/default/pulsar-mongo-sink" : {
      "msgRateOut" : 0.0,
      "msgThroughputOut" : 0.0,
      "msgRateRedeliver" : 0.0,
      "msgBacklog" : 0,
      "blockedSubscriptionOnUnackedMsgs" : false,
      "msgDelayed" : 0,
      "unackedMessages" : 0,
      "type" : "Shared",
      "msgRateExpired" : 0.0,
      "consumers" : [ {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "msgRateRedeliver" : 0.0,
        "consumerName" : "dffdd",
        "availablePermits" : 999,
        "unackedMessages" : 0,
        "blockedConsumerOnUnackedMsgs" : false,
        "metadata" : {
          "instance_id" : "0",
          "application" : "pulsar-sink",
          "id" : "public/default/pulsar-mongo-sink"
        },
        "connectedSince" : "2019-08-26T08:48:07.582Z",
        "clientVersion" : "2.4.0",
        "address" : "/172.17.0.3:57790"
      } ],
      "isReplicated" : false
    }
  },
  "replication" : { },
  "deduplicationStatus" : "Disabled"
}
```

:::tip

有关 `topic stats` 命令的更多信息，请参阅 [`topic stats`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=stats)。

:::

## 清单
此清单指出了调试连接器时要检查的主要区域。它提醒您要查找什么以确保彻底审查，并作为获取连接器状态的评价工具。
* Pulsar 是否成功启动？

* 外部服务是否正常运行？

* nar 包是否完整？

* 连接器配置文件是否正确？

* 在 localrun 模式下，运行连接器并检查控制台上打印的信息（连接器日志）。

* 在集群模式下：

   * 使用 `get` 命令获取基本信息。

   * 使用 `status` 命令获取当前状态。
   * 使用 `topics stats` 命令获取指定 topic 及其连接的生产者和消费者的统计信息。

   * 检查连接器日志。
* 进入外部系统并验证结果。