---
id: functions-quickstart
title: Pulsar Functions 入门指南
sidebar_label: "入门指南"
description: 学习如何创建和验证 Pulsar 函数。
---

本实践教程提供了如何在[独立 Pulsar](getting-started-standalone.md) 中创建和验证函数的分步说明和示例，包括有状态函数和窗口函数。

## 先决条件

- JDK 8+。更多详情，请参考 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar#pulsar-runtime-java-version-recommendation)。
- 不支持 Windows 操作系统。

## 步骤 1：启动独立 Pulsar

1. 在 `conf/standalone.conf` 中启用 pulsar 函数（如果不存在则添加此字段）：

   ```properties
   functionsWorkerEnabled=true
   ```

2. 本地启动 Pulsar。

   ```bash
   bin/pulsar standalone
   ```

   Pulsar 服务的所有组件（包括 ZooKeeper、BookKeeper、broker 等）按顺序启动。您可以使用 `bin/pulsar-admin brokers healthcheck` 命令确保 Pulsar 服务已启动并正在运行。

3. 检查 Pulsar 二进制协议端口。

   ```bash
   telnet localhost 6650
   ```

4. 检查 Pulsar Function 集群。

   ```bash
   bin/pulsar-admin functions-worker get-cluster
   ```

   **输出**

   ```json
   [{"workerId":"c-standalone-fw-localhost-6750","workerHostname":"localhost","port":6750}]
   ```

5. 确保存在 public 租户。

   ```bash
   bin/pulsar-admin tenants list
   ```

   **输出**

   ```text
   public
   ```

6. 确保存在 default 命名空间。

   ```bash
   bin/pulsar-admin namespaces list public
   ```

   **输出**

   ```text
   public/default
   ```

7. 确保表服务成功启用。

   ```bash
   telnet localhost 4181
   ```

   **输出**

   ```text
   Trying ::1...
   telnet: connect to address ::1: Connection refused
   Trying 127.0.0.1...
   Connected to localhost.
   Escape character is '^]'.
   ```

## 步骤 2：为测试创建命名空间

1. 创建租户和命名空间。

   ```bash
   bin/pulsar-admin tenants create test
   bin/pulsar-admin namespaces create test/test-namespace
   ```

2. 在与步骤 1 相同的终端窗口中，验证租户和命名空间。

   ```bash
   bin/pulsar-admin namespaces list test
   ```

   **输出**

   此输出显示租户和命名空间都创建成功。

   ```text
   "test/test-namespace"
   ```

## 步骤 3：启动函数

:::note

