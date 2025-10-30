---
id: io-jdbc-sink
title: JDBC sink connector
sidebar_label: "JDBC sink connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

JDBC sink 连接器允许从 Pulsar topic 拉取消息，并将消息持久化到 ClickHouse、MariaDB、PostgreSQL 和 SQLite。

> 目前支持 INSERT、DELETE 和 UPDATE 操作。
> SQLite、MariaDB 和 PostgreSQL 还支持 UPSERT 操作和幂等写入。

## 配置

所有 JDBC sink 连接器的配置具有以下属性。

### 属性

| 名称        | 类型   | 必需 | 默认值            | 描述                                                                                                                                                                                                                                                                                                                             |
|-------------|--------|----------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `userName`  | String | 否    | " " (空字符串) | 用于连接到 `jdbcUrl` 指定数据库的用户名。<br /><br />**注意：`userName` 区分大小写。**                                                                                                                                                                                                                 |
| `password`  | String | 否    | " " (空字符串) | 用于连接到 `jdbcUrl` 指定数据库的密码。 <br /><br />**注意：`password` 区分大小写。**                                                                                                                                                                                                                |
| `jdbcUrl`   | String | 是     | " " (空字符串) | 连接器连接的数据库的 JDBC URL。                                                                                                                                                                                                                                                                            |
| `tableName` | String | 是     | " " (空字符串) | 连接器写入的表的名称。                                                                                                                                                                                                                                                                                     |
| `nonKey`    | String | 否    | " " (空字符串) | 包含更新事件中使用字段的逗号分隔列表。                                                                                                                                                                                                                                                                   |
| `key`       | String | 否    | " " (空字符串) | 包含更新和删除事件的 `where` 条件中使用字段的逗号分隔列表。                                                                                                                                                                                                                                 |
| `timeoutMs` | int    | 否    | 500                | JDBC 操作超时时间（毫秒）。                                                                                                                                                                                                                                                                                             |
| `batchSize` | int    | 否    | 200                | 对数据库进行更新的批次大小。                                                                                                                                                                                                                                                                                         |
| `insertMode` | enum( INSERT,UPSERT,UPDATE) | 否    | INSERT             | 如果配置为 UPSERT，sink 使用 upsert 语义而不是普通的 INSERT/UPDATE 语句。Upsert 语义指的是在存在主键约束违反时原子地添加新行或更新现有行，这提供了幂等性。                                                                                                                                |
| `nullValueAction` | enum(FAIL, DELETE) | 否    | FAIL               | 如何处理具有 NULL 值的记录。可能的选项是 `DELETE` 或 `FAIL`。                                                                                                                                                                                                                                                        |
| `useTransactions` | boolean | 否    | true               | 启用数据库事务。
| `excludeNonDeclaredFields` | boolean | 否    | false              | 所有表字段都是自动发现的。`excludeNonDeclaredFields` 表示未在 `nonKey` 和 `key` 中明确列出的表字段是否必须包含在查询中。默认情况下，所有表字段都包含在内。为了在插入过程中利用表字段默认值，建议将此值设置为 `false`。 |
| `useJdbcBatch`    | boolean | 否    | false              | 使用 JDBC 批处理 API。建议使用此选项来提高写入性能。 |

### ClickHouse 示例

* JSON

  ```json
  {
     "configs": {
        "userName": "clickhouse",
        "password": "password",
        "jdbcUrl": "jdbc:clickhouse://localhost:8123/pulsar_clickhouse_jdbc_sink",
        "tableName": "pulsar_clickhouse_jdbc_sink"
        "useTransactions": "false"
     }
  }
  ```

* YAML

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "jdbc-clickhouse-sink"
  inputs: [ "persistent://public/default/jdbc-clickhouse-topic" ]
  sinkType: "jdbc-clickhouse"
  configs:
      userName: "clickhouse"
      password: "password"
      jdbcUrl: "jdbc:clickhouse://localhost:8123/pulsar_clickhouse_jdbc_sink"
      tableName: "pulsar_clickhouse_jdbc_sink"
      useTransactions: "false"
  ```

### MariaDB 示例

* JSON

  ```json
  {
     "configs": {
        "userName": "mariadb",
        "password": "password",
        "jdbcUrl": "jdbc:mariadb://localhost:3306/pulsar_mariadb_jdbc_sink",
        "tableName": "pulsar_mariadb_jdbc_sink"
     }
  }
  ```

* YAML

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "jdbc-mariadb-sink"
  inputs: [ "persistent://public/default/jdbc-mariadb-topic" ]
  sinkType: "jdbc-mariadb"
  configs:
      userName: "mariadb"
      password: "password"
      jdbcUrl: "jdbc:mariadb://localhost:3306/pulsar_mariadb_jdbc_sink"
      tableName: "pulsar_mariadb_jdbc_sink"
  ```

### OpenMLDB 示例
> OpenMLDB 不支持 DELETE 和 UPDATE 操作
* JSON

  ```json
  {
     "configs": {
        "jdbcUrl": "jdbc:openmldb:///pulsar_openmldb_db?zk=localhost:6181&zkPath=/openmldb",
        "tableName": "pulsar_openmldb_jdbc_sink"
     }
  }
  ```

* YAML

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "jdbc-openmldb-sink"
  inputs: [ "persistent://public/default/jdbc-openmldb-topic" ]
  sinkType: "jdbc-openmldb"
  configs:
      jdbcUrl: "jdbc:openmldb:///pulsar_openmldb_db?zk=localhost:6181&zkPath=/openmldb"
      tableName: "pulsar_openmldb_jdbc_sink"
  ```

### PostgreSQL 示例

在使用 JDBC PostgreSQL sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "userName": "postgres",
        "password": "password",
        "jdbcUrl": "jdbc:postgresql://localhost:5432/pulsar_postgres_jdbc_sink",
        "tableName": "pulsar_postgres_jdbc_sink"
     }
  }
  ```

* YAML

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "jdbc-postgres-sink"
  inputs: [ "persistent://public/default/jdbc-postgres-topic" ]
  sinkType: "jdbc-postgres"
  configs:
      userName: "postgres"
      password: "password"
      jdbcUrl: "jdbc:postgresql://localhost:5432/pulsar_postgres_jdbc_sink"
      tableName: "pulsar_postgres_jdbc_sink"
  ```

有关 **如何使用此 JDBC sink 连接器** 的更多信息，请参阅[将 Pulsar 连接到 PostgreSQL](io-quickstart.md#connect-pulsar-to-postgresql)。

### SQLite 示例

* JSON

  ```json
  {
     "configs": {
        "jdbcUrl": "jdbc:sqlite:db.sqlite",
        "tableName": "pulsar_sqlite_jdbc_sink"
     }
  }
  ```

* YAML

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "jdbc-sqlite-sink"
  inputs: [ "persistent://public/default/jdbc-sqlite-topic" ]
  sinkType: "jdbc-sqlite"
  configs:
      jdbcUrl: "jdbc:sqlite:db.sqlite"
      tableName: "pulsar_sqlite_jdbc_sink"
  ```
