---
id: io-influxdb-sink
title: InfluxDB sink connector
sidebar_label: "InfluxDB sink connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

InfluxDB sink 连接器从 Pulsar topic 拉取消息，并将消息持久化到 InfluxDB。

InfluxDB sink 为 InfluxDBv1 和 v2 分别提供了不同的配置。

## 配置

InfluxDB sink 连接器的配置具有以下属性。

### 属性
#### InfluxDBv2
| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `influxdbUrl` |String| 是|" " (空字符串) | InfluxDB 实例的 URL。 |
| `token` | String|是| " " (空字符串) |用于向 InfluxDB 进行身份验证的认证令牌。 |
| `organization` | String| 是|" " (空字符串)  | 要写入的 InfluxDB 组织。 |
| `bucket` |String| 是 | " " (空字符串)| 要写入的 InfluxDB 存储桶。 |
| `precision` | String|否| ns | 写入数据到 InfluxDB 的时间戳精度。 <br /><br />可用选项如下：<li>ns<br /></li><li>us<br /></li><li>ms<br /></li><li>s</li>|
| `logLevel` | String|否| NONE|InfluxDB 请求和响应的日志级别。 <br /><br />可用选项如下：<li>NONE<br /></li><li>BASIC<br /></li><li>HEADERS<br /></li><li>FULL</li>|
| `gzipEnable` | boolean|否 | false | 是否启用 gzip。 |
| `batchTimeMs` |long|否| 1000L |   InfluxDB 操作时间（毫秒）。 |
| `batchSize` | int|否|200| 写入 InfluxDB 的批次大小。 |

#### InfluxDBv1
| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `influxdbUrl` |String| 是|" " (空字符串) | InfluxDB 实例的 URL。 |
| `username` | String|否| " " (空字符串) |用于向 InfluxDB 进行身份验证的用户名。 |
| `password` | String| 否|" " (空字符串)  | 用于向 InfluxDB 进行身份验证的密码。 |
| `database` |String| 是 | " " (空字符串)| 要写入消息的 InfluxDB 数据库。 |
| `consistencyLevel` | String|否|ONE | 写入数据到 InfluxDB 的一致性级别。 <br /><br />可用选项如下：<li>ALL<br /></li><li> ANY<br /></li><li>ONE<br /></li><li>QUORUM </li>|
| `logLevel` | String|否| NONE|InfluxDB 请求和响应的日志级别。 <br /><br />可用选项如下：<li>NONE<br /></li><li>BASIC<br /></li><li>HEADERS<br /></li><li>FULL</li>|
| `retentionPolicy` | String|否| autogen| InfluxDB 的保留策略。 |
| `gzipEnable` | boolean|否 | false | 是否启用 gzip。 |
| `batchTimeMs` |long|否| 1000L |   InfluxDB 操作时间（毫秒）。 |
| `batchSize` | int|否|200| 写入 InfluxDB 的批次大小。 |

### 示例
在使用 InfluxDB sink 连接器之前，您需要通过以下方法之一创建配置文件。
#### InfluxDBv2

* JSON

  ```json
  {
     "configs": {
        "influxdbUrl": "http://localhost:9999",
        "organization": "example-org",
        "bucket": "example-bucket",
        "token": "xxxx",
        "precision": "ns",
        "logLevel": "NONE",
        "gzipEnable": false,
        "batchTimeMs": 1000,
        "batchSize": 100
     }
  }
  ```

* YAML

  ```yaml
  configs:
      influxdbUrl: "http://localhost:9999"
      organization: "example-org"
      bucket: "example-bucket"
      token: "xxxx"
      precision: "ns"
      logLevel: "NONE"
      gzipEnable: false
      batchTimeMs: 1000
      batchSize: 100
  ```

#### InfluxDBv1

* JSON

  ```json
  {
     "configs": {
        "influxdbUrl": "http://localhost:8086",
        "database": "test_db",
        "consistencyLevel": "ONE",
        "logLevel": "NONE",
        "retentionPolicy": "autogen",
        "gzipEnable": false,
        "batchTimeMs": 1000,
        "batchSize": 100
     }
  }
  ```

* YAML

  ```yaml
  configs:
      influxdbUrl: "http://localhost:8086"
      database: "test_db"
      consistencyLevel: "ONE"
      logLevel: "NONE"
      retentionPolicy: "autogen"
      gzipEnable: false
      batchTimeMs: 1000
      batchSize: 100
  ```
