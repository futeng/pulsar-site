---
id: client-libraries-python-use
title: 使用 Python 客户端
sidebar_label: "使用"
description: 学习如何在 Pulsar 中使用 Python 客户端。
---

## 创建生产者

以下示例为 `my-topic` 主题创建一个 Python 生产者，并在该主题上发送 10 条消息：

```python
import pulsar

client = pulsar.Client('pulsar://localhost:6650')

producer = client.create_producer('my-topic')

for i in range(10):
    producer.send(('Hello-%d' % i).encode('utf-8'))

client.close()
```

## 创建消费者

以下示例在 `my-topic` 主题上创建一个具有 `my-subscription` 订阅名称的消费者，接收传入消息，打印到达消息的内容和 ID，并向 Pulsar 代理确认每条消息。

```python
import pulsar

client = pulsar.Client('pulsar://localhost:6650')

consumer = client.subscribe('my-topic', 'my-subscription')

while True:
    msg = consumer.receive()
    try:
        print("Received message '{}' id='{}'".format(msg.data(), msg.message_id()))
        # 确认消息成功处理
        consumer.acknowledge(msg)
    except Exception:
        # 消息处理失败
        consumer.negative_acknowledge(msg)

client.close()
```

此示例显示如何配置否定确认。

```python
from pulsar import Client, schema
client = Client('pulsar://localhost:6650')
consumer = client.subscribe('negative_acks','test',schema=schema.StringSchema())
producer = client.create_producer('negative_acks',schema=schema.StringSchema())
for i in range(10):
    print('send msg "hello-%d"' % i)
    producer.send_async('hello-%d' % i, callback=None)
producer.flush()
for i in range(10):
    msg = consumer.receive()
    consumer.negative_acknowledge(msg)
    print('receive and nack msg "%s"' % msg.data())
for i in range(10):
    msg = consumer.receive()
    consumer.acknowledge(msg)
    print('receive and ack msg "%s"' % msg.data())
try:
    # 不期望更多消息
    msg = consumer.receive(100)
except:
    print("no more msg")
    pass
```

## 创建读取器

您可以使用 Pulsar Python API 来使用 Pulsar [读取器接口](concepts-clients.md#reader-interface)。以下是一个示例：

```python
# 从之前获取的消息中获取 MessageId
msg_id = msg.message_id()

reader = client.create_reader('my-topic', msg_id)

while True:
    msg = reader.read_next()
    print("Received message '{}' id='{}'".format(msg.data(), msg.message_id()))
    # 无确认
```

## 使用模式

### 支持的模式类型

您可以在 Pulsar 中使用不同的内置模式类型。所有定义都在 `pulsar.schema` 包中。

| 模式 | 备注 |
| ------ | ----- |
| `BytesSchema` | 将原始负载获取为 `bytes` 对象。不执行序列化/反序列化。这是默认的模式模式 |
| `StringSchema` | 将负载编码/解码为 UTF-8 字符串。使用 `str` 对象 |
| `JsonSchema` | 需要记录定义。将记录序列化为标准 JSON 负载 |
| `AvroSchema` | 需要记录定义。以 AVRO 格式序列化 |

### 模式定义参考

模式定义通过继承自 `pulsar.schema.Record` 的类完成。

此类有许多字段，可以是 `pulsar.schema.Field` 类型或另一个嵌套的 `Record`。所有字段都在 `pulsar.schema` 包中指定。字段与 AVRO 字段类型匹配。

| 字段类型 | Python 类型 | 备注 |
| ---------- | ----------- | ----- |
| `Boolean`  | `bool`      |       |
| `Integer`  | `int`       |       |
| `Long`     | `int`       |       |
| `Float`    | `float`     |       |
| `Double`   | `float`     |       |
| `Bytes`    | `bytes`     |       |
| `String`   | `str`       |       |
| `Array`    | `list`      | 需要为项目指定记录类型。 |
| `Map`      | `dict`      | 键始终为 `String`。需要指定值类型。 |

此外，任何 Python `Enum` 类型都可以用作有效的字段类型。

#### 字段参数

添加字段时，您可以在构造函数中使用这些参数。

| 参数   | 默认值 | 备注 |
| ---------- | --------| ----- |
| `default`  | `None`  | 为字段设置默认值，例如 `a = Integer(default=5)`。 |
| `required` | `False` | 将字段标记为"必需"。相应地在模式中设置。 |

#### 模式定义示例

##### 简单定义

```python
class Example(Record):
    a = String()
    b = Integer()
    c = Array(String())
    i = Map(String())
```

##### 使用枚举

```python
from enum import Enum

class Color(Enum):
    red = 1
    green = 2
    blue = 3

class Example(Record):
    name = String()
    color = Color
```

##### 复杂类型

```python
class MySubRecord(Record):
    x = Integer()
    y = Long()
    z = String()

class Example(Record):
    a = String()
    sub = MySubRecord()
```

##### 为 Avro 模式设置命名空间

使用特殊字段 `_avro_namespace` 为 Avro Record 模式设置命名空间。

```python
class NamespaceDemo(Record):
   _avro_namespace = 'xxx.xxx.xxx'
   x = String()
   y = Integer()
```

模式定义如下。

```json
{
  "name": "NamespaceDemo", "namespace": "xxx.xxx.xxx", "type": "record", "fields": [
    {"name": "x", "type": ["null", "string"]},
    {"name": "y", "type": ["null", "int"]}
  ]
}
```

### 声明和验证模式

在创建生产者之前，Pulsar 代理验证现有主题模式是否为正确类型，以及格式是否与类的模式定义兼容。如果主题模式的格式与模式定义不兼容，生产者创建中会发生异常。

一旦创建了具有特定模式定义的生产者，它只接受作为声明模式类实例的对象。

类似地，对于消费者或读取器，消费者返回一个对象（它是模式记录类的实例）而不是原始字节。

**示例**

```python
consumer = client.subscribe(
                  topic='my-topic',
                  subscription_name='my-subscription',
                  schema=AvroSchema(Example) )

while True:
    msg = consumer.receive()
    ex = msg.value()
    try:
        print("Received message a={} b={} c={}".format(ex.a, ex.b, ex.c))
        # 确认消息成功处理
        consumer.acknowledge(msg)
    except Exception:
        # 消息处理失败
        consumer.negative_acknowledge(msg)
```

有关更多代码示例，请参阅[模式 - 入门](schema-get-started.md)。