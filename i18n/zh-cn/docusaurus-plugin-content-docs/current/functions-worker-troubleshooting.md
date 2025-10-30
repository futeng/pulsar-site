---
id: functions-worker-troubleshooting
title: 故障排除
sidebar_label: "故障排除"
description: 在 Pulsar 中排查函数工作器配置问题。
---

**错误消息：Namespace missing local cluster name in clusters list**

```text

Failed to get partitioned topic metadata: org.apache.pulsar.client.api.PulsarClientException$BrokerMetadataException: Namespace missing local cluster name in clusters list: local_cluster=xyz ns=public/functions clusters=[standalone]

```

当发生以下任何情况时，会显示此错误消息：
- broker 以 `functionsWorkerEnabled=true` 启动，但 `conf/functions_worker.yml` 文件中的 `pulsarFunctionsCluster` 未设置为正确的集群。
- 设置具有 `functionsWorkerEnabled=true` 的异地复制 Pulsar 集群，而一个集群中的 broker 运行良好，另一个集群中的 broker 运行不佳。

**解决方法**

如果发生这些情况中的任何一种，请按照以下说明修复问题。

1. 通过设置 `functionsWorkerEnabled=false` 禁用函数工作器，并重启 broker。

2. 获取 `public/functions` 命名空间的当前集群列表。

   ```bash
   bin/pulsar-admin namespaces get-clusters public/functions
   ```

3. 检查集群是否在集群列表中。如果不在，则添加它并更新列表。

   ```bash
   bin/pulsar-admin namespaces set-clusters --clusters <existing-clusters>,<new-cluster> public/functions
   ```

4. 成功设置集群后，通过设置 `functionsWorkerEnabled=true` 启用函数工作器。

5. 在 `conf/functions_worker.yml` 文件中为 `pulsarFunctionsCluster` 参数设置正确的集群名称。

6. 重启 broker。