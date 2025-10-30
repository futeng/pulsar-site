---
id: functions-develop-state
title: 配置状态存储
sidebar_label: "配置状态存储"
description: 在 Pulsar 中为函数配置状态存储。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


Pulsar Functions 使用 [Apache BookKeeper](https://bookkeeper.apache.org) 作为状态存储接口。Pulsar 与 BookKeeper [表服务](https://docs.google.com/document/d/155xAwWv5IdOitHh1NVMEwCMGgB28M3FyMiQSxEpjE-Y/edit#heading=h.56rbh52koe3f) 集成，为函数存储状态。例如，`WordCount` 函数可以通过 [状态 API](#调用状态-api) 将其计数器的状态存储到 BookKeeper 表服务中。

状态是键值对，其中键是字符串，其值是任意的二进制数据——计数器存储为 64 位大端二进制值。键的作用域限定于单个函数，并在该函数的实例之间共享。

:::note

状态存储**不**适用于 Go 函数。

:::


## 调用状态 API

Pulsar Functions 暴露了用于变更和访问 `state` 的 API。当您使用 [Java/Python SDK](functions-develop-api.md) 开发函数时，这些 API 在 [Context](functions-concepts.md#context) 对象中可用。

下表概述了可以在 Java 和 Python 函数中访问的状态。

| 状态相关 API                       | Java                                   | Python         |
|-----------------------------------------|----------------------------------------|----------------|
| [递增计数器](#递增计数器) | `incrCounter` <br />`incrCounterAsync` | `incr_counter` |
| [检索计数器](#检索计数器)   | `getCounter` <br />`getCounterAsync`   | `get_counter`  |
| [更新状态](#更新状态)           | `putState` <br />`putStateAsync`       | `put_state`    |
| [检索状态](#检索状态)       | `getState` <br />`getStateAsync`       | `get_state`    |
| [删除状态](#删除状态)           | `deleteState`                          | `del_counter`  |


## 递增计数器

您可以使用 `incrCounter` 将给定 `key` 的计数器递增给定的 `amount`。
如果 `key` 不存在，则会创建一个新键。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

```java
    /**
     * 递增由 key 引用的内置分布式计数器
     * @param key 键的名称
     * @param amount 要递增的数量
     */
    void incrCounter(String key, long amount);
```

要异步递增计数器，您可以使用 `incrCounterAsync`。

```java
     /**
     * 递增由 key 引用的内置分布式计数器
     * 但不等待递增操作完成
     *
     * @param key 键的名称
     * @param amount 要递增的数量
     */
    CompletableFuture<Void> incrCounterAsync(String key, long amount);
```

</TabItem>
<TabItem value="Python">

```python
  def incr_counter(self, key, amount):
    """在托管状态中递增给定键的计数器"""
```

</TabItem>
</Tabs>
````

### 检索计数器

您可以使用 `getCounter` 检索由 `incrCounter` 变更的给定 `key` 的计数器。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

```java
    /**
     * 检索键的计数器值。
     *
     * @param key 键的名称
     * @return 此键的计数器值的数量
     */
    long getCounter(String key);
```

要异步检索由 `incrCounterAsync` 变更的计数器，您可以使用 `getCounterAsync`。


```java
     /**
     * 检索键的计数器值，但不等待
     * 操作完成
     *
     * @param key 键的名称
     * @return 此键的计数器值的数量
     */
    CompletableFuture<Long> getCounterAsync(String key);
```

</TabItem>
<TabItem value="Python">

```python
  def get_counter(self, key):
    """在托管状态中获取给定键的计数器"""
```

</TabItem>
</Tabs>
````

### 更新状态

除了 `counter` API 外，Pulsar 还暴露了一个通用的键值 API，供函数存储和更新给定 `key` 的状态。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

```java
    /**
     * 更新键的状态值。
     *
     * @param key 键的名称
     * @param value 键的状态值
     */
    void putState(String key, ByteBuffer value);
```

要异步更新给定 `key` 的状态，您可以使用 `putStateAsync`。

```java
    /**
     * 更新键的状态值，但不等待操作完成
     *
     * @param key 键的名称
     * @param value 键的状态值
     */
    CompletableFuture<Void> putStateAsync(String key, ByteBuffer value);
```

</TabItem>
<TabItem value="Python">

```python
  def put_state(self, key, value):
    """更新托管状态中给定键的值"""
```

</TabItem>
</Tabs>
````

### 检索状态

您可以使用 `getState` 检索给定 `key` 的状态。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">

```java
    /**
     * 检索键的状态值。
     *
     * @param key 键的名称
     * @return 键的状态值。
     */
    ByteBuffer getState(String key);
```

要异步检索给定 `key` 的状态，您可以使用 `getStateAsync`。

```java
    /**
     * 检索键的状态值，但不等待操作完成
     *
     * @param key 键的名称
     * @return 键的状态值。
     */
    CompletableFuture<ByteBuffer> getStateAsync(String key);
```

</TabItem>
<TabItem value="Python">

```python
  def get_state(self, key):
    """在托管状态中获取给定键的值"""
```

</TabItem>
</Tabs>
````

### 删除状态

:::note

计数器和二进制值共享相同的键空间，因此此 API 会删除任一类型。

:::

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
    /**
     * 删除键的状态值。
     *
     * @param key   键的名称
     */
    void deleteState(String key);
```

</TabItem>
</Tabs>
````


## 通过 CLI 查询状态

除了使用 [状态 API](#调用状态-api) 将函数状态存储在 Pulsar 的状态存储中并从存储中检索回来外，您还可以使用 CLI 命令查询函数的状态。

```bash
bin/pulsar-admin functions querystate \
    --tenant <tenant> \
    --namespace <namespace> \
    --name <function-name> \
    --state-storage-url <bookkeeper-service-url> \
    --key <state-key> \
    [---watch]
```

如果指定了 `--watch`，CLI 工具会保持运行以获取提供的 `state-key` 的最新值。


## 示例

`WordCountFunction` 的示例演示了 `state` 如何在 Pulsar Functions 中存储。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"}]}>
<TabItem value="Java">


{@inject:github:WordCountFunction:/pulsar-functions/java-examples/src/main/java/org/apache/pulsar/functions/api/examples/WordCountFunction.java} 的逻辑简单明了：

1. 函数使用正则表达式 `\\.` 将接收到的 `String` 拆分为多个单词。
2. 对于每个 `word`，函数通过 `incrCounter(key, amount)` 将 `counter` 递增 1。

   ```java
   import org.apache.pulsar.functions.api.Context;
   import org.apache.pulsar.functions.api.Function;

   import java.util.Arrays;

   public class WordCountFunction implements Function<String, Void> {
       @Override
       public Void process(String input, Context context) throws Exception {
           Arrays.asList(input.split("\\.")).forEach(word -> context.incrCounter(word, 1));
           return null;
       }
   }
   ```

</TabItem>
<TabItem value="Python">

这个 `WordCount` 函数的逻辑简单明了：

1. 函数首先将接收到的字符串拆分为多个单词。
2. 对于每个 `word`，函数通过 `incr_counter(key, amount)` 将 `counter` 递增 1。

   ```python
   from pulsar import Function

   class WordCount(Function):
       def process(self, item, context):
           for word in item.split():
               context.incr_counter(word, 1)
   ```

</TabItem>
</Tabs>
````