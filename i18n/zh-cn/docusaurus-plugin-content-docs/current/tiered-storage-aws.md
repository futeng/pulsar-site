---
id: tiered-storage-aws
title: Use AWS S3 offloader with Pulsar
sidebar_label: "AWS S3 offloader"
description: Learn to install and configure AWS S3 offloader with Pulsar.
---

本章指导您完成安装和配置 AWS S3 卸载器的每个步骤，以及如何在 Pulsar 中使用它。

## 安装

### 前提条件

- Pulsar：2.4.2 或更高版本

### 步骤

按照以下步骤安装 AWS S3 卸载器。

1. [下载 Pulsar 压缩包](getting-started-standalone.md#download-pulsar-distribution)。
2. 下载并解压 Pulsar 卸载器包，然后将 Pulsar 卸载器作为 `offloaders` 复制到 Pulsar 目录中。请参阅[安装分层存储卸载器](tiered-storage-overview.md#how-to-install-tiered-storage-offloaders)。

## 配置

:::note

在将数据从 BookKeeper 卸载到 AWS S3 之前，您需要配置 AWS S3 卸载驱动程序的一些属性。

:::

此外，您还可以配置 AWS S3 卸载器自动运行或手动触发。

### 配置 AWS S3 卸载器驱动程序

您可以在配置文件 `broker.conf` 或 `standalone.conf` 中配置 AWS S3 卸载器驱动程序。

- **必需**配置如下所示。

  必需配置 | 描述 | 示例值
  |---|---|---
  `managedLedgerOffloadDriver` | 卸载器驱动程序名称，不区分大小写。<br /><br />**注意**：还有第三种驱动程序类型 S3，它与 AWS S3 相同，不过 S3 要求您使用 `s3ManagedLedgerOffloadServiceEndpoint` 指定端点 URL。如果使用除 AWS S3 之外的 S3 兼容数据存储，这很有用。 | aws-s3
  `offloadersDirectory` | 卸载器目录 | offloaders
  `s3ManagedLedgerOffloadBucket` | 存储桶 | pulsar-topic-offload

- **可选**配置如下所示。

  可选配置 | 描述 | 示例值
  |---|---|---
  `s3ManagedLedgerOffloadRegion` | 存储桶区域 <br /><br />**注意**：在为此参数指定值之前，您需要设置以下配置。否则，您可能会收到错误。<br /><br />- 设置 [`s3ManagedLedgerOffloadServiceEndpoint`](https://docs.aws.amazon.com/general/latest/gr/s3.html)。<br /><br />示例<br />`s3ManagedLedgerOffloadServiceEndpoint=https://s3.YOUR_REGION.amazonaws.com`<br /><br />- 向用户授予 `GetBucketLocation` 权限。<br /><br />有关如何向用户授予 `GetBucketLocation` 权限，请参阅[此处](https://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html#using-with-s3-actions-related-to-buckets)。| eu-west-3
  `s3ManagedLedgerOffloadReadBufferSizeInBytes`|块读取大小|1 MB
  `s3ManagedLedgerOffloadMaxBlockSizeInBytes`|块写入大小|64 MB
  `managedLedgerMinLedgerRolloverTimeMinutes`|主题的 ledger 滚动之间的最短时间<br /><br />**注意**：不建议您在生产环境中设置此配置。|10
  `managedLedgerMaxEntriesPerLedger`|在触发滚动之前追加到 ledger 的最大条目数。<br /><br />**注意**：不建议您在生产环境中设置此配置。|50000

#### 存储桶（必需）

存储桶是保存数据的基本容器。您存储在 AWS S3 中的所有内容都必须包含在存储桶中。您可以使用存储桶来组织数据并控制对数据的访问，但与目录和文件夹不同，您不能嵌套存储桶。

##### 示例

此示例将存储桶命名为 _pulsar-topic-offload_。

```conf
s3ManagedLedgerOffloadBucket=pulsar-topic-offload
```

#### 存储桶区域

存储桶区域是存储桶所在的区域。如果未指定存储桶区域，则使用**默认**区域（`美国东部（弗吉尼亚北部）`）。

:::tip

有关 AWS 区域和端点的更多信息，请参阅[此处](https://docs.aws.amazon.com/general/latest/gr/rande.html)。

:::


##### 示例

此示例将存储桶区域设置为 _europe-west-3_。

```
s3ManagedLedgerOffloadRegion=eu-west-3
```

#### 认证（必需）

为了能够访问 AWS S3，您需要使用 AWS S3 进行身份验证。

Pulsar 不提供任何直接的方法来为 AWS S3 配置身份验证，但依赖于 [DefaultAWSCredentialsProviderChain](https://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/auth/DefaultAWSCredentialsProviderChain) 支持的机制。

在 AWS IAM 控制台中创建一组凭证后，您可以使用以下方法之一配置凭证。

* 使用 EC2 实例元数据凭证。

  如果您在 AWS 实例上使用提供凭证的实例配置文件，则如果没有提供其他机制，Pulsar 将使用这些凭证。

* 在 `conf/pulsar_env.sh` 中设置环境变量 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`。

  "export" 很重要，以便使变量在生成进程的环境中可用。

  ```bash
  export AWS_ACCESS_KEY_ID=ABC123456789
  export AWS_SECRET_ACCESS_KEY=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c
  ```

* 将 Java 系统属性 `aws.accessKeyId` 和 `aws.secretKey` 添加到 `conf/pulsar_env.sh` 中的 `PULSAR_EXTRA_OPTS`。

  ```bash
  PULSAR_EXTRA_OPTS="${PULSAR_EXTRA_OPTS} ${PULSAR_MEM} ${PULSAR_GC} -Daws.accessKeyId=ABC123456789 -Daws.secretKey=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c -Dio.netty.leakDetectionLevel=disabled -Dio.netty.recycler.maxCapacityPerThread=4096"
  ```

* 在 `~/.aws/credentials` 中设置访问凭证。

  ```conf
  [default]
  aws_access_key_id=ABC123456789
  aws_secret_access_key=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c
  ```

* 承担 IAM 角色。

  此示例使用 `DefaultAWSCredentialsProviderChain` 来承担此角色。

  必须重启 broker 才能使在 `pulsar_env` 中指定的凭证生效。

  ```conf
  s3ManagedLedgerOffloadRole=<aws role arn>
  s3ManagedLedgerOffloadRoleSessionName=pulsar-s3-offload
  ```

#### 块读/写大小

您可以在配置文件 `broker.conf` 或 `standalone.conf` 中配置发送到 AWS S3 或从 AWS S3 读取的请求的大小。

配置|描述|默认值
|---|---|---
`s3ManagedLedgerOffloadReadBufferSizeInBytes`|从 AWS S3 读回数据时每次单独读取的块大小。|1 MB
`s3ManagedLedgerOffloadMaxBlockSizeInBytes`|向 AWS S3 进行多部分上传期间发送的"部分"的最大大小。它**不能**小于 5 MB。 |64 MB

### 配置 AWS S3 卸载器自动运行

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

此示例使用 pulsar-admin 将 AWS S3 卸载器阈值大小设置为 10 MB。

```bash
bin/pulsar-admin namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

:::tip

有关 `pulsar-admin namespaces set-offload-threshold options` 命令的更多信息，包括标志、描述和默认值，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

### 配置 AWS S3 卸载器手动运行

对于单个主题，您可以使用以下方法之一手动触发 AWS S3 卸载器：

- 使用 REST 端点。

- 使用 CLI 工具（如 pulsar-admin）。

  要通过 CLI 工具触发，您需要指定应在 Pulsar 集群上为主题保留的最大数据量（阈值）。如果 Pulsar 集群上的主题数据大小超过此阈值，则将主题的段移动到 AWS S3，直到不再超过阈值。较旧的段首先移动。

#### 示例

- 此示例使用 pulsar-admin 手动触发 AWS S3 卸载器运行。

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

- 此示例使用 pulsar-admin 检查 AWS S3 卸载器状态。

  ```bash
  bin/pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```bash
  Offload is currently running
  ```

  要等待 AWS S3 卸载器完成作业，请添加 `-w` 标志。

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

## 教程

有关如何将 AWS S3 卸载器与 Pulsar 一起使用的完整分步说明，请参阅[此处](https://hub.streamnative.io/offloaders/aws-s3/2.5.1#usage)。