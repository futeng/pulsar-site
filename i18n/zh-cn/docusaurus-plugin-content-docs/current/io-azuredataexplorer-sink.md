---
id: io-azuredataexplorer-sink
title: Azure Data Explorer sink connector
sidebar_label: "Azure Data Explorer sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Azure Data Explorer(ADX) sink 连接器从 Pulsar Topic 拉取消息，并将消息 sink 到 ADX 集群。

## 配置

ADX sink 连接器的配置具有以下属性。

### 属性

| 名称                  | 类型   | 必需 | 默认值        | 描述                                                                          |
|-----------------------|--------|----------|----------------|--------------------------------------------------------------------------------------|
| `clusterUrl`          | String | true     | (空字符串) | ADX 集群 URL。                                                                 |
| `database`            | String | true     | (空字符串) | 需要导入数据的数据库名称                                  |
| `table`               | String | true     | (空字符串) | 需要导入 pulsar 数据的表名                                  |
| `appId`               | String | false    | (空字符串) | 用于认证的 AAD 应用 ID                                                    |
| `appKey`              | String | false    | (空字符串) | 用于认证的 AAD 应用密钥                                                |
| `tenantId`            | String | false    | (空字符串) | 用于认证的租户 ID                                                     |
| `managedIdentityId`   | String | false    | (空字符串) | 用于认证的托管身份凭据。如果是用户分配的 MI，则设置 clientId，如果是系统分配的托管身份，则设置 'system'|
| `mappingRefName`      | String | false    | (空字符串) | 用于导入的映射引用                                                  |
| `mappingRefType`      | String | false    | (空字符串) | 提供的映射引用类型。例如 CSV、JSON 等。                           |
| `flushImmediately`    | Boolean| false    | false          | 表示是否应立即进行 flush 而不进行聚合。不建议为生产工作负载启用 flushImmediately |
| `batchSize`    | Int  | false    | 100    | 对于批处理，这定义了用于批处理的记录数，以将数据 sink 到 ADX            |
| `batchTimeMs`  | Long | false    | 10000  | 对于批处理，这定义了在 sink 到 ADX 之前保存记录的时间（毫秒）                         |
| `maxRetryAttempts`| Int | false  | 1      | 最大重试次数，在发生临时导入错误时                                             |
| `retryBackOffTime`| Long |false  | 10     | 在临时错误重试之前的退避时间（毫秒）                           |

### 示例

在使用 ADX sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
         "clusterUrl":"https://somecluster.eastus.kusto.windows.net",
         "database":"somedb",
         "table": "tableName",
         "appId": "xxxx-xxxx-xxxx-xxxx",
         "appKey": "xxxx-xxxx-xxxx-xxxx",
         "tenantId": "xxxx-xxxx-xxxx-xxxx",
         "mappingRefName": "mapping ref name",
         "mappingRefType":"CSV",
         "flushImmediately":true,
         "batchSize":100,
         "batchTimeMs":10000,
     }
  }
  ```

* YAML

  ```yaml
  configs:
      clusterUrl: https://somecluster.eastus.kusto.windows.net,
      database: somedb,
      table: tableName,
      appId: xxxx-xxxx-xxxx-xxxx,
      appKey: xxxx-xxxx-xxxx-xxxx,
      tenantId: xxxx-xxxx-xxxx-xxxx,
      mappingRefName: mapping ref name,
      mappingRefType: CSV,
      flushImmediately: true,
      batchSize: 100,
      batchTimeMs: 10000,
  ```