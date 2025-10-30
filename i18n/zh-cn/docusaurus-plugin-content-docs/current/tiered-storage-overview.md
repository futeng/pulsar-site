---
id: tiered-storage-overview
title: Overview of tiered storage
sidebar_label: "Overview"
description: Get a comprehensive understanding of use cases, installation methods, and working principles of Pulsar tiered storage.
---

Pulsar 的**分层存储**功能允许将较旧的积压数据从 BookKeeper 移动到长期且更便宜的存储，同时仍然允许客户端访问积压，就像什么都没有改变一样。

* 分层存储使用 [Apache jclouds](https://jclouds.apache.org) 支持 [Amazon S3](https://aws.amazon.com/s3/)、[GCS (Google Cloud Storage)](https://cloud.google.com/storage/)、[Azure](https://azure.microsoft.com/en-us/services/storage/blobs/) 和 [阿里云 OSS](https://www.aliyun.com/product/oss) 进行长期存储。
  * 阅读如何[将 AWS S3 卸载器与 Pulsar 一起使用](tiered-storage-aws.md)；
  * 阅读如何[将 GCS 卸载器与 Pulsar 一起使用](tiered-storage-gcs.md)；
  * 阅读如何[将 Azure BlobStore 卸载器与 Pulsar 一起使用](tiered-storage-azure.md)；
  * 阅读如何[将阿里云 OSS 卸载器与 Pulsar 一起使用](tiered-storage-aliyun.md)；
  * 阅读如何[将 S3 卸载器与 Pulsar 一起使用](tiered-storage-s3.md)。
* 分层存储使用 [Apache Hadoop](http://hadoop.apache.org/) 支持文件系统进行长期存储。
  * 阅读如何[将文件系统卸载器与 Pulsar 一起使用](tiered-storage-filesystem.md)。

:::tip

[AWS S3 卸载器](tiered-storage-aws.md) 注册特定的 AWS 元数据，如区域和服务 URL，并在执行任何操作之前请求存储桶位置。如果您无法访问 Amazon 服务，可以改用 [S3 卸载器](tiered-storage-s3.md)，因为它是一个没有元数据的 S3 兼容 API。

:::


## 何时使用分层存储？

当您有一个主题需要长时间保持很长的积压时，应该使用分层存储。

例如，如果您有一个包含用户操作的主题，用于训练您的推荐系统，您可能希望长时间保留该数据，以便如果您更改推荐算法，可以针对您的完整用户历史重新运行它。

## 如何安装分层存储卸载器？

Pulsar 发布了一个单独的二进制发行版，包含分层存储卸载器。要启用这些卸载器，您需要完成以下步骤。

1. 下载卸载器压缩包版本。

```bash
wget pulsar:offloader_release_url
```

2. 解压缩卸载器包，并将卸载器作为 `offloaders` 复制到 pulsar 目录中。

```bash
tar xvfz apache-pulsar-offloaders-@pulsar:version@-bin.tar.gz
mv apache-pulsar-offloaders-@pulsar:version@/offloaders offloaders

ls offloaders
# tiered-storage-file-system-@pulsar:version@.nar
# tiered-storage-jcloud-@pulsar:version@.nar
```

有关如何配置分层存储的更多信息，请参阅[分层存储手册](cookbooks-tiered-storage.md)。

:::note

* 如果您在裸机集群中运行 Pulsar，请确保 `offloaders` 压缩包在每个 broker 的 pulsar 目录中解压缩。
* 如果您[在 Docker 中运行 Pulsar](getting-started-docker.md)或使用 docker 映像（例如 [K8S](deploy-kubernetes.md)）部署 Pulsar，您可以使用 `apachepulsar/pulsar-all` 映像而不是 `apachepulsar/pulsar` 映像。`apachepulsar/pulsar-all` 映像已经捆绑了分层存储卸载器。

:::

## 分层存储如何工作？

Pulsar 中的主题由一个**日志**支持，称为**Managed Ledger**。该日志由有序的段列表组成。Pulsar 只写入日志的最后一个段。所有先前的段都被封存。段内的数据是不可变的。这被称为**段导向架构**。

![Pulsar 中的分层存储](/assets/pulsar-tiered-storage.png "Tiered Storage")

分层存储的工作原理如下：

1. 分层存储卸载机制利用段导向架构。

  当请求卸载时，日志的段一个一个地复制到分层存储。写入分层存储的日志的所有段（当前段除外）都可以被卸载。

2. 写入 BookKeeper 的数据默认复制到 3 台物理机器。

  但是，一旦段在 BookKeeper 中被封存，它就变得不可变，并且可以复制到长期存储。长期存储有潜力实现显著的成本节约。

3. 在将 ledger 卸载到长期存储之前，您需要为云存储服务配置存储桶、凭证和其他属性。

4. 此外，Pulsar 使用多部分对象上传段数据，broker 在上传数据时可能会崩溃。

  建议您为存储桶添加生命周期规则，在一两天后使不完整的多部分上传过期，以避免为不完整的上传付费。

5. 此外，您可以手动（通过 REST API 或 CLI）或自动（通过 CLI）触发卸载操作。

6. 将 ledger 转移到长期存储后，这些 ledger 中的消息仍然可供 Pulsar 消费者和读取器访问，确保数据检索的透明性。

有关 Pulsar 主题的分层存储的更多信息，请参阅 [PIP-17](https://github.com/apache/pulsar/wiki/PIP-17:-Tiered-storage-for-Pulsar-topics) 和[卸载指标](reference-metrics.md#offload-metrics)。