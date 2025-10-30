---
id: schema-get-started
title: Get started
sidebar_label: "Get started"
description: Get started to construct Pulsar schemas and customize Pulsar schema storage.
---


````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


这个实践教程提供了如何构造 Schema 的说明和示例。有关管理任务的说明，请参阅 [管理 Schema](admin-api-schemas.md)。

## 构造 Schema

### bytes

此示例演示如何使用特定语言的客户端构造 [bytes schema](schema-understand.md#primitive-type)，并用它来生产和消费消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>

<TabItem value="Java">

```java
Producer<byte[]> producer = pulsarClient.newProducer(Schema.BYTES)
       .topic("my-topic")
       .create();
Consumer<byte[]> consumer = pulsarClient.newConsumer(Schema.BYTES)
       .topic("my-topic")
       .subscriptionName("my-sub")
       .subscribe();

producer.newMessage().value("message".getBytes()).send();

Message<byte[]> message = consumer.receive(5, TimeUnit.SECONDS);
```

</TabItem>
<TabItem value="C++">

```cpp
SchemaInfo schemaInfo = SchemaInfo(SchemaType::BYTES, "Bytes", "");
Producer producer;
client.createProducer("topic-bytes", ProducerConfiguration().setSchema(schemaInfo), producer);
std::array<char, 1024> buffer;
producer.send(MessageBuilder().setContent(buffer.data(), buffer.size()).build());
Consumer consumer;
res = client.subscribe("topic-bytes", "my-sub", ConsumerConfiguration().setSchema(schemaInfo), consumer);
Message msg;
consumer.receive(msg, 3000);
```

</TabItem>
<TabItem value="Python">

```python
producer = client.create_producer(
   'bytes-schema-topic',
   schema=BytesSchema())
producer.send(b"Hello")

consumer = client.subscribe(
   'bytes-schema-topic',
	'sub',
	schema=BytesSchema())
msg = consumer.receive()
data = msg.value()
```

</TabItem>
<TabItem value="Go">

```go
producer, err := client.CreateProducer(pulsar.ProducerOptions{
    Topic:  "my-topic",
    Schema: pulsar.NewBytesSchema(nil),
})
id, err := producer.Send(context.Background(), &pulsar.ProducerMessage{
    Value: []byte("message"),
})

consumer, err := client.Subscribe(pulsar.ConsumerOptions{
    Topic:            "my-topic",
    Schema:           pulsar.NewBytesSchema(nil),
    SubscriptionName: "my-sub",
    Type:             pulsar.Exclusive,
})
```

</TabItem>
</Tabs>
````

### string

此示例演示如何使用特定语言的客户端构造 [string schema](schema-understand.md#primitive-type)，并用它来生产和消费消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>

<TabItem value="Java">

   ```java
   Producer<String> producer = client.newProducer(Schema.STRING).create();
   producer.newMessage().value("Hello Pulsar!").send();

   Consumer<String> consumer = client.newConsumer(Schema.STRING).subscribe();
   Message<String> message = consumer.receive();
   ```

</TabItem>
<TabItem value="C++">

```cpp
SchemaInfo schemaInfo = SchemaInfo(SchemaType::STRING, "String", "");
Producer producer;
client.createProducer("topic-string", ProducerConfiguration().setSchema(schemaInfo), producer);
producer.send(MessageBuilder().setContent("message").build());

Consumer consumer;
client.subscribe("topic-string", "my-sub", ConsumerConfiguration().setSchema(schemaInfo), consumer);
Message msg;
consumer.receive(msg, 3000);
```

</TabItem>
<TabItem value="Python">

```python
producer = client.create_producer(
      'string-schema-topic',
      schema=StringSchema())
producer.send("Hello")

consumer = client.subscribe(
		'string-schema-topic',
		'sub',
		schema=StringSchema())
msg = consumer.receive()
str = msg.value()
```

</TabItem>
<TabItem value="Go">

```go
producer, err := client.CreateProducer(pulsar.ProducerOptions{
    Topic:  "my-topic",
    Schema: pulsar.NewStringSchema(nil),
})
id, err := producer.Send(context.Background(), &pulsar.ProducerMessage{
    Value: "message",
})

consumer, err := client.Subscribe(pulsar.ConsumerOptions{
    Topic:            "my-topic",
    Schema:           pulsar.NewStringSchema(nil),
    SubscriptionName: "my-sub",
    Type:             pulsar.Exclusive,
})
msg, err := consumer.Receive(context.Background())
```

</TabItem>
</Tabs>
````

### key/value

此示例演示如何使用特定语言的客户端构造 [key/value schema](schema-understand.md#keyvalue-schema)，并用它来生产和消费消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"}]}>

<TabItem value="Java">

1. 使用 `INLINE` 编码类型构造键值 Schema。

    ```java
    Schema<KeyValue<Integer, String>> kvSchema = Schema.KeyValue(
        Schema.INT32,
        Schema.STRING,
        KeyValueEncodingType.INLINE
    );
    ```

   或者，使用 `SEPARATED` 编码类型构造键值 Schema。

   ```java
   Schema<KeyValue<Integer, String>> kvSchema = Schema.KeyValue(
       Schema.INT32,
       Schema.STRING,
       KeyValueEncodingType.SEPARATED
   );
   ```

2. 使用键值 Schema 生产消息。

   ```java
   Producer<KeyValue<Integer, String>> producer = client.newProducer(kvSchema)
       .topic(topicName)
       .create();

   final int key = 100;
   final String value = "value-100";

   // 发送键值消息
   producer.newMessage()
       .value(new KeyValue(key, value))
       .send();
   ```

3. 使用键值 Schema 消费消息。

   ```java
   Consumer<KeyValue<Integer, String>> consumer = client.newConsumer(kvSchema)
       ...
       .topic(topicName)
       .subscriptionName(subscriptionName).subscribe();

   // 接收键值对
   Message<KeyValue<Integer, String>> msg = consumer.receive();
   KeyValue<Integer, String> kv = msg.getValue();
   ```

</TabItem>
<TabItem value="C++">

1. 使用 `INLINE` 编码类型构造键值 Schema。

   ```cpp
   //准备键值 Schema
   std::string jsonSchema =
   R"({"type":"record","name":"cpx","fields":[{"name":"re","type":"double"},{"name":"im","type":"double"}]})";
   SchemaInfo keySchema(JSON, "key-json", jsonSchema);
   SchemaInfo valueSchema(JSON, "value-json", jsonSchema);
   SchemaInfo keyValueSchema(keySchema, valueSchema, KeyValueEncodingType::INLINE);
   ```

2. 使用键值 Schema 生产消息。

   ```cpp
   //创建 Producer
   Producer producer;
   client.createProducer("my-topic", ProducerConfiguration().setSchema(keyValueSchema), producer);

   //准备消息
   std::string jsonData = "{\"re\":2.1,\"im\":1.23}";
   KeyValue keyValue(std::move(jsonData), std::move(jsonData));
   Message msg = MessageBuilder().setContent(keyValue).setProperty("x", "1").build();
   //发送消息
   producer.send(msg);
   ```

3. 使用键值 Schema 消费消息。

   ```cpp
   //创建 Consumer
   Consumer consumer;
   client.subscribe("my-topic", "my-sub", ConsumerConfiguration().setSchema(keyValueSchema), consumer);

   //接收消息
   Message message;
   consumer.receive(message);
   ```

</TabItem>
</Tabs>
````

### Avro

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>

<TabItem value="Java">

假设你有一个如下的 `SensorReading` 类，并且希望通过 Pulsar Topic 传输它。

```java
public class SensorReading {
    public float temperature;

    public SensorReading(float temperature) {
        this.temperature = temperature;
    }

    // 需要一个无参构造函数
    public SensorReading() {
    }

    public float getTemperature() {
        return temperature;
    }

    public void setTemperature(float temperature) {
        this.temperature = temperature;
    }
}
```

像这样创建 `Producer<SensorReading>`（或 `Consumer<SensorReading>`）：

```java
Producer<SensorReading> producer = client.newProducer(AvroSchema.of(SensorReading.class))
        .topic("sensor-readings")
        .create();
```

</TabItem>
<TabItem value="C++">

  ```cpp
  // Send messages
  static const std::string exampleSchema =
      "{\"type\":\"record\",\"name\":\"Example\",\"namespace\":\"test\","
      "\"fields\":[{\"name\":\"a\",\"type\":\"int\"},{\"name\":\"b\",\"type\":\"int\"}]}";
  Producer producer;
  ProducerConfiguration producerConf;
  producerConf.setSchema(SchemaInfo(AVRO, "Avro", exampleSchema));
  client.createProducer("topic-avro", producerConf, producer);

  // Receive messages
  static const std::string exampleSchema =
      "{\"type\":\"record\",\"name\":\"Example\",\"namespace\":\"test\","
      "\"fields\":[{\"name\":\"a\",\"type\":\"int\"},{\"name\":\"b\",\"type\":\"int\"}]}";
  ConsumerConfiguration consumerConf;
  Consumer consumer;
  consumerConf.setSchema(SchemaInfo(AVRO, "Avro", exampleSchema));
  client.subscribe("topic-avro", "sub-2", consumerConf, consumer)
  ```

</TabItem>
<TabItem value="Python">

你可以通过以下方法之一使用 Python 声明一个 `AvroSchema`。

**方法 1：Record**

通过传递一个继承自 `pulsar.schema.Record` 并将字段定义为类变量的类来声明 `AvroSchema`。

```python
class Example(Record):
    a = Integer()
    b = Integer()

producer = client.create_producer(
   'avro-schema-topic',
   schema=AvroSchema(Example))
r = Example(a=1, b=2)
producer.send(r)

consumer = client.subscribe(
   'avro-schema-topic',
	'sub',
	schema=AvroSchema(Example))
msg = consumer.receive()
e = msg.value()
```

**方法 2：JSON 定义**

1. 使用 JSON 声明 `AvroSchema`。在这种情况下，Avro Schema 使用 JSON 定义。

   下面是使用 JSON 文件（`company.avsc`）定义的 `AvroSchema` 示例。

   ```json
   {
       "doc": "this is doc",
       "namespace": "example.avro",
       "type": "record",
       "name": "Company",
       "fields": [
           {"name": "name", "type": ["null", "string"]},
           {"name": "address", "type": ["null", "string"]},
           {"name": "employees", "type": ["null", {"type": "array", "items": {
               "type": "record",
               "name": "Employee",
               "fields": [
                   {"name": "name", "type": ["null", "string"]},
                   {"name": "age", "type": ["null", "int"]}
               ]
           }}]},
           {"name": "labels", "type": ["null", {"type": "map", "values": "string"}]}
       ]
   }
   ```

2. Load a schema definition from a file by using [`avro.schema`](https://avro.apache.org/docs/current/getting-started-python/) or [`fastavro.schema`](https://fastavro.readthedocs.io/en/latest/schema.html#fastavro._schema_py.load_schema).

   If you use the [JSON definition](#method-2-json-definition) method to declare an `AvroSchema`, you need to:
   - Use [Python dict](https://developers.google.com/edu/python/dict-files) to produce and consume messages, which is different from using the [Record](#method-1-record) method.
   - Set the value of the `_record_cls` parameter to `None` when generating an `AvroSchema` object.

   **Example**

   ```python
   from fastavro.schema import load_schema
   from pulsar.schema import *
   schema_definition = load_schema("examples/company.avsc")
   avro_schema = AvroSchema(None, schema_definition=schema_definition)
   producer = client.create_producer(
       topic=topic,
       schema=avro_schema)
   consumer = client.subscribe(topic, 'test', schema=avro_schema)
   company = {
       "name": "company-name" + str(i),
       "address": 'xxx road xxx street ' + str(i),
       "employees": [
           {"name": "user" + str(i), "age": 20 + i},
           {"name": "user" + str(i), "age": 30 + i},
           {"name": "user" + str(i), "age": 35 + i},
       ],
       "labels": {
           "industry": "software" + str(i),
           "scale": ">100",
           "funds": "1000000.0"
       }
   }
   producer.send(company)
   msg = consumer.receive()
   # Users could get a dict object by `value()` method.
   msg.value()
   ```

</TabItem>
<TabItem value="Go">

Suppose you have an `avroExampleStruct` class as follows, and you'd like to transmit it over a Pulsar topic.

```go
type avroExampleStruct struct {
    ID   int
    Name string
}
```

1. Add an `avroSchemaDef` like this:

   ```go
   var (
       exampleSchemaDef = "{\"type\":\"record\",\"name\":\"Example\",\"namespace\":\"test\"," +
     "\"fields\":[{\"name\":\"ID\",\"type\":\"int\"},{\"name\":\"Name\",\"type\":\"string\"}]}"
   )
   ```

2. Create producer and consumer to send/receive messages:

   ```go
   //Create producer and send message
   producer, err := client.CreateProducer(pulsar.ProducerOptions{
       Topic:  "my-topic",
       Schema: pulsar.NewAvroSchema(exampleSchemaDef, nil),
   })

   msgId, err := producer.Send(context.Background(), &pulsar.ProducerMessage{
       Value: avroExampleStruct{
          ID:   10,
          Name: "avroExampleStruct",
     },
   })

   //Create Consumer and receive message
   consumer, err := client.Subscribe(pulsar.ConsumerOptions{
       Topic:            "my-topic",
       Schema:           pulsar.NewAvroSchema(exampleSchemaDef, nil),
       SubscriptionName: "my-sub",
       Type:             pulsar.Shared,
   })
   message, err := consumer.Receive(context.Background())
   ```

</TabItem>
</Tabs>
````

### JSON

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>

<TabItem value="Java">

Similar to using `AvroSchema`, you can declare a `JsonSchema` by passing a class. The only difference is to use  `JsonSchema` instead of `AvroSchema` when defining the schema type, as shown below. For how to use `AvroSchema` via record, see [Method 1 - Record](#method-1-record).

```java
static class SchemaDemo {
   public String name;
   public int age;
}

Producer<SchemaDemo> producer = pulsarClient.newProducer(Schema.JSON(SchemaDemo.class))
       .topic("my-topic")
       .create();
Consumer<SchemaDemo> consumer = pulsarClient.newConsumer(Schema.JSON(SchemaDemo.class))
       .topic("my-topic")
       .subscriptionName("my-sub")
       .subscribe();

SchemaDemo schemaDemo = new SchemaDemo();
schemaDemo.name = "puslar";
schemaDemo.age = 20;
producer.newMessage().value(schemaDemo).send();

Message<SchemaDemo> message = consumer.receive(5, TimeUnit.SECONDS);
```

</TabItem>
<TabItem value="C++">

To declare a `JSON` schema using C++, do the following:

1. Pass a JSON string like this:

   ```cpp
   Std::string jsonSchema = R"({"type":"record","name":"cpx","fields":[{"name":"re","type":"double"},{"name":"im","type":"double"}]})";
   SchemaInfo schemaInfo = SchemaInfo(JSON, "JSON", jsonSchema);
   ```

2. Create a producer and use it to send messages.

   ```cpp
   client.createProducer("my-topic", ProducerConfiguration().setSchema(schemaInfo), producer);
   std::string jsonData = "{\"re\":2.1,\"im\":1.23}";
   producer.send(MessageBuilder().setContent(std::move(jsonData)).build());
   ```

3. Create consumer and receive message.

   ```cpp
   Consumer consumer;
   client.subscribe("my-topic", "my-sub", ConsumerConfiguration().setSchema(schemaInfo), consumer);
   Message msg;
   consumer.receive(msg);
   ```

</TabItem>
<TabItem value="Python">

You can declare a `JsonSchema` by passing a class that inherits from `pulsar.schema.Record` and defines the fields as class variables. This is similar to using `AvroSchema`. The only difference is to use  `JsonSchema` instead of `AvroSchema` when defining schema type, as shown below. For how to use `AvroSchema` via record, see (#method-1-record).

```python
producer = client.create_producer(
   'avro-schema-topic',
   schema=JsonSchema(Example))

consumer = client.subscribe(
	'avro-schema-topic',
	'sub',
	schema=JsonSchema(Example))
```

</TabItem>
<TabItem value="Go">

Suppose you have an `avroExampleStruct` class as follows, and you'd like to transmit it as JSON form over a Pulsar topic.

```go
type jsonExampleStruct struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}
```

1. Add a `jsonSchemaDef` like this:

```go
   jsonSchemaDef = "{\"type\":\"record\",\"name\":\"Example\",\"namespace\":\"test\"," +
  "\"fields\":[{\"name\":\"ID\",\"type\":\"int\"},{\"name\":\"Name\",\"type\":\"string\"}]}"
```

2. Create a producer/consumer to send/receive messages:

```go
   //Create producer and send message
   producer, err := client.CreateProducer(pulsar.ProducerOptions{
       Topic:  "my-topic",
       Schema: pulsar.NewJSONSchema(jsonSchemaDef, nil),
   })

   msgId, err := producer.Send(context.Background(), &pulsar.ProducerMessage{
       Value: jsonExampleStruct{
           ID:   10,
           Name: "jsonExampleStruct",
     },
   })

   //Create Consumer and receive message
   consumer, err := client.Subscribe(pulsar.ConsumerOptions{
       Topic:            "my-topic",
       Schema:           pulsar.NewJSONSchema(jsonSchemaDef, nil),
       SubscriptionName: "my-sub",
       Type:             pulsar.Exclusive,
   })
   message, err := consumer.Receive(context.Background())
```

</TabItem>
</Tabs>
````

### ProtobufNative

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"}]}>

<TabItem value="Java">

The following example shows how to create a producer/consumer with a ProtobufNative schema using Java.

1. Generate the `DemoMessage` class using Protobuf3 or later versions.

   ```protobuf
   syntax = "proto3";
   message DemoMessage {
      string stringField = 1;
      double doubleField = 2;
      int32 intField = 6;
      TestEnum testEnum = 4;
      SubMessage nestedField = 5;
      repeated string repeatedField = 10;
      proto.external.ExternalMessage externalMessage = 11;
   }
   ```

2. Create a producer/consumer to send/receive messages.

   ```java
   Producer<DemoMessage> producer = pulsarClient.newProducer(Schema.PROTOBUF_NATIVE(DemoMessage.class))
       .topic("my-topic")
       .create();
   Consumer<DemoMessage> consumer = pulsarClient.newConsumer(Schema.PROTOBUF_NATIVE(DemoMessage.class))
       .topic("my-topic")
       .subscriptionName("my-sub")
       .subscribe();

   SchemaDemo schemaDemo = new SchemaDemo();
   schemaDemo.name = "puslar";
   schemaDemo.age = 20;
   producer.newMessage().value(DemoMessage.newBuilder().setStringField("string-field-value")
       .setIntField(1).build()).send();

   Message<DemoMessage> message = consumer.receive(5, TimeUnit.SECONDS);
   ```

</TabItem>
<TabItem value="C++">

The following example shows how to create a producer/consumer with a ProtobufNative schema.

1. Generate the `User` class using Protobuf3 or later versions.

   ```protobuf
   syntax = "proto3";

   message User {
       string name = 1;
       int32 age = 2;
   }
   ```

2. Include the `ProtobufNativeSchema.h` in your source code. Ensure the Protobuf dependency has been added to your project.

   ```cpp
   #include <pulsar/ProtobufNativeSchema.h>
   ```

3. Create a producer to send a `User` instance.

   ```cpp
   ProducerConfiguration producerConf;
   producerConf.setSchema(createProtobufNativeSchema(User::GetDescriptor()));
   Producer producer;
   client.createProducer("topic-protobuf", producerConf, producer);
   User user;
   user.set_name("my-name");
   user.set_age(10);
   std::string content;
   user.SerializeToString(&content);
   producer.send(MessageBuilder().setContent(content).build());
   ```

4. Create a consumer to receive a `User` instance.

   ```cpp
   ConsumerConfiguration consumerConf;
   consumerConf.setSchema(createProtobufNativeSchema(User::GetDescriptor()));
   consumerConf.setSubscriptionInitialPosition(InitialPositionEarliest);
   Consumer consumer;
   client.subscribe("topic-protobuf", "my-sub", consumerConf, consumer);
   Message msg;
   consumer.receive(msg);
   User user2;
   user2.ParseFromArray(msg.getData(), msg.getLength());
   ```

</TabItem>
</Tabs>
````

### Protobuf

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Go","value":"Go"}]}>

<TabItem value="Java">

Constructing a protobuf schema using Java is similar to constructing a `ProtobufNative` schema. The only difference is to use `PROTOBUF` instead of `PROTOBUF_NATIVE` when defining schema type as shown below.

1. Generate the `DemoMessage` class using Protobuf3 or later versions.

   ```protobuf
   syntax = "proto3";
   message DemoMessage {
      string stringField = 1;
      double doubleField = 2;
      int32 intField = 6;
      TestEnum testEnum = 4;
      SubMessage nestedField = 5;
      repeated string repeatedField = 10;
      proto.external.ExternalMessage externalMessage = 11;
   }
   ```

2. Create a producer/consumer to send/receive messages.

   ```java
   Producer<DemoMessage> producer = pulsarClient.newProducer(Schema.PROTOBUF(DemoMessage.class))
          .topic("my-topic")
          .create();
   Consumer<DemoMessage> consumer = pulsarClient.newConsumer(Schema.PROTOBUF(DemoMessage.class))
          .topic("my-topic")
          .subscriptionName("my-sub")
          .subscribe();

   SchemaDemo schemaDemo = new SchemaDemo();
   schemaDemo.name = "puslar";
   schemaDemo.age = 20;
   producer.newMessage().value(DemoMessage.newBuilder().setStringField("string-field-value")
       .setIntField(1).build()).send();

   Message<DemoMessage> message = consumer.receive(5, TimeUnit.SECONDS);
   ```

</TabItem>
<TabItem value="C++">

Constructing a protobuf schema using C++ is similar to that using `JSON`. The only difference is to use `PROTOBUF` instead of `JSON` when defining the schema type as shown below.

```cpp
std::string jsonSchema =
   R"({"type":"record","name":"cpx","fields":[{"name":"re","type":"double"},{"name":"im","type":"double"}]})";
SchemaInfo schemaInfo = SchemaInfo(pulsar::PROTOBUF, "PROTOBUF", jsonSchema);
```

1. Create a producer to send messages.

   ```cpp
   Producer producer;
   client.createProducer("my-topic", ProducerConfiguration().setSchema(schemaInfo), producer);
   std::string jsonData = "{\"re\":2.1,\"im\":1.23}";
   producer.send(MessageBuilder().setContent(std::move(jsonData)).build());
   ```

2. Create a consumer to receive messages.

   ```cpp
   Consumer consumer;
   client.subscribe("my-topic", "my-sub", ConsumerConfiguration().setSchema(schemaInfo),   consumer);
   Message msg;
   consumer.receive(msg);
   ```

</TabItem>
<TabItem value="Go">

Suppose you have a `protobufDemo` class as follows, and you'd like to transmit it in JSON form over a Pulsar topic.

```go
type protobufDemo struct {
    Num                  int32    `protobuf:"varint,1,opt,name=num,proto3" json:"num,omitempty"`
    Msf                  string   `protobuf:"bytes,2,opt,name=msf,proto3" json:"msf,omitempty"`
    XXX_NoUnkeyedLiteral struct{} `json:"-"`
    XXX_unrecognized     []byte   `json:"-"`
    XXX_sizecache        int32    `json:"-"`
}
```

1. Add a `protoSchemaDef` like this:

   ```go
   var (
       protoSchemaDef = "{\"type\":\"record\",\"name\":\"Example\",\"namespace\":\"test\"," +
           "\"fields\":[{\"name\":\"num\",\"type\":\"int\"},{\"name\":\"msf\",\"type\":\"string\"}]}"
   )
   ```

2. Create a producer/consumer to send/receive messages:

   ```go
   psProducer := pulsar.NewProtoSchema(protoSchemaDef, nil)
   producer, err := client.CreateProducer(pulsar.ProducerOptions{
       Topic:  "proto",
       Schema: psProducer,
   })
   msgId, err := producer.Send(context.Background(), &pulsar.ProducerMessage{
       Value: &protobufDemo{
           Num: 100,
           Msf: "pulsar",
     },
   })
   psConsumer := pulsar.NewProtoSchema(protoSchemaDef, nil)
   consumer, err := client.Subscribe(pulsar.ConsumerOptions{
       Topic:                       "proto",
       SubscriptionName:            "sub-1",
       Schema:                      psConsumer,
       SubscriptionInitialPosition: pulsar.SubscriptionPositionEarliest,
   })
   msg, err := consumer.Receive(context.Background())
   ```

</TabItem>
</Tabs>
````

### Native Avro

This example shows how to construct a [native Avro schema](schema-understand.md#struct-schema).

```java
org.apache.avro.Schema nativeAvroSchema = … ;
Producer<byte[]> producer = pulsarClient.newProducer().topic("ingress").create();
byte[] content = … ;
producer.newMessage(Schema.NATIVE_AVRO(nativeAvroSchema)).value(content).send();
```

### AUTO_PRODUCE

Suppose you have a Pulsar topic _P_, a producer processing messages from a Kafka topic _K_, an application reading the messages from _K_ and writing the messages to _P_.

This example shows how to construct an [AUTO_PRODUCE](schema-understand.md#auto-schema) schema to verify whether the bytes produced by _K_ can be sent to _P_.

```java
Produce<byte[]> pulsarProducer = client.newProducer(Schema.AUTO_PRODUCE_BYTES())
    …
    .create();
byte[] kafkaMessageBytes = … ;
pulsarProducer.produce(kafkaMessageBytes);
```

### AUTO_CONSUME

Suppose you have a Pulsar topic _P_ and a consumer _MySQL_ that receives messages from _P_, and you want to check if these messages have the information that your application needs to count.

This example shows how to construct an [AUTO_CONSUME schema](schema-understand.md#auto-schema) to verify whether the bytes produced by _P_ can be sent to _MySQL_.

```java
Consumer<GenericRecord> pulsarConsumer = client.newConsumer(Schema.AUTO_CONSUME())
    …
    .subscribe();

Message<GenericRecord> msg = consumer.receive() ;
GenericRecord record = msg.getValue();
record.getFields().forEach((field -> {
   if (field.getName().equals("theNeedFieldName")) {
       Object recordField = record.getField(field);
       //Do some things
   }
}));
```

## 自定义 Schema 存储

默认情况下，Pulsar 将各种数据类型的 Schema 存储在与 Pulsar 一起部署的 [Apache BookKeeper](https://bookkeeper.apache.org) 中。或者，如果需要，你可以使用另一个存储系统。

要为 Pulsar Schema 使用非默认（非 BookKeeper）存储系统，你需要在 [部署自定义 Schema 存储](#部署自定义-schema-存储)之前实现以下 Java 接口：
* [SchemaStorage 接口](#实现-schemastorage-接口)
* [SchemaStorageFactory 接口](#实现-schemastoragefactory-接口)

### 实现 `SchemaStorage` 接口

`SchemaStorage` 接口具有以下方法：

```java
public interface SchemaStorage {
    // Schema 如何更新
    CompletableFuture<SchemaVersion> put(String key, byte[] value, byte[] hash);

    // 如何从存储中获取 Schema
    CompletableFuture<StoredSchema> get(String key, SchemaVersion version);

    // 如何删除 Schema
    CompletableFuture<SchemaVersion> delete(String key);

    // 用于将 Schema 版本字节数组转换为 SchemaVersion 对象的实用方法
    SchemaVersion versionFromBytes(byte[] version);

    // Schema 存储客户端的启动行为
    void start() throws Exception;

    // Schema 存储客户端的关闭行为
    void close() throws Exception;
}
```

:::tip

有关 **Schema 存储** 实现的完整示例，请参阅 [BookKeeperSchemaStorage](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/service/schema/BookkeeperSchemaStorage.java) 类。

:::

### 实现 `SchemaStorageFactory` 接口

`SchemaStorageFactory` 接口具有以下方法：

```java
public interface SchemaStorageFactory {
    @NotNull
    SchemaStorage create(PulsarService pulsar) throws Exception;
}
```

:::tip

有关 **Schema 存储工厂** 实现的完整示例，请参阅 [BookKeeperSchemaStorageFactory](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/service/schema/BookkeeperSchemaStorageFactory.java) 类。

:::

### 部署自定义 Schema 存储

要使用你的自定义 Schema 存储实现，请执行以下步骤。

1. 将实现打包在 [JAR](https://docs.oracle.com/javase/tutorial/deployment/jar/basicsindex.html) 文件中。

2. 将 JAR 文件添加到你的 Pulsar 二进制或源码分发包的 `lib` 文件夹中。

3. 将 `conf/broker.conf` 文件中的 `schemaRegistryStorageClassName` 配置更改为你的自定义工厂类。

4. 启动 Pulsar。
