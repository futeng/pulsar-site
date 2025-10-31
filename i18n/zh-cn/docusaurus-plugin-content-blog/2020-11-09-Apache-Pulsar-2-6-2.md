---
author: Xiaolong Ran
authorURL: https://twitter.com/wolf4j1
title: "Apache Pulsar 2.6.2"
---
我们很高兴地看到 Apache Pulsar 社区经过大量努力工作，成功发布了 2.6.2 版本。对于这个快速发展的项目和 Pulsar 社区来说，这是一个重要的里程碑。2.6.2 版本是社区巨大努力的成果，包含了超过 154 个提交以及一系列改进和错误修复。

以下是 Pulsar 2.6.2 中的一些亮点和主要功能。

<!--truncate-->

## Broker

### 启动 Pulsar 时捕获 `throwable`

在 2.6.2 之前，Pulsar 只在 `BrokerStarter.start()` 失败时捕获异常。一些错误如 `NoSuchMethodError` 或 `NoClassDefFoundError` 无法被捕获，Pulsar 处于异常状态，但在日志文件中找不到错误日志。

在 2.6.2 中，我们修改异常使用 `throwable` 来避免这个问题。

有关实现的更多信息，请参见 [PR-7221](https://github.com/apache/pulsar/pull/7221)。

### 在 resetCursor API 中处理 SubscriptionBusyException

在 `PersistentSubscription.resetCursor` 方法中，在多个地方抛出 `SubscriptionFencedException`，但在 `PersistentTopicBase` 中没有处理，因此错误消息不清楚。

在 2.6.2 中，我们在 `PersistentTopicBase` 中为 `resetCursor` 导出 `SubscriptionBusyException`，因此 REST API 中的错误消息很清楚。

有关实现的更多信息，请参见 [PR-7335](https://github.com/apache/pulsar/pull/7335)。

### 更新 Jersey 到 2.31

在 2.6.1 之前，Pulsar 使用 Jersey 2.27，这存在安全问题。在 Pulsar 2.6.2 中，我们将 Jersey 版本更新到最新的稳定版本（2.31）以增强安全性。

有关实现的更多信息，请参见 [PR-7515](https://github.com/apache/pulsar/pull/7515)。

### 当使用 Key_Shared 订阅的消费者卡住时停止分发

使用 `Key_Shared` 订阅的消费者偶尔会遇到消息无序的情况。以下是重现这种情况的步骤：

1. 连接 Consumer1 到 Key_Shared 订阅 `sub` 并停止接收
  - receiverQueueSize: 500
2. 连接 Producer 并发布 500 条带有 key `(i % 10)` 的消息
3. 连接 Consumer2 到相同订阅并开始接收
  - receiverQueueSize: 1
  - 自 https://github.com/apache/pulsar/pull/7106 起，Consumer2 无法接收（符合预期）
4. Producer 发布更多 500 条使用相同密钥生成算法的消息
5. 之后，Consumer1 开始接收
6. 检查 Consumer2 消息顺序
  - 有时相同 key 的消息顺序被破坏

在 2.6.2 中，当消费者使用 Key_Shared 订阅时，Pulsar 停止向卡住的消费者分发消息，以保证消息顺序。

有关实现的更多信息，请参见 [PR-7553](https://github.com/apache/pulsar/pull/7553)。

### 重新建立命名空间 bundle 所有权，从假阴性释放和假阳性获取中恢复

在获取/释放命名空间 bundle 所有权时，ZooKeeper 可能在这些操作持久化到 ZooKeeper 集群之前或之后断开连接。这导致本地所有权缓存和 ZooKeeper 集群之间的不一致。

在 2.6.2 中，我们通过以下方式修复此问题：

* 在所有权释放中，失败时不保留所有权。
* 在所有权检查、查询和获取中，重新建立在假阴性释放和假阳性获取中丢失的所有权。

有关实现的更多信息，请参见 [PR-7773](https://github.com/apache/pulsar/pull/7773)。

### 启用用户配置执行器池大小

在 2.6.2 之前，Pulsar 中的执行器池大小在启动 Pulsar 服务时设置为 `20`。用户无法配置执行器池大小。

```

private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(20,
           new DefaultThreadFactory("pulsar"));

```

在 2.6.2 中，用户可以根据需要在 `broker.conf` 文件中配置执行器池大小。

有关实现的更多信息，请参见 [PR-7782](https://github.com/apache/pulsar/pull/7782)。

### 为 `checkInactiveSubscriptions` 添加复制检查

复制订阅被 `checkInactiveSubscriptions` 删除后，通过 `receiveSubscriptionUpdated` 创建复制订阅。在这种情况下，位置变为最新位置。

```

topic.createSubscription(update.getSubscriptionName(),
        InitialPosition.Latest, true /* replicateSubscriptionState */);

```

在 2.6.2 中，通过修复 `PersistentTopic`，复制订阅被排除在自动删除之外。

有关实现的更多信息，请参见 [PR-8066](https://github.com/apache/pulsar/pull/8066)。

### 升级 jetty-util 版本到 9.4.31

Pulsar 客户端依赖于 jetty-util。早于 9.4.30 的 jetty-util 版本包含已知漏洞。

在 2.6.2 中，我们将 jetty-util 版本升级到 `9.4.31` 以增强安全性。

有关实现的更多信息，请参见 [PR-8035](https://github.com/apache/pulsar/pull/8035)。

### 添加命令从 ZooKeeper 删除集群元数据

当我们在多个 broker 集群之间共享相同的 ZooKeeper 和 BookKeeper 集群时，如果一个集群被删除，其在 ZooKeeper 中的元数据也会被删除。

在 2.6.2 中，我们通过以下方式修复此问题：

- 添加 `PulsarClusterMetadataTeardown` 类从 ZooKeeper 删除相关节点；
- 将类包装到 `bin/pulsar` 脚本中。

有关实现的更多信息，请参见 [PR-8169](https://github.com/apache/pulsar/pull/8169)。

### 用 ThreadPoolExecutor 替换 EventLoop 以提高性能而不是 EventLoop

在 2.6.2 中，我们用原生 JDK 线程池（ThreadPoolExecutor）替换 EventLoop 以提高性能。

以下是使用 pulsar perf 的测试结果。

2.6.1 之前：

```

聚合吞吐量统计 --- 接收到 11715556 条记录 --- 68813.420 msg/s --- 537.605 Mbit/s

```

在 2.6.2 中：

```

聚合吞吐量统计 --- 接收到 18392800 条记录 --- 133314.602 msg/s --- 1041.520 Mbit/s

```

有关实现的更多信息，请参见 [PR-8208](https://github.com/apache/pulsar/pull/8208)。

### 修复主题所有权检查期间发生的死锁

一些 broker 服务器在拆分命名空间 bundle 时出现死锁。当检查 broker 的线程转储时，一些线程被阻塞在 `NamespaceService#getBundle()` 中。

```

"pulsar-ordered-OrderedExecutor-7-0" #34 prio=5 os_prio=0 tid=0x00007eeeab05a800 nid=0x81a5 waiting on condition [0x00007eeeafbd2000]
  java.lang.Thread.State: WAITING (parking)
       at sun.misc.Unsafe.park(Native Method)
       - parking to wait for  <0x00007f17fa965418> (a java.util.concurrent.CompletableFuture$Signaller)
       at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
       at org.apache.pulsar.common.naming.NamespaceBundleFactory.getBundles(NamespaceBundleFactory.java:155)
...

```

问题的原因是 `getBundle()` 方法导致 `NamespaceService#isTopicOwned()` 中的死锁。为了修复此问题，我们删除了 `getBundle()` 方法。当 `isTopicOwned()` 返回 `false` 时，bundle 元数据被缓存并可以异步获取。当客户端下次重新连接时，Pulsar 从缓存返回正确的 bundle 元数据。

有关实现的更多信息，请参见 [PR-8406](https://github.com/apache/pulsar/pull/8406)。

## Proxy

### 启用用户在代理中配置 `advertisedAddress`

在 2.6.2 之前，用户无法在代理端配置 `advertisedAddress`。在 2.6.2 中，用户可以在代理中配置 `advertisedAddress`，就像在 Pulsar broker 中一样。

有关实现的更多信息，请参见 [PR-7542](https://github.com/apache/pulsar/pull/7542)。

### 添加代理插件接口以支持用户定义的额外 servlet

为了使用户能够灵活访问 broker，Pulsar 提供了类似于 broker 协议和 broker 拦截器的插件。但是，在 2.6.2 之前用户无法访问代理。

为了使用户能够在代理中自定义数据请求，我们在 2.6.2 中为代理添加了协议插件。

有关实现的更多信息，请参见 [PR-8067](https://github.com/apache/pulsar/pull/8067)。

### 修复启动代理服务时的空异常

当启用 broker TLS 和使用 OAuth2 插件的 broker 客户端认证时，
代理服务以意外的空异常退出。

原因是在初始化流时调用了认证，因此在使用之前令牌客户端没有初始化。

在 2.6.2 中，我们修复了启动代理服务时的空异常。

有关实现的更多信息，请参见 [PR-8019](https://github.com/apache/pulsar/pull/8019)。

## Java Client

### 支持信任存储证书的输入流

在 2.6.1 中，Pulsar 支持通过为 TLS 证书和密钥文件使用输入流来动态加载证书。此功能主要由容器使用。但是，容器也需要对信任存储证书进行动态加载，并且用户无法将信任存储证书存储到文件系统中。

在 2.6.2 中，Pulsar 支持使用输入流动态加载信任存储证书。

有关实现的更多信息，请参见 [PR-7442](https://github.com/apache/pulsar/pull/7442)。

### 避免订阅相同主题

当前 `MultiTopicsConsumerImpl.topics` 的关键是用户传递的主题名称。`topicNameValid` 方法检查名称是否有效以及 `topics` 不包含该键。

但是，如果多主题消费者订阅已订阅分区主题的分区，`subscribeAsync` 成功并创建相同分区的新的 `ConsumerImpl`，这是冗余的。

此外，如果多主题消费者订阅 `public/default/topic` 或 `persistent://public/default/topic`，而初始订阅的主题是 `topic`，则会创建冗余的消费者。

在 2.6.2 中，我们通过以下方式修复此问题以避免再次订阅相同主题：

- 使用完整主题名称作为 `MultiTopicsConsumerImpl.topics` 的键。
- 调用 `subscribeAsync` 时，检查完整主题名称和完整分区主题名称都不存在于 `MultiTopicsConsumerImpl.topics` 中。
- 对不同主题抛出不同异常：主题无效和主题已订阅

有关实现的更多信息，请参见 [PR-7823](https://github.com/apache/pulsar/pull/7823)。

## CPP Client

### 等待所有查找操作完成

当分区消费者调用 `seek` 时，它只等待一个分区的查找操作完成，因为每个内部消费者调用 callback(result) 来完成相同的 promise。

在 2.6.2 中，我们使用以下方法避免此问题：

- 添加 `MultiResultCallback` 实现，回调仅在所有 N 个事件成功完成或 N 个事件中的一个失败时完成。
- 使用 `MultiResultCallback` 包装来自 `PartitionedConsumerImpl::seekAsync` 的回调。

有关实现的更多信息，请参见 [PR-7216](https://github.com/apache/pulsar/pull/7216)。

### 使 `clear()` 线程安全

在 2.6.2 之前，`BatchAcknowledgementTracker` 和 `UnAckedMessageTrackerEnabled` 的 `clear()` 方法不是线程安全的。

在 2.6.2 中，我们在这些 `clear()` 方法中获取互斥锁以使其线程安全。

有关实现的更多信息，请参见 [PR-7862](https://github.com/apache/pulsar/pull/7862)。

### 将 Snappy 库添加到用于构建 C++ 包的 Docker 镜像

当在打包为 RPM/DEB 的 C++ 客户端上启用 Snappy 压缩时程序崩溃。这是因为构建 RPM/DEB 包的 Docker 镜像中不包含 Snappy 库。

在 2.6.2 中，我们将 Snappy 库添加到 docker 镜像以避免此问题。

有关实现的更多信息，请参见 [PR-8086](https://github.com/apache/pulsar/pull/8086)。

### 支持基于键的批处理

为 C++ 客户端支持基于键的批处理。此外，当前 `BatchMessageContainer` 的实现与 `ProducerImpl` 紧密耦合。批消息容器向生产者的执行器注册计时器，超时回调也是生产者的方法。甚至其 `add` 方法也可以调用 `sendMessage` 将批次发送到生产者的待处理队列。这些应该是生产者的工作。

在 2.6.2 中，我们通过以下方式实现此功能：

- 添加 `MessageAndCallbackBatch` 来存储序列化单条消息的 `MessageImpl` 和回调列表。
- 添加 `BatchMessageContainerBase` 来提供接口方法和更新/清除消息数量/字节、创建 `OpSendMsg` 等方法。
- 让 `ProducerImpl` 管理批处理计时器并确定是否从 `BatchMessageContainerBase` 创建 `OpSendMsg` 并发送它。
- 使 `BatchMessageContainer` 继承 `BatchMessageContainerBase`，它只管理一个 `MessageAndCallbackBatch`。
- 添加继承 `BatchMessageContainerBase` 的 `BatchMessageKeyBasedContainer`，它管理消息键和 `MessageAndCallbackBatch` 的映射。
- 添加生产者配置以更改批处理类型。

有关实现的更多信息，请参见 [PR-7996](https://github.com/apache/pulsar/pull/7996)。

## Functions

### 启用 Kubernetes 运行时以自定义函数实例类路径

在 2.6.2 之前，函数工作器的类路径用于配置函数实例（运行器）的类路径。当 broker（函数工作器）使用与函数实例（运行器）不同的镜像进行 Kubernetes 运行时时，类路径是错误的，函数实例无法加载实例类。

在 2.6.2 中，我们向 Kubernetes 运行时配置添加函数实例类路径条目，并相应地构造函数启动命令。

有关实现的更多信息，请参见 [PR-7844](https://github.com/apache/pulsar/pull/7844)。

### 将 Kubernetes 运行时的 `dryrun` 设置为 null

在 2.6.2 之前，我们将 Kubernetes 的 `client-java` 升级到 `0.9.2` 以增强安全性。但是，在创建 statefulsets、secrets 和 services 期间，`dryrun` 的值设置为 `true`，这不被 Kubernetes 接受。在 Kubernetes 中只允许 `All`。

在 2.6.2 中，我们将 Kubernetes 运行时的 `dryrun` 设置为 null。

有关实现的更多信息，请参见 [PR-8064](https://github.com/apache/pulsar/pull/8064)。

## Pulsar SQL

### 升级 Presto 版本到 332

将 Presto 版本升级到 332。解决 prestosql 和 prestodb 之间的不同包问题。虽然最新版本是 334，但高于 333 的版本需要 Java 11。

有关实现的更多信息，请参见 [PR-7194](https://github.com/apache/pulsar/pull/7194)。

## pulsar-admin

### 添加 CLI 命令以获取最后消息 ID

在 CLI 中添加 `last-message-id` 命令，因此用户可以使用此命令获取最后消息 ID。

有关实现的更多信息，请参见 [PR-8082](https://github.com/apache/pulsar/pull/8082)。

### 支持删除主题时删除 schema ledgers

用户无法使用 REST API 中的 `PersistentTopics#deleteTopic` 和 `PersistentTopics#deletePartitionedTopic` 删除主题的 schema。主题被删除后，schema ledgers 仍然存在，添加了空的 schema ledger。

在 2.6.2 中，我们通过以下方式实现此功能：

- 向删除主题/分区主题的 REST API 添加 `deleteSchema` 查询参数；
- 在 `BookkeeperSchemaStorage` 中添加映射以记录创建的 ledgers；
- 在 pulsar-admin API 中公开 `deleteSchema` 参数；
- 使用 `-a` 选项删除集群时删除 schema ledgers。

有关实现的更多信息，请参见 [PR-8167](https://github.com/apache/pulsar/pull/8167)。

### 支持删除与集群关联的所有数据

当多个 broker 集群共享相同的 bookie 集群时，如果用户想要删除一个 broker 集群，bookies 中的关联 ledgers 不会按预期删除。

在 2.6.2 中，我们添加 `cluster delete` 命令以使用户能够删除与集群关联的所有数据。

有关实现的更多信息，请参见 [PR-8133](https://github.com/apache/pulsar/pull/8133)。

## Pulsar Perf

### 启用用户在 pulsar-perf 中配置 ioThread 数量

在 pulsar-perf 中，默认的 Pulsar 客户端 ioThread 数量是 `Runtime.getRuntime().availableProcessors()`，用户无法在命令行中配置它。当运行 pulsar-perf 生产者时，可能导致消息入队竞争并导致高延迟。

在 2.6.2 中，我们通过以下方式实现此功能：

1. 启用用户在命令行中配置 ioThread 数量；
2. 将默认 ioThead 数量从 `Runtime.getRuntime().availableProcessors()` 更改为 `1`

有关实现的更多信息，请参见 [PR-8090](https://github.com/apache/pulsar/pull/8090)。

## 更多信息

- 要下载 Apache Pulsar 2.6.2，请点击[下载](https://pulsar.apache.org/download/)。
- 有关 Apache Pulsar 2.6.2 的更多信息，请参见 [2.6.2 发布说明](https://pulsar.apache.org/release-notes/#2.6.2) 和 [2.6.2 PR 列表](https://github.com/apache/pulsar/pulls?q=is%3Apr+label%3Arelease%2F2.6.2+is%3Aclosed)。

如果您有任何问题或建议，请通过邮件列表或 slack 联系我们。

- [users@pulsar.apache.org](mailto:users@pulsar.apache.org)
- [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org)
- Pulsar slack 频道: https://apache-pulsar.slack.com/
- 在 https://apache-pulsar.herokuapp.com/ 自行注册

期待您对 [Pulsar](https://github.com/apache/pulsar) 的贡献。