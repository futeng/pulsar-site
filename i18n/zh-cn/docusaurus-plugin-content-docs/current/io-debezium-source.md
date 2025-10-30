---
id: io-debezium-source
title: Debezium source connector
sidebar_label: "Debezium source connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

Debezium source 连接器从 MySQL 或 PostgreSQL 拉取消息，并将消息持久化到 Pulsar topics。

## 配置

Debezium source 连接器的配置具有以下属性。

| 名称 | 必需 | 默认值 | 描述 |
|------|----------|---------|-------------|
| `task.class` | true | null | 在 Debezium 中实现的 source 任务类。 |
| `database.hostname` | true | null | 数据库服务器的地址。 |
| `database.port` | true | null | 数据库服务器的端口号。|
| `database.user` | true | null | 具有所需权限的数据库用户名。 |
| `database.password` | true | null | 具有所需权限的数据库用户密码。 |
| `database.server.id` | true | null | 连接器的标识符，在数据库集群内必须唯一，类似于数据库的 server-id 配置属性。 |
| `database.server.name` | true | null | 数据库服务器/集群的逻辑名称，形成一个命名空间，用于连接器写入的所有 Kafka topics 的名称、Kafka Connect schema 名称，以及在使用 Avro Connector 时相应 Avro schema 的命名空间。 |
| `database.whitelist` | false | null | 此服务器托管的、被连接器监控的所有数据库的列表。<br /><br /> 这是可选的，还有其他属性用于列出要包含或排除在监控之外的数据库和表。 |
| `key.converter` | true | null | Kafka Connect 提供的用于转换记录键的转换器。 |
| `value.converter` | true | null | Kafka Connect 提供的用于转换记录值的转换器。  |
| `database.history` | true | null | 数据库历史类的名称。 |
| `database.history.pulsar.topic` | true | null | 连接器写入和恢复 DDL 语句的数据库历史 topic 的名称。<br /><br />**注意：此 topic 仅供内部使用，消费者不应使用。** |
| `database.history.pulsar.service.url` | false| null | 历史 topic 的 Pulsar 集群服务 URL。<br /><br />**注意**：如果未设置 `database.history.pulsar.service.url`，则数据库历史 Pulsar 客户端将使用与 source 连接器相同的客户端设置，如 `client_auth_plugin` 和 `client_auth_params`。|
| `offset.storage.topic` | true | null | 记录连接器成功完成的最后提交的偏移量。 |
| `json-with-envelope` | false | false | 呈现仅包含 payload 的消息。 |
| `database.history.pulsar.reader.config` | false | null | 数据库 schema 历史 topic 的读取器配置，以键值对的 JSON 字符串形式提供。 |
| `offset.storage.reader.config` | false | null | Kafka 连接器偏移量 topic 的读取器配置，以键值对的 JSON 字符串形式提供。 |

### 转换器选项

1. org.apache.kafka.connect.json.JsonConverter

此配置 `json-with-envelope` 仅对 JsonConverter 有效。默认值为 false，消费者使用 schema `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`，消息仅包含 payload。

如果配置 `json-with-envelope` 值为 true，消费者使用 schema `Schema.KeyValue(Schema.BYTES, Schema.BYTES`，消息包含 schema 和 payload。

2. org.apache.pulsar.kafka.shade.io.confluent.connect.avro.AvroConverter

如果用户选择 AvroConverter，则 pulsar 消费者应使用 schema `Schema.KeyValue(Schema.AUTO_CONSUME(),
Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`，消息包含 payload。

### MongoDB 配置
| 名称 | 必需 | 默认值 | 描述 |
|------|----------|---------|-------------|
| `mongodb.hosts` | true | null | 副本集中 MongoDB 服务器的逗号分隔的主机名和端口对列表（格式为 'host' 或 'host:port'）。列表包含单个主机名和端口对。如果 mongodb.members.auto.discover 设置为 false，主机名和端口对将以副本集名称为前缀（例如，rs0/localhost:27017）。 |
| `mongodb.name` | true | null | 标识连接器和/或此连接器监控的 MongoDB 副本集或共享集群的唯一名称。每个服务器最多应被一个 Debezium 连接器监控，因为此服务器名称为源自 MongoDB 副本集或集群的所有持久化 Kafka topics 添加前缀。 |
| `mongodb.user` | true | null | 连接 MongoDB 时要使用的数据库用户名。仅在 MongoDB 配置为使用身份验证时才需要。 |
| `mongodb.password` | true | null | 连接 MongoDB 时要使用的密码。仅在 MongoDB 配置为使用身份验证时才需要。 |
| `mongodb.task.id` | true | null | MongoDB 连接器的 taskId，尝试为每个副本集使用单独的任务。 |

