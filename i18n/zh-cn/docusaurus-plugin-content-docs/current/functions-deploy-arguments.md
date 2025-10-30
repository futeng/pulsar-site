---
id: functions-deploy-arguments
title: CLI 默认参数
sidebar_label: "CLI 默认参数"
description: 全面了解 Pulsar CLI 中所需的参数。
---

你可以使用 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) CLI 中的函数相关命令来部署 Pulsar Functions。Pulsar 提供了多种命令，例如：
* `create` 命令，用于在[集群模式](functions-deploy-cluster.md)下部署函数
* `trigger` 命令，用于[触发](functions-deploy-trigger.md)函数

下表列出了 CLI 中所需的参数及其默认值。

| 参数 | 默认值|
|----------|----------------|
| 函数名称 | N/A <br />你可以为函数名称指定任何值（除了 org、library 或类似的类名）。|
租户 | N/A <br />该值从输入 Topic 的名称派生。例如，如果输入 Topic 的形式是 `persistent://marketing/{namespace}/{topicName}`，则租户名称是 `marketing`。|
| 命名空间 | N/A <br />该值从输入 Topic 名称派生。如果输入 Topic 的形式是 `persistent://marketing/asia/{topicName}`，则命名空间是 `asia`。|
| 输出 Topic | `{输入 Topic}-{函数名称}-output`。例如，如果函数的输入 Topic 名称是 `incoming`，函数名称是 `exclamation`，则输出 Topic 名称是 `incoming-exclamation-output`。|
| [处理保证](functions-concepts.md#processing-guarantees-and-subscription-types) | `ATLEAST_ONCE` |
| Pulsar 服务 URL | `pulsar://localhost:6650`|


以 `create` 命令为例。以下函数具有默认的函数名称（`MyFunction`）、租户（`public`）、命名空间（`default`）、订阅类型（`SHARED`）、处理保证（`ATLEAST_ONCE`）和 Pulsar 服务 URL（`pulsar://localhost:6650`）。

```bash
bin/pulsar-admin functions create \
  --jar $PWD/my-pulsar-functions.jar \
  --classname org.example.MyFunction \
  --inputs my-function-input-topic1,my-function-input-topic2
```