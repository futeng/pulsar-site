---
id: functions-runtime
title: 配置函数运行时
sidebar_label: "配置函数运行时"
---

Pulsar 支持三种类型的[函数运行时](functions-concepts.md#function-runtime)，具有不同的成本和隔离保证，以最大化您函数的部署灵活性。

下表概述了每种类型的函数运行时支持的编程语言。

| 函数运行时                                       | 函数支持的编程语言 |
|----------------------------------------------------|----------------------------------------------|
| [线程运行时](functions-runtime-thread.md)         | Java                                         |
| [进程运行时](functions-runtime-process.md)       | Java, Python, Go                             |
| [Kubernetes 运行时](functions-runtime-kubernetes.md) | Java, Python, Go                             |

:::note

关于运行时 Java 版本，请根据您的目标 Pulsar 版本参考 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。

:::