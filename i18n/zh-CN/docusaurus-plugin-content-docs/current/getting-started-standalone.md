---
id: getting-started-standalone
title: 在本地运行独立 Pulsar 集群
sidebar_label: "本地运行 Pulsar"
description: 在您的本地机器上开始使用 Apache Pulsar。
---

对于本地开发和测试，您可以在您的机器上以独立模式运行 Pulsar。独立模式在单个 Java 虚拟机（JVM）进程中运行所有组件。

:::tip

如果您希望运行完整的生产级 Pulsar 安装，请参阅[部署 Pulsar 实例](deploy-bare-metal.md)指南。

:::

要在您的机器上以独立模式运行 Pulsar，请按照以下步骤操作。

## 第 0 步：先决条件

目前，Pulsar 可用于 64 位 **macOS** 和 **Linux**。如果您想在 **Windows** 上运行 Pulsar，请参阅[在 Docker 中运行 Pulsar](getting-started-docker.md)。

此外，您需要安装适当的 64 位 JRE/JDK 版本：

- **Java 17** 是 Pulsar 2.11+ 和 master 分支所必需的
- **Java 11** 是 Pulsar 2.8/2.9/2.10 所必需的
- **Java 8** 是 Pulsar 2.7 及更早版本所必需的

有关最新的 Java 版本建议，请参阅 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。

## 第 1 步：下载 Pulsar 分发包

下载官方的 Apache Pulsar 分发包：

```bash
curl -LO "https://www.apache.org/dyn/closer.lua/pulsar/pulsar-@pulsar:version@/apache-pulsar-@pulsar:version@-bin.tar.gz?action=download"
```

下载完成后，解压 tar 文件：

```bash
tar xvfz apache-pulsar-@pulsar:version@-bin.tar.gz
```

对于本快速入门的其余部分，所有命令都从分发文件夹的根目录运行，因此切换到该目录：

```bash
cd apache-pulsar-@pulsar:version@
```

通过执行以下命令列出内容：

```bash
ls -1F
```

创建以下目录：

| 目录         | 描述                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **bin**      | [`pulsar`](reference-cli-tools.md) 入点脚本，以及许多其他命令行工具                                    |
| **conf**     | 配置文件，包括 `broker.conf`                                                                           |
| **lib**      | Pulsar 使用的 JAR                                                                                      |
| **examples** | [Pulsar Functions](functions-overview.md) 示例                                                         |
| **instances**| [Pulsar Functions](functions-overview.md) 的制品                                                        |

## 第 2 步：启动独立 Pulsar 集群

运行此命令以启动独立 Pulsar 集群：

```bash
bin/pulsar standalone
```

当 Pulsar 集群启动时，会创建以下目录：

| 目录 | 描述                                    |
| ---- | -------------------------------------- |
| **data** | BookKeeper 和 RocksDB 创建的所有数据 |
| **logs** | 所有服务器端日志                       |

:::tip

* 要将服务作为后台进程运行，您可以使用 `bin/pulsar-daemon start standalone` 命令。有关更多信息，请参阅 [pulsar-daemon](reference-cli-tools.md)。
* 启动 Pulsar 集群时会创建 `public/default` 命名空间。此命名空间用于开发目的。所有 Pulsar 主题都在命名空间内管理。有关更多信息，请参阅[命名空间](concepts-messaging.md#namespaces)和[主题](concepts-messaging.md#topics)。

:::

## 第 3 步：创建主题

Pulsar 将消息存储在主题中。在使用主题之前显式创建主题是一个好习惯，即使 Pulsar 在引用主题时可以自动创建它们。

要创建新主题，请运行此命令：

```bash
bin/pulsar-admin topics create persistent://public/default/my-topic
```

## 第 4 步：向主题写入消息

您可以使用 `pulsar` 命令行工具向主题写入消息。这对于实验很有用，但在实践中，您将在应用程序代码中使用 Producer API，或使用 Pulsar IO 连接器将数据从其他系统拉取到 Pulsar。