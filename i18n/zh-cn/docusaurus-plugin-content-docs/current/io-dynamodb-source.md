---
id: io-dynamodb-source
title: AWS DynamoDB source connector
sidebar_label: "AWS DynamoDB source connector"
---

:::note

You can download all the Pulsar connectors on [download page](pathname:///download).

:::

DynamoDB source 连接器从 DynamoDB 表流中拉取数据，并将数据持久化到 Pulsar。

此连接器使用 [DynamoDB Streams Kinesis Adapter](https://github.com/awslabs/dynamodb-streams-kinesis-adapter)，
该适配器使用 [Kinesis Consumer Library](https://github.com/awslabs/amazon-kinesis-client) (KCL) 来实际消费消息。KCL 使用 DynamoDB 跟踪消费者的状态，并需要 cloudwatch 访问权限来记录指标。


## 配置

DynamoDB source 连接器的配置具有以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
`initialPositionInStream`|InitialPositionInStream|false|LATEST|连接器开始的位置。<br /><br />以下是可用选项：<br /><br /><li>`AT_TIMESTAMP`：从指定时间戳处或之后的记录开始。<br /><br /></li><li>`LATEST`：从最新的数据记录之后开始。<br /><br /></li><li>`TRIM_HORIZON`：从最旧的可用的数据记录开始。</li>
`startAtTime`|Date|false|" "（空字符串）|如果设置为 `AT_TIMESTAMP`，它指定开始消费的时间点。
`applicationName`|String|false|Pulsar IO connector|KCL 应用程序的名称。必须是唯一的，因为它用于定义用于状态跟踪的 dynamo 表的表名称。<br /><br />默认情况下，应用程序名称包含在用于发出 AWS 请求的用户代理字符串中。这有助于故障排除，例如，区分由不同连接器实例发出的请求。
`checkpointInterval`|long|false|60000|KCL 检查点的频率（以毫秒为单位）。
`backoffTime`|long|false|3000|当连接器遇到来自 AWS Kinesis 的限流异常时，请求之间的延迟时间（以毫秒为单位）。
`numRetries`|int|false|3|当连接器在尝试设置检查点时遇到异常时的重试次数。
`receiveQueueSize`|int|false|1000|可以在连接器内部缓冲的 AWS 记录的最大数量。<br /><br />一旦达到 `receiveQueueSize`，连接器不会从 Kinesis 消费任何消息，直到队列中的某些消息被成功消费。
`dynamoEndpoint`|String|false|" "（空字符串）|Dynamo 端点 URL，可以在[这里](https://docs.aws.amazon.com/general/latest/gr/rande.html)找到。
`cloudwatchEndpoint`|String|false|" "（空字符串）|Cloudwatch 端点 URL，可以在[这里](https://docs.aws.amazon.com/general/latest/gr/rande.html)找到。
`awsEndpoint`|String|false|" "（空字符串）|DynamoDB Streams 端点 URL，可以在[这里](https://docs.aws.amazon.com/general/latest/gr/rande.html)找到。
`awsRegion`|String|false|" "（空字符串）|AWS 区域。<br /><br />**示例**<br /> us-west-1, us-west-2
`awsDynamodbStreamArn`|String|true|" "（空字符串）|DynamoDB 流 arn。
`awsCredentialPluginName`|String|false|" "（空字符串）|{@inject: github:AwsCredentialProviderPlugin:/pulsar-io/aws/src/main/java/org/apache/pulsar/io/aws/AwsCredentialProviderPlugin.java} 实现的完全限定类名。<br /><br />`awsCredentialProviderPlugin` 具有以下内置插件：<br /><br /><li>`org.apache.pulsar.io.kinesis.AwsDefaultProviderChainPlugin`：<br /> 此插件使用默认的 AWS 提供者链。<br />有关更多信息，请参阅[使用默认凭证提供者链](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default)。<br /><br /></li><li>`org.apache.pulsar.io.kinesis.STSAssumeRoleProviderPlugin`： <br />此插件通过 `awsCredentialPluginParam` 接受一个配置，描述在运行 KCL 时要承担的角色。<br />**JSON 配置示例**<br />`{"roleArn": "arn...", "roleSessionName": "name"}` <br /><br />`awsCredentialPluginName` 是一个工厂类，它创建一个由 Kinesis sink 使用的 AWSCredentialsProvider。<br /><br />如果 `awsCredentialPluginName` 设置为空，Kinesis sink 创建一个默认的 AWSCredentialsProvider，它接受 `awsCredentialPluginParam` 中的凭证的 json-map。</li>
`awsCredentialPluginParam`|String |false|" "（空字符串）|用于初始化 `awsCredentialsProviderPlugin` 的 JSON 参数。

### 示例

在使用 DynamoDB source 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "awsEndpoint": "https://some.endpoint.aws",
        "awsRegion": "us-east-1",
        "awsDynamodbStreamArn": "arn:aws:dynamodb:us-west-2:111122223333:table/TestTable/stream/2015-05-11T21:21:33.291",
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
      awsDynamodbStreamArn: "arn:aws:dynamodb:us-west-2:111122223333:table/TestTable/stream/2015-05-11T21:21:33.291"
      awsCredentialPluginParam: "{\"accessKey\":\"myKey\",\"secretKey\":\"my-Secret\"}"
      applicationName: "My test application"
      checkpointInterval: 30000
      backoffTime: 4000
      numRetries: 3
      receiveQueueSize: 2000
      initialPositionInStream: "TRIM_HORIZON"
      startAtTime: "2019-03-05T19:28:58.000Z"
  ```
