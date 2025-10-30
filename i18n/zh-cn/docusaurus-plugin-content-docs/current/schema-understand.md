---
id: schema-understand
title: Understand schema
sidebar_label: "Understand schema"
description: Get a comprehensive understanding of Pulsar schemas.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


本节解释 Pulsar Schema 的基本概念并提供额外的参考。

## Schema 定义

Pulsar Schema 在一个名为 `SchemaInfo` 的数据结构中定义。它按 Topic 的基础存储和执行，不能在命名空间或租户级别存储。

这是 `SchemaInfo` 的字符串示例。

```json
{
    "name": "test-string-schema",
    "type": "STRING",
    "schema": "",
    "properties": {}
}
```

下表概述了每个 `SchemaInfo` 包含的字段。

|  字段  |   描述  |
| --- | --- |
|  `name`  |   Schema 名称（字符串）。  |
|  `type`  |   [Schema 类型](#schema-type)，决定如何序列化和反序列化 Schema 数据。 |
|  `schema`  |   Schema 数据，是一个 8 位无符号字节序列和特定的 Schema 类型。  |
|  `properties`  |   用户定义的属性，作为字符串/字符串映射，可以被应用程序用来承载任何应用程序特定的逻辑。  |

## Schema 类型

Pulsar 支持各种 Schema 类型，主要分为以下类别：
* [原始类型](#primitive-type)
* [复杂类型](#complex-type)
* [自动 Schema](#auto-schema)

### 原始类型

下表概述了 Pulsar Schema 支持的原始类型，以及 **Schema 类型**和**特定语言的原始类型**之间的转换。

| 原始类型 | 描述 | Java 类型| Python 类型 | Go 类型 | C++ 类型 | C# 类型|
|---|---|---|---|---|---|---|
| `BOOLEAN` | 二进制值。 | boolean | bool | bool | bool | bool |
| `INT8` | 8 位有符号整数。 | int | int | int8 | int8_t | byte |
| `INT16` | 16 位有符号整数。 | int | int | int16 | int16_t | short |
| `INT32` | 32 位有符号整数。 | int | int | int32 | int32_t | int |
| `INT64` | 64 位有符号整数。 | int | int | int64 | int64_t | long |
| `FLOAT` | 单精度（32 位）IEEE 754 浮点数。 | float | float | float32 | float | float |
| `DOUBLE` | 双精度（64 位）IEEE 754 浮点数。 | double | double | float64| double | double |
| `BYTES` | 8 位无符号字节序列。 | byte[], ByteBuffer, ByteBuf | bytes | []byte | void * | byte[], ReadOnlySequence&lt;byte&gt; |
| `STRING` | Unicode 字符序列。 | string | str | string| std::string | string |
| `TIMESTAMP` (`DATE`, `TIME`) |  逻辑类型表示具有毫秒精度的特定时间瞬间。<br />它将自 `1970年1月1日 00:00:00 GMT` 以来的毫秒数存储为 `INT64` 值。 |  java.sql.Timestamp (java.sql.Time, java.util.Date) | N/A | N/A | N/A | DateTime,TimeSpan |
| `INSTANT`| 时间线上具有纳秒精度的单个瞬时点。 | java.time.Instant | N/A | N/A | N/A | N/A |
| `LOCAL_DATE` | 表示日期的不可变日期时间对象，通常视为年-月-日。 | java.time.LocalDate | N/A | N/A | N/A | N/A |
| `LOCAL_TIME` | 表示时间的不可变日期时间对象，通常视为时-分-秒。时间表示为纳秒精度。 | java.time.LocalDateTime | N/A | N/A  | N/A | N/A |
| `LOCAL_DATE_TIME` | 表示日期时间的不可变日期时间对象，通常视为年-月-日-时-分-秒。 | java.time.LocalTime | N/A | N/A | N/A | N/A |

:::note

对于原始类型，Pulsar 不在 `SchemaInfo` 中存储任何 Schema 数据。一些原始 Schema 实现可以使用 `properties` 参数来存储实现特定的可调设置。例如，字符串 Schema 可以使用 `properties` 来存储用于序列化和反序列化字符串的编码字符集。

:::

有关更多说明和示例，请参阅 [构造字符串 Schema](schema-get-started.md#string)。


### 复杂类型

下表概述了 Pulsar Schema 支持的复杂类型：

| 复杂类型 | 描述 |
|---|---|
| `KeyValue` | 表示复杂的键值对。 |
| `Struct` | 表示结构化数据，包括 `AvroBaseStructSchema`、`ProtobufNativeSchema` 和 `NativeAvroBytesSchema`。 |

#### `KeyValue` Schema

`KeyValue` Schema 帮助应用程序为键和值都定义 Schema。Pulsar 将键 Schema 和值 Schema 的 `SchemaInfo` 一起存储。

Pulsar 提供以下方法来在消息中编码**单个**键值对：
* `INLINE` - 键值对在消息有效载荷中一起编码。
* `SEPARATED` - 键存储为消息键，而值存储为消息有效载荷。有关更多详细信息，请参阅 [构造键值 Schema](schema-get-started.md#keyvalue)。

#### `Struct` Schema

下表概述了 Pulsar Schema 支持的 `struct` 类型：

| 类型                    | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `AvroBaseStructSchema`  | Pulsar 使用 [Avro 规范](http://avro.apache.org/docs/current/spec.html) 来声明 `AvroBaseStructSchema` 的 Schema 定义，它支持 [`AvroSchema`](schema-get-started.md#avro)、[`JsonSchema`](schema-get-started.md#json) 和 [`ProtobufSchema`](schema-get-started.md#protobuf)。<br /><br />这允许 Pulsar：<br />- 使用相同的工具来管理 Schema 定义。<br />- 使用不同的序列化或反序列化方法来处理数据。                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `ProtobufNativeSchema`  | [`ProtobufNativeSchema`](schema-get-started.md#protobufnative) 基于 protobuf 原生描述符。<br /><br />这允许 Pulsar：<br />- 使用原生 protobuf-v3 来序列化或反序列化数据。<br />- 使用 `AutoConsume` 来反序列化数据。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `NativeAvroBytesSchema` | [`NativeAvroBytesSchema`](schema-get-started.md#native-avro) 包装原生 Avro Schema 类型 `org.apache.avro.Schema`。结果是一个 Schema 实例，它接受序列化的 Avro 有效载荷而不根据包装的 Avro Schema 验证它。<br /><br />当你从外部系统（如 Kafka 和 Cassandra）迁移或摄取事件或消息数据时，数据通常已经以 Avro 格式序列化。生成数据的应用程序通常已经根据它们的 Schema（包括兼容性检查）验证了数据，并将其存储在数据库或专用服务（如 Schema 注册中心）中。每个序列化数据记录的 Schema 通常可以通过附加到该记录的某些元数据来检索。在这种情况下，Pulsar 生产者在将摄取的事件发送到 Topic 时不需要重复 Schema 验证。它需要做的就是将每个消息或事件连同其 Schema 一起传递给 Pulsar。 |
| `AutoValueSchema`       | [`AutoValueSchema`](schema-get-started.md#auto-produce) 允许生产者以原始字节形式发送数据。它不执行任何 Schema 验证，只是将数据存储为字节。当你将数据从外部系统迁移到 Pulsar 时，这很有用，因为它允许你以原始格式发送数据，而无需担心 Schema 兼容性。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `AutoConsumeSchema`     | [`AutoConsumeSchema`](schema-get-started.md#auto-consume) 允许消费者以通用记录形式消费数据，而无需事先知道 Schema。当你从外部系统迁移数据到 Pulsar，或从具有未知 Schema 的 Topic 消费数据时，这很有用。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

Pulsar 提供以下方法来使用 `struct` Schema。
* static
* generic
* SchemaDefinition

此示例显示如何使用这些方法构造 `struct` Schema 并用它来生产和消费消息。

````mdx-code-block
<Tabs
  defaultValue="static"
  values={[{"label":"static","value":"static"},{"label":"generic","value":"generic"},{"label":"SchemaDefinition","value":"SchemaDefinition"}]}>

<TabItem value="static">

你可以预定义 `struct` Schema，它可以是 Java 中的 POJO、Go 中的 `struct`，或由 Avro 或 Protobuf 工具生成的类。

**示例**

Pulsar 使用 Avro 库从预定义的 `struct` 获取 Schema 定义。Schema 定义是作为 `SchemaInfo` 一部分存储的 Schema 数据。

1. 创建 _User_ 类来定义发送到 Pulsar Topic 的消息。

```java
   # 如果你使用 Lombok

   @Builder
   @AllArgsConstructor
   @NoArgsConstructor
   public static class User {
       public String name;
       public int age;
   }

   # 如果你不使用 Lombok，你需要像这样添加构造函数
   #
   #   public static class User {
   #    String name;
   #    int age;
   #    public User() { }
   #    public User(String name, int age) { this.name = name; this.age = age; } }
   #}
```

2. 使用 `struct` Schema 创建生产者并发送消息。

```java
   Producer<User> producer = client.newProducer(Schema.AVRO(User.class)).create();
   producer.newMessage().value(new User("pulsar-user", 1)).send();
```

3. 使用 `struct` Schema 创建消费者并接收消息

```java
   Consumer<User> consumer = client.newConsumer(Schema.AVRO(User.class)).subscribe();
   User user = consumer.receive().getValue();
```

</TabItem>
<TabItem value="generic">

有时应用程序没有预定义的结构，你可以使用此方法来定义 Schema 和访问数据。

你可以使用 `GenericSchemaBuilder` 定义 `struct` Schema，使用 `GenericRecordBuilder` 生成通用结构，并将消息消费到 `GenericRecord` 中。

**示例**

1. 使用 `RecordSchemaBuilder` 构建 Schema。

   ```java
   RecordSchemaBuilder recordSchemaBuilder = SchemaBuilder.record("schemaName");
   recordSchemaBuilder.field("intField").type(SchemaType.INT32);
   SchemaInfo schemaInfo = recordSchemaBuilder.build(SchemaType.AVRO);

   Consumer<GenericRecord> consumer = client.newConsumer(Schema.generic(schemaInfo))
        .topic(topicName)
        .subscriptionName(subscriptionName)
        .subscribe();
   Producer<GenericRecord> producer = client.newProducer(Schema.generic(schemaInfo))
        .topic(topicName)
        .create();
   ```

2. 使用 `RecordBuilder` 构建结构记录。

   ```java
   GenericSchemaImpl schema = GenericAvroSchema.of(schemaInfo);
   // 发送消息
   GenericRecord record = schema.newRecordBuilder().set("intField", 32).build();
   producer.newMessage().value(record).send();
   // 接收消息
   Message<GenericRecord> msg = consumer.receive();

   Assert.assertEquals(msg.getValue().getField("intField"), 32);
   ```

</TabItem>
<TabItem value="SchemaDefinition">

你可以使用 `SchemaDefinition` 从现有类定义 Schema。

**示例**

1. 使用 `SchemaDefinition.builder()` 定义 Schema。

   ```java
   SchemaDefinition<User> schemaDefinition = SchemaDefinition.
       builderWithType(SchemaDefinition.<User>builder()
       .withPojo(User.class)
       .withSupportSchemaVersioning(true)
       .build();

   Producer<User> producer = client.newProducer(Schema.AVRO(schemaDefinition))
        .topic(topicName)
        .create();
   Consumer<User> consumer = client.newConsumer(Schema.AVRO(schemaDefinition))
        .topic(topicName)
        .subscriptionName(subscriptionName)
        .subscribe();
   ```

2. 发送和接收消息。

   ```java
   // 发送消息
   User user = new User("pulsar-user", 1);
   producer.send(user);

   // 接收消息
   Message<User> msg = consumer.receive();
   User receivedUser = msg.getValue();
   ```

</TabItem>
</Tabs>
````

### 自动 Schema

自动 Schema 允许你以原始字节形式发送和接收数据，而无需定义 Schema。当你将数据从外部系统迁移到 Pulsar 时，这很有用，因为它允许你以原始格式发送数据，而无需担心 Schema 兼容性。

有关更多说明和示例，请参阅：
* [AUTO_PRODUCE](schema-get-started.md#auto_produce)
* [AUTO_CONSUME](schema-get-started.md#auto_consume)

## Schema 兼容性检查

Schema 兼容性检查确保新 Schema 与 Topic 上的现有 Schema 兼容。这确保消费者可以继续消费使用新 Schema 生成的消息，即使它们是使用旧 Schema 编写的。

### 兼容性策略

Pulsar 支持以下兼容性策略：

| 策略 | 描述 |
|------|------|
| `BACKWARD` | 新 Schema 可以读取使用旧 Schema 编写的数据。 |
| `FORWARD` | 旧 Schema 可以读取使用新 Schema 编写的数据。 |
| `FULL` | 新 Schema 和旧 Schema 可以相互读取彼此的数据。 |
| `NONE` | 不执行兼容性检查。 |
| `AUTO` | Broker 根据当前 Topic 配置自动选择兼容性策略。 |

### 配置兼容性策略

你可以在创建 Topic 时配置兼容性策略：

```bash
bin/pulsar-admin topics create compatibility-strategy \
  --compatibility-strategy BACKWARD \
  persistent://tenant/namespace/topic
```

或者，你可以在 `broker.conf` 文件中配置默认的兼容性策略：

```properties
schemaCompatibilityStrategy=BACKWARD
```

## Schema 演进

Schema 演进允许你随着时间的推移更改 Schema，同时保持与现有消费者和生产者的兼容性。

### 支持的演进操作

以下演进操作在 `BACKWARD` 兼容性下支持：

* **添加字段**：可以添加可选字段或具有默认值的字段。
* **删除字段**：可以删除可选字段。
* **更改字段类型**：可以更改为更宽泛的类型（例如，从 `INT32` 到 `INT64`）。
* **重命名字段**：可以使用别名重命名字段。

### 演进示例

假设你有以下 Schema：

```json
{
  "type": "record",
  "name": "User",
  "fields": [
    {"name": "name", "type": "string"},
    {"name": "age", "type": "int"}
  ]
}
```

你可以将其演进为以下向后兼容的 Schema：

```json
{
  "type": "record",
  "name": "User",
  "fields": [
    {"name": "name", "type": "string"},
    {"name": "age", "type": "int"},
    {"name": "email", "type": ["null", "string"], "default": null}
  ]
}
```

## Schema 注册中心

Schema 注册中心是 Pulsar 中存储和管理 Schema 的中央组件。它提供以下功能：

* **存储 Schema**：存储 Schema 定义和版本信息。
* **版本控制**：跟踪 Schema 版本和演进历史。
* **兼容性检查**：在注册新 Schema 时执行兼容性检查。
* **检索 Schema**：允许生产者和消费者检索 Schema 信息。

### 架构

Schema 注册中心构建在 BookKeeper 之上，提供高可用性和持久性。每个 Topic 的 Schema 信息存储在专用的 Ledger 中。

### 配置

可以在 `broker.conf` 文件中配置 Schema 注册中心设置：

```properties
# 启用 Schema 注册中心
schemaRegistryStorageClassName=org.apache.pulsar.broker.service.schema.BookkeeperSchemaStorageFactory

# 兼容性策略
schemaCompatibilityStrategy=BACKWARD

# 是否允许 Schema 自动更新
isAllowAutoUpdateSchema=true
```

## 最佳实践

* **使用强类型 Schema**：尽可能使用强类型 Schema（如 Avro、JSON、Protobuf）而不是原始字节。
* **版本化你的 Schema**：为 Schema 版本使用清晰的命名约定。
* **测试兼容性**：在生产环境中部署新 Schema 之前，测试兼容性。
* **文档化你的 Schema**：为你的 Schema 提供清晰的文档和字段描述。
* **监控 Schema 使用**：监控 Schema 注册中心的使用情况和性能。

## 故障排除

### 常见问题

1. **Schema 兼容性错误**：
   * 检查 Schema 兼容性策略设置。
   * 验证新 Schema 是否符合兼容性规则。

2. **Schema 注册失败**：
   * 检查 Broker 日志中的错误信息。
   * 验证 Schema 语法是否正确。

3. **序列化/反序列化错误**：
   * 确保生产者和消费者使用相同的 Schema。
   * 检查数据是否与 Schema 定义匹配。