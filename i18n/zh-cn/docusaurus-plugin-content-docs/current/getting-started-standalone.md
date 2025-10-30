---
id: getting-started-standalone
title: 在本地运行独立 Pulsar 集群
sidebar_label: "本地运行 Pulsar"
description: 在您的本地机器上开始使用 Apache Pulsar。
---

对于本地开发和测试，您可以在您的机器上以独立模式运行 Pulsar。独立模式在单个 Java 虚拟机（JVM）进程中运行所有组件。

:::tip

如果您希望运行完整的生产 Pulsar 安装，请参阅[部署 Pulsar 实例](deploy-bare-metal.md)指南。

:::

要在您的机器上以独立模式运行 Pulsar，请按照以下步骤操作。

## 步骤 0: 前提条件

目前，Pulsar 可用于 64 位 **macOS** 和 **Linux**。如果您想在 **Windows** 上运行 Pulsar，请参阅[在 Docker 中运行 Pulsar](getting-started-docker.md)。

另外，您需要安装适当的 64 位 JRE/JDK 版本：

- **Java 21** 是 Pulsar 4.0+ 和 master 分支的必需版本
- **Java 17** 是 Pulsar 2.11+ 和 master 分支的必需版本
- **Java 11** 是 Pulsar 2.8/2.9/2.10 的必需版本
- **Java 8** 是 Pulsar 2.7 及更早版本的必需版本

有关最新的 Java 版本建议，请参阅 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。
使用 Java 版本时，建议使用[特定 Java 发布版本（17 或 21）的最新版本](https://adoptium.net/en-GB/temurin/releases?version=21&os=linux&arch=any)，包含最新的错误修复和安全补丁。
您可以在[使用 SDKMAN 设置 JDK 和 Maven](/contribute/setup-buildtools)中找到 Java 安装说明，或者[从 Adoptium 下载 Temurin OpenJDK 发行版](https://adoptium.net/en-GB/temurin/releases?version=21&os=any&arch=any)。

## 步骤 1: 下载 Pulsar 发行版

下载官方 Apache Pulsar 发行版：

```bash
curl -LO "https://www.apache.org/dyn/closer.lua/pulsar/pulsar-@pulsar:version@/apache-pulsar-@pulsar:version@-bin.tar.gz?action=download"
```

下载完成后，解压缩 tar 文件：

```bash
tar xvfz apache-pulsar-@pulsar:version@-bin.tar.gz
```

对于本快速入门的其余部分，所有命令都从发行版文件夹的根目录运行，因此切换到该目录：

```bash
cd apache-pulsar-@pulsar:version@
```

通过执行以下命令列出内容：

```bash
ls -1F
```

创建以下目录：

| 目录         | 描述                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------- |
| **bin**      | [`pulsar`](reference-cli-tools.md) 入点脚本，以及许多其他命令行工具                       |
| **conf**     | 配置文件，包括 `broker.conf`                                                                        |
| **lib**      | Pulsar 使用的 JARs                                                                                  |
| **examples** | [Pulsar Functions](functions-overview.md) 示例                                                  |
| **instances** | [Pulsar Functions](functions-overview.md) 的构件                                               |

## 步骤 2: 启动独立 Pulsar 集群

运行此命令启动独立 Pulsar 集群：

```bash
bin/pulsar standalone
```

当 Pulsar 集群启动时，创建以下目录：

| 目录    | 描述                                |
| ------- | ------------------------------------------ |
| **data** | BookKeeper 和 RocksDB 创建的所有数据 |
| **logs** | 所有服务器端日志                       |

:::tip

* 要将服务作为后台进程运行，您可以使用 `bin/pulsar-daemon start standalone` 命令。有关更多信息，请参阅 [pulsar-daemon](reference-cli-tools.md)。
* 当您启动 Pulsar 集群时，会创建 `public/default` 命名空间。此命名空间用于开发目的。所有 Pulsar Topic 都在命名空间内管理。有关更多信息，请参阅[命名空间](concepts-messaging.md#namespaces)和[Topic](concepts-messaging.md#topics)。

:::

## 步骤 3: 创建 Topic

Pulsar 在 Topic 中存储消息。在使用 Topic 之前显式创建 Topic 是一个好习惯，即使 Pulsar 在引用 Topic 时可以自动创建。

要创建新 Topic，请运行此命令：

```bash
bin/pulsar-admin topics create persistent://public/default/my-topic
```

## 步骤 4: 向 Topic 写入消息

您可以使用 `pulsar` 命令行工具向 Topic 写入消息。这对于实验很有用，但在实践中，您将在应用程序代码中使用 Producer API，或使用 Pulsar IO 连接器从其他系统拉取数据到 Pulsar。

运行此命令生成消息：

```bash
bin/pulsar-client produce my-topic --messages 'Hello Pulsar!'
```

## 步骤 5: 从 Topic 读取消息

现在一些消息已经写入 Topic，请运行此命令启动消费者并读取这些消息：

```bash
bin/pulsar-client consume my-topic -s 'my-subscription' -p Earliest -n 0
```

Earliest 意味着从最早的**未消费**消息开始消费。`-n` 配置要消费的消息数量，0 表示永远消费。

和之前一样，这对于实验消息很有用，但在实践中，您将在应用程序代码中使用 Consumer API，或使用 Pulsar IO 连接器从 Pulsar 读取数据推送到其他系统。

您将看到上一步中产生的消息：

```text
----- got message -----
key:[null], properties:[], content:Hello Pulsar!
```

## 步骤 6: 写入更多消息

保持上一步中的 consume 命令运行。如果您已经关闭它，只需重新运行它。

现在打开一个新的终端窗口并生成更多消息。默认消息分隔符是 `,`：

```bash
bin/pulsar-client produce my-topic --messages "$(seq -s, -f 'Message NO.%g' 1 10)"
```

注意它们如何几乎即时地显示在消费者终端中。

## 步骤 7: 停止 Pulsar 集群

完成后，您可以关闭 Pulsar 集群。在启动集群的终端窗口中按 **Ctrl-C**。

## 相关主题

- [Pulsar 概念和架构](concepts-architecture-overview.md)
- [Pulsar 客户端库](client-libraries.md)
- [Pulsar 连接器](io-overview.md)
- [Pulsar Functions](functions-overview.md)