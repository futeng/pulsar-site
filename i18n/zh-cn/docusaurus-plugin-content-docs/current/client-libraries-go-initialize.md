---
id: client-libraries-go-initialize
title: 初始化 Pulsar Go 客户端
sidebar_label: "初始化"
description: 学习如何在 Pulsar 中初始化 Go 客户端。
---

要与 Pulsar 交互，首先需要一个 [`Client`](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#Client) 对象。

您可以使用 [`NewClient`](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#NewClient) 函数创建客户端对象，传入一个 [`ClientOptions`](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#ClientOptions) 对象。

以下是一个示例：

```go
import (
    "log"
    "time"

    "github.com/apache/pulsar-client-go/pulsar"
)

func main() {
    client, err := pulsar.NewClient(pulsar.ClientOptions{
        URL:               "pulsar://localhost:6650",
        OperationTimeout:  30 * time.Second,
        ConnectionTimeout: 30 * time.Second,
    })
    if err != nil {
        log.Fatalf("无法实例化 Pulsar 客户端: %v", err)
    }

    defer client.Close()
}
```

如果您有多个 broker，可以按以下方式初始化客户端对象。

```go
import (
    "log"
    "time"
    "github.com/apache/pulsar-client-go/pulsar"
)

func main() {
    client, err := pulsar.NewClient(pulsar.ClientOptions{
        URL: "pulsar://localhost:6650,localhost:6651,localhost:6652",
        OperationTimeout:  30 * time.Second,
        ConnectionTimeout: 30 * time.Second,
    })
    if err != nil {
        log.Fatalf("无法实例化 Pulsar 客户端: %v", err)
    }

    defer client.Close()
}
```

有关所有可配置参数，请参阅 [`ClientOptions`](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#ClientOptions)。