---
id: io-netty-source
title: Netty source connector
sidebar_label: "Netty source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Netty Source 连接器打开一个端口，通过配置的网络协议接受传入数据，并将其发布到用户定义的 Pulsar Topic。

此连接器可以在容器化（例如 k8s）部署中使用。否则，如果连接器以进程或线程模式运行，实例可能在监听端口时发生冲突。

## 配置

Netty Source 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|是否必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `type` |String| true |tcp | 数据传输到 netty 的网络协议。<br /><br />以下是可用选项：<br /><li>tcp</li><li>http</li><li>udp </li>|
| `host` | String|true | 127.0.0.1 | Source 实例监听的主机名或地址。 |
| `port` | int|true | 10999 | Source 实例监听的端口。 |
| `numberOfThreads` |int| true |1 | Netty TCP 服务器用于接受传入连接和处理已接受连接流量的线程数。 |


### 示例

在使用 Netty Source 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "type": "tcp",
        "host": "127.0.0.1",
        "port": "10911",
        "numberOfThreads": "1"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      type: "tcp"
      host: "127.0.0.1"
      port: 10999
      numberOfThreads: 1
  ```

## 使用

以下示例展示如何使用 Netty Source 连接器与 TCP 和 HTTP。

### TCP

1. 启动 Pulsar 单机版。

   ```bash
   docker pull apachepulsar/pulsar:{version}

   docker run -d -it -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-netty-standalone apachepulsar/pulsar:{version} bin/pulsar standalone
   ```

2. 创建配置文件 _netty-source-config.yaml_。

   ```yaml
   configs:
       type: "tcp"
       host: "127.0.0.1"
       port: 10999
       numberOfThreads: 1
   ```

3. 将配置文件 _netty-source-config.yaml_ 复制到 Pulsar 服务器。

   ```bash
   docker cp netty-source-config.yaml pulsar-netty-standalone:/pulsar/conf/
   ```

4. 下载 Netty Source 连接器。

   ```bash
   docker exec -it pulsar-netty-standalone /bin/bash
   curl -O http://mirror-hk.koddos.net/apache/pulsar/pulsar-{version}/connectors/pulsar-io-netty-{version}.nar
   ```

5. 启动 Netty Source 连接器。

   ```bash
   ./bin/pulsar-admin sources localrun \
   --archive $PWD/pulsar-io-@pulsar:version@.nar \
   --tenant public \
   --namespace default \
   --name netty \
   --destination-topic-name netty-topic \
   --source-config-file $PWD/netty-source-config.yaml \
   --parallelism 1
   ```

6. 消费数据。

   ```bash
   docker exec -it pulsar-netty-standalone /bin/bash
   ./bin/pulsar-client consume -t Exclusive -s netty-sub netty-topic -n 0
   ```

7. 打开另一个终端窗口向 Netty Source 发送数据。

   ```bash
   docker exec -it pulsar-netty-standalone /bin/bash
   apt-get update
   apt-get -y install telnet
   root@1d19327b2c67:/pulsar# telnet 127.0.0.1 10999
   Trying 127.0.0.1...
   Connected to 127.0.0.1.
   Escape character is '^]'.
   hello
   world
   ```

8. 消费者终端窗口显示以下信息。

   ```bash
   ----- got message -----
   hello

   ----- got message -----
   world
   ```

### HTTP

1. 启动 Pulsar 单机版。

   ```bash
   docker pull apachepulsar/pulsar:{version}
   docker run -d -it -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-netty-standalone apachepulsar/pulsar:{version} bin/pulsar standalone
   ```

2. 创建配置文件 _netty-source-config.yaml_。

   ```yaml
   configs:
       type: "http"
       host: "127.0.0.1"
       port: 10999
       numberOfThreads: 1
   ```

3. 将配置文件 _netty-source-config.yaml_ 复制到 Pulsar 服务器。

   ```bash
   docker cp netty-source-config.yaml pulsar-netty-standalone:/pulsar/conf/
   ```

4. 下载 Netty Source 连接器。

   ```bash
   docker exec -it pulsar-netty-standalone /bin/bash
   curl -O http://mirror-hk.koddos.net/apache/pulsar/pulsar-{version}/connectors/pulsar-io-netty-{version}.nar
   ```

5. 启动 Netty Source 连接器。

   ```bash
   ./bin/pulsar-admin sources localrun \
   --archive $PWD/pulsar-io-@pulsar:version@.nar \
   --tenant public \
   --namespace default \
   --name netty \
   --destination-topic-name netty-topic \
   --source-config-file $PWD/netty-source-config.yaml \
   --parallelism 1
   ```

6. 消费数据。

   ```bash
   docker exec -it pulsar-netty-standalone /bin/bash
   ./bin/pulsar-client consume -t Exclusive -s netty-sub netty-topic -n 0
   ```

7. 打开另一个终端窗口向 Netty Source 发送数据。

   ```bash
   docker exec -it pulsar-netty-standalone /bin/bash
   curl -X POST --data 'hello, world!' http://127.0.0.1:10999/
   ```

8. 消费者终端窗口显示以下信息。

   ```bash
   ----- got message -----
   hello, world!
   ```