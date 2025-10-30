---
id: client-libraries-python-setup
title: 设置 Python 客户端
sidebar_label: "设置"
description: 学习如何在 Pulsar 中设置 Python 客户端库。
---

要在 Pulsar 中设置 Python 客户端库，请完成以下步骤。

## 步骤 1：安装 Python 客户端库

使用 [pip](https://pip.pypa.io/) 安装最新版本：

```bash
pip install 'pulsar-client==@pulsar:version:python@'
```

您可以同时安装可选组件：

```bash
# avro 序列化
pip install 'pulsar-client[avro]==@pulsar:version:python@'

# 函数运行时
pip install 'pulsar-client[functions]==@pulsar:version:python@'

# 所有可选组件
pip install 'pulsar-client[all]==@pulsar:version:python@'
```

通过 PyPi 安装适用于以下 Python 版本：

| 平台                       | 支持的 Python 版本 |
|:-------------------------------|:--------------------------|
| macOS (&gt;= 11.0)                | 3.7、3.8、3.9 和 3.10    |
| Linux（包括 Alpine Linux） | 3.7、3.8、3.9 和 3.10    |

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