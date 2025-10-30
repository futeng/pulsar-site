---
id: io-cli
title: Connector Admin CLI
sidebar_label: "CLI"
---

:::tip

This page is deprecated and not updated anymore. For the latest and complete information about `Pulsar-admin`, including commands, flags, descriptions, and more, see [Pulsar admin docs](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/).

:::

`pulsar-admin` 工具帮助您管理 Pulsar 连接器。

## `sources`

用于管理 Pulsar IO source 连接器（将数据导入 Pulsar）的接口。

```bash
pulsar-admin sources subcommands
```

子命令包括：
* `create`
* `update`
* `delete`
* `get`
* `status`
* `list`
* `stop`
* `start`
* `restart`
* `localrun`
* `available-sources`
* `reload`


### `create`

提交 Pulsar IO source 连接器以在 Pulsar 集群中运行。

#### 用法

```bash
pulsar-admin sources create options
```

#### 选项

|标志|描述|
|----|---|
| `-a`, `--archive` | source 的 NAR 归档文件的绝对路径。<br />它也支持 url-path（http/https/file [文件协议假设文件已存在于 worker 主机上]），worker 可以从该路径下载包。
| `--classname` | source 的类名。
| `--cpu` | 每个 source 实例需要分配的 CPU（以核心为单位）（仅适用于 Docker 运行时）。
| `--deserialization-classname` | source 的 SerDe 类名。
| `--destination-topic-name` | 发送数据的 Pulsar topic。
| `--disk` | 每个 source 实例需要分配的磁盘（以字节为单位）（仅适用于 Docker 运行时）。
|`--name` | source 的名称。
| `--namespace` | source 的命名空间。
| ` --parallelism` | source 的并行度因子，即要运行的 source 实例数量。
| `--processing-guarantees` | 应用于 source 的处理保证（也称为传递语义）。Source 连接器从外部系统接收消息并将消息写入 Pulsar topic。`--processing-guarantees` 用于确保向 Pulsar topic 写入消息的处理保证。<br />可用值为 ATLEAST_ONCE、ATMOST_ONCE、EFFECTIVELY_ONCE。
| `--ram` | 每个 source 实例需要分配的 RAM（以字节为单位）（仅适用于进程和 Docker 运行时）。
| `-st`, `--schema-type` | Schema 类型。<br />用于编码从 source 发出的消息的内置 schema（例如 AVRO 和 JSON）或自定义 schema 类名。
| `--source-config` | Source 配置键/值。
| `--source-config-file` | 指定 source 配置的 YAML 配置文件的绝对路径。
| `-t`, `--source-type` | source 的连接器提供者。
| `--tenant` | source 的租户。
|`--producer-config`| 自定义生产者配置（作为 JSON 字符串）。

### `update`

更新已提交的 Pulsar IO source 连接器。

#### 用法

```bash
pulsar-admin sources update options
```

#### 选项

|标志|描述|
|----|---|
| `-a`, `--archive` | source 的 NAR 归档文件的绝对路径。<br />它也支持 url-path（http/https/file [文件协议假设文件已存在于 worker 主机上]），worker 可以从该路径下载包。
| `--classname` | source 的类名。
| `--cpu` | 每个 source 实例需要分配的 CPU（以核心为单位）（仅适用于 Docker 运行时）。
| `--deserialization-classname` | source 的 SerDe 类名。
| `--destination-topic-name` | 发送数据的 Pulsar topic。
| `--disk` | 每个 source 实例需要分配的磁盘（以字节为单位）（仅适用于 Docker 运行时）。
|`--name` | source 的名称。
| `--namespace` | source 的命名空间。
| ` --parallelism` | source 的并行度因子，即要运行的 source 实例数量。
| `--processing-guarantees` | 应用于 source 的处理保证（也称为传递语义）。Source 连接器从外部系统接收消息并将消息写入 Pulsar topic。`--processing-guarantees` 用于确保向 Pulsar topic 写入消息的处理保证。<br />可用值为 ATLEAST_ONCE、ATMOST_ONCE、EFFECTIVELY_ONCE。
| `--ram` | 每个 source 实例需要分配的 RAM（以字节为单位）（仅适用于进程和 Docker 运行时）。
| `-st`, `--schema-type` | Schema 类型。<br />用于编码从 source 发出的消息的内置 schema（例如 AVRO 和 JSON）或自定义 schema 类名。
| `--source-config` | Source 配置键/值。
| `--source-config-file` | 指定 source 配置的 YAML 配置文件的绝对路径。
| `-t`, `--source-type` | source 的连接器提供者。当前内置连接器的 `source-type` 参数由 pulsar-io.yaml 文件中指定的 `name` 参数设置决定。
| `--tenant` | source 的租户。
| `--update-auth-data` | 是否更新认证数据。<br />**默认值：false。**


