---
id: functions-develop-serde
title: 使用 SerDe
sidebar_label: "使用 SerDe"
description: 学习在 Pulsar 中使用序列化和反序列化开发函数。
---

Pulsar Functions 在向 Pulsar Topic 发布数据或从 Pulsar Topic 消费数据时使用 SerDe（**Ser**ialization and **De**serialization，序列化和反序列化）。SerDe 的默认工作方式取决于您为特定函数使用的语言（Java 或 Python）。然而，在这两种语言中，您都可以编写自定义的 SerDe 逻辑来处理更复杂的、特定于应用程序的类型。

## 为 Java 函数使用 SerDe

以下基本 Java 类型是内置的，默认情况下 Java 函数支持：`string`、`double`、`integer`、`float`、`long`、`short` 和 `byte`。

要自定义 Java 类型，您需要实现以下接口。

```java
public interface SerDe<T> {
    T deserialize(byte[] input);
    byte[] serialize(T input);
}
```

对于 Java 函数，SerDe 的工作方式如下：
- 如果输入和输出 Topic 有 Schema，Pulsar Functions 使用该 Schema 进行 SerDe。
- 如果输入或输出 Topic 不存在，Pulsar Functions 采用以下规则来确定 SerDe：
  - 如果指定了 Schema 类型，Pulsar Functions 使用指定的 Schema 类型。
  - 如果指定了 SerDe，Pulsar Functions 使用指定的 SerDe，输入和输出 Topic 的 Schema 类型为 `byte`。
  - 如果既没有指定 Schema 类型也没有指定 SerDe，Pulsar Functions 使用内置的 SerDe。对于非原始 Schema 类型，内置的 SerDe 以 `JSON` 格式序列化和反序列化对象。

例如，假设您正在编写一个处理 tweet 对象的函数。您可以参考以下 Java 中的 `Tweet` 类示例。

```java
public class Tweet {
    private String username;
    private String tweetContent;

    public Tweet(String username, String tweetContent) {
        this.username = username;
        this.tweetContent = tweetContent;
    }

    // 标准的 setter 和 getter
}
```

要在函数之间直接传递 `Tweet` 对象，您需要提供一个自定义的 SerDe 类。在下面的示例中，`Tweet` 对象基本上是字符串，用户名和 tweet 内容由 `|` 分隔。

```java
package com.example.serde;

import org.apache.pulsar.functions.api.SerDe;

import java.util.regex.Pattern;

public class TweetSerde implements SerDe<Tweet> {
    public Tweet deserialize(byte[] input) {
        String s = new String(input);
        String[] fields = s.split(Pattern.quote("|"));
        return new Tweet(fields[0], fields[1]);
    }

    public byte[] serialize(Tweet input) {
        return "%s|%s".format(input.getUsername(), input.getTweetContent()).getBytes();
    }
}
```

要将自定义的 SerDe 应用到特定函数，您需要：
* 将 `Tweet` 和 `TweetSerde` 类打包到 JAR 中。
* 在部署函数时指定 JAR 的路径和 SerDe 类名。

以下是使用 `create` 命令通过应用自定义 SerDe 来部署函数的示例。

```bash
 bin/pulsar-admin functions create \
  --jar /path/to/your.jar \
  --output-serde-classname com.example.serde.TweetSerde \
  # 其他函数属性
```

:::note

自定义 SerDe 类必须与您的函数 JAR 一起打包。

:::

## 为 Python 函数使用 SerDe

在 Python 中，默认的 SerDe 是恒等映射，这意味着类型被序列化为函数返回的任何类型。

例如，当在 [集群模式](functions-deploy-cluster.md) 中部署函数时，您可以按如下方式指定 SerDe。

```bash
bin/pulsar-admin functions create \
  --tenant public \
  --namespace default \
  --name my_function \
  --py my_function.py \
  --classname my_function.MyFunction \
  --custom-serde-inputs '{"input-topic-1":"Serde1","input-topic-2":"Serde2"}' \
  --output-serde-classname Serde3 \
  --output output-topic-1
```

这个情况包含两个输入 Topic：`input-topic-1` 和 `input-topic-2`，每个都映射到不同的 SerDe 类（映射必须指定为 JSON 字符串）。输出 Topic `output-topic-1` 使用 `Serde3` 类进行 SerDe。

:::note

所有与函数相关的逻辑，包括处理和 SerDe 类，都必须包含在单个 Python 文件中。

:::

下表概述了 Python 函数的三种 SerDe 选项。

| SerDe 选项 | 描述 | 使用场景|
| ------------|-----------|-----------|
| `IdentitySerDe`（默认） | 使用 `IdentitySerDe`，保持数据不变。创建或运行函数而不显式指定 SerDe 意味着使用此选项。 | 当您处理简单类型如字符串、布尔值、整数时。|
| `PickleSerDe` | 使用 `PickleSerDe`，它使用 Python [`pickle`](https://docs.python.org/3/library/pickle.html) 进行 SerDe。 | 当您处理复杂的、特定于应用程序的类型，并且对 `pickle` 的"尽力而为"方法感到满意时。|
| `自定义 SerDe` | 通过实现基线 `SerDe` 类创建自定义 SerDe 类，该类只有两个方法：<br />* `serialize` 用于将对象转换为字节。<br />* `deserialize` 用于将字节转换为所需特定于应用程序类型的对象。 | 当您需要对 SerDe 进行显式控制时，可能是出于性能或数据兼容性目的。|

例如，假设您正在编写一个处理 tweet 对象的函数。您可以参考以下 Python 中的 `Tweet` 类示例。

```python
class Tweet(object):
    def __init__(self, username, tweet_content):
        self.username = username
        self.tweet_content = tweet_content
```

要在 Pulsar Functions 中使用这个类，您有两个选项：
* 指定 `PickleSerDe`，它应用 `pickle` 库进行 SerDe。
* 创建您自己的 SerDe 类。以下是一个示例。

```python
from pulsar import SerDe

class TweetSerDe(SerDe):

    def serialize(self, input):
        return bytes("{0}|{1}".format(input.username, input.tweet_content))

    def deserialize(self, input_bytes):
        tweet_components = str(input_bytes).split('|')
        return Tweet(tweet_components[0], tweet_componentsp[1])
```

有关更多详细信息，请参阅 [代码示例](https://github.com/apache/pulsar/blob/master/pulsar-functions/python-examples/custom_object_function.py)。