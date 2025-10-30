---
id: cookbooks-tiered-storage
title: 分层存储
sidebar_label: "分层存储"
---

Pulsar 的**分层存储**功能允许将较旧的积压数据卸载到长期存储，从而释放 BookKeeper 中的空间并降低存储成本。本教程将指导你在 Pulsar 集群中使用分层存储。

* 分层存储使用 [Apache jclouds](https://jclouds.apache.org) 来支持 [Amazon S3](https://aws.amazon.com/s3/) 和 [Google Cloud Storage](https://cloud.google.com/storage/)（简称为 GCS）进行长期存储。借助 Jclouds，将来可以轻松添加对更多[云存储提供商](https://jclouds.apache.org/reference/providers/#blobstore-providers)的支持。

* 分层存储使用 [Apache Hadoop](http://hadoop.apache.org/) 来支持文件系统进行长期存储。借助 Hadoop，将来可以轻松添加对更多文件系统的支持。

## 什么时候应该使用分层存储？

当你有一个主题想要长期保留非常长的积压数据时，应该使用分层存储。例如，如果你有一个包含用户操作的主题，用于训练你的推荐系统，你可能想要长期保留这些数据，这样如果你更改推荐算法，可以对你的完整用户历史重新运行它。

## 卸载机制

Pulsar 中的主题由一个日志支持，称为托管Ledger。这个日志由一个有序的段列表组成。Pulsar 只写入日志的最后一个段。所有先前的段都是密封的。段内的数据是不可变的。这被称为段导向架构。

![分层存储](/assets/pulsar-tiered-storage.png "分层存储")

分层存储卸载机制利用了这种段导向架构。当请求卸载时，日志的段会逐个复制到分层存储。日志的所有段，除了当前正在写入的段，都可以被卸载。

在 broker 上，管理员必须配置云存储服务的存储桶和凭证。配置的存储桶必须在尝试卸载之前存在。如果不存在，卸载操作将失败。

Pulsar 使用多部分对象上传段数据。在上传数据时，broker 可能会崩溃。我们建议你为存储桶添加生命周期规则，在一两天后过期未完成的多部分上传，以避免为未完成的上传付费。

## 配置卸载驱动程序

卸载在 `broker.conf` 中配置。

至少，管理员必须配置驱动程序、存储桶和身份验证凭证。还有一些其他旋钮可配置，如存储桶区域、后备存储中的最大块大小等。

目前我们支持以下类型的驱动程序：

- `aws-s3`：[简单云存储服务](https://aws.amazon.com/s3/)
- `google-cloud-storage`：[Google 云存储](https://cloud.google.com/storage/)
- `filesystem`：[文件系统存储](http://hadoop.apache.org/)

> 驱动程序名称对驱动程序名称不区分大小写。还有第三种驱动程序类型 `s3`，它与 `aws-s3` 相同，但它要求你使用 `s3ManagedLedgerOffloadServiceEndpoint` 指定端点 URL。如果使用 S3 兼容的数据存储（非 AWS），这很有用。

```conf
managedLedgerOffloadDriver=aws-s3
```

### "aws-s3" 驱动程序配置

#### 存储桶和区域

存储桶是保存数据的基本容器。你在云存储中存储的所有内容都必须包含在存储桶中。你可以使用存储桶来组织数据和控制对数据的访问，但与目录和文件夹不同，你不能嵌套存储桶。

```conf
s3ManagedLedgerOffloadBucket=pulsar-topic-offload
```

存储桶区域是存储桶所在的区域。存储桶区域不是必需的配置，但是推荐的配置。如果未配置，它将使用默认区域。

对于 AWS S3，默认区域是 `美国东部（弗吉尼亚北部）`。页面 [AWS 区域和端点](https://docs.aws.amazon.com/general/latest/gr/rande.html) 包含更多信息。

```conf
s3ManagedLedgerOffloadRegion=eu-west-3
```

#### 与 AWS 身份验证

要能够访问 AWS S3，你需要与 AWS S3 进行身份验证。Pulsar 没有提供任何直接的方式来为 AWS S3 配置身份验证，但依赖于 [DefaultAWSCredentialsProviderChain](https://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/auth/DefaultAWSCredentialsProviderChain) 支持的机制。

在 AWS IAM 控制台中创建一组凭证后，可以通过多种方式进行配置。

1. 使用 ec2 实例元数据凭证

如果你在具有提供凭证的实例配置文件的 AWS 实例上，如果没有提供其他机制，Pulsar 将使用这些凭证。

2. 在 `conf/pulsar_env.sh` 中设置环境变量 **AWS_ACCESS_KEY_ID** 和 **AWS_SECRET_ACCESS_KEY**。

```bash
export AWS_ACCESS_KEY_ID=ABC123456789
export AWS_SECRET_ACCESS_KEY=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c
```

> "export" 很重要，这样变量就可在衍生进程的环境中使用。

3. 将 Java 系统属性 *aws.accessKeyId* 和 *aws.secretKey* 添加到 `conf/pulsar_env.sh` 中的 **PULSAR_EXTRA_OPTS**。

```bash
PULSAR_EXTRA_OPTS="${PULSAR_EXTRA_OPTS} ${PULSAR_MEM} ${PULSAR_GC} -Daws.accessKeyId=ABC123456789 -Daws.secretKey=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c -Dio.netty.leakDetectionLevel=disabled -Dio.netty.recycler.maxCapacityPerThread=4096"
```

4. 在 `~/.aws/credentials` 中设置访问凭证。

```conf
[default]
aws_access_key_id=ABC123456789
aws_secret_access_key=ded7db27a4558e2ea8bbf0bf37ae0e8521618f366c
```

5. 承担 IAM 角色

如果你想承担 IAM 角色，可以通过指定以下内容来完成：

```conf
s3ManagedLedgerOffloadRole=<aws role arn>
s3ManagedLedgerOffloadRoleSessionName=pulsar-s3-offload
```

这将使用 `DefaultAWSCredentialsProviderChain` 来承担此角色。

> broker 必须重启才能使在 pulsar_env 中指定的凭证生效。

#### 配置块读/写的大小

Pulsar 还提供了一些旋钮来配置发送到 AWS S3 的请求大小。

- `s3ManagedLedgerOffloadMaxBlockSizeInBytes` 配置多部分上传期间发送的"部分"的最大大小。这不能小于 5MB。默认为 64MB。
- `s3ManagedLedgerOffloadReadBufferSizeInBytes` 配置从 AWS S3 读回数据时每次单独读取的块大小。默认为 1MB。

在这两种情况下，除非你知道自己在做什么，否则不应该调整这些值。

### "google-cloud-storage" 驱动程序配置

存储桶是保存数据的基本容器。你在云存储中存储的所有内容都必须包含在存储桶中。你可以使用存储桶来组织数据和控制对数据的访问，但与目录和文件夹不同，你不能嵌套存储桶。

```conf
gcsManagedLedgerOffloadBucket=pulsar-topic-offload
```

存储桶区域是存储桶所在的区域。存储桶区域不是必需的配置，但是推荐的配置。如果未配置，它将使用默认区域。

关于 GCS，存储桶默认创建在 `us multi-regional location`，页面[存储桶位置](https://cloud.google.com/storage/docs/bucket-locations) 包含更多信息。

```conf
gcsManagedLedgerOffloadRegion=europe-west3
```

#### 与 GCS 身份验证

管理员需要在 `broker.conf` 中配置 `gcsManagedLedgerOffloadServiceAccountKeyFile`，以便 broker 能够访问 GCS 服务。`gcsManagedLedgerOffloadServiceAccountKeyFile` 是一个 Json 文件，包含服务账户的 GCS 凭证。[此页面的服务账户部分](https://support.google.com/googleapi/answer/6158849) 包含有关如何创建此密钥文件进行身份验证的更多信息。有关 google cloud IAM 的更多信息可在[此处](https://cloud.google.com/storage/docs/access-control/iam)获得。

要生成服务账户凭证或查看已生成的公共凭证，请按照以下步骤操作：

1. 打开[服务账户页面](https://console.developers.google.com/iam-admin/serviceaccounts)。
2. 选择一个项目或创建一个新项目。
3. 单击**创建服务账户**。
4. 在**创建服务账户**窗口中，键入服务账户的名称，然后选择**提供新的私钥**。如果你想[向服务账户授予 G Suite 域范围的权限](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#delegatingauthority)，还要选择**启用 G Suite 域范围委派**。
5. 单击**创建**。

:::note

确保你创建的服务账户有权限操作 GCS，你需要在此处为你的服务账户分配**存储管理员**权限。

:::

```conf
gcsManagedLedgerOffloadServiceAccountKeyFile="/Users/hello/Downloads/project-804d5e6a6f33.json"
```

#### 配置块读/写的大小

Pulsar 还提供了一些旋钮来配置发送到 GCS 的请求大小。

- `gcsManagedLedgerOffloadMaxBlockSizeInBytes` 配置多部分上传期间发送的"部分"的最大大小。这不能小于 5MB。默认为 64MB。
- `gcsManagedLedgerOffloadReadBufferSizeInBytes` 配置从 GCS 读回数据时每次单独读取的块大小。默认为 1MB。

在这两种情况下，除非你知道自己在做什么，否则不应该调整这些值。

### "filesystem" 驱动程序配置

#### 配置连接地址

你可以在 `broker.conf` 文件中配置连接地址。

```conf
fileSystemURI="hdfs://127.0.0.1:9000"
```

#### 配置 Hadoop 配置文件路径

配置文件存储在 Hadoop 配置文件路径中。它包含各种设置，如基本路径、身份验证等。

```conf
fileSystemProfilePath="../conf/filesystem_offload_core_site.xml"
```

存储主题数据的模型使用 `org.apache.hadoop.io.MapFile`。你可以使用 `org.apache.hadoop.io.MapFile` 中的所有配置用于 Hadoop。

**示例**

```xml
    <property>
        <name>fs.defaultFS</name>
        <value></value>
    </property>

    <property>
        <name>hadoop.tmp.dir</name>
        <value>pulsar</value>
    </property>

    <property>
        <name>io.file.buffer.size</name>
        <value>4096</value>
    </property>

    <property>
        <name>io.seqfile.compress.blocksize</name>
        <value>1000000</value>
    </property>
    <property>

        <name>io.seqfile.compression.type</name>
        <value>BLOCK</value>
    </property>

    <property>
        <name>io.map.index.interval</name>
        <value>128</value>
    </property>
```

有关 `org.apache.hadoop.io.MapFile` 中配置的更多信息，请参阅[文件系统存储](http://hadoop.apache.org/)。

## 配置自动运行卸载

可以配置命名空间策略，以便在达到阈值时自动卸载数据。阈值基于主题在 pulsar 集群上存储的数据大小。一旦主题达到阈值，将触发卸载操作。将阈值设置为负值将禁用自动卸载。将阈值设置为 0 将导致 broker 尽可能快地卸载数据。

```bash
bin/pulsar-admin namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

> 自动卸载在向主题日志添加新段时运行。如果你在命名空间上设置阈值，但向主题产生的消息很少，卸载将不会进行，直到当前段已满。

## 配置卸载消息的读取优先级

默认情况下，一旦消息被卸载到长期存储，broker 将从长期存储读取它们，但消息仍然存在于 bookkeeper 中一段时间，这取决于管理员的配置。对于同时存在于 bookkeeper 和长期存储中的消息，如果希望优先从 bookkeeper 读取，可以使用命令更改此配置。

```bash
# -orp 的默认值为 tiered-storage-first
bin/pulsar-admin namespaces set-offload-policies my-tenant/my-namespace -orp bookkeeper-first
bin/pulsar-admin topics set-offload-policies my-tenant/my-namespace/topic1 -orp bookkeeper-first
```

## 手动触发卸载

可以通过 Pulsar broker 上的 REST 端点手动触发卸载。我们提供一个 CLI，它将为你调用此 rest 端点。

触发卸载时，你必须指定将在本地 bookkeeper 上保留的积压的最大大小（以字节为单位）。卸载机制将从主题积压的开始处卸载段，直到满足此条件。

```bash
bin/pulsar-admin topics offload --size-threshold 10M my-tenant/my-namespace/topic1
Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
```

触发卸载的命令不会等待卸载操作完成。要检查卸载的状态，请使用 offload-status。

```bash
bin/pulsar-admin topics offload-status my-tenant/my-namespace/topic1
Offload is currently running
```

要等待卸载完成，请添加 -w 标志。

```bash
bin/pulsar-admin topics offload-status -w my-tenant/my-namespace/topic1
Offload was a success
```

如果卸载时出现错误，错误将传播到 offload-status 命令。

```bash
bin/pulsar-admin topics offload-status persistent://public/default/topic1
Error in offload
null

Reason: Error offloading: org.apache.bookkeeper.mledger.ManagedLedgerException: java.util.concurrent.CompletionException: com.amazonaws.services.s3.model.AmazonS3Exception: Anonymous users cannot initiate multipart uploads.  Please authenticate. (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied; Request ID: 798758DE3F1776DF; S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=), S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=
```