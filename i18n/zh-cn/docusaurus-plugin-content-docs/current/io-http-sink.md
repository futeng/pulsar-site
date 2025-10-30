---
id: io-http-sink
title: HTTP sink connector
sidebar_label: "HTTP sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

HTTP sink 连接器从 Pulsar topic 拉取记录，并向可配置的 HTTP URL（webhook）发出 POST 请求。

HTTP 请求的主体是记录值的 JSON 表示。头部 `Content-Type: application/json` 被添加到 HTTP 请求中。

一些其他的 HTTP 头部也被添加到 HTTP 请求中：

* `PulsarTopic`：记录的 topic
* `PulsarKey`：记录的键
* `PulsarEventTime`：记录的事件时间
* `PulsarPublishTime`：记录的发布时间
* `PulsarMessageId`：记录中包含的消息 ID
* `PulsarProperties-*`：每个记录属性都以 `PulsarProperties-` 为前缀的属性名传递

## 配置

HTTP sink 连接器的配置包含以下属性。

### 属性

| 名称      | 类型   | 必需 | 默认值          | 描述                                       |
|-----------|--------|----------|------------------|---------------------------------------------------|
| `url`     | String | false    | http://localhost | HTTP 服务器的 URL                        |
| `headers` | Map    | false    | 空映射        | 添加到每个请求的默认头部列表 |

### 示例

在使用 HTTP sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "url": "http://my-endpoint.acme.com/api/ingest",
        "headers": {
           "Authentication": "xxxxx"
        }
     }
  }
  ```

* YAML

  ```yaml
  configs:
      url: "http://my-endpoint.acme.com/api/ingest"
      headers:
          Authentication: xxxxx
  ```
