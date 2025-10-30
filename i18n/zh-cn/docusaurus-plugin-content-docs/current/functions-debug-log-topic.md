---
id: functions-debug-log-topic
title: 使用日志 Topic 进行调试
sidebar_label: "使用日志 Topic 进行调试"
description: 学习在 Pulsar 中使用日志 Topic 调试函数。
---

使用 Pulsar Functions 时，您可以将函数中预定义的日志生成到指定的日志 Topic，并配置消费者从日志 Topic 消费消息。

例如，以下函数根据传入字符串是否包含单词 `danger` 来记录 WARNING 级别或 INFO 级别的日志。

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;
import org.slf4j.Logger;

public class LoggingFunction implements Function<String, Void> {
    @Override
    public void apply(String input, Context context) {
        Logger LOG = context.getLogger();
        String messageId = new String(context.getMessageId());

        if (input.contains("danger")) {
            LOG.warn("A warning was received in message {}", messageId);
        } else {
            LOG.info("Message {} received\nContent: {}", messageId, input);
        }

        return null;
    }
}
```

如示例所示，您可以通过 `context.getLogger()` 获取记录器，并将记录器分配给 `slf4j` 的 `LOG` 变量，这样您就可以使用 `LOG` 变量在函数中定义所需的日志。

同时，您需要指定日志可以发布到的 Topic。以下是一个示例。

```bash
bin/pulsar-admin functions create \
  --log-topic persistent://public/default/logging-function-logs \
  # 其他函数配置
```

发布到日志 Topic 的消息包含几个属性：
- `loglevel`：日志消息的级别。
- `fqn`：推送此日志消息的完全限定函数名称。
- `instance`：推送此日志消息的函数实例 ID。