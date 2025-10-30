---
id: functions-develop-api
title: 使用 API
sidebar_label: "使用 API"
description: 学习使用 Pulsar API 开发函数。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

下表概述了您可用于在 Java、Python 和 Go 中开发 Pulsar Functions 的 API。

| 接口 | 描述 | 使用场景 |
|---------|------------|---------|
| [Java/Python 语言原生接口](#使用-javapython-语言原生接口) | 不需要 Pulsar 特定的库或特殊依赖项（仅需要核心库）。 | 不需要访问 [上下文](functions-concepts.md#context) 的函数。|
| [Java/Python/Go 的 Pulsar Functions SDK](#使用-javapythongo-sdk) | 提供语言原生接口中不可用的一系列功能的 Pulsar 特定库，例如状态管理或用户配置。 | 需要访问 [上下文](functions-concepts.md#context) 的函数。|
| [Java 的扩展 Pulsar Functions SDK](#使用-java-扩展-sdk) | Pulsar 特定库的扩展，提供 Java 中的初始化和关闭接口。 | 需要初始化和释放外部资源的函数。|


## 使用 Java/Python 语言原生接口

语言原生接口为编写 Java/Python 函数提供了一种简单而清晰的方法，通过为所有传入的字符串添加感叹号并将输出字符串发布到 Topic。它没有外部依赖项。

以下示例是语言原生函数。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

要将一段 Java 代码用作"语言原生"函数，您需要实现 `java.util.Function` 接口。您可以在 `apply` 方法中包含任何类型的复杂逻辑以提供更多的处理能力。

```java
import java.util.function.Function;

public class JavaNativeExclamationFunction implements Function<String, String> {
    @Override
    public String apply(String input) {
        return String.format("%s!", input);
    }
}
```

有关更多详细信息，请参阅 [代码示例](https://github.com/apache/pulsar/blob/master/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/JavaNativeExclamationFunction.java)。

</TabItem>
<TabItem value="Python">

要将一段 Python 代码用作"语言原生"函数，您必须有一个名为 `process` 的方法，如下所示。它向其接收到的任何字符串值追加感叹号。

```python
def process(input):
    return "{}!".format(input)
```

有关更多详细信息，请参阅 [代码示例](https://github.com/apache/pulsar/blob/master/pulsar-functions/python-examples/native_exclamation_function.py)。

:::note

使用 Python 3 编写 Pulsar Functions。为确保您的函数能够运行，您需要为函数工作者安装 Python 3 并将 Python 3 设置为默认解释器。

:::

</TabItem>
</Tabs>
````


## 使用 Java/Python/Go SDK

Pulsar Functions SDK 的实现指定了一个功能接口，该接口包括 [上下文](functions-concepts.md#context) 对象作为参数。

以下示例使用不同语言的 Pulsar Functions SDK。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

使用 Java SDK 开发函数时，您需要实现 `org.apache.pulsar.functions.api.Function` 接口。它只指定一个您需要实现的方法，称为 `process`。

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;

public class ExclamationFunction implements Function<String, String> {
    @Override
    public String process(String input, Context context) {
        return String.format("%s!", input);
    }
}
```

有关更多详细信息，请参阅 [代码示例](https://github.com/apache/pulsar/blob/master/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/ExclamationFunction.java)。

函数的返回类型可以包装在 `Record` 泛型中，这使您能够更多地控制输出消息，例如 topics、schemas、properties 等。
使用 `Context::newOutputRecordBuilder` 方法构建此 `Record` 输出。

```java
import java.util.HashMap;
import java.util.Map;
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;
import org.apache.pulsar.functions.api.Record;

public class RecordFunction implements Function<String, Record<String>> {

    @Override
    public Record<String> process(String input, Context context) throws Exception {
        String output = String.format("%s!", input);
        Map<String, String> properties = new HashMap<>(context.getCurrentRecord().getProperties());
        context.getCurrentRecord().getTopicName().ifPresent(topic -> properties.put("input_topic", topic));

        return context.newOutputRecordBuilder(Schema.STRING)
                .value(output)
                .properties(properties)
                .build();
    }
}
```

有关更多详细信息，请参阅 [代码示例](https://github.com/apache/pulsar/blob/master/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/RecordFunction.java)。

</TabItem>
<TabItem value="Python">

要使用 Python SDK 开发函数，您需要将 pulsar 客户端依赖项添加到 Python 安装中。

```python
from pulsar import Function

class ExclamationFunction(Function):
  def __init__(self):
    pass

  def process(self, input, context):
    return input + '!'
```

有关更多详细信息，请参阅 [代码示例](https://github.com/apache/pulsar/blob/master/pulsar-functions/python-examples/exclamation_function.py)。

</TabItem>
<TabItem value="Go">

要使用 Go SDK 开发函数，您需要将 pulsar 客户端依赖项添加到 Go 安装中，并在 `main()` 方法内提供函数名称给 `pf.Start()` 方法。这将函数注册到 Pulsar Functions 框架，并确保在接收到新消息时可以调用指定的函数。

```go
package main

import (
	"context"
	"fmt"

	"github.com/apache/pulsar/pulsar-function-go/pf"
)

func HandleRequest(ctx context.Context, in []byte) error{
	fmt.Println(string(in) + "!")
	return nil
}

func main() {
	pf.Start(HandleRequest)
}
```

有关更多详细信息，请参阅 [代码示例](https://github.com/apache/pulsar/blob/77cf09eafa4f1626a53a1fe2e65dd25f377c1127/pulsar-function-go/examples/inputFunc/inputFunc.go#L20-L36)。

</TabItem>
</Tabs>
````


## 使用 Java 扩展 SDK

此扩展的 Pulsar Functions SDK 提供了两个额外的接口来初始化和释放外部资源。
- 通过使用 `initialize` 接口，您可以初始化只需要在函数实例启动时进行一次性初始化的外部资源。
- 通过使用 `close` 接口，您可以在函数实例关闭时关闭引用的外部资源。

:::note

Java 的扩展 Pulsar Functions SDK 仅在 Pulsar 2.10.0 或更高版本中可用。在使用它之前，您需要在 Pulsar 2.10.0 或更高版本中 [设置函数工作者](functions-worker.md)。

:::

以下示例使用 Java 的 Pulsar Functions SDK 扩展接口在函数实例启动时初始化 RedisClient，并在函数实例关闭时释放它。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;
import io.lettuce.core.RedisClient;

public class InitializableFunction implements Function<String, String> {
    private RedisClient redisClient;

    private void initRedisClient(Map<String, Object> connectInfo) {
        redisClient = RedisClient.create(connectInfo.get("redisURI"));
    }

    @Override
    public void initialize(Context context) {
        Map<String, Object> connectInfo = context.getUserConfigMap();
        redisClient = initRedisClient(connectInfo);
    }

    @Override
    public String process(String input, Context context) {
        String value = client.get(key);
        return String.format("%s-%s", input, value);
    }

    @Override
    public void close() {
        redisClient.close();
    }
}
```

</TabItem>
</Tabs>
````