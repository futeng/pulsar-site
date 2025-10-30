---
id: functions-develop-metrics
title: 使用指标监控函数
sidebar_label: "使用指标监控函数"
description: 使用指标在 Pulsar 中监控函数。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

为确保运行的函数在任何时候都是健康的，您可以配置函数将任意指标发布到可以查询的 `metrics` 接口。

:::note

使用 Java 或 Python 的语言原生接口**无法**将指标和统计数据发布到 Pulsar。

:::

您可以使用内置指标和自定义指标来监控函数。
- 使用内置的 [函数指标](reference-metrics.md#pulsar-functions)。
  Pulsar Functions 暴露了可以收集并用于监控 Java、Python 和 Go 函数健康状况的指标。您可以按照 [监控](deploy-monitoring.md#function-and-connector-stats) 指南检查指标。
- 设置您的自定义指标。
  除了内置指标外，Pulsar 还允许您为 Java 和 Python 函数自定义指标。函数工作者会自动将用户定义的指标收集到 Prometheus，您可以在 Grafana 中查看它们。

以下是如何使用 [`Context 对象`](functions-concepts.md#context) 为 Java、Python 和 Go 函数按每个键自定义指标的示例。例如，您可以为 `process-count` 键设置指标，并在每次函数处理消息时为 `elevens-count` 键设置另一个指标。


````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;

public class MetricRecorderFunction implements Function<Integer, Void> {
    @Override
    public void apply(Integer input, Context context) {
        // 每次消息到达时记录指标 1
        context.recordMetric("hit-count", 1);

        // 仅当到达的数字等于 11 时记录指标
        if (input == 11) {
            context.recordMetric("elevens-count", 1);
        }

        return null;
    }
}
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Function

class MetricRecorderFunction(Function):
    def process(self, input, context):
        context.record_metric('hit-count', 1)

        if input == 11:
            context.record_metric('elevens-count', 1)
```

</TabItem>
<TabItem value="Go">

```go
func metricRecorderFunction(ctx context.Context, in []byte) error {
	inputstr := string(in)
	fctx, ok := pf.FromContext(ctx)
	if !ok {
		return errors.New("获取 Go Functions 上下文错误")
	}
	fctx.RecordMetric("hit-count", 1)
	if inputstr == "eleven" {
		fctx.RecordMetric("elevens-count", 1)
	}
	return nil
}
```

</TabItem>
</Tabs>
````