在启动函数之前，您需要[启动 Pulsar](#启动独立-pulsar)和[创建测试命名空间](#为测试创建命名空间)。

:::

1. 创建名为 `examples` 的函数。

   :::tip

   您可以在本地机器上 Pulsar 目录的 `examples` 文件夹下看到 `example-function-config.yaml` 和 `api-examples.jar` 文件。

   此示例函数将在每条消息末尾添加一个 `!`。

   :::

   ```bash
   bin/pulsar-admin functions create \
      --function-config-file $PWD/examples/example-function-config.yaml \
      --jar $PWD/examples/api-examples.jar
   ```

   **输出**

   ```text
   Created Successfully
   ```

   您可以在 `examples/example-function-config.yaml` 中检查此函数的配置：

   ```yaml
   tenant: "test"
   namespace: "test-namespace"
   name: "example" # 函数名
   className: "org.apache.pulsar.functions.api.examples.ExclamationFunction"
   inputs: ["test_src"] # 此函数将从这些主题读取消息
   output: "test_result" # 此函数的返回值将发送到此主题
   autoAck: true # 如果设置为 true，函数将确认输入消息
   parallelism: 1
   ```

   您可以看到 `ExclamationFunction` 的[源代码](https://github.com/apache/pulsar/blob/master/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/ExclamationFunction.java)。
   有关 yaml 配置的更多信息，请参阅[参考](functions-cli.md#yaml-configurations-for-pulsar-functions)。

2. 在与步骤 1 相同的终端窗口中，验证函数的配置。

   ```bash
   bin/pulsar-admin functions get \
      --tenant test \
      --namespace test-namespace \
      --name example
   ```

   **输出**

   ```json
   {
       "tenant": "test",
       "namespace": "test-namespace",
       "name": "example",
       "className": "org.apache.pulsar.functions.api.examples.ExclamationFunction",
       "inputSpecs": {
           "test_src": {
           "isRegexPattern": false,
           "schemaProperties": {},
           "consumerProperties": {},
           "poolMessages": false
           }
       },
       "output": "test_result",
       "producerConfig": {
           "useThreadLocalProducers": false,
           "batchBuilder": ""
       },
       "processingGuarantees": "ATLEAST_ONCE",
       "retainOrdering": false,
       "retainKeyOrdering": false,
       "forwardSourceMessageProperty": true,
       "userConfig": {},
       "runtime": "JAVA",
       "autoAck": true,
       "parallelism": 1,
       "resources": {
           "cpu": 1.0,
           "ram": 1073741824,
           "disk": 10737418240
       },
       "cleanupSubscription": true,
       "subscriptionPosition": "Latest"
   }
   ```

3. 在与步骤 1 相同的终端窗口中，验证函数的状态。

   ```bash
   bin/pulsar-admin functions status \
      --tenant test \
      --namespace test-namespace \
      --name example
   ```

   **输出**

   `"running": true` 显示函数正在运行。

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
         "numReceived" : 0,
         "numSuccessfullyProcessed" : 0,
         "numUserExceptions" : 0,
         "latestUserExceptions" : [ ],
         "numSystemExceptions" : 0,
         "latestSystemExceptions" : [ ],
         "averageLatency" : 0.0,
         "lastInvocationTime" : 0,
         "workerId" : "c-standalone-fw-localhost-8080"
       }
     } ]
   }
   ```

4. 在与步骤 1 相同的终端窗口中，订阅**输出主题** `test_result`。

   ```bash
   bin/pulsar-client consume -s test-sub -n 0 test_result
   ```

5. 在新的终端窗口中，向**输入主题** `test_src` 生成消息。

   ```bash
   bin/pulsar-client produce -m "test-messages-`date`" -n 10 test_src
   ```

6. 在与步骤 1 相同的终端窗口中，返回 `example` 函数产生的消息。您可以看到每条消息末尾都添加了一个 `!`。

   **输出**

   ```text
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ----- got message -----
   test-messages-Thu Jul 19 11:59:15 PDT 2021!
   ```

### 启动有状态函数

Pulsar 的独立模式为有状态函数启用 BookKeeper 表服务。更多信息，请参阅[配置状态存储](functions-develop-state.md)。

:::note

在启动有状态函数之前，您需要[启动 Pulsar](#启动独立-pulsar)和[创建测试命名空间](#为测试创建命名空间)。

:::

以下示例提供了启动有状态函数以验证计数器函数的说明。

1. 使用 `examples/example-stateful-function-config.yaml` 创建函数。

   ```bash
   bin/pulsar-admin functions create \
      --function-config-file $PWD/examples/example-stateful-function-config.yaml \
      --jar $PWD/examples/api-examples.jar
   ```

   **输出**

   ```text
   Created Successfully
   ```

   您可以在 `examples/example-stateful-function-config.yaml` 中检查此函数的配置：

   ```yaml
   tenant: "test"
   namespace: "test-namespace"
   name: "word_count"
   className: "org.apache.pulsar.functions.api.examples.WordCountFunction"
   inputs: ["test_wordcount_src"] # 此函数将从这些主题读取消息
   autoAck: true
   parallelism: 1
   ```

   您可以看到 `WordCountFunction` 的[源代码](https://github.com/apache/pulsar/blob/master/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/WordCountFunction.java)。此函数不会返回任何值，而是在函数上下文中存储单词的出现次数。所以您不需要指定输出主题。
   有关 yaml 配置的更多信息，请参阅[参考](functions-cli.md#yaml-configurations-for-pulsar-functions)。

2. 在与步骤 1 相同的终端窗口中，获取 `word_count` 函数的信息。

   ```bash
   bin/pulsar-admin functions get \
      --tenant test \
      --namespace test-namespace \
      --name word_count
   ```

   **输出**

   ```json
   {
     "tenant": "test",
     "namespace": "test-namespace",
     "name": "word_count",
     "className": "org.apache.pulsar.functions.api.examples.WordCountFunction",
     "inputSpecs": {
       "test_wordcount_src": {
         "isRegexPattern": false,
         "schemaProperties": {},
         "consumerProperties": {},
         "poolMessages": false
       }
     },
     "producerConfig": {
       "useThreadLocalProducers": false,
       "batchBuilder": ""
     },
     "processingGuarantees": "ATLEAST_ONCE",
     "retainOrdering": false,
     "retainKeyOrdering": false,
     "forwardSourceMessageProperty": true,
     "userConfig": {},
     "runtime": "JAVA",
     "autoAck": true,
     "parallelism": 1,
     "resources": {
       "cpu": 1.0,
       "ram": 1073741824,
       "disk": 10737418240
     },
     "cleanupSubscription": true,
     "subscriptionPosition": "Latest"
   }
   ```

3. 在与步骤 1 相同的终端窗口中，获取 `word_count` 函数的状态。

   ```bash
   bin/pulsar-admin functions status \
      --tenant test \
      --namespace test-namespace \
      --name word_count
   ```

   **输出**

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
          "numReceived" : 0,
          "numSuccessfullyProcessed" : 0,
          "numUserExceptions" : 0,
          "latestUserExceptions" : [ ],
          "numSystemExceptions" : 0,
          "latestSystemExceptions" : [ ],
          "averageLatency" : 0.0,
          "lastInvocationTime" : 0,
          "workerId" : "c-standalone-fw-localhost-8080"
       }
     } ]
   }
   ```

