---
id: io-elasticsearch-sink
title: Elasticsearch sink connector
sidebar_label: "Elasticsearch sink connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

Elasticsearch sink 连接器从 Pulsar topics 拉取消息，并将消息持久化到索引。

## 要求

要部署 Elasticsearch sink 连接器，需要满足以下要求：

- Elasticsearch 7（Elasticsearch 8 将在未来支持）
- OpenSearch 1.x

## 功能

### 处理数据

自 Pulsar 2.9.0 起，Elasticsearch sink 连接器具有以下工作方式。您可以选择其中之一。

名称 | 描述
---|---|
原始处理 | sink 从 topics 读取并将原始内容传递给 Elasticsearch。<br /><br /> 这是**默认**行为。<br /><br /> 原始处理在 **Pulsar 2.8.x** 中已经可用。
Schema 感知 | sink 使用 schema 并处理 AVRO、JSON 和 KeyValue schema 类型，同时将内容映射到 Elasticsearch 文档。<br /><br /> 如果您将 `schemaEnable` 设置为 `true`，sink 会解释消息的内容，您可以定义一个**主键**，该主键依次用作 Elasticsearch 上的特殊 `_id` 字段。
<br /><br /> 这允许您执行 `UPDATE`、`INSERT` 和 `DELETE` 操作
到 Elasticsearch，由消息的逻辑主键驱动。<br /><br /> 这在典型的变更数据捕获场景中非常有用，在这种场景中您跟随
数据库的更改，将它们写入 Pulsar（例如使用 Debezium 适配器），
然后写入 Elasticsearch。<br /><br /> 您使用 `primaryFields` 配置
条目配置主键的映射。<br /><br />当主键不为空且其余值为空时，可以执行 `DELETE` 操作。使用 `nullValueAction` 来
配置此行为。默认配置只是忽略此类空值。

### 映射多个索引

自 Pulsar 2.9.0 起，不再需要 `indexName` 属性。如果省略它，sink 会以 Pulsar topic 名称之后的索引名称写入。

### 启用批量写入

自 Pulsar 2.9.0 起，您可以通过将 `bulkEnabled` 属性设置为 `true` 来使用批量写入。

### 通过 TLS 启用安全连接

自 Pulsar 2.9.0 起，您可以使用 TLS 启用安全连接。

## 配置

Elasticsearch sink 连接器的配置具有以下属性。

### 属性

