---
id: functions-worker-corun
title: 与 broker 一起运行函数工作器
sidebar_label: "与 broker 一起运行函数工作器"
description: 与 Pulsar broker 一起运行 Pulsar 函数工作器。
---

下图说明了与 broker 一起运行的函数工作器的部署。

![Pulsar 中函数工作器的部署](/assets/function-workers-corun.svg)

:::note

插图中的 `Service URLs` 代表 Pulsar 客户端和 Pulsar 管理员用于连接到 Pulsar 集群的 Pulsar 服务 URL。

:::

要设置与 broker 一起运行的函数工作器，请完成以下步骤：

### 步骤 1：启用函数工作器与 broker 一起运行

在 `conf/broker.conf` 文件中（Pulsar 独立模式为 `conf/standalone.conf`），将 `functionsWorkerEnabled` 设置为 `true`。

```conf
functionsWorkerEnabled=true
```

### 步骤 2：配置函数工作器与 broker 一起运行

在 `run-with-brokers` 模式下，函数工作器的大多数设置都从您的 broker 配置继承（例如，配置存储设置、身份验证设置等）。您可以根据需要通过配置 `conf/functions_worker.yml` 文件来自定义其他工作器设置。

:::tip

- 为了确保生产部署（具有多个 broker 的集群）中的高可用性，将 `numFunctionPackageReplicas` 设置为等于 bookie 的数量。默认值 `1` 仅适用于单节点集群部署。
- 要在运行时初始化分布式日志元数据（`initializedDlogMetadata = true`），确保它已通过 `bin/pulsar initialize-cluster-metadata` 命令初始化。

:::

当在 BookKeeper 集群上启用身份验证时，您需要为函数工作器配置以下身份验证设置。
- `bookkeeperClientAuthenticationPlugin`：BookKeeper 客户端的身份验证插件名称。
- `bookkeeperClientAuthenticationParametersName`：BookKeeper 客户端的身份验证插件参数，包括名称和值。
- `bookkeeperClientAuthenticationParameters`：BookKeeper 客户端的身份验证插件参数。

### 步骤 3：启动函数工作器与 broker 一起运行

一旦函数工作器配置正确，您就可以启动 broker（函数工作器与 broker 一起运行）。

要验证每个工作器是否正在运行，您可以使用以下命令。

```bash
curl <broker-ip>:8080/admin/v2/worker/cluster
```

如果返回活动函数工作器的列表，则表示它们已成功启动。输出类似于以下内容。

```json
[{"workerId":"<worker-id>","workerHostname":"<worker-hostname>","port":8080}]
```