---
id: client-libraries-go-setup
title: 设置 Pulsar Go 客户端库
sidebar_label: "设置"
description: 学习如何在 Pulsar 中设置 Go 客户端库。
---

要在 Pulsar 中设置 Go 客户端库，请完成以下步骤。

## 步骤 1：安装 Go 客户端库

您可以使用 `go get` 或 `go module` 安装 `pulsar` 库。

### 使用 `go get`

1. 将 Go 客户端库下载到您的本地环境：

   ```bash
   go get -u "github.com/apache/pulsar-client-go/pulsar"
   ```

2. 将其导入您的项目：

   ```go
   import "github.com/apache/pulsar-client-go/pulsar"
   ```

### 使用 `go module`

1. 创建一个名为 `test_dir` 的目录，并将您的工作目录切换到该目录。

   ```bash
   mkdir test_dir && cd test_dir
   ```

2. 在 `test_dir` 目录中编写示例脚本（如 `test_example.go`），并在文件开头写入 `package main`。

   ```bash
   go mod init test_dir
   go mod tidy && go mod download
   go build test_example.go
   ./test_example
   ```

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