---
id: functions-runtime-java-options
title: 自定义 Java 运行时选项
sidebar_label: "自定义 Java 运行时选项"
description: 在 Pulsar 中自定义 Java 运行时选项。
---

:::note

此设置**仅**适用于进程运行时和 Kubernetes 运行时。

:::

要为函数工作器启动的每个进程向 JVM 命令行传递额外参数，您可以在 `conf/functions_worker.yml` 文件中配置 `additionalJavaRuntimeArguments`，如下所示。
- 添加 JVM 标志，如 `-XX:+ExitOnOutOfMemoryError`
- 传递自定义系统属性，如 `-Dlog4j2.formatMsgNoLookups`

```yaml
additionalJavaRuntimeArguments: ['-XX:+ExitOnOutOfMemoryError','-Dfoo=bar']
```