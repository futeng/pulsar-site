---
id: client-libraries-cpp-initialize
title: 初始化 C++ 客户端对象
sidebar_label: "初始化"
description: 了解如何在 Pulsar 中初始化 C++ 客户端。
---

你可以仅使用目标 Pulsar [集群](reference-terminology.md#cluster)的 URL 来实例化 Client 对象，如下所示：

```cpp
Client client("pulsar://localhost:6650");
```

:::note

如果你以[独立模式](getting-started-standalone.md)运行集群，默认情况下 broker 在 `pulsar://localhost:6650` URL 上可用。

:::