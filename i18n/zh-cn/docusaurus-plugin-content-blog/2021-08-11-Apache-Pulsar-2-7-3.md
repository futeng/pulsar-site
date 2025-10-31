---
author: Bo Cong, Anonymitaet
title: "Apache Pulsar 2.7.3"
---

# Apache Pulsar 2.7.3 的新功能

Apache Pulsar 社区发布了 2.7.3 版本！34 位贡献者提供了改进和错误修复，完成了 79 个提交。

<!--truncate-->

## 亮点

- 游标读取遵循分发字节速率限制器设置，不再导致意外结果。[PR-11249](https://github.com/apache/pulsar/pull/11249)

- ledger 翻转计划任务按预期运行。[PR-11226](https://github.com/apache/pulsar/pull/11226)

本博客介绍了最值得注意的更改。包含所有增强功能和错误修复的完整列表，请查看 [Pulsar 2.7.3 发布说明](https://pulsar.apache.org/release-notes/#273-mdash-2021-07-27-a-id273a)。

# 值得注意的错误修复和增强

## Broker

### 游标读取遵循分发字节速率限制器设置。 [PR-9826](https://github.com/apache/pulsar/pull/9826)

- **问题**：使用字节速率时，分发速率不受尊重（无论是命名空间还是主题策略）。

- **解决方案**：修复了分发字节速率限制器设置的行为。游标读取遵循设置，不再导致意外结果。

### ledger 翻转计划任务按预期运行。 [PR-11226](https://github.com/apache/pulsar/pull/11226)

- **问题**：以前，ledger 翻转计划任务在达到 ledger 最大翻转时间之前执行，这导致 ledger 未能及时翻转。

- **解决方案**：修复了 ledger 翻转计划的时间，因此任务只在 ledger 成功创建后运行。

### 重启 broker 时主题级保留策略正常工作。 [PR-11136](https://github.com/apache/pulsar/pull/11136)

- **问题**：以前，当为主题设置主题级保留策略然后重启 broker 时，主题级保留策略不起作用。

- **解决方案**：修复了策略的行为，以便在启动 `policyCacheInitMap` 后重放所有策略消息，并在重启 broker 时添加了保留策略检查测试。

### lastMessageId API 调用不再导致内存泄漏。 [PR-10977](https://github.com/apache/pulsar/pull/10977)

- **问题**：以前，调用 `lastMessageId` API 时存在内存泄漏，这导致 broker 进程被 Kubernetes 停止。

- **解决方案**：向 PersistentTopic.getLastMessageId 添加了缺失的 entry.release() 调用，确保 broker 不会耗尽内存。

### ZooKeeper 读取被 brokers 缓存。 [PR-10594](https://github.com/apache/pulsar/pull/10594)

- **问题**：当执行获取租户命名空间的管理操作时，ZooKeeper 读取在 ZooKeeper 客户端上发出，而未被 brokers 缓存。

- **解决方案**：修复了为租户获取命名空间列表时的 ZooKeeper 缓存。

### 调用 `LeaderService.isLeader()` 的监控线程不再被阻塞。 [PR-10512](https://github.com/apache/pulsar/pull/10512)

- **问题**：当 `LeaderService` 更改领导状态时，它被 `synchronized` 块锁定，这也阻塞了其他调用 `LeaderService.isLeader()` 的线程。

- **解决方案**：修复了监控线程上的死锁条件，通过修改 `ClusterServiceCoordinator` 和 `WorkerStatsManager` 从 `MembershipManager` 检查它是否是领导者，使其不被 `LeaderService.isLeader()` 阻塞。

### `hasMessageAvailable` 可以成功读取消息。 [PR-10414](https://github.com/apache/pulsar/pull/10414)

- **问题**：当 `hasMessageAvailableAsync` 返回 `true` 时，它无法读取消息，因为消息被 `acknowledgmentsGroupingTracker` 过滤。

- **解决方案**：通过修改 `acknowledgmentsGroupingTracker` 过滤重复消息来修复竞态条件，然后在连接打开时清理消息。

## Proxy

### 代理支持自动创建分区主题。 [PR-8048](https://github.com/apache/pulsar/pull/8048)

- **问题**：代理没有创建分区，因为它们使用当前的 ZooKeeper 元数据。

- **解决方案**：更改代理以通过选择和从可用的 broker 获取来处理 `PartitionMetadataRequest`，而不是使用当前的 ZooKeeper 元数据。

## Pulsar admin

### 添加标志以指示是否在复制集群上创建元数据路径。 [PR-11140](https://github.com/apache/pulsar/pull/11140)

- **问题**：在复制命名空间中创建分区主题时，它没有在复制集群上创建元数据路径 `/managed-ledgers`。

- **解决方案**：添加了一个标志（createLocalTopicOnly）以指示是否为复制集群中的分区主题创建元数据路径。

### 不能为不存在的主题设置主题策略。 [PR-11131](https://github.com/apache/pulsar/pull/11131)

- **问题**：由于主题策略中的重定向循环，您可以为不存在的主题或分区主题的分区设置策略。

- **解决方案**：修复为主题策略添加了权威标志以避免重定向循环。您不能为不存在的主题或分区主题的分区设置主题策略。如果您为 0 分区主题的分区设置主题策略，它会重定向到 broker。

### 发现服务不再将主题域硬编码为 persistent。 [PR-10806](https://github.com/apache/pulsar/pull/10806)

- **问题**：当对分区非持久主题使用查找发现服务时，它返回零而不是分区数。Pulsar 客户端尝试连接主题，就好像它是普通主题一样。

- **解决方案**：实现了 `topicName.getDomain().value()` 而不是硬编码 `persistent.` 现在您可以成功地对分区非持久主题使用发现服务。

### 其他连接器现在可以使用 Kinesis `Backoff` 类。 [PR-10744](https://github.com/apache/pulsar/pull/10744)

- **问题**：Pulsar 客户端实现项目中的 Kinesis 接收连接器 `Backoff` 类结合依赖 `org.apache.pulsar:pulsar-client-original` 增加了连接器大小。

- **解决方案**：在函数 io-core 项目中添加了新类 `Backoff`，以便 Kinesis 接收连接器和其他连接器可以使用该类。

## Client

### 不能发送具有零许可的 `FLOW` 请求。 [PR-10506](https://github.com/apache/pulsar/pull/10506)

- **问题**：当 broker 接收到具有零许可的 `FLOW` 请求时，抛出异常然后关闭连接。这触发了频繁的重新连接并导致重复或无序消息。

- **解决方案**：添加了验证，在发送 `FLOW` 请求之前验证其许可。如果许可为零，则不能发送 `FLOW` 请求。

## Function 和 connector

### Kinesis 接收连接器确认成功消息。 [PR-10769](https://github.com/apache/pulsar/pull/10769)

- **问题**：Kinesis 接收连接器在消息成功发送后没有确认消息。

- **解决方案**：为 Kinesis 接收连接器添加了确认，一旦消息成功发送。

## Docker

### 使用 Kubernetes 运行时时函数名长度不能超过 52 个字符。 [PR-10531](https://github.com/apache/pulsar/pull/10531)

- **问题**：使用 Kubernetes 运行时时，如果函数以有效长度（少于 55 个字符）提交，则创建 StatefulSet 但无法生成 pod。

- **解决方案**：将 Kubernetes 运行时的函数名最大长度从 55 更改为 53 个字符。通过此修复，函数名长度不能超过 52 个字符。

## 依赖

### 启用 TLS 时 `pulsar-admin` 与代理的连接稳定。 [PR-10907](https://github.com/apache/pulsar/pull/10907)

- **问题**：`pulsar-admin` 在 TLS 连接上不稳定，因为 Jetty 9.4.39 中引入的 SSL 缓冲中的 Jetty 错误。它导致大型函数 jar 上传经常失败。

- **解决方案**：将 Jetty 升级到 9.4.42.v20210604，因此启用 TLS 时 `pulsar-admin` 与代理的连接稳定。

# 下一步是什么？

如果您有兴趣了解更多关于 Pulsar 2.7.3 的信息，您可以[下载 2.7.3](https://pulsar.apache.org/en/versions/) 并立即试用！

首届 Pulsar Virtual Summit Europe 2021 将于 10 月举行。[立即注册](https://hopin.com/events/pulsar-summit-europe-2021)，并通过在社交媒体上传播信息帮助我们使其取得更大的成功！

有关 Apache Pulsar 项目和进展的更多信息，请访问 [Pulsar 网站](https://pulsar.apache.org)，在 Twitter [@apache_pulsar](https://twitter.com/apache_pulsar) 上关注项目，并加入 [Pulsar Slack](https://apache-pulsar.herokuapp.com/)！