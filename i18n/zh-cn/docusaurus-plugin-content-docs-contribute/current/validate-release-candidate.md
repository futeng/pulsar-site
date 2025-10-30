---
id: validate-release-candidate
title: Validating release candidates
---

本页包含审查和验证发布候选者的手动说明。

## 验证二进制分发

:::note

[lhotari/pulsar-release-validation](https://github.com/lhotari/pulsar-release-validation) 中提供了自动化脚本，用于协助以下步骤的半自动化验证。验证脚本在容器化环境中运行，在 Linux 和 macOS 上只需要 Docker 和 Bash，在 Windows 上需要 PowerShell 7.x。

:::


### 下载并验证二进制分发

下载服务器分发版 `apache-pulsar-<release>-bin.tar.gz` 并解压。解压的文件位于名为 `apache-pulsar-<release>` 的目录中。下面的所有操作都在该目录中进行：

```shell
cd apache-pulsar-<release>
```

检查 bookkeeper 库是否在 Linux 上编译：

```shell
unzip -t ./lib/org.apache.bookkeeper-circe-checksum-*.jar | grep lib
unzip -t ./lib/org.apache.bookkeeper-cpu-affinity-*.jar | grep lib
```

输出应该如下所示：

```shell
testing: lib/                     OK
testing: lib/libcirce-checksum.so   OK
testing: lib/                     OK
testing: lib/libcpu-affinity.so   OK
```

下载 Cassandra 连接器：

```shell
mkdir connectors
mv pulsar-io-cassandra-<release>.nar connectors
```

下载 `*.asc` 文件并验证 GPG 签名：

```bash
gpg --verify apache-pulsar-<release>-bin.tar.gz.asc
```

### 下载并验证源代码压缩包

在开始验证源代码压缩包之前，确保你已经安装了这些软件：

* Amazon Corretto OpenJDK
  * 对于 Pulsar 版本 >= 3.3 使用 JDK 21
    * 代码将使用 Java 21 为 Java 17 编译
    * Pulsar docker 镜像自 3.3.0 开始运行 Java 21
  * 对于 Pulsar 版本 >= 2.11 使用 JDK 17
  * 对于早期版本使用 JDK 11
* Maven 3.9.9（最新的稳定 Maven 3.9.x 版本）
  * 使用 `sdkman i maven 3.9.9` 安装
* Zip

请参考 ["使用 SDKMAN 设置 JDK 和 Maven"](setup-buildtools.md) 了解如何使用 SDKMAN 安装 JDK 和 Maven 的详细信息。

下载源代码压缩包并解压。解压的文件位于名为 `apache-pulsar-<release>-src` 的目录中

```shell
cd apache-pulsar-<release>-src
mvn clean install -DskipTests
```

### 验证 Pub/Sub 和 Java Functions

#### 独立服务

打开终端启动独立服务：

```shell
PULSAR_STANDALONE_USE_ZOOKEEPER=1 bin/pulsar standalone
```

当你启动独立集群时，有几个事项需要检查。

1. 独立集群能够定位所有连接器。应该显示以下日志信息。

```text
Found connector ConnectorDefinition(name=kinesis, description=Kinesis sink connector, sourceClass=null, sinkClass=org.apache.pulsar.io.kinesis.KinesisSink) from /Users/sijie/tmp/apache-pulsar-2.1.0-incubating/./connectors/pulsar-io-kinesis-2.1.0-incubating.nar
...
Found connector ConnectorDefinition(name=cassandra, description=Writes data into Cassandra, sourceClass=null, sinkClass=org.apache.pulsar.io.cassandra.CassandraStringSink) from /Users/sijie/tmp/apache-pulsar-2.1.0-incubating/./connectors/pulsar-io-cassandra-2.1.0-incubating.nar
...
Found connector ConnectorDefinition(name=aerospike, description=Aerospike database sink, sourceClass=null, sinkClass=org.apache.pulsar.io.aerospike.AerospikeStringSink) from /Users/sijie/tmp/apache-pulsar-2.1.0-incubating/./connectors/pulsar-io-aerospike-2.1.0-incubating.nar
```

2. （自 Pulsar 2.1 发布起）独立服务启动 bookkeeper 表服务。输出如下所示：

```text
12:12:26.099 [main] INFO  org.apache.pulsar.zookeeper.LocalBookkeeperEnsemble - 'default' namespace for table service : namespace_name: "default"
default_stream_conf {
  key_type: HASH
  min_num_ranges: 24
  initial_num_ranges: 24
  split_policy {
    fixed_range_policy {
      num_ranges: 2
    }
  }
  rolling_policy {
    size_policy {
      max_segment_size: 134217728
    }
  }
  retention_policy {
    time_policy {
      retention_minutes: -1
    }
  }
}
```

3. Functions worker 正确启动。输出如下所示：

```text
14:28:24.101 [main] INFO  org.apache.pulsar.functions.worker.WorkerService - Starting worker c-standalone-fw-localhost-8080...
14:28:24.907 [main] INFO  org.apache.pulsar.functions.worker.WorkerService - Worker Configs: {
  "workerId" : "c-standalone-fw-localhost-8080",
  "workerHostname" : "localhost",
  "workerPort" : 8080,
  "workerPortTls" : 6751,
  "jvmGCMetricsLoggerClassName" : null,
  "numHttpServerThreads" : 8,
  "connectorsDirectory" : "./connectors",
  "functionMetadataTopicName" : "metadata",
  "functionWebServiceUrl" : null,
  "pulsarServiceUrl" : "pulsar://127.0.0.1:6650",
  "pulsarWebServiceUrl" : "http://127.0.0.1:8080",
  "clusterCoordinationTopicName" : "coordinate",
  "pulsarFunctionsNamespace" : "public/functions",
  "pulsarFunctionsCluster" : "standalone",
  "numFunctionPackageReplicas" : 1,
  "downloadDirectory" : "/tmp/pulsar_functions",
  "stateStorageServiceUrl" : "bk://127.0.0.1:4181",
  "functionAssignmentTopicName" : "assignments",
  "schedulerClassName" : "org.apache.pulsar.functions.worker.scheduler.RoundRobinScheduler",
  "failureCheckFreqMs" : 30000,
  "rescheduleTimeoutMs" : 60000,
  "initialBrokerReconnectMaxRetries" : 60,
  "assignmentWriteMaxRetries" : 60,
  "instanceLivenessCheckFreqMs" : 30000,
  "clientAuthenticationPlugin" : null,
  "clientAuthenticationParameters" : null,
  "topicCompactionFrequencySec" : 1800,
  "tlsEnabled" : true,
  "tlsCertificateFilePath" : null,
  "tlsKeyFilePath" : null,
  "tlsTrustCertsFilePath" : null,
  "tlsAllowInsecureConnection" : false,
  "tlsRequireTrustedClientCertOnConnect" : false,
  "useTls" : false,
  "tlsHostnameVerificationEnable" : false,
  "authenticationEnabled" : false,
  "authenticationProviders" : null,
  "authorizationEnabled" : false,
  "superUserRoles" : null,
  "properties" : { },
  "threadContainerFactory" : null,
  "processContainerFactory" : {
    "javaInstanceJarLocation" : null,
    "pythonInstanceLocation" : null,
    "logDirectory" : null,
    "extraFunctionDependenciesDir" : null
  },
  "kubernetesContainerFactory" : null,
  "secretsProviderConfiguratorClassName" : null,
  "secretsProviderConfiguratorConfig" : null,
  "functionInstanceMinResources" : null,
  "workerWebAddress" : "http://localhost:8080",
  "functionMetadataTopic" : "persistent://public/functions/metadata",
  "clusterCoordinationTopic" : "persistent://public/functions/coordinate",
  "functionAssignmentTopic" : "persistent://public/functions/assignments"
}
```

4. 在进入下一步之前进行健全性检查。

```shell
# 检查 pulsar 二进制端口是否正确监听
netstat -an | grep 6650 | grep LISTEN

# 检查 function 集群
curl -s http://localhost:8080/admin/v2/worker/cluster
# 示例输出：
# [{"workerId":"c-standalone-fw-localhost-6750","workerHostname":"localhost","port":6750}]

# 检查 brokers
curl -s http://localhost:8080/admin/v2/namespaces/public
# 示例输出：
# ["public/default","public/functions"]

# 检查连接器
curl -s http://localhost:8080/admin/v2/functions/connectors
# 示例输出：
# [{"name":"aerospike","description":"Aerospike database sink","sinkClass":"org.apache.pulsar.io.aerospike.AerospikeStringSink"},{"name":"cassandra","description":"Writes data into Cassandra","sinkClass":"org.apache.pulsar.io.cassandra.CassandraStringSink"},{"name":"kafka","description":"Kafka source and sink connector","sourceClass":"org.apache.pulsar.io.kafka.KafkaStringSource","sinkClass":"org.apache.pulsar.io.kafka.KafkaStringSink"},{"name":"kinesis","description":"Kinesis sink connector","sinkClass":"org.apache.pulsar.io.kinesis.KinesisSink"},{"name":"rabbitmq","description":"RabbitMQ source connector","sourceClass":"org.apache.pulsar.io.rabbitmq.RabbitMQSource"},{"name":"twitter","description":"Ingest data from Twitter firehose","sourceClass":"org.apache.pulsar.io.twitter.TwitterFireHose"}]

# 检查表服务（在 2.11.x 或更高版本上跳过此步骤）
nc -vz4 localhost 4181
```

#### Functions

打开另一个终端提交一个 Java Exclamation function。

1. 创建租户和命名空间：

```shell
bin/pulsar-admin tenants create test
bin/pulsar-admin namespaces create test/test-namespace
```

2. 创建 function。

```shell
bin/pulsar-admin functions create --function-config-file examples/example-function-config.yaml --jar examples/api-examples.jar
```

返回以下信息：`Created Successfully`。

3. 在与步骤 2 相同的终端中，检索 function 配置。

```shell
bin/pulsar-admin functions get --tenant test --namespace test-namespace --name example
```

输出如下所示：

```json
{
  "tenant": "test",
  "namespace": "test-namespace",
  "name": "example",
  "className": "org.apache.pulsar.functions.api.examples.ExclamationFunction",
  "userConfig": "{\"PublishTopic\":\"test_result\"}",
  "autoAck": true,
  "parallelism": 1,
  "source": {
    "topicsToSerDeClassName": {
      "test_src": ""
    },
    "typeClassName": "java.lang.String"
  },
  "sink": {
    "topic": "test_result",
    "typeClassName": "java.lang.String"
  },
  "resources": {}
}
```

4. 在与步骤 3 相同的终端中，检索 function 状态。

```shell
bin/pulsar-admin functions status --tenant test --namespace test-namespace --name example
```

输出如下所示：

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
      "numReceived" : 0,
      "numSuccessfullyProcessed" : 0,
      "numUserExceptions" : 0,
      "latestUserExceptions" : [ ],
      "numSystemExceptions" : 0,
      "latestSystemExceptions" : [ ],
      "averageLatency" : 0.0,
      "lastInvocationTime" : 0,
      "workerId" : "c-standalone-fw-localhost-8080"
    }
  } ]
}
```

5. 在与步骤 4 相同的终端中，订阅输出主题 `test_result`。

```shell
bin/pulsar-client consume -s test-sub -n 0 test_result
```

6. 打开一个新终端向输入主题 `test_src` 生成消息。

```shell
bin/pulsar-client produce -m "test-messages-`date`" -n 10 test_src
```

7. 在步骤 5 的终端中，返回由 Exclamation function 生成的消息。输出如下所示：

```text
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
----- got message -----
test-messages-Thu Jul 19 11:59:15 PDT 2018!
```

### 验证连接器

:::note

确保你的笔记本电脑上有可用的 docker。如果你还没有安装 docker，可以跳过本节。

:::

1. 设置一个 cassandra 集群。

```shell
docker run -d --rm  --name=cassandra -p 9042:9042 cassandra:3.11
```

确保 cassandra 集群正在运行。

```shell
# 运行 docker ps 找到 cassandra 的 docker 进程
docker ps
```

```shell
# 检查 cassandra 是否按预期运行
docker logs cassandra
```

```shell
# 检查集群状态
docker exec cassandra nodetool status

