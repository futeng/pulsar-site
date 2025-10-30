---
id: adaptors-spark
title: Pulsar 的 Apache Spark 适配器
sidebar_label: "Apache Spark"
description: 全面了解 Pulsar 的 Apache Spark 适配器的概念、配置方法和使用方式。
---

## Spark Streaming 接收器

Pulsar 的 Spark Streaming 接收器是一个自定义接收器，使 Apache [Spark Streaming](https://spark.apache.org/streaming/) 能够从 Pulsar 接收原始数据。

应用程序可以通过 Spark Streaming 接收器以[弹性分布式数据集](https://spark.apache.org/docs/latest/programming-guide.html#resilient-distributed-datasets-rdds)（RDD）格式接收数据，并以多种方式进行处理。

### 前提条件

要使用接收器，请在 Java 配置中包含 `pulsar-spark` 库的依赖。

#### Maven

如果您使用 Maven，请将以下内容添加到您的 `pom.xml`：

```xml
<!-- 在您的 <properties> 块中 -->
<pulsar.version>@pulsar:version@</pulsar.version>

<!-- 在您的 <dependencies> 块中 -->
<dependency>
  <groupId>org.apache.pulsar</groupId>
  <artifactId>pulsar-spark</artifactId>
  <version>${pulsar.version}</version>
</dependency>
```

#### Gradle

如果您使用 Gradle，请将以下内容添加到您的 `build.gradle` 文件：

```groovy
def pulsarVersion = "@pulsar:version@"

dependencies {
    compile group: 'org.apache.pulsar', name: 'pulsar-spark', version: pulsarVersion
}
```

### 使用方法

将 `SparkStreamingPulsarReceiver` 的实例传递给 `JavaStreamingContext` 中的 `receiverStream` 方法：

```java
    String serviceUrl = "pulsar://localhost:6650/";
    String topic = "persistent://public/default/test_src";
    String subs = "test_sub";

    SparkConf sparkConf = new SparkConf().setMaster("local[*]").setAppName("Pulsar Spark 示例");

    JavaStreamingContext jsc = new JavaStreamingContext(sparkConf, Durations.seconds(60));

    ConsumerConfigurationData<byte[]> pulsarConf = new ConsumerConfigurationData();

    Set<String> set = new HashSet();
    set.add(topic);
    pulsarConf.setTopicNames(set);
    pulsarConf.setSubscriptionName(subs);

    SparkStreamingPulsarReceiver pulsarReceiver = new SparkStreamingPulsarReceiver(
        serviceUrl,
        pulsarConf,
        new AuthenticationDisabled());

    JavaReceiverInputDStream<byte[]> lineDStream = jsc.receiverStream(pulsarReceiver);
```

完整示例请点击[这里](https://github.com/apache/pulsar-adapters/blob/master/examples/spark/src/main/java/org/apache/spark/streaming/receiver/example/SparkStreamingPulsarReceiverExample.java)。在此示例中，统计接收到的消息中包含字符串 "Pulsar" 的消息数量。

请注意，如果需要，可以使用其他 Pulsar 认证类。例如，要在认证期间使用 token，可以为 `SparkStreamingPulsarReceiver` 构造函数设置以下参数：

```java
SparkStreamingPulsarReceiver pulsarReceiver = new SparkStreamingPulsarReceiver(
    serviceUrl,
    pulsarConf,
    new AuthenticationToken("token:<secret-JWT-token>"));
```