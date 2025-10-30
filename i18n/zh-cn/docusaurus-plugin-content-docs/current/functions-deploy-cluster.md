---
id: functions-deploy-cluster
title: 在集群模式下部署函数
sidebar_label: "在集群模式下部署函数"
description: 在集群模式下部署 Pulsar 函数。
---

在集群模式下部署函数会将函数上传到函数 worker，这意味着函数由 worker 调度。

要在集群模式下部署函数，使用 `create` 命令。

```bash
bin/pulsar-admin functions create \
  --py myfunc.py \
  --classname myfunc.SomeFunction \
  --inputs persistent://public/default/input-1 \
  --output persistent://public/default/output-1
```

要更新在集群模式下运行的函数，你可以使用 `update` 命令。

```bash
bin/pulsar-admin functions update \
  --py myfunc.py \
  --classname myfunc.SomeFunction \
  --inputs persistent://public/default/new-input-topic \
  --output persistent://public/default/new-output-topic
```

**更多选项**
* [为函数实例分配资源](functions-deploy-cluster-resource.md)
* [启用并行处理](functions-deploy-cluster-parallelism.md)
* [启用端到端加密](functions-deploy-cluster-encryption.md)
* [启用包管理服务](functions-deploy-cluster-package.md)
* [使用内置函数](functions-deploy-cluster-builtin.md)