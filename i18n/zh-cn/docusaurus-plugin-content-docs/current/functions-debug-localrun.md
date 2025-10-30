---
id: functions-debug-localrun
title: 使用本地运行模式进行调试
sidebar_label: "使用本地运行模式进行调试"
description: 学习在 Pulsar 中使用本地运行模式调试函数。
---

在本地运行模式下，函数从 Pulsar 集群消费实际数据并向集群生产数据，镜像了函数在 Pulsar 集群中的运行方式。这提供了一种测试函数的方法，允许您在本地机器上作为线程启动函数实例，以便于调试。

:::note

在 Pulsar 2.4.0 或更高版本中，使用本地运行模式进行调试仅适用于 Java 函数。

:::

在使用本地运行模式之前，您需要添加以下依赖。

```xml
<dependency>
    <groupId>org.apache.pulsar</groupId>
    <artifactId>pulsar-functions-local-runner-original</artifactId>
    <version>${pulsar.version}</version>
</dependency>

<dependency>
    <groupId>com.google.protobuf</groupId>
    <artifactId>protobuf-java</artifactId>
    <version>3.21.9</version>
</dependency>
```

例如，您可以通过以下方式运行您的函数。

```java
FunctionConfig functionConfig = new FunctionConfig();
functionConfig.setName(functionName);
functionConfig.setInputs(Collections.singleton(sourceTopic));
functionConfig.setClassName(ExclamationFunction.class.getName());
functionConfig.setRuntime(FunctionConfig.Runtime.JAVA);
functionConfig.setOutput(sinkTopic);

LocalRunner localRunner = LocalRunner.builder().functionConfig(functionConfig).build();
localRunner.start(true);
```

您可以使用 IDE 调试函数。设置断点并手动单步执行函数以使用真实数据进行调试。

以下代码示例展示了如何在本地运行模式下运行函数。

```java
public class ExclamationFunction implements Function<String, String> {

    @Override
    public String process(String s, Context context) throws Exception {
        return s + "!";
    }

    public static void main(String[] args) throws Exception {
        FunctionConfig functionConfig = new FunctionConfig();
        functionConfig.setName("exclamation");
        functionConfig.setInputs(Collections.singleton("input"));
        functionConfig.setClassName(ExclamationFunction.class.getName());
        functionConfig.setRuntime(FunctionConfig.Runtime.JAVA);
        functionConfig.setOutput("output");

        LocalRunner localRunner = LocalRunner.builder().functionConfig(functionConfig).build();
        localRunner.start(false);
    }
}
```