| 名称                           | 类型                                                 | 必需 | 默认值            | 描述                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------|------------------------------------------------------|----------|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `elasticSearchUrl`             | String                                               | true     | " "（空字符串）| 连接器连接的 elasticsearch 集群的 URL。                                                                                                                                                                                                                                                                                                             |
| `indexName`                    | String                                               | false    | " "（空字符串）| 连接器写入消息的索引名称。默认值为 topic 名称。它接受名称中的日期格式，以支持基于事件时间的索引，模式为 `%{+<date-format>}`。例如，假设记录的事件时间为 1645182000000L，indexName 为 `logs-%{+yyyy-MM-dd}`，那么格式化后的索引名称将是 `logs-2022-02-18`。 |
| `schemaEnable`                 | Boolean                                              | false    | false              | 启用 Schema Aware 模式。                                                                                                                                                                                                                                                                                                                                                 |
| `createIndexIfNeeded`          | Boolean                                              | false    | false              | 如果缺少则管理索引。                                                                                                                                                                                                                                                                                                                                                       |
| `maxRetries`                   | Integer                                              | false    | 1                  | elasticsearch 请求的最大重试次数。使用 -1 禁用它。                                                                                                                                                                                                                                                                                                |
| `retryBackoffInMs`             | Integer                                              | false    | 100                | 重试 Elasticsearch 请求时等待的基本时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                                |
| `maxRetryTimeInSec`            | Integer                                              | false    | 86400              | 重试 elasticsearch 请求的最大重试时间间隔（以秒为单位）。                                                                                                                                                                                                                                                                                              |
| `bulkEnabled`                  | Boolean                                              | false    | false              | 启用 elasticsearch 批量处理器，根据请求的数量或大小，或在给定时间后刷新写入请求。                                                                                                                                                                                                                                              |
| `bulkActions`                  | Integer                                              | false    | 1000               | 每个 elasticsearch 批量请求的最大操作数。使用 -1 禁用它。                                                                                                                                                                                                                                                                                            |
| `bulkSizeInMb`                 | Integer                                              | false    | 5                  | elasticsearch 批量请求的最大大小（以兆字节为单位）。使用 -1 禁用它。                                                                                                                                                                                                                                                                                            |
| `bulkConcurrentRequests`       | Integer                                              | false    | 0                  | 进行中的 elasticsearch 批量请求的最大数量。默认值 0 允许执行单个请求。值 1 表示在累积新的批量请求时允许执行 1 个并发请求。                                                                                                                                                                                                                   |
| `bulkFlushIntervalInMs`        | Long                                                 | false    | 1000               | 当启用批量写入时，等待刷新挂起写入的最长时间。-1 或零表示禁用计划的刷新。                                                                                                                                                                                                                                                                                              |
| `compressionEnabled`           | Boolean                                              | false    | false              | 启用 elasticsearch 请求压缩。                                                                                                                                                                                                                                                                                                                                      |
| `connectTimeoutInMs`           | Integer                                              | false    | 5000               | elasticsearch 客户端连接超时时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                   |
| `connectionRequestTimeoutInMs` | Integer                                              | false    | 1000               | 从 elasticsearch 连接池获取连接的时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                      |
| `connectionIdleTimeoutInMs`    | Integer                                              | false    | 5                  | 空闲连接超时以防止读取超时。                                                                                                                                                                                                                                                                                                                             |
| `keyIgnore`                    | Boolean                                              | false    | true               | 是否忽略记录键来构建 Elasticsearch 文档 `_id`。如果定义了 primaryFields，连接器从有效负载中提取主键字段来构建文档 `_id`。如果没有提供 primaryFields，elasticsearch 会自动生成一个随机的文档 `_id`。                                                                                         |
| `primaryFields`                | String                                               | false    | "id"               | 用于从记录值构建 Elasticsearch 文档 `_id` 的字段名称的逗号分隔有序列表。如果此列表是单例，则字段转换为字符串。如果此列表有 2 个或更多字段，则生成的 `_id` 是字段值的 JSON 数组的字符串表示形式。                                                                                                                                  |
| `nullValueAction`              | enum (IGNORE,DELETE,FAIL)                            | false    | IGNORE             | 如何处理具有空值的记录，可能的选项是 IGNORE、DELETE 或 FAIL。默认是忽略消息。                                                                                                                                                                                                                                                            |
| `malformedDocAction`           | enum (IGNORE,WARN,FAIL)                              | false    | FAIL               | 如何处理由于某些格式错误而被 elasticsearch 拒绝的文档。可能的选项是 IGNORE、DELETE 或 FAIL。默认是 FAIL Elasticsearch 文档。                                                                                                                                                                                                              |
| `stripNulls`                   | Boolean                                              | false    | true               | 如果 stripNulls 为 false，elasticsearch _source 包括空字段的 'null'（例如 \{"foo": null\}），否则空字段被剥离。                                                                                                                                                                                                                                |
| `socketTimeoutInMs`            | Integer                                              | false    | 60000              | 等待读取 elasticsearch 响应的套接字超时时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                                 |
| `typeName`                     | String                                               | false    | "_doc"             | 连接器向其写入消息的类型名称。<br /><br /> 对于 6.2 版本之前的 Elasticsearch，该值应显式设置为除 "_doc" 之外的有效类型名称，否则保留默认值。                                                                                                                                                           |
| `indexNumberOfShards`          | int                                                  | false    | 1                  | 索引的分片数量。                                                                                                                                                                                                                                                                                                                                             |
| `indexNumberOfReplicas`        | int                                                  | false    | 1                  | 索引的副本数量。                                                                                                                                                                                                                                                                                                                                           |
| `username`                     | String                                               | false    | " "（空字符串）| 连接器用于连接 elasticsearch 集群的用户名。<br /><br />如果设置了 `username`，那么也应该提供 `password`。                                                                                                                                                                                                                        |
| `password`                     | String                                               | false    | " "（空字符串）| 连接器用于连接 elasticsearch 集群的密码。<br /><br />如果设置了 `username`，那么也应该提供 `password`。                                                                                                                                                                                                                        |
| `ssl`                          | ElasticSearchSslConfig                               | false    |                    | TLS 加密通信的配置                                                                                                                                                                                                                                                                                                                                  |
| `compatibilityMode`            | enum (AUTO,ELASTICSEARCH,ELASTICSEARCH_7,OPENSEARCH) | false    | AUTO               | 指定与 ElasticSearch 集群的兼容模式。`AUTO` 值将尝试自动检测要使用的正确兼容模式。如果目标集群运行 ElasticSearch 7 或更早版本，请使用 `ELASTICSEARCH_7`。如果目标集群运行 ElasticSearch 8 或更高版本，请使用 `ELASTICSEARCH`。如果目标集群运行 OpenSearch，请使用 `OPENSEARCH`。          |
| `token`                        | String                                               | false    | " "（空字符串）| 连接器用于连接 ElasticSearch 集群的令牌。只能在 basic/token/apiKey 认证模式之间配置一个。                                                                                                                                                                                                                           |
| `apiKey`                       | String                                               | false    | " "（空字符串）| 连接器用于连接 ElasticSearch 集群的 apiKey。只能在 basic/token/apiKey 认证模式之间配置一个。                                                                                                                                                                                                                          |
| `canonicalKeyFields`           | Boolean                                              | false    | false              | 是否为 JSON 和 Avro 对键字段进行排序。如果设置为 `true` 且记录键 schema 是 `JSON` 或 `AVRO`，则序列化对象不考虑属性的顺序。                                                                                                                                                                                                                                                |
| `stripNonPrintableCharacters`  | Boolean                                              | false    | true               | 是否从文档中删除所有不可打印字符。如果设置为 true，则从文档中删除所有不可打印字符。                                                                                                                                                                                                                     |
| `idHashingAlgorithm`           | enum(NONE,SHA256,SHA512)                             | false    | NONE               | 用于文档 ID 的哈希算法。这对于符合 ElasticSearch _id 的 512 字节硬限制非常有用。                                                                                                                                                                                                                                      |
| `conditionalIdHashing`         | Boolean                                              | false    | false              | 此选项仅在设置了 idHashingAlgorithm 时有效。如果启用，则仅在 ID 大于 512 字节时执行哈希，否则在任何情况下都对每个文档执行哈希。                                                                                                                                                                                                                                            |
| `copyKeyFields`                | Boolean                                              | false    | false              | 如果消息键 schema 是 AVRO 或 JSON，则消息键字段被复制到 ElasticSearch 文档中。                                                                                                                                                                                                                                                                  |

