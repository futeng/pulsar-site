---
id: admin-api-schemas
title: 管理模式
sidebar_label: "模式"
description: 学习如何使用 Pulsar CLI 和管理 API 管理模式。
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

## 管理模式

### 上传模式

要为主题上传（注册）新模式，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `upload` 子命令。

```bash
pulsar-admin schemas upload --filename <模式定义文件> <主题名称>
```

`模式定义文件` 是 JSON 格式。

```json
{
    "type": "<模式类型>",
    "schema": "<模式定义数据的 UTF8 编码字符串>",
    "properties": {} // 与模式关联的属性
}
```

</TabItem>
<TabItem value="REST API">

向文档中的端点发送 `POST` 请求：[](swagger:/admin/v2/SchemasResource_postSchema)

以下是使用存储在 `schema.json` 文件中的有效负载、运行在 `localhost` 上的 Pulsar broker 以及主题 `my-tenant/my-ns/my-topic` 的 CURL 示例：

```bash
curl -X POST -H 'Content-Type: application/json' -d @schema.json http://localhost:8080/admin/v2/schemas/my-tenant/my-ns/my-topic/schema
```

post 有效负载是 JSON 格式。

```json
{
    "type": "<模式类型>",
    "schema": "<模式定义数据的 UTF8 编码字符串>",
    "properties": {} // 与模式关联的属性
}
```

</TabItem>
<TabItem value="Java">

`PulsarAdmin` 客户端上的方法是：
```java
void createSchema(String topic, PostSchemaPayload schemaPayload)
```

以下是 `PostSchemaPayload` 的示例：

```java
PulsarAdmin admin = …;

PostSchemaPayload payload = new PostSchemaPayload();
payload.setType("INT8");
payload.setSchema("");

admin.createSchema("my-tenant/my-ns/my-topic", payload);
```

如果模式是**原始类型**模式，`schema` 字段必须为空。
如果模式是**结构体**模式，此字段必须是 Avro 模式定义的 JSON 字符串。

</TabItem>
</Tabs>
````

有效负载包括以下字段：

| 字段        | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`       | <li>原始类型模式的允许值在以下页面列出：[原始类型](schema-understand.md#primitive-type)</li><li>结构体类型模式的允许值是 **AVRO**、**PROTOBUF**、**PROTOBUF_NATIVE** 和 **JSON**。</li>                                                                                                                                                                                           |
| `schema`     | 模式定义数据，使用 UTF 8 字符集编码。<li>如果模式类型是 **AVRO**、**PROTOBUF** 或 **JSON** 模式，此字段应该是 JSON 格式的 <a href="https://avro.apache.org/docs/1.11.1/specification/" target="blank">Avro 模式定义</a>。</li><li>如果模式类型是 **PROTOBUF_NATIVE** 模式，此字段应包含 Protobuf 描述符。</li><li>否则，此字段应为空。</li> |
| `properties` | 与模式关联的附加属性。                                                                                                                                                                                                                                                                                                                                                                                              |

以下是 JSON 模式的示例。

**示例**

```json
{
    "type": "JSON",
    "schema": "{\"type\":\"record\",\"name\":\"User\",\"namespace\":\"com.foo\",\"fields\":[{\"name\":\"file1\",\"type\":[\"null\",\"string\"],\"default\":null},{\"name\":\"file2\",\"type\":[\"null\",\"string\"],\"default\":null},{\"name\":\"file3\",\"type\":[\"string\",\"null\"],\"default\":\"dfdf\"}]}",
    "properties": {}
}
```

### 获取最新模式

要获取主题的最新模式，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `get` 子命令。

```bash
pulsar-admin schemas get <主题名称>
```

示例输出：

```json
{
    "version": 0,
    "type": "String",
    "timestamp": 0,
    "data": "string",
    "properties": {
        "property1": "string",
        "property2": "string"
    }
}
```

</TabItem>
<TabItem value="REST API">

向此端点发送 `GET` 请求：[](swagger:/admin/v2/SchemasResource_getSchema?summary=!version)

以下是响应示例，以 JSON 格式返回。

```json
{
    "version": "<模式的版本号>",
    "type": "<模式类型>",
    "timestamp": "<模式版本的创建时间戳>",
    "data": "<模式定义数据的 UTF8 编码字符串>",
    "properties": {} // 与模式关联的属性
}
```

</TabItem>
<TabItem value="Java">

```java
SchemaInfo createSchema(String topic)
```

以下是 `SchemaInfo` 的示例：

```java
PulsarAdmin admin = …;

