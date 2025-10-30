---
id: functions-develop-log
title: 生成函数日志
sidebar_label: "生成函数日志"
description: 学习在 Pulsar 中为函数生成日志。
---

## 为 Java 函数生成日志

使用 Java SDK 的 Pulsar Functions 可以访问 [SLF4j `Logger`](https://www.slf4j.org/api/org/apache/log4j/Logger.html) 对象。logger 对象可用于在指定的日志级别生成日志。

例如，以下函数根据传入字符串是否包含单词 `danger` 来记录 `WARNING` 或 `INFO` 级别的日志。

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
            LOG.warn("在消息 {} 中收到警告", messageId);
        } else {
            LOG.info("收到消息 {}\n内容：{}", messageId, input);
        }

        return null;
    }
}
```

要使您的函数能够生成日志，您需要在创建或运行函数时指定日志 Topic。以下是一个示例。

```bash
bin/pulsar-admin functions create \
  --jar $PWD/my-functions.jar \
  --classname my.package.LoggingFunction \
  --log-topic persistent://public/default/logging-function-logs \
  # 其他函数配置
```

您可以通过 `persistent://public/default/logging-function-logs` Topic 访问 `LoggingFunction` 生成的所有日志。

### 为 Java 函数自定义日志级别

默认情况下，Java 函数的日志级别是 `info`。如果您想自定义 Java 函数的日志级别，例如将其更改为 `debug`，您可以更新 [`functions_log4j2.xml`](https://github.com/apache/pulsar/blob/master/conf/functions_log4j2.xml) 文件。

:::tip

`functions_log4j2.xml` 文件位于您的 Pulsar 配置目录下，例如裸金属上的 `/etc/pulsar/`，或 Kubernetes 上的 `/pulsar/conf`。

:::

1. 设置 `property` 的值。

   ```xml
        <Property>
            <name>pulsar.log.level</name>
            <value>debug</value>
        </Property>
   ```

2. 将日志级别应用到引用它们的地方。在以下示例中，`debug` 应用于所有函数日志。

   ```xml
        <Root>
            <level>${sys:pulsar.log.level}</level>
            <AppenderRef>
                <ref>${sys:pulsar.log.appender}</ref>
                <level>${sys:pulsar.log.level}</level>
            </AppenderRef>
        </Root>
   ```

   要更具选择性，您可以为不同的类或模块应用不同的日志级别。例如：

   ```xml
        <Logger>
            <name>com.example.module</name>
            <level>info</level>
            <additivity>false</additivity>
            <AppenderRef>
                <ref>${sys:pulsar.log.appender}</ref>
            </AppenderRef>
        </Logger>
   ```

   要为模块中的类应用更详细的日志级别，您可以参考以下示例：

   ```xml
        <Logger>
            <name>com.example.module.className</name>
            <level>debug</level>
            <additivity>false</additivity>
            <AppenderRef>
                <ref>Console</ref>
            </AppenderRef>
        </Logger>
   ```

   * `additivity` 表示如果多个 `<Logger>` 条目重叠，日志消息是否会重复。禁用可加性 (`false`) 可以在当一个或多个 `<Logger>` 条目包含重叠的类或模块时防止日志消息重复。
   * `AppenderRef` 允许您将日志输出到 `Appender` 部分定义中指定的目标。例如：

   ```xml
      <Console>
        <name>Console</name>
        <target>SYSTEM_OUT</target>
        <PatternLayout>
          <Pattern>%d{ISO8601_OFFSET_DATE_TIME_HHMM} [%t] %-5level %logger{36} - %msg%n</Pattern>
        </PatternLayout>
      </Console>
   ```

## 为 Python 函数生成日志

使用 Python SDK 的 Pulsar Functions 可以访问 logger 对象。logger 对象可用于在指定的日志级别生成日志。

例如，以下函数根据传入字符串是否包含单词 `danger` 来记录 `WARNING` 或 `INFO` 级别的日志。

```python
from pulsar import Function

class LoggingFunction(Function):
    def process(self, input, context):
        logger = context.get_logger()
        msg_id = context.get_message_id()
        if 'danger' in input:
            logger.warn("在消息 {0} 中收到警告".format(context.get_message_id()))
        else:
            logger.info("收到消息 {0}\n内容：{1}".format(msg_id, input))
```

要使您的函数能够生成日志，您需要在创建或运行函数时指定日志 Topic。以下是一个示例。

```bash
bin/pulsar-admin functions create \
  --py logging_function.py \
  --classname logging_function.LoggingFunction \
  --log-topic logging-function-logs \
  # 其他函数配置
```

`LoggingFunction` 生成的所有日志都可以通过 `logging-function-logs` Topic 访问。此外，您可以通过 `context.get_logger().setLevel(level)` 指定函数日志级别。有关更多信息，请参阅 [Python 日志工具](https://docs.python.org/3/library/logging.html#logging.Logger.setLevel)。

## 为 Go 函数生成日志

当您在 Go 函数中使用 `logTopic` 相关功能时，您可以导入 `github.com/apache/pulsar/pulsar-function-go/logutil`，而不是使用 `getLogger()` 上下文对象。

以下函数根据函数输入显示不同的日志级别。

```go
import (
    "context"

    "github.com/apache/pulsar/pulsar-function-go/pf"

    log "github.com/apache/pulsar/pulsar-function-go/logutil"
)

func loggerFunc(ctx context.Context, input []byte) {
	if len(input) <= 100 {
		log.Infof("此输入的长度为：%d", len(input))
	} else {
		log.Warnf("此输入太长了！它有 {%d} 个字符", len(input))
	}
}

func main() {
	pf.Start(loggerFunc)
}
```