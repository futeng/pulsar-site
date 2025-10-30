---
id: functions-overview
title: Pulsar Functions 概述
sidebar_label: "概述"
description: 全面了解 Pulsar Functions。
---

## 什么是 Pulsar Functions

Pulsar Functions 是一个运行在 Pulsar 之上的无服务器计算框架，它按以下方式处理消息：
* 从一个或多个主题消费消息，
* 对消息应用用户定义的处理逻辑，
* 将消息的输出发送到其他主题。

下图说明了函数计算过程中的三个步骤。

![Pulsar function 的工作流程](/assets/function-overview.svg)

每次函数接收到消息时，它都会完成以下消费-应用-发布步骤。
1. 从一个或多个**输入主题**消费消息。
2. 对消息应用自定义的（用户提供的）处理逻辑。
3. 发布消息的输出，包括：
    1. 将输出消息写入 Pulsar 中的**输出主题**
    2. 将日志写入**日志主题**（如果已配置）以便调试
    3. 将[状态](functions-develop-state.md)更新写入 BookKeeper（如果已配置）

您可以使用 Java、Python 和 Go 编写函数。例如，您可以使用 Pulsar Functions 设置以下处理链：
* Python 函数监听 `raw-sentences` 主题，对传入的字符串进行"清理"（删除多余的空格并将所有字符转换为小写），然后将结果发布到 `sanitized-sentences` 主题。
* Java 函数监听 `sanitized-sentences` 主题，计算每个单词在指定时间[窗口](functions-concepts.md#window-function)内出现的次数，并将结果发布到 `results` 主题。
* Python 函数监听 `results` 主题，并将结果写入 MySQL 表。

详情请参阅[开发 Pulsar Functions](functions-develop.md)。

## 为什么使用 Pulsar Functions

Pulsar Functions 在将消息路由给消费者之前对消息执行简单计算。这些 Lambda 风格的函数专门为 Pulsar 设计和集成。该框架在您的 Pulsar 集群上提供了简单的计算框架，并负责发送和接收消息的底层细节。您只需要专注于业务逻辑。

Pulsar Functions 使您的组织能够最大化数据的价值，并享受以下好处：
* 简化的部署和操作 - 您可以创建数据管道，而无需部署单独的流处理引擎（SPE），如 [Apache Storm](http://storm.apache.org/)、[Apache Heron](https://heron.incubator.apache.org/) 或 [Apache Flink](https://flink.apache.org/)。
* 无服务器计算（当您使用 Kubernetes 运行时）
* 最大化开发人员生产力（包括语言原生接口和 Java/Python/Go 的 SDK）
* 简化的故障排除

## 使用场景

以下是 Pulsar Functions 使用场景的两个简单示例。

### 单词计数示例

此图显示了实现经典单词计数使用场景的过程。

![使用 Pulsar Functions 的单词计数示例](/assets/pulsar-functions-word-count.png)

在此示例中，函数计算发布到给定主题的每个单词的出现次数总和。

### 基于内容的路由示例

此图演示了实现基于内容的路由使用场景的过程。

![使用 Pulsar Functions 的基于计数的路由示例](/assets/pulsar-functions-routing-example.png)

在此示例中，函数接受项目（字符串）作为输入，并根据项目将其发布到 `fruits` 或 `vegetables` 主题。如果项目既不是水果也不是蔬菜，则向[日志主题](functions-develop-log.md)记录警告。

## 下一步是什么？

* [函数概念](functions-concepts.md)
* [函数 CLI 和配置](functions-cli.md)

**面向开发人员**
1. [开发函数](functions-develop.md)。
2. [调试函数](functions-debug.md)。
3. [打包函数](functions-package.md)。
4. [部署函数](functions-deploy.md)。

**面向管理员/操作员**
1. [设置函数工作器](functions-worker.md)。
2. [配置函数运行时](functions-runtime.md)。
3. [部署函数](functions-deploy.md)。