---
id: functions-deploy-cluster-builtin
title: 使用内置函数
sidebar_label: "使用内置函数"
description: 在 Pulsar 中使用内置函数。
---

类似于内置连接器，[打包为 NAR](functions-package-java.md) 的 Java 函数代码，如果放置在函数 worker 的 `functions` 目录中，会在启动时加载，并可以在创建函数时引用。

例如，如果你有一个在其 `pulsar-io.yaml` 中名称为 `exclamation` 的内置函数，你可以用以下命令创建一个函数实例：

```bash
bin/pulsar-admin functions create \
  --function-type exclamation \
  --inputs persistent://public/default/input-1 \
  --output persistent://public/default/output-1
```

要获取可用的内置函数列表，使用 `available-functions` 命令：

```bash
bin/pulsar-admin functions available-functions
```

如果你在 `functions` 文件夹中添加或删除了 NAR 文件，在使用它之前重新加载可用的内置函数。

```bash
bin/pulsar-admin functions reload
```