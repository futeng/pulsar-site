---
id: functions-deploy-localrun
title: 在本地运行模式下部署函数
sidebar_label: "在本地运行模式下部署函数"
description: 在本地运行模式下部署 Pulsar 函数。
---

当你以本地运行模式部署函数时，它会在你输入命令的机器上运行——例如，在你的笔记本电脑上，或在 [AWS EC2](https://aws.amazon.com/ec2/) 实例中。

你可以使用 `localrun` 命令运行函数的单个实例。要运行多个实例，你可以多次使用 `localrun` 命令。

以下是如何使用 `localrun` 命令的示例。

```bash
bin/pulsar-admin functions localrun \
  --py $PWD/myfunc.py \
  --classname myfunc.SomeFunction \
  --inputs persistent://public/default/input-1 \
  --output persistent://public/default/output-1
```

:::note

在本地运行模式下，Java 函数使用线程运行时；Python 和 Go 函数使用进程运行时。

:::

默认情况下，函数通过本地 broker 服务 URL 连接到在同一机器上运行的 Pulsar 集群。如果你想将其连接到非本地 Pulsar 集群，可以使用 `--brokerServiceUrl` 标志指定不同的 broker 服务 URL。

```bash
bin/pulsar-admin functions localrun \
  --broker-service-url pulsar://my-cluster-host:6650 \
  # 其他函数参数
```