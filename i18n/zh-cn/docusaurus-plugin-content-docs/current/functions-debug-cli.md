---
id: functions-debug-cli
title: 使用 Functions CLI 进行调试
sidebar_label: "使用 Functions CLI 进行调试"
description: 学习在 Pulsar 中使用 CLI 调试函数。
---

使用 [Pulsar Functions CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)，您可以使用以下子命令调试 Pulsar Functions：

## `get`

要获取函数的信息，您可以按如下方式指定 `--fqfn`：

```bash
 ./bin/pulsar-admin functions get public/default/ExclamationFunctio6
```

或者，您可以按如下方式指定 `--name`、`--namespace` 和 `--tenant`：

```bash
 ./bin/pulsar-admin functions get \
    --tenant public \
    --namespace default \
    --name ExclamationFunctio6
```

如下所示，`get` 命令显示了 `ExclamationFunctio6` 函数的输入、输出、运行时和其他信息。

```json
{
  "tenant": "public",
  "namespace": "default",
  "name": "ExclamationFunctio6",
  "className": "org.example.test.ExclamationFunction",
  "inputSpecs": {
    "persistent://public/default/my-topic-1": {
      "isRegexPattern": false
    }
  },
  "output": "persistent://public/default/test-1",
  "processingGuarantees": "ATLEAST_ONCE",
  "retainOrdering": false,
  "userConfig": {},
  "runtime": "JAVA",
  "autoAck": true,
  "parallelism": 1
}
```

## `list`

要列出在特定租户和命名空间下运行的所有 Pulsar Functions：

```bash
bin/pulsar-admin functions list \
    --tenant public \
    --namespace default
```

如下所示，`list` 命令返回在 `public` 租户和 `default` 命名空间下运行的三个函数。

```text
ExclamationFunctio1
ExclamationFunctio2
ExclamationFunctio3
```

## `status`

要检查函数的当前状态：

```bash
 ./bin/pulsar-admin functions status \
    --tenant public \
    --namespace default \
    --name ExclamationFunctio6
```

如下所示，`status` 命令显示了实例数量、运行中实例、在 `ExclamationFunctio6` 函数下运行的实例、接收的消息、成功处理的消息、系统异常、平均延迟等信息。

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
      "numReceived" : 1,
      "numSuccessfullyProcessed" : 1,
      "numUserExceptions" : 0,
      "latestUserExceptions" : [ ],
      "numSystemExceptions" : 0,
      "latestSystemExceptions" : [ ],
      "averageLatency" : 0.8385,
      "lastInvocationTime" : 1557734137987,
      "workerId" : "c-standalone-fw-23ccc88ef29b-8080"
    }
  } ]
}
```

## `stats`

要获取函数的当前统计信息：

```bash
bin/pulsar-admin functions stats \
    --tenant public \
    --namespace default \
    --name ExclamationFunctio6
```

输出如下所示：

```json
{
  "receivedTotal" : 1,
  "processedSuccessfullyTotal" : 1,
  "systemExceptionsTotal" : 0,
  "userExceptionsTotal" : 0,
  "avgProcessLatency" : 0.8385,
  "1min" : {
    "receivedTotal" : 0,
    "processedSuccessfullyTotal" : 0,
    "systemExceptionsTotal" : 0,
    "userExceptionsTotal" : 0,
    "avgProcessLatency" : null
  },
  "lastInvocation" : 1557734137987,
  "instances" : [ {
    "instanceId" : 0,
    "metrics" : {
      "receivedTotal" : 1,
      "processedSuccessfullyTotal" : 1,
      "systemExceptionsTotal" : 0,
      "userExceptionsTotal" : 0,
      "avgProcessLatency" : 0.8385,
      "1min" : {
        "receivedTotal" : 0,
        "processedSuccessfullyTotal" : 0,
        "systemExceptionsTotal" : 0,
        "userExceptionsTotal" : 0,
        "avgProcessLatency" : null
      },
      "lastInvocation" : 1557734137987,
      "userMetrics" : { }
    }
  } ]
}
```

## `trigger`

要用提供的值触发指定函数：

```bash
 ./bin/pulsar-admin functions trigger \
    --tenant public \
    --namespace default \
    --name ExclamationFunctio6 \
    --topic persistent://public/default/my-topic-1 \
    --trigger-value "hello pulsar functions"
```

此命令模拟函数的执行过程并验证它。如下所示，`trigger` 命令返回以下结果：

```text
This is my function!
```

:::note

使用 `--topic` 选项时，必须指定完整的 Topic 名称。否则，会出现以下错误。

  ```text
  Function in trigger function has unidentified topic
  Reason: Function in trigger function has unidentified topic
  ```

:::