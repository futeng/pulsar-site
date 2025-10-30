---
id: admin-api-permissions
title: 管理权限
sidebar_label: "权限"
description: 学习如何使用 Pulsar CLI 和管理 API 管理权限。
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

Pulsar 允许您向用户授予命名空间级别或主题级别的权限。

- 如果您向用户授予命名空间级别权限，则该用户可以访问该命名空间下的所有主题。

- 如果您向用户授予主题级别权限，则该用户只能访问该主题。

下面的章节演示了如何向用户授予命名空间级别权限。有关如何向用户授予主题级别权限，请参阅[管理主题](admin-api-topics.md#grant-permission)。

## 授予权限

您可以为特定角色授予操作列表的权限，例如 `produce` 和 `consume`。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`grant-permission`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=grant-permission) 子命令，使用 `--actions` 标志指定命名空间和操作，并使用 `--role` 标志指定角色：

```shell
pulsar-admin namespaces grant-permission test-tenant/namespace1 \
    --actions produce,consume \
    --role admin10
```

当在 `broker.conf` 中将 `authorizationAllowWildcardsMatching` 设置为 `true` 时，可以执行通配符授权。

**示例**

```shell
pulsar-admin namespaces grant-permission test-tenant/namespace1 \
      --actions produce,consume \
      --role 'my.role.*'
```

然后，角色 `my.role.1`、`my.role.2`、`my.role.foo`、`my.role.bar` 等可以进行生产和消费。

```shell
pulsar-admin namespaces grant-permission test-tenant/namespace1 \
      --actions produce,consume \
      --role '*.role.my'
```

然后，角色 `1.role.my`、`2.role.my`、`foo.role.my`、`bar.role.my` 等可以进行生产和消费。

:::note

通配符匹配**仅在角色名称的开头或结尾**有效。

:::

**示例**

```shell
pulsar-admin namespaces grant-permission test-tenant/namespace1 \
      --actions produce,consume \
      --role 'my.*.role'
```

在这种情况下，只有角色 `my.*.role` 具有权限。
角色 `my.1.role`、`my.2.role`、`my.foo.role`、`my.bar.role` 等**不能**进行生产和消费。

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_grantPermissionOnNamespace)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().grantPermissionOnNamespace(namespace, role, getAuthActions(actions));
```

</TabItem>

</Tabs>
````

## 获取权限

您可以查看在命名空间中已向哪些角色授予了哪些权限。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`permissions`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=grant-permission) 子命令并指定命名空间：

```shell
pulsar-admin namespaces permissions test-tenant/namespace1
```

示例输出：

```
my.role.*    [produce, consume]
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getPermissions)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getPermissions(namespace);
```

</TabItem>

</Tabs>
````

## 撤销权限

您可以从特定角色撤销权限，这意味着这些角色将不再能够访问指定的命名空间。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`revoke-permission`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=revoke-permission) 子命令，使用 `--role` 标志指定命名空间和角色：

```shell
pulsar-admin namespaces revoke-permission test-tenant/namespace1 \
      --role admin10
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_revokePermissionsOnNamespace)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().revokePermissionsOnNamespace(namespace, role);
```

</TabItem>

</Tabs>
````