---
id: client-libraries-python-initialize
title: 初始化 Python 客户端
sidebar_label: "初始化"
description: 学习如何在 Pulsar 中初始化 Python 客户端。
---

您可以使用目标 Pulsar [集群](reference-terminology.md#cluster)的 URL 来实例化 Client 对象，如下所示：

```python
import pulsar

client = pulsar.Client('pulsar://localhost:6650')
```

:::note

如果您以[独立模式](getting-started-standalone.md)运行集群，默认情况下 broker 可通过 `pulsar://localhost:6650` URL 访问。

:::