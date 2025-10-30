---
id: concepts-proxy-sni-routing
title: 支持 SNI 路由的代理
sidebar_label: "支持 SNI 路由的代理"
description: 全面了解 Pulsar 中的 ATS-SNI 路由。你也可以使用 SNI 路由实现地理复制。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


代理服务器是一个中间服务器，将多个客户端的请求转发到互联网上的不同服务器。代理服务器在正向和反向代理场景中充当"交通警察"，为你的系统带来负载均衡、性能、安全、自动扩展等好处。

Pulsar 中的代理充当反向代理，在 broker 前面创建一个网关。Apache Traffic Server (ATS)、HAProxy、Nginx 和 Envoy 等代理在 Pulsar 中不受支持。这些代理服务器支持**SNI 路由**。SNI 路由用于在不终止 SSL 连接的情况下将流量路由到目的地。第 4 层路由提供更大的透明度，因为出站连接是通过检查客户端 TCP 数据包中的目标地址来确定的。

Pulsar 客户端（Java、C++、Python）支持[SNI 路由协议](https://github.com/apache/pulsar/wiki/PIP-60:-Support-Proxy-server-with-SNI-routing)，因此你可以通过代理连接到 broker。本文档指导你如何设置 ATS 代理、启用 SNI 路由，以及通过 ATS 代理将 Pulsar 客户端连接到 broker。

## Pulsar 中的 ATS-SNI 路由
要支持 ATS 的[第 4 层 SNI 路由](https://docs.trafficserver.apache.org/en/latest/admin-guide/layer-4-routing.en.html)，入站连接必须是 TLS 连接。Pulsar 客户端在 TLS 连接上支持 SNI 路由协议，因此当 Pulsar 客户端通过 ATS 代理连接到 broker 时，Pulsar 使用 ATS 作为反向代理。

Pulsar 支持地理复制的 SNI 路由，因此 broker 可以通过 ATS 代理连接到其他集群中的 broker。

本节解释如何设置和使用 ATS 作为反向代理，以便 Pulsar 客户端可以通过 ATS 代理使用 TLS 连接上的 SNI 路由协议连接到 broker。

### 为第 4 层 SNI 路由设置 ATS 代理
要为第 4 层 SNI 路由设置 ATS 代理，你需要配置`records.conf`和`ssl_server_name.conf`文件。

![Pulsar 客户端 SNI](/assets/pulsar-sni-client.png)

[records.config](https://docs.trafficserver.apache.org/en/latest/admin-guide/files/records.config.en.html)文件默认位于`/usr/local/etc/trafficserver/`目录中。该文件列出了 ATS 使用的可配置变量。

要配置`records.config`文件，请完成以下步骤。
1. 更新代理监听的 TLS 端口（`http.server_ports`），并更新代理证书（`ssl.client.cert.path`和`ssl.client.cert.filename`）以确保 TLS 隧道安全。
2. 配置用于隧道连接到 broker 的服务器端口（`http.connect_ports`）。如果 Pulsar broker 监听`4443`和`6651`端口，请在`http.connect_ports`配置中添加 broker 服务端口。

以下是一个示例。

```conf
# PROXY TLS PORT
CONFIG proxy.config.http.server_ports STRING 4443:ssl 4080
# PROXY CERTS FILE PATH
CONFIG proxy.config.ssl.client.cert.path STRING /proxy-cert.pem
# PROXY KEY FILE PATH
CONFIG proxy.config.ssl.client.cert.filename STRING /proxy-key.pem

# 可用于通过 CONNECT 隧道连接的源服务器端口范围。# Traffic Server 仅允许隧道连接到指定端口。支持通配符 (*) 和范围（例如 0-1023）。
CONFIG proxy.config.http.connect_ports STRING 4443 6651
```

`ssl_server_name`文件用于配置入站和出站连接的 TLS 连接处理。配置由入站连接提供的 SNI 值确定。该文件由一组配置项组成，每项由 SNI 值（`fqdn`）标识。当建立入站 TLS 连接时，来自 TLS 协商的 SNI 值与此文件中指定的项进行匹配。如果值匹配，则该项中指定的值覆盖默认值。

以下示例显示了来自客户端的入站 SNI 主机名的映射，以及请求应重定向到的实际 broker 服务 URL。例如，如果客户端发送 SNI 头`pulsar-broker1`，代理通过将请求重定向到`pulsar-broker1:6651`服务 URL 来创建 TLS 隧道。

```conf
server_config = {
  {
     fqdn = 'pulsar-broker-vip',
     # 转发到监听 6651 的 Pulsar broker
     tunnel_route = 'pulsar-broker-vip:6651'
  },
  {
     fqdn = 'pulsar-broker1',
     # 转发到监听 6651 的 Pulsar broker-1
     tunnel_route = 'pulsar-broker1:6651'
  },
  {
     fqdn = 'pulsar-broker2',
     # 转发到监听 6651 的 Pulsar broker-2
     tunnel_route = 'pulsar-broker2:6651'
  },
}
```

配置`ssl_server_name.config`和`records.config`文件后，ATS 代理服务器处理 SNI 路由并在客户端和 broker 之间创建 TCP 隧道。

### 使用 SNI 路由配置 Pulsar 客户端
ATS SNI 路由仅适用于 TLS。你需要首先为 ATS 代理和 broker 启用 TLS，配置 SNI 路由协议，然后通过 ATS 代理将 Pulsar 客户端连接到 broker。Pulsar 客户端通过连接到代理并将目标 broker URL 发送到 SNI 头来支持 SNI 路由。此过程在内部处理。你只需要在创建 Pulsar 客户端使用 SNI 路由协议时最初配置以下代理配置。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"},{"label":"Python","value":"Python"}]}>

<TabItem value="Java">

```java
String brokerServiceUrl = "pulsar+ssl://pulsar-broker-vip:6651/";
String proxyUrl = "pulsar+ssl://ats-proxy:443";
ClientBuilder clientBuilder = PulsarClient.builder()
		.serviceUrl(brokerServiceUrl)
        .tlsTrustCertsFilePath(TLS_TRUST_CERT_FILE_PATH)
        .enableTls(true)
        .allowTlsInsecureConnection(false)
        .proxyServiceUrl(proxyUrl, ProxyProtocol.SNI)
        .operationTimeout(1000, TimeUnit.MILLISECONDS);

Map<String, String> authParams = new HashMap();
authParams.put("tlsCertFile", TLS_CLIENT_CERT_FILE_PATH);
authParams.put("tlsKeyFile", TLS_CLIENT_KEY_FILE_PATH);
clientBuilder.authentication(AuthenticationTls.class.getName(), authParams);

PulsarClient pulsarClient = clientBuilder.build();
```

</TabItem>
<TabItem value="C++">

```cpp
ClientConfiguration config = ClientConfiguration();
config.setUseTls(true);
config.setTlsTrustCertsFilePath("/path/to/cacert.pem");
config.setTlsAllowInsecureConnection(false);
config.setAuth(pulsar::AuthTls::create(
            "/path/to/client-cert.pem", "/path/to/client-key.pem"););

Client client("pulsar+ssl://ats-proxy:443", config);
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Client, AuthenticationTLS

auth = AuthenticationTLS("/path/to/my-role.cert.pem", "/path/to/my-role.key-pk8.pem")
client = Client("pulsar+ssl://ats-proxy:443",
                tls_trust_certs_file_path="/path/to/ca.cert.pem",
                tls_allow_insecure_connection=False,
                authentication=auth)
```

</TabItem>

</Tabs>
````

### 使用 SNI 路由的 Pulsar 地理复制
你可以使用 ATS 代理进行地理复制。Pulsar broker 可以使用 SNI 路由连接到地理复制中的 broker。要为跨集群 broker 连接启用 SNI 路由，你需要将 SNI 代理 URL 配置到集群元数据。如果你在集群元数据中配置了 SNI 代理 URL，你可以通过 SNI 路由上的代理连接到跨集群的 broker。

![使用 SNI 路由的 Pulsar 地理复制](/assets/pulsar-sni-geo.png)

在此示例中，Pulsar 集群部署到两个独立的区域，`us-west`和`us-east`。两个区域都配置了 ATS 代理，每个区域的 broker 都在 ATS 代理后面运行。我们为两个集群配置集群元数据，因此一个集群中的 broker 可以使用 SNI 路由并通过 ATS 代理连接到其他集群中的 broker。

(a) 为`us-east`配置集群元数据，使用`us-east` broker 服务 URL 和带有 SNI 代理协议的`us-east` ATS 代理 URL。

```shell
./pulsar-admin clusters update \
    --broker-url-secure pulsar+ssl://east-broker-vip:6651 \
    --url http://east-broker-vip:8080 \
    --proxy-protocol SNI \
    --proxy-url pulsar+ssl://east-ats-proxy:443
```

(b) 为`us-west`配置集群元数据，使用`us-west` broker 服务 URL 和带有 SNI 代理协议的`us-west` ATS 代理 URL。

```shell
./pulsar-admin clusters update \
    --broker-url-secure pulsar+ssl://west-broker-vip:6651 \
    --url http://west-broker-vip:8080 \
    --proxy-protocol SNI \
    --proxy-url pulsar+ssl://west-ats-proxy:443
```