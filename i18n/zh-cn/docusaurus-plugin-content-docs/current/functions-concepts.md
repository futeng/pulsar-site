---
id: functions-concepts
title: Pulsar Functions 概念
sidebar_label: "概念"
description: 全面理解 Pulsar Functions 的概念。
---


## 完全限定函数名称

每个函数都有一个完全限定函数名称（FQFN），包含指定的租户、命名空间和函数名。使用 FQFN，您可以在不同的命名空间中创建多个同名函数。

FQFN 的格式如下：

```text
tenant/namespace/name
```

## 函数实例

函数实例是函数执行框架的核心元素，由以下元素组成：
* 从不同输入 Topic 消费消息的消费者集合。
* 调用函数的执行器。
* 将函数结果发送到输出 Topic 的生产者。

下图展示了函数实例的内部工作流程。

![Pulsar 中函数实例的工作流程](/assets/function-instance.svg)

一个函数可以有多个实例，每个实例执行函数的一个副本。您可以在配置文件中指定实例数量。

函数实例内部的消费者使用 FQFN 作为订阅者名称，以便根据订阅类型在多个实例之间实现负载均衡。订阅类型可以在函数级别指定。

每个函数都有一个独立的、以 FQFN 标识的状态存储。您可以指定状态接口，将中间结果持久化到 BookKeeper 中。其他用户可以查询函数的状态并提取这些结果。


## 函数工作器

