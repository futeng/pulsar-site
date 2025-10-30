---
id: functions-deploy-cluster-parallelism
title: 启用并行处理
sidebar_label: "启用并行处理"
description: 在 Pulsar 中为函数启用并行处理。
---

在集群模式下，你可以指定**并行度**（要运行的实例数量）来为函数启用并行处理。

**示例 1**

部署函数时，指定 `create` 命令的 `--parallelism` 标志。

```bash
bin/pulsar-admin functions create \
  --parallelism 3 \
  # 其他函数信息
```

:::tip

对于现有函数，你可以使用 `update` 命令调整并行度。

:::


**示例 2**

通过 YAML 部署函数配置时，指定 `parallelism` 参数。

```yaml
# function-config.yaml
parallelism: 3
inputs:
  - persistent://public/default/input-1
output: persistent://public/default/output-1
# 其他参数
```

对于现有函数，你可以使用 `update` 命令调整并行度，如下所示。

```bash
bin/pulsar-admin functions update \
  --function-config-file $PWD/function-config.yaml
```