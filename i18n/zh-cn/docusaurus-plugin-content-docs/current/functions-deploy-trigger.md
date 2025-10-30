---
id: functions-deploy-trigger
title: 触发函数
sidebar_label: "触发函数"
description: 学习如何在 Pulsar 中触发函数。
---

触发函数意味着你通过 CLI 向其中一个输入 Topic 生成消息来调用函数。你可以随时使用 `trigger` 命令来触发函数。

:::tip

使用 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) CLI，你可以向函数发送消息，而无需使用 [`pulsar-client`](reference-cli-tools.md) 工具或特定语言的客户端库。

:::

要学习如何触发函数，你可以从一个基于输入返回简单字符串的 Python 函数开始。

```python
# myfunc.py
def process(input):
    return "This function has been triggered with a value of {0}".format(input)
```

1. 在集群模式下运行函数。

  ```bash
  bin/pulsar-admin functions create \
    --tenant public \
    --namespace default \
    --name myfunc \
    --py myfunc.py \
    --classname myfunc \
    --inputs persistent://public/default/in \
    --output persistent://public/default/out
  ```

2. 使用 [`pulsar-client consume`](reference-cli-tools.md) 命令为输出 Topic 分配一个消费者，监听来自 `myfunc` 函数的消息。

  ```bash
  bin/pulsar-client consume persistent://public/default/out \
    --subscription-name my-subscription \
    --num-messages 0 # 无限监听
  ```

3. 触发函数。

   ```bash
   bin/pulsar-admin functions trigger \
     --tenant public \
     --namespace default \
     --name myfunc \
     --trigger-value "hello world"
   ```

   :::tip

   在 `trigger` 命令中，不需要 Topic 信息。你只需要指定函数的基本信息，如租户、命名空间和函数名称。

   :::

监听输出 Topic 的消费者在日志中产生如下内容。

```text
----- got message -----
This function has been triggered with a value of hello world
```