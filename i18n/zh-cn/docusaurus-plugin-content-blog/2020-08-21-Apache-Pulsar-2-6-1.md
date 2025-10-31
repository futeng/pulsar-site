---
author: XiaoLong Ran
authorURL: https://twitter.com/wolf4j1
title: "Apache Pulsar 2.6.1"
---
我们很高兴地看到 Apache Pulsar 社区经过大量努力工作，成功发布了 2.6.1 版本。对于这个快速发展的项目和 Pulsar 社区来说，这是一个重要的里程碑。2.6.1 版本是社区巨大努力的成果，包含了超过 100 个提交以及一系列改进和错误修复。

以下是 Pulsar 2.6.1 中的一些亮点和主要功能。

<!--truncate-->

## Broker

### 将批处理大小限制为 `maxNumberOfMessages` 和 `maxSizeOfMessages` 的最小值

1. 批处理大小不受 BatchReceive 策略中 `maxNumberOfMessages` 和 `maxSizeOfMessages` 最小值的限制。
2. 当批处理大小大于消费者的 `receiveQ` 时（例如，批处理大小为 3000，receiveQ 为 500），会出现以下问题：

	在多主题（模式）消费者中，客户端停止接收任何消息。当在批处理策略中设置超时时，客户端被暂停且永远不会恢复。只获取一个批次，客户端永远不会恢复。

