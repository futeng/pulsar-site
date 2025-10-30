---
id: functions-worker-stateful
title: 启用有状态函数
sidebar_label: "启用有状态函数"
description: 在 Pulsar 函数工作器中启用有状态函数功能。
---

:::note

当需要 Pulsar Functions 的有状态 API 时——例如，`putState()` 和 `queryState()` 相关接口——您需要在函数工作器中启用有状态函数功能。

:::

要在函数工作器中启用有状态函数功能，请完成以下步骤。

1. 在 BookKeeper 中启用 `streamStorage` 服务。
   目前，该服务使用 NAR 包，因此您需要在 `conf/bookkeeper.conf` 文件中设置配置。

   ```shell
   ##################################################################
   ##################################################################
   # 以下设置由流/表服务使用
   ##################################################################
   ##################################################################

   ### Grpc 服务器 ###

   # 要监听的 grpc 服务器端口。默认为 4181
   storageserver.grpc.port=4181

   ### 表服务的 Dlog 设置 ###

   #### 复制设置
   dlog.bkcEnsembleSize=3
   dlog.bkcWriteQuorumSize=2
   dlog.bkcAckQuorumSize=2

   ### 存储 ###

   # 用于存储表范围数据的本地存储目录（例如 rocksdb sst 文件）
   storage.range.store.dirs=data/bookkeeper/ranges

   # 存储服务器是否能够提供只读表。默认为 false。
   storage.serve.readonly.tables=false

   # 集群控制器调度间隔，以毫秒为单位。默认为 30 秒。
   storage.cluster.controller.schedule.interval.ms=30000
   ```

2. 启动 bookie 后，使用以下方法检查 `streamStorage` 服务是否已成功启动。

   * 输入：

      ```shell
      telnet localhost 4181
      ```

   * 输出：

      ```text
      Trying 127.0.0.1...
      Connected to localhost.
      Escape character is '^]'.
      ```

3. 在 `conf/functions_worker.yml` 文件中配置 `stateStorageServiceUrl`。
   `bk-service-url` 是指向 BookKeeper 表服务的服务 URL。

   ```yaml
   stateStorageServiceUrl: bk://<bk-service-url>:4181
   ```