---
id: io-overview
title: Pulsar connector overview
sidebar_label: "Overview"
description: Get a comprehensive understanding of Pulsar IO connectors.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


当您可以轻松地将消息系统与外部系统（如数据库和其他消息系统）一起使用时，它们是最强大的。

**Pulsar IO 连接器**使您可以轻松创建、部署和管理与外部系统交互的连接器，例如 [Apache Cassandra](https://cassandra.apache.org)、[Aerospike](https://www.aerospike.com) 等等。


## 概念

Pulsar IO 连接器有两种类型：

- [Source](#source)
- [Sink](#sink)

此图说明了 source、Pulsar 和 sink 之间的关系：

![Pulsar IO diagram](/assets/pulsar-io.png "Pulsar IO connectors (sources and sinks)")


### Source

Source 连接器**将数据从外部系统输入到 Pulsar**。

常见的 source 包括其他消息系统和消防水管式数据管道 API。

有关 Pulsar 内置 source 连接器的完整列表，请参阅 [source connector](io-connectors.md#source-connector)。

### Sink

Sink 连接器**将数据从 Pulsar 输出到外部系统**。

常见的 sink 包括其他消息系统以及 SQL 和 NoSQL 数据库。

有关 Pulsar 内置 sink 连接器的完整列表，请参阅 [sink connector](io-connectors.md#sink-connector)。

## 处理保证

处理保证用于处理向 Pulsar Topic 写入消息时的错误。

> Pulsar 连接器和 Functions 使用**相同**的处理保证，如下所示。

交付语义 | 描述
:------------------|:-------
`at-most-once` | 发送到连接器的每条消息将被**处理一次**或**不被处理**。
`at-least-once`  | 发送到连接器的每条消息将被**处理一次**或**多次处理**。
`effectively-once` | 发送到连接器的每条消息都有**一个与其关联的输出**。

连接器的处理保证不仅依赖于 Pulsar 的保证，还**与外部系统相关**，即**source 和 sink 的实现**。

* Source

  Pulsar 确保向 Pulsar Topic 写入消息遵循处理保证。这在 Pulsar 的控制范围内。

* Sink

  处理保证依赖于 sink 的实现。如果 sink 的实现不能以幂等方式处理重试，则 sink 不遵循处理保证。

### 设置处理保证

创建连接器时，您可以使用以下语义设置处理保证：

* ATLEAST_ONCE

* ATMOST_ONCE

* EFFECTIVELY_ONCE

> 如果创建连接器时未指定 `--processing-guarantees`，则默认语义为 `ATLEAST_ONCE`。

以 **Admin CLI** 为例。有关 **REST API** 或 **JAVA Admin API** 的更多信息，请参阅[此处](io-use.md#create)。

````mdx-code-block
<Tabs groupId="io-choice"
  defaultValue="Source"
  values={[{"label":"Source","value":"Source"},{"label":"Sink","value":"Sink"}]}>

<TabItem value="Source">

```bash
bin/pulsar-admin sources create \
    --processing-guarantees ATMOST_ONCE \
    # Other source configs
```

有关 `pulsar-admin sources create` 的选项的更多信息，请参阅[此处](reference-connector-admin.md)。

</TabItem>
<TabItem value="Sink">

```bash
bin/pulsar-admin sinks create \
    --processing-guarantees EFFECTIVELY_ONCE \
    # Other sink configs
```

有关 `pulsar-admin sinks create` 的选项的更多信息，请参阅[此处](reference-connector-admin.md)。

</TabItem>

</Tabs>
````

### 更新处理保证

创建连接器后，您可以使用以下语义更新处理保证：

* ATLEAST_ONCE

* ATMOST_ONCE

* EFFECTIVELY_ONCE

以 **Admin CLI** 为例。有关 **REST API** 或 **JAVA Admin API** 的更多信息，请参阅[此处](io-use.md#create)。

````mdx-code-block
<Tabs groupId="io-choice"
  defaultValue="Source"
  values={[{"label":"Source","value":"Source"},{"label":"Sink","value":"Sink"}]}>

<TabItem value="Source">

```bash
bin/pulsar-admin sources update \
    --processing-guarantees EFFECTIVELY_ONCE \
    # Other source configs
```

有关 `pulsar-admin sources update` 的选项的更多信息，请参阅[此处](reference-connector-admin.md)。

</TabItem>
<TabItem value="Sink">

```bash
bin/pulsar-admin sinks update \
    --processing-guarantees ATMOST_ONCE \
    # Other sink configs
```

有关 `pulsar-admin sinks update` 的选项的更多信息，请参阅[此处](reference-connector-admin.md)。

</TabItem>

</Tabs>
````


## 使用连接器

要管理 Pulsar 连接器（例如，创建、更新、启动、停止、重启、重新加载、删除以及对连接器执行其他操作），您可以使用带有 source 和 sink 子命令的 `Connector Admin CLI`。有关最新和完整的信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

连接器（source 和 sink）和 Functions 是实例的组件，它们都在 Functions worker 上运行。当通过 `Connector Admin CLI` 或 `Functions Admin CLI` 管理 source、sink 或 function 时，会在 worker 上启动一个实例。有关更多信息，请参阅 [Functions worker](functions-worker.md)。