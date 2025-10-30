---
id: io-kinesis-sink
title: Kinesis sink connector
sidebar_label: "Kinesis sink connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

Kinesis sink 连接器从 Pulsar 拉取数据，并将数据持久化到 Amazon Kinesis。

## 配置

Kinesis sink 连接器的配置具有以下属性。

### 属性

| 名称 | 类型 | 必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
`messageFormat`|MessageFormat|是|ONLY_RAW_PAYLOAD|Kinesis sink 将 Pulsar 消息转换并发布到 Kinesis 流的消息格式。<br /><br />可用选项如下：<br /><br /><li>`ONLY_RAW_PAYLOAD`：Kinesis sink 直接将 Pulsar 消息有效载荷作为消息发布到配置的 Kinesis 流。<br /><br /></li><li>`FULL_MESSAGE_IN_JSON`：Kinesis sink 创建包含 Pulsar 消息有效载荷、属性和 encryptionCtx 的 JSON 有效载荷，并将 JSON 有效载荷发布到配置的 Kinesis 流。<br /><br /></li><li>`FULL_MESSAGE_IN_FB`：Kinesis sink 创建包含 Pulsar 消息有效载荷、属性和 encryptionCtx 的 flatbuffer 序列化有效载荷，并将 flatbuffer 有效载荷发布到配置的 Kinesis 流。<br /><br /></li><li>`FULL_MESSAGE_IN_JSON_EXPAND_VALUE`：Kinesis sink 发送包含记录 topic 名称、键、有效载荷、属性和事件时间的 JSON 结构。记录模式用于将值转换为 JSON。</li>
`jsonIncludeNonNulls`|boolean|否|true|当消息格式为 `FULL_MESSAGE_IN_JSON_EXPAND_VALUE` 时，只包含具有非空值的属性。
`jsonFlatten`|boolean|否|false|当设置为 `true` 且消息格式为 `FULL_MESSAGE_IN_JSON_EXPAND_VALUE` 时，输出 JSON 被扁平化。
`retainOrdering`|boolean|否|false|Pulsar 连接器在将消息从 Pulsar 移动到 Kinesis 时是否保持顺序。
`awsEndpoint`|String|否|" " (空字符串)|Kinesis 端点 URL，可以在[这里](https://docs.aws.amazon.com/general/latest/gr/rande.html)找到。
`awsRegion`|String|否|" " (空字符串)|AWS 区域。<br /><br />**示例**<br /> us-west-1, us-west-2
`awsKinesisStreamName`|String|是|" " (空字符串)|Kinesis 流名称。
`awsCredentialPluginName`|String|否|" " (空字符串)|{@inject: github:AwsCredentialProviderPlugin:/pulsar-io/aws/src/main/java/org/apache/pulsar/io/aws/AwsCredentialProviderPlugin.java} 实现的完全限定类名。<br /><br />它是一个工厂类，创建一个由 Kinesis sink 使用的 AWSCredentialsProvider。<br /><br />如果为空，Kinesis sink 创建一个默认的 AWSCredentialsProvider，它接受 `awsCredentialPluginParam` 中的凭证 json 映射。
`awsCredentialPluginParam`|String |否|" " (空字符串)|用于初始化 `awsCredentialsProviderPlugin` 的 JSON 参数。

### 内置插件

以下是内置的 `AwsCredentialProviderPlugin` 插件：

* `org.apache.pulsar.io.aws.AwsDefaultProviderChainPlugin`

  此插件不需要配置，它使用默认的 AWS 提供程序链。

  有关更多信息，请参阅 [AWS 文档](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default)。

* `org.apache.pulsar.io.aws.STSAssumeRoleProviderPlugin`

  此插件接受一个配置（通过 `awsCredentialPluginParam`），描述在运行 KCL 时要承担的角色。

  此配置采用小型 JSON 文档的形式，如下所示：

  ```json
  {"roleArn": "arn...", "roleSessionName": "name"}
  ```

### 示例

在使用 Kinesis sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "awsEndpoint": "some.endpoint.aws",
        "awsRegion": "us-east-1",
        "awsKinesisStreamName": "my-stream",
        "awsCredentialPluginParam": "{\"accessKey\":\"myKey\",\"secretKey\":\"my-Secret\"}",
        "messageFormat": "ONLY_RAW_PAYLOAD",
        "retainOrdering": "true"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      awsEndpoint: "some.endpoint.aws"
      awsRegion: "us-east-1"
      awsKinesisStreamName: "my-stream"
      awsCredentialPluginParam: "{\"accessKey\":\"myKey\",\"secretKey\":\"my-Secret\"}"
      messageFormat: "ONLY_RAW_PAYLOAD"
      retainOrdering: "true"
  ```