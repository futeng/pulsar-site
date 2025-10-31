---
author: Guangning E
authorURL: https://twitter.com/tuteng3
title: "Apache Pulsar 2.5.1"
---

我们很自豪地发布 Apache Pulsar 2.5.1。这是社区巨大努力的结果，包含超过 130 个提交和一长列新功能、通用改进和错误修复。

有关 2.5.1 版本的详细更改，请参考<b>[发布说明](/release-notes/#2.5.1)</b>和<b>[Pulsar 2.5.1 的 PR 列表](https://github.com/apache/pulsar/pulls?q=is:pr%20label:release/2.5.1%20is:closed)</b>。

以下仅突出显示一小部分新功能。

<!--truncate-->

## 刷新认证凭据

在 Pulsar 2.5.1 中，在单一的 `AuthenticationState` 接口凭据持有者中引入了两个新方法。这有助于增强 Pulsar 认证框架，支持会过期并需要通过强制客户端重新认证来刷新的凭据。

现有的认证插件不受影响。如果新插件想要支持过期，只需重写 `isExpired()` 方法。Pulsar broker 确保定期检查每个 `ServerCnx` 对象的 AuthenticationState 的过期状态。您也可以使用 `authenticationRefreshCheckSeconds` 设置来控制过期检查的频率。

## 升级 Avro 到 1.9.1

用于处理逻辑日期时间值的库已从 Joda-Time 更改为 JSR-310。为了保持前向兼容性，Pulsar java 客户端对逻辑日期时间使用 Joda-Time 转换。要使用 JSR-310 转换，您可以在 schema 定义中启用它。

```java

AvroSchema.of(SchemaDefinition.builder()
.withJSR310ConversionEnabled(true)
.build()

```

:::note

默认情况下，Avro 1.9.1 启用 JSR310 日期时间，如果用户使用 Avro 编译器 1.8.x 生成的源代码且源代码包含日期时间字段，可能会引入一些回归问题。建议使用 Avro 1.9.x 编译器重新编译。

:::

而且，Avro 将来可能会移除 Joda 时间支持。这在 Pulsar 中将来也可能被删除。

## 支持卸载分区主题的所有分区
在 Pulsar 2.5.1 之前，Pulsar 支持卸载非分区主题或分区主题的一个分区。如果有一个包含太多分区的分区主题，用户需要获取所有分区并一个一个地卸载它们。在 Pulsar 2.5.1 中，我们支持卸载分区主题的所有分区。

## 支持在拆分 bundle 时均匀分配主题数量
在 Pulsar 2.5.1 中，我们为 bundle 拆分引入了一个选项（`-balance-topic-count`）。当将此选项设置为 true 时，给定的 bundle 被分成两部分，每部分具有相同数量的主题。此外，我们引入了一个名为 `org.apache.pulsar.broker.loadbalance.impl.BalanceTopicCountModularLoadManager` 的新负载管理器实现。新的负载管理器实现基于平衡主题数量来拆分 bundle。
您可以在 broker.conf 中启用此功能：

```

defaultNamespaceBundleSplitAlgorithm=topic_count_equally_divide

```

如果您使用 Pulsar Admin 拆分 bundle，可以使用以下命令基于主题数量拆分 bundle：

```

bin/pulsar-admin namespaces split-bundle -b 0x00000000_0xffffffff --split-algorithm-name topic_count_equally_divide public/default

```

## 为 Pulsar SQL 支持 KeyValue schema
在 Pulsar 2.5.1 之前，Pulsar SQL 无法读取 keyValue schema 数据。在 Pulsar 2.5.1 中，我们为键字段名添加前缀 `key.`，为值字段名添加前缀 `value.`。因此，Pulsar SQL 可以读取 keyValue schema 数据。

## 更新 Netty 版本到 `4.1.45.Final`
Netty 4.1.43 有一个错误，阻止它使用 Linux 原生 Epoll 传输。这使得 Pulsar brokers 即使在 Linux 上运行也会回退到 NioEventLoopGroup。该错误在 Netty `4.1.45.Final` 中被修复。

## 改进 Key_Shared 订阅消息分发性能
在 Pulsar 2.5.1 中，为了提高 Key_Shared 订阅消息分发性能，我们进行了以下操作以节省 CPU 使用量，这可以提高非批处理消息分发性能：
- 减少为消息键进行哈希计算。
- 减少为消息键查找消费者的次数。

## 添加 Joda 时间逻辑类型转换
在 Pulsar 2.5.1 中，Avro 升级到 1.9.x，默认时间转换更改为 JSR-310。为了转发兼容性，我们在 Pulsar 2.5.1 中添加了 Joda 时间转换并默认启用。

## 支持在订阅赶上时删除非活动主题
在 Pulsar 2.5.1 之前，Pulsar 支持删除没有活跃生产者或订阅的非活动主题。在 Pulsar 2.5.1 中，我们在 `broker.conf` 中暴露非活动主题删除模式，以删除没有活跃生产者或消费者但主题的所有订阅都已赶上的非活动主题。您可以在 broker.conf 中启用此功能：

```

brokerDeleteInactiveTopicsMode=delete_when_subscriptions_caught_up

```

## 引入 maxMessagePublishBufferSizeInMB 配置以避免 broker OOM
在 Pulsar 2.5.1 之前，如果 broker 有较小的直接内存（例如 2G）并运行 pulsar-perf 写入消息，broker 会变得不稳定。因为 broker 自动从通道读取消息，并且 ByteBuf 在条目成功写入 Bookie 或超时到期之前无法释放。
在 Pulsar 2.5.1 中，我们引入了 `maxMessagePublishBufferSizeInMB` 配置以避免 broker OOM（内存不足）。如果处理消息大小超过此值，broker 将停止从连接读取数据。当可用大小大于 maxMessagePublishBufferSizeInMB 的一半时，broker 将自动开始从连接读取数据。您可以在 broker.conf 中设置发布缓冲区大小：

```

# Broker 处理生产者发送的消息的最大内存大小。
# 如果处理消息大小超过此值，broker 将停止从连接读取数据。
# 处理消息意味着消息已发送到 broker 但 broker 尚未向客户端发送响应，通常正在等待写入 bookies。
# 它在同一 broker 中运行的所有主题之间共享。
# 使用 -1 禁用内存限制。默认为直接内存的 1/2。
maxMessagePublishBufferSizeInMB=

```

## 支持 BouncyCastle FIPS provider
在 Pulsar 2.5.1 中，Pulsar 支持 BC-FIPS（BouncyCastle FIPS）provider。在 Pulsar 2.5.1 之前，Pulsar 只支持 BouncyCastle（BC）provider，并且 BC JARs 与 broker 和客户端代码紧密绑定。用户无法从 BC provider 切换到 BC-FIPS provider。此功能将 BC 依赖分离到单独的模块中。因此，用户可以自由地在 BC provider 和 BC-FIPS provider 之间切换。

## 允许租户管理员管理订阅权限
在之前的版本中，我们添加了支持授予订阅者权限来管理基于订阅的 API。但是，grant-subscription-permission API 需要超级用户访问权限，当许多租户想要授予订阅权限时，它对系统管理员造成了太多依赖。
在 Pulsar 2.5.1 中，通过 Restful API 或 Pulsar Admin，我们允许每个租户管理员管理订阅权限，以减少超级用户的管理工作。

## 允许在命名空间级别启用/禁用消息的延迟传递
在 Pulsar 2.5.1 中，我们为命名空间添加了 `set-delayed-delivery` 和 `set-delayed-delivery-time` 策略。因此，Pulsar 2.5.1 允许在命名空间级别启用或禁用消息的延迟传递。

## 支持命名空间级别的卸载器
在之前的版本中，卸载操作只有集群级配置。用户无法在命名空间级别设置卸载配置。在 Pulsar 2.5.1 中，我们支持使用 Pulsar Admin 在命名空间级别设置卸载器。

## 禁用主题自动创建时禁止管理员自动创建订阅
在之前的版本中，当在 KoP 中禁用自动主题创建时，使用 Flink Pulsar Source 创建非分区主题。为了修复这个错误，在 Pulsar 2.5.1 中，我们更改了管理员代码，在禁用自动主题创建时禁止管理员自动创建订阅。

## 为 Pulsar 客户端支持 Python 3.8
在 pulsar 2.5.1 中，我们添加了 `3.8 cp38-cp38` 来为 Pulsar 客户端支持 Python 3.8。因此，用户可以在 Python 3.8 上安装 Pulsar 客户端。

## 在 Debian/RPM cpp 客户端库中提供另一个 `libpulsarwithdeps.a`
Pulsar 2.5.1 主要在 Debian/RPM 中提供 2 个额外的 pulsar c++ 客户端库：
- pulsarSharedNossl (libpulsarnossl.so)：它类似于 pulsarShared(libpulsar.so)，没有静态链接的 SSL。
- pulsarStaticWithDeps(libpulsarwithdeps.a)：它类似于 pulsarStatic(libpulsar.a)，并在依赖库中静态存档了 `libboost_regex`、`libboost_system`、`libcurl`、`libprotobuf`、`libzstd` 和 `libz`。

## 参考
要下载 Apache Pulsar 2.5.1，点击[这里](https://pulsar.apache.org/download/)。
如果您有任何问题或建议，通过邮件列表或 slack 联系我们。
- [users@pulsar.apache.org](mailto:users@pulsar.apache.org)
- [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org)
- Pulsar slack 频道：https://apache-pulsar.slack.com/
- 在 https://apache-pulsar.herokuapp.com/ 自行注册
期待您对 [Pulsar](https://github.com/apache/pulsar) 的贡献。