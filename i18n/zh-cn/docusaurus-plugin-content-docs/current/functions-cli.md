---
id: functions-cli
title: Pulsar Functions CLI 和 YAML 配置
sidebar_label: "CLI 和 YAML 配置"
description: 全面了解 Pulsar Functions 的管理 CLI 和 YAML 配置
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


## Pulsar Functions 的 Pulsar 管理 CLI

Pulsar 管理界面使您能够通过 CLI 创建和管理 Pulsar Functions。有关包括命令、标志和描述在内的最新完整信息，请参阅 [Pulsar 管理 CLI](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。


## Pulsar Functions 的 YAML 配置

您可以使用预定义的 YAML 文件来配置函数。下表列出了必需的字段和参数。

| 字段名称             | 类型                       | 相关命令参数               | 描述|
|----------------------|----------------------------|----------------------------|------------|
| runtimeFlags         | String                     | N/A                        | 要传递给运行时的任何标志（仅适用于进程和 Kubernetes 运行时）。 |
| tenant               | String                     | `--tenant`                 | 函数的租户。|
| namespace            | String                     | `--namespace`              | 函数的命名空间。|
| name                 | String                     | `--name`                   | 函数的名称。|
| className            | String                     | `--classname`              | 函数的类名。 |
| functionType         | String                     | `--function-type`          | 内置函数类型。 |
| inputs               | List&lt;String&gt;               | `-i`, `--inputs`           | 函数的输入 Topic。多个 Topic 可以指定为逗号分隔的列表。 |
| customSerdeInputs    | Map&lt;String,String&gt;         | `--custom-serde-inputs`    | 从输入 Topic 到 SerDe 类名的映射。 |
| topicsPattern        | String                     | `--topics-pattern`         | 从命名空间下的 Topic 列表消费的主题模式。<br />**注意：** `--input` 和 `--topic-pattern` 是互斥的。对于 Java 函数，您需要在 `--custom-serde-inputs` 中为模式添加 SerDe 类名。 |
| customSchemaInputs   | Map&lt;String,String&gt;         | `--custom-schema-inputs`   | 从输入 Topic 到 Schema 属性的映射。 |
| customSchemaOutputs  | Map&lt;String,String&gt;         | `--custom-schema-outputs`  | 从输出 Topic 到 Schema 属性的映射。|
| inputSpecs           | Map&lt;String,[ConsumerConfig](#consumerconfig)&gt; | `--input-specs` | 从输入到自定义配置的映射。|
| output               | String                     | `-o`, `--output`           | 函数的输出 Topic。如果未指定，则不写入输出。  |
| producerConfig       | [ProducerConfig](#producerconfig)  | `--producer-config` | 生产者的自定义配置。  |
| outputSchemaType     | String                     | `-st`, `--schema-type`     | 用于消息输出的内置 Schema 类型或自定义 Schema 类名。   |
| outputSerdeClassName | String                     | `--output-serde-classname` | 用于消息输出的 SerDe 类。 |
| logTopic             | String                     | `--log-topic`              | 函数日志发送到的 Topic。  |
| processingGuarantees | String | `--processing-guarantees` | 应用于函数的处理保证（传递语义）。可用值：`ATLEAST_ONCE`、`ATMOST_ONCE`、`EFFECTIVELY_ONCE`、`MANUAL`。|
| retainOrdering       | Boolean                    | `--retain-ordering`	     | 函数是否按顺序消费和处理消息。 |
| retainKeyOrdering    | Boolean                    | `--retain-key-ordering`    | 函数是否按键顺序消费和处理消息。 |
| batchBuilder         | String           | `--batch-builder` | 使用 `producerConfig.batchBuilder` 代替。<br />**注意**：`batchBuilder` 即将在代码中弃用。 |
| forwardSourceMessageProperty | Boolean  | `--forward-source-message-property`  | 在处理过程中是否将输入消息的属性转发到输出 Topic。当值设置为 `false` 时，禁用转发。 |
| userConfig           | Map&lt;String,Object&gt;         | `--user-config`         	 | 用户定义的配置键/值。 |
| secrets       | Map&lt;String,Object&gt; | `--secrets`	| 从 secretName 到对象的映射，这些对象封装了底层密钥提供程序如何获取密钥。 |
| runtime       | String             | N/A          | 函数的运行时。可用值：`java`、`python`、`go`。 |
| autoAck       | Boolean            | `--auto-ack` | 框架是否自动确认消息。<br /><br />**注意**：此配置在将来的版本中将被弃用。如果您指定了传递语义，框架会自动确认消息。如果您不希望框架自动确认消息，请将 `processingGuarantees` 设置为 `MANUAL`。 |
| maxMessageRetries    | Int      |	`--max-message-retries` | 放弃前处理消息的重试次数。 |
| deadLetterTopic      | String   | `--dead-letter-topic`   | 用于存储未成功处理消息的 Topic。 |
| subName              | String   | `--subs-name`           | 输入 Topic 消费者使用的 Pulsar 源订阅名称（如果需要）。|
| parallelism          | Int      | `--parallelism`         | 函数的并行因子，即要运行的函数实例数量。 |
| resources     | [Resources](#resources)	| N/A           | N/A |
| fqfn          | String          | `--fqfn`                | 函数的完全限定函数名称（FQFN）。 |
| windowConfig  | [WindowConfig](#windowconfig) | N/A       | N/A |
| timeoutMs     | Long            | `--timeout-ms`          | 消息超时时间（毫秒）。 |
| jar           | String          | `--jar`                 | 函数（用 Java 编写）的 JAR 文件的绝对路径。它还支持 worker 可以从中下载包的 URL 路径，包括 HTTP、HTTPS、file（文件协议，假设文件已存在于 worker 主机上）和 function（来自包管理服务的包 URL）。 |
| py            | String          | `--py`                  | 函数（用 Python 编写）的主 Python/Python wheel 文件的绝对路径。它还支持 worker 可以从中下载包的 URL 路径，包括 HTTP、HTTPS、file（文件协议，假设文件已存在于 worker 主机上）和 function（来自包管理服务的包 URL）。  |
| go            | String          | `--go`                  | 函数（用 Go 编写）的主 Go 可执行二进制文件的绝对路径。它还支持 worker 可以从中下载包的 URL 路径，包括 HTTP、HTTPS、file（文件协议，假设文件已存在于 worker 主机上）和 function（来自包管理服务的包 URL）。 |
| cleanupSubscription  | Boolean   | `--cleanup-subscription`   | 删除函数时是否删除函数创建或使用的订阅。默认值为 `true` |
| customRuntimeOptions | String    | `--custom-runtime-options` | 编码用于自定义运行时选项的字符串。 |
| maxPendingAsyncRequests | Int    | `--max-message-retries`    | 每个实例的待处理异步请求数的最大值，以避免大量并发请求。 |
| exposePulsarAdminClientEnabled | Boolean | N/A                | 是否将 Pulsar 管理客户端暴露给函数上下文。默认情况下，它是禁用的。 |
| subscriptionPosition | String    | `--subs-position`          | 用于从指定位置消费消息的 Pulsar 源订阅的位置。默认值为 `Latest`。|
| skipToLatest         | Boolean   | `--skip-to-latest`         | 函数实例重启后，消费者是否应跳转到最新消息。 |

##### ConsumerConfig

下表概述了 `inputSpecs` 字段下的嵌套字段和相关参数。

| 字段名称             | 类型                       | 相关命令参数               | 描述|
|----------------------|----------------------------|----------------------------|------------|
| schemaType           | String                     | N/A                        | N/A |
| serdeClassName       | String                     | N/A                        | N/A |
| isRegexPattern       | Boolean                    | N/A                        | N/A |
| schemaProperties     | Map&lt;String,String&gt;         | N/A                        | N/A |
| consumerProperties   | Map&lt;String,String&gt;         | N/A                        | N/A |
| receiverQueueSize    | Int                        | N/A                        | N/A |
| cryptoConfig         | [CryptoConfig](#cryptoconfig)   | N/A                   |参考[代码](https://github.com/apache/pulsar/blob/master/pulsar-client-admin-api/src/main/java/org/apache/pulsar/common/functions/CryptoConfig.java)。 |
| poolMessages         | Boolean                    | N/A                        | N/A |

##### ProducerConfig

下表概述了 `producerConfig` 字段下的嵌套字段和相关参数。

| 字段名称                         | 类型                          | 相关命令参数 | 描述                     |
|------------------------------------|-------------------------------|--------------------------|---------------------------------|
| maxPendingMessages                 | Int                           | N/A                      | 保存等待接收来自 broker 确认的消息的队列的最大大小。 |
| maxPendingMessagesAcrossPartitions | Int                           | N/A                      | 所有分区的 `maxPendingMessages` 数量。 |
| useThreadLocalProducers            | Boolean                       | N/A                      | N/A                             |
| cryptoConfig                       | [CryptoConfig](#cryptoconfig) | N/A                      | 参考[代码](https://github.com/apache/pulsar/blob/master/pulsar-client-admin-api/src/main/java/org/apache/pulsar/common/functions/CryptoConfig.java)。|
| batchBuilder                       | String                        | `--batch-builder`        | 批处理构造方法的类型。可用值：`DEFAULT` 和 `KEY_BASED`。默认值为 `DEFAULT`。 |
| compressionType                      | String                        | N/A                      | 生产者使用的消息数据压缩类型。默认值为 [`LZ4`](https://github.com/lz4/lz4)。<br />可用选项：<li>`NONE`（无压缩）</li><li>[`ZLIB`](https://zlib.net/)<br /></li><li>[`ZSTD`](https://facebook.github.io/zstd/)</li><li>[`SNAPPY`](https://google.github.io/snappy/)</li>|

###### Resources

下表概述了 `resources` 字段下的嵌套字段和相关参数。

| 字段名称 | 类型   | 相关命令参数 | 描述  |
|------------|--------|--------------------------|--------------|
| cpu        | double | `--cpu`                  | 需要为每个函数实例分配的 CPU 核心数（仅适用于 Kubernetes 运行时）。 |
| ram        | Long   | `--ram`                  | 需要为每个函数实例分配的 RAM 字节数（仅适用于进程/Kubernetes 运行时）。|
| disk       | Long   | `--disk`                 | 需要为每个函数实例分配的磁盘字节数（仅适用于 Kubernetes 运行时）。 |

###### WindowConfig

下表概述了 `windowConfig` 字段下的嵌套字段和相关参数。

| 字段名称                    | 类型   | 相关命令参数         | 描述                                         |
|-------------------------------|--------|----------------------------------|-----------------------------------------------------|
| windowLengthCount             | Int    | `--window-length-count`          | 每个窗口的消息数量。                  |
| windowLengthDurationMs        | Long   | `--window-length-duration-ms`    | 每个窗口的时间持续时间（毫秒）。     |
| slidingIntervalCount          | Int    | `--sliding-interval-count`       | 窗口滑动后的消息数量。 |
| slidingIntervalDurationMs     | Long   | `--sliding-interval-duration-ms` | 窗口滑动后的时间持续时间。      |
| lateDataTopic                 | String | N/A                              | N/A                                                 |
| maxLagMs                      | Long   | N/A                              | N/A                                                 |
| watermarkEmitIntervalMs       | Long   | N/A                              | N/A                                                 |
| timestampExtractorClassName   | String | N/A                              | N/A                                                 |
| actualWindowFunctionClassName | String | N/A                              | N/A                                                 |

###### CryptoConfig

下表概述了 `cryptoConfig` 字段下的嵌套字段和相关参数。

| 字段名称                  | 类型                        | 相关命令参数 | 描述   |
|-----------------------------|-----------------------------|--------------------------|---------------|
| cryptoKeyReaderClassName    | String                      | N/A                      | 参考[代码](https://github.com/apache/pulsar/blob/master/pulsar-client-admin-api/src/main/java/org/apache/pulsar/common/functions/CryptoConfig.java)。   |
| cryptoKeyReaderConfig       | Map&lt;String, Object&gt;         | N/A                      | N/A   |
| encryptionKeys              | String[]                      | N/A                      | N/A   |
| producerCryptoFailureAction | ProducerCryptoFailureAction | N/A                      | N/A   |
| consumerCryptoFailureAction | ConsumerCryptoFailureAction | N/A                      | N/A   |


### 示例

以下示例展示如何使用 YAML 或 JSON 配置函数。

````mdx-code-block
<Tabs
  defaultValue="YAML"
  values={[{"label":"YAML","value":"YAML"},{"label":"JSON","value":"JSON"}]}>

<TabItem value="YAML">

```yaml
tenant: "public"
namespace: "default"
name: "config-file-function"
inputs:
  - "persistent://public/default/config-file-function-input-1"
  - "persistent://public/default/config-file-function-input-2"
output: "persistent://public/default/config-file-function-output"
jar: "function.jar"
parallelism: 1
resources:
  cpu: 8
  ram: 8589934592
autoAck: true
userConfig:
  foo: "bar"
```

</TabItem>
<TabItem value="JSON">

```json
{
  "tenant": "public",
  "namespace": "default",
  "name": "config-file-function",
  "inputs": [
    "persistent://public/default/config-file-function-input-1",
    "persistent://public/default/config-file-function-input-2"
  ],
  "output": "persistent://public/default/config-file-function-output",
  "jar": "function.jar",
  "parallelism": 1,
  "resources": {
    "cpu": 8,
    "ram": 8589934592
  },
  "autoAck": true,
  "userConfig": {
    "foo": "bar"
  }
}
```

</TabItem>
</Tabs>
````