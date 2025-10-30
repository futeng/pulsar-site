---
id: functions-develop-user-defined-configs
title: 传递用户定义配置
sidebar_label: "传递用户定义配置"
description: 学习在 Pulsar 中向函数传递用户定义配置。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

当您运行或更新通过 SDK 创建的函数时，您可以使用带有 `--user-config` 标志的 CLI 向它们传递任意的键值对。键值对必须指定为 JSON。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

:::note

对于传递给 Java 函数的所有键值对，键和值都是 `string`。要将值设置为不同的类型，您需要将其从 `string` 类型反序列化。

:::

Java SDK 的上下文对象使您能够访问通过 CLI（作为 JSON）提供给 Pulsar Functions 的键值对。以下示例传递了一个键值对。

```bash
bin/pulsar-admin functions create \
  # 其他函数配置 \
  --user-config '{"word-of-the-day":"verdure"}'
```

要在 Java 函数中访问该值：

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;
import org.slf4j.Logger;

import java.util.Optional;

public class UserConfigFunction implements Function<String, Void> {
    @Override
    public void apply(String input, Context context) {
        Logger LOG = context.getLogger();
        Optional<String> wotd = context.getUserConfigValue("word-of-the-day");
        if (wotd.isPresent()) {
            LOG.info("今日单词是 {}", wotd);
        } else {
            LOG.warn("未提供今日单词");
        }
        return null;
    }
}
```

`UserConfigFunction` 函数在每次调用函数时记录字符串 `"今日单词是 verdure"`。`word-of-the-day` 配置只能通过 CLI 使用新值更新函数时才能更改。

您还可以访问整个用户配置映射或在不存在值时设置默认值。

```java
// 获取整个配置映射
Map<String, String> allConfigs = context.getUserConfigMap();

// 获取值或使用默认值
String wotd = context.getUserConfigValueOrDefault("word-of-the-day", "perspicacious");
```

</TabItem>
<TabItem value="Python">

在 Python 函数中，您可以像这样访问配置值。

```python
from pulsar import Function

class WordFilter(Function):
    def process(self, context, input):
        forbidden_word = context.user_config()["forbidden-word"]

        # 如果消息包含用户提供的禁用词，则不发布消息
        if forbidden_word in input:
            pass
        # 否则发布消息
        else:
            return input
```

Python SDK 的上下文对象使您能够访问通过命令行（作为 JSON）提供给函数的键值对。以下示例传递了一个键值对。

```bash
bin/pulsar-admin functions create \
  # 其他函数配置 \
  --user-config '{"word-of-the-day":"verdure"}'
```

要在 Python 函数中访问该值：

```python
from pulsar import Function

class UserConfigFunction(Function):
    def process(self, input, context):
        logger = context.get_logger()
        wotd = context.get_user_config_value('word-of-the-day')
        if wotd is None:
            logger.warn('未提供今日单词')
        else:
            logger.info("今日单词是 {0}".format(wotd))
```

</TabItem>
<TabItem value="Go">

Go SDK 的上下文对象使您能够访问通过命令行（作为 JSON）提供给函数的键值对。以下示例传递了一个键值对。

```bash
bin/pulsar-admin functions create \
  --go path/to/go/binary
  --user-config '{"word-of-the-day":"lackadaisical"}'
```

要在 Go 函数中访问该值：

```go
func contextFunc(ctx context.Context) {
  fc, ok := pf.FromContext(ctx)
  if !ok {
    logutil.Fatal("未定义函数上下文")
  }

  wotd := fc.GetUserConfValue("word-of-the-day")

  if wotd == nil {
    logutil.Warn("今日单词为空")
  } else {
    logutil.Infof("今日单词是 %s", wotd.(string))
  }
}
```

</TabItem>
</Tabs>
````