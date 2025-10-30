---
id: develop-tools
title: 模拟工具
sidebar_label: "模拟工具"
---

有时需要创建一个测试环境并产生人工负载来观察负载管理器处理负载的效果。
负载模拟控制器、负载模拟客户端和 Broker 监控器是为了更容易地创建这种负载并观察对管理器的影响而创建的。

## 模拟客户端
模拟客户端是一台创建和订阅具有可配置消息速率和大小的 Topic 的机器。
因为有时需要模拟大负载以使用多个客户端机器，用户不直接与模拟客户端交互，而是将他们的请求委托给模拟控制器，然后模拟控制器将向客户端发送信号以开始产生负载。
客户端实现在类 `org.apache.pulsar.testclient.LoadSimulationClient` 中。

### 用法
要启动模拟客户端，使用 `pulsar-perf` 脚本和命令 `simulation-client`，如下所示：

```shell
pulsar-perf simulation-client --port <监听端口> --service-url <pulsar 服务 URL>
```

客户端将准备好接收控制器命令。

## 模拟控制器
模拟控制器向模拟客户端发送信号，请求它们创建新的 Topic、停止旧的 Topic、改变 Topic 产生的负载以及其他几个任务。
它在类 `org.apache.pulsar.testclient.LoadSimulationController` 中实现，并向用户呈现一个 shell 作为发送命令的接口。

### 用法
要启动模拟控制器，使用 `pulsar-perf` 脚本和命令 `simulation-controller`，如下所示：

```shell
pulsar-perf simulation-controller --cluster <要模拟的集群> --client-port <客户端的监听端口>
--clients <逗号分隔的客户端主机名列表>
```

在启动控制器之前应该已经启动了客户端。然后您将看到一个简单的提示符，在那里您可以向模拟客户端发出命令。
参数通常指的是租户名称、命名空间名称和 Topic 名称。
在所有情况下，都使用租户、命名空间和 Topic 的基本名称。
例如，对于 Topic `persistent://my_tenant/my_cluster/my_namespace/my_topic`，租户名称是 `my_tenant`，命名空间名称是 `my_namespace`，Topic 名称是 `my_topic`。
控制器可以执行以下操作：

* 创建一个带有生产者和消费者的 Topic
  * `trade <租户> <命名空间> <Topic> [--rate <每秒消息速率>]
  [--rand-rate <下界>,<上界>]
  [--size <消息大小（字节）>]`
* 创建一组带有生产者和消费者的 Topic
  * `trade_group <租户> <组> <命名空间数量> [--rate <每秒消息速率>]
  [--rand-rate <下界>,<上界>]
  [--separation <创建 Topic 之间的间隔（毫秒）>] [--size <消息大小（字节）>]
  [--topics-per-namespace <每个命名空间要创建的 Topic 数量>]`
* 更改现有 Topic 的配置
  * `change <租户> <命名空间> <Topic> [--rate <每秒消息速率>]
  [--rand-rate <下界>,<上界>]
  [--size <消息大小（字节）>]`
* 更改一组 Topic 的配置
  * `change_group <租户> <组> [--rate <每秒消息速率>] [--rand-rate <下界>,<上界>]
  [--size <消息大小（字节）>] [--topics-per-namespace <每个命名空间要创建的 Topic 数量>]`
* 关闭之前创建的 Topic
  * `stop <租户> <命名空间> <Topic>`
* 关闭之前创建的一组 Topic
  * `stop_group <租户> <组>`
* 将历史数据从一个 ZooKeeper 复制到另一个，并根据该历史中的消息速率和大小进行模拟
  * `copy <租户> <源 ZooKeeper> <目标 ZooKeeper> [--rate-multiplier 值]`
* 在当前 ZooKeeper 上模拟历史数据的负载（应该是正在模拟的同一 ZooKeeper）
  * `simulate <租户> <ZooKeeper> [--rate-multiplier 值]`
* 从给定的活动 ZooKeeper 流式传输最新数据，以模拟该 ZooKeeper 的实时负载。
  * `stream <租户> <ZooKeeper> [--rate-multiplier 值]`

这些命令中的"组"参数允许用户一次性创建或影响多个 Topic。
组在调用 `trade_group` 命令时创建，这些组中的所有 Topic 可以随后分别使用 `change_group` 和 `stop_group` 命令进行修改或停止。
所有 ZooKeeper 参数的形式都是 `zookeeper_host:port`。

### 复制、模拟和流式传输之间的区别
命令 `copy`、`simulate` 和 `stream` 非常相似但有显著的区别。
当您想在正在模拟的 ZooKeeper 上模拟静态、外部 ZooKeeper 的负载时，使用 `copy`。
因此，`source zookeeper` 应该是您要复制的 ZooKeeper，`target zookeeper` 应该是您正在模拟的 ZooKeeper，然后它将在两种负载管理器实现中获得源历史数据的全部好处。
另一方面，`simulate` 只接受一个 ZooKeeper，即您正在模拟的 ZooKeeper。
它假设您正在模拟一个具有 `SimpleLoadManagerImpl` 历史数据的 ZooKeeper，并为 `ModularLoadManagerImpl` 创建等效的历史数据。
然后，客户端根据历史数据模拟负载。
最后，`stream` 接受一个与正在模拟的 ZooKeeper 不同的活动 ZooKeeper，并从它流式传输负载数据并模拟实时负载。
在所有情况下，可选的 `rate-multiplier` 参数允许用户模拟负载的某些比例。
例如，使用 `--rate-multiplier 0.05` 将导致消息仅以正在模拟负载的 `5%` 的速率发送。

## Broker 监控器
要观察负载管理器在这些模拟中的行为，可以使用在 `org.apache.pulsar.testclient.BrokerMonitor` 中实现的 Broker 监控器。
Broker 监控器将使用监视器持续将表格化的负载数据打印到控制台。

### 用法
要启动 Broker 监控器，使用 `pulsar-perf` 脚本中的 `monitor-brokers` 命令：

```shell
pulsar-perf monitor-brokers --connect-string <zookeeper 主机:端口>
```

然后控制台将持续打印负载数据，直到被中断。