### `delete`

删除 Pulsar IO source 连接器。

#### 用法

```bash
pulsar-admin sources delete options
```

#### 选项

|标志|描述|
|---|---|
|`--name`|source 的名称。|
|`--namespace`|source 的命名空间。|
|`--tenant`|source 的租户。|

### `get`

获取关于 Pulsar IO source 连接器的信息。

#### 用法

```bash
pulsar-admin sources get options
```

#### 选项
|标志|描述|
|---|---|
|`--name`|source 的名称。|
|`--namespace`|source 的命名空间。|
|`--tenant`|source 的租户。|


### `status`

检查 Pulsar Source 的当前状态。

#### 用法

```bash
pulsar-admin sources status options
```

#### 选项

|标志|描述|
|---|---|
|`--instance-id`|source ID。<br />如果未提供 `instance-id`，Pulsar 将获取所有实例的状态。|
|`--name`|source 的名称。|
|`--namespace`|source 的命名空间。|
|`--tenant`|source 的租户。|

### `list`

列出所有正在运行的 Pulsar IO source 连接器。

#### 用法

```bash
pulsar-admin sources list options
```

#### 选项

|标志|描述|
|---|---|
|`--namespace`|source 的命名空间。|
|`--tenant`|source 的租户。|


### `stop`

停止 source 实例。

#### 用法

```bash
pulsar-admin sources stop options
```

#### 选项

|标志|描述|
|---|---|
|`--instance-id`|source 实例 ID。<br />如果未提供 `instance-id`，Pulsar 将停止所有实例。|
|`--name`|source 的名称。|
|`--namespace`|source 的命名空间。|
|`--tenant`|source 的租户。|

### `start`

启动 source 实例。

#### 用法

```bash
pulsar-admin sources start options
```

#### 选项

|标志|描述|
|---|---|
|`--instance-id`|source 实例 ID。<br />如果未提供 `instance-id`，Pulsar 将启动所有实例。|
|`--name`|source 的名称。|
|`--namespace`|source 的命名空间。|
|`--tenant`|source 的租户。|


### `restart`

重启 source 实例。

#### 用法

```bash
pulsar-admin sources restart options
```

#### 选项
|标志|描述|
|---|---|
|`--instance-id`|source 实例 ID。<br />如果未提供 `instance-id`，Pulsar 将重启所有实例。
|`--name`|source 的名称。|
|`--namespace`|source 的命名空间。|
|`--tenant`|source 的租户。|


### `localrun`

在本地运行 Pulsar IO source 连接器，而不是将其部署到 Pulsar 集群。

#### 用法

```bash
pulsar-admin sources localrun options
```

#### 选项

|标志|描述|
|----|---|
| `-a`, `--archive` | Source 的 NAR 归档文件的绝对路径。<br />它也支持 url-path（http/https/file [文件协议假设文件已存在于 worker 主机上]），worker 可以从该路径下载包。
| `--broker-service-url` | Pulsar broker 的 URL。
|`--classname`|source 的类名。
| `--client-auth-params` | 客户端认证参数。
| `--client-auth-plugin` | 函数进程用于连接 broker 的客户端认证插件。
|`--cpu`|每个 source 实例需要分配的 CPU（以核心为单位）（仅适用于 Docker 运行时）。|
|`--deserialization-classname`|source 的 SerDe 类名。
|`--destination-topic-name`|发送数据的 Pulsar topic。
|`--disk`|每个 source 实例需要分配的磁盘（以字节为单位）（仅适用于 Docker 运行时）。|
|`--hostname-verification-enabled`|启用主机名验证。<br />**默认值：false**。
|`--name`|source 的名称。|
|`--namespace`|source 的命名空间。|
|`--parallelism`|source 的并行度因子，即要运行的 source 实例数量）。|
|`--processing-guarantees` | 应用于 source 的处理保证（也称为传递语义）。Source 连接器从外部系统接收消息并将消息写入 Pulsar topic。`--processing-guarantees` 用于确保向 Pulsar topic 写入消息的处理保证。<br />可用值为 ATLEAST_ONCE、ATMOST_ONCE、EFFECTIVELY_ONCE。
|`--ram`|每个 source 实例需要分配的 RAM（以字节为单位）（仅适用于 Docker 运行时）。|
| `-st`, `--schema-type` | Schema 类型。<br />用于编码从 source 发出的消息的内置 schema（例如 AVRO 和 JSON）或自定义 schema 类名。
|`--source-config`|Source 配置键/值。
|`--source-config-file`|指定 source 配置的 YAML 配置文件的绝对路径。
|`--source-type`|source 的连接器提供者。
|`--tenant`|source 的租户。
|`--tls-allow-insecure`|允许不安全的 tls 连接。<br />**默认值：false**。
|`--tls-trust-cert-path`|tls 信任证书文件路径。
|`--use-tls`|使用 tls 连接。<br />**默认值：false**。
|`--producer-config`| 自定义生产者配置（作为 JSON 字符串）。

