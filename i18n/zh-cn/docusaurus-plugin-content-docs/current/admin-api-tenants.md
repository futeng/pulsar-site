---
id: admin-api-tenants
title: 管理租户
sidebar_label: "租户"
description: 学习如何使用 Pulsar CLI 和管理 API 管理租户。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


:::tip

 本页面仅显示**一些常用操作**。

 - 有关 `Pulsar admin` 的最新和完整信息，包括命令、标志、描述和更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

 - 有关 `REST API` 的最新和完整信息，包括参数、响应、示例和更多信息，请参阅 {@inject: rest:REST:/} API 文档。

 - 有关 `Java 管理 API` 的最新和完整信息，包括类、方法、描述和更多信息，请参阅 [Java 管理 API 文档](/api/admin/)。

:::

租户，像命名空间一样，可以使用[管理 API](admin-api-overview.md)进行管理。目前租户有两个可配置的方面：

* 管理角色
* 允许的集群

## 租户资源

### 列表

您可以列出与[实例](reference-terminology.md#instance)关联的所有租户。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`list`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/tenants?id=list) 子命令。

```shell
pulsar-admin tenants list
```

输出：

```
my-tenant-1
my-tenant-2
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/TenantsBase_getTenants)

</TabItem>
<TabItem value="Java">

```java
admin.tenants().getTenants();
```

</TabItem>

</Tabs>
````

### 创建

您可以创建新租户。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`create`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/tenants?id=create) 子命令：

```shell
pulsar-admin tenants create my-tenant
```

创建租户时，您可以选择使用 `-r`/`--admin-roles` 标志分配管理角色，使用 `-c`/`--allowed-clusters` 标志分配集群。您可以将多个值指定为逗号分隔的列表。以下是一些示例：

```shell
pulsar-admin tenants create my-tenant \
    --admin-roles role1,role2,role3 \
    --allowed-clusters cluster1
```

```shell
pulsar-admin tenants create my-tenant \
    -r role1 \
    -c cluster1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/TenantsBase_createTenant)

</TabItem>
<TabItem value="Java">

```java
admin.tenants().createTenant(tenantName, tenantInfo);
```

</TabItem>

</Tabs>
````

### 获取配置

您可以随时获取现有租户的[配置](reference-configuration.md)。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/tenants?id=get) 子命令并指定租户的名称。以下是一个示例：

```shell
pulsar-admin tenants get my-tenant
```

```json
{
  "adminRoles": [
    "admin1",
    "admin2"
  ],
  "allowedClusters": [
    "cl1",
    "cl2"
  ]
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/TenantsBase_getTenantAdmin)

</TabItem>
<TabItem value="Java">

```java
admin.tenants().getTenantInfo(tenantName);
```

</TabItem>

</Tabs>
````

### 删除

可以从 Pulsar [实例](reference-terminology.md#instance)中删除租户。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`delete`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/tenants?id=delete) 子命令并指定租户的名称。

```shell
pulsar-admin tenants delete my-tenant
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/TenantsBase_deleteTenant)

</TabItem>
<TabItem value="Java">

```java
admin.Tenants().deleteTenant(tenantName);
```

</TabItem>

</Tabs>
````

### 更新

您可以更新租户的配置。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`update`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/tenants?id=update) 子命令。

```shell
pulsar-admin tenants update my-tenant \
    --admin-roles role1,role2 \
    --allowed-clusters cluster1,cluster2
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/TenantsBase_updateTenant)

</TabItem>
<TabItem value="Java">

```java
admin.tenants().updateTenant(tenantName, tenantInfo);
```

</TabItem>

</Tabs>
````