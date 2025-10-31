---
author: Penghui Li
authorURL: https://twitter.com/lipenghui6
title: "Apache Pulsar 2.4.0"
---

我们很高兴地发布 Apache Pulsar 2.4.0。这是社区巨大努力的结果，
包含超过 460 个提交和一长列新功能、通用改进和错误修复。

查看<b>[发布说明](/release-notes/#2.4.0)</b>获取更改的详细列表，
包含相关 pull requests、讨论和文档的链接。

关于引入的新功能，我只想在这里突出其中的一小部分：

<!--truncate-->

### 延迟消息传递

现在可以通过 Pulsar 生产者发送延迟消息，延迟消息将在
延迟时间后可用。

使用延迟消息传递的客户端的 Java 代码如下：

```java

producer.newMessage().value("delayed message").deliverAfter(10, TimeUnit.SECONDS).send()

```

:::note

1. 消息仅在共享订阅上延迟，其他订阅将立即传递。
2. 即使您在生产者上启用消息批处理，延迟消息也是单独发送的。

:::

### Go 函数

在 2.4.0 版本之前，支持使用 Java 和 Python 编写 Pulsar Functions。现在，您可以使用 Go 编写 Pulsar Functions，以下是用 Go 编写的 Pulsar Function 的示例。

```go

import (
    "fmt"
    "context"

    "github.com/apache/pulsar/pulsar-function-go/pf"
)

func HandleRequest(ctx context.Context, in []byte) error {
    fmt.Println(string(in) + "!")
    return nil
}

func main() {
    pf.Start(HandleRequest)
}

```

### 键共享订阅

2.4.0 中引入了一个新的订阅模式 `Key_shared`。在 `Key_shared` 订阅模式下，
一个分区可以有多个消费者并行消费消息，并确保具有相同键的消息按顺序分配给一个消费者。
这里是键共享的[架构](http://pulsar.apache.org/docs/en/concepts-messaging/#key_shared)。

以下是使用 `Key_shared` 订阅的示例：

```java

client.newConsumer()
        .topic("topic")
        .subscriptionType(SubscriptionType.Key_Shared)
        .subscriptionName("sub-1")
        .subscribe();

```

### Schema 版本控制

在 2.4.0 版本之前，Avro schema 对写入器 schema 和读取器 schema 使用同一个 schema。
现在支持多个 schema 版本。

使用多个 schema，生产者可以发送具有不同 schema 版本的消息，消费者可以读取具有不同 schema 的消息。

在 2.4.0 版本中，添加了 `FORWARD_TRANSITIVE`、`BACKWARD_TRANSITIVE` 和 `FULL_TRANSITIVE` 兼容性策略来检查与所有现有 schema 版本的兼容性。

### 复制订阅

在 2.4.0 版本中，添加了一种机制来在亚秒级时间范围内保持订阅状态同步，
在跨多个地理区域异步复制的主题上下文中。这里是复制订阅的[架构](https://github.com/apache/pulsar/wiki/PIP-33%3A-Replicated-subscriptions)。

以下是使用复制订阅的示例：

```java

Consumer<String> consumer = client.newConsumer(Schema.STRING)
            .topic("my-topic")
            .subscriptionName("my-subscription")
            .replicateSubscriptionState(true)
            .subscribe();

```

### 新的 IO 连接器

添加了一批新的连接器，包括 Flume、Redis sink、Solr sink、RabbitMQ sink。
以下列出了 Pulsar 支持的内置[连接器](http://pulsar.apache.org/docs/en/io-connectors/)。

### 安全

在 2.4.0 版本中，Apache Pulsar broker 和客户端支持 Kerberos。
要启用 Kerberos 认证，请参考[文档](http://pulsar.apache.org/docs/en/security-kerberos/)。

还添加了基于角色的 Pulsar Function 认证和授权。

## 结论

如果您想下载 Pulsar 2.4.0，点击[这里](/download)。您可以向我们的邮件列表发送任何问题或建议，
在 [GitHub](https://github.com/apache/pulsar) 上为 Pulsar 做出贡献，或在 [Slack](https://apache-pulsar.herokuapp.com/) 上加入 Apache Pulsar 社区。