### `available-sources`

获取 Pulsar 集群支持的 Pulsar IO 连接器 source 列表。

#### 用法

```bash
pulsar-admin sources available-sources
```

### `reload`

重新加载可用的内置连接器。

#### 用法

```bash
pulsar-admin sources reload
```

## `sinks`

用于管理 Pulsar IO sink 连接器（从 Pulsar 导出数据）的接口。

```bash
pulsar-admin sinks subcommands
```

子命令包括：
* `create`
* `update`
* `delete`
* `get`
* `status`
* `list`
* `stop`
* `start`
* `restart`
* `localrun`
* `available-sinks`
* `reload`

### `create`

提交 Pulsar IO sink 连接器以在 Pulsar 集群中运行。

#### 用法

```bash
pulsar-admin sinks create options
```

#### 选项

|标志|描述|
|----|---|
| `-a`, `--archive` | sink 的归档文件的绝对路径。<br />它也支持 url-path（http/https/file [文件协议假设文件已存在于 worker 主机上]），worker 可以从该路径下载包。
| `--auto-ack` |  框架是否将自动确认消息。
| `--classname` | sink 的类名。
| `--cpu` | 每个 sink 实例需要分配的 CPU（以核心为单位）（仅适用于 Docker 运行时）。
| `--custom-schema-inputs` | 输入 topic 到 schema 类型或类名的映射（作为 JSON 字符串）。
| `--custom-serde-inputs` | 输入 topic 到 SerDe 类名的映射（作为 JSON 字符串）。
| `--disk` | 每个 sink 实例需要分配的磁盘（以字节为单位）（仅适用于 Docker 运行时）。
|`-i, --inputs` | sink 的输入 topic 或 topics（多个 topic 可以指定为逗号分隔的列表）。
|`--name` | sink 的名称。
| `--namespace` | sink 的命名空间。
| ` --parallelism` | sink 的并行度因子，即要运行的 sink 实例数量。
| `--processing-guarantees` | 应用于 sink 的处理保证（也称为传递语义）。Pulsar 中的 `--processing-guarantees` 实现也依赖于 sink 实现。<br />可用值为 ATLEAST_ONCE、ATMOST_ONCE、EFFECTIVELY_ONCE。
| `--ram` | 每个 sink 实例需要分配的 RAM（以字节为单位）（仅适用于进程和 Docker 运行时）。
| `--retain-ordering` | Sink 按顺序消费和下沉消息。
| `--sink-config` | sink 配置键/值。
| `--sink-config-file` | 指定 sink 配置的 YAML 配置文件的绝对路径。
| `-t`, `--sink-type` | sink 的连接器提供者。当前内置连接器的 `sink-type` 参数由 pulsar-io.yaml 文件中指定的 `name` 参数设置决定。
| `--subs-name` | 如果用户希望为输入 topic 消费者指定特定的订阅名称，则为 Pulsar source 订阅名称。
| `--tenant` | sink 的租户。
| `--timeout-ms` | 消息超时时间（以毫秒为单位）。
| `--topics-pattern` | 用于消费命名空间下匹配模式的 topic 列表的主题模式。<br />`--input` 和 `--topics-pattern` 互斥。<br />在 `--custom-serde-inputs` 中为模式添加 SerDe 类名。

### `update`

