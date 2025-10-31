---
title: "What's New in Apache Pulsar 4.1"
author: David Kjerrumgaard
date: 2025-09-09
---

Apache Pulsar 社区激动地宣布发布 Apache Pulsar 4.1，一个重要的功能版本！

<!--truncate-->

## Apache Pulsar 4.1 相较于 Pulsar 4.0 的新功能

自 2024 年 10 月上一个发布版本 Pulsar 4.0 以来，Pulsar 4.1 [包含了大量改进和增强](https://github.com/apache/pulsar/releases/tag/v4.1.0)。这个版本引入了 19 个 Pulsar 改进提案（PIPs）和数百个 bug 修复、安全更新和性能改进，从多个方面增强了平台的能力。

由于有许多新功能和改进，这篇博客将重点介绍最重要的更新。我们邀请 Apache Pulsar 贡献者撰写额外的博客文章，详细介绍新功能和改进。

## 关键的 Pulsar 改进提案（PIPs）

Pulsar 4.1 引入了 19 个已批准的 PIP，增强了平台的各个方面：

### 增强的安全性和认证
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-292.md" class="blacklink" target="_blank">PIP-292</a>**：在 WebSocket 插件中强制执行令牌过期时间，提高 WebSocket 连接的安全性
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-432.md" class="blacklink" target="_blank">PIP-432</a>**：向 EncryptionContext 添加 isEncrypted 字段以更好地处理加密
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-436.md" class="blacklink" target="_blank">PIP-436</a>**：向消费者添加 decryptFailListener 以改进加密消息场景中的错误处理

### 客户端体验和配置
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-391.md" class="blacklink" target="_blank">PIP-391</a>**：默认启用批量索引 ACK，提高确认效率并减少内存使用
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-409.md" class="blacklink" target="_blank">PIP-409</a>**：支持重试/死信 Topic 生产者的生产者配置，提供更好的重试机制控制
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-420.md" class="blacklink" target="_blank">PIP-420</a>**：提供 Pulsar 客户端与第三方 Schema 注册服务集成的能力，扩展 Schema 管理选项
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-421.md" class="blacklink" target="_blank">PIP-421</a>**：要求 Java 17 作为 Pulsar Java 客户端 SDK 的最低要求，利用现代 Java 功能
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-425.md" class="blacklink" target="_blank">PIP-425</a>**：支持连接多端点 serviceUrls 的下一个可用端点，提高客户端弹性

### 卓越运营和监控
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-416.md" class="blacklink" target="_blank">PIP-416</a>**：添加新的 Topic 方法以实现按大小阈值触发卸载，增强存储管理
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-427.md" class="blacklink" target="_blank">PIP-427</a>**：使 pulsar-admin 默认的 mark-delete 速率与 Broker 配置保持一致
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-431.md" class="blacklink" target="_blank">PIP-431</a>**：向 Topic 统计添加创建和最后发布时间戳，提高可观测性
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-435.md" class="blacklink" target="_blank">PIP-435</a>**：在客户端 CLI 中添加消费消息的 startTimestamp 和 endTimestamp，实现精确的基于时间的消息消费

### 高级功能和性能
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-422.md" class="blacklink" target="_blank">PIP-422</a>**：支持全局 Topic 级别策略：复制集群和删除 Topic 级别策略的新 API
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-428.md" class="blacklink" target="_blank">PIP-428</a>**：更改 TopicPoliciesService 接口以修复 Topic 策略管理中的一致性问题
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-429.md" class="blacklink" target="_blank">PIP-429</a>**：通过跳过负载缓冲区解析优化压缩最后一个条目的处理，提高压缩性能
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-430.md" class="blacklink" target="_blank">PIP-430</a>**：Pulsar Broker 缓存改进：重构驱逐和添加基于预期读取次数的新缓存策略
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-433.md" class="blacklink" target="_blank">PIP-433</a>**：优化复制和自动创建机制的冲突，包括 Topic 和 Schema 的自动创建

### 管理和管理增强
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-373.md" class="blacklink" target="_blank">PIP-373</a>**：添加 Topic 系统属性，指示用户之前是否发布过 TXN 消息
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-375.md" class="blacklink" target="_blank">PIP-375</a>**：暴露管理客户端配置：readTimeout、requestTimeout 和 connectionTimeout
- **<a href="https://github.com/apache/pulsar/blob/master/pip/pip-382.md" class="blacklink" target="_blank">PIP-382</a>**：为 topic_load_failed_total 指标添加名为 reason 的标签以更好地监控

## 安全增强

Pulsar 4.1 通过多个关键更新强烈关注安全性：

### 关键漏洞修复
该版本解决了几个高优先级 CVE：
- **<a href="https://github.com/advisories?query=CVE-2024-53990" target="_blank" class="blacklink">CVE-2024-53990</a>**：将 async-http-client 升级到 2.12.4 并禁用 AsyncHttpClient CookieStore
- **<a href="https://github.com/advisories?query=CVE-2025-8916" target="_blank" class="blacklink">CVE-2025-8916</a>**：将 bouncycastle bcpkix-fips 版本升级到 1.79
- **<a href="https://github.com/advisories?query=CVE-2024-6763" target="_blank" class="blacklink">CVE-2024-6763</a>**：将 Jetty 升级到 9.4.57.v20241219
- **<a href="https://github.com/advisories?query=CVE-2025-30204" target="_blank" class="blacklink">CVE-2025-30204</a>**：将 jwt/v5 升级到 5.2.2
- **<a href="https://github.com/advisories?query=CVE-2025-27818" target="_blank" class="blacklink">CVE-2025-27818</a>**：将 Kafka 连接器和客户端版本升级到 3.9.1
- **<a href="https://github.com/advisories?query=CVE-2025-22868" target="_blank" class="blacklink">CVE-2025-22868</a>**：升级 pulsar-function-go 依赖项
- **<a href="https://github.com/advisories?query=CVE-2024-47535" target="_blank" class="blacklink">CVE-2024-47535</a>**：升级到 Netty 4.1.115.Final
- **<a href="https://github.com/advisories?query=CVE-2025-55163" target="_blank" class="blacklink">CVE-2025-55163</a>**：升级到 Netty 4.1.124.Final
- **<a href="https://github.com/advisories?query=CVE-2024-51504" target="_blank" class="blacklink">CVE-2024-51504</a>**：将 ZooKeeper 升级到 3.9.3

### 加密改进
- 在 pulsar-function-go 中将 golang.org/x/crypto 从 0.21.0 升级到 0.31.0
- 将 bcprov-jdk15on 依赖项替换为 bcprov-jdk18-on 以获得更好的 Java 兼容性
- 将 commons-io 升级到 2.18.0，json-smart 升级到 2.5.2

## 增强的客户端可靠性和性能

### 批处理改进
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-391.md" class="blacklink" target="_blank">PIP-391</a>** 默认启用批量索引 ACK，显著提高确认效率。此更改减少了内存使用，并为批处理常见的高吞吐量场景提供更好的性能。

### 多端点弹性
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-425.md" class="blacklink" target="_blank">PIP-425</a>** 引入对连接多端点 serviceUrls 的下一个可用端点的支持。此增强通过在主端点不可用时自动故障转移到替代端点来提高客户端弹性。

### 内存管理和资源清理
该版本包括内存泄漏和资源清理的全面修复：
- 修复了 ClientCnx.newLookup 中遇到 TooManyRequestsException 时的内存泄漏
- 解决了启用批处理时消息大小超过最大限制的内存泄漏
- 改进了创建中断时的孤立生产者和消费者的处理
- 增强了发送失败时重试和死信 Topic 生产者的清理

## Broker 和消息传递改进

### 高级缓存策略
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-430.md" class="blacklink" target="_blank">PIP-430</a>** 引入了显著的 Broker 缓存改进，具有重构的驱逐算法和基于预期读取次数的新缓存策略。此增强优化了内存使用并提高了频繁访问数据的缓存命中率。

### 消息处理优化
几项改进增强了消息处理效率：
- 修复了 MetadataCache#readModifyUpdateOrCreate 中的重试机制
- 改进了 acknowledgeCumulativeAsync 以在启用 ackReceipt 时防止阻塞
- 通过更好的位置处理和生命周期管理增强游标管理
- 优化了消息 TTL 检查和过期处理

### 压缩性能
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-429.md" class="blacklink" target="_blank">PIP-429</a>** 通过跳过不必要的负载缓冲区解析优化压缩最后一个条目的处理，显著提高了具有大负载的 Topic 的压缩性能。

## 管理和操作增强

### 基于时间的消息消费
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-435.md" class="blacklink" target="_blank">PIP-435</a>** 向客户端 CLI 添加了消费消息的 startTimestamp 和 endTimestamp 参数。此功能实现精确的基于时间的消息消费，特别适用于：
- 调试和故障排除特定时间窗口
- 具有时间边界的数据恢复操作
- 基于时间的消息处理和分析

### Topic 统计和监控
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-431.md" class="blacklink" target="_blank">PIP-431</a>** 通过添加创建和最后发布时间戳增强 Topic 统计。此改进提供对 Topic 生命周期和使用模式的更好可见性，使能够做出更明智的操作决策。

### 全局 Topic 级别策略
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-422.md" class="blacklink" target="_blank">PIP-422</a>** 引入对全局 Topic 级别复制集群策略和删除 Topic 级别策略的新 API 的支持。此增强提供对跨集群的 Topic 复制和策略管理的更细粒度控制。

## Function 和连接器改进

### Schema 注册中心集成
**<a href="https://github.com/apache/pulsar/blob/master/pip/pip-420.md" class="blacklink" target="_blank">PIP-420</a>** 提供 Pulsar 客户端与第三方 Schema 注册服务集成的能力。此增强将 Schema 管理选项扩展到 Pulsar 内置的 Schema 注册中心之外，实现与流行的 Schema 管理平台的集成。

### 增强的错误处理
该版本改进了各种场景中的错误处理：
- 向消费者添加 decryptFailListener 以更好地处理加密错误
- 改进 Pulsar Functions 和 IO 连接器中的异常处理
- 增强重试机制和断路器模式

### 连接器更新
多个 IO 连接器收到改进：
- 增强了具有更好引导服务器日志记录的 Kafka 连接器
- 改进了具有更好配置支持的 Kinesis 连接器
- 使用适当的消息确认更新了 RabbitMQ 连接器
- 增强了连接器性能的监控和指标

## 基础设施和性能

### 负载均衡优化
通过几个优化增强了 ExtensibleLoadManagerImpl：
- 当 Bundle 吞吐量为零时跳过卸载
- 改进服务单元状态管理
- 更好的负载分配算法
- 减少不必要的负载均衡操作

### 蓝绿迁移支持
添加了蓝绿集群迁移的全面支持：
- 迁移集群存在的验证
- 改进的迁移状态处理
- 迁移过程中更好的错误处理
- 增强迁移进度的监控和指标

### 指标和可观测性
通过以下方式改进监控能力：
- 修复延迟队列的指标命名（<a href="https://github.com/apache/pulsar/blob/master/pip/pip-399.md" class="blacklink" target="_blank">PIP-399</a>）
- 添加分发限流指标（<a href="https://github.com/apache/pulsar/blob/master/pip/pip-406.md" class="blacklink" target="_blank">PIP-406</a>）
- 使用时间戳信息增强 Topic 统计
- 更好的错误分类和监控

## 库更新和依赖管理

Pulsar 4.1 包括广泛的库更新以确保安全性、性能和兼容性：

### 主要框架更新
- **Apache BookKeeper**：升级到 4.17.2，具有改进的性能和稳定性
- **Netty**：更新到 4.1.122.Final，具有安全修复和性能改进
- **Avro**：升级到 1.12.0 以获得更好的 Schema 处理
- **OpenTelemetry**：更新到 1.45.0 以增强可观测性

### 构建和开发工具
- **Java 17 要求**：<a href="https://github.com/apache/pulsar/blob/master/pip/pip-421.md" class="blacklink" target="_blank">PIP-421</a> 建立 Java 17 作为 Java 客户端 SDK 的最低要求
- **Caffeine**：从 2.9.1 升级到 3.2.1 以改进缓存性能
- **Guava**：更新到 33.4.8 并带有 JSpecify 注解
- **Spring Framework**：在 IO 连接器中更新到 6.1.14

## 开始使用 Pulsar 4.1

Pulsar 4.1.0 现在可供 [下载](https://pulsar.apache.org/download/)。下载页面还包括有关 Docker 镜像的详细信息。要开始使用 Pulsar，您可以 [在本地机器、Docker 或 Kubernetes 上运行 Pulsar 集群](https://pulsar.apache.org/docs/4.1.x/getting-started-home/)。

## 将现有集群升级到 Pulsar 4.1

作为 4.x 系列中的功能版本，Pulsar 4.1 保持与 Pulsar 4.0 部署的兼容性。运行 Pulsar 4.0.x 的用户可以按照标准升级程序直接升级到 Pulsar 4.1.0。

Pulsar 版本中的更改设计为允许将现有 Pulsar 集群升级到较新版本，然后在出现问题时回滚到原始版本。这在 Pulsar 和 Pulsar 的默认 BookKeeper 配置中进行更改时会考虑。由于 Apache Pulsar 是一个开源项目，不能保证特定配置可以升级和降级。

每个 Pulsar 用户都负责运营其集群，Pulsar 集群升级应在测试和暂存环境中进行测试，以确保特定配置可以升级和降级。当 Apache 项目中支持某些功能时，意味着项目致力于解决报告的问题。这也适用于发布升级兼容性。

对于从早期版本升级的用户，请遵循标准升级路径：首先升级到 Pulsar 4.0.x，然后继续到 Pulsar 4.1.0。

## 升级客户端以使用 Pulsar 4.1

Pulsar 4.1 客户端与 Pulsar 4.0 集群兼容，Pulsar 4.0 客户端与 Pulsar 4.1 集群兼容。升级客户端时，您可以直接升级到最新的支持版本。建议保持客户端最新以获取最新的安全补丁和 bug 修复。

**重要提示**：<a href="https://github.com/apache/pulsar/blob/master/pip/pip-421.md" class="blacklink" target="_blank">PIP-421</a> 从 4.1 开始建立 Java 17 作为 Pulsar Java 客户端 SDK 的最低要求。在升级之前，请确保您的客户端应用程序运行在 Java 17 或更高版本上。

升级 Java 客户端时，客户端模块库版本不齐是一个常见问题。建议使用 [Pulsar BOM](https://pulsar.apache.org/docs/4.1.x/client-libraries-java-setup/#pulsar-bom) 在 Maven 和 Gradle 构建中管理 Pulsar Java 客户端版本。还有关于 [在 Spring Boot 项目中选择 Pulsar 客户端版本的特定说明](https://pulsar.apache.org/docs/4.1.x/client-libraries-java-setup/#spring-boot)。

## 感谢 Apache Pulsar 贡献者

Apache Pulsar 4.1 代表了我们充满活力的开源社区的持续协作努力。这个版本展示了全球开发者、组织和用户的奉献精神，他们为使数据流处理更可靠和更易访问做出了贡献。

我们向我们最深的感激致以：

- 开发新功能、报告 bug、修复 bug 和改进文档的个人贡献者
- 参与 Apache Pulsar 项目安全问题处理、PIP 决策制定和版本投票的提交者和 PMC 成员
- 在生产环境中部署 Pulsar 并分享宝贵反馈的组织
- 在发布过程中参与测试并提供宝贵意见的用户
- 更广泛的 Apache 软件基金会社区的持续支持

Apache Pulsar 的力量在于其社区驱动的开发。无论您是在生产环境中运行 Pulsar 还是为您的技术栈评估它，我们都鼓励您在 [dev@pulsar.apache.org](https://pulsar.apache.org/contact/#mailing-lists) 邮件列表或 [Pulsar Slack 社区](https://pulsar.apache.org/community/#section-discussions) 中加入对话。您的经验和反馈有助于塑造这个平台的未来。