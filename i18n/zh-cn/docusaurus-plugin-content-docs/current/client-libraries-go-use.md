---
id: client-libraries-go-use
title: 使用 Pulsar Go 客户端
sidebar_label: "使用"
description: 学习如何在 Pulsar 中使用 Go 客户端。
---


## 创建生产者

您可以使用 `ProducerOptions` 对象[配置](#producer-configuration)Go 生产者。以下是一个示例：

```go
producer, err := client.CreateProducer(pulsar.ProducerOptions{
    Topic: "my-topic",
})

if err != nil {
    log.Fatal(err)
}

_, err = producer.Send(context.Background(), &pulsar.ProducerMessage{
    Payload: []byte("hello"),
})

defer producer.Close()

if err != nil {
    fmt.Println("Failed to publish message", err)
}
fmt.Println("Published message")
```

有关 `Producer` 接口的所有可用方法，请参阅[此处](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#Producer)。

### 监控

Pulsar Go 客户端使用 Prometheus 注册客户端指标。本节演示如何创建一个简单的 Pulsar 生产者应用程序，通过 HTTP 暴露 Prometheus 指标。

1. 编写一个简单的生产者应用程序。

```go
// 创建 Pulsar 客户端
client, err := pulsar.NewClient(pulsar.ClientOptions{
    URL: "pulsar://localhost:6650",
})
if err != nil {
    log.Fatal(err)
}

defer client.Close()

// 为 Prometheus 指标启动一个单独的 goroutine
// 在这种情况下，可以通过 http://localhost:2112/metrics 访问 Prometheus 指标
go func() {
    prometheusPort := 2112
    log.Printf("Starting Prometheus metrics at http://localhost:%v/metrics\n", prometheusPort)
    http.Handle("/metrics", promhttp.Handler())
    err = http.ListenAndServe(":"+strconv.Itoa(prometheusPort), nil)
    if err != nil {
        log.Fatal(err)
    }
}()

// 创建生产者
producer, err := client.CreateProducer(pulsar.ProducerOptions{
    Topic: "topic-1",
})
if err != nil {
    log.Fatal(err)
}

defer producer.Close()

ctx := context.Background()

// 在此处编写您的业务逻辑
// 在这种情况下，您构建一个简单的 Web 服务器。您可以通过请求 http://localhost:8082/produce 来生产消息
webPort := 8082
http.HandleFunc("/produce", func(w http.ResponseWriter, r *http.Request) {
    msgId, err := producer.Send(ctx, &pulsar.ProducerMessage{
        Payload: []byte(fmt.Sprintf("hello world")),
    })
    if err != nil {
        log.Fatal(err)
    } else {
        log.Printf("Published message: %v", msgId)
        fmt.Fprintf(w, "Published message: %v", msgId)
    }
})

err = http.ListenAndServe(":"+strconv.Itoa(webPort), nil)
if err != nil {
    log.Fatal(err)
}
```

2. 要从应用程序抓取指标，请使用配置文件（`prometheus.yml`）配置本地运行的 Prometheus 实例。

```yaml
scrape_configs:
- job_name: pulsar-client-go-metrics
  scrape_interval: 10s
  static_configs:
  - targets:
  - localhost:2112
```

## 创建消费者

Pulsar 消费者订阅一个或多个 Pulsar Topic，并监听在该 Topic（或多个 Topic）上产生的传入消息。您可以使用 `ConsumerOptions` 对象配置 Go 消费者。

以下是使用通道的基本示例：

```go
consumer, err := client.Subscribe(pulsar.ConsumerOptions{
    Topic:            "topic-1",
    SubscriptionName: "my-sub",
    Type:             pulsar.Shared,
})
if err != nil {
    log.Fatal(err)
}
defer consumer.Close()

for i := 0; i < 10; i++ {
    // 可能会在此处阻塞
    msg, err := consumer.Receive(context.Background())
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Received message msgId: %#v -- content: '%s'\n",
        msg.ID(), string(msg.Payload()))

    consumer.Ack(msg)
}

if err := consumer.Unsubscribe(); err != nil {
    log.Fatal(err)
}
```

有关 `Consumer` 接口的所有可用方法，请参阅[此处](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#Consumer)。

### 创建单 Topic 消费者

```go
client, err := pulsar.NewClient(pulsar.ClientOptions{URL: "pulsar://localhost:6650"})
if err != nil {
    log.Fatal(err)
}

defer client.Close()

consumer, err := client.Subscribe(pulsar.ConsumerOptions{
    // 填充 `Topic` 字段将创建单 Topic 消费者
    Topic:            "topic-1",
    SubscriptionName: "my-sub",
    Type:             pulsar.Shared,
})
if err != nil {
    log.Fatal(err)
}
defer consumer.Close()
```

### 创建正则表达式 Topic 消费者

```go
client, err := pulsar.NewClient(pulsar.ClientOptions{
    URL: "pulsar://localhost:6650",
})
defer client.Close()

topicsPattern := "persistent://public/default/topic.*"
opts := pulsar.ConsumerOptions{
    // 填充 `TopicsPattern` 字段将创建正则表达式消费者
    TopicsPattern:    topicsPattern,
    SubscriptionName: "regex-sub",
}

consumer, err := client.Subscribe(opts)
if err != nil {
    log.Fatal(err)
}
defer consumer.Close()
```

### 监控

在本指南中，本节演示如何创建一个简单的 Pulsar 消费者应用程序，通过 HTTP 暴露 Prometheus 指标。

1. 编写一个简单的消费者应用程序。

```go
// 创建 Pulsar 客户端
client, err := pulsar.NewClient(pulsar.ClientOptions{
    URL: "pulsar://localhost:6650",
})
if err != nil {
    log.Fatal(err)
}

defer client.Close()

// 为 Prometheus 指标启动一个单独的 goroutine
// 在这种情况下，可以通过 http://localhost:2112/metrics 访问 Prometheus 指标
go func() {
    prometheusPort := 2112
    log.Printf("Starting Prometheus metrics at http://localhost:%v/metrics\n", prometheusPort)
    http.Handle("/metrics", promhttp.Handler())
    err = http.ListenAndServe(":"+strconv.Itoa(prometheusPort), nil)
    if err != nil {
        log.Fatal(err)
    }
}()

// 创建消费者
consumer, err := client.Subscribe(pulsar.ConsumerOptions{
    Topic:            "topic-1",
    SubscriptionName: "sub-1",
    Type:             pulsar.Shared,
})
if err != nil {
    log.Fatal(err)
}

defer consumer.Close()

ctx := context.Background()

// 在此处编写您的业务逻辑
// 在这种情况下，您构建一个简单的 Web 服务器。您可以通过请求 http://localhost:8083/consume 来消费消息
webPort := 8083
http.HandleFunc("/consume", func(w http.ResponseWriter, r *http.Request) {
    msg, err := consumer.Receive(ctx)
    if err != nil {
        log.Fatal(err)
    } else {
        log.Printf("Received message msgId: %v -- content: '%s'\n", msg.ID(), string(msg.Payload()))
        fmt.Fprintf(w, "Received message msgId: %v -- content: '%s'\n", msg.ID(), string(msg.Payload()))
        consumer.Ack(msg)
    }
})

err = http.ListenAndServe(":"+strconv.Itoa(webPort), nil)
if err != nil {
    log.Fatal(err)
}
```

2. 要从应用程序抓取指标，请使用配置文件（`prometheus.yml`）配置本地运行的 Prometheus 实例。

```yaml
scrape_configs:
- job_name: pulsar-client-go-metrics
  scrape_interval: 10s
  static_configs:
  - targets:
  - localhost: 2112
```

## 创建读取器

Pulsar 读取器处理来自 Pulsar Topic 的消息。读取器与消费者不同，因为使用读取器时，您需要明确指定要从流中的哪条消息开始（而消费者会自动从最近未确认的消息开始）。您可以使用 `ReaderOptions` 对象[配置](#reader-configuration)Go 读取器。以下是一个示例：

```go
reader, err := client.CreateReader(pulsar.ReaderOptions{
    Topic:          "topic-1",
    StartMessageID: pulsar.EarliestMessageID(),
})
if err != nil {
    log.Fatal(err)
}
defer reader.Close()
```

有关 `Reader` 接口的所有可用方法，请参阅[此处](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar#Reader)。