### 自定义元数据 topic 的读取器配置

Debezium 连接器公开 `database.history.pulsar.reader.config` 和 `offset.storage.reader.config` 来配置数据库 schema 历史 topic 和 Kafka 连接器偏移量 topic 的读取器。例如，它可用于配置订阅名称和其他读取器配置。您可以在 [ReaderConfigurationData](https://github.com/apache/pulsar/blob/master/pulsar-client/src/main/java/org/apache/pulsar/client/impl/conf/ReaderConfigurationData.java) 找到可用配置。

例如，要为两个读取器配置订阅名称，可以添加以下配置：
* JSON

   ```json
   {
     "configs": {
        "database.history.pulsar.reader.config": "{\"subscriptionName\":\"history-reader\"}",
        "offset.storage.reader.config": "{\"subscriptionName\":\"offset-reader\"}",
     }
   }
   ```

* YAML

   ```yaml
   configs:
      database.history.pulsar.reader.config: "{\"subscriptionName\":\"history-reader\"}"
      offset.storage.reader.config: "{\"subscriptionName\":\"offset-reader\"}"
   ```

## MySQL 示例

在使用 Pulsar Debezium 连接器之前，您需要创建一个配置文件。

### 配置

您可以使用以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "database.hostname": "localhost",
        "database.port": "3306",
        "database.user": "debezium",
        "database.password": "dbz",
        "database.server.id": "184054",
        "database.server.name": "dbserver1",
        "database.whitelist": "inventory",
        "database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory",
        "database.history.pulsar.topic": "history-topic",
        "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650",
        "key.converter": "org.apache.kafka.connect.json.JsonConverter",
        "value.converter": "org.apache.kafka.connect.json.JsonConverter",
        "offset.storage.topic": "offset-topic"
     }
  }
  ```

* YAML

  您可以创建一个 `debezium-mysql-source-config.yaml` 文件，并将以下[内容](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/mysql/src/main/resources/debezium-mysql-source-config.yaml)复制到 `debezium-mysql-source-config.yaml` 文件中。

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "debezium-mysql-source"
  topicName: "debezium-mysql-topic"
  archive: "connectors/pulsar-io-debezium-mysql-@pulsar:version@.nar"
  parallelism: 1

  configs:

      ## config for mysql, docker image: debezium/example-mysql:0.8
      database.hostname: "localhost"
      database.port: "3306"
      database.user: "debezium"
      database.password: "dbz"
      database.server.id: "184054"
      database.server.name: "dbserver1"
      database.whitelist: "inventory"
      database.history: "org.apache.pulsar.io.debezium.PulsarDatabaseHistory"
      database.history.pulsar.topic: "history-topic"
      database.history.pulsar.service.url: "pulsar://127.0.0.1:6650"

      ## KEY_CONVERTER_CLASS_CONFIG, VALUE_CONVERTER_CLASS_CONFIG
      key.converter: "org.apache.kafka.connect.json.JsonConverter"
      value.converter: "org.apache.kafka.connect.json.JsonConverter"

      ## OFFSET_STORAGE_TOPIC_CONFIG
      offset.storage.topic: "offset-topic"
  ```

### 使用方法

此示例展示如何使用 Pulsar Debezium 连接器更改 MySQL 表的数据。

1. 启动一个 MySQL 服务器，其中包含 Debezium 可以捕获更改的数据库。

   ```bash
   docker run -it --rm \
   --name mysql \
   -p 3306:3306 \
   -e MYSQL_ROOT_PASSWORD=debezium \
   -e MYSQL_USER=mysqluser \
   -e MYSQL_PASSWORD=mysqlpw debezium/example-mysql:0.8
   ```

2. 在本地以独立模式启动 Pulsar 服务。

   ```bash
   bin/pulsar standalone
   ```

