---
author: Technoboy-, Anonymitaet
title: "Apache Pulsar 2.7.4 的新功能"
---

Apache Pulsar 社区发布了 2.7.4 版本！32 位贡献者提供了改进和错误修复，共计 98 个提交。

<!--truncate-->

本版本的主要亮点如下：

- 将 Log4j 升级到 2.17.0 - [CVE-2021-45105](https://pulsar.apache.org/blog/2021/12/11/Log4j-CVE/)。[PR-13392](https://github.com/apache/pulsar/pull/13392)

- 当 `OpAddEntry` 被回收时，可以正确引用 `ManagedLedger`。[PR-12103](https://github.com/apache/pulsar/pull/12103)

- ManagedLedger 关闭时，`OpAddEntry` 上不会发生 NPE。[PR-12364](https://github.com/apache/pulsar/pull/12364)

本博客将按受影响的功能分类介绍最值得注意的更改。有关包含所有增强和错误修复的完整列表，请查看 [Pulsar 2.7.4 发布说明](https://pulsar.apache.org/en/release-notes/#274)。

# 值得注意的错误修复和增强

### 将 Log4j 升级到 2.17.0 - [CVE-2021-45105](https://pulsar.apache.org/blog/2021/12/11/Log4j-CVE/)。[PR-13392](https://github.com/apache/pulsar/pull/13392)

- **问题**

  报告了一个关于 Log4j 的严重漏洞，可能允许攻击者远程执行代码。该漏洞问题在 [CVE-2021-44228](https://nvd.nist.gov/vuln/detail/CVE-2021-44228) 中进行了描述和跟踪。

- **解决方案**

  Pulsar 2.7.4 将 Log4j 升级到 2.17.0。

### 当 `OpAddEntry` 被回收时，可以正确引用 `ManagedLedger`。[PR-12103](https://github.com/apache/pulsar/pull/12103)

- **问题**

  以前，在写入失败后，在后台安排了一个任务来强制关闭账本并触发新账本的创建。如果 `OpAddEntry` 实例已经被回收，这可能导致 NPE 或未定义行为。

- **解决方案**

  将 `ManagedLedgerImpl` 对象引用复制到一个 final 变量，这样后台任务将不依赖于 `OpAddEntry` 实例的生命周期。

### `BlobStoreBackedReadHandler` 中没有潜在的竞争条件。[PR-12123](https://github.com/apache/pulsar/pull/12123)

- **问题**

  以前，`BlobStoreBackedReadHandler` 在读取卸载账本时进入无限循环。读取条目和关闭 BlobStoreBackedReadHandler 的操作之间存在竞争条件。

- **解决方案**

  在读取条目之前添加状态检查，并在 `entryID` 大于 `lastEntryID` 时使 `BlobStoreBackedReadHandler` 退出循环。

### ManagedLedger 关闭时，`OpAddEntry` 上不会发生 NPE。[PR-12364](https://github.com/apache/pulsar/pull/12364)

- **问题**

  以前，测试 `ManagedLedgerBkTest#managedLedgerClosed` 在某些 `asyncAddEntry` 操作上关闭 ManagedLedger 对象并因 NPE 失败。

- **解决方案**

  当 `ManagedLedger` 发信号通知 `OpAddEntry` 失败时关闭 `OpAddEntry`。这样，`OpAddEntry` 对象被正确回收，失败回调被正确触发。

### 通过分区的主题名称正确设置主题策略。[PR-11294](https://github.com/apache/pulsar/pull/11294)

- **问题**

  以前，分区的主题名称不能用于设置主题策略。

- **解决方案**

  通过在 `SystemTopicBasedTopicPoliciesService` 中转换分区的主题名称，允许通过分区的主题名称设置主题策略。

### 分发速率限制器对消费者生效。[PR-8611](https://github.com/apache/pulsar/pull/8611)

- **问题**

  以前，在所有消费者都在下一秒开始读取的情况下，分发速率限制器不起作用，因为 `acquiredPermits` 每秒被重置为 0。

- **解决方案**

  通过每秒减去 `permits` 而不是将 `acquiredPermits` 重置为 0 来改变 `DispatchRateLimiter` 的行为。消费者停止读取条目，直到 `acquiredPermits` 返回小于 `permits` 的值。

### 执行卸载 bundles 操作时不会发生 NPE。[PR-11310](https://github.com/apache/pulsar/pull/11310)

- **问题**

  在对持久分区主题进行压力测试时，执行卸载 bundles 操作时发生 NPE。同时，生产者不写入消息。

- **解决方案**

  添加了更多安全检查来修复此问题。

### 修复 Namespace bundles 缓存的不一致行为。[PR-11346](https://github.com/apache/pulsar/pull/11346)

- **问题**

  以前，命名空间被删除后，命名空间 bundle 缓存没有被失效。

- **解决方案**

  当 bundle 缓存失效时，使命名空间策略缓存失效。

### 集群删除后关闭复制器和复制客户端。[PR-11342](https://github.com/apache/pulsar/pull/11342)

- **问题**

  以前，集群删除后，复制器和复制客户端没有被关闭。复制器的生产者随后会尝试连续重新连接到已删除的集群。

- **解决方案**

  关闭相关的复制器和复制客户端。

### 发布速率限制器按预期生效。[PR-10384](https://github.com/apache/pulsar/pull/10384)

- **问题**

  以前，如果为速率限制设置 `preciseTopicPublishRateLimiterEnable` 为 `true`，存在各种问题：

  - 更新限制在将限制从有界限制更改为无界限制时没有设置边界。

  - 每个主题为每个限制器实例创建一个调度器线程。

  - 当主题卸载或操作关闭时，主题不释放调度器线程。

  - 更新限制不关闭与被替换限制器实例相关的调度器线程。

- **解决方案**

  - 在创建新的限制器实例之前清理之前的限制器实例。

  - 使用 `brokerService.pulsar().getExecutor()` 作为速率限制器实例的调度器。

  - 为主题关闭（卸载）添加资源清理钩子。

### 如果更新 ZNode 列表失败，清理新创建的账本。[PR-12015](https://github.com/apache/pulsar/pull/12015)

- **问题**

  更新 ZNode 列表时，ZooKeeper 抛出异常且不清理创建的账本。新创建的账本没有被索引到主题的 `managedLedger` 列表中，也不能作为主题保留被清理。此外，如果抛出 ZNode 版本不匹配异常，ZooKeeper 中的 ZNode 数量会增加。

- **解决方案**

  当 ZNode 列表更新失败时，无论异常类型如何，都从 broker 缓存和 BookKeeper 中删除创建的账本。

# 下一步是什么？

如果您有兴趣了解更多关于 Pulsar 2.7.4 的信息，您可以立即[下载](https://pulsar.apache.org/en/versions/)并试用！

Pulsar Summit Asia 2021 将于 2022 年 1 月 15-16 日举行。[立即注册](https://pulsar-summit.org/)，并通过在社交媒体上传播消息来帮助我们取得更大的成功！

有关 Apache Pulsar 项目和当前进展的更多信息，请访问
[Pulsar 网站](https://pulsar.apache.org)，在 Twitter [@apache_pulsar](https://twitter.com/apache_pulsar) 上关注项目，并加入 [Pulsar Slack](https://apache-pulsar.herokuapp.com/)！