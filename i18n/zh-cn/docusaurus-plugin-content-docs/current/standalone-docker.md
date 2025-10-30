---
id: standalone-docker
title: Set up a standalone Pulsar in Docker
sidebar_label: "Run Pulsar in Docker"
---

对于本地开发和测试，您可以在自己的机器上以独立模式在 Docker 容器中运行 Pulsar。

## 先决条件

- [Docker](https://docs.docker.com/get-docker/) （推荐版本 20.10+）
- 至少 4GB 可用 RAM
- 至少 5GB 可用磁盘空间

## 在 Docker 中启动 Pulsar

* 对于 macOS、Linux 和 Windows：

  ```shell
  docker run -it -p 6650:6650  -p 8080:8080 --mount source=pulsardata,target=/pulsar/data --mount source=pulsarconf,target=/pulsar/conf apachepulsar/pulsar:@pulsar:version@ bin/pulsar standalone
  ```

关于此命令的几点注意事项：
 * 数据、元数据和配置持久化在 Docker 卷上，以避免每次容器重启时都"全新"启动。有关卷的详细信息，您可以使用 `docker volume inspect <sourcename>`。
 * 对于 Windows 上的 Docker，确保配置它使用 Linux 容器。
 * 默认情况下，docker 容器将以 UID 10000 和 GID 0 运行。您需要确保挂载的卷为 UID 10000 或 GID 0 提供写权限。请注意 UID 10000 是任意的，因此建议使这些挂载对 root 组（GID 0）可写。

如果您成功启动 Pulsar，您将看到类似这样的 `INFO` 级别日志消息：

```
08:18:30.970 [main] INFO  org.apache.pulsar.broker.web.WebService - HTTP Service started at http://0.0.0.0:8080
...
07:53:37.322 [main] INFO  org.apache.pulsar.broker.PulsarService - messaging service is ready, bootstrap service port = 8080, broker url= pulsar://localhost:6650, cluster=standalone, configs=org.apache.pulsar.broker.ServiceConfiguration@98b63c1
...
```

:::tip

当您启动本地独立集群时，会自动创建一个 `public/default` 命名空间，用于开发目的。

:::

所有 Pulsar 主题都在命名空间内管理。有关更多信息，请参阅[主题](concepts-messaging.md#topics)。

## 在 Docker 中使用 Pulsar

Pulsar 为 [Java](client-libraries-java.md)、[Go](client-libraries-go.md)、[Python](client-libraries-python.md)和 [C++](client-libraries-cpp.md) 提供客户端库。如果您运行本地独立集群，您可以使用以下根 URL 之一与您的集群交互：

* `pulsar://localhost:6650`
* `http://localhost:8080`

以下示例将通过使用 [Python 客户端 API](@pulsar:apidoc:python@) 指导您快速开始使用 Pulsar。

直接从 [PyPI](https://pypi.org/project/pulsar-client/) 安装 Pulsar Python 客户端库：

```shell
pip install pulsar-client
```

### 消费消息

创建消费者并订阅主题：

```python
import pulsar

client = pulsar.Client('pulsar://localhost:6650')
consumer = client.subscribe('my-topic',
                            subscription_name='my-sub')

while True:
    msg = consumer.receive()
    print("Received message: '%s'" % msg.data())
    consumer.acknowledge(msg)

client.close()
```

### 生产消息

现在启动生产者发送一些测试消息：

```python
import pulsar

client = pulsar.Client('pulsar://localhost:6650')
producer = client.create_producer('my-topic')

for i in range(10):
    producer.send(('hello-pulsar-%d' % i).encode('utf-8'))

client.close()
```

## 获取主题统计信息

在 Pulsar 中，您可以使用 REST、Java 或命令行工具来控制系统的每个方面。有关 API 的详细信息，请参阅[管理 API 概述](admin-api-overview.md)。

在最简单的示例中，您可以使用 curl 来探测特定主题的统计信息：

```shell
curl http://localhost:8080/admin/v2/persistent/public/default/my-topic/stats | python -m json.tool
```

输出类似于这样：

```json
{
    "msgRateIn": 0.0,
    "msgThroughputIn": 0.0,
    "msgRateOut": 1.8332950480217471,
    "msgThroughputOut": 91.33142602871978,
    "bytesInCounter": 7097,
    "msgInCounter": 143,
    "bytesOutCounter": 6607,
    "msgOutCounter": 133,
    "averageMsgSize": 0.0,
    "msgChunkPublished": false,
    "storageSize": 7097,
    "backlogSize": 0,
    "offloadedStorageSize": 0,
    "publishers": [
        {
            "accessMode": "Shared",
            "msgRateIn": 0.0,
            "msgThroughputIn": 0.0,
            "averageMsgSize": 0.0,
            "chunkedMessageRate": 0.0,
            "producerId": 0,
            "metadata": {},
            "address": "/127.0.0.1:35604",
            "connectedSince": "2021-07-04T09:05:43.04788Z",
            "clientVersion": "2.8.0",
            "producerName": "standalone-2-5"
        }
    ],
    "waitingPublishers": 0,
    "subscriptions": {
        "my-sub": {
            "msgRateOut": 1.8332950480217471,
            "msgThroughputOut": 91.33142602871978,
            "bytesOutCounter": 6607,
            "msgOutCounter": 133,
            "msgRateRedeliver": 0.0,
            "chunkedMessageRate": 0,
            "msgBacklog": 0,
            "backlogSize": 0,
            "msgBacklogNoDelayed": 0,
            "blockedSubscriptionOnUnackedMsgs": false,
            "msgDelayed": 0,
            "unackedMessages": 0,
            "type": "Exclusive",
            "activeConsumerName": "3c544f1daa",
            "msgRateExpired": 0.0,
            "totalMsgExpired": 0,
            "lastExpireTimestamp": 0,
            "lastConsumedFlowTimestamp": 1625389101290,
            "lastConsumedTimestamp": 1625389546070,
            "lastAckedTimestamp": 1625389546162,
            "lastMarkDeleteAdvancedTimestamp": 1625389546163,
            "consumers": [
                {
                    "msgRateOut": 1.8332950480217471,
                    "msgThroughputOut": 91.33142602871978,
                    "bytesOutCounter": 6607,
                    "msgOutCounter": 133,
                    "msgRateRedeliver": 0.0,
                    "chunkedMessageRate": 0.0,
                    "consumerName": "3c544f1daa",
                    "availablePermits": 867,
                    "unackedMessages": 0,
                    "avgMessagesPerEntry": 6,
                    "blockedConsumerOnUnackedMsgs": false,
                    "lastAckedTimestamp": 1625389546162,
                    "lastConsumedTimestamp": 1625389546070,
                    "metadata": {},
                    "address": "/127.0.0.1:35472",
                    "connectedSince": "2021-07-04T08:58:21.287682Z",
                    "clientVersion": "2.8.0"
                }
            ],
            "isDurable": true,
            "isReplicated": false,
            "allowOutOfOrderDelivery": false,
            "consumersAfterMarkDeletePosition": {},
            "nonContiguousDeletedMessagesRanges": 0,
            "nonContiguousDeletedMessagesRangesSerializedSize": 0,
            "durable": true,
            "replicated": false
        }
    },
    "replication": {},
    "deduplicationStatus": "Disabled",
    "nonContiguousDeletedMessagesRanges": 0,
    "nonContiguousDeletedMessagesRangesSerializedSize": 0
}
```