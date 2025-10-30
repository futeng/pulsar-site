---
id: client-libraries-schema
title: 使用模式
sidebar_label: "使用模式"
description: 学习如何在 Pulsar 中使用 Python 模式。
---


## 模式入门

有关 Pulsar 模式的概述和特定语言的代码示例，请参阅[模式 - 概述](schema-overview.md)和[模式 - 入门](schema-get-started.md)。


## 使用 Python 模式

使用 Python 模式与其他语言略有不同。本节介绍了使用 Python 客户端处理模式的具体参考和示例。

### 支持的模式类型

你可以在 Pulsar 中使用不同的内置模式类型。所有定义都在 `pulsar.schema` 包中。

| 模式 | 说明 |
| ------ | ----- |
| `BytesSchema` | 将原始负载作为 `bytes` 对象获取。不执行序列化/反序列化。这是默认模式模式 |
| `StringSchema` | 将负载编码/解码为 UTF-8 字符串。使用 `str` 对象 |
| `JsonSchema` | 需要记录定义。将记录序列化为标准 JSON 负载 |
| `AvroSchema` | 需要记录定义。以 AVRO 格式序列化 |

### 模式定义参考

模式定义通过继承自 `pulsar.schema.Record` 的类完成。

这个类有许多字段，可以是 `pulsar.schema.Field` 类型或另一个嵌套的 `Record`。所有字段都在 `pulsar.schema` 包中指定。字段匹配 AVRO 字段类型。

| 字段类型 | Python 类型 | 说明 |
| ---------- | ----------- | ----- |
| `Boolean`  | `bool`      |       |
| `Integer`  | `int`       |       |
| `Long`     | `int`       |       |
| `Float`    | `float`     |       |
| `Double`   | `float`     |       |
| `Bytes`    | `bytes`     |       |
| `String`   | `str`       |       |
| `Array`    | `list`      | 需要为项目指定记录类型。 |
| `Map`      | `dict`      | 键始终是 `String`。需要指定值类型。 |

此外，任何 Python `Enum` 类型都可以用作有效的字段类型。

#### 字段参数

添加字段时，你可以在构造函数中使用这些参数。

| 参数   | 默认值 | 说明 |
| ---------- | --------| ----- |
| `default`  | `None`  | 为字段设置默认值，例如 `a = Integer(default=5)`。 |
| `required` | `False` | 将字段标记为"必需"。在模式中相应地设置。 |

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

使用特殊字段 `_avro_namespace` 为 Avro 记录模式设置命名空间。

```python
class NamespaceDemo(Record):
   _avro_namespace = 'xxx.xxx.xxx'
   x = String()
   y = Integer()
```

模式定义如下所示。

```json
{
  "name": "NamespaceDemo", "namespace": "xxx.xxx.xxx", "type": "record", "fields": [
    {"name": "x", "type": ["null", "string"]},
    {"name": "y", "type": ["null", "int"]}
  ]
}
```

### 声明和验证模式

在创建生产者之前，Pulsar broker 验证现有主题模式是否为正确类型，并且格式与类的模式定义兼容。如果主题模式的格式与模式定义不兼容，生产者创建中会出现异常。

一旦创建了具有特定模式定义的生产者，它只接受作为声明模式类实例的对象。

同样，对于消费者或读取器，消费者返回一个对象（它是模式记录类的实例）而不是原始字节。

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