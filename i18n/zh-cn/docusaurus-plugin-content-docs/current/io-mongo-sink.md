---
id: io-mongo-sink
title: MongoDB sink connector
sidebar_label: "MongoDB sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

MongoDB Sink 连接器从 Pulsar Topic 中拉取消息并将消息持久化到集合中。

## 配置

MongoDB Sink 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|是否必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `mongoUri` | String| true| " " (空字符串) | 连接器连接的 MongoDB URI。<br /><br />更多信息，请参阅[连接字符串 URI 格式](https://docs.mongodb.com/manual/reference/connection-string/)。 |
| `database` | String| true| " " (空字符串)| 集合所属的数据库名称。 |
| `collection` | String| true| " " (空字符串)| 连接器写入消息的集合名称。 |
| `batchSize` | int|false|100 | 向集合写入消息的批处理大小。 |
| `batchTimeMs` |long|false|1000| 批处理操作的间隔时间（毫秒）。 |


### 示例

在使用 Mongo Sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "mongoUri": "mongodb://localhost:27017",
        "database": "pulsar",
        "collection": "messages",
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
      batchSize: 2
      batchTimeMs: 500
  ```