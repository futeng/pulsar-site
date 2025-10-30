---
id: functions-develop-tutorial
title: 教程
sidebar_label: "教程"
description: 在 Pulsar 中开发函数的教程示例。
---

## 编写词频统计函数

:::note

以下示例是一个有状态函数。默认情况下，函数的状态是禁用的。有关更多说明，请参阅 [启用有状态函数](functions-worker-stateful.md)。

:::

要编写词频统计函数，请完成以下步骤。

1. 使用 [Java SDK](functions-develop-api.md) 用 Java 编写函数。

   ```java
    package org.example.functions;

    import org.apache.pulsar.functions.api.Context;
    import org.apache.pulsar.functions.api.Function;

    import java.util.Arrays;

    public class WordCountFunction implements Function<String, Void> {
        // 每当消息发布到输入 Topic 时都会调用此函数
        @Override
        public Void process(String input, Context context) throws Exception {
            Arrays.asList(input.split(" ")).forEach(word -> {
                String counterKey = word.toLowerCase();
                context.incrCounter(counterKey, 1);
            });
            return null;
        }
    }
   ```

2. 打包并构建 JAR 文件，然后使用 `pulsar-admin` 命令将其部署到您的 Pulsar 集群中。

   ```bash
   bin/pulsar-admin functions create \
      --jar $PWD/target/my-jar-with-dependencies.jar \
      --classname org.example.functions.WordCountFunction \
      --tenant public \
      --namespace default \
      --name word-count \
      --inputs persistent://public/default/sentences \
      --output persistent://public/default/count
   ```

## 编写基于内容路由的函数

要编写基于内容路由的函数，请完成以下步骤。

1. 使用 [Python SDK](functions-develop-api.md) 用 Python 编写函数。

   ```python
    from pulsar import Function

    class RoutingFunction(Function):
        def __init__(self):
            self.fruits_topic = "persistent://public/default/fruits"
            self.vegetables_topic = "persistent://public/default/vegetables"

        def is_fruit(item):
            return item in [b"apple", b"orange", b"pear", b"other fruits..."]

        def is_vegetable(item):
            return item in [b"carrot", b"lettuce", b"radish", b"other vegetables..."]

        def process(self, item, context):
            if self.is_fruit(item):
                context.publish(self.fruits_topic, item)
            elif self.is_vegetable(item):
                context.publish(self.vegetables_topic, item)
            else:
                warning = "项目 {0} 既不是水果也不是蔬菜".format(item)
                context.get_logger().warn(warning)
   ```

2. 假设此代码存储在 `~/router.py` 中，那么您可以使用 `pulsar-admin` 命令将其部署到您的 Pulsar 集群中。

   ```bash
   bin/pulsar-admin functions create \
      --py ~/router.py \
      --classname router.RoutingFunction \
      --tenant public \
      --namespace default \
      --name route-fruit-veg \
      --inputs persistent://public/default/basket-items
   ```

## 编写词频统计窗口函数

:::note

目前，窗口函数仅在 Java 中可用。

:::

此示例演示如何使用 [语言原生接口](functions-develop-api.md) 用 Java 编写窗口函数。

每个输入消息是一个句子，被拆分成单词并统计每个单词。使用内置计数器状态以持久化和一致的方式跟踪词频。

```java
public class WordCountFunction implements Function<String, Void> {
    @Override
    public Void process(String input, Context context) {
        Arrays.asList(input.split("\\s+")).forEach(word -> context.incrCounter(word, 1));
        return null;
    }
}
```