SchemaInfo si = admin.getSchema("my-tenant/my-ns/my-topic");
```

</TabItem>
</Tabs>
````

### 获取特定模式

要获取模式的特定版本，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `get` 子命令。

```bash
pulsar-admin schemas get <主题名称> --version <版本>
```

</TabItem>
<TabItem value="REST API">

向模式端点发送 `GET` 请求：[](swagger:/admin/v2/SchemasResource_getSchema?summary=version)

以下是响应示例，以 JSON 格式返回。

```json
{
    "version": "<模式的版本号>",
    "type": "<模式类型>",
    "timestamp": "<模式版本的创建时间戳>",
    "data": "<模式定义数据的 UTF8 编码字符串>",
    "properties": {} // 与模式关联的属性
}
```

</TabItem>
<TabItem value="Java">

```java
SchemaInfo createSchema(String topic, long version)
```

以下是 `SchemaInfo` 的示例：

```java
PulsarAdmin admin = …;

SchemaInfo si = admin.getSchema("my-tenant/my-ns/my-topic", 1L);
```

</TabItem>
</Tabs>
````

### 提取模式

要通过主题提取（提供）模式，请使用以下方法。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"}]}>

<TabItem value="Admin CLI">

使用 `extract` 子命令。

```bash
pulsar-admin schemas extract --classname <类名> --jar <绝对 jar 路径> --type <类型名称>
```

</TabItem>
</Tabs>
````

### 删除模式

:::note

在任何情况下，`delete` 操作都会删除为主题注册的模式的**所有版本**。

:::

要删除主题的模式，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `delete` 子命令。

```bash
pulsar-admin schemas delete <主题名称>
```

</TabItem>
<TabItem value="REST API">

向模式端点发送 `DELETE` 请求：[](swagger:/admin/v2/SchemasResource_deleteSchema)

以下是 JSON 格式返回的响应示例。

```json
{
    "version": "<模式的最新版本号>",
}
```

</TabItem>
<TabItem value="Java">

```java
void deleteSchema(String topic)
```

以下是删除模式的示例。

```java
PulsarAdmin admin = …;

admin.deleteSchema("my-tenant/my-ns/my-topic");
```

</TabItem>
</Tabs>
````

## 管理模式自动更新

### 启用模式自动更新

要在命名空间级别启用/强制模式自动更新，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `set-is-allow-auto-update-schema` 子命令。

```bash
bin/pulsar-admin namespaces set-is-allow-auto-update-schema --enable tenant/namespace
```

</TabItem>
<TabItem value="REST API">

向命名空间端点发送 `POST` 请求：[](swagger:/admin/v2/Namespaces_setIsAllowAutoUpdateSchema)

post 有效负载是 JSON 格式。

```json
{
"isAllowAutoUpdateSchema": "true"
}
```

</TabItem>
<TabItem value="Java">

以下是为租户/命名空间启用模式自动更新的示例。

```java
admin.namespaces().setIsAllowAutoUpdateSchema("my-namspace", true);
```

</TabItem>
</Tabs>
````

### 禁用模式自动更新

:::note

当禁用模式自动更新时，您只能[注册新模式](#upload-a-schema)。

:::

要在**命名空间**级别禁用模式自动更新，您可以使用以下命令之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `set-is-allow-auto-update-schema` 子命令。

```bash
bin/pulsar-admin namespaces set-is-allow-auto-update-schema --disable tenant/namespace
```

</TabItem>
<TabItem value="REST API">

向命名空间端点发送 `POST` 请求：[](swagger:/admin/v2/Namespaces_setIsAllowAutoUpdateSchema)

post 有效负载是 JSON 格式。

```json
{
"isAllowAutoUpdateSchema": "false"
}
```

</TabItem>
<TabItem value="Java">

以下是为租户/命名空间启用模式自动更新的示例。

```java
admin.namespaces().setIsAllowAutoUpdateSchema("my-namspace", false);
```

</TabItem>
</Tabs>
````

## 管理模式验证强制执行

### 启用模式验证强制执行

要在**集群**级别强制模式验证强制执行，您可以在 `conf/broker.conf` 文件中将 `isSchemaValidationEnforced` 配置为 `true`。

要在**命名空间**级别启用模式验证强制执行，您可以使用以下命令之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `set-schema-validation-enforce` 子命令。

```bash
bin/pulsar-admin namespaces set-schema-validation-enforce --enable tenant/namespace
```

</TabItem>
<TabItem value="REST API">

向命名空间端点发送 `POST` 请求：[](swagger:/admin/v2/Namespaces_setSchemaValidationEnforced)

post 有效负载是 JSON 格式。

```json
{
"schemaValidationEnforced": "true"
}
```

</TabItem>
<TabItem value="Java">

以下是为租户/命名空间启用模式验证强制执行的示例。

```java
admin.namespaces().setSchemaValidationEnforced("my-namspace", true);
```

</TabItem>
</Tabs>
````

### 禁用模式验证强制执行

要在**命名空间**级别禁用模式验证强制执行，您可以使用以下命令之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 `set-schema-validation-enforce` 子命令。

```bash
bin/pulsar-admin namespaces set-schema-validation-enforce --disable tenant/namespace
```

</TabItem>
<TabItem value="REST API">

向命名空间端点发送 `POST` 请求：[](swagger:/admin/v2/Namespaces_setSchemaValidationEnforced)

post 有效负载是 JSON 格式。

```json
{
"schemaValidationEnforced": "false"
}
```

</TabItem>
<TabItem value="Java">

以下是为租户/命名空间启用模式验证强制执行的示例。

```java
admin.namespaces().setSchemaValidationEnforced("my-namspace", false);
```

</TabItem>
</Tabs>
````

## 管理模式兼容性策略

在不同级别配置的[模式兼容性检查策略](schema-understand.md#schema-compatibility-check-strategy)具有优先级：主题级别 > 命名空间级别 > 集群级别。换句话说：
  * 如果您在主题和命名空间级别都设置了策略，则使用主题级别的策略。
  * 如果您在命名空间和集群级别都设置了策略，则使用命名空间级别的策略。

### 设置模式兼容性策略

#### 设置主题级别模式兼容性策略

要在主题级别设置模式兼容性检查策略，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 [`pulsar-admin topicPolicies set-schema-compatibility-strategy`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topicPolicies?id=set-schema-compatibility-strategy) 命令。

```shell
pulsar-admin topicPolicies set-schema-compatibility-strategy <策略> <主题名称>
```

</TabItem>
<TabItem value="REST API">

向此端点发送 `PUT` 请求：[](swagger:/admin/v2/PersistentTopics_setSchemaCompatibilityStrategy)

</TabItem>
<TabItem value="Java">

```java
void setSchemaCompatibilityStrategy(String topic, SchemaCompatibilityStrategy strategy)
```

以下是在主题级别设置模式兼容性检查策略的示例。

```java
PulsarAdmin admin = …;

