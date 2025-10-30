---
id: client-libraries-dotnet-initialize
title: 初始化 C# 客户端
sidebar_label: "初始化"
description: 了解如何在 Pulsar 中初始化 C# 客户端。
---


本节介绍一些初始化 Pulsar C# 客户端的实践示例。

以下示例展示了如何创建连接到 localhost 的 Pulsar C# 客户端。

```csharp
using DotPulsar;

var client = PulsarClient.Builder().Build();
```

要使用构建器创建 Pulsar C# 客户端，你可以指定以下选项。

| 选项 | 描述 | 默认值 |
| ---- | ---- | ---- |
| ServiceUrl | 设置 Pulsar 集群的服务 URL。 | pulsar://localhost:6650 |
| RetryInterval | 设置重试操作或重新连接之前的等待时间。 | 3s |