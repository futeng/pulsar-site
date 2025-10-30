---
id: io-rabbitmq-sink
title: RabbitMQ sink connector
sidebar_label: "RabbitMQ sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

RabbitMQ Sink 连接器从 Pulsar Topic 拉取消息并将消息持久化到 RabbitMQ 队列。

## 配置

RabbitMQ Sink 连接器的配置包含以下属性。

### 属性

| 名称                  | 类型   | 是否必需 | 默认值        | 描述                                                                          |
|-----------------------|--------|----------|----------------|--------------------------------------------------------------------------------------|
| `connectionName`      | String | true     | (空字符串) | 连接名称。                                                                 |
| `host`                | String | true     | (空字符串) | RabbitMQ 主机。                                                                   |
| `port`                | int    | true     | 5672           | RabbitMQ 端口。                                                                   |
| `virtualHost`         | String | true     | /              | 用于连接 RabbitMQ 的虚拟主机。                                        |
| `username`            | String | false    | guest          | 用于向 RabbitMQ 认证的用户名。                                       |
| `password`            | String | false    | guest          | 用于向 RabbitMQ 认证的密码。                                       |
| `queueName`           | String | true     | (空字符串) | 应该从中读取或写入消息的 RabbitMQ 队列名称。             |
| `requestedChannelMax` | int    | false    | 0              | 最初请求的最大通道数。<br/> 0 表示无限制。             |
| `requestedFrameMax`   | int    | false    | 0              | 最初请求的最大帧大小（以八位字节为单位）。<br/> 0 表示无限制。       |
| `connectionTimeout`   | int    | false    | 60000          | TCP 连接建立超时时间（毫秒）。<br/> 0 表示无限。 |
| `handshakeTimeout`    | int    | false    | 10000          | AMQP0-9-1 协议握手超时时间（毫秒）。                         |
| `requestedHeartbeat`  | int    | false    | 60             | 请求的心跳超时时间（秒）。                                          |
| `exchangeName`        | String | true     | (空字符串) | 用于发布消息的交换机。                                                    |
| `routingKey`          | String | true     | (空字符串) | 用于发布消息的路由键。                                            |

### 示例

在使用 RabbitMQ Sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "host": "localhost",
        "port": "5672",
        "virtualHost": "/",
        "username": "guest",
        "password": "guest",
        "queueName": "test-queue",
        "connectionName": "test-connection",
        "requestedChannelMax": "0",
        "requestedFrameMax": "0",
        "connectionTimeout": "60000",
        "handshakeTimeout": "10000",
        "requestedHeartbeat": "60",
        "exchangeName": "test-exchange",
        "routingKey": "test-key"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      host: "localhost"
      port: 5672
      virtualHost: "/"
      username: "guest"
      password: "guest"
      queueName: "test-queue"
      connectionName: "test-connection"
      requestedChannelMax: 0
      requestedFrameMax: 0
      connectionTimeout: 60000
      handshakeTimeout: 10000
      requestedHeartbeat: 60
      exchangeName: "test-exchange"
      routingKey: "test-key"
  ```