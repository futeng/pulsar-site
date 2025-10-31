---
author: Sijie Guo
authorURL: https://twitter.com/sijieg
title: "Apache Pulsar 2.1.0-incubating"
---

我们很高兴地发布 Pulsar 全新的 2.1.0-incubating 版本。
这个版本是 2 个月工作的成果，为 Pulsar 带来了多个新功能和改进。

在 Pulsar 2.1 中，您将看到：

- [Pulsar IO](/docs/io-overview) 连接器框架和一系列[内置连接器](/docs/io-connectors)
- [PIP-17](https://github.com/apache/incubator-pulsar/wiki/PIP-17:-Tiered-storage-for-Pulsar-topics)：[分层存储](/docs/concepts-tiered-storage)
- Pulsar [有状态函数](/docs/functions-state)
- [Go 客户端](/docs/client-libraries-go)
- [Avro](https://github.com/apache/incubator-pulsar/blob/v2.1.0-incubating/pulsar-client-schema/src/main/java/org/apache/pulsar/client/impl/schema/AvroSchema.java)
  和 [Protobuf](https://github.com/apache/incubator-pulsar/blob/v2.1.0-incubating/pulsar-client-schema/src/main/java/org/apache/pulsar/client/impl/schema/ProtobufSchema.java) Schema

详细信息请查看详细的[发布说明](/release-notes/#2.1.0-incubating)和[2.1.0 文档](/versions)。

<!--truncate-->

我们将在下面的部分中简要概述这些功能。

## Pulsar IO

自从 Pulsar 2.0 以来，我们引入了一个受无服务器启发的轻量级计算框架 [Pulsar Functions](/docs/functions-overview)，
提供了实现任何复杂度的应用特定流内处理逻辑的最简单方法。许多开发者喜欢 Pulsar Functions，因为它们需要最少的样板代码，并且易于理解。

在 Pulsar 2.1 中，我们继续遵循这个"简单优先"的原则来开发 Pulsar。我们在 Pulsar Functions 之上开发了这个 IO（输入/输出）连接器
框架，以简化数据进出 Apache Pulsar 的过程。您不需要编写任何一行代码。
您只需要准备一个想要连接的系统的配置文件，并使用 Pulsar admin
CLI 提交一个连接器到 Pulsar。Pulsar 将处理所有其他事情，如容错、重新平衡等。

2.1 版本中发布了 6 个内置连接器。它们是：

- [Aerospike 连接器](/docs/io-aerospike/)
- [Cassandra 连接器](/docs/io-cassandra/)
- [Kafka 连接器](/docs/io-kafka/)
- [Kinesis 连接器](/docs/io-kinesis/)
- [RabbitMQ 连接器](/docs/io-rabbitmq/)
- [Twitter Firehose 连接器](/docs/io-twitter/)

您可以按照[教程](/docs/io-quickstart)尝试使用 Pulsar IO 连接 Pulsar 与 [Apache Cassandra](http://cassandra.apache.org/)。

更多连接器将在未来的版本中推出。如果您有兴趣为 Pulsar 贡献一个连接器，请查看[开发连接器指南](/docs/io-develop)。
它就像编写一个 Pulsar 函数一样简单。

## 分层存储

Apache Pulsar 的优势之一是[其分段存储](https://streaml.io/blog/pulsar-segment-based-architecture)使用 [Apache BookKeeper](https://bookkeeper.apache.org/)。您可以存储任意大的主题积压。
当集群开始空间不足时，您只需添加另一个存储节点，系统将自动
获取新的存储节点并开始使用它们，而无需重新平衡分区。然而，一段时间后这可能会开始变得昂贵。

Pulsar 通过提供分层存储来缓解这种成本/大小的权衡。分层存储将您的 Pulsar 主题变成真正的*无限*流，
通过将较旧的段卸载到长期存储中，如 AWS S3、GCS 和 HDFS，这些存储是为存储冷数据而设计的。对于最终用户来说，
消费存储在 BookKeeper 或长期存储中的数据的流之间没有可感知的差异。所有底层的
卸载机制和元数据管理对应用程序都是透明的。

目前 2.1 版本支持 [S3](https://aws.amazon.com/s3/)。更多卸载器（如 Google GCS、Azure Blobstore 和 HDFS）将在未来的版本中推出。

如果您对这个功能感兴趣，您可以查看更多细节[这里](/docs/cookbooks-tiered-storage)。

## 有状态函数

流处理引擎面临的最大挑战是管理*状态*。Pulsar Functions 也是如此。由于 Pulsar Functions 的目标
是简化开发流原生处理逻辑，我们也想为 Pulsar Functions 提供一种更简单的方式来管理它们的状态。
我们为 Pulsar Functions 引入了一组[状态 API](/docs/functions-state/#api) 来存储它们的状态。它与 Apache BookKeeper 中的表服务集成来存储状态。

它作为开发者预览功能在 Pulsar Functions Java SDK 中发布。我们希望收集反馈以在未来的版本中改进它。

## Schema

Pulsar 2.0 引入了 Pulsar 中对 Schema 的原生支持。这意味着您可以声明消息数据的样子，并让 Pulsar 强制执行
生产者只能在主题上发布有效数据。在 2.0 版本中，Pulsar 只支持 `String`、`bytes` 和 `JSON` schema。我们在这个版本中引入了对
[Avro](https://avro.apache.org/) 和 [Protobuf](https://developers.google.com/protocol-buffers/) 的支持。

## 客户端

我们在 2.1 版本中引入了一个新的 [Go](/docs/client-libraries-go) 客户端。Pulsar Go 客户端库基于 [C++](/docs/client-libraries-cpp/) 客户端库。

按照[说明](/docs/client-libraries-go/#installing-go-package)在您的 Go 应用程序中尝试它！