3. 使用以下方法之一在本地运行模式下启动 Pulsar Debezium 连接器。

    * 使用前面显示的 **JSON** 配置文件。

       确保 NAR 文件在 `connectors/pulsar-io-debezium-mysql-@pulsar:version@.nar` 处可用。

       ```bash
       bin/pulsar-admin source localrun \
           --archive $PWD/connectors/pulsar-io-debezium-mysql-@pulsar:version@.nar \
           --name debezium-mysql-source \
           --tenant public \
           --namespace default \
           --source-config '{"database.hostname": "localhost","database.port": "3306","database.user": "debezium","database.password": "dbz","database.server.id": "184054","database.server.name": "dbserver1","database.whitelist": "inventory","database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory","database.history.pulsar.topic": "history-topic","database.history.pulsar.service.url": "pulsar://127.0.0.1:6650","key.converter": "org.apache.kafka.connect.json.JsonConverter","value.converter": "org.apache.kafka.connect.json.JsonConverter","pulsar.service.url": "pulsar://127.0.0.1:6650","offset.storage.topic": "offset-topic"}'
       ```

     :::note

     Debezium 连接器将数据保存在以下 4 种类型的 topics 中：

       - 一个以数据库服务器名称（`database.server.name`）命名的 topic，用于存储数据库元数据消息，如 `public/default/database.server.name`。
       - 一个 topic（`database.history.pulsar.topic`）用于存储数据库历史信息。连接器在此 topic 上写入和恢复 DDL 语句。
       - 一个 topic（`offset.storage.topic`）用于存储偏移量元数据消息。连接器在此 topic 上保存最后成功提交的偏移量。
       - 一个每表的 topic。连接器将表中发生的所有操作的更改事件写入特定于该表的单个 Pulsar topic。

     如果在您的 broker 上禁用了自动 topic 创建，您需要手动创建上述 4 种类型的 topics。

     :::

   * 使用前面显示的 **YAML** 配置文件。

       ```bash
       bin/pulsar-admin source localrun \
          --source-config-file $PWD/debezium-mysql-source-config.yaml
       ```

4. 订阅表 _inventory.products_ 的 topic _sub-products_。

   ```bash
   bin/pulsar-client consume -s "sub-products" public/default/dbserver1.inventory.products -n 0
   ```

5. 在 docker 中启动 MySQL 客户端。

    ```bash
    docker run -it --rm \
        --name mysqlterm \
        --link mysql \
        --rm mysql:5.7 sh \
        -c 'exec mysql -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uroot -p"$MYSQL_ENV_MYSQL_ROOT_PASSWORD"'
    ```

6. MySQL 客户端弹出。

   将连接模式更改为 `mysql_native_password`。
   ```
   mysql> show variables like "caching_sha2_password_auto_generate_rsa_keys";
   +----------------------------------------------+-------+
   | Variable_name                                | Value |
   +----------------------------------------------+-------+
   | caching_sha2_password_auto_generate_rsa_keys | ON    |
   +----------------------------------------------+-------+

   # 如果 "caching_sha2_password_auto_generate_rsa_keys" 的值为 ON，确保 mysql.user 的插件为 "mysql_native_password"。
   mysql> SELECT Host, User, plugin from mysql.user where user={user};
   +-----------+------+-----------------------+
   | Host      | User | plugin                |
   +-----------+------+-----------------------+
   | localhost | root | caching_sha2_password |
   +-----------+------+-----------------------+

   # 如果 mysql.user 的插件为 "caching_sha2_password"，则将其设置为 "mysql_native_password"。
   alter user '{user}'@'{host}' identified with mysql_native_password by {password};

   # 检查 mysql.user 的插件。
   mysql> SELECT Host, User, plugin from mysql.user where user={user};
   +-----------+------+-----------------------+
   | Host      | User | plugin                |
   +-----------+------+-----------------------+
   | localhost | root | mysql_native_password |
   +-----------+------+-----------------------+
   ```

   使用以下命令更改表 _products_ 的数据。

   ```bash
   mysql> use inventory;
   mysql> show tables;
   mysql> SELECT * FROM  products;
   mysql> UPDATE products SET name='1111111111' WHERE id=101;
   mysql> UPDATE products SET name='1111111111' WHERE id=107;
   ```

   在订阅 topic 的终端窗口中，您可以发现数据更改已保存在 _sub-products_ topic 中。

## PostgreSQL 示例

在使用 Pulsar Debezium 连接器之前，您需要创建一个配置文件。

### 配置

您可以使用以下方法之一创建配置文件。

* JSON

  ```json
  {
      "database.hostname": "localhost",
      "database.port": "5432",
      "database.user": "postgres",
      "database.password": "changeme",
      "database.dbname": "postgres",
      "database.server.name": "dbserver1",
      "plugin.name": "pgoutput",
      "schema.whitelist": "public",
      "table.whitelist": "public.users",
      "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650"
  }
  ```

