---
id: functions-worker-for-geo-replication
title: 为异地复制集群配置函数工作器
sidebar_label: "为异地复制集群配置函数工作器"
description: 在 Pulsar 中为异地复制集群配置函数工作器。
---

当运行通过[异地复制](concepts-replication.md)绑定的多个集群时，您需要为每个集群使用不同的函数命名空间。否则，所有函数共享一个命名空间并可能跨集群进行调度分配。

例如，如果您有两个集群：`east-1` 和 `west-1`，您可以在 `conf/functions_worker.yml` 文件中分别为 `east-1` 和 `west-1` 配置函数工作器。这确保两个不同的函数工作器使用不同的主题集进行内部协调。

```yaml
pulsarFunctionsCluster: east-1
pulsarFunctionsNamespace: public/functions-east-1
```

```yaml
pulsarFunctionsCluster: west-1
pulsarFunctionsNamespace: public/functions-west-1
```