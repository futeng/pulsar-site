---
id: reference-cli-tools
title: Pulsar command-line tools
sidebar_label: "Pulsar CLI tools"
description: Learn how to use Pulsar command-line tools.
---

Pulsar 提供了几个命令行工具，您可以使用它们来管理 Pulsar 安装、性能测试、使用命令行生产者和消费者等。

* `pulsar-admin`
* `pulsar`
* `pulsar-client`
* `pulsar-daemon`
* `pulsar-perf`
* `pulsar-shell`
* `bookkeeper`

:::tip

有关命令行工具的最新和完整信息，包括命令、标志、描述和更多信息，请参见[参考文档](pathname:///reference/#/@pulsar:version_reference@/)。

:::

所有 Pulsar 命令行工具都可以从您[已安装的 Pulsar 包](getting-started-standalone.md)的 `bin` 目录运行。

您可以使用 `--help` 标志，或简写 `-h` 来获取任何 CLI 工具、命令或子命令的帮助信息。这是一个示例：

```shell
bin/pulsar broker --help
```