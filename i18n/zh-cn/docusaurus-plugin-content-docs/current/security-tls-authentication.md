---
id: security-tls-authentication
title: Authentication using mTLS
sidebar_label: "Authentication using mTLS"
description: Get a comprehensive understanding of concepts and configuration methods of mTLS authentication in Pulsar.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

## mTLS 认证概述

双向 TLS (mTLS) 是一种双向认证机制。不仅服务器拥有客户端用于验证服务器身份的密钥和证书，客户端也拥有服务器用于验证客户端身份的密钥和证书。

下图说明了 Pulsar 如何处理客户端和服务器之间的 mTLS 认证。

![Pulsar mTLS 认证过程](/assets/mTLS-authentication.svg)

## 在 broker 上启用 mTLS 认证

要配置 broker 使用 mTLS 对客户端进行认证，请将以下参数添加到 `conf/broker.conf`。如果您使用独立的 Pulsar，则需要将这些参数添加到 `conf/standalone.conf` 文件中：

```properties
# 启用认证
authenticationEnabled=true
# 设置 mTLS 认证提供者
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderTls

# 配置客户端连接 broker 的 TLS
brokerClientTlsEnabled=true
brokerClientTrustCertsFilePath=/path/to/ca.cert.pem
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationTls
brokerClientAuthenticationParameters={"tlsCertFile":"/path/to/broker_client.cert.pem","tlsKeyFile":"/path/to/broker_client.key-pk8.pem"}

# 配置 TLS 端口
brokerServicePortTls=6651
webServicePortTls=8081

# 配置 CA 证书
tlsTrustCertsFilePath=/path/to/ca.cert.pem
# 配置服务器证书
tlsCertificateFilePath=/path/to/server.cert.pem
# 配置服务器的私钥
tlsKeyFilePath=/path/to/server.key-pk8.pem

# 启用 mTLS
tlsRequireTrustedClientCertOnConnect=true
tlsAllowInsecureConnection=false

# TLS 证书刷新持续时间，以秒为单位（设置为 0 表示在每次新连接时检查）
tlsCertRefreshCheckDurationSec=300
```

## 在代理上启用 mTLS 认证

要配置代理使用 mTLS 对客户端进行认证，请将以下参数添加到 `conf/proxy.conf` 文件中。

```properties
# 启用认证
authenticationEnabled=true
# 设置 mTLS 认证提供者
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderTls

# 配置客户端连接代理的 TLS
tlsEnabledWithBroker=true
brokerClientTrustCertsFilePath=/path/to/ca.cert.pem
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationTls
brokerClientAuthenticationParameters={"tlsCertFile":"/path/to/proxy.cert.pem","tlsKeyFile":"/path/to/proxy.key-pk8.pem"}

# 配置 TLS 端口
brokerServicePortTls=6651
webServicePortTls=8081

# 配置 CA 证书
tlsTrustCertsFilePath=/path/to/ca.cert.pem
# 配置服务器证书
tlsCertificateFilePath=/path/to/server.cert.pem
# 配置服务器的私钥
tlsKeyFilePath=/path/to/server.key-pk8.pem

# 启用 mTLS
tlsRequireTrustedClientCertOnConnect=true
tlsAllowInsecureConnection=false
```

## 在 Pulsar 客户端中配置 mTLS 认证

使用 mTLS 认证时，客户端通过 TLS 传输连接。您需要配置客户端使用 `https://` 和 `8443` 端口作为 Web 服务 URL，使用 `pulsar+ssl://` 和 `6651` 端口作为 broker 服务 URL。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"},{"label":"Node.js","value":"Node.js"},{"label":"Go","value":"Go"},{"label":"C#","value":"C#"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.client.api.PulsarClient;

PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar+ssl://broker.example.com:6651/")
    .tlsTrustCertsFilePath("/path/to/ca.cert.pem")
    .authentication("org.apache.pulsar.client.impl.auth.AuthenticationTls",
                    "tlsCertFile:/path/to/client.cert.pem,tlsKeyFile:/path/to/client.key-pk8.pem")
    .build();
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Client, AuthenticationTLS

auth = AuthenticationTLS("/path/to/client.cert.pem", "/path/to/client.key-pk8.pem")
client = Client("pulsar+ssl://broker.example.com:6651/",
                tls_trust_certs_file_path="/path/to/ca.cert.pem",
                tls_allow_insecure_connection=False,
				authentication=auth)
```

</TabItem>
<TabItem value="C++">

```cpp
#include <pulsar/Client.h>

pulsar::ClientConfiguration config;
config.setUseTls(true);
config.setTlsTrustCertsFilePath("/path/to/ca.cert.pem");
config.setTlsAllowInsecureConnection(false);

pulsar::AuthenticationPtr auth = pulsar::AuthTls::create("/path/to/client.cert.pem",
                                                         "/path/to/client.key-pk8.pem")
config.setAuth(auth);

pulsar::Client client("pulsar+ssl://broker.example.com:6651/", config);
```

</TabItem>
<TabItem value="Node.js">

```javascript
const Pulsar = require('pulsar-client');

(async () => {
  const auth = new Pulsar.AuthenticationTls({
    certificatePath: '/path/to/client.cert.pem',
    privateKeyPath: '/path/to/client.key-pk8.pem',
  });

  const client = new Pulsar.Client({
    serviceUrl: 'pulsar+ssl://broker.example.com:6651/',
    authentication: auth,
    tlsTrustCertsFilePath: '/path/to/ca.cert.pem',
  });
})();
```

</TabItem>
<TabItem value="Go">

```go
client, err := pulsar.NewClient(ClientOptions{
		URL:                   "pulsar+ssl://broker.example.com:6651/",
		TLSTrustCertsFilePath: "/path/to/ca.cert.pem",
		Authentication:        pulsar.NewAuthenticationTLS("/path/to/client.cert.pem", "/path/to/client.key-pk8.pem"),
	})
```

</TabItem>
<TabItem value="C#">

```csharp
var clientCertificate = new X509Certificate2("admin.pfx");
var client = PulsarClient.Builder()
                         .AuthenticateUsingClientCertificate(clientCertificate)
                         .Build();
```

</TabItem>
</Tabs>
````

## 在 CLI 工具中配置 mTLS 认证

像 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)、[`pulsar-perf`](pathname:///reference/#/@pulsar:version_reference@/pulsar-perf/) 和 [`pulsar-client`](pathname:///reference/#/@pulsar:version_reference@/pulsar-client/) 这样的[命令行工具](reference-cli-tools.md)使用 Pulsar 安装中的 `conf/client.conf` 配置文件。

要将 mTLS 认证与 Pulsar 的 CLI 工具一起使用，您需要将以下参数添加到 `conf/client.conf` 文件中，以及[启用 mTLS 加密的配置](security-tls-transport.md#configure-mtls-encryption-in-cli-tools)：

```properties
webServiceUrl=https://localhost:8081/
brokerServiceUrl=pulsar+ssl://localhost:6651/
authPlugin=org.apache.pulsar.client.impl.auth.AuthenticationTls
authParams=tlsCertFile:/path/to/admin.cert.pem,tlsKeyFile:/path/to/admin.key-pk8.pem
```

## 使用 KeyStore 配置 mTLS 认证

Apache Pulsar 支持客户端和 Apache Pulsar 服务之间的 [TLS 加密](security-tls-transport.md)和 [mTLS 认证](security-tls-authentication.md)。默认情况下，它使用 PEM 格式文件配置。

要使用 [KeyStore](https://en.wikipedia.org/wiki/Java_KeyStore) 配置 mTLS 认证，请完成以下步骤。

### 步骤 1：配置 broker

按如下方式配置 `broker.conf` 文件。

```properties
# 启用认证的配置
authenticationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderTls

