---
id: functions-debug-unit-test
title: 使用单元测试进行调试
sidebar_label: "使用单元测试进行调试"
description: 学习在 Pulsar 中使用单元测试调试函数。
---


与任何有输入和输出的函数一样，您可以像测试任何其他函数一样测试 Pulsar Functions。

:::note

Pulsar 使用 TestNG 进行测试。

:::

例如，如果您有以下通过 Java 语言原生接口编写的函数：

```java
import java.util.function.Function;

public class JavaNativeExclamationFunction implements Function<String, String> {
   @Override
   public String apply(String input) {
       return String.format("%s!", input);
   }
}
```

您可以编写一个简单的单元测试来测试该函数。

```java
@Test
public void testJavaNativeExclamationFunction() {
   JavaNativeExclamationFunction exclamation = new JavaNativeExclamationFunction();
   String output = exclamation.apply("foo");
   Assert.assertEquals(output, "foo!");
}
```

以下示例是通过 Java SDK 编写的。

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

您可以编写一个单元测试来测试此函数并模拟 `Context` 参数，如下所示。

```java
@Test
public void testExclamationFunction() {
   ExclamationFunction exclamation = new ExclamationFunction();
   String output = exclamation.process("foo", mock(Context.class));
   Assert.assertEquals(output, "foo!");
}
```