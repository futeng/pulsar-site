---
id: admin-api-tutorial
title: 教程
sidebar_label: "教程"
description: 学习如何在 Pulsar 实例中启用认证时配置 Pulsar 管理接口。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

## 管理设置

如果您在 Pulsar 实例中启用了认证，三种管理接口（`pulsar-admin` CLI 工具、[REST API](reference-rest-api-overview.md) 和 [Java 管理 API](/api/admin/)）都需要一些特殊设置。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

如果您启用了认证，您需要提供认证配置来使用 `pulsar-admin` 工具。默认情况下，`pulsar-admin` 工具的配置在 [`conf/client.conf`](https://github.com/apache/pulsar/blob/master/conf/client.conf) 文件中。以下是可用参数：

|名称|描述|默认值|
|----|-----------|-------|
|webServiceUrl|集群的 Web URL。|http://localhost:8080/|
|brokerServiceUrl|集群的 Pulsar 协议 URL。|pulsar://localhost:6650/|
|authPlugin|认证插件。| |
|authParams|集群的认证参数，以逗号分隔的字符串形式。| |
|useTls|是否在集群中强制执行 TLS 认证。|false|
|tlsAllowInsecureConnection|接受来自客户端的不受信任的 TLS 证书。|false|
|tlsTrustCertsFilePath|受信任的 TLS 证书文件的路径。| |

</TabItem>
<TabItem value="REST API">

您可以在 [REST API 文档](pathname:///admin-rest-api/?version=@pulsar:version_number@) 中找到 Pulsar Broker 暴露的 REST API 的详细信息。

如果您想在 postman 中测试 REST API，可以使用[这里](pathname:///swagger/)的 REST API JSON 文件。

</TabItem>
<TabItem value="Java">

要使用 Java 管理 API，请实例化一个 [PulsarAdmin](/api/admin/org/apache/pulsar/client/admin/PulsarAdmin) 对象，并为 Pulsar Broker 指定一个 URL 和一个 [PulsarAdminBuilder](/api/admin/org/apache/pulsar/client/admin/PulsarAdminBuilder) 对象。以下是使用 `localhost` 的最小示例：

```java
String url = "http://localhost:8080";
// 如果启用了 Pulsar 安全性，请传递认证插件的完全限定类名
String authPluginClassName = "com.org.MyAuthPluginClass";
// 如果认证插件类需要，请传递认证参数
String authParams = "param1=value1";
boolean tlsAllowInsecureConnection = false;
String tlsTrustCertsFilePath = null;
PulsarAdmin admin = PulsarAdmin.builder()
    .authentication(authPluginClassName,authParams)
    .serviceHttpUrl(url)
    .tlsTrustCertsFilePath(tlsTrustCertsFilePath)
    .allowTlsInsecureConnection(tlsAllowInsecureConnection)
    .build();
```

如果您使用多个 Broker，可以使用多主机 Pulsar 服务。例如，

```java
String url = "http://localhost:8080,localhost:8081,localhost:8082";
// 以上代码片段中第 2-13 行的内容相同
// 如果启用了 Pulsar 安全性，请传递认证插件的完全限定类名
String authPluginClassName = "com.org.MyAuthPluginClass";
// 如果认证插件类需要，请传递认证参数
String authParams = "param1=value1";
boolean tlsAllowInsecureConnection = false;
String tlsTrustCertsFilePath = null;
PulsarAdmin admin = PulsarAdmin.builder()
    .authentication(authPluginClassName,authParams)
    .serviceHttpUrl(url)
    .tlsTrustCertsFilePath(tlsTrustCertsFilePath)
    .allowTlsInsecureConnection(tlsAllowInsecureConnection)
    .build();
```

</TabItem>

</Tabs>
````