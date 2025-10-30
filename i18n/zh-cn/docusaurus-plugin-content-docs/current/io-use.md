---
id: io-use
title: How to use Pulsar connectors
sidebar_label: "Use"
description: Get started to use Pulsar connectors.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


本指南描述如何使用 Pulsar 连接器。

## 安装连接器

Pulsar 捆绑了几个[内置连接器](io-connectors.md)，用于在常用系统（如数据库和消息系统）之间移动数据。或者，您可以创建和使用所需的自定义非内置连接器。

:::note

使用非内置连接器时，您需要指定连接器的存档文件路径。

:::

要设置内置连接器，请按照[说明](io-quickstart.md#install-pulsar-and-built-in-connector)操作。

设置完成后，内置连接器会被 Pulsar broker（或 function-worker）自动发现，因此不需要额外的安装步骤。

## 配置连接器

您可以配置以下信息：

* [为内置连接器配置默认存储位置](#为内置连接器配置默认存储位置)

* [使用 YAML 文件配置连接器](#使用-yaml-文件配置连接器)

### 为内置连接器配置默认存储位置

要为内置连接器配置默认文件夹，请在 `./conf/functions_worker.yml` 配置文件中设置 `connectorsDirectory` 参数。

**示例**

将 `./connectors` 文件夹设置为内置连接器的默认存储位置。

```shell
########################
# Connectors
########################

connectorsDirectory: ./connectors
```

### 使用 YAML 文件配置连接器

要配置连接器，您需要在创建连接器时提供 YAML 配置文件。

YAML 配置文件告诉 Pulsar 在哪里定位连接器以及如何将连接器与 Pulsar Topic 连接。

**示例 1**

下面是一个 Cassandra sink 的 YAML 配置文件，它告诉 Pulsar：

* 连接到哪个 Cassandra 集群

* 在 Cassandra 中用于收集数据的 `keyspace` 和 `columnFamily`

* 如何将 Pulsar 消息映射到 Cassandra 表的键和列

```yaml
tenant: public
namespace: default
name: cassandra-test-sink
...
# cassandra specific config
configs:
    roots: "localhost:9042"
    keyspace: "pulsar_test_keyspace"
    columnFamily: "pulsar_test_table"
    keyname: "key"
    columnName: "col"
```

**示例 2**

下面是一个 Kafka source 的 YAML 配置文件。

```yaml
configs:
   bootstrapServers: "pulsar-kafka:9092"
   groupId: "test-pulsar-io"
   topic: "my-topic"
   sessionTimeoutMs: "10000"
   autoCommitEnabled: "false"
```

**示例 3**

下面是一个 PostgreSQL JDBC sink 的 YAML 配置文件。

```yaml
configs:
   userName: "postgres"
   password: "password"
   jdbcUrl: "jdbc:postgresql://localhost:5432/test_jdbc"
   tableName: "test_jdbc"
```

## 准备连接器

在开始使用连接器之前，您可以执行以下操作：

* [重新加载连接器](#重新加载)

* [获取可用连接器列表](#可用连接器)

### `重新加载`

如果您在连接器文件夹中添加或删除了 nar 文件，请在使用前重新加载可用的内置连接器。

#### Source

要重新加载 source 连接器，可以使用 `reload` 子命令。

```shell
pulsar-admin sources reload
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

#### Sink

要重新加载 sink 连接器，可以使用 `reload` 子命令。

```shell
pulsar-admin sinks reload
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

### `可用连接器`

重新加载连接器后（可选），您可以获取可用连接器列表。

#### Source

要获取 source 连接器列表，可以使用 `available-sources` 子命令。

```shell
pulsar-admin sources available-sources
```

#### Sink

要获取 sink 连接器列表，可以使用 `available-sinks` 子命令。

```shell
pulsar-admin sinks available-sinks
```

## 运行连接器

要运行连接器，您可以执行以下操作：

* [创建连接器](#创建)

* [启动连接器](#启动)

* [在本地运行连接器](#本地运行)

### `创建`

要创建连接器，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要创建 source 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `create` 子命令。

```shell
pulsar-admin sources create options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_registerSource)

</TabItem>
<TabItem value="Java Admin API">

* 使用**本地文件**创建 source 连接器。

  ```java
  void createSource(SourceConfig sourceConfig,
                    String fileName)
             throws PulsarAdminException
  ```

  **参数**

  |名称|描述
  |---|---
  `sourceConfig` | source 配置对象

   **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`createSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#createSource-SourceConfig-java.lang.String-)。

* 使用可以从其下载 fun-pkg 的 URL 的**远程文件**创建 source 连接器。

  ```java
  void createSourceWithUrl(SourceConfig sourceConfig,
                           String pkgUrl)
                    throws PulsarAdminException
  ```

  支持的 URL 为 `http` 和 `file`。

  **示例**

  * HTTP: http://www.repo.com/fileName.jar

  * File: file:///dir/fileName.jar

  **参数**

  参数| 描述
  |---|---
  `sourceConfig` | source 配置对象
  `pkgUrl` | 可以从中下载 pkg 的 URL

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`createSourceWithUrl`](/api/admin/org/apache/pulsar/client/admin/Source.html#createSourceWithUrl-SourceConfig-java.lang.String-)。

</TabItem>

</Tabs>
````

#### Sink

要创建 sink 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `create` 子命令。

```shell
pulsar-admin sinks create options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `POST` 请求：[](swagger:/admin/v3/sink/SinksBase_registerSink)

</TabItem>
<TabItem value="Java Admin API">

* 使用**本地文件**创建 sink 连接器。

  ```java
  void createSink(SinkConfig sinkConfig,
                  String fileName)
           throws PulsarAdminException
  ```

  **参数**

  |名称|描述
  |---|---
  `sinkConfig` | sink 配置对象

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`createSink`](/api/admin/org/apache/pulsar/client/admin/Sink.html#createSink-SinkConfig-java.lang.String-)。

* 使用可以从其下载 fun-pkg 的 URL 的**远程文件**创建 sink 连接器。

  ```java
  void createSinkWithUrl(SinkConfig sinkConfig,
                      String pkgUrl)
                  throws PulsarAdminException
  ```

  支持的 URL 为 `http` 和 `file`。

  **示例**

  * HTTP: http://www.repo.com/fileName.jar

  * File: file:///dir/fileName.jar

  **参数**

  参数| 描述
  |---|---
  `sinkConfig` | sink 配置对象
  `pkgUrl` | 可以从中下载 pkg 的 URL

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`createSinkWithUrl`](/api/admin/org/apache/pulsar/client/admin/Sink.html#createSinkWithUrl-SinkConfig-java.lang.String-)。

</TabItem>

</Tabs>
````

### `启动`

要启动连接器，可以使用 **Admin CLI** 或 **REST API**。

#### Source

要启动 source 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"}]}>

<TabItem value="Admin CLI">

使用 `start` 子命令。

```shell
pulsar-admin sources start options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 启动**所有** source 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_startSource?summary=all)

* 启动**指定**的 source 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_startSource?summary=!all)

</TabItem>

</Tabs>
````

#### Sink

要启动 sink 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"}]}>

<TabItem value="Admin CLI">

使用 `start` 子命令。

```shell
pulsar-admin sinks start options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 启动**所有** sink 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/sink/SinksBase_startSink?summary=all)

* 启动**指定**的 sink 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/sink/SinksBase_startSink?summary=!all)

</TabItem>

</Tabs>
````

### `本地运行`

要在本地运行连接器而不是在 Pulsar 集群上部署，可以使用 **Admin CLI**

#### Source

要在本地运行 source 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"}]}>

<TabItem value="Admin CLI">

使用 `localrun` 子命令。

```shell
pulsar-admin sources localrun options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>

</Tabs>
````

#### Sink

要在本地运行 sink 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"}]}>

<TabItem value="Admin CLI">

使用 `localrun` 子命令。

```shell
pulsar-admin sinks localrun options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。
</TabItem>

</Tabs>
````

## 在 sink 连接器之前运行 Pulsar Function

您可以在 sink 连接器之前在内存中运行 [Pulsar Function](functions-overview.md)。有关详细信息，请参阅 [PIP 193：Sink 预处理 Function](https://github.com/apache/pulsar/issues/16739)。
在 sink 连接器之前在内存中运行 Pulsar Function 提供了比通过中间 topic 更低的延迟、更少的 I/O 和磁盘消耗。
创建 sink 连接器时使用 `--transform-function`、`--transform-function-classname` 和 `--transform-function-config` 选项来配置要运行的转换 Function。

有关最新和完整信息，请参阅 [Pulsar admin sinks 命令文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/sinks)。

## 监控连接器

要监控连接器，您可以执行以下操作：

* [获取连接器信息](#获取信息)

* [获取所有正在运行的连接器列表](#获取列表)

* [获取连接器的当前状态](#获取状态)

### `获取信息`

要获取连接器信息，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要获取 source 连接器的信息，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `get` 子命令。

```shell
pulsar-admin sources get options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `GET` 请求：[](swagger:/admin/v3/source/SourcesBase_getSourceInfo)

</TabItem>
<TabItem value="Java Admin API">

```java
SourceConfig getSource(String tenant,
                       String namespace,
                       String source)
                throws PulsarAdminException
```

**示例**

这是一个 sourceConfig。

```java
{
 "tenant": "tenantName",
 "namespace": "namespaceName",
 "name": "sourceName",
 "className": "className",
 "topicName": "topicName",
 "configs": {},
 "parallelism": 1,
 "processingGuarantees": "ATLEAST_ONCE",
 "resources": {
   "cpu": 1.0,
   "ram": 1073741824,
   "disk": 10737418240
 }
}
```

这是一个 sourceConfig 示例。

```json
{
 "tenant": "public",
 "namespace": "default",
 "name": "debezium-mysql-source",
 "className": "org.apache.pulsar.io.debezium.mysql.DebeziumMysqlSource",
 "topicName": "debezium-mysql-topic",
 "configs": {
   "database.user": "debezium",
   "database.server.id": "184054",
   "database.server.name": "dbserver1",
   "database.port": "3306",
   "database.hostname": "localhost",
   "database.password": "dbz",
   "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650",
   "value.converter": "org.apache.kafka.connect.json.JsonConverter",
   "database.whitelist": "inventory",
   "key.converter": "org.apache.kafka.connect.json.JsonConverter",
   "database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory",
   "pulsar.service.url": "pulsar://127.0.0.1:6650",
   "database.history.pulsar.topic": "history-topic2"
 },
 "parallelism": 1,
 "processingGuarantees": "ATLEAST_ONCE",
 "resources": {
   "cpu": 1.0,
   "ram": 1073741824,
   "disk": 10737418240
 }
}
```

**异常**

异常名称 | 描述
|---|---
`PulsarAdminException.NotAuthorizedException` | 您没有管理权限
`PulsarAdminException.NotFoundException` | 集群不存在
`PulsarAdminException` | 意外错误

有关更多信息，请参阅 [`getSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#getSource-java.lang.String-java.lang.String-java.lang.String-)。

</TabItem>

</Tabs>
````

#### Sink

要获取 sink 连接器的信息，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `get` 子命令。

```shell
pulsar-admin sinks get options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `GET` 请求：[](swagger:/admin/v3/sink/SinksBase_getSinkInfo)

</TabItem>
<TabItem value="Java Admin API">

```java
SinkConfig getSink(String tenant,
                   String namespace,
                   String sink)
            throws PulsarAdminException
```

**示例**

这是一个 sinkConfig。

```json
{
"tenant": "tenantName",
"namespace": "namespaceName",
"name": "sinkName",
"className": "className",
"inputSpecs": {
"topicName": {
    "isRegexPattern": false
}
},
"configs": {},
"parallelism": 1,
"processingGuarantees": "ATLEAST_ONCE",
"retainOrdering": false,
"autoAck": true
}
```

这是一个 sinkConfig 示例。

```json
{
  "tenant": "public",
  "namespace": "default",
  "name": "pulsar-postgres-jdbc-sink",
  "className": "org.apache.pulsar.io.jdbc.PostgresJdbcAutoSchemaSink",
  "inputSpecs": {
  "pulsar-postgres-jdbc-sink-topic": {
     "isRegexPattern": false
    }
  },
  "configs": {
    "password": "password",
    "jdbcUrl": "jdbc:postgresql://localhost:5432/pulsar_postgres_jdbc_sink",
    "userName": "postgres",
    "tableName": "pulsar_postgres_jdbc_sink"
  },
  "parallelism": 1,
  "processingGuarantees": "ATLEAST_ONCE",
  "retainOrdering": false,
  "autoAck": true
}
```

**参数描述**

名称| 描述
|---|---
`tenant` | 租户名称
`namespace` | 命名空间名称
`sink` | Sink 名称

有关更多信息，请参阅 [`getSink`](/api/admin/org/apache/pulsar/client/admin/Sink.html#getSink-java.lang.String-java.lang.String-java.lang.String-)。

</TabItem>

</Tabs>
````

### `获取列表`

要获取所有正在运行的连接器列表，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要获取所有正在运行的 source 连接器列表，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `list` 子命令。

```shell
pulsar-admin sources list options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `GET` 请求：[](swagger:/admin/v3/source/SourcesBase_listSources)

</TabItem>
<TabItem value="Java Admin API">

```java
List<String> listSources(String tenant,
                         String namespace)
                  throws PulsarAdminException
```

**响应示例**

```java
["f1", "f2", "f3"]
```

**异常**

异常名称 | 描述
|---|---
`PulsarAdminException.NotAuthorizedException` | 您没有管理权限
`PulsarAdminException` | 意外错误

有关更多信息，请参阅 [`listSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#listSources-java.lang.String-java.lang.String-)。

</TabItem>

</Tabs>
````

#### Sink

要获取所有正在运行的 sink 连接器列表，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `list` 子命令。

```shell
pulsar-admin sinks list options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `GET` 请求：[](swagger:/admin/v3/sink/SinksBase_listSinks)

</TabItem>
<TabItem value="Java Admin API">

```java
List<String> listSinks(String tenant,
                       String namespace)
                throws PulsarAdminException
```

**响应示例**

```java
["f1", "f2", "f3"]
```

**异常**

异常名称 | 描述
|---|---
`PulsarAdminException.NotAuthorizedException` | 您没有管理权限
`PulsarAdminException` | 意外错误

有关更多信息，请参阅 [`listSource`](/api/admin/org/apache/pulsar/client/admin/Sink.html#listSinks-java.lang.String-java.lang.String-)。

</TabItem>

</Tabs>
````

### `获取状态`

要获取连接器的当前状态，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要获取 source 连接器的当前状态，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `status` 子命令。

```shell
pulsar-admin sources status options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 获取**所有** source 连接器的当前状态。

  向此端点发送 `GET` 请求：[](swagger:/admin/v3/source/SourcesBase_getSourceStatus)

* 获取**指定** source 连接器的当前状态。

  向此端点发送 `GET` 请求：[](swagger:/admin/v3/source/SourcesBase_getSourceStatus)

</TabItem>
<TabItem value="Java Admin API">

* 获取**所有** source 连接器的当前状态。

  ```java
  SourceStatus getSourceStatus(String tenant,
                              String namespace,
                              String source)
                      throws PulsarAdminException
  ```

  **参数**

  参数| 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `sink` | Source 名称

  **异常**

  名称 | 描述
  |---|---
  `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`getSourceStatus`](/api/admin/org/apache/pulsar/client/admin/Source.html#getSource-java.lang.String-java.lang.String-java.lang.String-)。

* 获取**指定** source 连接器的当前状态。

  ```java
  SourceStatus.SourceInstanceStatus.SourceInstanceStatusData getSourceStatus(String tenant,
                                                                             String namespace,
                                                                             String source,
                                                                             int id)
                                                                      throws PulsarAdminException
  ```

  **参数**

  参数| 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `sink` | Source 名称
  `id` | Source 实例ID

  **异常**

  异常名称 | 描述
  |---|---
  `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`getSourceStatus`](/api/admin/org/apache/pulsar/client/admin/Source.html#getSourceStatus-java.lang.String-java.lang.String-java.lang.String-int-)。

</TabItem>

</Tabs>
````

#### Sink

要获取 Pulsar sink 连接器的当前状态，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `status` 子命令。

```shell
pulsar-admin sinks status options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 获取**所有** sink 连接器的当前状态。

  向此端点发送 `GET` 请求：[](swagger:/admin/v3/sink/SinksBase_getSinkStatus)

* 获取**指定** sink 连接器的当前状态。

  向此端点发送 `GET` 请求：[](swagger:/admin/v3/sink/SinksBase_getSinkInstanceStatus)

</TabItem>
<TabItem value="Java Admin API">

* 获取**所有** sink 连接器的当前状态。

  ```java
  SinkStatus getSinkStatus(String tenant,
                           String namespace,
                           String sink)
                    throws PulsarAdminException
  ```

  **参数**

  参数| 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `sink` | Source 名称

  **异常**

  异常名称 | 描述
  |---|---
  `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`getSinkStatus`](/api/admin/org/apache/pulsar/client/admin/Sink.html#getSinkStatus-java.lang.String-java.lang.String-java.lang.String-)。

* 获取**指定** source 连接器的当前状态。

  ```java
  SinkStatus.SinkInstanceStatus.SinkInstanceStatusData getSinkStatus(String tenant,
                                                                     String namespace,
                                                                     String sink,
                                                                     int id)
                                                              throws PulsarAdminException
  ```

  **参数**

  参数| 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `sink` | Source 名称
  `id` | Sink 实例ID

  **异常**

  异常名称 | 描述
  |---|---
  `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`getSinkStatusWithInstanceID`](/api/admin/org/apache/pulsar/client/admin/Sink.html#getSinkStatus-java.lang.String-java.lang.String-java.lang.String-int-)。

</TabItem>

</Tabs>
````

## 更新连接器

### `更新`

要更新正在运行的连接器，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要更新正在运行的 Pulsar source 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `update` 子命令。

```shell
pulsar-admin sources update options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `PUT` 请求：[](swagger:/admin/v3/source/SourcesBase_updateSource)

</TabItem>
<TabItem value="Java Admin API">

* 使用**本地文件**更新正在运行的 source 连接器。

  ```java
  void updateSource(SourceConfig sourceConfig,
                  String fileName)
          throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  |`sourceConfig` | source 配置对象

  **异常**

  |名称|描述|
  |---|---
  |`PulsarAdminException.NotAuthorizedException`| 您没有管理权限
  | `PulsarAdminException.NotFoundException` | 集群不存在
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`updateSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#updateSource-SourceConfig-java.lang.String-)。

* 使用可以从其下载 fun-pkg 的 URL 的**远程文件**更新 source 连接器。

  ```java
  void updateSourceWithUrl(SourceConfig sourceConfig,
                       String pkgUrl)
                throws PulsarAdminException
  ```

  支持的 URL 为 `http` 和 `file`。

  **示例**

  * HTTP: http://www.repo.com/fileName.jar

  * File: file:///dir/fileName.jar

  **参数**

  | 名称 | 描述
  |---|---
  | `sourceConfig` | source 配置对象
  | `pkgUrl` | 可以从中下载 pkg 的 URL

  **异常**

  |名称|描述|
  |---|---
  |`PulsarAdminException.NotAuthorizedException`| 您没有管理权限
  | `PulsarAdminException.NotFoundException` | 集群不存在
  | `PulsarAdminException` | 意外错误

有关更多信息，请参阅 [`createSourceWithUrl`](/api/admin/org/apache/pulsar/client/admin/Source.html#updateSourceWithUrl-SourceConfig-java.lang.String-)。

</TabItem>

</Tabs>
````

#### Sink

要更新正在运行的 Pulsar sink 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `update` 子命令。

```shell
pulsar-admin sinks update options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

向此端点发送 `PUT` 请求：[](swagger:/admin/v3/sink/SinksBase_updateSink)

</TabItem>
<TabItem value="Java Admin API">

* 使用**本地文件**更新正在运行的 sink 连接器。

  ```java
  void updateSink(SinkConfig sinkConfig,
                  String fileName)
       throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  |`sinkConfig` | sink 配置对象

  **异常**

  |名称|描述|
  |---|---
  |`PulsarAdminException.NotAuthorizedException`| 您没有管理权限
  | `PulsarAdminException.NotFoundException` | 集群不存在
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`updateSink`](/api/admin/org/apache/pulsar/client/admin/Sink.html#updateSink-SinkConfig-java.lang.String-)。

* 使用可以从其下载 fun-pkg 的 URL 的**远程文件**更新 sink 连接器。

  ```java
  void updateSinkWithUrl(SinkConfig sinkConfig,
                         String pkgUrl)
                  throws PulsarAdminException
  ```

  支持的 URL 为 `http` 和 `file`。

  **示例**

  * HTTP: http://www.repo.com/fileName.jar

  * File: file:///dir/fileName.jar

  **参数**

  | 名称 | 描述
  |---|---
  | `sinkConfig` | sink 配置对象
  | `pkgUrl` | 可以从中下载 pkg 的 URL

  **异常**

  |名称|描述|
  |---|---
  |`PulsarAdminException.NotAuthorizedException`| 您没有管理权限
  |`PulsarAdminException.NotFoundException` | 集群不存在
  |`PulsarAdminException` | 意外错误

有关更多信息，请参阅 [`updateSinkWithUrl`](/api/admin/org/apache/pulsar/client/admin/Sink.html#updateSinkWithUrl-SinkConfig-java.lang.String-)。

</TabItem>

</Tabs>
````

## 停止连接器

### `停止`

要停止连接器，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要停止 source 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `stop` 子命令。

```shell
pulsar-admin sources stop options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 停止**所有** source 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_stopSource?summary=all)

* 停止**指定**的 source 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_stopSource?summary=!all)

</TabItem>
<TabItem value="Java Admin API">

* 停止**所有** source 连接器。

  ```java
  void stopSource(String tenant,
                  String namespace,
                  String source)
          throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `source` | Source 名称

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`stopSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#stopSource-java.lang.String-java.lang.String-java.lang.String-)。

* 停止**指定**的 source 连接器。

  ```java
  void stopSource(String tenant,
                  String namespace,
                  String source,
                  int instanceId)
           throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `source` | Source 名称
   `instanceId` | Source 实例ID

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`stopSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#stopSource-java.lang.String-java.lang.String-java.lang.String-int-)。

</TabItem>

</Tabs>
````

#### Sink

要停止 sink 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `stop` 子命令。

```
pulsar-admin sinks stop options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 停止**所有** sink 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/sink/SinksBase_stopSink?summary=all)

* 停止**指定**的 sink 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/sink/SinksBase_stopSink?summary=!all)

</TabItem>
<TabItem value="Java Admin API">

* 停止**所有** sink 连接器。

  ```java
  void stopSink(String tenant,
              String namespace,
              String sink)
      throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `source` | Source 名称

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`stopSink`](/api/admin/org/apache/pulsar/client/admin/Sink.html#stopSink-java.lang.String-java.lang.String-java.lang.String-)。

* 停止**指定**的 sink 连接器。

  ```java
  void stopSink(String tenant,
                String namespace,
                String sink,
                int instanceId)
         throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `source` | Source 名称
  `instanceId` | Source 实例ID

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`stopSink`](/api/admin/org/apache/pulsar/client/admin/Sink.html#stopSink-java.lang.String-java.lang.String-java.lang.String-int-)。

</TabItem>

</Tabs>
````

## 重启连接器

### `重启`

要重启连接器，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要重启 source 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `restart` 子命令。

```shell
pulsar-admin sources restart options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 重启**所有** source 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_restartSource?summary=all)

* 重启**指定**的 source 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_restartSource?summary=!all)

</TabItem>
<TabItem value="Java Admin API">

* 重启**所有** source 连接器。

  ```java
  void restartSource(String tenant,
                     String namespace,
                     String source)
              throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `source` | Source 名称

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`restartSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#restartSource-java.lang.String-java.lang.String-java.lang.String-)。

* 重启**指定**的 source 连接器。

  ```java
  void restartSource(String tenant,
                     String namespace,
                     String source,
                     int instanceId)
              throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `source` | Source 名称
   `instanceId` | Source 实例ID

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`restartSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#restartSource-java.lang.String-java.lang.String-java.lang.String-int-)。

</TabItem>

</Tabs>
````

#### Sink

要重启 sink 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `restart` 子命令。

```shell
pulsar-admin sinks restart options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

* 重启**所有** sink 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_restartSource?summary=all)

* 重启**指定**的 sink 连接器。

  向此端点发送 `POST` 请求：[](swagger:/admin/v3/source/SourcesBase_restartSource?summary=!all)

</TabItem>
<TabItem value="Java Admin API">

* 重启所有 Pulsar sink 连接器。

  ```java
  void restartSink(String tenant,
                   String namespace,
                   String sink)
            throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `sink` | Sink 名称

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`restartSink`](/api/admin/org/apache/pulsar/client/admin/Sink.html#restartSink-java.lang.String-java.lang.String-java.lang.String-)。

* 重启**指定**的 sink 连接器。

  ```java
  void restartSink(String tenant,
                   String namespace,
                   String sink,
                   int instanceId)
            throws PulsarAdminException
  ```

  **参数**

  | 名称 | 描述
  |---|---
  `tenant` | 租户名称
  `namespace` | 命名空间名称
  `source` | Source 名称
   `instanceId` | Sink 实例ID

  **异常**

  |名称|描述|
  |---|---
  | `PulsarAdminException` | 意外错误

  有关更多信息，请参阅 [`restartSink`](/api/admin/org/apache/pulsar/client/admin/Sink.html#restartSink-java.lang.String-java.lang.String-java.lang.String-int-)。

</TabItem>

</Tabs>
````

## 删除连接器

### `删除`

要删除连接器，可以使用 **Admin CLI**、**REST API** 或 **JAVA admin API**。

#### Source

要删除 source 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `delete` 子命令。

```shell
pulsar-admin sources delete options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

删除所有 Pulsar source 连接器。

向此端点发送 `DELETE` 请求：[](swagger:/admin/v3/source/SourcesBase_deregisterSource)

</TabItem>
<TabItem value="Java Admin API">

删除 source 连接器。

```java
void deleteSource(String tenant,
                  String namespace,
                  String source)
           throws PulsarAdminException
```

**参数**

| 名称 | 描述
|---|---
`tenant` | 租户名称
`namespace` | 命名空间名称
`source` | Source 名称

**异常**

|名称|描述|
|---|---
|`PulsarAdminException.NotAuthorizedException`| 您没有管理权限
| `PulsarAdminException.NotFoundException` | 集群不存在
| `PulsarAdminException.PreconditionFailedException` | 集群不为空
| `PulsarAdminException` | 意外错误

有关更多信息，请参阅 [`deleteSource`](/api/admin/org/apache/pulsar/client/admin/Source.html#deleteSource-java.lang.String-java.lang.String-java.lang.String-)。

</TabItem>

</Tabs>
````

#### Sink

要删除 sink 连接器，可以使用以下命令：

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java Admin API","value":"Java Admin API"}]}>

<TabItem value="Admin CLI">

使用 `delete` 子命令。

```shell
pulsar-admin sinks delete options
```

有关最新和完整信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

</TabItem>
<TabItem value="REST API">

删除 sink 连接器。

向此端点发送 `DELETE` 请求：[](swagger:/admin/v3/sink/SinksBase_deregisterSink)

</TabItem>
<TabItem value="Java Admin API">

删除 Pulsar sink 连接器。

```java
void deleteSink(String tenant,
                String namespace,
                String source)
         throws PulsarAdminException
```

**参数**

| 名称 | 描述
|---|---
`tenant` | 租户名称
`namespace` | 命名空间名称
`sink` | Sink 名称

**异常**

|名称|描述|
|---|---
|`PulsarAdminException.NotAuthorizedException`| 您没有管理权限
| `PulsarAdminException.NotFoundException` | 集群不存在
| `PulsarAdminException.PreconditionFailedException` | 集群不为空
| `PulsarAdminException` | 意外错误

有关更多信息，请参阅 [`deleteSource`](/api/admin/org/apache/pulsar/client/admin/Sink.html#deleteSink-java.lang.String-java.lang.String-java.lang.String-)。

</TabItem>

</Tabs>
````