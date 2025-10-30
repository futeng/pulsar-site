---
id: io-redis-sink
title: Redis sink connector
sidebar_label: "Redis sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Redis Sink 连接器从 Pulsar Topic 拉取消息并将消息持久化到 Redis 数据库。

## 配置

Redis Sink 连接器的配置包含以下属性。



### 属性

| 名称 | 类型|是否必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `redisHosts` |String|true|" " (空字符串) | 要连接的 Redis 主机逗号分隔列表。 |
| `redisPassword` |String|false|" " (空字符串) | 用于连接 Redis 的密码。 |
| `redisDatabase` | int|true|0  | 要连接的 Redis 数据库。 |
| `clientMode` |String| false|Standalone | 与 Redis 集群交互时的客户端模式。<br /><br />以下是可用选项：<br /><li>Standalone<br /></li><li>Cluster </li>|
| `autoReconnect` | boolean|false|true | Redis 客户端是否自动重连。 |
| `requestQueue` | int|false|2147483647 | Redis 的最大排队请求数。 |
| `tcpNoDelay` |boolean| false| false | 是否启用无延迟的 TCP。 |
| `keepAlive` | boolean|false | false |是否启用到 Redis 的 keepalive。 |
| `connectTimeout` |long| false|10000 | 连接超时前的等待时间（毫秒）。 |
| `operationTimeout` | long|false|10000 | 操作标记为超时前的时间（毫秒）。 |
| `batchTimeMs` | int|false|1000 | Redis 操作时间（毫秒）。 |
| `batchSize` | int|false|200 | 写入 Redis 数据库的批处理大小。 |


### 示例

在使用 Redis Sink 连接器之前，您需要通过以下方法之一在启动 Pulsar 服务（`PULSAR_HOME`）的路径中创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "redisHosts": "localhost:6379",
        "redisPassword": "mypassword",
        "redisDatabase": "0",
        "clientMode": "Standalone",
        "operationTimeout": "2000",
        "batchSize": "1",
        "batchTimeMs": "1000",
        "connectTimeout": "3000"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      redisHosts: "localhost:6379"
      redisPassword: "mypassword"
      redisDatabase: 0
      clientMode: "Standalone"
      operationTimeout: 2000
      batchSize: 1
      batchTimeMs: 1000
      connectTimeout: 3000
  ```

### 使用

此示例展示如何使用 Pulsar Redis 连接器将记录写入 Redis 数据库。

1. 启动 Redis 服务器。

   ```bash
   docker pull redis:5.0.5
   docker run -d -p 6379:6379 --name my-redis redis:5.0.5 --requirepass "mypassword"
   ```

2. 以独立模式在本地启动 Pulsar 服务。

   ```bash
   bin/pulsar standalone
   ```

   确保 NAR 文件在 `connectors/pulsar-io-redis-@pulsar:version@.nar` 可用。

3. 使用以下方法之一以本地运行模式启动 Pulsar Redis 连接器。

   * 使用前面显示的 **JSON** 配置文件。

   ```bash
   bin/pulsar-admin sinks localrun \
       --archive $PWD/connectors/pulsar-io-redis-@pulsar:version@.nar \
       --tenant public \
       --namespace default \
       --name my-redis-sink \
       --sink-config '{"redisHosts": "localhost:6379","redisPassword": "mypassword","redisDatabase": "0","clientMode": "Standalone","operationTimeout": "3000","batchSize": "1"}' \
       --inputs my-redis-topic
   ```

   * 使用前面显示的 **YAML** 配置文件。

    ```bash
    bin/pulsar-admin sinks localrun \
        --archive $PWD/connectors/pulsar-io-redis-@pulsar:version@.nar \
        --tenant public \
        --namespace default \
        --name my-redis-sink \
        --sink-config-file $PWD/redis-sink-config.yaml \
        --inputs my-redis-topic
    ```

4. 向 topic 发布记录。

   ```bash
   bin/pulsar-client produce \
       persistent://public/default/my-redis-topic \
       -k "streaming" \
       -m "Pulsar"
   ```

5. 在 Docker 中启动 Redis 客户端。

   ```bash
   docker exec -it my-redis redis-cli -a "mypassword"
   ```

6. 检查 Redis 中的键/值。

   ```bash
   127.0.0.1:6379> keys *
   1) "streaming"
   127.0.0.1:6379> get "streaming"
   "Pulsar"
   ```