### ElasticSearchSslConfig 结构定义：

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `enabled` | Boolean| false | false | 启用 SSL/TLS。 |
| `hostnameVerification` | Boolean| false | true | 使用 SSL 时是否验证节点主机名。 |
| `disableCertificateValidation` | Boolean| false | true | 是否禁用节点证书验证。更改此值非常不安全，您不应在生产环境中使用它。 |
| `truststorePath` | String| false |" "（空字符串）| 信任库文件的路径。 |
| `truststorePassword` | String| false |" "（空字符串）| 信任库密码。 |
| `keystorePath` | String| false |" "（空字符串）| 密钥库文件的路径。 |
| `keystorePassword` | String| false |" "（空字符串）| 密钥库密码。 |
| `cipherSuites` | String| false |" "（空字符串）| SSL/TLS 密码套件。 |
| `protocols` | String| false |"TLSv1.2" | 启用的 SSL/TLS 协议的逗号分隔列表。 |

## 示例

在使用 Elasticsearch sink 连接器之前，您需要通过以下方法之一创建配置文件。

### 配置

#### 对于 6.2 之后的 Elasticsearch

* JSON

  ```json
  {
     "configs": {
        "elasticSearchUrl": "http://localhost:9200",
        "indexName": "my_index",
        "username": "scooby",
        "password": "doobie"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      elasticSearchUrl: "http://localhost:9200"
      indexName: "my_index"
      username: "scooby"
      password: "doobie"
  ```

#### 对于 6.2 之前的 Elasticsearch

* JSON

  ```json
  {
      "elasticSearchUrl": "http://localhost:9200",
      "indexName": "my_index",
      "typeName": "doc",
      "username": "scooby",
      "password": "doobie"
  }
  ```

* YAML

  ```yaml
  configs:
      elasticSearchUrl: "http://localhost:9200"
      indexName: "my_index"
      typeName: "doc"
      username: "scooby"
      password: "doobie"
  ```

### 使用方法

1. 启动单节点 Elasticsearch 集群。

   ```bash
   docker run -p 9200:9200 -p 9300:9300 \
       -e "discovery.type=single-node" \
       docker.elastic.co/elasticsearch/elasticsearch:7.13.3
   ```

2. 在本地以独立模式启动 Pulsar 服务。

   ```bash
   bin/pulsar standalone
   ```

   确保 NAR 文件在 `connectors/pulsar-io-elastic-search-@pulsar:version@.nar` 处可用。

3. 使用以下方法之一以本地运行模式启动 Pulsar Elasticsearch 连接器。
   * 使用前面显示的 **JSON** 配置。

       ```bash
       bin/pulsar-admin sinks localrun \
           --archive $PWD/connectors/pulsar-io-elastic-search-@pulsar:version@.nar \
           --tenant public \
           --namespace default \
           --name elasticsearch-test-sink \
           --sink-config '{"elasticSearchUrl":"http://localhost:9200","indexName": "my_index","username": "scooby","password": "doobie"}' \
           --inputs elasticsearch_test
       ```

   * 使用前面显示的 **YAML** 配置文件。

       ```bash
       bin/pulsar-admin sinks localrun \
           --archive $PWD/connectors/pulsar-io-elastic-search-@pulsar:version@.nar \
           --tenant public \
           --namespace default \
           --name elasticsearch-test-sink \
           --sink-config-file $PWD/elasticsearch-sink.yml \
           --inputs elasticsearch_test
       ```

4. 将记录发布到 topic。

   ```bash
   bin/pulsar-client produce elasticsearch_test --messages "{\"a\":1}"
   ```

5. 检查 Elasticsearch 中的文档。

   * 刷新索引

       ```bash
       curl -s http://localhost:9200/my_index/_refresh
       ```

   * 搜索文档

       ```bash
       curl -s http://localhost:9200/my_index/_search
       ```

       您可以看到之前发布的记录已成功写入 Elasticsearch。

       ```json
       {"took":2,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":1.0,"hits":[{"_index":"my_index","_type":"_doc","_id":"FSxemm8BLjG_iC0EeTYJ","_score":1.0,"_source":{"a":1}}]}}
       ```