更新 Pulsar IO sink 连接器。

#### 用法

```bash
pulsar-admin sinks update options
```

#### 选项

|标志|描述|
|----|---|
| `-a`, `--archive` | sink 的归档文件的绝对路径。<br />它也支持 url-path（http/https/file [文件协议假设文件已存在于 worker 主机上]），worker 可以从该路径下载包。
| `--auto-ack` |  框架是否将自动确认消息。
| `--classname` | sink 的类名。
| `--cpu` | 每个 sink 实例需要分配的 CPU（以核心为单位）（仅适用于 Docker 运行时）。
| `--custom-schema-inputs` | 输入 topic 到 schema 类型或类名的映射（作为 JSON 字符串）。
| `--custom-serde-inputs` | 输入 topic 到 SerDe 类名的映射（作为 JSON 字符串）。
| `--disk` | 每个 sink 实例需要分配的磁盘（以字节为单位）（仅适用于 Docker 运行时）。
|`-i, --inputs` | sink 的输入 topic 或 topics（多个 topic 可以指定为逗号分隔的列表）。
|`--name` | sink 的名称。
| `--namespace` | sink 的命名空间。
| ` --parallelism` | sink 的并行度因子，即要运行的 sink 实例数量。
| `--processing-guarantees` | 应用于 sink 的处理保证（也称为传递语义）。Pulsar 中的 `--processing-guarantees` 实现也依赖于 sink 实现。<br />可用值为 ATLEAST_ONCE、ATMOST_ONCE、EFFECTIVELY_ONCE。
| `--ram` | 每个 sink 实例需要分配的 RAM（以字节为单位）（仅适用于进程和 Docker 运行时）。
| `--retain-ordering` | Sink 按顺序消费和下沉消息。
| `--sink-config` | sink 配置键/值。
| `--sink-config-file` | 指定 sink 配置的 YAML 配置文件的绝对路径。
| `-t`, `--sink-type` | sink 的连接器提供者。
| `--subs-name` | 如果用户希望为输入 topic 消费者指定特定的订阅名称，则为 Pulsar source 订阅名称。
| `--tenant` | sink 的租户。
| `--timeout-ms` | 消息超时时间（以毫秒为单位）。
| `--topics-pattern` | 用于消费命名空间下匹配模式的 topic 列表的主题模式。<br />`--input` 和 `--topics-pattern` 互斥。<br />在 `--custom-serde-inputs` 中为模式添加 SerDe 类名。
| `--update-auth-data` | 是否更新认证数据。<br />**默认值：false。** |

### `delete`

删除 Pulsar IO sink 连接器。

#### 用法

```bash
pulsar-admin sinks delete options
```

#### 选项

|标志|描述|
|---|---|
|`--name`|sink 的名称。|
|`--namespace`|sink 的命名空间。|
|`--tenant`|sink 的租户。|

### `get`

获取关于 Pulsar IO sink 连接器的信息。

#### 用法

```bash
pulsar-admin sinks get options
```

#### 选项
|标志|描述|
|---|---|
|`--name`|sink 的名称。|
|`--namespace`|sink 的命名空间。|
|`--tenant`|sink 的租户。|


### `status`

检查 Pulsar sink 的当前状态。

#### 用法

```bash
pulsar-admin sinks status options
```

#### 选项

|标志|描述|
|---|---|
|`--instance-id`|sink ID。<br />如果未提供 `instance-id`，Pulsar 将获取所有实例的状态。|
|`--name`|sink 的名称。|
|`--namespace`|sink 的命名空间。|
|`--tenant`|sink 的租户。|


### `list`

列出所有正在运行的 Pulsar IO sink 连接器。

#### 用法

```bash
pulsar-admin sinks list options
```

#### 选项

|标志|描述|
|---|---|
|`--namespace`|sink 的命名空间。|
|`--tenant`|sink 的租户。|


### `stop`

停止 sink 实例。

#### 用法

```bash
pulsar-admin sinks stop options
```

#### 选项

|标志|描述|
|---|---|
|`--instance-id`|sink 实例 ID。<br />如果未提供 `instance-id`，Pulsar 将停止所有实例。|
|`--name`|sink 的名称。|
|`--namespace`|sink 的命名空间。|
|`--tenant`|sink 的租户。|

### `start`

启动 sink 实例。

#### 用法

```bash
pulsar-admin sinks start options
```