* YAML

  您可以创建一个 `debezium-postgres-source-config.yaml` 文件，并将以下[内容](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/postgres/src/main/resources/debezium-postgres-source-config.yaml)复制到 `debezium-postgres-source-config.yaml` 文件中。

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "debezium-postgres-source"
  topicName: "debezium-postgres-topic"
  archive: "connectors/pulsar-io-debezium-postgres-@pulsar:version@.nar"
  parallelism: 1

  configs:
      ## config for postgres version 10+, official docker image: postgres:<10+>
      database.hostname: "localhost"
      database.port: "5432"
      database.user: "postgres"
      database.password: "changeme"
      database.dbname: "postgres"
      database.server.name: "dbserver1"
      plugin.name: "pgoutput"
      schema.whitelist: "public"
      table.whitelist: "public.users"

      ## PULSAR_SERVICE_URL_CONFIG
      database.history.pulsar.service.url: "pulsar://127.0.0.1:6650"
  ```

注意 `pgoutput` 是 Postgres 10 版本中引入的标准插件 - 请参阅 [Postgres 架构文档](https://www.postgresql.org/docs/10/logical-replication-architecture.html)。您不需要安装任何东西，只需确保 WAL 级别设置为 `logical`（请参阅下面的 docker 命令和 [Postgres 文档](https://www.postgresql.org/docs/current/runtime-config-wal.html)）。

### 使用方法

此示例展示如何使用 Pulsar Debezium 连接器更改 PostgreSQL 表的数据。


1. 启动一个 PostgreSQL 服务器，其中包含 Debezium 可以捕获更改的数据库。

   ```bash
   docker run -d -it --rm \
       --name pulsar-postgres \
       -p 5432:5432 \
       -e POSTGRES_PASSWORD=changeme \
       postgres:13.3 -c wal_level=logical
   ```

2. 在本地以独立模式启动 Pulsar 服务。

   ```bash
   bin/pulsar standalone
   ```

3. 使用以下方法之一在本地运行模式下启动 Pulsar Debezium 连接器。

   * 使用前面显示的 **JSON** 配置文件。

     确保 NAR 文件在 `connectors/pulsar-io-debezium-postgres-@pulsar:version@.nar` 处可用。

       ```bash
       bin/pulsar-admin source localrun \
           --archive $PWD/connectors/pulsar-io-debezium-postgres-@pulsar:version@.nar \
           --name debezium-postgres-source \
           --tenant public \
           --namespace default \
           --source-config '{"database.hostname": "localhost","database.port": "5432","database.user": "postgres","database.password": "changeme","database.dbname": "postgres","database.server.name": "dbserver1","plugin.name": "pgoutput","schema.whitelist": "public","table.whitelist": "public.users","pulsar.service.url": "pulsar://127.0.0.1:6650"}'
       ```

     :::note

     Debezium 连接器将数据保存在以下 4 种类型的 topics 中：

       - 一个以数据库服务器名称（`database.server.name`）命名的 topic，用于存储数据库元数据消息，如 `public/default/database.server.name`。
       - 一个 topic（`database.history.pulsar.topic`）用于存储数据库历史信息。连接器在此 topic 上写入和恢复 DDL 语句。
       - 一个 topic（`offset.storage.topic`）用于存储偏移量元数据消息。连接器在此 topic 上保存最后成功提交的偏移量。
       - 一个每表的 topic。连接器将表中发生的所有操作的更改事件写入特定于该表的单个 Pulsar topic。

     如果在您的 broker 上禁用了自动 topic 创建，您需要手动创建上述 4 种类型的 topics。

     :::

   * 使用前面显示的 **YAML** 配置文件。

       ```bash
       bin/pulsar-admin source localrun  \
          --source-config-file $PWD/debezium-postgres-source-config.yaml
       ```

4. 订阅 _public.users_ 表的 topic _sub-users_。

   ```bash
   bin/pulsar-client consume -s "sub-users" public/default/dbserver1.public.users -n 0
   ```

5. 在 docker 中启动 PostgreSQL 客户端。

   ```bash
   docker exec -it pulsar-postgres /bin/bash
   ```

6. PostgreSQL 客户端弹出。

   使用以下命令在表 _users_ 中创建示例数据。

   ```bash
   psql -U postgres -h localhost -p 5432
   Password for user postgres:

   CREATE TABLE users(
     id BIGINT GENERATED ALWAYS AS IDENTITY, PRIMARY KEY(id),
     hash_firstname TEXT NOT NULL,
     hash_lastname TEXT NOT NULL,
     gender VARCHAR(6) NOT NULL CHECK (gender IN ('male', 'female'))
   );

   INSERT INTO users(hash_firstname, hash_lastname, gender)
     SELECT md5(RANDOM()::TEXT), md5(RANDOM()::TEXT), CASE WHEN RANDOM() < 0.5 THEN 'male' ELSE 'female' END FROM generate_series(1, 100);

   postgres=# select * from users;

     id   |          hash_firstname          |          hash_lastname           | gender
   -------+----------------------------------+----------------------------------+--------
        1 | 02bf7880eb489edc624ba637f5ab42bd | 3e742c2cc4217d8e3382cc251415b2fb | female
        2 | dd07064326bb9119189032316158f064 | 9c0e938f9eddbd5200ba348965afbc61 | male
        3 | 2c5316fdd9d6595c1cceb70eed12e80c | 8a93d7d8f9d76acfaaa625c82a03ea8b | female
        4 | 3dfa3b4f70d8cd2155567210e5043d2b | 32c156bc28f7f03ab5d28e2588a3dc19 | female


   postgres=# UPDATE users SET hash_firstname='maxim' WHERE id=1;
   UPDATE 1
   ```

   在订阅 topic 的终端窗口中，您可以收到以下消息。

   ```bash
   ----- got message -----
   {"before":null,"after":{"id":1,"hash_firstname":"maxim","hash_lastname":"292113d30a3ccee0e19733dd7f88b258","gender":"male"},"source":{"version":"1.0.0.Final","connector":"postgresql","name":"foobar","ts_ms":1624045862644,"snapshot":"false","db":"postgres","schema":"public","table":"users","txId":595,"lsn":24419784,"xmin":null},"op":"u","ts_ms":1624045862648}
   ...many more
   ```

## MongoDB 示例

在使用 Pulsar Debezium 连接器之前，您需要创建一个配置文件。

### 配置

您可以使用以下方法之一创建配置文件。

* JSON

  ```json
  {
      "mongodb.hosts": "rs0/mongodb:27017",
      "mongodb.name": "dbserver1",
      "mongodb.user": "debezium",
      "mongodb.password": "dbz",
      "mongodb.task.id": "1",
      "database.whitelist": "inventory",
      "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650"
  }
  ```

* YAML

  您可以创建一个 `debezium-mongodb-source-config.yaml` 文件，并将以下[内容](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/mongodb/src/main/resources/debezium-mongodb-source-config.yaml)复制到 `debezium-mongodb-source-config.yaml` 文件中。

  ```yaml
  tenant: "public"
  namespace: "default"
  name: "debezium-mongodb-source"
  topicName: "debezium-mongodb-topic"
  archive: "connectors/pulsar-io-debezium-mongodb-@pulsar:version@.nar"
  parallelism: 1

  configs:

      ## config for pg, docker image: debezium/example-mongodb:0.10
      mongodb.hosts: "rs0/mongodb:27017"
      mongodb.name: "dbserver1"
      mongodb.user: "debezium"
      mongodb.password: "dbz"
      mongodb.task.id: "1"
      database.whitelist: "inventory"
      database.history.pulsar.service.url: "pulsar://127.0.0.1:6650"
  ```

### 使用方法

此示例展示如何使用 Pulsar Debezium 连接器更改 MongoDB 表的数据。


1. 启动一个 MongoDB 服务器，其中包含 Debezium 可以捕获更改的数据库。

   ```bash
   docker pull debezium/example-mongodb:0.10
   docker run -d -it --rm --name pulsar-mongodb -e MONGODB_USER=mongodb -e MONGODB_PASSWORD=mongodb -p 27017:27017  debezium/example-mongodb:0.10
   ```

   使用以下命令初始化数据。

   ```bash
   ./usr/local/bin/init-inventory.sh
   ```

   如果本地主机无法访问容器网络，您可以更新文件 `/etc/hosts` 并添加规则 `127.0.0.1 6 f114527a95f`。f114527a95f 是容器 ID，您可以尝试使用 `docker ps -a` 获取。


2. 在本地以独立模式启动 Pulsar 服务。

   ```bash
   bin/pulsar standalone
   ```

3. 使用以下方法之一在本地运行模式下启动 Pulsar Debezium 连接器。

   * 使用前面显示的 **JSON** 配置文件。

      确保 NAR 文件在 `connectors/pulsar-io-mongodb-@pulsar:version@.nar` 处可用。

       ```bash
       bin/pulsar-admin source localrun \
           --archive $PWD/connectors/pulsar-io-debezium-mongodb-@pulsar:version@.nar \
           --name debezium-mongodb-source \
           --tenant public \
           --namespace default \
           --source-config '{"mongodb.hosts": "rs0/mongodb:27017","mongodb.name": "dbserver1","mongodb.user": "debezium","mongodb.password": "dbz","mongodb.task.id": "1","database.whitelist": "inventory","database.history.pulsar.service.url": "pulsar://127.0.0.1:6650"}'
       ```

     :::note

     Debezium 连接器将数据保存在以下 4 种类型的 topics 中：

       - 一个以数据库服务器名称（`database.server.name`）命名的 topic，用于存储数据库元数据消息，如 `public/default/database.server.name`。
       - 一个 topic（`database.history.pulsar.topic`）用于存储数据库历史信息。连接器在此 topic 上写入和恢复 DDL 语句。
       - 一个 topic（`offset.storage.topic`）用于存储偏移量元数据消息。连接器在此 topic 上保存最后成功提交的偏移量。
       - 一个每表的 topic。连接器将表中发生的所有操作的更改事件写入特定于该表的单个 Pulsar topic。

     如果在您的 broker 上禁用了自动 topic 创建，您需要手动创建上述 4 种类型的 topics。

     :::

   * 使用前面显示的 **YAML** 配置文件。

       ```bash
       bin/pulsar-admin source localrun  \
       --source-config-file $PWD/debezium-mongodb-source-config.yaml
       ```

4. 订阅 _inventory.products_ 表的 topic _sub-products_。

   ```bash
   bin/pulsar-client consume -s "sub-products" public/default/dbserver1.inventory.products -n 0
   ```

5. 在 docker 中启动 MongoDB 客户端。

   ```bash
   docker exec -it pulsar-mongodb /bin/bash
   ```

6. MongoDB 客户端弹出。

   ```bash
   mongo -u debezium -p dbz --authenticationDatabase admin localhost:27017/inventory
   db.products.update({"_id":NumberLong(104)},{$set:{weight:1.25}})
   ```

   在订阅 topic 的终端窗口中，您可以收到以下消息。

   ```text
   ----- got message -----
   {"schema":{"type":"struct","fields":[{"type":"string","optional":false,"field":"id"}],"optional":false,"name":"dbserver1.inventory.products.Key"},"payload":{"id":"104"}}, value = {"schema":{"type":"struct","fields":[{"type":"string","optional":true,"name":"io.debezium.data.Json","version":1,"field":"after"},{"type":"string","optional":true,"name":"io.debezium.data.Json","version":1,"field":"patch"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"version"},{"type":"string","optional":false,"field":"connector"},{"type":"string","optional":false,"field":"name"},{"type":"int64","optional":false,"field":"ts_ms"},{"type":"string","optional":true,"name":"io.debezium.data.Enum","version":1,"parameters":{"allowed":"true,last,false"},"default":"false","field":"snapshot"},{"type":"string","optional":false,"field":"db"},{"type":"string","optional":false,"field":"rs"},{"type":"string","optional":false,"field":"collection"},{"type":"int32","optional":false,"field":"ord"},{"type":"int64","optional":true,"field":"h"}],"optional":false,"name":"io.debezium.connector.mongo.Source","field":"source"},{"type":"string","optional":true,"field":"op"},{"type":"int64","optional":true,"field":"ts_ms"}],"optional":false,"name":"dbserver1.inventory.products.Envelope"},"payload":{"after":"{\"_id\": {\"$numberLong\": \"104\"},\"name\": \"hammer\",\"description\": \"12oz carpenter's hammer\",\"weight\": 1.25,\"quantity\": 4}","patch":null,"source":{"version":"0.10.0.Final","connector":"mongodb","name":"dbserver1","ts_ms":1573541905000,"snapshot":"true","db":"inventory","rs":"rs0","collection":"products","ord":1,"h":4983083486544392763},"op":"r","ts_ms":1573541909761}}.
   ```

## Oracle 示例

### 打包

Oracle 连接器不包含 Oracle JDBC 驱动程序，您需要将其与连接器一起打包。
不包含驱动程序的主要原因是版本多样性和 Oracle 许可证。建议使用您的 Oracle DB 安装提供的驱动程序，或者您可以[下载](https://www.oracle.com/database/technologies/appdev/jdbc.html)一个。
集成测试有将驱动程序打包到连接器 NAR 文件中的[示例](https://github.com/apache/pulsar/blob/e2bc52d40450fa00af258c4432a5b71d50a5c6e0/tests/docker-images/latest-version-image/Dockerfile#L110-L122)。

### 配置

Debezium [需要](https://debezium.io/documentation/reference/1.5/connectors/oracle.html#oracle-overview) 启用了 LogMiner 或 XStream API 的 Oracle DB。
支持的选项和启用它们的步骤因 Oracle DB 版本而异。
[文档](https://debezium.io/documentation/reference/1.5/connectors/oracle.html#oracle-overview)中概述的步骤并在[集成测试](https://github.com/apache/pulsar/blob/master/tests/integration/src/test/java/org/apache/pulsar/tests/integration/io/sources/debezium/DebeziumOracleDbSourceTester.java)中使用的步骤可能对您使用的 Oracle DB 版本和版本有效或无效。
请根据需要参阅 [Oracle DB 文档](https://docs.oracle.com/en/database/oracle/oracle-database/)。

与其他连接器类似，您可以使用 JSON 或 YAML 来配置连接器。
以 YAML 为例，您可以创建一个 `debezium-oracle-source-config.yaml` 文件，如下所示：

* JSON

```json
{
  "database.hostname": "localhost",
  "database.port": "1521",
  "database.user": "dbzuser",
  "database.password": "dbz",
  "database.dbname": "XE",
  "database.server.name": "XE",
  "schema.exclude.list": "system,dbzuser",
  "snapshot.mode": "initial",
  "topic.namespace": "public/default",
  "task.class": "io.debezium.connector.oracle.OracleConnectorTask",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "key.converter": "org.apache.kafka.connect.json.JsonConverter",
  "typeClassName": "org.apache.pulsar.common.schema.KeyValue",
  "database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory",
  "database.tcpKeepAlive": "true",
  "decimal.handling.mode": "double",
  "database.history.pulsar.topic": "debezium-oracle-source-history-topic",
  "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650"
}
```

* YAML

```yaml
tenant: "public"
namespace: "default"
name: "debezium-oracle-source"
topicName: "debezium-oracle-topic"
parallelism: 1