4. 在与步骤 1 相同的终端窗口中，使用键 `hello` 查询函数的状态表。此操作监视与 `hello` 相关的更改。

   ```bash
   bin/pulsar-admin functions querystate \
      --tenant test \
      --namespace test-namespace \
      --name word_count -k hello -w
   ```

   :::tip

   有关 `pulsar-admin functions querystate options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅 [Pulsar admin API](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

   :::

   **输出**

   ```text
   key 'hello' doesn't exist.
   key 'hello' doesn't exist.
   key 'hello' doesn't exist.
   ...
   ```

5. 在新的终端窗口中，使用以下方法之一向**输入主题** `test_wordcount_src` 生成 10 条带有 `hello` 的消息。`hello` 的值更新为 10。

  ```bash
  bin/pulsar-client produce -m "hello" -n 10 test_wordcount_src
  ```

6. 在与步骤 1 相同的终端窗口中，检查结果。

   结果显示**输出主题** `test_wordcount_dest` 接收到消息。

   **输出**

   ```json
   {
     "key": "hello",
     "numberValue": 10,
     "version": 9
   }
   ```

7. 在与步骤 5 相同的终端窗口中，再生成 10 条带有 `hello` 的消息。`hello` 的值更新为 20。

   ```bash
   bin/pulsar-client produce -m "hello" -n 10 test_wordcount_src
   ```

8. 在与步骤 1 相同的终端窗口中，检查结果。

   结果显示**输出主题** `test_wordcount_dest` 接收到值 20。

   ```json
   {
      "key": "hello",
      "numberValue": 20,
      "version": 19
   }
   ```

### 启动窗口函数

窗口函数是 Pulsar Functions 的一种特殊形式。更多信息，请参阅[概念](functions-concepts.md#window-function)。

:::note

在启动窗口函数之前，您需要[启动 Pulsar](#启动独立-pulsar)和[创建测试命名空间](#为测试创建命名空间)。

:::

以下示例提供了启动窗口函数以在窗口中计算总和的说明。

1. 使用 `example-window-function-config.yaml` 创建函数。

   ```bash
   bin/pulsar-admin functions create \
      --function-config-file $PWD/examples/example-window-function-config.yaml \
      --jar $PWD/examples/api-examples.jar
   ```

   **输出**

   ```text
   Created Successfully
   ```

   您可以在 `examples/example-window-function-config.yaml` 中检查此函数的配置：

   ```yaml
   tenant: "test"
   namespace: "test-namespace"
   name: "window-example"
   className: "org.apache.pulsar.functions.api.examples.AddWindowFunction"
   inputs: ["test_window_src"]
   output: "test_window_result"
   autoAck: true
   parallelism: 1

   # 每 5 条消息，计算最新 10 条消息的总和
   windowConfig:
     windowLengthCount: 10
     slidingIntervalCount: 5
   ```

   您可以[在此处](https://github.com/apache/pulsar/blob/master/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/AddWindowFunction.java)看到 `AddWindowFunction` 的源代码。
   有关 yaml 配置的更多信息，请参阅[参考](functions-cli.md#yaml-configurations-for-pulsar-functions)。


2. 在与步骤 1 相同的终端窗口中，验证函数的配置。

   ```bash
   bin/pulsar-admin functions get \
      --tenant test \
      --namespace test-namespace \
      --name window-example
   ```

   **输出**

   ```json
   {
     "tenant": "test",
     "namespace": "test-namespace",
     "name": "window-example",
     "className": "org.apache.pulsar.functions.api.examples.AddWindowFunction",
     "inputSpecs": {
       "test_window_src": {
         "isRegexPattern": false,
         "schemaProperties": {},
         "consumerProperties": {},
         "poolMessages": false
       }
     },
     "output": "test_window_result",
     "producerConfig": {
       "useThreadLocalProducers": false,
       "batchBuilder": ""
     },
     "processingGuarantees": "ATLEAST_ONCE",
     "retainOrdering": false,
     "retainKeyOrdering": false,
     "forwardSourceMessageProperty": true,
     "userConfig": {},
     "runtime": "JAVA",
     "autoAck": false,
     "parallelism": 1,
     "resources": {
       "cpu": 1.0,
       "ram": 1073741824,
       "disk": 10737418240
     },
     "windowConfig": {
       "windowLengthCount": 10,
       "slidingIntervalCount": 5,
       "actualWindowFunctionClassName": "org.apache.pulsar.functions.api.examples.AddWindowFunction",
       "processingGuarantees": "ATLEAST_ONCE"
     },
     "cleanupSubscription": true,
     "subscriptionPosition": "Latest"
   }
   ```

3. 在与步骤 1 相同的终端窗口中，验证函数的状态。

   ```bash
   bin/pulsar-admin functions status \
      --tenant test \
      --namespace test-namespace \
      --name window-example
   ```

   **输出**

   `"running": true` 显示函数正在运行。

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
         "numReceived" : 0,
         "numSuccessfullyProcessed" : 0,
         "numUserExceptions" : 0,
         "latestUserExceptions" : [ ],
         "numSystemExceptions" : 0,
         "latestSystemExceptions" : [ ],
         "averageLatency" : 0.0,
         "lastInvocationTime" : 0,
         "workerId" : "c-standalone-fw-localhost-8080"
       }
     } ]
   }
   ```

4. 在与步骤 1 相同的终端窗口中，订阅**输出主题** `test_window_result`。

   ```bash
   bin/pulsar-client consume -s test-sub -n 0 test_window_result
   ```

5. 在新的终端窗口中，向**输入主题** `test_window_src` 生成消息。

   ```bash
   bin/pulsar-client produce -m "3" -n 10 test_window_src
   ```

6. 在与步骤 1 相同的终端窗口中，返回窗口函数 `window-example` 产生的消息。

   **输出**

   ```text
   ----- got message -----
   key:[null], properties:[], content:15
   ----- got message -----
   key:[null], properties:[], content:30
   ```