admin.topicPolicies().setSchemaCompatibilityStrategy("my-tenant/my-ns/my-topic", SchemaCompatibilityStrategy.ALWAYS_INCOMPATIBLE);
```

</TabItem>
</Tabs>
````

#### 设置命名空间级别模式兼容性策略

要在命名空间级别设置模式兼容性检查策略，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 [`pulsar-admin namespaces set-schema-compatibility-strategy`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=set-schema-compatibility-strategy) 命令。

```shell
pulsar-admin namespaces set-schema-compatibility-strategy 选项
```

</TabItem>
<TabItem value="REST API">

向此端点发送 `PUT` 请求：[](swagger:/admin/v2/Namespaces_setSchemaCompatibilityStrategy)

</TabItem>
<TabItem value="Java">

使用 [`setSchemaCompatibilityStrategy`](/api/admin/) 方法。

```java
admin.namespaces().setSchemaCompatibilityStrategy("test", SchemaCompatibilityStrategy.FULL);
```

</TabItem>
</Tabs>
````

#### 设置集群级别模式兼容性策略

要在**集群**级别设置模式兼容性检查策略，请在 `conf/broker.conf` 文件中设置 `schemaCompatibilityStrategy`。

以下是示例：

```conf
schemaCompatibilityStrategy=ALWAYS_INCOMPATIBLE
```

### 获取模式兼容性策略

#### 获取主题级别模式兼容性策略

要获取主题级别的模式兼容性检查策略，您可以使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 [`pulsar-admin topicPolicies get-schema-compatibility-strategy`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topicPolicies?id=get-schema-compatibility-strategy) 命令。

```shell
pulsar-admin topicPolicies get-schema-compatibility-strategy <主题名称>
```

</TabItem>
<TabItem value="REST API">

向此端点发送 `GET` 请求：[](swagger:/admin/v2/PersistentTopics_getSchemaCompatibilityStrategy)

</TabItem>
<TabItem value="Java">

```java
SchemaCompatibilityStrategy getSchemaCompatibilityStrategy(String topic, boolean applied)
```

以下是获取主题级别模式兼容性检查策略的示例。

```java
PulsarAdmin admin = …;

// 获取当前应用的兼容性策略
admin.topicPolicies().getSchemaCompatibilityStrategy("my-tenant/my-ns/my-topic", true);

// 仅从主题策略获取兼容性策略
admin.topicPolicies().getSchemaCompatibilityStrategy("my-tenant/my-ns/my-topic", false);
```

</TabItem>
</Tabs>
````

#### 获取命名空间级别模式兼容性策略

您可以使用以下方法之一获取命名空间级别的模式兼容性检查策略。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="Admin CLI">

使用 [`pulsar-admin namespaces get-schema-compatibility-strategy`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=get-schema-compatibility-strategy) 命令。

```shell
pulsar-admin namespaces get-schema-compatibility-strategy 选项
```

</TabItem>
<TabItem value="REST API">

向此端点发送 `GET` 请求：[](swagger:/admin/v2/Namespaces_getSchemaCompatibilityStrategy)

</TabItem>
<TabItem value="Java">

使用 [`getSchemaCompatibilityStrategy`](/api/admin/) 方法。

```java
admin.namespaces().getSchemaCompatibilityStrategy("test", SchemaCompatibilityStrategy.FULL);
```

</TabItem>
</Tabs>
````