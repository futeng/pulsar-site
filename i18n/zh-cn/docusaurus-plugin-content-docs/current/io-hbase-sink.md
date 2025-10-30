---
id: io-hbase-sink
title: HBase sink connector
sidebar_label: "HBase sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

HBase sink 连接器从 Pulsar topic 拉取消息，并将消息持久化到 HBase 表中

## 配置

HBase sink 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|默认值 | 必需 | 描述 |
|------|---------|----------|-------------|---
| `hbaseConfigResources` | String|无 | false | HBase 系统配置 `hbase-site.xml` 文件。 |
| `zookeeperQuorum` | String|无 | true | HBase 系统配置关于 `hbase.zookeeper.quorum` 的值。 |
| `zookeeperClientPort` | String|2181 | false | HBase 系统配置关于 `hbase.zookeeper.property.clientPort` 的值。 |
| `zookeeperZnodeParent` | String|/hbase | false | HBase 系统配置关于 `zookeeper.znode.parent` 的值。 |
| `tableName` | 无 |String | true | HBase 表，值为 `namespace:tableName`。 |
| `rowKeyName` | String|无 | true | HBase 表的行键名称。 |
| `familyName` | String|无 | true | HBase 表的列族名称。 |
| `qualifierNames` |String| 无 | true | HBase 表的列限定符名称。 |
| `batchTimeMs` | Long|1000l| false | HBase 表操作超时时间（以毫秒为单位）。 |
| `batchSize` | int|200| false | 对 HBase 表进行更新的批处理大小。 |

### 示例

在使用 HBase sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "hbaseConfigResources": "hbase-site.xml",
        "zookeeperQuorum": "localhost",
        "zookeeperClientPort": "2181",
        "zookeeperZnodeParent": "/hbase",
        "tableName": "pulsar_hbase",
        "rowKeyName": "rowKey",
        "familyName": "info",
        "qualifierNames": [ 'name', 'address', 'age']
     }
  }
  ```

* YAML

  ```yaml
  configs:
      hbaseConfigResources: "hbase-site.xml"
      zookeeperQuorum: "localhost"
      zookeeperClientPort: "2181"
      zookeeperZnodeParent: "/hbase"
      tableName: "pulsar_hbase"
      rowKeyName: "rowKey"
      familyName: "info"
      qualifierNames: [ 'name', 'address', 'age']
  ```
