---
id: window-functions-context
title: Window Functions Context
sidebar_label: "Window Functions: Context"
description: Get a comprehensive understanding of window functions context in Pulsar.
---

Java SDK 提供对**窗口上下文对象**的访问，窗口函数可以使用该对象。此上下文对象为 Pulsar 窗口函数提供广泛的信息和功能，如下所示。

- [规范](#spec)

  * 与函数关联的所有输入 Topic 和输出 Topic 的名称。
  * 与函数关联的租户和命名空间。
  * Pulsar 窗口函数名称、ID 和版本。
  * 运行窗口函数的 Pulsar 函数实例的 ID。
  * 调用窗口函数的实例数量。
  * 输出 Schema 的内置类型或自定义类名。

- [日志记录器](#logger)

  * 窗口函数使用的 Logger 对象，可用于创建窗口函数日志消息。

- [用户配置](#user-config)

  * 访问任意用户配置值。

- [路由](#routing)

  * Pulsar 窗口函数支持路由。Pulsar 窗口函数根据 `publish` 接口向任意 Topic 发送消息。

- [指标](#metrics)

  * 记录指标的接口。

- [状态存储](#state-storage)

  * 在[状态存储](#state-storage)中存储和检索状态的接口。

## 规范

规范包含函数的基本信息。

### 获取输入 Topic

`getInputTopics` 方法获取所有输入 Topic 的**名称列表**。

此示例演示如何在 Java 窗口函数中获取所有输入 Topic 的名称列表。

```java
public class GetInputTopicsWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        Collection<String> inputTopics = context.getInputTopics();
        System.out.println(inputTopics);

        return null;
    }

}
```

### 获取输出 Topic

`getOutputTopic` 方法获取消息发送到的**Topic 名称**。

此示例演示如何在 Java 窗口函数中获取输出 Topic 的名称。

```java
public class GetOutputTopicWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        String outputTopic = context.getOutputTopic();
        System.out.println(outputTopic);

        return null;
    }
}
```

### 获取租户

`getTenant` 方法获取与窗口函数关联的租户名称。

此示例演示如何在 Java 窗口函数中获取租户名称。

```java
public class GetTenantWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        String tenant = context.getTenant();
        System.out.println(tenant);

        return null;
    }

}
```

### 获取命名空间

`getNamespace` 方法获取与窗口函数关联的命名空间。

此示例演示如何在 Java 窗口函数中获取命名空间。

```java
public class GetNamespaceWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        String ns = context.getNamespace();
        System.out.println(ns);

        return null;
    }
}
```

### 获取函数名称

`getFunctionName` 方法获取窗口函数名称。

此示例演示如何在 Java 窗口函数中获取函数名称。

```java
public class GetNameOfWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        String functionName = context.getFunctionName();
        System.out.println(functionName);

        return null;
    }

}
```

### 获取函数 ID

`getFunctionId` 方法获取窗口函数 ID。

此示例演示如何在 Java 窗口函数中获取函数 ID。

```java
public class GetFunctionIDWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        String functionID = context.getFunctionId();
        System.out.println(functionID);

        return null;
    }
}
```

### 获取函数版本

`getFunctionVersion` 方法获取窗口函数版本。

此示例演示如何在 Java 窗口函数中获取函数版本。

```java
public class GetVersionOfWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        String functionVersion = context.getFunctionVersion();
        System.out.println(functionVersion);

        return null;
    }
}
```

### 获取实例 ID

`getInstanceId` 方法获取窗口函数的实例 ID。

此示例演示如何在 Java 窗口函数中获取实例 ID。

```java
public class GetInstanceIDWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        int instanceId = context.getInstanceId();
        System.out.println(instanceId);

        return null;
    }
}
```

### 获取实例数量

`getNumInstances` 方法获取调用窗口函数的实例数量。

此示例演示如何在 Java 窗口函数中获取实例数量。

```java
public class GetNumInstancesWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        int numInstances = context.getNumInstances();
        System.out.println(numInstances);

        return null;
    }
}
```

### 获取输出 Schema 类型

`getOutputSchemaType` 方法获取输出 Schema 的内置类型或自定义类名。

此示例演示如何在 Java 窗口函数中获取输出 Schema 类型。

```java
public class GetOutputSchemaTypeWindowFunction implements WindowFunction<String, Void> {

    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        String schemaType = context.getOutputSchemaType();
        System.out.println(schemaType);

        return null;
    }
}
```

## 日志记录器

使用 Java SDK 的 Pulsar 窗口函数可以访问 [SLF4j](https://www.slf4j.org/) [`Logger`](https://www.slf4j.org/api/org/apache/log4j/Logger.html) 对象，可用于在所选日志级别生成日志。

此示例在 Java 函数中根据传入字符串是否包含单词 `danger` 来记录 `WARNING` 级别或 `INFO` 级别的日志。

```java
import java.util.Collection;
import org.apache.pulsar.functions.api.Record;
import org.apache.pulsar.functions.api.WindowContext;
import org.apache.pulsar.functions.api.WindowFunction;
import org.slf4j.Logger;

public class LoggingWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        Logger log = context.getLogger();
        for (Record<String> record : inputs) {
            log.info(record + "-window-log");
        }
        return null;
    }

}
```

如果您需要函数生成日志，请在创建或运行函数时指定日志 Topic。

```bash
bin/pulsar-admin functions create \
  --jar $PWD/my-functions.jar \
  --classname my.package.LoggingFunction \
  --log-topic persistent://public/default/logging-function-logs \
  # 其他函数配置
```

您可以通过 `persistent://public/default/logging-function-logs` Topic 访问 `LoggingFunction` 生成的所有日志。

## 指标

Pulsar 窗口函数可以向指标接口发布任意指标，这些指标可以被查询。

:::note

如果 Pulsar 窗口函数使用 Java 的语言原生接口，该函数无法向 Pulsar 发布指标和统计信息。

:::

您可以使用上下文对象基于每个键记录指标。

此示例在 Java 函数中每次函数处理消息时为 `process-count` 键设置指标，为 `elevens-count` 键设置不同的指标。

```java
import java.util.Collection;
import org.apache.pulsar.functions.api.Record;
import org.apache.pulsar.functions.api.WindowContext;
import org.apache.pulsar.functions.api.WindowFunction;


/**
 * 示例函数，用于跟踪
 * 每条发送消息的事件时间。
 */
public class UserMetricWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {

        for (Record<String> record : inputs) {
            if (record.getEventTime().isPresent()) {
                context.recordMetric("MessageEventTime", record.getEventTime().get().doubleValue());
            }
        }

        return null;
    }
}
```

## 用户配置

当您运行或更新使用 SDK 创建的 Pulsar Functions 时，可以使用 `--user-config` 标志向它们传递任意键/值对。键/值对**必须**指定为 JSON。

此示例将用户配置的键/值传递给函数。

```bash
bin/pulsar-admin functions create \
  --name word-filter \
 --user-config '{"forbidden-word":"rosebud"}' \
  # 其他函数配置
```

### API
您可以使用以下 API 获取窗口函数的用户定义信息。
#### getUserConfigMap

`getUserConfigMap` API 获取窗口函数的所有用户定义键/值配置的映射。

```java
/**
     * 获取函数的所有用户定义键/值配置的映射。
     *
     * @return 用户定义配置值的完整映射
     */
    Map<String, Object> getUserConfigMap();
```

#### getUserConfigValue

`getUserConfigValue` API 获取用户定义的键/值。

```java
/**
     * 获取任何用户定义的键/值。
     *
     * @param key 键
     * @return 用户为该键指定的 Optional 值。
     */
    Optional<Object> getUserConfigValue(String key);
```

#### getUserConfigValueOrDefault

`getUserConfigValueOrDefault` API 获取用户定义的键/值，如果没有则获取默认值。

```java
/**
     * 获取任何用户定义的键/值，如果没有则获取默认值。
     *
     * @param key
     * @param defaultValue
     * @return 用户配置值或提供的默认值
     */
    Object getUserConfigValueOrDefault(String key, Object defaultValue);
```

此示例演示如何访问提供给 Pulsar 窗口函数的键/值对。

Java SDK 上下文对象使您能够通过命令行（作为 JSON）访问提供给 Pulsar 窗口函数的键/值对。

:::tip

对于传递给 Java 窗口函数的所有键/值对，`key` 和 `value` 都是 `String`。要将值设置为不同的类型，您需要从 `String` 类型反序列化它。

:::

此示例在 Java 窗口函数中传递键/值对。

```bash
bin/pulsar-admin functions create \
   --user-config '{"word-of-the-day":"verdure"}' \
  # 其他函数配置
```

此示例在 Java 窗口函数中访问值。

`UserConfigFunction` 函数每次调用函数时（即每次消息到达时）记录字符串 `"The word of the day is verdure"`。只有当通过多种方式（如命令行工具或 REST API）使用新配置值更新函数时，`word-of-the-day` 的用户配置才会更改。

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;
import org.slf4j.Logger;

import java.util.Optional;

public class UserConfigWindowFunction implements WindowFunction<String, String> {
    @Override
    public String process(Collection<Record<String>> input, WindowContext context) throws Exception {
        Optional<Object> whatToWrite = context.getUserConfigValue("WhatToWrite");
        if (whatToWrite.get() != null) {
            return (String)whatToWrite.get();
        } else {
            return "Not a nice way";
        }
    }
}
```

如果没有提供值，您可以访问整个用户配置映射或设置默认值。

```java
// 获取整个配置映射
Map<String, String> allConfigs = context.getUserConfigMap();

// 获取值或使用默认值
String wotd = context.getUserConfigValueOrDefault("word-of-the-day", "perspicacious");
```

## 路由

您可以使用 `context.publish()` 接口发布任意数量的结果。

此示例显示 `PublishFunction` 类在 Java 函数中使用上下文中的内置函数向 `publishTopic` 发布消息。

```java
public class PublishWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> input, WindowContext context) throws Exception {
        String publishTopic = (String) context.getUserConfigValueOrDefault("publish-topic", "publishtopic");
        String output = String.format("%s!", input);
        context.publish(publishTopic, output);

        return null;
    }

}
```

## 状态存储

Pulsar 窗口函数使用 [Apache BookKeeper](https://bookkeeper.apache.org) 作为状态存储接口。Apache Pulsar 安装（包括独立安装）包括 BookKeeper bookies 的部署。

Apache Pulsar 与 Apache BookKeeper `table service` 集成以存储函数的 `state`。例如，`WordCount` 函数可以通过 Pulsar Functions 状态 API 将其 `counters` 状态存储到 BookKeeper 表服务中。

状态是键值对，其中键是字符串，值是任意的二进制数据——计数器存储为 64 位大端二进制值。键的作用域限定为单个 Pulsar Function，并在该函数的实例之间共享。

目前，Pulsar 窗口函数暴露 Java API 来访问、更新和管理状态。当您使用 Java SDK 函数时，这些 API 在上下文对象中可用。

| Java API| 描述
|---|---
|`incrCounter`|增加由键引用的内置分布式计数器。
|`getCounter`|获取键的计数器值。
|`putState`|更新键的状态值。

您可以使用以下 API 在 Java 窗口函数中访问、更新和管理状态。

#### incrCounter

`incrCounter` API 增加由键引用的内置分布式计数器。

应用程序使用 `incrCounter` API 将给定 `key` 的计数器更改为给定的 `amount`。如果 `key` 不存在，则创建新键。

```java
    /**
     * 增加由键引用的内置分布式计数器
     * @param key 键的名称
     * @param amount 要增加的量
     */
    void incrCounter(String key, long amount);
```

#### getCounter

`getCounter` API 获取键的计数器值。

应用程序使用 `getCounter` API 检索由 `incrCounter` API 更改的给定 `key` 的计数器。

```java
    /**
     * 检索键的计数器值。
     *
     * @param key 键的名称
     * @return 此键的计数器值的量
     */
    long getCounter(String key);
```

除了 `getCounter` API 之外，Pulsar 还为函数暴露了通用的键/值 API（`putState`）来存储通用的键/值状态。

#### putState

`putState` API 更新键的状态值。

```java
    /**
     * 更新键的状态值。
     *
     * @param key 键的名称
     * @param value 键的状态值
     */
    void putState(String key, ByteBuffer value);
```

此示例演示应用程序如何在 Pulsar 窗口函数中存储状态。

`WordCountWindowFunction` 的逻辑简单明了。

1. 函数首先使用正则表达式 `\\.` 将接收到的字符串拆分为多个单词。

2. 对于每个 `word`，函数通过 `incrCounter(key, amount)` 将相应的 `counter` 增加 1。

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;

import java.util.Arrays;

public class WordCountWindowFunction implements WindowFunction<String, Void> {
    @Override
    public Void process(Collection<Record<String>> inputs, WindowContext context) throws Exception {
        for (Record<String> input : inputs) {
            Arrays.asList(input.getValue().split("\\.")).forEach(word -> context.incrCounter(word, 1));
        }
        return null;

    }
}
```
