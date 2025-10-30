---
id: tiered-storage-s3
title: Use S3 offloader with Pulsar
sidebar_label: "S3 offloader"
description: Learn to install and configure S3 offloader with Pulsar.
---

S3 卸载器是为支持 S3 兼容存储而引入的，这意味着存储采用 S3 API 作为其"语言"，并且使用 S3 API 的应用程序能够与 S3 兼容存储即插即用。

本章指导您完成安装和配置 S3 卸载器的每个步骤，以及如何在 Pulsar 中使用它。

## 安装

### 前提条件

- Pulsar：2.9.3 或更高版本

### 步骤

按照以下步骤安装 S3 卸载器。

1. [下载 Pulsar 压缩包](getting-started-standalone.md#step-1-download-pulsar-distribution)。
2. 下载并解压 Pulsar 卸载器包，然后将 Pulsar 卸载器作为 `offloaders` 复制到 Pulsar 目录中。请参阅[安装分层存储卸载器](tiered-storage-overview.md#how-to-install-tiered-storage-offloaders)。

## 配置

:::note

在将数据从 BookKeeper 卸载到 S3 兼容存储之前，您需要配置 S3 卸载驱动程序的一些属性。此外，您还可以配置 S3 卸载器自动运行或手动触发。

:::

### 配置 S3 卸载器驱动程序

您可以在配置文件 `broker.conf` 或 `standalone.conf` 中配置 S3 卸载器驱动程序。

- **必需**配置如下所示。

  | 必需配置                | 描述                                       | 示例值         |
  |---------------------------------------|---------------------------------------------------|-----------------------|
  | `managedLedgerOffloadDriver`          | 卸载器驱动程序名称，不区分大小写。 | S3                    |
  | `offloadersDirectory`                 | 卸载器目录                               | offloaders            |
  | `managedLedgerOffloadBucket`          | [存储桶](#bucket-required)                        | pulsar-topic-offload  |
  | `managedLedgerOffloadServiceEndpoint` | [端点](#endpoint-required)                    | http://localhost:9000 |

- **可选**配置如下所示。

  | 可选配置                                    | 描述                                                                                                                                                                          | 默认值 |
  |---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
  | `managedLedgerOffloadReadBufferSizeInBytes` | 从 S3 兼容存储读回数据时每次单独读取的块大小。                                                                                                                               | 1 MB          |
  | `managedLedgerOffloadMaxBlockSizeInBytes`   | 向 S3 兼容存储进行多部分上传期间发送的最大块大小。它**不能**小于 5 MB。                                                                     | 64 MB         |
  | `managedLedgerMinLedgerRolloverTimeMinutes` | 主题的 ledger 滚动之间的最短时间。<br /><br />**注意**：在生产环境中**不**建议更改默认值。                             | 10            |
  | `managedLedgerMaxEntriesPerLedger`          | 在触发滚动之前追加到 ledger 的最大条目数。<br /><br />**注意**：在生产环境中**不**建议更改默认值。 | 50000         |

#### 存储桶（必需）

存储桶是保存数据的基本容器。您存储在 S3 兼容存储中的所有内容都必须包含在存储桶中。您可以使用存储桶来组织数据并控制对数据的访问，但与目录和文件夹不同，您不能嵌套存储桶。

##### 示例

此示例将存储桶命名为 `pulsar-topic-offload`。

```conf
managedLedgerOffloadBucket=pulsar-topic-offload
```

#### 端点（必需）

端点是存储桶所在的区域。

##### 示例

此示例将端点设置为 `localhost`。

```conf
managedLedgerOffloadServiceEndpoint=http://localhost:9000
```

#### 认证（可选）

为了能够访问 S3 兼容存储，您需要使用 S3 兼容存储进行身份验证。

在 `conf/pulsar_env.sh` 中设置环境变量 `ACCESS_KEY_ID` 和 `ACCESS_KEY_SECRET`。

```bash
export ACCESS_KEY_ID=ABC123456789
export ACCESS_KEY_SECRET=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c
```

:::note

导出这些环境变量使它们在生成进程的环境中可用。

:::

### 自动运行 S3 卸载器

可以配置命名空间策略，一旦达到阈值就自动卸载数据。阈值基于主题在 Pulsar 集群中存储的数据大小。一旦主题达到阈值，就会自动触发卸载操作。

| 阈值 | 操作                                                                           |
|-----------------|----------------------------------------------------------------------------------|
| &gt; 0          | 如果主题存储达到其阈值，它将触发卸载操作。 |
| = 0             | 它导致 broker 尽快卸载数据。                          |
| &lt; 0          | 它禁用自动卸载操作。                                      |

当新段添加到主题日志时，自动卸载运行。如果您为命名空间设置阈值，但很少有消息生成到主题，卸载器不会工作，直到当前段已满。

您可以使用 CLI 工具（如 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)）配置阈值大小。

`broker.conf` 和 `standalone.conf` 中的卸载配置用于没有命名空间级卸载策略的命名空间。每个命名空间可以有自己的卸载策略。如果您想为特定命名空间设置卸载策略，请使用命令 [`pulsar-admin namespaces set-offload-policies options`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=set-offload-policies) 命令。

#### 示例

此示例使用 `pulsar-admin` 将 S3 卸载器阈值大小设置为 10 MB。

```bash
bin/pulsar-admin namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

:::tip

有关 `pulsar-admin namespaces set-offload-threshold options` 命令的更多信息，包括标志、描述和默认值，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

### 手动运行 S3 卸载器

对于单个主题，您可以使用以下方法之一手动触发 S3 卸载器：

- 使用 REST 端点。

- 使用 CLI 工具，如 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

 要通过 CLI 工具触发，您需要指定应在 Pulsar 集群中为主题保留的最大数据量（阈值）。如果 Pulsar 集群中的主题数据大小超过此阈值，则将主题的段移动到 S3 兼容存储，直到不再超过阈值。较旧的段首先移动。

#### 示例

- 此示例使用 `pulsar-admin` 手动触发 S3 卸载器运行。

  ```bash
  bin/pulsar-admin topics offload --size-threshold 10M my-tenant/my-namespace/topic1
  ```

  **输出**

  ```bash
  Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
  ```

  :::tip

  有关 `pulsar-admin topics offload options` 命令的更多信息，包括标志、描述和默认值，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

- 此示例使用 `pulsar-admin` 检查 S3 卸载器状态。

  ```bash
  bin/pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```bash
  Offload is currently running
  ```

  要等待 S3 卸载器完成作业，请添加 `-w` 标志。

  ```bash
  bin/pulsar-admin topics offload-status -w persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```
  Offload was a success
  ```

  如果卸载中出现错误，错误会传播到 `pulsar-admin topics offload-status` 命令。

  ```bash
  bin/pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```
  Error in offload
  null

  Reason: Error offloading: org.apache.bookkeeper.mledger.ManagedLedgerException: java.util.concurrent.CompletionException: com.amazonaws.services.s3.model.AmazonS3Exception: Anonymous users cannot initiate multipart uploads.  Please authenticate. (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied; Request ID: 798758DE3F1776DF; S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=), S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=
  ```

  :::tip

  有关 `pulsar-admin topics offload-status options` 命令的更多信息，包括标志、描述和默认值，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::