className: "org.apache.pulsar.io.debezium.oracle.DebeziumOracleSource"
database.dbname: "XE"

configs:
    database.hostname: "localhost"
    database.port: "1521"
    database.user: "dbzuser"
    database.password: "dbz"
    database.dbname: "XE"
    database.server.name: "XE"
    schema.exclude.list: "system,dbzuser"
    snapshot.mode: "initial"
    topic.namespace: "public/default"
    task.class: "io.debezium.connector.oracle.OracleConnectorTask"
    value.converter: "org.apache.kafka.connect.json.JsonConverter"
    key.converter: "org.apache.kafka.connect.json.JsonConverter"
    typeClassName: "org.apache.pulsar.common.schema.KeyValue"
    database.history: "org.apache.pulsar.io.debezium.PulsarDatabaseHistory"
    database.tcpKeepAlive: "true"
    decimal.handling.mode: "double"
    database.history.pulsar.topic: "debezium-oracle-source-history-topic"
    database.history.pulsar.service.url: "pulsar://127.0.0.1:6650"
```

有关 Debezium 支持的配置属性的完整列表，请参阅 [Oracle 的 Debezium 连接器](https://debezium.io/documentation/reference/1.5/connectors/oracle.html#oracle-connector-properties)。

## Microsoft SQL 示例

### 配置

Debezium [需要](https://debezium.io/documentation/reference/1.5/connectors/sqlserver.html#sqlserver-overview) 启用了 CDC 的 SQL Server。
[文档](https://debezium.io/documentation/reference/1.5/connectors/sqlserver.html#setting-up-sqlserver)中概述的步骤并在[集成测试](https://github.com/apache/pulsar/blob/master/tests/integration/src/test/java/org/apache/pulsar/tests/integration/io/sources/debezium/DebeziumMsSqlSourceTester.java)中使用的步骤。
有关更多信息，请参阅 [在 Microsoft SQL Server 中启用和禁用变更数据捕获](https://docs.microsoft.com/en-us/sql/relational-databases/track-changes/enable-and-disable-change-data-capture-sql-server)。

与其他连接器类似，您可以使用 JSON 或 YAML 来配置连接器。

* JSON

```json
{
  "database.hostname": "localhost",
  "database.port": "1433",
  "database.user": "sa",
  "database.password": "MyP@ssw0rd!",
  "database.dbname": "MyTestDB",
  "database.server.name": "mssql",
  "snapshot.mode": "schema_only",
  "topic.namespace": "public/default",
  "task.class": "io.debezium.connector.sqlserver.SqlServerConnectorTask",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "key.converter": "org.apache.kafka.connect.json.JsonConverter",
  "typeClassName": "org.apache.pulsar.common.schema.KeyValue",
  "database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory",
  "database.tcpKeepAlive": "true",
  "decimal.handling.mode": "double",
  "database.history.pulsar.topic": "debezium-mssql-source-history-topic",
  "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650"
}
```

* YAML

```yaml
tenant: "public"
namespace: "default"
name: "debezium-mssql-source"
topicName: "debezium-mssql-topic"
parallelism: 1

