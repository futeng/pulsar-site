---
id: io-quickstart
title: How to connect Pulsar to database
sidebar_label: "Get started"
description: Get started to connect Pulsar to database.
---

本教程提供了实际操作体验，展示了如何在不编写任何代码的情况下将数据移出 Pulsar。

通过运行本指南中的步骤来回顾 Pulsar I/O 的[概念](io-overview.md)有助于加深理解。

在本教程结束时，您可以：

- [将 Pulsar 连接到 Cassandra](#将-pulsar-连接到-cassandra)
- [将 Pulsar 连接到 PostgreSQL](#将-pulsar-连接到-postgresql)

:::tip

* 这些说明假设您以独立模式运行 Pulsar。但是，本教程中使用的所有命令都可以在多节点 Pulsar 集群中使用，无需任何更改。
* 所有说明都假定在 Pulsar 二进制发行版的根目录中运行。

:::

## 安装 Pulsar 和内置连接器

在将 Pulsar 连接到数据库之前，您需要安装 Pulsar 和所需的内置连接器。

阅读[在本地运行独立 Pulsar 集群](getting-started-standalone.md)以下载 Pulsar 发行版。

要启用 Pulsar 连接器，您需要从[下载页面](pathname:///download/)下载连接器的 tarball 版本。

下载 NAR 文件后，将文件复制到 Pulsar 目录中的 `connectors` 目录。例如，如果您下载了 `pulsar-io-aerospike-@pulsar:version@.nar` 连接器文件，请输入以下命令：

```bash
mkdir connectors
mv pulsar-io-aerospike-@pulsar:version@.nar connectors

ls connectors
# pulsar-io-aerospike-@pulsar:version@.nar
# ...
```

:::note

* 如果您在裸机集群中运行 Pulsar，请确保 `connectors` tarball 在每个 broker 的 pulsar 目录中解压缩（或者如果您为 Pulsar Functions 运行单独的 worker 集群，则在每个 function-worker 的 pulsar 目录中解压缩）。
* 如果您[在 Docker 中运行 Pulsar](getting-started-docker.md)或使用 docker 镜像（例如 [K8S](deploy-kubernetes.md)）部署 Pulsar，您可以使用 `apachepulsar/pulsar-all` 镜像而不是 `apachepulsar/pulsar` 镜像。`apachepulsar/pulsar-all` 镜像已经捆绑了所有内置连接器。

:::

## 启动 Pulsar 独立模式

1. 本地启动 Pulsar。

   ```bash
   bin/pulsar standalone
   ```

   Pulsar 服务的所有组件按顺序启动。

   您可以 curl 这些 pulsar 服务端点以确保 Pulsar 服务正常运行。

2. 检查 Pulsar 二进制协议端口。

   ```bash
   telnet localhost 6650
   ```

3. 检查 Pulsar Function 集群。

   ```bash
   curl -s http://localhost:8080/admin/v2/worker/cluster
   ```

   **示例输出**

   ```json
   [{"workerId":"c-standalone-fw-localhost-6750","workerHostname":"localhost","port":6750}]
   ```

4. 确保存在 public tenant 和 default namespace。

   ```bash
   curl -s http://localhost:8080/admin/v2/namespaces/public
   ```

   **示例输出**

   ```json
   ["public/default","public/functions"]
   ```

5. 所有内置连接器都应列为可用。

   ```bash
   curl -s http://localhost:8080/admin/v2/functions/connectors
   ```

   **示例输出**

   ```json
   [{"name":"aerospike","description":"Aerospike database sink","sinkClass":"org.apache.pulsar.io.aerospike.AerospikeStringSink"},{"name":"cassandra","description":"Writes data into Cassandra","sinkClass":"org.apache.pulsar.io.cassandra.CassandraStringSink"},{"name":"kafka","description":"Kafka source and sink connector","sourceClass":"org.apache.pulsar.io.kafka.KafkaStringSource","sinkClass":"org.apache.pulsar.io.kafka.KafkaBytesSink"},{"name":"kinesis","description":"Kinesis sink connector","sinkClass":"org.apache.pulsar.io.kinesis.KinesisSink"},{"name":"rabbitmq","description":"RabbitMQ source connector","sourceClass":"org.apache.pulsar.io.rabbitmq.RabbitMQSource"},{"name":"twitter","description":"Ingest data from Twitter firehose","sourceClass":"org.apache.pulsar.io.twitter.TwitterFireHose"}]
   ```

   如果启动 Pulsar 服务时发生错误，您可能会在运行 `pulsar/standalone` 的终端上看到异常，或者您可以导航到 Pulsar 目录下的 `logs` 目录查看日志。

## 将 Pulsar 连接到 Cassandra

本节演示如何将 Pulsar 连接到 Cassandra。

:::tip

* 确保您已安装 Docker。如果没有，请参阅[安装 Docker](https://docs.docker.com/docker-for-mac/install/)。有关 Docker 命令的更多信息，请参阅 [Docker CLI](https://docs.docker.com/engine/reference/commandline/run/)。
* Cassandra sink 连接器从 Pulsar Topic 读取消息并将消息写入 Cassandra 表。有关更多信息，请参阅 [Cassandra sink 连接器](io-cassandra-sink.md)。

:::

要将 Pulsar 连接到 Cassandra，您可以按照以下步骤操作：

### 步骤 1：设置 Cassandra 集群

此示例使用 `cassandra` Docker 镜像在 Docker 中启动单节点 Cassandra 集群。

1. 启动 Cassandra 集群。

   ```bash
   docker run -d --rm --name=cassandra -p 9042:9042 cassandra:3.11
   ```

   :::note

   在继续下一步之前，请确保 Cassandra 集群正在运行。

   :::

2. 确保 Docker 进程正在运行。

   ```bash
   docker ps
   ```

3. 检查 Cassandra 日志以确保 Cassandra 进程按预期运行。

   ```bash
   docker logs cassandra
   ```

4. 检查 Cassandra 集群的状态。

   ```bash
   docker exec cassandra nodetool status
   ```

   **示例输出**

   ```
   Datacenter: datacenter1
   =======================
   Status=Up/Down
   |/ State=Normal/Leaving/Joining/Moving
   --  Address     Load       Tokens       Owns (effective)  Host ID                               Rack
   UN  172.17.0.2  103.67 KiB  256          100.0%            af0e4b2f-84e0-4f0b-bb14-bd5f9070ff26  rack1
   ```

5. 使用 `cqlsh` 连接到 Cassandra 集群。

   ```bash
   docker exec -ti cassandra cqlsh localhost
   ```

    **输出**
   ```
   Connected to Test Cluster at localhost:9042.
   [cqlsh 5.0.1 | Cassandra 3.11.2 | CQL spec 3.4.4 | Native protocol v4]
   Use HELP for help.
   cqlsh>
   ```

6. 创建 keyspace `pulsar_test_keyspace`。

   ```bash
   cqlsh> CREATE KEYSPACE pulsar_test_keyspace WITH replication = {'class':'SimpleStrategy', 'replication_factor':1};
   ```

7. 创建表 `pulsar_test_table`。

   ```bash
   cqlsh> USE pulsar_test_keyspace;
   cqlsh:pulsar_test_keyspace> CREATE TABLE pulsar_test_table (key text PRIMARY KEY, col text);
   ```

### 步骤 2：配置 Cassandra sink

现在我们有了一个在本地运行的 Cassandra 集群。

在本节中，您需要配置一个 Cassandra sink 连接器。

要运行 Cassandra sink 连接器，您需要准备一个配置文件，包含 Pulsar 连接器运行时需要知道的信息。

例如，Pulsar 连接器如何找到 Cassandra 集群，Pulsar 连接器使用哪个 keyspace 和表来写入 Pulsar 消息等等。

您可以通过以下方法之一创建配置文件。

* JSON

  ```json
  {
      "roots": "localhost:9042",
      "keyspace": "pulsar_test_keyspace",
      "columnFamily": "pulsar_test_table",
      "keyname": "key",
      "columnName": "col"
  }
  ```

* YAML

  ```yaml
  configs:
      roots: "localhost:9042"
      keyspace: "pulsar_test_keyspace"
      columnFamily: "pulsar_test_table"
      keyname: "key"
      columnName: "col"
  ```

有关更多信息，请参阅 [Cassandra sink 连接器](io-cassandra-sink.md)。

### 步骤 3：创建 Cassandra sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) 创建 sink 连接器并对它们执行其他操作。

运行以下命令以创建一个 sink 类型为 _cassandra_ 的 Cassandra sink 连接器，并使用先前创建的配置文件 _examples/cassandra-sink.yml_。

:::note

当前内置连接器的 `sink-type` 参数由 _pulsar-io.yaml_ 文件中指定的 `name` 参数设置决定。

:::

```bash
bin/pulsar-admin sinks create \
    --tenant public \
    --namespace default \
    --name cassandra-test-sink \
    --sink-type cassandra \
    --sink-config-file $PWD/examples/cassandra-sink.yml \
    --inputs test_cassandra
```

一旦命令执行，Pulsar 创建 sink 连接器 _cassandra-test-sink_。

此 sink 连接器作为 Pulsar Function 运行，将在 topic _test_cassandra_ 中生成的消息写入 Cassandra 表 _pulsar_test_table_。

### 步骤 4：检查 Cassandra sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) 监控连接器并对其执行其他操作。

* 获取 Cassandra sink 的信息。

  ```bash
  bin/pulsar-admin sinks get \
    --tenant public \
    --namespace default \
    --name cassandra-test-sink
  ```

  **示例输出**

  ```json
  {
  "tenant": "public",
  "namespace": "default",
  "name": "cassandra-test-sink",
  "className": "org.apache.pulsar.io.cassandra.CassandraStringSink",
  "inputSpecs": {
    "test_cassandra": {
      "isRegexPattern": false
    }
  },
  "configs": {
    "roots": "localhost:9042",
    "keyspace": "pulsar_test_keyspace",
    "columnFamily": "pulsar_test_table",
    "keyname": "key",
    "columnName": "col"
  },
  "parallelism": 1,
  "processingGuarantees": "ATLEAST_ONCE",
  "retainOrdering": false,
  "autoAck": true,
  "archive": "builtin://cassandra"
  }
  ```

* 检查 Cassandra sink 的状态。

  ```bash
  bin/pulsar-admin sinks status \
    --tenant public \
    --namespace default \
    --name cassandra-test-sink
  ```

  **示例输出**

  ```json
  {
  "numInstances" : 1,
  "numRunning" : 1,
  "instances" : [ {
    "instanceId" : 0,
    "status" : {
      "running" : true,
      "error" : "",
      "numRestarts" : 0,
      "numReadFromPulsar" : 0,
      "numSystemExceptions" : 0,
      "latestSystemExceptions" : [ ],
      "numSinkExceptions" : 0,
      "latestSinkExceptions" : [ ],
      "numWrittenToSink" : 0,
      "lastReceivedTime" : 0,
      "workerId" : "c-standalone-fw-localhost-8080"
    }
  } ]
  }
  ```

### 步骤 5：验证 Cassandra sink

1. 向 Cassandra sink _test_cassandra_ 的输入 topic 生成一些消息。

   ```bash
   for i in {0..9}; do bin/pulsar-client produce -m "key-$i" -n 1 test_cassandra; done
   ```

2. 检查 Cassandra sink _test_cassandra_ 的状态。

   ```bash
   bin/pulsar-admin sinks status \
       --tenant public \
       --namespace default \
       --name cassandra-test-sink
   ```

   您可以看到 10 条消息被 Cassandra sink _test_cassandra_ 处理。

   **示例输出**

   ```json
   {
     "numInstances" : 1,
     "numRunning" : 1,
     "instances" : [ {
       "instanceId" : 0,
       "status" : {
         "running" : true,
         "error" : "",
         "numRestarts" : 0,
         "numReadFromPulsar" : 10,
         "numSystemExceptions" : 0,
         "latestSystemExceptions" : [ ],
         "numSinkExceptions" : 0,
         "latestSinkExceptions" : [ ],
         "numWrittenToSink" : 10,
         "lastReceivedTime" : 1551685489136,
         "workerId" : "c-standalone-fw-localhost-8080"
       }
     } ]
   }
   ```

3. 使用 `cqlsh` 连接到 Cassandra 集群。

   ```bash
   docker exec -ti cassandra cqlsh localhost
   ```

4. 检查 Cassandra 表 _pulsar_test_table_ 的数据。

   ```bash
   cqlsh> use pulsar_test_keyspace;
   cqlsh:pulsar_test_keyspace> select * from pulsar_test_table;

   key    | col
   --------+--------
    key-5 |  key-5
    key-0 |  key-0
    key-9 |  key-9
    key-2 |  key-2
    key-1 |  key-1
    key-3 |  key-3
    key-6 |  key-6
    key-7 |  key-7
    key-4 |  key-4
    key-8 |  key-8
   ```

### 步骤 6：删除 Cassandra Sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)
删除连接器并对其执行其他操作。

```bash
bin/pulsar-admin sinks delete \
    --tenant public \
    --namespace default \
    --name cassandra-test-sink
```

## 将 Pulsar 连接到 PostgreSQL

本节演示如何将 Pulsar 连接到 PostgreSQL。

:::tip

* 确保您已安装 Docker。如果没有，请参阅[安装 Docker](https://docs.docker.com/docker-for-mac/install/)。有关 Docker 命令的更多信息，请参阅 [Docker CLI](https://docs.docker.com/engine/reference/commandline/run/)。
* JDBC sink 连接器从 Pulsar Topic 拉取消息并将消息持久化到 ClickHouse、MariaDB、PostgreSQL 或 SQLite。有关更多信息，请参阅 [JDBC sink 连接器](io-jdbc-sink.md)。

:::

要将 Pulsar 连接到 PostgreSQL，您可以按照以下步骤操作：

### 步骤 1：设置 PostgreSQL 集群

此示例使用 PostgreSQL 12 docker 镜像在 Docker 中启动单节点 PostgreSQL 集群。

1. 从 Docker 拉取 PostgreSQL 12 镜像。

   ```bash
   docker pull postgres:12
   ```

2. 启动 PostgreSQL。

    ```bash
    docker run -d -it --rm \
        --name pulsar-postgres \
        -p 5432:5432 \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_USER=postgres \
        postgres:12
    ```

3. 检查 PostgreSQL 是否已成功启动。

   ```bash
   docker logs -f pulsar-postgres
   ```

   如果出现以下消息，则表示 PostgreSQL 已成功启动。

   ```text
   2020-05-11 20:09:24.492 UTC [1] LOG:  starting PostgreSQL 12.2 (Debian 12.2-2.pgdg100+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 8.3.0-6) 8.3.0, 64-bit
   2020-05-11 20:09:24.492 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
   2020-05-11 20:09:24.492 UTC [1] LOG:  listening on IPv6 address "::", port 5432
   2020-05-11 20:09:24.499 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
   2020-05-11 20:09:24.523 UTC [55] LOG:  database system was shut down at 2020-05-11 20:09:24 UTC
   2020-05-11 20:09:24.533 UTC [1] LOG:  database system is ready to accept connections
   ```

4. 访问 PostgreSQL 容器。

   ```bash
   docker exec -it pulsar-postgres /bin/bash
   ```

5. 使用默认用户名和密码登录 PostgreSQL：

   ```bash
   psql -U postgres postgres
   ```

6. 使用以下命令创建 `pulsar_postgres_jdbc_sink` 表：

   ```sql
   create table if not exists pulsar_postgres_jdbc_sink
   (
   id serial PRIMARY KEY,
   name VARCHAR(255) NOT NULL
   );
   ```

### 步骤 2：配置 JDBC sink

现在我们有一个在本地运行的 PostgreSQL。

在本节中，您需要配置一个 JDBC sink 连接器。

1. 添加配置文件。

   要运行 JDBC sink 连接器，您需要准备一个 YAML 配置文件，包含 Pulsar 连接器运行时需要知道的信息。

   例如，Pulsar 连接器如何找到 PostgreSQL 集群，Pulsar 连接器使用什么 JDBC URL 和表来写入消息。

   创建一个 _pulsar-postgres-jdbc-sink.yaml_ 文件，将以下内容复制到此文件，并将文件放在 `pulsar/connectors` 文件夹中。

   ```yaml
   configs:
     userName: "postgres"
     password: "password"
     jdbcUrl: "jdbc:postgresql://localhost:5432/postgres"
     tableName: "pulsar_postgres_jdbc_sink"
   ```

2. 创建一个 schema。

   创建一个 _avro-schema_ 文件，将以下内容复制到此文件，并将文件放在 `pulsar/connectors` 文件夹中。

   ```json
   {
     "type": "AVRO",
     "schema": "{\"type\":\"record\",\"name\":\"Test\",\"fields\":[{\"name\":\"id\",\"type\":[\"null\",\"int\"]},{\"name\":\"name\",\"type\":[\"null\",\"string\"]}]}",
     "properties": {}
   }
   ```

   :::tip

   有关 AVRO 的更多信息，请参阅 [Apache Avro](https://avro.apache.org/docs/1.9.1/)。

   :::

3. 将 schema 上传到 topic。

   此示例将 _avro-schema_ schema 上传到 _pulsar-postgres-jdbc-sink-topic_ topic。

   ```bash
   bin/pulsar-admin schemas upload pulsar-postgres-jdbc-sink-topic -f ./connectors/avro-schema
   ```

4. 检查 schema 是否已成功上传。

   ```bash
   bin/pulsar-admin schemas get pulsar-postgres-jdbc-sink-topic
   ```

   如果出现以下消息，则表示 schema 已成功上传。

   ```json
   {"name":"pulsar-postgres-jdbc-sink-topic","schema":"{\"type\":\"record\",\"name\":\"Test\",\"fields\":[{\"name\":\"id\",\"type\":[\"null\",\"int\"]},{\"name\":\"name\",\"type\":[\"null\",\"string\"]}]}","type":"AVRO","properties":{}}
   ```

### 步骤 3：创建 JDBC sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)
创建 sink 连接器并对其执行其他操作。

此示例创建一个 sink 连接器并指定所需信息。

```bash
bin/pulsar-admin sinks create \
    --archive $PWD/connectors/pulsar-io-jdbc-postgres-@pulsar:version@.nar \
    --inputs pulsar-postgres-jdbc-sink-topic \
    --name pulsar-postgres-jdbc-sink \
    --sink-config-file $PWD/connectors/pulsar-postgres-jdbc-sink.yaml \
    --parallelism 1
```

一旦命令执行，Pulsar 创建一个 sink 连接器 _pulsar-postgres-jdbc-sink_。

此 sink 连接器作为 Pulsar Function 运行，将在 topic _pulsar-postgres-jdbc-sink-topic_ 中生成的消息写入 PostgreSQL 表 _pulsar_postgres_jdbc_sink_。

 #### 提示

 标志 | 描述 | 示例
 ---|---|---|
 `--archive` | sink 的存档文件的绝对路径。 | $PWD/pulsar-io-jdbc-postgres-@pulsar:version@.nar |
 `--inputs` | sink 的输入 topic。<br /><br /> 可以指定多个 topic 作为逗号分隔列表。||
 `--name` | sink 的名称。 | pulsar-postgres-jdbc-sink |
 `--sink-config-file` | 指定 sink 配置的 YAML 配置文件的绝对路径。 | $PWD/pulsar-postgres-jdbc-sink.yaml |
 `--parallelism` | sink 的并行度因子。<br /><br /> 例如，要运行的 sink 实例数量。 |  1 |

:::tip

有关 `pulsar-admin sinks create options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

如果出现以下消息，则表示 sink 已成功创建。

```bash
Created successfully
```

### 步骤 4：检查 JDBC sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)
监控连接器并对其执行其他操作。

* 列出所有正在运行的 JDBC sink。

    ```bash
    bin/pulsar-admin sinks list \
        --tenant public \
        --namespace default
    ```

  :::tip

  有关 `pulsar-admin sinks list options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

  结果显示只有 _postgres-jdbc-sink_ sink 正在运行。

  ```json
  [
  "pulsar-postgres-jdbc-sink"
  ]
  ```

* 获取 JDBC sink 的信息。

    ```bash
    bin/pulsar-admin sinks get \
      --tenant public \
      --namespace default \
      --name pulsar-postgres-jdbc-sink
    ```

  :::tip

  有关 `pulsar-admin sinks get options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

  结果显示 sink 连接器的信息，包括 tenant、namespace、topic 等等。

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

* 获取 JDBC sink 的状态

  ```bash
  bin/pulsar-admin sinks status \
    --tenant public \
    --namespace default \
    --name pulsar-postgres-jdbc-sink
  ```

  :::tip

  有关 `pulsar-admin sinks status options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

  结果显示 sink 连接器的当前状态，包括实例数量、运行状态、worker ID 等等。

  ```json
  {
  "numInstances" : 1,
  "numRunning" : 1,
  "instances" : [ {
    "instanceId" : 0,
    "status" : {
      "running" : true,
      "error" : "",
      "numRestarts" : 0,
      "numReadFromPulsar" : 0,
      "numSystemExceptions" : 0,
      "latestSystemExceptions" : [ ],
      "numSinkExceptions" : 0,
      "latestSinkExceptions" : [ ],
      "numWrittenToSink" : 0,
      "lastReceivedTime" : 0,
      "workerId" : "c-standalone-fw-192.168.2.52-8080"
    }
  } ]
  }
  ```

### 步骤 5：停止 JDBC sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) 停止连接器并对其执行其他操作。

```bash
bin/pulsar-admin sinks stop \
    --tenant public \
    --namespace default \
    --name pulsar-postgres-jdbc-sink
```

:::tip

有关 `pulsar-admin sinks stop options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

如果出现以下消息，则表示 sink 实例已成功停止。

```bash
Stopped successfully
```

### 步骤 6：重启 JDBC sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) 重启连接器并对其执行其他操作。

```bash
bin/pulsar-admin sinks restart \
    --tenant public \
    --namespace default \
    --name pulsar-postgres-jdbc-sink
```

:::tip

有关 `pulsar-admin sinks restart options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

如果出现以下消息，则表示 sink 实例已成功启动。

```bash
Started successfully
```

:::tip

* 或者，您可以使用 `pulsar-admin sinks localrun options` 运行独立 sink 连接器。
请注意 `pulsar-admin sinks localrun options` **在本地运行 sink 连接器**，而 `pulsar-admin sinks start options` **在集群中启动 sink 连接器**。
* 有关 `pulsar-admin sinks localrun options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

### 步骤 7：更新 JDBC sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) 更新连接器并对其执行其他操作。

此示例将 _pulsar-postgres-jdbc-sink_ sink 连接器的并行度更新为 2。

```bash
bin/pulsar-admin sinks update \
    --name pulsar-postgres-jdbc-sink \
    --parallelism 2
```

:::tip

有关 `pulsar-admin sinks update options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

如果出现以下消息，则表示 sink 连接器已成功更新。

```bash
Updated successfully
```

此示例再次检查信息。

```bash
bin/pulsar-admin sinks get \
    --tenant public \
    --namespace default \
    --name pulsar-postgres-jdbc-sink
```

结果显示并行度为 2。

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
  "parallelism": 2,
  "processingGuarantees": "ATLEAST_ONCE",
  "retainOrdering": false,
  "autoAck": true
}
```

### 步骤 8：删除 JDBC sink

您可以使用[连接器 Admin CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)
删除连接器并对其执行其他操作。

此示例删除 _pulsar-postgres-jdbc-sink_ sink 连接器。

```bash
bin/pulsar-admin sinks delete \
    --tenant public \
    --namespace default \
    --name pulsar-postgres-jdbc-sink
```

:::tip

有关 `pulsar-admin sinks delete options` 的更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

如果出现以下消息，则表示 sink 连接器已成功删除。

```text
Deleted successfully
```

此示例再次检查 sink 连接器的状态。

```bash
bin/pulsar-admin sinks get \
    --tenant public \
    --namespace default \
    --name pulsar-postgres-jdbc-sink
```

结果显示 sink 连接器不存在。

```text
HTTP 404 Not Found
Reason: Sink pulsar-postgres-jdbc-sink doesn't exist
```