---
id: io-cassandra-sink
title: Cassandra sink connector
sidebar_label: "Cassandra sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Cassandra sink 连接器从 Pulsar Topic 拉取消息到 Cassandra 集群。

## 配置

Cassandra sink 连接器的配置具有以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `roots` | String|true | " " (空字符串) | 要连接的 Cassandra 主机的逗号分隔列表。|
| `keyspace` | String|true| " " (空字符串)| 用于写入 pulsar 消息的键空间。<br /><br />**注意：`keyspace` 应该在 Cassandra sink 之前创建。**|
| `keyname` | String|true| " " (空字符串)| Cassandra 列族的键名称。<br /><br />该列用于存储 Pulsar 消息键。<br /><br />如果 Pulsar 消息没有任何关联的键，则使用消息值作为键。 |
| `columnFamily` | String|true| " " (空字符串)| Cassandra 列族名称。<br /><br />**注意：`columnFamily` 应该在 Cassandra sink 之前创建。**|
| `columnName` | String|true| " " (空字符串) | Cassandra 列族的列名。<br /><br /> 该列用于存储 Pulsar 消息值。 |

### 示例

在使用 Cassandra sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "roots": "localhost:9042",
        "keyspace": "pulsar_test_keyspace",
        "columnFamily": "pulsar_test_table",
        "keyname": "key",
        "columnName": "col"
     }
  }
  ```

* YAML

  ```
  configs:
      roots: "localhost:9042"
      keyspace: "pulsar_test_keyspace"
      columnFamily: "pulsar_test_table"
      keyname: "key"
      columnName: "col"
  ```

## 使用方法

有关**如何将 Pulsar 与 Cassandra 连接**的更多信息，请参见[此处](io-quickstart.md#connect-pulsar-to-cassandra)。