# Datacenter: datacenter1
# =======================
# Status=Up/Down
# |/ State=Normal/Leaving/Joining/Moving
# --  Address     Load       Tokens       Owns (effective)  Host ID                               Rack
# UN  172.17.0.2  103.67 KiB  256          100.0%            af0e4b2f-84e0-4f0b-bb14-bd5f9070ff26  rack1
```

2. 创建键空间和表。

运行 `cqlsh`：

```shell
docker exec -ti cassandra cqlsh localhost
```

在 cqlsh 中，创建 `pulsar_test_keyspace` 键空间和 `pulsar_test_table` 表。

```text
cqlsh> CREATE KEYSPACE pulsar_test_keyspace WITH replication = {'class':'SimpleStrategy', 'replication_factor':1};
cqlsh> USE pulsar_test_keyspace;
cqlsh:pulsar_test_keyspace> CREATE TABLE pulsar_test_table (key text PRIMARY KEY, col text);
cqlsh:pulsar_test_keyspace> exit
```

3. 准备一个 cassandra sink yaml 文件，并将其放在 examples 目录下作为 `cassandra-sink.yml`。

```shell
vim examples/cassandra-sink.yml
```

内容应该是：

```yaml
configs:
    roots: "localhost:9042"
    keyspace: "pulsar_test_keyspace"
    columnFamily: "pulsar_test_table"
    keyname: "key"
    columnName: "col"
