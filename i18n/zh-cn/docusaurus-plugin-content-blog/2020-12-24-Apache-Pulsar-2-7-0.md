---
author: Penghui Li
authorURL: https://twitter.com/lipenghui6
title: "Apache Pulsar 2.7.0"
---
我们很高兴地看到 Apache Pulsar 社区经过积累的辛勤工作，成功发布了精彩的 2.7.0 版本。对于这个快速发展的项目和整个 Pulsar 社区来说，这是一个重要的里程碑。这是社区巨大努力的成果，包含了超过 450 个提交以及一系列新功能、改进和错误修复。

以下是 Pulsar 2.7.0 中添加的最有趣和主要功能的精选内容。

<!--truncate-->

## 主要功能

### 事务支持

事务语义使事件流处理应用程序能够在一个原子操作中消费、处理和生成消息。通过事务，Pulsar 实现了单分区和多分区的精确一次语义。这使得 Pulsar 能够支持新的用例，其中客户端（无论是作为生产者还是消费者）可以处理跨多个主题和分区的消息，并确保这些消息都将作为单个单元处理。这将加强 Apache Pulsar 的消息传递语义和 Pulsar Functions 的处理保证。

目前，Pulsar 事务处于开发者预览版。社区将进一步努力增强此功能，以便尽快在生产环境中使用。

要在 Pulsar 中启用事务，您需要在 `broker.conf` 文件中配置参数。

```

transactionCoordinatorEnabled=true

```

初始化事务协调器元数据，以便事务协调器可以利用分区主题的优势，如负载均衡。

```

bin/pulsar initialize-transaction-coordinator-metadata -cs 127.0.0.1:2181 -c standalone

```

从客户端，您也可以为 Pulsar 客户端启用事务。

```java

PulsarClient pulsarClient = PulsarClient.builder()
        .serviceUrl("pulsar://localhost:6650")
        .enableTransaction(true)
        .build();

```

这是一个演示 Pulsar 事务的示例。

```java

// 打开一个事务
Transaction txn = pulsarClient
        .newTransaction()
        .withTransactionTimeout(5, TimeUnit.MINUTES)
        .build()
        .get();

// 使用事务发布消息
producer.newMessage(txn).value("Hello Pulsar Transaction".getBytes()).send();

// 使用事务消费和确认消息
Message<byte[]> message = consumer.receive();
consumer.acknowledgeAsync(message.getMessageId(), txn);

// 提交事务
txn.commit()

```

有关 Pulsar 事务的更多详细信息，请参考[这里](http://pulsar.apache.org/docs/en/transactions/)。有关 Pulsar 事务设计的更多详细信息，请参考[这里](https://github.com/apache/pulsar/wiki/PIP-31%3A-Transaction-Support)。

### 主题级别策略

Pulsar 2.7.0 引入了系统主题，它可以维护所有策略更改事件以实现主题级别策略。命名空间级别的所有策略现在在主题级别也可用，因此用户可以在主题级别灵活设置不同的策略，而无需使用大量元数据服务资源。主题级别策略使用户能够更灵活地管理主题，并且不给 ZooKeeper 增加负担。

要在 Pulsar 中启用主题级别策略，您需要在 `broker.conf` 文件中配置参数。

```

systemTopicEnabled=true
topicLevelPoliciesEnabled=true

```

启用主题级别策略后，您可以使用 Pulsar Admin 更新主题的策略。以下是设置特定主题数据保留的示例。

```

bin/pulsar-admin topics set-retention -s 10G -t 7d persistent://public/default/my-topic

```

有关系统主题和主题级别策略的更多详细信息，请参考[这里](https://github.com/apache/pulsar/wiki/PIP-39%3A-Namespace-Change-Events)

### 支持 Azure BlobStore 卸载器

在 Pulsar 2.7.0 中，我们添加了对 Azure BlobStore 卸载器的支持，允许用户将主题数据卸载到 Azure BlobStore。您可以在配置 `broker.conf` 文件中配置 Azure BlobStore 卸载器驱动程序。

```

managedLedgerOffloadDriver=azureblob

```

更多详细信息，请参考[这里](https://github.com/apache/pulsar/pull/8436)。

### 原生 protobuf schema 支持

Pulsar 2.7.0 引入了原生 protobuf schema 支持，为想要与 Pulsar 集成的 protobuf 用户提供更多能力。以下示例显示了如何在 Java 客户端中使用原生 protobuf schema：

```java

Consumer<PBMessage> consumer = client.newConsumer(Schema.PROTOBUFNATIVE(PBMessage.class))
.topic(topic)
.subscriptionName("my-subscription-name")
.subscribe();

```

更多详细信息，请参考[这里](https://github.com/apache/pulsar/pull/8372)。

### 资源限制

在 Pulsar 中，租户、命名空间和主题是集群的核心资源。Pulsar 2.7.0 使您能够限制集群的最大租户数、每个租户的最大命名空间数、每个命名空间的最大主题数以及每个主题的最大订阅数。

您可以在 `broker.conf` 文件中配置资源限制。

```

maxTenants=0
maxNamespacesPerTenant=0
maxTopicsPerNamespace=0
maxSubscriptionsPerTopic=0

```

这为 Pulsar 管理员在资源管理方面提供了极大的便利。

### 支持 Pulsar Functions 的端到端加密

Pulsar 2.7.0 使您能够为 Pulsar Functions 添加端到端（e2e）加密。您可以使用应用程序配置的公钥和私钥对来执行加密。只有具有有效密钥的消费者才能解密加密的消息。

要在 Functions Worker 上启用端到端加密，您可以通过在命令行终端中指定 `--producer-config` 来设置它。更多信息，请参考 [Pulsar 加密](http://pulsar.apache.org/docs/en/security-encryption/)。

更多详细信息，您可以查看[这里](https://github.com/apache/pulsar/pull/8432)

### 函数重新平衡

在 2.7.0 之前，没有机制来重新平衡 workers 上的函数调度器。函数的工作负载变得倾斜。Pulsar 2.7.0 支持手动触发函数重新平衡和自动定期函数重新平衡。

更多详细信息，请参考 https://github.com/apache/pulsar/pull/7388 和 https://github.com/apache/pulsar/pull/7449。

## 更多信息

- 要下载 Apache Pulsar 2.7.0，请点击[这里](https://pulsar.apache.org/download/)。
- 有关 Apache Pulsar 2.7.0 的更多信息，请参见 [2.7.0 发布说明](https://pulsar.apache.org/release-notes/#2.7.0) 和 [2.7.0 PR 列表](https://github.com/apache/pulsar/pulls?q=milestone%3A2.7.0+-label%3Arelease%2F2.6.2+-label%3Arelease%2F2.6.1+)。

如果您有任何问题或建议，请通过邮件列表或 slack 联系我们。

- [users@pulsar.apache.org](mailto:users@pulsar.apache.org)
- [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org)
- Pulsar slack 频道: https://apache-pulsar.slack.com/
- 在 https://apache-pulsar.herokuapp.com/ 自行注册

期待您对 [Apache Pulsar](https://github.com/apache/pulsar) 的贡献。