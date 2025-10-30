---
id: io-twitter-source
title: Twitter Firehose source connector
sidebar_label: "Twitter Firehose source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Twitter Firehose Source 连接器从 Twitter Firehose 接收推文并将推文写入 Pulsar Topic。

## 配置

Twitter Firehose Source 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|是否必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `consumerKey` | String|true | " " (空字符串) | Twitter OAuth consumer key。<br /><br />更多信息，请参阅[访问令牌](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens)。 |
| `consumerSecret` | String |true | " " (空字符串)  | Twitter OAuth consumer secret。 |
| `token` | String|true | " " (空字符串)  | Twitter OAuth token。 |
| `tokenSecret` | String|true | " " (空字符串) | Twitter OAuth secret。 |
| `guestimateTweetTime`|Boolean|false|false|大多数 firehose 事件的 createdAt 时间为 null。<br /><br />如果 `guestimateTweetTime` 设置为 true，连接器估计每个 firehose 事件的 createdTime 为当前时间。
| `clientName` |  String |false | openconnector-twitter-source| Twitter firehose 客户端名称。 |
| `clientHosts` |String| false | Constants.STREAM_HOST | 客户端连接的 twitter firehose 主机。 |
| `clientBufferSize` | int|false | 50000 | 用于缓冲从 twitter firehose 获取的推文的缓冲区大小。 |

> 有关 OAuth 凭证的更多信息，请参阅 [Twitter 开发者门户](https://developer.twitter.com/en.html)。