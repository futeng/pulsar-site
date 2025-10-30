---
id: tiered-storage-gcs
title: Use GCS offloader with Pulsar
sidebar_label: "GCS offloader"
description: Learn to install and configure GCS offloader with Pulsar.
---

本章指导您完成安装和配置 GCS 卸载器的每个步骤，以及如何在 Pulsar 中使用它。

## 安装

### 前提条件

- Pulsar：2.4.2 或更高版本

### 步骤

按照以下步骤安装 GCS 卸载器。

1. [下载 Pulsar 压缩包](getting-started-standalone.md#download-pulsar-distribution)。
2. 下载并解压 Pulsar 卸载器包，然后将 Pulsar 卸载器作为 `offloaders` 复制到 Pulsar 目录中。请参阅[安装分层存储卸载器](tiered-storage-overview.md#how-to-install-tiered-storage-offloaders)。

## 配置

:::note

在将数据从 BookKeeper 卸载到 GCS 之前，您需要配置 GCS 卸载器驱动程序的一些属性。

:::

此外，您还可以配置 GCS 卸载器自动运行或手动触发。

### 配置 GCS 卸载器驱动程序

您可以在配置文件 `broker.conf` 或 `standalone.conf` 中配置 GCS 卸载器驱动程序。

- **必需**配置如下所示。

  **必需**配置 | 描述 | 示例值
  |---|---|---
  `managedLedgerOffloadDriver`|卸载器驱动程序名称，不区分大小写。|google-cloud-storage
  `offloadersDirectory`|卸载器目录|offloaders
  `gcsManagedLedgerOffloadBucket`|存储桶|pulsar-topic-offload
  `gcsManagedLedgerOffloadRegion`|存储桶区域|europe-west3
  `gcsManagedLedgerOffloadServiceAccountKeyFile`|认证 |/Users/user-name/Downloads/project-804d5e6a6f33.json

- **可选**配置如下所示。

  可选配置|描述|示例值
  |---|---|---
  `gcsManagedLedgerOffloadReadBufferSizeInBytes`|块读取大小|1 MB
  `gcsManagedLedgerOffloadMaxBlockSizeInBytes`|块写入大小|64 MB
  `managedLedgerMinLedgerRolloverTimeMinutes`|主题的 ledger 滚动之间的最短时间。|10
  `managedLedgerMaxEntriesPerLedger`|在触发滚动之前追加到 ledger 的最大条目数。|50000

#### 存储桶（必需）

存储桶是保存数据的基本容器。您存储在 GCS 中的所有内容**必须**包含在存储桶中。您可以使用存储桶来组织数据并控制对数据的访问，但与目录和文件夹不同，您不能嵌套存储桶。

##### 示例

此示例将存储桶命名为 _pulsar-topic-offload_。

```conf
gcsManagedLedgerOffloadBucket=pulsar-topic-offload
```

#### 存储桶区域（必需）

存储桶区域是存储桶所在的区域。如果未指定存储桶区域，则使用**默认**区域（`美国多区域位置`）。

:::tip

有关存储桶位置的更多信息，请参阅[此处](https://cloud.google.com/storage/docs/bucket-locations)。

:::

##### 示例

此示例将存储桶区域设置为 _europe-west3_。

```shell
gcsManagedLedgerOffloadRegion=europe-west3
```

#### 认证（必需）

要使 broker 能够访问 GCS，您需要在配置文件 `broker.conf` 中配置 `gcsManagedLedgerOffloadServiceAccountKeyFile`。

`gcsManagedLedgerOffloadServiceAccountKeyFile` 是一个 JSON 文件，包含服务帐户的 GCS 凭证。

##### 示例

要生成服务帐户凭证或查看您已生成的公共凭证，请按照以下步骤操作。

1. 导航到[服务帐户页面](https://console.developers.google.com/iam-admin/serviceaccounts)。

2. 选择一个项目或创建一个新项目。

3. 单击**创建服务帐户**。

4. 在**创建服务帐户**窗口中，键入服务帐户的名称并选择**提供新的私钥**。

   如果您想向服务帐户[授予 G Suite 域范围权限](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#delegatingauthority)，请选择**启用 G Suite 域范围委派**。

5. 单击**创建**。

   :::note

   确保您创建的服务帐户具有操作 GCS 的权限，您需要在此处为您的服务帐户分配**存储管理员**权限[此处](https://cloud.google.com/storage/docs/access-control/iam)。

   :::

6. 您可以获取以下信息并在 `broker.conf` 中设置此信息。

   ```conf
   gcsManagedLedgerOffloadServiceAccountKeyFile="/Users/user-name/Downloads/project-804d5e6a6f33.json"
   ```

   :::tip

   - 有关如何创建 `gcsManagedLedgerOffloadServiceAccountKeyFile` 的更多信息，请参阅[此处](https://support.google.com/googleapi/answer/6158849)。
   - 有关 Google Cloud IAM 的更多信息，请参阅[此处](https://cloud.google.com/storage/docs/access-control/iam)。

   :::

#### 块读/写大小

您可以在配置文件 `broker.conf` 中配置发送到 GCS 或从 GCS 读取的请求的大小。

配置|描述
|---|---
`gcsManagedLedgerOffloadReadBufferSizeInBytes`|从 GCS 读回数据时每次单独读取的块大小。<br /><br />**默认**值为 1 MB。
`gcsManagedLedgerOffloadMaxBlockSizeInBytes`|向 GCS 进行多部分上传期间发送的"部分"的最大大小。<br /><br />它**不能**小于 5 MB。<br /><br />**默认**值为 64 MB。

### 配置 GCS 卸载器自动运行

可以配置命名空间策略，一旦达到阈值就自动卸载数据。阈值基于主题在 Pulsar 集群上存储的数据大小。一旦主题达到阈值，就会自动触发卸载操作。

阈值|操作
|---|---
> 0 | 如果主题存储达到其阈值，它将触发卸载操作。
= 0|它导致 broker 尽快卸载数据。
< 0 |它禁用自动卸载操作。

当新段添加到主题日志时，自动卸载运行。如果您在命名空间上设置阈值，但很少有消息生成到主题，卸载器不会工作，直到当前段已满。

您可以使用 CLI 工具（如 pulsar-admin）配置阈值大小。

`broker.conf` 和 `standalone.conf` 中的卸载配置用于没有命名空间级卸载策略的命名空间。每个命名空间可以有自己的卸载策略。如果您想为每个命名空间设置卸载策略，请使用命令 [`pulsar-admin namespaces set-offload-policies options`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=set-offload-policies) 命令。

#### 示例

此示例使用 pulsar-admin 将 GCS 卸载器阈值大小设置为 10 MB。

```bash
pulsar-admin namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

:::tip

有关 `pulsar-admin namespaces set-offload-threshold options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

### 配置 GCS 卸载器手动运行

对于单个主题，您可以使用以下方法之一手动触发 GCS 卸载器：

- 使用 REST 端点。

- 使用 CLI 工具（如 pulsar-admin）。

  要通过 CLI 工具触发 GCS，您需要指定应在 Pulsar 集群上为主题保留的最大数据量（阈值）。如果 Pulsar 集群上的主题数据大小超过此阈值，则将主题的段移动到 GCS，直到不再超过阈值。较旧的段首先移动。

#### 示例

- 此示例使用命令 `pulsar-admin topics offload (topic-name) (threshold)` 通过 pulsar-admin 手动触发 GCS 卸载器运行。

  ```bash
  pulsar-admin topics offload persistent://my-tenant/my-namespace/topic1 10M
  ```

  **输出**

  ```bash
  Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
  ```

  :::tip

  有关 `pulsar-admin topics offload options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

- 此示例使用命令 `pulsar-admin topics offload-status options` 通过 pulsar-admin 检查 GCS 卸载器状态。

  ```bash
  pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```bash
  Offload is currently running
  ```

  要等待 GCS 完成作业，请添加 `-w` 标志。

  ```bash
  pulsar-admin topics offload-status -w persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```
  Offload was a success
  ```

  如果卸载中出现错误，错误会传播到 `pulsar-admin topics offload-status` 命令。

  ```bash
  pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```
  Error in offload
  null

  Reason: Error offloading: org.apache.bookkeeper.mledger.ManagedLedgerException: java.util.concurrent.CompletionException: com.amazonaws.services.s3.model.AmazonS3Exception: Anonymous users cannot initiate multipart uploads.  Please authenticate. (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied; Request ID: 798758DE3F1776DF; S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=), S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=
  ```

  :::tip

  有关 `pulsar-admin topics offload-status options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

## 教程

有关如何将 GCS 卸载器与 Pulsar 一起使用的完整分步说明，请参阅[此处](https://hub.streamnative.io/offloaders/gcs/2.5.1#usage)。