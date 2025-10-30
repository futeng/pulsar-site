---
Id: tutorials-tenant
title: How to set up a tenant
sidebar_label: "Set up a tenant"
description: Learn how to set up a tenant in Pulsar.

---


Pulsar 是一个强大的消息系统，您可以用来处理和路由大量数据。每个[租户](concepts-multi-tenancy.md#tenants)提供一个独特的隔离单元，拥有自己的一套角色、权限、配置设置和书签。

在本教程中，您将在托管于 K8s helm 的 Pulsar 集群中创建一个名为 "apache" 的新租户。

要创建租户，请完成以下步骤。

1. 进入工具集容器。

   ```bash
   kubectl exec -it -n pulsar pulsar-mini-toolset-0 -- /bin/bash
   ```

2. 在工具集容器中，创建一个名为 apache 的租户。

   ```bash
   bin/pulsar-admin tenants create apache
   ```

3. 列出租户以查看租户是否创建成功。

   ```bash
   bin/pulsar-admin tenants list
   ```

   您应该看到如下类似的输出。

   ```
   The tenant apache has been successfully created.
   "apache"
   "public"
   "pulsar"
   ```

#### 相关主题

- [创建命名空间](tutorials-namespace.md)
- [创建 Topic](tutorials-topic.md)
- [在 Kubernetes 中运行独立集群](getting-started-helm.md)

