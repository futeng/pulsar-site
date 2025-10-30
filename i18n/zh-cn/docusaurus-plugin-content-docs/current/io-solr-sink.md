---
id: io-solr-sink
title: Solr sink connector
sidebar_label: "Solr sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Solr Sink 连接器从 Pulsar Topic 拉取消息并将消息持久化到 Solr 集合。

## 配置

Solr Sink 连接器的配置包含以下属性。



### 属性

| 名称 | 类型|是否必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `solrUrl` | String|true|" " (空字符串) | <li>在 SolrCloud 模式中使用的带 chroot 的逗号分隔 zookeeper 主机。<br />**示例**<br />`localhost:2181,localhost:2182/chroot` <br /><br /></li><li>在独立模式中用于连接 Solr 的 URL。<br />**示例**<br />`localhost:8983/solr` </li>|
| `solrMode` | String|true|SolrCloud| 与 Solr 集群交互时的客户端模式。<br /><br />以下是可用选项：<br /><li>Standalone<br /></li><li> SolrCloud</li>|
| `solrCollection` |String|true| " " (空字符串) | 需要写入记录的 Solr 集合名称。 |
| `solrCommitWithinMs` |int| false|10 | Solr 更新提交的时间（毫秒）。|
| `username` |String|false|  " " (空字符串) | 基本认证的用户名。<br /><br />**注意：`usename` 区分大小写。** |
| `password` | String|false|  " " (空字符串) | 基本认证的密码。<br /><br />**注意：`password` 区分大小写。** |



### 示例

在使用 Solr Sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "solrUrl": "localhost:2181,localhost:2182/chroot",
        "solrMode": "SolrCloud",
        "solrCollection": "techproducts",
        "solrCommitWithinMs": 100,
        "username": "fakeuser",
        "password": "fake@123"
     }
  }
  ```

* YAML

  ```yaml
  configs:
    solrUrl: "localhost:2181,localhost:2182/chroot"
    solrMode: "SolrCloud"
    solrCollection: "techproducts"
    solrCommitWithinMs: 100
    username: "fakeuser"
    password: "fake@123"
  ```