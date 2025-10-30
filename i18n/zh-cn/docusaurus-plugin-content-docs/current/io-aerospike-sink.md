---
id: io-aerospike-sink
title: Aerospike sink connector
sidebar_label: "Aerospike sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Aerospike sink 连接器从 Pulsar Topic 拉取消息到 Aerospike 集群。

## 配置

Aerospike sink 连接器的配置具有以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `seedHosts` |String| true | 无默认值| 一个或多个 Aerospike 集群主机的逗号分隔列表。<br /><br />每个主机可以指定为有效的 IP 地址或主机名，后跟可选的端口号。 |
| `keyspace` | String| true |无默认值 |Aerospike 命名空间。 |
| `columnName` | String | true| 无默认值|Aerospike 列名。 |
|`userName`|String|false|NULL|Aerospike 用户名。|
|`password`|String|false|NULL|Aerospike 密码。|
| `keySet` | String|false |NULL | Aerospike 集合名称。 |
| `maxConcurrentRequests` |int| false | 100 | sink 可以打开的最大 Aerospike 事务并发数。 |
| `timeoutMs` | int|false | 100 | 此属性控制 Aerospike 事务的 `socketTimeout` 和 `totalTimeout`。  |
| `retries` | int|false | 1 |在中止向 Aerospike 的写事务之前的最大重试次数。 |