---
id: client-libraries-node-setup
title: 设置 Pulsar Node.js 客户端
sidebar_label: "设置"
description: 学习如何在 Pulsar 中设置 Node.js 客户端库。
---

要在 Pulsar 中设置 Java 客户端库，请完成以下步骤。

## 步骤 1：安装 Node.js 客户端库

通过 [npm](https://www.npmjs.com/) 安装 [`pulsar-client`](https://www.npmjs.com/package/pulsar-client) 库：

```shell
npm install pulsar-client
```

有关更多信息，请参阅 [README](https://github.com/apache/pulsar-client-node/blob/master/README.md)。

:::note

此库仅在 Node.js 10.x 或更高版本中工作，因为它使用 [`node-addon-api`](https://github.com/nodejs/node-addon-api) 模块。

:::

## 步骤 2：连接到 Pulsar 集群

要使用客户端库连接到 Pulsar，您需要指定一个 [Pulsar 协议](developing-binary-protocol.md) URL。

您可以为特定集群分配 Pulsar 协议 URL，并使用 `pulsar` 协议方案。以下是使用默认端口 `6650` 的 `localhost` 示例：

```http
pulsar://localhost:6650
```

如果您有多个 broker，请用逗号分隔 `IP:port`：

```http
pulsar://localhost:6550,localhost:6651,localhost:6652
```

如果您使用 [mTLS](security-tls-authentication.md) 认证，请在协议方案中添加 `+ssl`：

```http
pulsar+ssl://pulsar.us-west.example.com:6651
```