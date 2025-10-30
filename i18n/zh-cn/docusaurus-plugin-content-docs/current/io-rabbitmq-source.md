---
id: io-rabbitmq-source
title: RabbitMQ source connector
sidebar_label: "RabbitMQ source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

RabbitMQ Source 连接器从 RabbitMQ 集群接收消息并将消息写入 Pulsar Topic。

## 配置

RabbitMQ Source 连接器的配置包含以下属性。

### 属性

| 名称                  | 类型    | 是否必需 | 默认值        | 描述                                                                            |
|-----------------------|---------|----------|----------------|----------------------------------------------------------------------------------------|
| `connectionName`      | String  | true     | (空字符串) | 连接名称。                                                                   |
| `host`                | String  | true     | (空字符串) | RabbitMQ 主机。                                                                     |
| `port`                | int     | true     | 5672           | RabbitMQ 端口。                                                                     |
| `virtualHost`         | String  | true     | /              | 用于连接 RabbitMQ 的虚拟主机。                                          |
| `username`            | String  | false    | guest          | 用于向 RabbitMQ 认证的用户名。                                         |
| `password`            | String  | false    | guest          | 用于向 RabbitMQ 认证的密码。                                         |
| `queueName`           | String  | true     | (空字符串) | 应该从中读取或写入消息的 RabbitMQ 队列名称。               |
| `requestedChannelMax` | int     | false    | 0              | 最初请求的最大通道数。<br/> 0 表示无限制。               |
| `requestedFrameMax`   | int     | false    | 0              | 最初请求的最大帧大小（以八位字节为单位）。<br/> 0 表示无限制。         |
| `connectionTimeout`   | int     | false    | 60000          | TCP 连接建立超时时间（毫秒）。<br/> 0 表示无限。   |
| `handshakeTimeout`    | int     | false    | 10000          | AMQP0-9-1 协议握手超时时间（毫秒）。                           |
| `requestedHeartbeat`  | int     | false    | 60             | 请求的心跳超时时间（秒）。                                            |
| `prefetchCount`       | int     | false    | 0              | 服务器交付的最大消息数。<br/> 0 表示无限制。       |
| `prefetchGlobal`      | boolean | false    | false          | 设置是否应该应用于整个通道而不是每个消费者。 |
| `passive`             | boolean | false    | false          | rabbitmq 消费者是否应该创建自己的队列或绑定到现有队列。  |

### 示例

在使用 RabbitMQ Source 连接器之前，您需要通过以下方法之一创建配置文件。

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
        "prefetchCount": "0",
        "prefetchGlobal": "false",
        "passive": "false"
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
      prefetchCount: 0
      prefetchGlobal: "false"
      passive: "false"
  ```

## 使用


### 独立模式

此示例描述如何在独立模式下使用 RabbitMQ Source 连接器从 RabbitMQ 获取数据并将数据写入 Pulsar Topic。

#### 先决条件

- 有一个 RabbitMQ 服务器，队列中有一些历史消息。

#### 步骤

1. 获取 Pulsar 包并以独立模式启动 Pulsar。

   ```bash
   curl -LO "https://www.apache.org/dyn/closer.lua/pulsar/pulsar-@pulsar:version@/apache-pulsar-@pulsar:version@-bin.tar.gz?action=download"
   tar xvfz apache-pulsar-@pulsar:version@-bin.tar.gz
   cd apache-pulsar-@pulsar:version@
   bin/pulsar standalone
   ```

2. 下载与 Pulsar 版本对应的[nar 包](pathname:///download#connectors)并将以下文件复制到 Pulsar 目录。

    ```bash
    cd connectors
    curl -LO "https://www.apache.org/dyn/closer.lua/pulsar/pulsar-@pulsar:version@/connectors/pulsar-io-rabbitmq-@pulsar:version@.nar?action=download"
    ```

3. 默认情况下，发布到至少缺少一个持久订阅的 topic 的消息会自动标记为准备删除。我们可以在命名空间级别设置保留策略来防止这种情况。

   ```bash
   ./bin/pulsar-admin namespaces set-retention -s 100M -t 3d public/default
   ```


4. 准备一个名为 _rabbitmq-source-queue-name.yaml_ 的配置文件。
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
      prefetchCount: 0
      prefetchGlobal: "false"
      passive: "false"
    ```

    将配置文件复制到 Pulsar 的 conf 目录。
    ```bash
    cp rabbitmq-source-queue-name.yaml ./conf
    ```

5. 打开一个新的终端窗口，以本地运行模式启动连接器。

   ```bash
   ./bin/pulsar-admin source localrun \
    --source-config-file $PWD/conf/rabbitmq-source-queue-name.yaml \
    --archive $PWD/connectors/pulsar-io-rabbitmq-@pulsar:version@.nar \
    --name rabbitmq-source \
    --destination-topic-name pulsar-rabbitmq-test-topic \
    --broker-service-url pulsar://{ip}:{port}
   ```

6. 打开一个新的终端窗口，检查 topic 是否自动创建。

   ```bash
   ./bin/pulsar-admin topics list public/default \
   ```

    此 topic 自动创建如下：

    ```bash
    persistent://public/default/pulsar-rabbitmq-test-topic-partition-0
    ```

7. 消费此 topic。

    ```bash
    ./bin/pulsar-client consume persistent://public/default/pulsar-rabbitmq-test-topic-partition-0 -s s1 -n 0 -p Earliest
    ```

    消费者终端窗口显示以下信息。

    ```bash
       ----- got message -----
       key:[quick.orange.pulsar], properties:[], content:message-topic-O(range) 0
       ----- got message -----
       key:[quick.orange.pulsar], properties:[], content:message-topic-O(range) 1

       ... ...

    ```