---
id: client-libraries-websocket
title: Pulsar WebSocket API
sidebar_label: "WebSocket"
description: 学习如何使用 Pulsar WebSocket API 通过没有官方客户端库的语言与 Pulsar 交互。
---

Pulsar [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) API 提供了一种简单的方式使用没有官方[客户端库](client-libraries.md)的语言与 Pulsar 交互。你可以将 Pulsar WebSocket API 与任何 WebSocket 客户端库一起使用。有关更多详细信息，请参阅 [Python 和 Node.js 示例](#client-examples)。

通过 WebSocket，你可以发布和消费消息，并使用[客户端功能矩阵](/client-feature-matrix/)页面上可用的功能。

## 运行 WebSocket 服务

我们建议用于[本地开发](getting-started-standalone.md)的 Pulsar 独立变体已经启用了 WebSocket 服务。

在非独立模式下，有两种部署 WebSocket 服务的方式：

* 与 Pulsar broker[嵌入](#embedded-with-a-pulsar-broker)
* 作为[独立组件](#as-a-separate-component)

### 与 Pulsar broker 嵌入

在此模式下，WebSocket 服务将在已在 broker 中运行的同一 HTTP 服务内运行。要启用此模式，请在安装中的 [`conf/broker.conf`](reference-configuration.md#broker) 配置文件中设置 [`webSocketServiceEnabled`](reference-configuration.md#broker-webSocketServiceEnabled) 参数。

```properties
webSocketServiceEnabled=true
```

### 作为独立组件

在此模式下，WebSocket 服务将从 Pulsar [broker](reference-terminology.md#broker) 作为独立服务运行。此模式的配置在 [`conf/websocket.conf`](reference-configuration.md#websocket) 配置文件中处理。你需要*至少*设置以下参数：

* [`configurationMetadataStoreUrl`](reference-configuration.md#websocket)
* [`webServicePort`](reference-configuration.md#websocket-webServicePort)
* [`clusterName`](reference-configuration.md#websocket-clusterName)

这是一个示例：

```properties
configurationMetadataStoreUrl=zk1:2181,zk2:2181,zk3:2181
webServicePort=8080
clusterName=my-cluster
```

### 安全设置

要在 WebSocket 服务上启用 TLS 加密，请在 `conf/broker.conf` 文件中配置以下参数。

```properties
tlsEnabled=true
tlsAllowInsecureConnection=false
tlsCertificateFilePath=/path/to/client-websocket.cert.pem
tlsKeyFilePath=/path/to/client-websocket.key-pk8.pem
tlsTrustCertsFilePath=/path/to/ca.cert.pem
```

要在 WebSocket 服务上启用静态加密，在类路径中添加 CryptoKeyReaderFactory 工厂类，该类将为 WebSocket 创建 CryptoKeyReader，并帮助加载生产者/消费者的加密密钥。

```
cryptoKeyReaderFactoryClassName=org.apache.pulsar.MyCryptoKeyReaderFactoryClassImpl
```

### 启动 broker

设置配置后，你可以使用 [`pulsar-daemon`](reference-cli-tools.md) 工具启动服务：

```shell
bin/pulsar-daemon start websocket
```

## 发行说明

有关 Pulsar WebSocket API 的变更日志，请参阅[发行说明](/release-notes/client-ws)。

## API 参考

Pulsar 的 WebSocket API 为[生产](#producer-endpoint)、[消费](#consumer-endpoint)和[读取](#reader-endpoint)消息提供了三个端点。

所有通过 WebSocket API 的交换都使用 JSON。

### 身份验证

#### 浏览器 javascript WebSocket 客户端

使用查询参数 `token` 来传输身份验证令牌。

```http
ws://broker-service-url:8080/path?token=token
```

### 生产者端点

生产者端点要求你在 URL 中指定租户、命名空间和主题：

```http
ws://broker-service-url:8080/ws/v2/producer/persistent/:tenant/:namespace/:topic
```

##### 查询参数

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`sendTimeoutMillis` | long | 否 | 发送超时（默认：30 秒）
`batchingEnabled` | boolean | 否 | 启用消息批处理（默认：false）
`batchingMaxMessages` | int | 否 | 批处理中允许的最大消息数（默认：1000）
`maxPendingMessages` | int | 否 | 设置保存消息的内部队列的最大大小（默认：1000）
`batchingMaxPublishDelay` | long | 否 | 消息将被批处理的时间段（默认：10ms）
`messageRoutingMode` | string | 否 | 分区生产者的消息[路由模式](/api/client/index.html?org/apache/pulsar/client/api/ProducerConfiguration.MessageRoutingMode.html)：`SinglePartition`、`RoundRobinPartition`
`compressionType` | string | 否 | 压缩[类型](/api/client/index.html?org/apache/pulsar/client/api/CompressionType.html)：`LZ4`、`ZLIB`
`producerName` | string | 否 | 为生产者指定名称。Pulsar 将强制只有同名的生产者可以在主题上发布
`initialSequenceId` | long | 否 | 为生产者发布的消息设置序列 ID 的基线。
`hashingScheme` | string | 否 | 在分区主题上发布时使用的[哈希函数](/api/client/org/apache/pulsar/client/api/ProducerConfiguration.HashingScheme.html)：`JavaStringHash`、`Murmur3_32Hash`
`token` | string | 否 | 身份验证令牌，用于浏览器 javascript 客户端
`encryptionKeys` | string | 否 | 加密密钥，用于加密已发布的消息，仅当在 websocket-configuration 中使用 cryptoKeyReaderFactoryClassName 配置了加密读取器时。


#### 发布消息

```json
{
  "payload": "SGVsbG8gV29ybGQ=",
  "properties": {"key1": "value1", "key2": "value2"},
  "context": "1"
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`payload` | string | 是 | Base-64 编码的负载
`properties` | 键值对 | 否 | 应用程序定义的属性
`context` | string | 否 | 应用程序定义的请求标识符
`key` | string | 否 | 对于分区主题，决定使用哪个分区
`replicationClusters` | 数组 | 否 | 将复制限制到此[集群](reference-terminology.md#cluster)列表，按名称指定


##### 示例成功响应

```json
{
   "result": "ok",
   "messageId": "CAAQAw==",
   "context": "1"
 }
```

##### 示例失败响应

```json
 {
   "result": "send-error:3",
   "errorMsg": "Failed to de-serialize from JSON",
   "context": "1"
 }
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`result` | string | 是 | 成功时为 `ok`，不成功时为错误消息
`messageId` | string | 是 | 分配给已发布消息的消息 ID
`context` | string | 否 | 应用程序定义的请求标识符


### 消费者端点

消费者端点要求你在 URL 中指定租户、命名空间、主题以及订阅：

```http
ws://broker-service-url:8080/ws/v2/consumer/persistent/:tenant/:namespace/:topic/:subscription
```

##### 查询参数

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`ackTimeoutMillis` | long | 否 | 设置未确认消息的超时时间（默认：0）
`subscriptionType` | string | 否 | [订阅类型](/api/client/index.html?org/apache/pulsar/client/api/SubscriptionType.html)：`Exclusive`、`Failover`、`Shared`、`Key_Shared`
`receiverQueueSize` | int | 否 | 消费者接收队列的大小（默认：1000）
`consumerName` | string | 否 | 消费者名称
`priorityLevel` | int | 否 | 为消费者定义[优先级](/api/client/org/apache/pulsar/client/api/ConsumerConfiguration.html#setPriorityLevel-int-)
`maxRedeliverCount` | int | 否 | 为消费者定义[maxRedeliverCount](/api/client/org/apache/pulsar/client/api/ConsumerBuilder.html#deadLetterPolicy-org.apache.pulsar.client.api.DeadLetterPolicy-)（默认：0）。激活[死信主题](https://github.com/apache/pulsar/wiki/PIP-22%3A-Pulsar-Dead-Letter-Topic)功能。
`deadLetterTopic` | string | 否 | 为消费者定义[deadLetterTopic](/api/client/org/apache/pulsar/client/api/ConsumerBuilder.html#deadLetterPolicy-org.apache.pulsar.client.api.DeadLetterPolicy-)（默认：\{topic\}-\{subscription\}-DLQ）。激活[死信主题](https://github.com/apache/pulsar/wiki/PIP-22%3A-Pulsar-Dead-Letter-Topic)功能。
`pullMode` | boolean | 否 | 启用拉取模式（默认：false）。参见下面的"流控制"。
`negativeAckRedeliveryDelay` | int | 否 | 当消息被负面确认时，消息重新传递之前的延迟时间（以毫秒为单位）。默认值为 60000。
`token` | string | 否 | 身份验证令牌，用于浏览器 javascript 客户端

:::note

这些参数（除了 `pullMode`）适用于 WebSocket 服务的内部消费者。因此消息一旦进入接收队列就会受到重新传递设置的影响，即使客户端没有在 WebSocket 上消费。

:::

##### 接收消息

服务器将在 WebSocket 会话上推送消息：

```json
{
  "messageId": "CAMQADAA",
  "payload": "hvXcJvHW7kOSrUn17P2q71RA5SdiXwZBqw==",
  "properties": {},
  "publishTime": "2021-10-29T16:01:38.967-07:00",
  "redeliveryCount": 0,
  "encryptionContext": {
    "keys": {
      "client-rsa.pem": {
        "keyValue": "jEuwS+PeUzmCo7IfLNxqoj4h7txbLjCQjkwpaw5AWJfZ2xoIdMkOuWDkOsqgFmWwxiecakS6GOZHs94x3sxzKHQx9Oe1jpwBg2e7L4fd26pp+WmAiLm/ArZJo6JotTeFSvKO3u/yQtGTZojDDQxiqFOQ1ZbMdtMZA8DpSMuq+Zx7PqLo43UdW1+krjQfE5WD+y+qE3LJQfwyVDnXxoRtqWLpVsAROlN2LxaMbaftv5HckoejJoB4xpf/dPOUqhnRstwQHf6klKT5iNhjsY4usACt78uILT0pEPd14h8wEBidBz/vAlC/zVMEqiDVzgNS7dqEYS4iHbf7cnWVCn3Hxw==",
        "metadata": {}
      }
    },
    "param": "Tfu1PxVm6S9D3+Hk",
    "compressionType": "NONE",
    "uncompressedMessageSize": 0,
    "batchSize": {
      "empty": false,
      "present": true
    }
  }
}
```

以下是 WebSocket 消费者响应中的参数。

- 常规参数

  键 | 类型 | 必需? | 说明
  :---|:-----|:----------|:-----------
  `messageId` | string | 是 | 消息 ID
  `payload` | string | 是 | Base-64 编码的负载
  `publishTime` | string | 是 | 发布时间戳
  `redeliveryCount` | number | 是 | 此消息已传递的次数
  `properties` | 键值对 | 否 | 应用程序定义的属性
  `key` | string | 否 |  生产者设置的原始路由键
  `encryptionContext` | EncryptionContext | 否 | 消费者可用于解密接收到的消息的加密上下文
  `param` | string | 否 | 密码的初始化向量（Base64 编码）
  `batchSize` | string | 否 | 消息中的条目数（如果是批处理消息）
  `uncompressedMessageSize` | string | 否 | 压缩前的消息大小
  `compressionType` | string | 否 | 用于压缩消息负载的算法

- `encryptionContext` 相关参数

  键 | 类型 | 必需? | 说明
  :---|:-----|:----------|:-----------
  `keys` |key-EncryptionKey 对 | 是 | `key-EncryptionKey` 对中的键是加密密钥名称。`key-EncryptionKey` 对中的值是加密密钥对象。

- `encryptionKey` 相关参数

  键 | 类型 | 必需? | 说明
  :---|:-----|:----------|:-----------
  `keyValue` | string | 是 | 加密密钥（Base64 编码）
  `metadata` | 键值对 | 否 | 应用程序定义的元数据

#### 确认消息

消费者需要确认消息的成功处理，以便 Pulsar broker 删除它。

```json
{
  "messageId": "CAAQAw=="
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`messageId`| string | 是 | 已处理消息的消息 ID

#### 负面确认消息

```json
{
  "type": "negativeAcknowledge",
  "messageId": "CAAQAw=="
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`messageId`| string | 是 | 已处理消息的消息 ID

#### 流控制

##### 推送模式

默认情况下（`pullMode=false`），消费者端点将使用 `receiverQueueSize` 参数来调整其内部接收队列的大小，并限制传递给 WebSocket 客户端的未确认消息的数量。在此模式下，如果你不发送确认，Pulsar WebSocket 服务在向 WebSocket 客户端发送的未确认消息数量达到 `receiverQueueSize` 后将停止发送消息。

##### 拉取模式

如果将 `pullMode` 设置为 `true`，WebSocket 客户端需要发送 `permit` 命令以允许 Pulsar WebSocket 服务发送更多消息。

```json
{
  "type": "permit",
  "permitMessages": 100
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`type`| string | 是 | 命令类型。必须是 `permit`
`permitMessages`| int | 是 | 允许的消息数量

> 在此模式下，可以在不同的连接中确认消息。

#### 检查是否到达主题末尾

消费者可以通过发送 `isEndOfTopic` 请求来检查是否已到达主题末尾。

**请求**

```json
{
  "type": "isEndOfTopic"
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`type`| string | 是 | 命令类型。必须是 `isEndOfTopic`

**响应**

```json
{
   "endOfTopic": "true/false"
 }
```

### 读取器端点

读取器端点要求你在 URL 中指定租户、命名空间和主题：

```http
ws://broker-service-url:8080/ws/v2/reader/persistent/:tenant/:namespace/:topic
```

##### 查询参数

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`readerName` | string | 否 | 读取器名称
`receiverQueueSize` | int | 否 | 消费者接收队列的大小（默认：1000）
`messageId` | int 或枚举 | 否 | 开始的消息 ID，`earliest` 或 `latest`（默认：`latest`）
`token` | string | 否 | 身份验证令牌，用于浏览器 javascript 客户端

##### 接收消息

服务器将在 WebSocket 会话上推送消息：

```json
{
  "messageId": "CAAQAw==",
  "payload": "SGVsbG8gV29ybGQ=",
  "properties": {"key1": "value1", "key2": "value2"},
  "publishTime": "2016-08-30 16:45:57.785",
  "redeliveryCount": 4
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`messageId` | string | 是 | 消息 ID
`payload` | string | 是 | Base-64 编码的负载
`publishTime` | string | 是 | 发布时间戳
`redeliveryCount` | number | 是 | 此消息已传递的次数
`properties` | 键值对 | 否 | 应用程序定义的属性
`key` | string | 否 |  生产者设置的原始路由键

#### 确认消息

**在 WebSocket 中**，读取器需要确认消息的成功处理，以便 Pulsar WebSocket 服务更新待处理消息的数量。如果你不发送确认，Pulsar WebSocket 服务在达到 `pendingMessages` 限制后将停止发送消息。

```json
{
  "messageId": "CAAQAw=="
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`messageId`| string | 是 | 已处理消息的消息 ID

#### 检查是否到达主题末尾

消费者可以通过发送 `isEndOfTopic` 请求来检查是否已到达主题末尾。

**请求**

```json
{
  "type": "isEndOfTopic"
}
```

键 | 类型 | 必需? | 说明
:---|:-----|:----------|:-----------
`type`| string | 是 | 命令类型。必须是 `isEndOfTopic`

**响应**

```json
{
   "endOfTopic": "true/false"
 }
```

### 错误代码

如果发生错误，服务器将使用以下错误代码关闭 WebSocket 会话：

错误代码 | 错误消息
:----------|:-------------
1 | 创建生产者失败
2 | 订阅失败
3 | 从 JSON 反序列化失败
4 | 序列化为 JSON 失败
5 | 身份验证客户端失败
6 | 客户端未授权
7 | 负载编码无效
8 | 未知错误

> 应用程序负责在退避期后重新建立新的 WebSocket 会话。

## 客户端示例

下面你将找到 Pulsar WebSocket API 在 [Python](#python) 和 [Node.js](#nodejs) 中的代码示例。

### Python

此示例使用 [`websocket-client`](https://pypi.python.org/pypi/websocket-client) 包。你可以使用 [pip](https://pypi.python.org/pypi/pip) 安装它：

```shell
pip install websocket-client
```

你也可以从 [PyPI](https://pypi.python.org/pypi/websocket-client) 下载它。

#### Python 生产者

这是一个 Python 生产者示例，向 Pulsar [主题](reference-terminology.md#topic) 发送简单消息：

```python
import websocket, base64, json

# 如果将 enableTLS 设置为 true，你必须在 conf/websocket.conf 中将 tlsEnabled 设置为 true。
enable_TLS = False
scheme = 'ws'
if enable_TLS:
    scheme = 'wss'

TOPIC = scheme + '://localhost:8080/ws/v2/producer/persistent/public/default/my-topic'

ws = websocket.create_connection(TOPIC)

# 编码消息
s = "Hello World"
firstEncoded = s.encode("UTF-8")
binaryEncoded = base64.b64encode(firstEncoded)
payloadString = binaryEncoded.decode('UTF-8')

# 以 JSON 形式发送一条消息
ws.send(json.dumps({
    'payload' : payloadString,
    'properties': {
        'key1' : 'value1',
        'key2' : 'value2'
    },
    'context' : 5
}))

response =  json.loads(ws.recv())
if response['result'] == 'ok':
    print( 'Message published successfully')
else:
    print('Failed to publish message:', response)
ws.close()
```

#### Python 消费者

这是一个 Python 消费者示例，监听 Pulsar 主题并在消息到达时打印消息 ID：

```python
import websocket, base64, json

# 如果将 enableTLS 设置为 true，你必须在 conf/websocket.conf 中将 tlsEnabled 设置为 true。
enable_TLS = False
scheme = 'ws'
if enable_TLS:
    scheme = 'wss'

TOPIC = scheme + '://localhost:8080/ws/v2/consumer/persistent/public/default/my-topic/my-sub'

ws = websocket.create_connection(TOPIC)

while True:
    msg = json.loads(ws.recv())
    if not msg: break

    print( "Received: {} - payload: {}".format(msg, base64.b64decode(msg['payload'])))

    # 确认成功处理
    ws.send(json.dumps({'messageId' : msg['messageId']}))

ws.close()
```

#### Python 读取器

这是一个 Python 读取器示例，监听 Pulsar 主题并在消息到达时打印消息 ID：

```python
import websocket, base64, json

# 如果将 enableTLS 设置为 true，你必须在 conf/websocket.conf 中将 tlsEnabled 设置为 true。
enable_TLS = False
scheme = 'ws'
if enable_TLS:
    scheme = 'wss'

TOPIC = scheme + '://localhost:8080/ws/v2/reader/persistent/public/default/my-topic'
ws = websocket.create_connection(TOPIC)

while True:
    msg = json.loads(ws.recv())
    if not msg: break

    print ( "Received: {} - payload: {}".format(msg, base64.b64decode(msg['payload'])))

    # 确认成功处理
    ws.send(json.dumps({'messageId' : msg['messageId']}))

ws.close()
```

### Node.js

此示例使用 [`ws`](https://websockets.github.io/ws/) 包。你可以使用 [npm](https://www.npmjs.com/) 安装它：

```shell
npm install ws
```

#### Node.js 生产者

这是一个 Node.js 生产者示例，向 Pulsar 主题发送简单消息：

```javascript
const WebSocket = require('ws');

// 如果将 enableTLS 设置为 true，你必须在 conf/websocket.conf 中将 tlsEnabled 设置为 true。
const enableTLS = false;
const topic = `${enableTLS ? 'wss' : 'ws'}://localhost:8080/ws/v2/producer/persistent/public/default/my-topic`;
const ws = new WebSocket(topic);

var message = {
  "payload" : new Buffer("Hello World").toString('base64'),
  "properties": {
    "key1" : "value1",
    "key2" : "value2"
  },
  "context" : "1"
};

ws.on('open', function() {
  // 发送一条消息
  ws.send(JSON.stringify(message));
});

ws.on('message', function(message) {
  console.log('received ack: %s', message);
});
```

#### Node.js 消费者

这是一个 Node.js 消费者示例，监听上面生产者使用的同一主题：

```javascript
const WebSocket = require('ws');

// 如果将 enableTLS 设置为 true，你必须在 conf/websocket.conf 中将 tlsEnabled 设置为 true。
const enableTLS = false;
const topic = `${enableTLS ? 'wss' : 'ws'}://localhost:8080/ws/v2/consumer/persistent/public/default/my-topic/my-sub`;
const ws = new WebSocket(topic);

ws.on('message', function(message) {
    var receiveMsg = JSON.parse(message);
    console.log('Received: %s - payload: %s', message, new Buffer(receiveMsg.payload, 'base64').toString());
    var ackMsg = {"messageId" : receiveMsg.messageId};
    ws.send(JSON.stringify(ackMsg));
});
```

#### NodeJS 读取器

```javascript
const WebSocket = require('ws');

// 如果将 enableTLS 设置为 true，你必须在 conf/websocket.conf 中将 tlsEnabled 设置为 true。
const enableTLS = false;
const topic = `${enableTLS ? 'wss' : 'ws'}://localhost:8080/ws/v2/reader/persistent/public/default/my-topic`;
const ws = new WebSocket(topic);

ws.on('message', function(message) {
    var receiveMsg = JSON.parse(message);
    console.log('Received: %s - payload: %s', message, new Buffer(receiveMsg.payload, 'base64').toString());
    var ackMsg = {"messageId" : receiveMsg.messageId};
    ws.send(JSON.stringify(ackMsg));
});
```