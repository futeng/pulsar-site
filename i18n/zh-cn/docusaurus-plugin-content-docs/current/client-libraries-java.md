---
id: client-libraries-java
title: Pulsar Java 客户端
sidebar_label: "Java"
---

您可以使用 Pulsar Java 客户端在 Java 中创建 Pulsar [生产者](concepts-clients.md#producer)、[消费者](concepts-clients.md#consumer)和[读取器](concepts-clients.md#reader)，并执行[管理任务](admin-api-overview.md)。Java 客户端中的所有方法都是线程安全的。当前 Java 客户端版本是 **@pulsar:version@**。

## 入门指南

1. [设置 Java 客户端库](client-libraries-java-setup.md)
2. [初始化 Java 客户端](client-libraries-java-initialize.md)
3. [使用 Java 客户端](client-libraries-java-use.md)

:::note

请参阅 [Java 客户端性能考虑](client-libraries-java-setup.md#java-client-performance)以获取有关如何提高 Java 客户端性能以及调整 Java JVM 选项以避免高吞吐量应用程序中的 `java.lang.OutOfMemoryError: Direct buffer memory` 错误的更多信息。

:::

## 后续步骤

- [使用客户端](client-libraries-clients.md)
- [使用生产者](client-libraries-producers.md)
- [使用消费者](client-libraries-consumers.md)
- [使用读取器](client-libraries-readers.md)
- [使用 TableView](client-libraries-tableviews.md)
- [配置集群级故障转移](client-libraries-cluster-level-failover.md)

## 参考文档

#### API 参考

下表概述了 Pulsar Java 客户端的 API 包和参考文档。

包 | 描述 | Maven 构件
:-------|:------------|:--------------
[`org.apache.pulsar.client.api`](/api/client) | Java 客户端 API。<br/> 更多参考请参阅 [客户端 API 概述](pulsar-api-overview.md#pulsar-client-apis)。 | [org.apache.pulsar:pulsar-client:@pulsar:version@](http://search.maven.org/#artifactdetails%7Corg.apache.pulsar%7Cpulsar-client%7C@pulsar:version@%7Cjar)
[`org.apache.pulsar.client.admin`](/api/admin) | Java 管理 API。<br/> 更多参考请参阅 [管理 API 概述](admin-api-overview.md)。 | [org.apache.pulsar:pulsar-client-admin:@pulsar:version@](http://search.maven.org/#artifactdetails%7Corg.apache.pulsar%7Cpulsar-client-admin%7C@pulsar:version@%7Cjar)
`org.apache.pulsar.client.all` | 包含 `pulsar-client` 和 `pulsar-client-admin`。<br /> `pulsar-client` 和 `pulsar-client-admin` 都是独立的 Shade 处理包。因此，同时使用 `pulsar-client` 和 `pulsar-client-admin` 的应用程序具有冗余的 Shade 处理类。如果您引入新的依赖项但忘记更新 Shade 处理规则，这会很麻烦。<br /> 在这种情况下，您可以使用 `pulsar-client-all`，它只对依赖项进行一次 Shade 处理并减少依赖项的大小。 | [org.apache.pulsar:pulsar-client-all:@pulsar:version@](http://search.maven.org/#artifactdetails%7Corg.apache.pulsar%7Cpulsar-client-all%7C@pulsar:version@%7Cjar)

#### 更多参考

- [Java 客户端配置](pathname:///reference/#/@pulsar:version_reference@/client/)
- [发布说明](/release-notes/client-java)
- [客户端功能矩阵](/client-feature-matrix/)