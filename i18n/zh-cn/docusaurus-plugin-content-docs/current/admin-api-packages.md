---
id: admin-api-packages
title: 管理包
sidebar_label: "包"
description: 学习如何使用 Pulsar CLI 和管理 API 管理包。
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

包管理器或包管理系统以一致的方式自动管理包。这些工具简化了用户的安装任务、升级过程和删除操作。包是包管理器处理的最小单位。在 Pulsar 中，包在租户级别和命名空间级别组织，以管理 Pulsar 函数和 Pulsar IO 连接器（即源和沉）。

## 什么是包？

包是用户希望在后继操作中重用的一组元素。在 Pulsar 中，包可以是一组函数、源和沉。您可以根据需要定义包。

Pulsar 中的包管理系统存储每个包的数据和元数据（如下表所示），并跟踪包的版本。

|元数据|描述|
|--|--|
|description|包的描述。|
|contact|包的联系信息。例如，开发团队的电子邮件地址。|
|create_time|包创建的时间。|
|modification_time|包最后修改的时间。|
|properties|用于存储其他信息的用户定义键/值映射。|

## 如何使用包

包可以高效地使用同一组函数和 IO 连接器。例如，您可以在多个命名空间中使用相同的函数、源和沉。主要步骤如下：

1. 通过提供以下信息在包管理器中创建包：类型、租户、命名空间、包名称和版本。

   |组件|描述|
   |-|-|
   |type|指定支持的包类型之一：function、sink 和 source。|
   |tenant|指定要在其中创建包的租户。|
   |namespace|指定要在其中创建包的命名空间。|
   |name|指定包的完整名称，使用格式 `<tenant>/<namespace>/<package name>`。|
   |version|使用数字格式 `MajorVerion.MinorVersion` 指定包的版本。|

   您提供的信息为包创建一个 URL，格式为 `<type>://<tenant>/<namespace>/<package name>/<version>`。

2. 将元素上传到包中，即您希望在跨命名空间中使用的函数、源和沉。

3. 从各种命名空间向此包应用权限。

现在，您可以通过从包管理器内调用此包来使用您在包中定义的元素。包管理器通过 URL 定位它。例如，

```
sink://public/default/mysql-sink@1.0
function://my-tenant/my-ns/my-function@0.1
source://my-tenant/my-ns/mysql-cdc-source@2.3
```

## Pulsar 中的包管理

您可以使用命令行工具、REST API 或 Java 客户端来管理 Pulsar 中的包资源。更具体地说，您可以使用这些工具[上传](#上传包)、[下载](#下载包)和[删除](#删除包)包，[获取包的元数据](#获取包的元数据)和[更新包的元数据](#更新包的元数据)，[获取包的版本](#列出包的所有版本)，以及[获取命名空间下特定类型的所有包](#列出命名空间下特定类型的所有包)。

要使用包管理服务，请确保通过在 `broker.conf` 中设置以下属性，在集群中启用了包管理服务。

:::note

包管理服务默认未启用。

:::

```properties
enablePackagesManagement=true
packagesManagementStorageProvider=org.apache.pulsar.packages.management.storage.bookkeeper.BookKeeperPackagesStorageProvider
packagesReplicas=1
packagesManagementLedgerRootPath=/ledgers
```

### 上传包

您可以使用以下命令上传包。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
bin/pulsar-admin packages upload function://public/default/example@v0.1 --path package-file --description package-description
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/packages/Packages_upload)

</TabItem>
<TabItem value="Java">

同步上传包到包管理服务。

```java
void upload(PackageMetadata metadata, String packageName, String path) throws PulsarAdminException;
```

异步上传包到包管理服务。

```java
CompletableFuture<Void> uploadAsync(PackageMetadata metadata, String packageName, String path);
```

</TabItem>

</Tabs>
````

### 下载包

您可以使用以下命令下载包。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
bin/pulsar-admin packages download function://public/default/example@v0.1 --path package-file
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/packages/Packages_download)

</TabItem>
<TabItem value="Java">

从包管理服务同步下载包。

```java
void download(String packageName, String path) throws PulsarAdminException;
```

从包管理服务异步下载包。

```java
CompletableFuture<Void> downloadAsync(String packageName, String path);
```

</TabItem>

</Tabs>
````

### 删除包

您可以使用以下命令删除包。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

以下命令删除版本 0.1 的包。

```shell
bin/pulsar-admin packages delete functions://public/default/example@v0.1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/packages/Packages_delete)

</TabItem>
<TabItem value="Java">

同步删除指定包。

```java
void delete(String packageName) throws PulsarAdminException;
```

异步删除指定包。

```java
CompletableFuture<Void> deleteAsync(String packageName);
```

</TabItem>

</Tabs>
````

### 获取包的元数据

您可以使用以下命令获取包的元数据。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
bin/pulsar-admin packages get-metadata function://public/default/test@v1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/packages/Packages_getMeta)

</TabItem>
<TabItem value="Java">

同步获取包的元数据。

```java
PackageMetadata getMetadata(String packageName) throws PulsarAdminException;
```

异步获取包的元数据。

```java
CompletableFuture<PackageMetadata> getMetadataAsync(String packageName);
```

</TabItem>

</Tabs>
````

### 更新包的元数据

您可以使用以下命令更新包的元数据。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
bin/pulsar-admin packages update-metadata function://public/default/example@v0.1 --description update-description
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/packages/Packages_updateMeta)

</TabItem>
<TabItem value="Java">

同步更新包的元数据。

```java
void updateMetadata(String packageName, PackageMetadata metadata) throws PulsarAdminException;
```

异步更新包的元数据。

```java
CompletableFuture<Void> updateMetadataAsync(String packageName, PackageMetadata metadata);
```

</TabItem>

</Tabs>
````

### 列出包的所有版本

您可以使用以下命令列出包的所有版本。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
bin/pulsar-admin packages list-versions type://tenant/namespace/packageName
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/packages/Packages_listPackageVersion)

</TabItem>
<TabItem value="Java">

同步列出包的所有版本。

```java
List<String> listPackageVersions(String packageName) throws PulsarAdminException;
```

异步列出包的所有版本。

```java
CompletableFuture<List<String>> listPackageVersionsAsync(String packageName);
```

</TabItem>

</Tabs>
````

### 列出命名空间下特定类型的所有包

您可以使用以下命令列出命名空间下特定类型的所有包。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
bin/pulsar-admin packages list --type function public/default
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/packages/Packages_listPackages)

</TabItem>
<TabItem value="Java">

同步列出命名空间下特定类型的所有包。

```java
List<String> listPackages(String type, String namespace) throws PulsarAdminException;
```

异步列出命名空间下特定类型的所有包。

```java
CompletableFuture<List<String>> listPackagesAsync(String type, String namespace);
```

</TabItem>

</Tabs>
````