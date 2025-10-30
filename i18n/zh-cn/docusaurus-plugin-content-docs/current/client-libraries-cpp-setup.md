---
id: client-libraries-cpp-setup
title: 设置 Pulsar C++ 客户端
sidebar_label: "设置"
description: 了解如何在 Pulsar 中设置 C++ 客户端库。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

要在 Pulsar 中设置 C++ 客户端库，请完成以下步骤。

## 步骤 1：安装 C++ 客户端库

使用以下方法之一安装 Pulsar C++ 客户端。

### Brew

使用 [Homebrew](http://brew.sh/) 安装包含库和头文件的最新标记版本：

```bash
brew install libpulsar
```

### Deb

1. 下载任一 Deb 包：

   <Tabs>
   <TabItem value="client">

   ```bash
   wget @pulsar:deb:client@
   ```

   此包包含共享库 `libpulsar.so`。

   </TabItem>
   <TabItem value="client-devel">

   ```bash
   wget @pulsar:deb:client-devel@
   ```

   此包包含静态库：`libpulsar.a`、`libpulsarwithdeps.a` 和 C/C++ 头文件。

   </TabItem>
   </Tabs>

2. 使用以下命令安装包：

   ```bash
   apt install ./apache-pulsar-client*.deb
   ```

现在，你可以看到安装在 `/usr/lib` 目录下的 Pulsar C++ 客户端库。

### RPM

1. 下载任一 RPM 包：

   <Tabs>
   <TabItem value="client">

   ```bash
   wget @pulsar:dist_rpm:client@
   ```

   此包包含共享库 `libpulsar.so`。

   </TabItem>
   <TabItem value="client-debuginfo">

   ```bash
   wget @pulsar:dist_rpm:client-debuginfo@
   ```

   此包包含 `libpulsar.so` 的调试符号。

   </TabItem>
   <TabItem value="client-devel">

   ```bash
   wget @pulsar:dist_rpm:client-devel@
   ```

   此包包含静态库：`libpulsar.a`、`libpulsarwithdeps.a` 和 C/C++ 头文件。

   </TabItem>
   </Tabs>

2. 使用以下命令安装包：

   ```bash
   rpm -ivh apache-pulsar-client*.rpm
   ```

现在，你可以看到安装在 `/usr/lib` 目录下的 Pulsar C++ 客户端库。

:::note

如果在启动 Pulsar 客户端时遇到类似 "libpulsar.so: cannot open shared object file: No such file or directory" 的错误，你需要先运行 `ldconfig`。

:::

### APK

```bash
apk add --allow-untrusted ./apache-pulsar-client-*.apk
```

## 步骤 2：连接到 Pulsar 集群

要使用客户端库连接到 Pulsar，你需要指定一个 [Pulsar 协议](developing-binary-protocol.md) URL。

你可以为特定的集群分配 Pulsar 协议 URL，并使用 `pulsar` 方案。以下是使用默认端口 `6650` 的 `localhost` 示例：

```http
pulsar://localhost:6650
```

如果你有多个 broker，用逗号分隔 `IP:port`：

```http
pulsar://localhost:6550,localhost:6651,localhost:6652
```

如果你使用 [mTLS](security-tls-authentication.md) 认证，在方案中添加 `+ssl`：

```http
pulsar+ssl://pulsar.us-west.example.com:6651
```