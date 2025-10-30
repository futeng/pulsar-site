---
id: io-cdc
title: CDC connector
sidebar_label: "CDC connector"
description: Get a comprehensive understanding of Pulsar CDC connectors.
---

CDC source connectors capture log changes of databases (such as MySQL, MongoDB, and PostgreSQL) into Pulsar.

> CDC source connectors are built on top of [Canal](https://github.com/alibaba/canal) and [Debezium](https://debezium.io/) and store all data into Pulsar cluster in a persistent, replicated, and partitioned way.

目前，Pulsar 提供以下 CDC 连接器。

名称|Java 类
|---|---
[Canal source connector](io-canal-source.md)|[org.apache.pulsar.io.canal.CanalStringSource.java](https://github.com/apache/pulsar/blob/master/pulsar-io/canal/src/main/java/org/apache/pulsar/io/canal/CanalStringSource.java)
[Debezium source connector](io-cdc-debezium.md)|<li>[org.apache.pulsar.io.debezium.DebeziumSource.java](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/core/src/main/java/org/apache/pulsar/io/debezium/DebeziumSource.java)<br /></li><li>[org.apache.pulsar.io.debezium.mysql.DebeziumMysqlSource.java](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/mysql/src/main/java/org/apache/pulsar/io/debezium/mysql/DebeziumMysqlSource.java)<br /></li><li>[org.apache.pulsar.io.debezium.postgres.DebeziumPostgresSource.java](https://github.com/apache/pulsar/blob/master/pulsar-io/debezium/postgres/src/main/java/org/apache/pulsar/io/debezium/postgres/DebeziumPostgresSource.java)</li>

有关 Canal 和 Debezium 的更多信息，请参阅以下资料。

主题 | 参考
|---|---
如何使用 Canal source connector 与 MySQL|[Canal 指南](https://github.com/alibaba/canal/wiki)
Canal 的工作原理 | [Canal 教程](https://github.com/alibaba/canal/wiki)
如何使用 Debezium source connector 与 MySQL | [Debezium 指南](https://debezium.io/docs/connectors/mysql/)
Debezium 的工作原理 | [Debezium 教程](https://debezium.io/docs/tutorial/)