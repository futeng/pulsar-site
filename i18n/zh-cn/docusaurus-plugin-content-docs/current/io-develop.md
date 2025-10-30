---
id: io-develop
title: How to develop Pulsar connectors
sidebar_label: "Develop"
description: Learn how to develop Pulsar connectors to move data between Pulsar and other systems.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


本指南描述了如何开发 Pulsar 连接器，在 Pulsar 和其他系统之间移动数据。

Pulsar 连接器是特殊的 [Pulsar Functions](functions-overview.md)，因此创建 Pulsar 连接器类似于创建 Pulsar function。

Pulsar 连接器有两种类型：

| 类型 | 描述 | 示例
|---|---|---
{@inject: github:Source:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Source.java}|从另一个系统导入数据到 Pulsar。|[RabbitMQ source connector](io-rabbitmq-source.md) 将 RabbitMQ 队列的消息导入到 Pulsar topic。
{@inject: github:Sink:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Sink.java}|从 Pulsar 导出数据到另一个系统。|[Kinesis sink connector](io-kinesis-sink.md) 将 Pulsar topic 的消息导出到 Kinesis 流。

## 开发

您可以开发 Pulsar source 连接器和 sink 连接器。

### Source

要开发 source 连接器，您需要实现 {@inject: github:open:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Source.java} 方法和 {@inject: github:read:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Source.java} 方法，本质上实现 {@inject: github:Source:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Source.java} 接口。

1. 实现 {@inject: github:open:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Source.java} 方法。

   ```java
   /**
   * Open connector with configuration
   *
   * @param config initialization config
   * @param sourceContext
   * @throws Exception IO type exceptions when opening a connector
   */
   void open(final Map<String, Object> config, SourceContext sourceContext) throws Exception;
   ```

   当 source 连接器初始化时调用此方法。

   在此方法中，您可以通过传入的 `config` 参数检索所有连接器特定的设置，并初始化所有必要的资源。

   例如，Kafka 连接器可以在此 `open` 方法中创建 Kafka 客户端。

   此外，Pulsar 运行时还为连接器提供了 `SourceContext`，用于访问运行时资源以执行收集指标等任务。实现可以保存 `SourceContext` 以供将来使用。

