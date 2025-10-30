---
id: io-alluxio
title: Alluxio sink connector
sidebar_label: Alluxio sink connector
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

## Sink

Alluxio sink 连接器从 Pulsar Topic 拉取消息，并将消息持久化到 Alluxio 目录中。

## 配置

Alluxio sink 连接器的配置具有以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `alluxioMasterHost` | String | true | "" (空字符串) | Alluxio master 的主机名。 |
| `alluxioMasterPort` | int | true | 19998 | Alluxio master 节点运行的端口。 |
| `alluxioDir` | String | true | "" (空字符串) | 应该读取或写入文件的 Alluxio 目录。 |
| `securityLoginUser` | String | false | "" (空字符串) | 当 `alluxio.security.authentication.type` 设置为 `SIMPLE` 或 `CUSTOM` 时，用户应用程序使用此属性指示请求 Alluxio 服务的用户。如果未显式设置，则使用 OS 登录用户。 |
| `filePrefix` | String | false | "" (空字符串) | 在 Alluxio 目录中创建的文件的前缀（例如，值为 'TopicA' 会生成名为 topicA-、topicA- 等的文件）。 |
| `fileExtension` | String | false | "" (空字符串) | 添加到写入 Alluxio 的文件的扩展名（例如 '.txt'）。 |
| `lineSeparator` | String | false | "" (空字符串) | 用于在文本文件中分隔记录的字符。如果未提供值，则所有记录的内容将连接在一起形成一个连续的字节数组。 |
| `rotationRecords` | long | false | 10000 | Alluxio 文件轮换的记录数。 |
| `rotationInterval` | long | false | -1 | 轮换 Alluxio 文件的时间间隔（毫秒）。 |
| `schemaEnable` | boolean | false | false | 设置 Sink 是否需要考虑 Schema，或者是否应该简单地将原始消息复制到 Alluxio。 |
| `writeType` | String | false | `MUST_CACHE` | 创建 Alluxio 文件时的默认写入类型。有效选项为 `MUST_CACHE`（仅写入 Alluxio 且必须存储在 Alluxio 中）、`CACHE_THROUGH`（尝试缓存，同步写入 UnderFS）、`THROUGH`（无缓存，同步写入 UnderFS）。 |

### 示例

在使用 Alluxio sink 连接器之前，您需要通过以下方法之一在您将启动 Pulsar 服务的路径（即 `PULSAR_HOME`）中创建配置文件。

* JSON

    ```json
    {
        "alluxioMasterHost": "localhost",
        "alluxioMasterPort": "19998",
        "alluxioDir": "pulsar",
        "filePrefix": "TopicA",
        "fileExtension": ".txt",
        "lineSeparator": "\n",
        "rotationRecords": "100",
        "rotationInterval": "-1"
    }
    ```

* YAML

    ```yaml
    configs:
        alluxioMasterHost: "localhost"
        alluxioMasterPort: "19998"
        alluxioDir: "pulsar"
        filePrefix: "TopicA"
        fileExtension: ".txt"
        lineSeparator: "\n"
        rotationRecords: 100
        rotationInterval: "-1"
    ```