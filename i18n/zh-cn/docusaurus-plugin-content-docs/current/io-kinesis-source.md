---
id: io-kinesis-source
title: Kinesis source connector
sidebar_label: "Kinesis source connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

Kinesis source 连接器从 Amazon Kinesis 拉取数据，并将数据持久化到 Pulsar。

此连接器使用 [Kinesis Consumer Library](https://github.com/awslabs/amazon-kinesis-client) (KCL) 来进行消息的实际消费。KCL 使用 DynamoDB 来跟踪消费者的状态。

:::note

目前，Kinesis source 连接器仅支持原始消息。如果您使用 KMS 加密消息，加密消息将被发送到下游。此连接器将在未来版本中支持解密消息。

:::

## 配置

Kinesis source 连接器的配置具有以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
`initialPositionInStream`|InitialPositionInStream|否|LATEST|连接器开始的位置。<br /><br />可用选项如下：<br /><br /><li>`AT_TIMESTAMP`：从指定时间点或之后的记录开始。<br /><br /></li><li>`LATEST`：从最新的数据记录之后开始。<br /><br /></li><li>`TRIM_HORIZON`：从最旧的可用数据记录开始。</li>
`startAtTime`|Date|否|" " (空字符串)|如果设置为 `AT_TIMESTAMP`，它指定开始消费的时间点。
`applicationName`|String|否|Pulsar IO connector|Amazon Kinesis 应用程序的名称。<br /><br />默认情况下，应用程序名称包含在用于发出 AWS 请求的用户代理字符串中。这有助于故障排除，例如，区分由不同连接器实例发出的请求。
`checkpointInterval`|long|否|60000|Kinesis 流检查点的频率（毫秒）。
`backoffTime`|long|否|3000|当连接器遇到来自 AWS Kinesis 的限流异常时，请求之间的延迟时间（毫秒）。
`numRetries`|int|否|3|当连接器在尝试设置检查点时遇到异常时的重试次数。
`receiveQueueSize`|int|否|1000|可以在连接器内部缓冲的 AWS 记录的最大数量。<br /><br />一旦达到 `receiveQueueSize`，连接器不会从 Kinesis 消费任何消息，直到队列中的某些消息被成功消费。
`dynamoEndpoint`|String|否|" " (空字符串)|Dynamo 端点 URL，可以在[这里](https://docs.aws.amazon.com/general/latest/gr/rande.html)找到。
`cloudwatchEndpoint`|String|否|" " (空字符串)|Cloudwatch 端点 URL，可以在[这里](https://docs.aws.amazon.com/general/latest/gr/rande.html)找到。
`useEnhancedFanOut`|boolean|否|true|如果设置为 true，它使用 Kinesis 增强扇出。<br /><br />如果设置为 false，它使用轮询。
`awsEndpoint`|String|否|" " (空字符串)|Kinesis 端点 URL，可以在[这里](https://docs.aws.amazon.com/general/latest/gr/rande.html)找到。
`awsRegion`|String|否|" " (空字符串)|AWS 区域。<br /><br />**示例**<br /> us-west-1, us-west-2
`awsKinesisStreamName`|String|是|" " (空字符串)|Kinesis 流名称。
`awsCredentialPluginName`|String|否|" " (空字符串)|{@inject: github:AwsCredentialProviderPlugin:/pulsar-io/aws/src/main/java/org/apache/pulsar/io/aws/AwsCredentialProviderPlugin.java} 实现的完全限定类名。<br /><br />`awsCredentialProviderPlugin` 具有以下内置插件：<br /><br /><li>`org.apache.pulsar.io.kinesis.AwsDefaultProviderChainPlugin`：<br /> 此插件使用默认的 AWS 提供程序链。<br />有关更多信息，请参阅[使用默认凭证提供程序链](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default)。<br /><br /></li><li>`org.apache.pulsar.io.kinesis.STSAssumeRoleProviderPlugin`：<br />此插件通过 `awsCredentialPluginParam` 接受配置，描述在运行 KCL 时要承担的角色。<br />**JSON 配置示例**<br />`{"roleArn": "arn...", "roleSessionName": "name"}` <br /><br />`awsCredentialPluginName` 是一个工厂类，创建一个由 Kinesis sink 使用的 AWSCredentialsProvider。<br /><br />如果 `awsCredentialPluginName` 设置为空，Kinesis sink 创建一个默认的 AWSCredentialsProvider，它接受 `awsCredentialPluginParam` 中的凭证 json 映射。</li>
`awsCredentialPluginParam`|String |否|" " (空字符串)|用于初始化 `awsCredentialsProviderPlugin` 的 JSON 参数。

### 示例

在使用 Kinesis source 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "awsEndpoint": "https://some.endpoint.aws",
        "awsRegion": "us-east-1",
        "awsKinesisStreamName": "my-stream",
        "awsCredentialPluginParam": "{\"accessKey\":\"myKey\",\"secretKey\":\"my-Secret\"}",
        "applicationName": "My test application",
        "checkpointInterval": "30000",
        "backoffTime": "4000",
        "numRetries": "3",
        "receiveQueueSize": 2000,
        "initialPositionInStream": "TRIM_HORIZON",
        "startAtTime": "2019-03-05T19:28:58.000Z"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      awsEndpoint: "https://some.endpoint.aws"
      awsRegion: "us-east-1"
      awsKinesisStreamName: "my-stream"
      awsCredentialPluginParam: "{\"accessKey\":\"myKey\",\"secretKey\":\"my-Secret\"}"
      applicationName: "My test application"
      checkpointInterval: 30000
      backoffTime: 4000
      numRetries: 3
      receiveQueueSize: 2000
      initialPositionInStream: "TRIM_HORIZON"
      startAtTime: "2019-03-05T19:28:58.000Z"
  ```