2. 实现 {@inject: github:read:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Source.java} 方法。

   ```java
       /**
       * Reads the next message from source.
       * If source does not have any new messages, this call should block.
       * @return next message from source.  The return result should never be null
       * @throws Exception
       */
       Record<T> read() throws Exception;
   ```

   如果没有可返回的内容，实现应该是阻塞的，而不是返回 `null`。

   返回的 {@inject: github:Record:/pulsar-functions/api-java/src/main/java/org/apache/pulsar/functions/api/Record.java} 应封装 Pulsar IO 运行时所需的以下信息。

   * {@inject: github:Record:/pulsar-functions/api-java/src/main/java/org/apache/pulsar/functions/api/Record.java} 应提供以下变量：

     |变量|必需|描述
     |---|---|---
     `TopicName`|否|记录来源的 Pulsar topic 名称。
     `Key`|否| 消息可以选择性地用键标记。<br /><br>有关更多信息，请参阅 [路由模式](concepts-messaging.md#routing-modes)。|
     `Value`|是|记录的实际数据。
     `EventTime`|否|来自源的记录的事件时间。
     `PartitionId`|否| 如果记录来自分区源，它返回其 `PartitionId`。<br /><br />`PartitionId` 被 Pulsar IO 运行时用作唯一标识符的一部分，以去重消息并实现精确一次处理保证。
     `RecordSequence`|否|如果记录来自顺序源，它返回其 `RecordSequence`。<br /><br />`RecordSequence` 被 Pulsar IO 运行时用作唯一标识符的一部分，以去重消息并实现精确一次处理保证。
     `Properties` |否| 如果记录携带用户定义的属性，它返回这些属性。
     `DestinationTopic`|否|消息应写入的 topic。
     `Message`|否|一个携带用户发送数据的类。<br /><br>有关更多信息，请参阅 [Message.java](https://github.com/apache/pulsar/blob/master/pulsar-client-api/src/main/java/org/apache/pulsar/client/api/Message.java)。|

    * {@inject: github:Record:/pulsar-functions/api-java/src/main/java/org/apache/pulsar/functions/api/Record.java} 应提供以下方法：

       方法|描述
       |---|---
       `ack` |确认记录已完全处理。
       `fail`|指示记录处理失败。

#### 处理 schema 信息

Pulsar IO 自动处理 schema 并基于 Java 泛型提供强类型 API。
如果您知道您正在生成的 schema 类型，可以在 source 声明中声明相对于该类型的 Java 类。

```java
public class MySource implements Source<String> {
    public Record<String> read() {}
}

```

如果您想实现一个适用于任何 schema 的 source，可以使用 `byte[]`（或 `ByteBuffer`）并使用 `Schema.AUTO_PRODUCE_BYTES()`。

```java
public class MySource implements Source<byte[]> {
    public Record<byte[]> read() {

        Schema wantedSchema = ....
        Record<byte[]> myRecord = new MyRecordImplementation();
        ....
    }
    class MyRecordImplementation implements Record<byte[]> {
         public byte[] getValue() {
            return ....encoded byte[]...that represents the value
         }
         public Schema<byte[]> getSchema() {
             return Schema.AUTO_PRODUCE_BYTES(wantedSchema);
         }
    }
}
```

要正确处理 `KeyValue` 类型，请遵循记录实现的指南：
- 它必须实现 {@inject: github:Record:/pulsar-functions/api-java/src/main/java/org/apache/pulsar/functions/api/KVRecord.java} 接口并实现 `getKeySchema`、`getValueSchema` 和 `getKeyValueEncodingType`
- 它必须返回一个 `KeyValue` 对象作为 `Record.getValue()`
- 它可以在 `Record.getSchema()` 中返回 null

当 Pulsar IO 运行时遇到 `KVRecord` 时，它会自动执行以下更改：
- 设置正确的 `KeyValueSchema`
- 根据 `KeyValueEncoding`（SEPARATED 或 INLINE）编码消息键和消息值

:::tip

有关 **如何创建 source 连接器** 的更多信息，请参阅 {@inject: github:KafkaSource:/pulsar-io/kafka/src/main/java/org/apache/pulsar/io/kafka/KafkaAbstractSource.java}。

:::

### Sink

开发 sink 连接器**类似于**开发 source 连接器，即您需要实现 {@inject: github:Sink:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Sink.java} 接口，这意味着实现 {@inject: github:open:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Sink.java} 方法和 {@inject: github:write:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Sink.java} 方法。

1. 实现 {@inject: github:open:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Sink.java} 方法。

   ```java
       /**
       * Open connector with configuration
       *
       * @param config initialization config
       * @param sinkContext
       * @throws Exception IO type exceptions when opening a connector
       */
       void open(final Map<String, Object> config, SinkContext sinkContext) throws Exception;
   ```

2. 实现 {@inject: github:write:/pulsar-io/core/src/main/java/org/apache/pulsar/io/core/Sink.java} 方法。

   ```java
       /**
       * Write a message to Sink
       * @param record record to write to sink
       * @throws Exception
       */
       void write(Record<T> record) throws Exception;
   ```

   在实现过程中，您可以决定如何将 `Value` 和 `Key` 写入实际的 sink，并利用所有提供的信息如 `PartitionId` 和 `RecordSequence` 来实现不同的处理保证。

   您还需要确认记录（如果消息发送成功）或失败记录（如果消息发送失败）。

#### 处理 schema 信息

Pulsar IO 自动处理 Schema 并基于 Java 泛型提供强类型 API。
如果您知道您正在消费的 Schema 类型，可以在 Sink 声明中声明相对于该类型的 Java 类。

```java
public class MySink implements Sink<String> {
    public void write(Record<String> record) {}
}
```

如果您想实现一个适用于任何 schema 的 sink，可以使用特殊的 GenericObject 接口。

```java
public class MySink implements Sink<GenericObject> {
    public void write(Record<GenericObject> record) {
        Schema schema = record.getSchema();
        GenericObject genericObject = record.getValue();
        if (genericObject != null) {
            SchemaType type = genericObject.getSchemaType();
            Object nativeObject = genericObject.getNativeObject();
            ...
        }
        ....
    }
}
```

在 AVRO、JSON 和 Protobuf 记录的情况下（schemaType=AVRO,JSON,PROTOBUF_NATIVE），您可以将
`genericObject` 变量转换为 `GenericRecord` 并使用 `getFields()` 和 `getField()` API。
您可以使用 `genericObject.getNativeObject()` 访问原生的 AVRO 记录。

在 KeyValue 类型的情况下，您可以使用此代码访问键的 schema 和值的 schema。

```java
public class MySink implements Sink<GenericObject> {
    public void write(Record<GenericObject> record) {
        Schema schema = record.getSchema();
        GenericObject genericObject = record.getValue();
        SchemaType type = genericObject.getSchemaType();
        Object nativeObject = genericObject.getNativeObject();
        if (type == SchemaType.KEY_VALUE) {
            KeyValue keyValue = (KeyValue) nativeObject;
            Object key = keyValue.getKey();
            Object value = keyValue.getValue();

            KeyValueSchema keyValueSchema = (KeyValueSchema) schema;
            Schema keySchema = keyValueSchema.getKeySchema();
            Schema valueSchema = keyValueSchema.getValueSchema();
        }
        ...
    }
}
```

## 测试

测试连接器可能具有挑战性，因为 Pulsar IO 连接器与两个可能难以模拟的系统交互——Pulsar 和连接器连接的系统。

建议编写特殊测试来测试连接器功能，同时模拟外部服务。

### 单元测试

您可以为连接器创建单元测试。

### 集成测试

一旦您编写了足够的单元测试，就可以添加单独的集成测试来验证端到端功能。

Pulsar 对**所有集成测试**使用 [testcontainers](https://www.testcontainers.org/)。

:::tip

有关 **如何为 Pulsar 连接器创建集成测试** 的更多信息，请参阅 {@inject: github:IntegrationTests:/tests/integration/src/test/java/org/apache/pulsar/tests/integration/io}。

:::

## 打包

一旦您开发并测试了连接器，就需要对其进行打包，以便可以将其提交到 [Pulsar Functions](functions-overview.md) 集群。

有两种方法来打包连接器：
- [NAR](#nar)
- [Uber JAR](#uber-jar)

:::note

如果您计划打包和分发连接器供他人使用，您有义务
正确许可和版权您自己的代码。记得将许可和版权添加到
您的代码使用的所有库和您的分发中。

:::

> 如果您使用 [NAR](#nar) 方法，NAR 插件
> 会自动在生成的 NAR 包中创建一个 `DEPENDENCIES` 文件，包括您的连接器所有库的正确许可和版权。
>
> 对于运行时 Java 版本，请根据您的目标 Pulsar 版本参阅 [Pulsar Runtime Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。

### NAR

**NAR** 代表 NiFi Archive，这是 Apache NiFi 使用的自定义打包机制，以提供一些 Java ClassLoader 隔离。

:::tip

有关 **NAR 如何工作** 的更多信息，请参阅[这里](https://medium.com/hashmapinc/nifi-nar-files-explained-14113f7796fd)。

:::

Pulsar 对打包**所有**[内置连接器](io-connectors.md)使用相同的机制。

打包 Pulsar 连接器的最简单方法是使用 [nifi-nar-maven-plugin](https://mvnrepository.com/artifact/org.apache.nifi/nifi-nar-maven-plugin) 创建 NAR 包。

在您的连接器的 maven 项目中包含此 [nifi-nar-maven-plugin](https://mvnrepository.com/artifact/org.apache.nifi/nifi-nar-maven-plugin)，如下所示。

```xml
<plugins>
  <plugin>
    <groupId>org.apache.nifi</groupId>
    <artifactId>nifi-nar-maven-plugin</artifactId>
    <version>1.5.0</version>
  </plugin>
</plugins>
```

您还必须创建一个具有以下内容的 `resources/META-INF/services/pulsar-io.yaml` 文件：

```yaml
name: 连接器名称
description: 连接器描述
sourceClass: 完全限定类名（仅适用于 source 连接器）
sinkClass: 完全限定类名（仅适用于 sink 连接器）
```

对于 Gradle 用户，有一个 [Gradle Nar 插件可在 Gradle Plugin Portal 上获得](https://plugins.gradle.org/plugin/io.github.lhotari.gradle-nar-plugin)。

:::tip

有关 **如何为 Pulsar 连接器使用 NAR** 的更多信息，请参阅 {@inject: github:TwitterFirehose:/pulsar-io/twitter/pom.xml}。

:::

### Uber JAR

另一种方法是创建一个**uber JAR**，它包含连接器的所有 JAR 文件
和其他资源文件。不需要内部目录结构。

您可以使用 [maven-shade-plugin](https://maven.apache.org/plugins/maven-shade-plugin/examples/includes-excludes.html) 创建 uber JAR，如下所示：

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-shade-plugin</artifactId>
  <version>3.1.1</version>
  <executions>
    <execution>
      <phase>package</phase>
      <goals>
        <goal>shade</goal>
      </goals>
      <configuration>
        <filters>
          <filter>
            <artifact>*:*</artifact>
          </filter>
        </filters>
      </configuration>
    </execution>
  </executions>
</plugin>
```

## 监控

Pulsar 连接器使您能够轻松地在 Pulsar 内外移动数据。确保运行的连接器在任何时候都是健康的非常重要。您可以使用以下方法监控已部署的 Pulsar 连接器：

- 检查 Pulsar 提供的指标。

  Pulsar 连接器公开可以收集并用于监控 **Java** 连接器健康状况的指标。您可以按照 [监控](deploy-monitoring.md) 指南检查指标。

- 设置和检查您的自定义指标。

  除了 Pulsar 提供的指标外，Pulsar 还允许您为 **Java** 连接器自定义指标。Function workers 自动将用户定义的指标收集到 Prometheus，您可以在 Grafana 中检查它们。

以下是如何为 Java 连接器自定义指标的示例。

````mdx-code-block
<Tabs
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"}]}>
<TabItem value="Java">

```java
public class TestMetricSink implements Sink<String> {

        @Override
        public void open(Map<String, Object> config, SinkContext sinkContext) throws Exception {
            sinkContext.recordMetric("foo", 1);
        }

        @Override
        public void write(Record<String> record) throws Exception {

        }

        @Override
        public void close() throws Exception {

        }
    }
```

</TabItem>

</Tabs>
````