有关实现的更多信息，请参见 [PR-6865](https://github.com/apache/pulsar/pull/6865)。

### 修复 Key_Shared 订阅中使用粘性哈希范围的哈希范围冲突问题
在使用 `stickyHashRange` 的 `Key_Shared` 订阅中，不允许消费者使用交错哈希。

该 pull request 修复了 `Key_Shared` 中使用粘性哈希范围的哈希范围冲突问题。

有关实现的更多信息，请参见 [PR-7231](https://github.com/apache/pulsar/pull/7231)。

### 修复获取查找权限错误

如果 `canProduce` 或 `canConsume` 方法抛出异常，`canLookup` 方法只是抛出异常而不检查其他权限。代码片段如下：

```java

try {
    return canLookupAsync(topicName, role, authenticationData)
            .get(conf.getZooKeeperOperationTimeoutSeconds(), SECONDS);
}

```

PR-7234 调用 `canLookupAsync`。当 Pulsar AuthorizationService 检查查找权限时，如果用户具有 `canProducer` 或 `canConsumer` 角色，用户可以执行 `canLookup` 操作。

有关实现的更多信息，请参见 [PR-7234](https://github.com/apache/pulsar/pull/7234)。

### 避免为托管游标引入空读取位置

避免为托管游标引入空读取位置。最可疑的是 `ManagedLedgerImpl` 中的 `getNextValidPosition` 方法。如果给定位置大于上次添加的位置，它返回 `null` 值，读取位置也为 `null`。

在这个 PR 中，我们添加了一个日志并打印堆栈跟踪以找到根本原因，如果下一个有效位置出现 `null`，则回退到下一个位置。

有关实现的更多信息，请参见 [PR-7264](https://github.com/apache/pulsar/pull/7264)。

### 修复创建非持久游标时的错误

当我们无法创建非持久游标并继续创建订阅实例时，会发生 NPE。

```java

try {
    cursor = ledger.newNonDurableCursor(startPosition, subscriptionName);
} catch (ManagedLedgerException e) {
    subscriptionFuture.completeExceptionally(e);
}

return new PersistentSubscription(this, subscriptionName, cursor, false);

```

此外，NPE 导致主题使用计数增加到 1。删除主题时，即使使用 force 标志也无法删除主题。

有关实现的更多信息，请参见 [PR-7355](https://github.com/apache/pulsar/pull/7355)。

### 避免在 `ManagedLedgerImpl.isOffloadedNeedsDelete` 方法中发生 NPE

当 `offload-deletion-lag` 的默认值设置为 `null` 时，会发生 NPE。为了修复这个错误，在 `ManagedLedgerImpl.isOffloadedNeedsDelete` 方法中添加了空值检查。

有关实现的更多信息，请参见 [PR-7389](https://github.com/apache/pulsar/pull/7389)。

### 修复创建新 ledger 时因 NPE 导致的生产者卡住问题

如果网络地址无法解析，创建 ledger 时会发生 NPE。如果在添加超时任务之前发生 NPE，超时机制不起作用。在 Kubernetes 环境中，无法解析的网络地址很常见。当 bookie pod 或工作节点重启时会发生这种情况。

这个 pull request 从以下角度修复：

1. 创建新 ledger 时捕获 NPE。
2. 当超时任务被触发时，它总是执行回调。这完全没问题，因为我们已经有逻辑确保回调只被触发一次。
3. 添加一个机制来检测 `CreatingLedger` 状态没有移动。

有关实现的更多信息，请参见 [PR-7401](https://github.com/apache/pulsar/pull/7401)。

### 修复使用 advertisedListeners 时的 NPE

当使用 `advertisedListeners=internal:pulsar://node1:6650,external:pulsar://node1.external:6650` 与外部监听器名称时，Broker 无法获得命名空间 bundle 的所有权。在未启用 TLS 时更正 `BrokerServiceUrlTls`。

有关实现的更多信息，请参见 [PR-7620](https://github.com/apache/pulsar/pull/7620)。

### 修复禁用消息去重后去重游标无法删除的问题

当在 `broker.conf` 文件中启用消息去重，然后禁用它并重启 broker 时，去重游标不会被删除。

此 PR 修复了该问题，因此当您禁用消息去重时，可以删除去重游标。

有关实现的更多信息，请参见 [PR-7656](https://github.com/apache/pulsar/pull/7656)。

### 修复 GetLastEntry() 读取条目 `-1` 的问题

以前，代码不包含 return 语句。如果条目设置为 `-1`，发送代码后，响应读取条目并发送第二个响应，如下例所示。

```

16:34:25.779 [pulsar-io-54-7:org.apache.bookkeeper.client.LedgerHandle@748] ERROR org.apache.bookkeeper.client.LedgerHandle - IncorrectParameterException on ledgerId:0 firstEntry:-1 lastEntry:-1
16:34:25.779 [pulsar-client-io-82-1:org.apache.pulsar.client.impl.ConsumerImpl@1986] INFO  org.apache.pulsar.client.impl.ConsumerImpl - [persistent://external-repl-prop/pulsar-function-admin/assignment][c-use-fw-localhost-0-function-assignment-initialize-reader-b21f7607c9] Successfully getLastMessageId 0:-1
16:34:25.779 [pulsar-client-io-82-1:org.apache.pulsar.client.impl.ClientCnx@602] WARN  org.apache.pulsar.client.impl.ClientCnx - [id: 0xc78f4a0e, L:/127.0.0.1:55657 - R:localhost/127.0.0.1:55615] Received error from server: Failed to get batch size for entry org.apache.bookkeeper.mledger.ManagedLedgerException: Incorrect parameter input
16:34:25.779 [pulsar-client-io-82-1:org.apache.pulsar.client.impl.ClientCnx@612] WARN  org.apache.pulsar.client.impl.ClientCnx - [id: 0xc78f4a0e, L:/127.0.0.1:55657 - R:localhost/127.0.0.1:55615] Received unknown request id from server: 10

```

PR-7495 向代码添加了 return 语句，因此 GetLastEntry() 读取最后一个条目，而不是 `-1`。

有关实现的更多信息，请参见 [PR-7495](https://github.com/apache/pulsar/pull/7495)。

### 修复更新非持久主题分区时的错误

在非持久主题上更新分区时，返回错误 409。该 pull request 修复了非持久主题的分区错误。

有关实现的更多信息，请参见 [PR-7459](https://github.com/apache/pulsar/pull/7459)。

## ZooKeeper

### 使用主机名进行 bookie 机架感知映射

在 [PR-5607](https://github.com/apache/pulsar/pull/5607) 中，添加了 `useHostName()` 并 `return false`。机架感知策略将 Bookie 的主机名转换为 IP 地址，然后使用该 IP 地址来确定 bookie 属于哪个机架。

然后出现两个问题：
1. IP 与记录在 `/bookies` z-node 中的主机名不匹配
2. 如果解析 bookie 主机名时出错（例如：瞬态 DNS 错误），会触发 NPE，BK 客户端永远不会意识到此 bookie 在集群中可用。

异常在第 77 行抛出（如下面的代码片段所示），因为 `getAddress()` 返回 `null`，因为地址已被解析。

```java

74        if (dnsResolver.useHostName()) {
75            names.add(addr.getHostName());
76        } else {
77            names.add(addr.getAddress().getHostAddress());
78        }

```

`DnsResolver.useHostName()` 的默认实现返回 `true`。

有关实现的更多信息，请参见 [PR-7361](https://github.com/apache/pulsar/pull/7361)。

## Java Client

### 修复 Athenz 认证中使用的 HTTP 标头无法重命名的问题

Athenz 的认证插件允许用户使用名为 `roleHeader` 的参数更改用于向 broker 服务器发送认证令牌的 HTTP 标头名称。此更改使用 `AuthenticationAthenz` 端的 `roleHeader` 参数值，并直接将其用作标头名称。

有关实现的更多信息，请参见 [PR-7311](https://github.com/apache/pulsar/pull/7311)。

### 修复批量确认集被多次回收的问题

批量确认集被多次回收，由于组确认刷新和累积确认之间的竞态条件。因此我们在 PR-7409 中为确认集添加了回收状态检查，并修复了回收问题。

有关实现的更多信息，请参见 [PR-7409](https://github.com/apache/pulsar/pull/7409)。

### 添加支持 OAuth2 的认证客户端

Pulsar 支持使用 OAuth 2.0 访问令牌对客户端进行认证。您可以使用令牌来标识 Pulsar 客户端，并与被允许执行某些操作的某些"主体"（或"角色"）关联，例如，向主题发布消息或从主题消费消息。

此模块直接支持 Pulsar 客户端 OAuth 2.0 认证插件。客户端与 OAuth 2.0 服务器通信，从 OAuth 2.0 服务器获取 `访问令牌`，并将 `访问令牌` 传递给 Pulsar broker 进行认证。

因此，broker 可以使用 `org.apache.pulsar.broker.authentication.AuthenticationProviderToken`，用户可以添加自己的 `AuthenticationProvider` 来与此模块一起工作。

有关实现的更多信息，请参见 [PR-7420](https://github.com/apache/pulsar/pull/7420)。

### 消费者关闭时不订阅主题

修复重新连接到 broker 时关闭消费者的竞态条件。

当消费者重新连接到 broker 时发生竞态条件。当消费者重新连接到 broker 时，消费者的连接设置为 `null`。如果此时消费者未连接到 broker，客户端不会向 broker 发送消费者命令。因此，当消费者重新连接到 broker 时，消费者再次发送订阅命令。

此 pull request 在消费者的 `connectionOpened()` 打开时添加状态检查。如果消费者处于关闭或已关闭状态，消费者不会发送订阅命令。

有关实现的更多信息，请参见 [PR-7589](https://github.com/apache/pulsar/pull/7589)。

### OAuth2 认证插件使用 AsyncHttpClient

以前，OAuth2 客户端认证插件使用 Apache HTTP 客户端库发出请求，Apache HTTP 客户端用于验证主机名。如 [#7612](https://github.com/apache/pulsar/issues/7612) 中所建议，我们摆脱了使用 Apache HTTP 客户端的依赖。

在 PR-7615 中，OAuth2 客户端认证插件使用 AsyncHttpClient，它在客户端和 broker 中使用。有关实现的更多信息，请参见 [PR-7615](https://github.com/apache/pulsar/pull/7615)。

## CPP Client

### CPP Oauth2 认证客户端

Pulsar 支持使用 OAuth 2.0 访问令牌对客户端进行认证。您可以使用令牌来标识 Pulsar 客户端，并与被允许执行某些操作（例如：向主题发布消息或从主题消费消息）的某些"主体"（或"角色"）关联。此更改尝试在 cpp 客户端中支持它。

有关实现的更多信息，请参见 [PR-7467](https://github.com/apache/pulsar/pull/7467)。

### 修复关闭回调中的分区索引错误

在分区生产者/消费者的关闭回调中，分区索引始终为 `0`。`ProducerImpl/ConsumerImpl` 内部分区索引字段应该传递给 `PartitionedProducerImpl/PartitionedConsumerImpl` 关闭回调。

有关实现的更多信息，请参见 [PR-7282](https://github.com/apache/pulsar/pull/7282)。

### 修复 CPP 客户端中计时器竞态条件导致的段崩溃

段崩溃在竞态条件中发生：
    - 关闭操作调用 `keepAliveTimer_.reset()`。
    - `keepAliveTimer` 被 `startConsumerStatsTimer` 和 `handleKeepAliveTimeout` 方法调用。实际上，`keepAliveTimer` 不应该被这两个方法调用。

此 pull request 修复了这些问题。

有关实现的更多信息，请参见 [PR-7572](https://github.com/apache/pulsar/pull/7572)。

### 添加从文件读取凭据的支持

支持从文件读取凭据，使其与 Java 客户端保持一致。

有关实现的更多信息，请参见 [PR-7606](https://github.com/apache/pulsar/pull/7606)。

### 修复多主题消费者连接错误时的段错误

多主题消费者在创建消费者时发生错误时触发段错误。这是由于使用空回调关闭部分消费者的调用导致的。

有关实现的更多信息，请参见 [PR-7588](https://github.com/apache/pulsar/pull/7588)。

## Functions

### 使用完全限定主机名作为默认通告 worker

在获取主机名方面，`Java 8` 和 `Java 11` 之间存在差异。在 Java 8 中，`InetAddress.getLocalHost().getHostName()` 返回完全限定主机名；在 Java 11 中，它返回简单主机名。在这种情况下，我们应该使用 `getCanonicalHostName()`，它返回完全限定主机名。这也是获取 worker 通告地址的相同方法。

有关实现的更多信息，请参见 [PR-7360](https://github.com/apache/pulsar/pull/7360)。

### 修复 2.6.0 版本中引入的函数 BC 问题

在 [PR-5985](https://github.com/apache/pulsar/pull/5985) 中引入了向后兼容性破坏。当运行的 function workers 与 brokers 分离时，将 workers 和 brokers 从 2.5.0 版本独立更新到 2.6.0 会导致以下错误：

```text

java.lang.NullPointerException: null\n\tat java.net.URI$Parser.parse(URI.java:3104) ~[?:?]
java.net.URI.<init>(URI.java:600) ~[?:?]\n\tat java.net.URI.create(URI.java:881) ~[?:?]
org.apache.pulsar.functions.worker.WorkerUtils.initializeDlogNamespace(WorkerUtils.java:160) ~[org.apache.pulsar-pulsar-functions-worker-2.7.0-SNAPSHOT.jar:2.7.0-SNAPSHOT]
org.apache.pulsar.functions.worker.Worker.initialize(Worker.java:155) ~[org.apache.pulsar-pulsar-functions-worker-2.7.0-SNAPSHOT.jar:2.7.0-SNAPSHOT]
org.apache.pulsar.functions.worker.Worker.start(Worker.java:69) ~[org.apache.pulsar-pulsar-functions-worker-2.7.0-SNAPSHOT.jar:2.7.0-SNAPSHOT]
org.apache.pulsar.functions.worker.FunctionWorkerStarter.main(FunctionWorkerStarter.java:67) [org.apache.pulsar-pulsar-functions-worker-2.7.0-SNAPSHOT.jar:2.7.0-SNAPSHOT]

```

这是因为 broker 2.5.0 支持"bookkeeperMetadataServiceUri"，并且管理客户端返回一个 `null` 字段，从而导致 NPE。

有关实现的更多信息，请参见 [PR-7528](https://github.com/apache/pulsar/pull/7528)。

## pulsar-perf

### 在 pulsar-perf 生产/消费/读取性能测试中支持 `tlsAllowInsecureConnection`

将 `tlsAllowInsecureConnection` 配置添加到 CLI 工具 **pulsar-perf**，以支持对具有不安全 TLS 连接的集群进行生产/消费/读取性能测试。

有关实现的更多信息，请参见 [PR-7300](https://github.com/apache/pulsar/pull/7300)。

## 更多信息

- 要下载 Apache Pulsar 2.6.1，请点击[下载](https://pulsar.apache.org/download/)。
- 有关 Apache Pulsar 2.6.1 的更多信息，请参见 [2.6.1 发布说明](https://pulsar.apache.org/release-notes/#2.6.1) 和 [2.6.1 PR 列表](https://github.com/apache/pulsar/pulls?q=is%3Apr+label%3Arelease%2F2.6.1+is%3Aclosed)。

如果您有任何问题或建议，请通过邮件列表或 slack 联系我们。

- [users@pulsar.apache.org](mailto:users@pulsar.apache.org)
- [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org)
- Pulsar slack 频道: https://apache-pulsar.slack.com/
- 在 https://apache-pulsar.herokuapp.com/ 自行注册

期待您对 [Pulsar](https://github.com/apache/pulsar) 的贡献。

