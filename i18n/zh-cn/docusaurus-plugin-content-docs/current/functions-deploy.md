---
id: functions-deploy
title: 部署 Pulsar Functions
sidebar_label: "如何部署"
---

Pulsar 提供两种模式来部署函数：
* [集群模式（用于生产环境）](functions-deploy-cluster.md) - 你可以将函数提交到 Pulsar 集群，集群将负责运行该函数。
* [本地运行模式](functions-deploy-localrun.md) - 你可以确定函数的运行位置，例如，在你的本地机器上。

## 先决条件

在部署函数之前，你需要先运行一个 Pulsar 集群。你有以下选项：
* 在你自己的机器上本地运行[独立集群](getting-started-standalone.md)。
* 在 [Kubernetes](deploy-kubernetes.md)、[Amazon Web Services](deploy-aws.md)、[裸机](deploy-bare-metal.md) 等上运行 Pulsar 集群。

:::note

如果你想部署用 Python 编写的用户定义函数，你需要在所有运行[函数 worker](functions-concepts.md#function-worker)的机器上安装 [Python 客户端](client-libraries-python.md)。

:::