# 启用 KeyStore 类型
tlsEnabledWithKeyStore=true

# 密钥存储
tlsKeyStoreType=JKS
tlsKeyStore=/var/private/tls/broker.keystore.jks
tlsKeyStorePassword=brokerpw

# 信任存储
tlsTrustStoreType=JKS
tlsTrustStore=/var/private/tls/broker.truststore.jks
tlsTrustStorePassword=brokerpw

# 内部客户端/管理客户端配置
brokerClientTlsEnabled=true
brokerClientTlsEnabledWithKeyStore=true
brokerClientTlsTrustStoreType=JKS
brokerClientTlsTrustStore=/var/private/tls/client.truststore.jks
brokerClientTlsTrustStorePassword=clientpw
# 内部认证配置
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationKeyStoreTls
brokerClientAuthenticationParameters={"keyStoreType":"JKS","keyStorePath":"/var/private/tls/client.keystore.jks","keyStorePassword":"clientpw"}

tlsRequireTrustedClientCertOnConnect=true
tlsAllowInsecureConnection=false
```

### 步骤 2：配置客户端

除了配置[TLS 加密](security-tls-transport.md)外，您还需要为客户端配置 KeyStore，其中包含作为客户端角色的有效 CN。

例如：

1. 对于像 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)、[`pulsar-perf`](pathname:///reference/#/@pulsar:version_reference@/pulsar-perf/) 和 [`pulsar-client`](pathname:///reference/#/@pulsar:version_reference@/pulsar-client/) 这样的[命令行工具](reference-cli-tools.md)，设置 Pulsar 安装中的 `conf/client.conf` 文件。

   ```properties
   webServiceUrl=https://broker.example.com:8443/
   brokerServiceUrl=pulsar+ssl://broker.example.com:6651/
   useKeyStoreTls=true
   tlsTrustStoreType=JKS
   tlsTrustStorePath=/var/private/tls/client.truststore.jks
   tlsTrustStorePassword=clientpw
   authPlugin=org.apache.pulsar.client.impl.auth.AuthenticationKeyStoreTls
   authParams={"keyStoreType":"JKS","keyStorePath":"/var/private/tls/client.keystore.jks","keyStorePassword":"clientpw"}
   ```

1. 对于 Java 客户端

   ```java
   import org.apache.pulsar.client.api.PulsarClient;

   PulsarClient client = PulsarClient.builder()
       .serviceUrl("pulsar+ssl://broker.example.com:6651/")
       .useKeyStoreTls(true)
       .tlsTrustStorePath("/var/private/tls/client.truststore.jks")
       .tlsTrustStorePassword("clientpw")
       .allowTlsInsecureConnection(false)
       .enableTlsHostnameVerification(false)
       .authentication(
               "org.apache.pulsar.client.impl.auth.AuthenticationKeyStoreTls",
               "keyStoreType:JKS,keyStorePath:/var/private/tls/client.keystore.jks,keyStorePassword:clientpw")
       .build();
   ```

1. 对于 Java 管理客户端

   ```java
       PulsarAdmin amdin = PulsarAdmin.builder().serviceHttpUrl("https://broker.example.com:8443")
           .useKeyStoreTls(true)
           .tlsTrustStorePath("/var/private/tls/client.truststore.jks")
           .tlsTrustStorePassword("clientpw")
           .allowTlsInsecureConnection(false)
           .enableTlsHostnameVerification(false)
           .authentication(
                  "org.apache.pulsar.client.impl.auth.AuthenticationKeyStoreTls",
                  "keyStoreType:JKS,keyStorePath:/var/private/tls/client.keystore.jks,keyStorePassword:clientpw")
           .build();
   ```

:::note

当您将 `useKeyStoreTls` 设置为 `true` 时，配置 `tlsTrustStorePath`。

:::