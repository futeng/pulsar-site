---
id: functions-runtime-thread
title: 配置线程运行时
sidebar_label: "配置线程运行时"
description: 在 Pulsar 中为函数配置线程运行时。
---

您可以在 `conf/functions_worker.yml` 文件中使用线程运行时的默认配置。

如果您想自定义更多参数，如线程组名称，请参考以下示例。

```yaml
functionRuntimeFactoryClassName: org.apache.pulsar.functions.runtime.thread.ThreadRuntimeFactory
functionRuntimeFactoryConfigs:
  threadGroupName: "Your Function Container Group"
```

要为线程运行时设置客户端内存限制，您可以配置 `pulsarClientMemoryLimit`。

```yaml
functionRuntimeFactoryConfigs:
#  pulsarClientMemoryLimit
# # pulsar 客户端可以使用的最大内存（字节）
#   absoluteValue:
# # pulsar 客户端可以使用的最大内存占为 JVM 设置的最大直接内存的百分比
#   percentOfMaxDirectMemory:
```

:::note

如果同时设置了 `absoluteValue` 和 `percentOfMaxDirectMemory`，则使用较小的值。

:::

更多详情，请参阅[代码](https://github.com/apache/pulsar/blob/master/pulsar-functions/runtime/src/main/java/org/apache/pulsar/functions/runtime/thread/ThreadRuntimeFactoryConfig.java)。