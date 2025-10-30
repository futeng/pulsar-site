---
id: io-flume-source
title: Flume source connector
sidebar_label: "Flume source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Flume source 连接器从日志拉取消息到 Pulsar topic。

## 配置

Flume source 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
`name`|String|true|"" (空字符串)|代理的名称。
`confFile`|String|true|"" (空字符串)|配置文件。
`noReloadConf`|Boolean|false|false|如果更改是否重新加载配置文件。
`zkConnString`|String|true|"" (空字符串)|ZooKeeper 连接。
`zkBasePath`|String|true|"" (空字符串)|代理配置在 ZooKeeper 中的基础路径。

### 示例

在使用 Flume source 连接器之前，您需要通过以下方法之一创建配置文件。

> 有关下面示例中的 `source.conf` 的更多信息，请参阅[此处](https://github.com/apache/pulsar/blob/master/pulsar-io/flume/src/main/resources/flume/source.conf)。

* JSON

  ```json
  {
     "configs": {
        "name": "a1",
        "confFile": "source.conf",
        "noReloadConf": "false",
        "zkConnString": "",
        "zkBasePath": ""
     }
  }
  ```

* YAML

  ```yaml
  configs:
      name: a1
      confFile: source.conf
      noReloadConf: false
      zkConnString: ""
      zkBasePath: ""
  ```
