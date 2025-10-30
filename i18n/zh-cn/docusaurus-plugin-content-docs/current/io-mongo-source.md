---
id: io-mongo-source
title: MongoDB source connector
sidebar_label: "MongoDB source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

MongoDB Source 连接器从 MongoDB 拉取文档并将消息持久化到 Pulsar Topic。

本指南介绍如何配置和使用 MongoDB Source 连接器。

## 配置

MongoDB Source 连接器的配置包含以下属性。

### 属性

| 名称          | 类型   | 是否必需 | 默认值            | 描述                                                                                                                                                                                    |
|---------------|--------|----------|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mongoUri`    | String | true     | " " (空字符串) | 连接器连接的 MongoDB URI。<br /><br />更多信息，请参阅[连接字符串 URI 格式](https://docs.mongodb.com/manual/reference/connection-string/)。           |
| `database`    | String | false    | " " (空字符串) | 监听的数据库名称。<br /><br />如果未设置此字段，Source 连接器将监听整个 MongoDB 的所有变更。                                                    |
| `collection`  | String | false    | " " (空字符串) | 监听的集合名称。<br /><br />如果未设置此字段，Source 连接器将监听数据库的所有变更。                                                        |
| `syncType`    | String | false    | "INCR_SYNC"        | MongoDB 和 Pulsar 之间的同步类型：完全同步或增量同步。<br /><br /> 有效值为 `full_sync`、`FULL_SYNC`、`incr_sync` 和 `INCR_SYNC`。 |
| `batchSize`   | int    | false    | 100                | 从集合拉取文档的批处理大小。                                                                                                                                          |
| `batchTimeMs` | long   | false    | 1000               | 批处理操作的间隔时间（毫秒）。                                                                                                                                                  |

### 示例

在使用 Mongo Source 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "mongoUri": "mongodb://localhost:27017",
        "database": "pulsar",
        "collection": "messages",
        "syncType": "full_sync",
        "batchSize": "2",
        "batchTimeMs": "500"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      mongoUri: "mongodb://localhost:27017"
      database: "pulsar"
      collection: "messages"
      syncType: "full_sync",
      batchSize: 2
      batchTimeMs: 500
  ```