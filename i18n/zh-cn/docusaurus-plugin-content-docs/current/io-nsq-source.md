---
id: io-nsq-source
title: NSQ source connector
sidebar_label: "NSQ source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

NSQ Source 连接器从 NSQ Topic 接收消息并将消息写入 Pulsar Topic。

## 配置

NSQ Source 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|是否必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `lookupds` |String| true | " " (空字符串) | 要连接的 nsqlookupd 逗号分隔列表。 |
| `topic` | String|true | " " (空字符串) | 要传输的 NSQ Topic。 |
| `channel` | String |false | pulsar-transport-\{\$topic\} | 在提供的 NSQ Topic 上消费的通道。 |