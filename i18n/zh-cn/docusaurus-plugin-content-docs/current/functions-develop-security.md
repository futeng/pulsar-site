---
id: functions-develop-security
title: 为函数启用安全
sidebar_label: "为函数启用安全"
description: 学习在 Pulsar 中为函数启用安全。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

如果您想为函数启用安全，请完成以下步骤。

## 先决条件

- 如果您想为函数启用安全，首先需要 [启用安全设置](functions-worker.md) 在函数工作者上。

## 步骤 1：配置函数工作者

要从上下文中使用 secret API，您需要为函数工作者设置以下两个参数。
* `secretsProviderConfiguratorClassName`
* `secretsProviderConfiguratorConfig`

Pulsar Functions 提供了两种类型的 `SecretsProviderConfigurator` 实现，两者都可以直接用作 `secretsProviderConfiguratorClassName` 的值：
* `org.apache.pulsar.functions.secretsproviderconfigurator.DefaultSecretsProviderConfigurator`：这是一个简化版本的 secret 提供者，它将 `ClearTextSecretsProvider` 连接到函数实例。
* `org.apache.pulsar.functions.secretsproviderconfigurator.KubernetesSecretsProviderConfigurator`：这是在 Kubernetes 中运行时默认使用的，它使用 Kubernetes 内置的 secrets 并将它们作为环境变量（通过 `EnvironmentBasedSecretsProvider`）绑定到函数容器内，以确保 secrets 在运行时对函数可用。

函数工作者使用 `org.apache.pulsar.functions.secretsproviderconfigurator.SecretsProviderConfigurator` 接口在启动函数实例时选择 `SecretsProvider` 类名及其相关配置。

函数实例使用 `org.apache.pulsar.functions.secretsprovider.SecretsProvider` 接口来获取 secrets。`SecretsProvider` 使用的实现由 `SecretsProviderConfigurator` 决定。

如果您想为函数实例使用不同的 `SecretsProvider`，您也可以实现自己的 `SecretsProviderConfigurator`。

:::note

Java、Python 和 Go 运行时具有以下两个提供者：
- ClearTextSecretsProvider（`DefaultSecretsProviderConfigurator` 的默认值）
- EnvironmentBasedSecretsProvider（`KubernetesSecretsProviderConfigurator` 的默认值）

:::

## 步骤 2：获取 secret

一旦设置了 `SecretsProviderConfigurator`，您可以使用 [`Context`](functions-concepts.md#context) 对象获取 secret，如下所示。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;
import org.slf4j.Logger;

public class GetSecretValueFunction implements Function<String, Void> {

    @Override
    public Void process(String input, Context context) throws Exception {
        Logger LOG = context.getLogger();
        String secretValue = context.getSecret(input);

        if (!secretValue.isEmpty()) {
            LOG.info("Secret {} 的值为 {}", input, secretValue);
        } else {
            LOG.warn("没有键为 {} 的 secret", input);
        }

        return null;
    }
}
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Function

class GetSecretValueFunction(Function):
    def process(self, input, context):
        logger = context.get_logger()
        secret_value = context.get_secret(input)
        if secret_provider is None:
            logger.warn('没有键为 {0} 的 secret'.format(input))
        else:
            logger.info("Secret {0} 的值为 {1}".format(input, secret_value))
```

</TabItem>
<TabItem value="Go">

```go
func secretLoggerFunc(ctx context.Context, input []byte) {
    fc, ok := pf.FromContext(ctx)
    if !ok {
        logutil.Fatal("未定义函数上下文")
    }

    secretValue := fc.GetSecretValue(string(input))

    if secretValue == nil {
        logutil.Warnf("没有键为 %s 的 secret", input)
    } else {
        logutil.Infof("Secret %s 的值为 %s", input, secretValue)
    }
}
```

</TabItem>
</Tabs>
````