#### 选项

|标志|描述|
|---|---|
|`--instance-id`|sink 实例 ID。<br />如果未提供 `instance-id`，Pulsar 将启动所有实例。|
|`--name`|sink 的名称。|
|`--namespace`|sink 的命名空间。|
|`--tenant`|sink 的租户。|


### `restart`

重启 sink 实例。

#### 用法

```bash
pulsar-admin sinks restart options
```

#### 选项
|标志|描述|
|---|---|
|`--instance-id`|sink 实例 ID。<br />如果未提供 `instance-id`，Pulsar 将重启所有实例。
|`--name`|sink 的名称。|
|`--namespace`|sink 的命名空间。|
|`--tenant`|sink 的租户。|


### `localrun`

在本地运行 Pulsar IO sink 连接器，而不是将其部署到 Pulsar 集群。

#### 用法

```bash
pulsar-admin sinks localrun options
```

#### 选项

|标志|描述|
|----|---|
| `-a`, `--archive` | sink 的归档文件的绝对路径。<br />它也支持 url-path（http/https/file [文件协议假设文件已存在于 worker 主机上]），worker 可以从该路径下载包。
| `--auto-ack` | 框架是否将自动确认消息。
| `--broker-service-url` | Pulsar broker 的 URL。
|`--classname`|sink 的类名。
| `--client-auth-params` | 客户端认证参数。
| `--client-auth-plugin` | 函数进程用于连接 broker 的客户端认证插件。
|`--cpu`|每个 sink 实例需要分配的 CPU（以核心为单位）（仅适用于 Docker 运行时）。|
| `--custom-schema-inputs` | 输入 topic 到 Schema 类型或类名的映射（作为 JSON 字符串）。
| `--max-redeliver-count` | 消息在被发送到死信队列之前的最大重新投递次数。
| `--dead-letter-topic` | 发送失败消息的死信主题名称。
| `--custom-serde-inputs` | 输入 topic 到 SerDe 类名的映射（作为 JSON 字符串）。
|`--disk`|每个 sink 实例需要分配的磁盘（以字节为单位）（仅适用于 Docker 运行时）。|
|`--hostname-verification-enabled`|启用主机名验证。<br />**默认值：false**。
| `-i`, `--inputs` | sink 的输入 topic 或 topics（多个 topic 可以指定为逗号分隔的列表）。
|`--name`|sink 的名称。|
|`--namespace`|sink 的命名空间。|
|`--parallelism`|sink 的并行度因子，即要运行的 sink 实例数量）。|
|`--processing-guarantees`|应用于 sink 的处理保证（也称为传递语义）。Pulsar 中的 `--processing-guarantees` 实现也依赖于 sink 实现。<br />可用值为 ATLEAST_ONCE、ATMOST_ONCE、EFFECTIVELY_ONCE。
|`--ram`|每个 sink 实例需要分配的 RAM（以字节为单位）（仅适用于 Docker 运行时）。|
|`--retain-ordering` | Sink 按顺序消费和下沉消息。
|`--sink-config`|sink 配置键/值。
|`--sink-config-file`|指定 sink 配置的 YAML 配置文件的绝对路径。
|`--sink-type`|sink 的连接器提供者。
|`--subs-name` | 如果用户希望为输入 topic 消费者指定特定的订阅名称，则为 Pulsar source 订阅名称。
|`--tenant`|sink 的租户。
| `--timeout-ms` | 消息超时时间（以毫秒为单位）。
| `--negative-ack-redelivery-delay-ms` | 否认消息的重新投递延迟（以毫秒为单位）。 |
|`--tls-allow-insecure`|允许不安全的 tls 连接。<br />**默认值：false**。
|`--tls-trust-cert-path`|tls 信任证书文件路径。
| `--topics-pattern` | 用于消费命名空间下匹配模式的 topic 列表的主题模式。<br />`--input` 和 `--topics-pattern` 互斥。<br />在 `--custom-serde-inputs` 中为模式添加 SerDe 类名。
|`--use-tls`|使用 tls 连接。<br />**默认值：false**。

### `available-sinks`

获取 Pulsar 集群支持的 Pulsar IO 连接器 sink 列表。

#### 用法

```bash
pulsar-admin sinks available-sinks
```

### `reload`

重新加载可用的内置连接器。

#### 用法

```bash
pulsar-admin sinks reload
```
