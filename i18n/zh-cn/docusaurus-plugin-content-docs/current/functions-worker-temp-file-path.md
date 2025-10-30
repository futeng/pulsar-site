---
id: functions-worker-temp-file-path
title: 配置临时文件路径
sidebar_label: "配置临时文件路径"
description: 在 Pulsar 中为函数工作器配置临时文件路径。
---

函数工作器使用 JVM 中的 `java.io.tmpdir` 作为默认临时文件路径，这也用作每个 NAR 包的默认提取文件路径。NAR 包需要本地文件路径来提取并加载到 Java 类加载器中。

如果您想将 NAR 包的默认提取文件路径更改为另一个目录，您可以在 `functions_worker.yml` 文件中添加带有所需目录的以下参数。配置根据您使用的[函数运行时](functions-concepts.md#function-runtime)而有所不同。

| 函数运行时 | 临时文件路径的配置 |
|:------------------------|:-------------------------------------------------|
| [线程运行时](functions-runtime-thread.md)<br /> [进程运行时](functions-runtime-process.md) | `narExtractionDirectory` |
| [Kubernetes 运行时](functions-runtime-kubernetes.md) | `functionRuntimeFactoryConfigs.narExtractionDirectory` |