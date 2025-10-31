---
author: Matteo Merli
authorURL: https://twitter.com/merlimat
title: "Apache Pulsar 2.3.0"
---

Apache Pulsar PMC 很高兴地宣布 Pulsar 2.3.0 的发布。这是
社区巨大努力的结果，包含超过 480 个提交和
一长列新功能、通用改进和错误修复。

这些改进涵盖了 Pulsar 的所有组件，
从新的消息传递功能，到改进的 Pulsar Functions
和 Pulsar IO 的可用性。

查看官方的<b>[发布说明](/release-notes/#2.3.0)</b>获取
更改的详细列表，包含相关 pull-requests、
讨论和文档的链接。

关于引入的新功能，我只想在这里突出其中的一小部分：

<!--truncate-->

### Kubernetes 中的 Pulsar 函数

现在可以使用 Kubernetes 作为 Pulsar Functions 的调度器。

当 Pulsar 集群配置为使用 Kubernetes 时，提交一个
函数，使用 CLI 工具或 REST API，将导致函数实例
作为 Kubernetes pods 提交，而不是作为进程
或线程在 Pulsar functions worker 内运行。

使用这个运行时管理器，可以设置 CPU/内存的配额，
并让 Kubernetes 分配所需的资源并在不同实例和函数之间强制执行隔离。

### 新的 Pulsar IO 连接器：

添加了一批新的连接器，包括 MongoDB、Elastic Search、
HBase 和本地文件源和接收器。

我们引入了对使用 [Debezium](https://debezium.io/) 进行[变更数据捕获](https://en.wikipedia.org/wiki/Change_data_capture)
的支持。这允许将数据库的所有更新记录到 Pulsar 主题中，并用于复制、
流作业、缓存更新等。

使用 Pulsar IO，Debezium 将作为常规的 Pulsar IO 源运行，
完全由 Pulsar 管理。用户可以轻松地向 Pulsar 集群提交 Debezium
内置连接器，并开始从一长列支持的数据库中获取数据，如 MySQL、MongoDB、
PostgreSQL、Oracle 和 SQL Server。

查看 [Debezium 连接器](/docs/io-cdc)文档了解如何
开始捕获数据库更改。

### Token 认证

Token 认证为 Pulsar 提供了一种非常简单和安全的认证方法。
这是基于 [JSON Web Tokens](https://jwt.io/) 的。

使用 token 认证，客户端只需要提供一个凭据，或"token"，形式为由系统管理员或某些自动化服务提供的不透明字符串。

使用 token 认证的客户端的 Java 代码如下：

```java

PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://broker.example.com:6650/")
    .authentication(
        AuthenticationFactory.token("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY")
    .build());

```

查看[使用 token 的客户端认证](/docs/security-token-client)获取完整的
 walkthrough 以及如何设置和管理的说明。

### Python 客户端库中的 Schema 支持

这个功能添加了一种 Python 惯用方式来声明生产者或消费者的 schema，
并直接与 Pulsar schema 注册中心集成。

```python

import pulsar
from pulsar.schema import *

class Example(Record):
    a = String()
    b = Integer()
    c = Boolean()

producer = client.create_producer(
                    topic='my-topic',
                    schema=AvroSchema(Example) )

producer.send(Example(a='Hello', b=1))

```

上面的例子将使生产者的 `Example` schema 在我们尝试在 `my-topic` 上发布时被 broker 验证。如果
主题有一个不兼容的 schema，生产者创建将
失败。

目前，Python schema 支持 Avro 和 JSON，除了
常规类型如 `str` 和 `bytes`。

完整的文档可在 [Python schema](/docs/client-libraries-python/#schema) 获取。

### Python 中的函数状态 API

从 2.3.0 开始，Python 函数可以以与 Java 函数类似的方式
通过上下文对象访问状态。

```python

import pulsar

# 经典的 ExclamationFunction 在输入末尾添加感叹号
class WordCountFunction(pulsar.Function):
    def process(self, input, context):
        for word in input.split():
            context.incr_counter(word, 1)
        return input + "!"

```

上下文对象中可用的状态管理方法有：

```python

def incr_counter(self, key, amount):
  """在托管状态中递增给定键的计数器"""

def get_counter(self, key):
  """在托管状态中获取给定键的计数器"""

def put_state(self, key, value):
  """在托管状态中更新给定键的值"""

def get_state(self, key):
  """在托管状态中获取给定键的值"""

```

## 结论

请[下载](/download) Pulsar 2.3.0 并向我们的邮件列表、
slack 频道或 Github 页面报告反馈、问题或任何评论。（[联系页面](/contact)）