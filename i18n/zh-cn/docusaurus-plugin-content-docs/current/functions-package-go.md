---
id: functions-package-go
title: 打包 Go Functions
sidebar_label: "打包 Go Functions"
description: 学习如何在 Pulsar 中打包 Go 函数。
---

:::note

目前，Go 函数只能使用 SDK 实现，函数的接口以 SDK 的形式暴露。在使用 Go 函数之前，您需要导入 `github.com/apache/pulsar/pulsar-function-go/pf`。

:::

要打包 Go 函数，请完成以下步骤。

1. 准备一个 Go 函数文件。
2. 构建 Go 函数。

   ```go
    go build <您的 Go 函数文件名>.go
   ```

3. 使用以下命令运行 Go 函数。

   ```bash
    bin/pulsar-admin functions localrun \
        --go [您的 go 函数的绝对路径]
        --inputs [输入主题] \
        --output [输出主题] \
        --tenant [默认:public] \
        --namespace [默认:default] \
        --name [自定义唯一的 go 函数名称]
   ```

   以下日志表示 Go 函数启动成功。

   ```text
    ...
    07:55:03.724 [main] INFO  org.apache.pulsar.functions.runtime.ProcessRuntime - Started process successfully
    ...
   ```