```

4. 提交一个 cassandra sink。

```shell
bin/pulsar-admin sink create --tenant public --namespace default --name cassandra-test-sink --sink-type cassandra --sink-config-file examples/cassandra-sink.yml --inputs test_cassandra
# "Created successfully"
```

获取 sink 信息：

```shell
bin/pulsar-admin sink get --tenant public --namespace default --name cassandra-test-sink
```

输出如下所示：

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

获取运行状态：

```shell
bin/pulsar-admin sink status --tenant public --namespace default --name cassandra-test-sink
```

输出如下所示：

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

5. 向源主题生成消息。

```shell
for i in {0..10}; do bin/pulsar-client produce -m "key-$i" -n 1 test_cassandra; done
```

6. 检查 sink 状态，处理了 11 条消息。

```shell
bin/pulsar-admin sink status --tenant public --namespace default --name cassandra-test-sink
```

输出如下所示：

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
      "numReadFromPulsar" : 11,
      "numSystemExceptions" : 0,
      "latestSystemExceptions" : [ ],
      "numSinkExceptions" : 0,
      "latestSinkExceptions" : [ ],
      "numWrittenToSink" : 11,
      "lastReceivedTime" : 1554833501277,
      "workerId" : "c-standalone-fw-localhost-8080"
    }
  } ]
}
```

