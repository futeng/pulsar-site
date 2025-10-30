---
id: client-libraries-node-initialize
title: 初始化 Node.js 客户端
sidebar_label: "初始化"
description: 学习如何在 Pulsar 中初始化 Node.js 客户端。
---


要与 Pulsar 交互，首先需要一个客户端对象。您可以使用 `new` 操作符和 `Client` 方法创建客户端实例，传入一个客户端选项对象。

以下是一个示例：

```javascript
const Pulsar = require('pulsar-client');

(async () => {
  const client = new Pulsar.Client({
    serviceUrl: 'pulsar://localhost:6650',
  });

  await client.close();
})();
```

有关客户端配置的完整列表，请参阅[此处](client-libraries-node-configs.md#client-configuration)。