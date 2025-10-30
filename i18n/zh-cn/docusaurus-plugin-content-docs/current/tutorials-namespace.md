---
Id: tutorials-namespace
title: Create a namespace
sidebar_label: "Create a namespace"
description: Learn how to create and verify a namespace in Pulsar.

---




[命名空间](concepts-multi-tenancy.md#namespaces)可以通过以下方式管理：

- pulsar-admin 工具的命名空间命令
- 管理 {@inject: rest:REST:/} API 的 /admin/v2/namespaces 端点
- Java API 中 PulsarAdmin 对象的命名空间方法

在本教程中，我们在租户 apache 中创建一个名为 pulsar 的命名空间。然后我们列出租户 apache 的命名空间，以查看命名空间是否创建成功。

要创建命名空间，请使用以下命令。

```bash
bin/pulsar-admin namespaces create apache/pulsar
```

要验证命名空间，请使用以下命令。

```bash
bin/pulsar-admin namespaces list apache
```

您应该看到类似的输出，显示命名空间 apache/pulsar 已成功创建。

#### 相关主题

- [设置租户](tutorials-tenant.md)
- [创建主题](tutorials-topic.md)
- [生产和消费消息](tutorials-produce-consume.md)
- [管理集群](admin-api-clusters.md)