className: "org.apache.pulsar.io.debezium.mssql.DebeziumMsSqlSource"
database.dbname: "mssql"

configs:
    database.hostname: "localhost"
    database.port: "1433"
    database.user: "sa"
    database.password: "MyP@ssw0rd!"
    database.dbname: "MyTestDB"
    database.server.name: "mssql"
    snapshot.mode: "schema_only"
    topic.namespace: "public/default"
    task.class: "io.debezium.connector.sqlserver.SqlServerConnectorTask"
    value.converter: "org.apache.kafka.connect.json.JsonConverter"
    key.converter: "org.apache.kafka.connect.json.JsonConverter"
    typeClassName: "org.apache.pulsar.common.schema.KeyValue"
    database.history: "org.apache.pulsar.io.debezium.PulsarDatabaseHistory"
    database.tcpKeepAlive: "true"
    decimal.handling.mode: "double"
    database.history.pulsar.topic: "debezium-mssql-source-history-topic"
    database.history.pulsar.service.url: "pulsar://127.0.0.1:6650"
```

有关 Debezium 支持的配置属性的完整列表，请参阅 [MS SQL 的 Debezium 连接器](https://debezium.io/documentation/reference/1.5/connectors/sqlserver.html#sqlserver-connector-properties)。

## 常见问题

### Debezium postgres 连接器在创建快照时会挂起

```
#18 prio=5 os_prio=31 tid=0x00007fd83096f800 nid=0xa403 waiting on condition [0x000070000f534000]
    java.lang.Thread.State: WAITING (parking)
     at sun.misc.Unsafe.park(Native Method)
     - parking to wait for  <0x00000007ab025a58> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
     at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
     at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
     at java.util.concurrent.LinkedBlockingDeque.putLast(LinkedBlockingDeque.java:396)
     at java.util.concurrent.LinkedBlockingDeque.put(LinkedBlockingDeque.java:649)
     at io.debezium.connector.base.ChangeEventQueue.enqueue(ChangeEventQueue.java:132)
     at io.debezium.connector.postgresql.PostgresConnectorTask$Lambda$203/385424085.accept(Unknown Source)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer.sendCurrentRecord(RecordsSnapshotProducer.java:402)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer.readTable(RecordsSnapshotProducer.java:321)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer.lambda$takeSnapshot$6(RecordsSnapshotProducer.java:226)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer$Lambda$240/1347039967.accept(Unknown Source)
     at io.debezium.jdbc.JdbcConnection.queryWithBlockingConsumer(JdbcConnection.java:535)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer.takeSnapshot(RecordsSnapshotProducer.java:224)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer.lambda$start$0(RecordsSnapshotProducer.java:87)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer$Lambda$206/589332928.run(Unknown Source)
     at java.util.concurrent.CompletableFuture.uniRun(CompletableFuture.java:705)
     at java.util.concurrent.CompletableFuture.uniRunStage(CompletableFuture.java:717)
     at java.util.concurrent.CompletableFuture.thenRun(CompletableFuture.java:2010)
     at io.debezium.connector.postgresql.RecordsSnapshotProducer.start(RecordsSnapshotProducer.java:87)
     at io.debezium.connector.postgresql.PostgresConnectorTask.start(PostgresConnectorTask.java:126)
     at io.debezium.connector.common.BaseSourceTask.start(BaseSourceTask.java:47)
     at org.apache.pulsar.io.kafka.connect.KafkaConnectSource.open(KafkaConnectSource.java:127)
     at org.apache.pulsar.io.debezium.DebeziumSource.open(DebeziumSource.java:100)
     at org.apache.pulsar.functions.instance.JavaInstanceRunnable.setupInput(JavaInstanceRunnable.java:690)
     at org.apache.pulsar.functions.instance.JavaInstanceRunnable.setupJavaInstance(JavaInstanceRunnable.java:200)
     at org.apache.pulsar.functions.instance.JavaInstanceRunnable.run(JavaInstanceRunnable.java:230)
     at java.lang.Thread.run(Thread.java:748)
```

如果您在同步数据时遇到上述问题，请参阅[此问题](https://github.com/apache/pulsar/issues/4075)并在配置文件中添加以下配置：

```
max.queue.size=
```