函数工作器是一个逻辑组件，用于监控、编排和执行 Pulsar Functions 的[集群模式](functions-deploy.md#depoy-a-function-in-cluster-mode)部署中的单个函数。

在函数工作器内部，每个[函数实例](#function-instance)可以作为线程或进程执行，具体取决于所选的配置。或者，如果有 Kubernetes 集群可用，函数可以在 Kubernetes 中作为 StatefulSet 启动。有关更多详细信息，请参阅[设置函数工作器](functions-worker.md)。

下图展示了函数工作器的内部架构和工作流程。

![Pulsar 中函数工作器的工作流程](/assets/function-worker-workflow.svg)

函数工作器形成了工作节点集群，工作流程描述如下：
1. 用户向 REST 服务器发送请求以执行函数实例。
2. REST 服务器响应该请求，并将请求传递给函数元数据管理器。
3. 函数元数据管理器将请求更新写入函数元数据 Topic。它还跟踪所有与元数据相关的消息，并使用函数元数据 Topic 来持久化函数的状态更新。
4. 函数元数据管理器从函数元数据 Topic 读取更新，并触发调度管理器计算分配。
5. 调度管理器将分配更新写入分配 Topic。
6. 函数运行时管理器监听分配 Topic，读取分配更新，并更新其内部状态，该状态包含所有工作器所有分配的全局视图。如果更新改变了某个工作器上的分配，函数运行时管理器通过启动或停止函数实例的执行来实现新的分配。
7. 成员管理器请求协调 Topic 来选举主导工作器。所有工作器都以故障转移订阅方式订阅协调 Topic，但活跃的工作器成为领导者并执行分配，保证该 Topic 只有一个活跃的消费者。
8. 成员管理器从协调 Topic 读取更新。


## 函数运行时

[函数实例](#function-instance)在运行时内部被调用，多个实例可以并行运行。Pulsar 支持三种不同成本和隔离保证的函数运行时类型，以最大化部署灵活性。您可以根据需要使用其中之一来运行函数。有关更多详细信息，请参阅[配置函数运行时](functions-runtime.md)。

下表概述了三种函数运行时类型。

| 类型   | 描述     |
|--------|-----------------|
| 线程运行时     | 每个实例作为线程运行。<br /><br />由于线程模式的代码是用 Java 编写的，因此**仅**适用于 Java 实例。当函数在线程模式下运行时，它与函数工作器在同一个 Java 虚拟机（JVM）上运行。 |
| 进程运行时    | 每个实例作为进程运行。<br /><br />当函数在进程模式下运行时，它在运行函数工作器的同一台机器上运行。|
| Kubernetes 运行时 | 函数由工作器作为 Kubernetes StatefulSet 提交，每个函数实例作为 Pod 运行。Pulsar 支持在启动函数时为 Kubernetes StatefulSets 和服务添加标签，这有助于选择目标 Kubernetes 对象。 |


## 处理保证和订阅类型

Pulsar 提供三种不同的消息传递语义，您可以将其应用于函数。不同的传递语义实现根据**确认时间节点**来确定。

| 传递语义 | 描述 | 采用的订阅类型 |
|--------------------|-------------|---------------------------|
| **最多一次**传递 | 发送到函数的每条消息都尽力处理。不保证消息是否会被处理。<br /><br />当您选择此语义时，`autoAck` 配置必须设置为 `true`，否则启动将失败（`autoAck` 配置在未来的版本中将被弃用）。<br /><br />**确认时间节点**：函数处理前。 | 共享模式 |
| **至少一次**传递（默认）| 发送到函数的每条消息可以被处理多次（在处理失败或重新传递的情况下）。<br /><br />如果您创建函数时没有指定 `--processing-guarantees` 标志，函数提供`至少一次`传递保证。<br /><br />**确认时间节点**：向输出发送消息后。 | 共享模式 |
| **有效一次**传递 | 发送到函数的每条消息可以被处理多次，但它只有一个输出。重复的消息被忽略。<br /><br />`有效一次`是建立在`至少一次`处理之上的，并由服务器端去重保证。这意味着状态更新可能发生两次，但相同的状态更新只应用一次，其他重复的状态更新在服务器端被丢弃。<br /><br />**确认时间节点**：向输出发送消息后。 | 故障转移模式 |
| **手动**传递 | 当您选择此语义时，框架不执行任何确认操作，您需要在函数内部调用 `context.getCurrentRecord().ack()` 方法来手动执行确认操作。<br /><br />**确认时间节点**：用户在函数方法内定义。 | 共享模式 |


:::tip

* 默认情况下，Pulsar Functions 提供`至少一次`传递保证。如果您创建函数时没有为 `--processingGuarantees` 标志提供值，函数提供`至少一次`保证。
* `独占模式`订阅类型在 Pulsar Functions 中**不可用**，因为：
  * 如果只有一个实例，`独占模式`等于`故障转移模式`。
  * 如果有多个实例，`独占模式`在函数重启时可能崩溃并重启。在这种情况下，`独占模式`不等于`故障转移模式`。因为当主消费者断开连接时，所有未确认的和后续的消息都传递给队列中的下一个消费者。
* 要将订阅类型从`共享模式`更改为`键共享模式`，您可以在[`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)中使用 `—retain-key-ordering` 选项。

:::

您可以在创建函数时为函数设置处理保证。以下命令创建了一个应用了有效一次保证的函数。

```bash
bin/pulsar-admin functions create \
  --name my-effectively-once-function \
  --processing-guarantees EFFECTIVELY_ONCE \
  # 其他函数配置
```

您可以使用 `update` 命令更改应用于函数的处理保证。

```bash
bin/pulsar-admin functions update \
  --processing-guarantees ATMOST_ONCE \
  # 其他函数配置
```

## 上下文

Java、Python 和 Go SDK 提供了对函数可以使用的**上下文对象**的访问。这个上下文对象为函数提供了各种各样的信息和功能，包括：
* 函数的名称和 ID。
* 消息的消息 ID。每条消息都自动分配一个 ID。
* 消息的键、事件时间、属性和分区键。
* 发送消息的 Topic 名称。
* 与函数关联的所有输入 Topic 以及输出 Topic 的名称。
* 用于 [SerDe](functions-develop-serde.md) 的类名称。
* 与函数关联的租户和命名空间。
* 运行函数的函数实例 ID。
* 函数的版本。
* 函数使用的[记录器对象](functions-develop-log.md)，用于创建日志消息。
* 访问通过 CLI 提供的任意[用户配置](functions-develop-user-defined-configs.md)值。
* 用于记录[指标](functions-develop-metrics.md)的接口。
* 用于在[状态存储](functions-develop-state.md)中存储和检索状态的接口。
* 将新消息发布到任意 Topic 的函数。
* 确认正在处理的消息的函数（如果禁用了自动确认）。
* (Java) 获取 Pulsar 管理客户端的函数。
* (Java) 创建记录以返回从上下文和输入记录中获取的默认值的函数。

:::tip

有关代码示例的更多信息，请参阅 [Java](https://github.com/apache/pulsar/blob/master/pulsar-functions/api-java/src/main/java/org/apache/pulsar/functions/api/BaseContext.java)、[Python](https://github.com/apache/pulsar/blob/master/pulsar-functions/instance/src/main/python/contextimpl.py) 和 [Go](https://github.com/apache/pulsar/blob/master/pulsar-function-go/pf/context.go)。

:::

## 函数消息类型

Pulsar Functions 将字节数组作为输入，并输出字节数组。您可以通过以下任一方式编写类型化函数并将消息绑定到类型：
* [Schema 注册中心](functions-develop-schema-registry.md)
* [SerDe](functions-develop-serde.md)


## 窗口函数

:::note

目前，窗口函数仅在 Java 中可用，并且不支持 `MANUAL` 和 `有效一次`传递语义。

:::

窗口函数是在数据窗口上执行计算的函数，即事件流的有限子集。如下图所示，流被分成"桶"，其中可以应用函数。

![事件流中的数据窗口](/assets/function-data-window.svg)

函数的数据窗口定义涉及两个策略：
* 驱逐策略：控制窗口中收集的数据量。
* 触发策略：控制函数何时被触发并执行，以根据驱逐策略处理窗口中收集的所有数据。

触发策略和驱逐策略都可以基于时间或计数驱动。

:::tip

支持处理时间和事件时间。
 * 处理时间是基于函数实例构建和处理窗口时的墙钟时间定义的。窗口完整性的判断是直接的，您不必担心数据到达的顺序问题。
 * 事件时间是基于事件记录附带的时间戳定义的。它保证事件时间的正确性，但也提供更多的数据缓冲和有限的完整性保证。

:::

### 窗口类型

根据两个相邻窗口是否可以共享共同事件，窗口可以分为以下两种类型：
* [滚动窗口](#tumbling-window)
* [滑动窗口](#sliding-window)

#### 滚动窗口

滚动窗口将元素分配到指定时间长度或计数的窗口中。滚动窗口的驱逐策略总是基于窗口已满。因此，您只需要指定触发策略，无论是基于计数还是基于时间。

在基于计数触发策略的滚动窗口中，如以下示例所示，触发策略设置为 2。当窗口中有两个项目时，每个函数都会被触发并执行，无论时间如何。

![具有基于计数触发策略的滚动窗口](/assets/function-count-based-tumbling-window.svg)

相反，如以下示例所示，滚动窗口的窗口长度为 10 秒，这意味着函数在 10 秒时间间隔过去时被触发，无论窗口中有多少事件。

![具有基于时间触发策略的滚动窗口](/assets/function-time-based-tumbling-window.svg)

#### 滑动窗口

滑动窗口方法通过设置驱逐策略来限制保留用于处理的数据量，并设置带有滑动间隔的触发策略来定义固定窗口长度。如果滑动间隔小于窗口长度，则存在数据重叠，这意味着同时落入相邻窗口的数据被多次用于计算。

如以下示例所示，窗口长度为 2 秒，这意味着任何超过 2 秒的数据都将被驱逐，不用于计算。滑动间隔配置为 1 秒，这意味着函数每秒执行一次，以处理整个窗口长度内的数据。

![有重叠的滑动窗口](/assets/function-sliding-window.svg)