7. 在 cassandra 中检查结果。

```shell
docker exec -ti cassandra cqlsh localhost
```

在 cqlsh 会话中：

```text
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
 key-10 | key-10

(11 rows)
cqlsh:pulsar_test_keyspace> exit
```

8. 删除 sink。

```shell
bin/pulsar-admin sink delete --tenant public --namespace default --name cassandra-test-sink
# "Deleted successfully"
```

9. 停止 Cassandra 容器

```shell
docker stop cassandra
```

### 验证有状态函数

自 Pulsar 2.1 发布以来，Pulsar 为有状态 Pulsar 函数启用 bookkeeper 表服务（作为开发者预览）。

以下是验证计数器函数的说明。

1. 创建一个 wordcount function。

```shell
bin/pulsar-admin functions create --function-config-file examples/example-function-config.yaml --jar examples/api-examples.jar --name word_count --className org.apache.pulsar.functions.api.examples.WordCountFunction --inputs test_wordcount_src --output test_wordcount_dest
# "Created successfully"
```

2. 获取 function 信息和状态。

```shell
bin/pulsar-admin functions get --tenant test --namespace test-namespace --name word_count
```

输出如下所示：

```json
{
  "tenant": "test",
  "namespace": "test-namespace",
  "name": "word_count",
  "className": "org.apache.pulsar.functions.api.examples.WordCountFunction",
  "inputSpecs": {
    "test_wordcount_src": {
      "isRegexPattern": false
    }
  },
  "output": "test_wordcount_dest",
  "processingGuarantees": "ATLEAST_ONCE",
  "retainOrdering": false,
  "userConfig": {
    "PublishTopic": "test_result"
  },
  "runtime": "JAVA",
  "autoAck": true,
  "parallelism": 1,
  "resources": {
    "cpu": 1.0,
    "ram": 1073741824,
    "disk": 10737418240
  },
  "cleanupSubscription": true
}
```

```shell
bin/pulsar-admin functions status --tenant test --namespace test-namespace --name word_count
```

输出如下所示：

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
      "numReceived" : 0,
      "numSuccessfullyProcessed" : 0,
      "numUserExceptions" : 0,
      "latestUserExceptions" : [ ],
      "numSystemExceptions" : 0,
      "latestSystemExceptions" : [ ],
      "averageLatency" : 0.0,
      "lastInvocationTime" : 0,
      "workerId" : "c-standalone-fw-localhost-8080"
    }
  } ]
}
```

3. 查询函数的状态表：监听一个名为"hello"的键

```shell
bin/pulsar-admin functions querystate --tenant test --namespace test-namespace --name word_count -k hello -w
# key 'hello' doesn't exist.
# key 'hello' doesn't exist.
# key 'hello' doesn't exist
```

4. 向源主题 `test_wordcount_src` 生成消息。

向 `test_wordcount_src` 主题生成 10 条"hello"消息。"hello"的值更新为 10。

```shell
bin/pulsar-client produce -m "hello" -n 10 test_wordcount_src
```

在步骤 3 的终端中查看结果。

```json
{
  "key": "hello",
  "numberValue": 10,
  "version": 9
}
```

再生成 10 条"hello"消息。结果更新为 20。

```bash
bin/pulsar-client produce -m "hello" -n 10 test_wordcount_src
```

步骤 3 终端中的结果更新为 `20`。

```text
  "key": "hello",
  "numberValue": 20,
  "version": 19
```