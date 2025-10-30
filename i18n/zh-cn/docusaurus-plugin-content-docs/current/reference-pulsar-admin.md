---
id: reference-pulsar-admin
title: Pulsar admin CLI
sidebar_label: "Pulsar Admin CLI"
---

:::tip

此页面已弃用且不再更新。有关 `Pulsar admin` 的最新和完整信息，包括命令、标志、描述等，请参见 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

`pulsar-admin` 工具使您能够管理 Pulsar 安装，包括集群、Broker、命名空间、租户等。

用法

```bash
pulsar-admin command
```

命令
* `broker-stats`
* `brokers`
* `clusters`
* `functions`
* `functions-worker`
* `namespaces`
* `ns-isolation-policy`
* `sources`
   有关更多信息，请参见[此处](io-cli.md#sources)
* `sinks`
   有关更多信息，请参见[此处](io-cli.md#sinks)
* `topics`
* `tenants`
* `resource-quotas`
* `schemas`

## `broker-stats`

收集 Broker 统计信息的操作

```bash
pulsar-admin broker-stats subcommand
```

子命令
* `allocator-stats`
* `topics(destinations)`
* `mbeans`
* `monitoring-metrics`
* `load-report`


### `allocator-stats`

转储分配器统计信息

用法

```bash
pulsar-admin broker-stats allocator-stats allocator-name
```

### `topics(destinations)`

转储 Topic 统计信息

用法

```bash
pulsar-admin broker-stats topics options
```

选项

|标志|描述|默认值|
|---|---|---|
|`-i`, `--indent`|缩进 JSON 输出|false|

### `mbeans`

转储 Mbean 统计信息

用法

```bash
pulsar-admin broker-stats mbeans options
```

选项

|标志|描述|默认值|
|---|---|---|
|`-i`, `--indent`|缩进 JSON 输出|false|


### `monitoring-metrics`

转储用于监控的指标

用法

```bash
pulsar-admin broker-stats monitoring-metrics options
```

选项

|标志|描述|默认值|
|---|---|---|
|`-i`, `--indent`|缩进 JSON 输出|false|


### `load-report`

转储 Broker 负载报告

用法

```bash
pulsar-admin broker-stats load-report
```

## `brokers`

关于 Broker 的操作

```bash
pulsar-admin brokers subcommand
```

子命令
* `list`
* `namespaces`
* `update-dynamic-config`
* `list-dynamic-config`
* `get-all-dynamic-config`
* `get-internal-config`
* `get-runtime-config`
* `healthcheck`

### `list`
列出集群的活跃 Broker

用法

```bash
pulsar-admin brokers list cluster-name
```

### `leader-broker`
获取领导 Broker 的信息

用法

```bash
pulsar-admin brokers leader-broker
```

### `namespaces`
列出 Broker 拥有的命名空间

用法

```bash
pulsar-admin brokers namespaces cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--url`|Broker 的 URL||


### `update-dynamic-config`
更新 Broker 的动态服务配置

用法

```bash
pulsar-admin brokers update-dynamic-config options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--config`|服务配置参数名称||
|`--value`|使用 `--config` 标志指定的配置参数值||


### `list-dynamic-config`
获取可更新配置名称的列表

用法

```bash
pulsar-admin brokers list-dynamic-config
```

### `delete-dynamic-config`
删除 Broker 的动态服务配置

用法

```bash
pulsar-admin brokers delete-dynamic-config options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--config`|服务配置参数名称||


### `get-all-dynamic-config`
获取所有覆盖的动态配置值

用法

```bash
pulsar-admin brokers get-all-dynamic-config
```

### `get-internal-config`
获取内部配置信息

用法

```bash
pulsar-admin brokers get-internal-config
```

### `get-runtime-config`
获取运行时配置值

用法

```bash
pulsar-admin brokers get-runtime-config
```

### `healthcheck`
对 Broker 运行健康检查

用法

```bash
pulsar-admin brokers healthcheck
```

## `clusters`
关于集群的操作

用法

```bash
pulsar-admin clusters subcommand
```

子命令
* `get`
* `create`
* `update`
* `delete`
* `list`
* `update-peer-clusters`
* `get-peer-clusters`
* `get-failure-domain`
* `create-failure-domain`
* `update-failure-domain`
* `delete-failure-domain`
* `list-failure-domains`


### `get`
获取指定集群的配置数据

用法

```bash
pulsar-admin clusters get cluster-name
```

### `create`
配置新集群。此操作需要 Pulsar 超级用户权限。

用法

```bash
pulsar-admin clusters create cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--broker-url`|Broker 服务的 URL。||
|`--broker-url-secure`|安全连接的 Broker 服务 URL||
|`--url`|service-url||
|`--url-secure`|安全连接的 service-url||


### `update`
更新集群的配置

用法

```bash
pulsar-admin clusters update cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--broker-url`|Broker 服务的 URL。||
|`--broker-url-secure`|安全连接的 Broker 服务 URL||
|`--url`|service-url||
|`--url-secure`|安全连接的 service-url||

### `update cluster migration`
更新集群的配置

用法

```bash
pulsar-admin clusters update-cluster-migration cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--migrated`|集群是否已迁移。||
|`--broker-url`|Broker 服务的新集群 URL。||
|`--broker-url-secure`|安全连接的新集群服务 URL||
|`--url`|service-url||
|`--url-secure`|安全连接的 service-url||

### `delete`
删除现有集群

用法

```bash
pulsar-admin clusters delete cluster-name
```

### `list`
列出现有集群

用法

```bash
pulsar-admin clusters list
```

### `update-peer-clusters`
更新对等集群名称

用法

```bash
pulsar-admin clusters update-peer-clusters cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--peer-clusters`|逗号分隔的对等集群名称（传递空字符串 "" 以删除列表）||

### `get-peer-clusters`
获取对等集群列表

用法

```bash
pulsar-admin clusters get-peer-clusters
```

### `get-failure-domain`
获取故障域的配置 Broker

用法

```bash
pulsar-admin clusters get-failure-domain cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--domain-name`|故障域名称，是 Pulsar 集群下的逻辑域||

### `create-failure-domain`
为集群创建新的故障域（如果已创建则更新）

用法

```bash
pulsar-admin clusters create-failure-domain cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--broker-list`|逗号分隔的 Broker 列表||
|`--domain-name`|故障域名称，是 Pulsar 集群下的逻辑域||

### `update-failure-domain`
更新集群的故障域（如果不存在则创建新的）

用法

```bash
pulsar-admin clusters update-failure-domain cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--broker-list`|逗号分隔的 Broker 列表||
|`--domain-name`|故障域名称，是 Pulsar 集群下的逻辑域||

### `delete-failure-domain`
删除现有故障域

用法

```bash
pulsar-admin clusters delete-failure-domain cluster-name options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--domain-name`|故障域名称，是 Pulsar 集群下的逻辑域||

### `list-failure-domains`
列出集群的现有故障域

用法

```bash
pulsar-admin clusters list-failure-domains cluster-name
```

## `functions`

Pulsar Functions 的命令行界面

用法

```bash
pulsar-admin functions subcommand
```

子命令
* `localrun`
* `create`
* `delete`
* `update`
* `get`
* `restart`
* `stop`
* `start`
* `status`
* `stats`
* `list`
* `querystate`
* `putstate`
* `trigger`


### `localrun`
在本地运行 Pulsar Function（而不是将其部署到 Pulsar 集群）


用法

```bash
pulsar-admin functions localrun options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--cpu`|每个函数实例需要分配的 CPU 核心数（仅适用于 docker 运行时）||
|`--ram`|每个函数实例需要分配的内存字节数（仅适用于 process/docker 运行时）||
|`--disk`|每个函数实例需要分配的磁盘字节数（仅适用于 docker 运行时）||
|`--auto-ack`|框架是否会自动确认消息||
|`--subs-name`|如果用户希望为输入 Topic 消费者指定特定的订阅名称，则为 Pulsar 源订阅名称||
|`--broker-service-url `|Pulsar Broker 的 URL||
|`--classname`|函数的类名||
|`--custom-serde-inputs`|输入 Topic 到 SerDe 类名的映射（作为 JSON 字符串）||
|`--custom-schema-inputs`|输入 Topic 到 Schema 类名的映射（作为 JSON 字符串）||
|`--client-auth-params`|客户端认证参数||
|`--client-auth-plugin`|函数进程可用于连接到 Broker 的客户端认证插件||
|`--function-config-file`|指定函数配置的 YAML 配置文件的绝对路径||
|`--hostname-verification-enabled`|启用主机名验证|false|
|`--instance-id-offset`|从此偏移量开始 instanceIds|0|
|`--inputs`|函数的输入 Topic 或多个 Topic（多个 Topic 可以指定为逗号分隔的列表）||
|`--log-topic`|函数日志生成到的 Topic||
|`--jar`|函数的 jar 文件的绝对路径（如果函数是用 Java 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--output`|函数的输出 Topic（如果未指定，则不写入输出）||
|`--output-serde-classname`|用于函数输出消息的 SerDe 类||
|`--parallelism`|函数的并行因子，即要运行的函数实例数量|1|
|`--processing-guarantees`|应用于函数的处理保证（也称为传递语义）。可能的值：[ATLEAST_ONCE, ATMOST_ONCE, EFFECTIVELY_ONCE]|ATLEAST_ONCE|
|`--py`|函数的主 Python 文件/Python Wheel 文件的绝对路径（如果函数是用 Python 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--go`|函数的主 Go 可执行二进制文件的绝对路径（如果函数是用 Go 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--schema-type`|用于函数输出消息的内置 Schema 类型或自定义 Schema 类名||
|`--sliding-interval-count`|窗口滑动的消息数||
|`--sliding-interval-duration-ms`|窗口滑动的时间持续时间||
|`--state-storage-service-url`|状态存储服务的 URL。默认情况下，它设置为 Apache BookKeeper 的服务 URL。当 Pulsar Function 本地运行时，必须手动添加此服务 URL。 ||
|`--tenant`|函数的租户||
|`--topics-pattern`|从匹配模式的命名空间下的 Topic 列表中消费的 Topic 模式。[--input] 和 [--topic-pattern] 互斥。在 --custom-serde-inputs 中为模式添加 SerDe 类名（仅支持 java 函数）||
|`--user-config`|用户定义的配置键/值||
|`--window-length-count`|每个窗口的消息数||
|`--window-length-duration-ms`|窗口的时间持续时间（以毫秒为单位）||
|`--dead-letter-topic`|所有无法成功处理的消息发送到的 Topic||
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--max-message-retries`|在放弃之前我们应该尝试处理消息多少次||
|`--retain-ordering`|函数按顺序消费和处理消息||
|`--retain-key-ordering`|函数按键顺序消费和处理消息||
|`--timeout-ms`|消息超时时间（毫秒）||
|`--tls-allow-insecure`|允许不安全的 tls 连接|false|
|`--tls-trust-cert-path`|tls 信任证书文件路径||
|`--use-tls`|使用 tls 连接|false|
|`--producer-config`| 自定义生产者配置（作为 JSON 字符串）| |


### `create`
在集群模式下创建 Pulsar Function（即将其部署在 Pulsar 集群上）

用法

```bash
pulsar-admin functions create options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--cpu`|每个函数实例需要分配的 CPU 核心数（仅适用于 docker 运行时）||
|`--ram`|每个函数实例需要分配的内存字节数（仅适用于 process/docker 运行时）||
|`--disk`|每个函数实例需要分配的磁盘字节数（仅适用于 docker 运行时）||
|`--auto-ack`|框架是否会自动确认消息||
|`--subs-name`|如果用户希望为输入 Topic 消费者指定特定的订阅名称，则为 Pulsar 源订阅名称||
|`--classname`|函数的类名||
|`--custom-serde-inputs`|输入 Topic 到 SerDe 类名的映射（作为 JSON 字符串）||
|`--custom-schema-inputs`|输入 Topic 到 Schema 类名的映射（作为 JSON 字符串）||
|`--function-config-file`|指定函数配置的 YAML 配置文件的绝对路径||
|`--inputs`|函数的输入 Topic 或多个 Topic（多个 Topic 可以指定为逗号分隔的列表）||
|`--log-topic`|函数日志生成到的 Topic||
|`--jar`|函数的 jar 文件的绝对路径（如果函数是用 Java 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--output`|函数的输出 Topic（如果未指定，则不写入输出）||
|`--output-serde-classname`|用于函数输出消息的 SerDe 类||
|`--parallelism`|函数的并行因子，即要运行的函数实例数量|1|
|`--processing-guarantees`|应用于函数的处理保证（也称为传递语义）。可能的值：[ATLEAST_ONCE, ATMOST_ONCE, EFFECTIVELY_ONCE]|ATLEAST_ONCE|
|`--py`|函数的主 Python 文件/Python Wheel 文件的绝对路径（如果函数是用 Python 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--go`|函数的主 Go 可执行二进制文件的绝对路径（如果函数是用 Go 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--schema-type`|用于函数输出消息的内置 Schema 类型或自定义 Schema 类名||
|`--sliding-interval-count`|窗口滑动的消息数||
|`--sliding-interval-duration-ms`|窗口滑动的时间持续时间||
|`--tenant`|函数的租户||
|`--topics-pattern`|从匹配模式的命名空间下的 Topic 列表中消费的 Topic 模式。[--input] 和 [--topic-pattern] 互斥。在 --custom-serde-inputs 中为模式添加 SerDe 类名（仅支持 java 函数）||
|`--user-config`|用户定义的配置键/值||
|`--window-length-count`|每个窗口的消息数||
|`--window-length-duration-ms`|窗口的时间持续时间（以毫秒为单位）||
|`--dead-letter-topic`|所有无法处理的消息||
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--max-message-retries`|在放弃之前我们应该尝试处理消息多少次||
|`--retain-ordering`|函数按顺序消费和处理消息||
|`--retain-key-ordering`|函数按键顺序消费和处理消息||
|`--timeout-ms`|消息超时时间（毫秒）||
|`--producer-config`| 自定义生产者配置（作为 JSON 字符串）| |


### `delete`
删除在 Pulsar 集群上运行的 Pulsar Function

用法

```bash
pulsar-admin functions delete options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||


### `update`
更新已部署到 Pulsar 集群的 Pulsar Function

用法

```bash
pulsar-admin functions update options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--cpu`|每个函数实例需要分配的 CPU 核心数（仅适用于 docker 运行时）||
|`--ram`|每个函数实例需要分配的内存字节数（仅适用于 process/docker 运行时）||
|`--disk`|每个函数实例需要分配的磁盘字节数（仅适用于 docker 运行时）||
|`--auto-ack`|框架是否会自动确认消息||
|`--subs-name`|如果用户希望为输入 Topic 消费者指定特定的订阅名称，则为 Pulsar 源订阅名称||
|`--classname`|函数的类名||
|`--custom-serde-inputs`|输入 Topic 到 SerDe 类名的映射（作为 JSON 字符串）||
|`--custom-schema-inputs`|输入 Topic 到 Schema 类名的映射（作为 JSON 字符串）||
|`--function-config-file`|指定函数配置的 YAML 配置文件的绝对路径||
|`--inputs`|函数的输入 Topic 或多个 Topic（多个 Topic 可以指定为逗号分隔的列表）||
|`--log-topic`|函数日志生成到的 Topic||
|`--jar`|函数的 jar 文件的绝对路径（如果函数是用 Java 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--output`|函数的输出 Topic（如果未指定，则不写入输出）||
|`--output-serde-classname`|用于函数输出消息的 SerDe 类||
|`--parallelism`|函数的并行因子，即要运行的函数实例数量|1|
|`--processing-guarantees`|应用于函数的处理保证（也称为传递语义）。可能的值：[ATLEAST_ONCE, ATMOST_ONCE, EFFECTIVELY_ONCE]|ATLEAST_ONCE|
|`--py`|函数的主 Python 文件/Python Wheel 文件的绝对路径（如果函数是用 Python 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--go`|函数的主 Go 可执行二进制文件的绝对路径（如果函数是用 Go 编写的）。它也支持 URL 路径 [http/https/file（file 协议假定文件已存在于 worker 主机上）/function（来自包管理服务的包 URL）]，worker 可以从这些路径下载包。||
|`--schema-type`|用于函数输出消息的内置 Schema 类型或自定义 Schema 类名||
|`--sliding-interval-count`|窗口滑动的消息数||
|`--sliding-interval-duration-ms`|窗口滑动的时间持续时间||
|`--tenant`|函数的租户||
|`--topics-pattern`|从匹配模式的命名空间下的 Topic 列表中消费的 Topic 模式。[--input] 和 [--topic-pattern] 互斥。在 --custom-serde-inputs 中为模式添加 SerDe 类名（仅支持 java 函数）||
|`--user-config`|用户定义的配置键/值||
|`--window-length-count`|每个窗口的消息数||
|`--window-length-duration-ms`|窗口的时间持续时间（以毫秒为单位）||
|`--dead-letter-topic`|所有无法处理的消息||
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--max-message-retries`|在放弃之前我们应该尝试处理消息多少次||
|`--retain-ordering`|函数按顺序消费和处理消息||
|`--retain-key-ordering`|函数按键顺序消费和处理消息||
|`--timeout-ms`|消息超时时间（毫秒）||
|`--producer-config`| 自定义生产者配置（作为 JSON 字符串）| |


### `get`
获取有关 Pulsar Function 的信息

用法

```bash
pulsar-admin functions get options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||


### `restart`
重启函数实例

用法

```bash
pulsar-admin functions restart options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--instance-id`|函数 instanceId（如果未提供 instance-id，则重启所有实例）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||


### `stop`
停止函数实例

用法

```bash
pulsar-admin functions stop options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--instance-id`|函数 instanceId（如果未提供 instance-id，则停止所有实例）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||


### `start`
启动已停止的函数实例

用法

```bash
pulsar-admin functions start options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--instance-id`|函数 instanceId（如果未提供 instance-id，则启动所有实例）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||


### `status`
检查 Pulsar Function 的当前状态

用法

```bash
pulsar-admin functions status options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--instance-id`|函数 instanceId（如果未提供 instance-id，则获取所有实例的状态）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||


### `stats`
获取 Pulsar Function 的当前统计信息

用法

```bash
pulsar-admin functions stats options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--instance-id`|函数 instanceId（如果未提供 instance-id，则获取所有实例的统计信息）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||

### `list`
列出在特定租户和命名空间下运行的所有 Pulsar Functions

用法

```bash
pulsar-admin functions list options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||


### `querystate`
获取与在集群模式下运行的 Pulsar Function 关联的当前状态

用法

```bash
pulsar-admin functions querystate options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`-k`, `--key`|您想要获取的状态的键||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||
|`-w`, `--watch`|监视与 Pulsar Function 的键关联的值的变化|false|

### `putstate`
将键/值对放入与 Pulsar Function 关联的状态

用法

```bash
pulsar-admin functions putstate options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|Pulsar Function 的完全限定函数名称（FQFN）||
|`--name`|Pulsar Function 的名称||
|`--namespace`|Pulsar Function 的命名空间||
|`--tenant`|Pulsar Function 的租户||
|`-s`, `--state`|需要放入的 FunctionState||

### `trigger`
使用提供的值触发指定的 Pulsar Function

用法

```bash
pulsar-admin functions trigger options
```

选项

|标志|描述|默认值|
|---|---|---|
|`--fqfn`|函数的完全限定函数名称（FQFN）||
|`--name`|函数的名称||
|`--namespace`|函数的命名空间||
|`--tenant`|函数的租户||
|`--topic`|函数消费的特定 Topic 名称，您要向其注入数据||
|`--trigger-file`|包含您想要触发函数的数据的文件路径||
|`--trigger-value`|您想要触发函数的值||


*注意：由于文件内容非常长，这里仅展示了文件的开头部分作为示例。完整的 pulsar-admin 文档包含更多详细的命令说明。*