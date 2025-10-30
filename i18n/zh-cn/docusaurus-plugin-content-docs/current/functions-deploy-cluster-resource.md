---
id: functions-deploy-cluster-resource
title: 为函数实例分配资源
sidebar_label: "为函数实例分配资源"
description: 在 Pulsar 中为函数实例分配资源。
---

在集群模式下运行函数时，你可以指定可以分配给每个函数实例的资源。

下表概述了可以分配给函数实例的资源。

| 资源   | 指定方式        | 支持的运行时 |
|------------|---------------------|-------------------|
| CPU        | 核心数 | Kubernetes        |
| RAM        | 字节数 | Kubernetes        |
| 磁盘空间 | 字节数 | Kubernetes        |

例如，以下命令为函数分配 8 个核心、8GB RAM 和 10GB 磁盘空间。

```bash
bin/pulsar-admin functions create \
  --jar $PWD/target/my-functions.jar \
  --classname org.example.functions.MyFunction \
  --cpu 8 \
  --ram 8589934592 \
  --disk 10737418240
```

:::note

分配给给定函数的资源会应用于该函数的每个实例。例如，如果你为具有[并行度](functions-deploy-cluster-parallelism.md)为 5 的函数应用 8GB RAM，那么你总共为该函数应用了 40GB RAM。

:::