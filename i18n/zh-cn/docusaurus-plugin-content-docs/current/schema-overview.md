---
id: schema-overview
title: Overview
sidebar_label: "Overview"
description: Get a comprehensive understanding of Pulsar schema.
---

## 定义

Pulsar 消息以非结构化字节数组形式存储，数据结构（也称为 Schema）仅在读取时应用于这些数据。因此，生产者和消费者需要就消息的数据结构达成一致，包括字段及其相关类型。

Pulsar Schema 是定义如何将原始消息字节转换为更正式结构类型的元数据，它作为生成消息的应用程序和消费消息的应用程序之间的协议。它在将数据发布到 Topic 之前将数据序列化为原始字节，并在将原始字节交付给消费者之前将其反序列化。

Pulsar 使用 Schema 注册中心作为中央存储库来存储已注册的 Schema 信息，这使得生产者/消费者可以通过 Broker 协调 Topic 消息的 Schema。

![Pulsar schema](/assets/schema.svg)

:::note

目前，Pulsar Schema 可用于 [Java 客户端](client-libraries-java.md)、[Go 客户端](client-libraries-go.md)、[Python 客户端](client-libraries-python.md)、[Node.js 客户端](client-libraries-node.md)、[C++ 客户端](client-libraries-cpp.md) 和 [C# 客户端](client-libraries-dotnet.md)。

:::

## 优势

在任何围绕消息传递和流系统构建的应用程序中，类型安全都极其重要。原始字节在数据传输方面很灵活，但这种灵活性和中立性是有代价的：你必须叠加数据类型检查和序列化/反序列化，以确保输入系统的字节可以被读取并成功消费。换句话说，你需要确保数据对应用程序来说是可理解和可用的。

Pulsar Schema 通过以下能力解决了这些痛点：
* 当 Topic 定义了 Schema 时，强制执行数据类型安全。因此，只有当生产者/消费者使用"兼容"的 Schema 时，才允许它们连接。
* 为存储组织内使用的 Schema 信息提供中央位置，从而大大简化了跨应用团队共享此信息。
* 作为所有服务和开发团队中使用的所有消息 Schema 的单一事实来源，使它们更容易协作。
* 保持 Schema 版本之间的数据兼容性。当上传新的 Schema 时，旧版本的消费者可以读取新版本。
* 存储在现有存储层 BookKeeper 中，无需额外的系统。

## 工作流程

Pulsar Schema 在 **Topic** 级别应用和执行。生产者和消费者可以向 Broker 上传 Schema，因此 Pulsar Schema 在两端都起作用。

### 生产者端

此图说明了 Pulsar Schema 在生产者端是如何工作的。

![Workflow of Pulsar schema on the producer side](/assets/schema-producer.svg)

以下是每个步骤的说明。

1. 应用程序使用 Schema 实例来构造生产者实例。
   Schema 实例定义了使用生产者实例生成的数据的 Schema。以 Avro 为例，Pulsar 从 POJO 类中提取 Schema 定义并构造 `SchemaInfo`。

2. 生产者请求使用从传入的 Schema 实例中提取的 `SchemaInfo` 连接到 Broker。

3. Broker 查找 Schema 注册中心以检查它是否是已注册的 Schema。
   * 如果 Schema 已注册，Broker 将 Schema 版本返回给生产者。
   * 否则，转到步骤 4。

4. Broker 检查 Schema 是否可以自动更新。
   * 如果不允许自动更新，则无法注册 Schema，Broker 拒绝生产者。
   * 否则，转到步骤 5。

5. Broker 执行为 Topic 定义的 [Schema 兼容性检查](schema-understand.md#schema-compatibility-check)。
   * 如果 Schema 通过了兼容性检查，Broker 将其存储在 Schema 注册中心中，并将 Schema 版本返回给生产者。此生产者生成的所有消息都标记有 Schema 版本。
   * 否则，Broker 拒绝生产者。

### 消费者端

此图说明了 Schema 在消费者端是如何工作的。

![Workflow of Pulsar schema on the consumer side](/assets/schema-consumer.svg)

以下是每个步骤的说明。

1. 应用程序使用 Schema 实例来构造消费者实例。

2. 消费者使用从传入的 Schema 实例中提取的 `SchemaInfo` 连接到 Broker。

3. Broker 检查 Topic 是否正在使用（至少具有以下对象之一：Schema、数据、活跃的生产者或消费者）。
   * 如果 Topic 具有至少一个上述对象，转到步骤 5。
   * 否则，转到步骤 4。

4. Broker 检查 Schema 是否可以自动更新。
     * 如果 Schema 可以自动更新，Broker 注册 Schema 并连接消费者。
     * 否则，Broker 拒绝消费者。

5. Broker 执行 [Schema 兼容性检查](schema-understand.md#schema-compatibility-check)。
     * 如果 Schema 通过了兼容性检查，Broker 连接消费者。
     * 否则，Broker 拒绝消费者。

## 用例

在构造和处理消息时，你可以使用特定语言的数据类型，从像 `string` 这样的简单数据类型到更复杂的应用程序特定类型。

例如，你使用 _User_ 类来定义发送到 Pulsar Topic 的消息。

```java
public class User {
   public String name;
   public int age;

   User() {}

   User(String name, int age) {
      this.name = name;
      this.age = age;
   }
}
```

**不使用 Schema**

如果你构造生产者时没有指定 Schema，那么生产者只能生成 `byte[]` 类型的消息。如果你有一个 POJO 类，你需要在发送消息之前将 POJO 序列化为字节。

```java
Producer<byte[]> producer = client.newProducer()
        .topic(topic)
        .create();
User user = new User("Tom", 28);
byte[] message = … // 自己序列化 `user`；
producer.send(message);
```

**使用 Schema**

此示例使用 _JSONSchema_ 构造生产者，你可以直接将 _User_ 类发送到 Topic，而无需担心如何将 POJO 序列化为字节。

```java
// 使用 json schema 发送
Producer<User> producer = client.newProducer(JSONSchema.of(User.class))
        .topic(topic)
        .create();
User user = new User("Tom", 28);
producer.send(user);

// 使用 json schema 接收
Consumer<User> consumer = client.newConsumer(JSONSchema.of(User.class))
   .topic(schemaTopic)
   .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
   .subscriptionName("schema-sub")
   .subscribe();
Message<User> message = consumer.receive();
User user = message.getValue();
assert user.age == 28 && user.name.equals("Tom");
```

## 下一步是什么？

* [了解 Schema 概念](schema-understand.md)
* [Schema 入门](schema-get-started.md)
* [管理 Schema](admin-api-schemas.md)