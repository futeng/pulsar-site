---
id: security-tls-transport
title: TLS Encryption
sidebar_label: "TLS Encryption"
description: Get a comprehensive understanding of TLS concepts, debugging methods and mTLS configuration methods in Pulsar.
---


````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

## TLS 概述

传输层安全 (TLS) 是一种[公钥加密](https://en.wikipedia.org/wiki/Public-key_cryptography)形式。默认情况下，Pulsar 客户端以明文与 Pulsar 服务通信。这意味着所有数据都以明文发送。您可以使用 TLS 加密此流量，以保护流量免受中间人攻击者的窥探。

本节介绍如何在 Pulsar 中配置 TLS 加密。有关如何在 Pulsar 中配置 mTLS 认证的信息，请参阅 [mTLS 认证](security-tls-authentication.md)。或者，您可以在 TLS 传输加密之上使用另一种 [Athenz 认证](security-athenz.md)。

:::note

启用 TLS 加密可能会由于加密开销而影响性能。

:::

### TLS 证书

TLS 证书包括以下三种类型。每个证书（密钥对）都包含用于加密消息的公钥和用于解密消息的私钥。
* 证书颁发机构 (CA)
  * CA 私钥分发给所有相关方。
  * CA 公钥（**信任证书**）用于为 broker 或客户端签署证书。
* 服务器密钥对
* 客户端密钥对（用于双向 TLS）

对于服务器和客户端证书，首先生成带有证书请求的私钥，然后在**信任证书**签署证书请求后生成公钥（证书）。当启用 [mTLS 认证](security-tls-authentication.md)时，服务器使用**信任证书**验证客户端拥有证书颁发机构签名的密钥对。客户端证书的通用名称 (CN) 用作客户端的角色令牌，而服务器证书的主题备用名称 (SAN) 用于[主机名验证](#hostname-verification)。

:::note

这些证书的有效期为 365 天。强烈建议使用 `sha256` 或 `sha512` 作为签名算法，而不支持 `sha1`。

:::

### 证书格式

您可以使用以下任一证书格式来配置 TLS 加密：
* 推荐：隐私增强邮件 (PEM)。
  有关详细说明，请参阅[使用 PEM 配置 TLS 加密](#configure-tls-encryption-with-pem)。
* 可选：Java [KeyStore](https://en.wikipedia.org/wiki/Java_KeyStore) (JKS)。
  有关详细说明，请参阅[使用 KeyStore 配置 TLS 加密](#configure-tls-encryption-with-keystore)。

### 主机名验证

主机名验证是一种 TLS 安全功能，如果主题备用名称 (SAN) 与主机名连接到的主机名不匹配，客户端可以拒绝连接到服务器。

默认情况下，Pulsar 客户端禁用主机名验证，因为它要求每个 broker 都有 DNS 记录和唯一证书。

您可能想要启用主机名验证的一个场景是，您在 VIP 后面有多个代理节点，并且 VIP 有 DNS 记录，例如 `pulsar.mycompany.com`。在这种情况下，您可以生成一个以 `pulsar.mycompany.com` 作为 SAN 的 TLS 证书，然后在客户端上启用主机名验证。

要在 Pulsar 中启用主机名验证，请确保 SAN 与服务器的完全限定域名 (FQDN) 完全匹配。客户端将 SAN 与 DNS 域名进行比较，以确保它连接到所需的服务器。有关更多详细信息，请参阅[配置客户端](#configure-clients)。

此外，由于管理员对 CA 有完全控制权，恶意行为者不太可能能够发起中间人攻击。`allowInsecureConnection` 允许客户端连接到其证书未经批准 CA 签名的服务器。客户端默认禁用 `allowInsecureConnection`，您应该在生产环境中始终禁用 `allowInsecureConnection`。只要您禁用 `allowInsecureConnection`，中间人攻击就需要攻击者能够访问 CA。

## 使用 PEM 配置 mTLS 加密

默认情况下，Pulsar 使用 [netty-tcnative](https://github.com/netty/netty-tcnative)。它包括两个实现，`OpenSSL`（默认）和 `JDK`。当 `OpenSSL` 不可用时，使用 `JDK`。

要使用 PEM 配置 mTLS 加密，请完成以下步骤。

### 步骤 1：创建 TLS 证书

创建 TLS 证书涉及创建[证书颁发机构](#create-a-certificate-authority)、[服务器证书](#create-a-server-certificate)和[客户端证书](#create-a-client-certificate)。

#### 创建证书颁发机构

您可以使用证书颁发机构 (CA) 来签署服务器和客户端证书。这确保各方相互信任。将 CA 存储在非常安全的位置（理想情况下完全与网络断开连接，空气隔离，并完全加密）。

使用以下命令创建 CA。

```bash
openssl genrsa -out ca.key.pem 2048
openssl req -x509 -new -nodes -key ca.key.pem -subj "/CN=CARoot" -days 365 -out ca.cert.pem
```

:::note

macOS 上的默认 `openssl` 不适用于上述命令。您需要通过 Homebrew 升级 `openssl`：

```bash
brew install openssl
export PATH="/usr/local/Cellar/openssl@3/3.0.1/bin:$PATH"
```

使用 `brew install` 命令输出中的实际路径。请注意，版本号 `3.0.1` 可能会更改。

:::

#### 创建服务器证书

创建 CA 后，您可以创建证书请求并用 CA 签署它们。

1. 生成服务器的私钥。

   ```bash
   openssl genrsa -out server.key.pem 2048
   ```

   服务器期望密钥为 [PKCS 8](https://en.wikipedia.org/wiki/PKCS_8) 格式。输入以下命令进行转换。

   ```bash
   openssl pkcs8 -topk8 -inform PEM -outform PEM -in server.key.pem -out server.key-pk8.pem -nocrypt
   ```

2. 创建包含以下内容的 `server.conf` 文件：

   ```properties
   [ req ]
   default_bits = 2048
   prompt = no
   default_md = sha256
   distinguished_name = dn

   [ v3_ext ]
   authorityKeyIdentifier=keyid,issuer:always
   basicConstraints=CA:FALSE
   keyUsage=critical, digitalSignature, keyEncipherment
   extendedKeyUsage=serverAuth
   subjectAltName=@alt_names

   [ dn ]
   CN = server

   [ alt_names ]
   DNS.1 = pulsar
   DNS.2 = pulsar.default
   IP.1 = 127.0.0.1
   IP.2 = 192.168.1.2
   ```

   :::tip

   要配置[主机名验证](#hostname-verification)，您需要在 `alt_names` 中输入服务器的主机名作为主题备用名称 (SAN)。为确保多台机器可以重用相同的证书，您也可以使用通配符来匹配一组服务器主机名，例如 `*.server.usw.example.com`。

   :::

3. 生成证书请求。

   ```bash
   openssl req -new -config server.conf -key server.key.pem -out server.csr.pem -sha256
   ```

4. 用 CA 签署证书。

   ```bash
   openssl x509 -req -in server.csr.pem -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -out server.cert.pem -days 365 -extensions v3_ext -extfile server.conf -sha256
   ```

此时，您有一个证书 `server.cert.pem` 和一个密钥 `server.key-pk8.pem`，您可以与 `ca.cert.pem` 一起使用它们来为您的 broker 和代理配置 TLS 加密。

#### 创建 broker 客户端证书

1. 生成 broker_client 的私钥。

   ```bash
   openssl genrsa -out broker_client.key.pem 2048
   ```

   broker_client 期望密钥为 [PKCS 8](https://en.wikipedia.org/wiki/PKCS_8) 格式。输入以下命令进行转换。

   ```bash
   openssl pkcs8 -topk8 -inform PEM -outform PEM -in broker_client.key.pem -out broker_client.key-pk8.pem -nocrypt
   ```

2. 生成证书请求。请注意，`CN` 的值用作 broker 客户端的角色令牌。

   ```bash
   openssl req -new -subj "/CN=broker_client" -key broker_client.key.pem -out broker_client.csr.pem -sha256
   ```

3. 用 CA 签署证书。

   ```bash
   openssl x509 -req -in broker_client.csr.pem -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -out broker_client.cert.pem -days 365 -sha256
   ```

此时，您有一个证书 `broker_client.cert.pem` 和一个密钥 `broker_client.key-pk8.pem`，您可以与 `ca.cert.pem` 一起使用它们来为您的 broker 客户端配置 TLS 加密。

#### 创建管理员证书

1. 生成管理员的私钥。

   ```bash
   openssl genrsa -out admin.key.pem 2048
   ```

   管理员期望密钥为 [PKCS 8](https://en.wikipedia.org/wiki/PKCS_8) 格式。输入以下命令进行转换。

   ```bash
   openssl pkcs8 -topk8 -inform PEM -outform PEM -in admin.key.pem -out admin.key-pk8.pem -nocrypt
   ```

2. 生成证书请求。请注意，`CN` 的值用作管理员的角色令牌。

   ```bash
   openssl req -new -subj "/CN=admin" -key admin.key.pem -out admin.csr.pem -sha256
   ```

3. 用 CA 签署证书。

   ```bash
   openssl x509 -req -in admin.csr.pem -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -out admin.cert.pem -days 365 -sha256
   ```

此时，您有一个证书 `admin.cert.pem` 和一个密钥 `admin.key-pk8.pem`，您可以与 `ca.cert.pem` 一起使用它们来为您的 pulsar 管理员配置 TLS 加密。

#### 创建客户端证书

1. 生成客户端的私钥。

   ```bash
   openssl genrsa -out client.key.pem 2048
   ```

   客户端期望密钥为 [PKCS 8](https://en.wikipedia.org/wiki/PKCS_8) 格式。输入以下命令进行转换。

   ```bash
   openssl pkcs8 -topk8 -inform PEM -outform PEM -in client.key.pem -out client.key-pk8.pem -nocrypt
   ```

2. 生成证书请求。请注意，`CN` 的值用作客户端的角色令牌。

   ```bash
   openssl req -new -subj "/CN=client" -key client.key.pem -out client.csr.pem -sha256
   ```

3. 用 CA 签署证书。

   ```bash
   openssl x509 -req -in client.csr.pem -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -out client.cert.pem -days 365 -sha256
   ```

此时，您有一个证书 `client.cert.pem` 和一个密钥 `client.key-pk8.pem`，您可以与 `ca.cert.pem` 一起使用它们来为您的客户端配置 TLS 加密。

#### 创建代理证书（可选）

1. 生成代理的私钥。

   ```bash
   openssl genrsa -out proxy.key.pem 2048
   ```

   代理期望密钥为 [PKCS 8](https://en.wikipedia.org/wiki/PKCS_8) 格式。输入以下命令进行转换。

   ```bash
   openssl pkcs8 -topk8 -inform PEM -outform PEM -in proxy.key.pem -out proxy.key-pk8.pem -nocrypt
   ```

2. 生成证书请求。请注意，`CN` 的值用作代理的角色令牌。

   ```bash
   openssl req -new -subj "/CN=proxy" -key proxy.key.pem -out proxy.csr.pem -sha256
   ```

3. 用 CA 签署证书。

   ```bash
   openssl x509 -req -in proxy.csr.pem -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -out proxy.cert.pem -days 365 -sha256
   ```

此时，您有一个证书 `proxy.cert.pem` 和一个密钥 `proxy.key-pk8.pem`，您可以与 `ca.cert.pem` 一起使用它们来为您的代理配置 TLS 加密。


### 步骤 2：配置 broker

要配置 Pulsar [broker](reference-terminology.md#broker) 使用 TLS 加密，您需要在 Pulsar 安装的 `conf` 目录中将这些值添加到 `broker.conf`。必要时替换适当的证书路径。

```properties
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

# 为内部客户端配置 mTLS
brokerClientTlsEnabled=true
brokerClientTrustCertsFilePath=/path/to/ca.cert.pem
brokerClientCertificateFilePath=/path/to/broker_client.cert.pem
brokerClientKeyFilePath=/path/to/broker_client.key-pk8.pem
```

#### 配置 TLS 协议版本和密码

要配置 broker（和代理）要求特定 TLS 协议版本和密码进行 TLS 协商，您可以使用 TLS 协议版本和密码来阻止客户端请求可能存在弱点的降级 TLS 协议版本或密码。

默认情况下，当 OpenSSL 可用时，Pulsar 使用 OpenSSL，否则 Pulsar 默认回退到 JDK 实现。OpenSSL 目前支持 `TLSv1.1`、`TLSv1.2` 和 `TLSv1.3`。您可以从 OpenSSL ciphers 命令获取支持的密码列表，即 `openssl ciphers -tls1_3`。

TLS 协议版本和密码属性都可以采用多个值，用逗号分隔。协议版本和密码的可能值取决于您使用的 TLS 提供者。

```properties
tlsProtocols=TLSv1.3,TLSv1.2
tlsCiphers=TLS_DH_RSA_WITH_AES_256_GCM_SHA384,TLS_DH_RSA_WITH_AES_256_CBC_SHA
```

* `tlsProtocols=TLSv1.3,TLSv1.2`：列出您将要接受来自客户端的 TLS 协议。默认情况下，它未设置。
* `tlsCiphers=TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`：密码套件是认证、加密、MAC 和密钥交换算法的命名组合，用于协商使用 TLS 网络协议的网络连接的安全设置。默认情况下，它为空。有关更多详细信息，请参阅 [OpenSSL 密码](https://www.openssl.org/docs/man1.0.2/apps/ciphers.html) 和 [JDK 密码](http://docs.oracle.com/javase/8/docs/technotes/guides/security/StandardNames.html#ciphersuites)。

对于 JDK 11，您可以从文档中获取支持的值列表：
- [TLS 协议](https://docs.oracle.com/en/java/javase/11/security/oracle-providers.html#GUID-7093246A-31A3-4304-AC5F-5FB6400405E2__SUNJSSEPROVIDERPROTOCOLPARAMETERS-BBF75009)
- [密码](https://docs.oracle.com/en/java/javase/11/security/oracle-providers.html#GUID-7093246A-31A3-4304-AC5F-5FB6400405E2__SUNJSSE_CIPHER_SUITES)

### 步骤 3：配置代理

在代理上配置 mTLS 包括两个方向的连接，从客户端到代理，以及从代理到 broker。

```properties
# 配置 TLS 端口
servicePortTls=6651
webServicePortTls=8081

# 为客户端连接代理配置证书
tlsCertificateFilePath=/path/to/server.cert.pem
tlsKeyFilePath=/path/to/server.key-pk8.pem
tlsTrustCertsFilePath=/path/to/ca.cert.pem

# 启用 mTLS
tlsRequireTrustedClientCertOnConnect=true

# 为代理连接 broker 配置 TLS
tlsEnabledWithBroker=true
brokerClientTrustCertsFilePath=/path/to/ca.cert.pem
brokerClientCertificateFilePath=/path/to/proxy.cert.pem
brokerClientKeyFilePath=/path/to/proxy.key-pk8.pem
```

### 步骤 4：配置客户端

要启用 TLS 加密，您需要配置客户端使用 `https://` 和端口 8443 作为 Web 服务 URL，使用 `pulsar+ssl://` 和端口 6651 作为 broker 服务 URL。

由于您上面生成的服务器证书不属于任何默认信任链，您还需要指定**信任证书**的路径（推荐）或启用客户端允许不受信任的服务器证书。

以下示例展示了如何为 Java/Python/C++/Node.js/C#/WebSocket 客户端配置 TLS 加密。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"},{"label":"Node.js","value":"Node.js"},{"label":"C#","value":"C#"},{"label":"WebSocket API","value":"WebSocket API"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.client.api.PulsarClient;

PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar+ssl://broker.example.com:6651/")
    .tlsKeyFilePath("/path/to/client.key-pk8.pem")
    .tlsCertificateFilePath("/path/to/client.cert.pem")
    .tlsTrustCertsFilePath("/path/to/ca.cert.pem")
    .enableTlsHostnameVerification(false) // 默认为 false，无论如何
    .allowTlsInsecureConnection(false) // 默认为 false，无论如何
    .build();
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Client

client = Client("pulsar+ssl://broker.example.com:6651/",
                tls_hostname_verification=False,
                tls_trust_certs_file_path="/path/to/ca.cert.pem",
                tls_allow_insecure_connection=False) // 从 v2.2.0 开始默认为 false
```

</TabItem>
<TabItem value="C++">

```cpp
#include <pulsar/Client.h>

ClientConfiguration config = ClientConfiguration();
config.setUseTls(true);  // 很快就不需要了
config.setTlsTrustCertsFilePath(caPath);
config.setTlsAllowInsecureConnection(false);
config.setAuth(pulsar::AuthTls::create(clientPublicKeyPath, clientPrivateKeyPath));
config.setValidateHostName(false);
```

</TabItem>
<TabItem value="Node.js">

```javascript
const Pulsar = require('pulsar-client');

(async () => {
  const client = new Pulsar.Client({
    serviceUrl: 'pulsar+ssl://broker.example.com:6651/',
    tlsTrustCertsFilePath: '/path/to/ca.cert.pem',
    useTls: true,
    tlsValidateHostname: false,
    tlsAllowInsecureConnection: false,
  });
})();
```

</TabItem>
<TabItem value="C#">

```csharp
var certificate = new X509Certificate2("ca.cert.pem");
var client = PulsarClient.Builder()
                         .TrustedCertificateAuthority(certificate) //如果主机上不信任 CA，您可以明确添加它。
                         .VerifyCertificateAuthority(true) //默认为 'true'
                         .VerifyCertificateName(false)     //默认为 'false'
                         .Build();
```

:::note

`VerifyCertificateName` 指的是 C# 客户端中主机名验证的配置。

:::

</TabItem>
<TabItem value="WebSocket API">

```python
import websockets
import asyncio
import base64
import json
import ssl
import pathlib

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
client_cert_pem = pathlib.Path(__file__).with_name("client.cert.pem")
client_key_pem = pathlib.Path(__file__).with_name("client.key.pem")
ca_cert_pem = pathlib.Path(__file__).with_name("ca.cert.pem")
ssl_context.load_cert_chain(certfile=client_cert_pem, keyfile=client_key_pem)
ssl_context.load_verify_locations(ca_cert_pem)
# websocket producer uri wss，不是 ws
uri = "wss://localhost:8080/ws/v2/producer/persistent/public/default/testtopic"
client_pem = pathlib.Path(__file__).with_name("pulsar_client.pem")
ssl_context.load_verify_locations(client_pem)
# websocket producer uri wss，不是 ws
uri = "wss://localhost:8080/ws/v2/producer/persistent/public/default/testtopic"
# 编码消息
s = "Hello World"
firstEncoded = s.encode("UTF-8")
binaryEncoded = base64.b64encode(firstEncoded)
payloadString = binaryEncoded.decode('UTF-8')
async def producer_handler(websocket):
    await websocket.send(json.dumps({
            'payload' : payloadString,
            'properties': {
                'key1' : 'value1',
                'key2' : 'value2'
            },
            'context' : 5
        }))
async def test():
    async with websockets.connect(uri) as websocket:
        await producer_handler(websocket)
        message = await websocket.recv()
        print(f"< {message}")
asyncio.run(test())
```

:::note

除了 `conf/client.conf` 文件中的必需配置外，您还需要在 `conf/broker.conf` 文件中配置更多参数以在 WebSocket 服务上启用 TLS 加密。有关更多详细信息，请参阅 [WebSocket 的安全设置](client-libraries-websocket.md#security-settings)。

:::

</TabItem>
</Tabs>
````

### 步骤 5：配置 CLI 工具

像 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)、[`pulsar-perf`](pathname:///reference/#/@pulsar:version_reference@/pulsar-perf/) 和 [`pulsar-client`](pathname:///reference/#/@pulsar:version_reference@/pulsar-client/) 这样的[命令行工具](reference-cli-tools.md)使用 Pulsar 安装中的 `conf/client.conf` 配置文件。

要将 mTLS 加密与 Pulsar CLI 工具一起使用，您需要将以下参数添加到 `conf/client.conf` 文件中。

```properties
webServiceUrl=https://localhost:8081/
brokerServiceUrl=pulsar+ssl://localhost:6651/
authPlugin=org.apache.pulsar.client.impl.auth.AuthenticationTls
authParams=tlsCertFile:/path/to/admin.cert.pem,tlsKeyFile:/path/to/admin.key-pk8.pem
```

## 使用 KeyStore 配置 mTLS 加密

默认情况下，Pulsar 对 broker 服务和 Web 服务都使用 [Conscrypt](https://github.com/google/conscrypt)。

要使用 KeyStore 配置 mTLS 加密，请完成以下步骤：

### 步骤 1：生成 JKS 证书

您可以使用 Java 的 `keytool` 实用程序为集群中的每台机器生成密钥和证书。

```bash
DAYS=365
CLIENT_COMMON_PARAMS="-storetype JKS -storepass clientpw -keypass clientpw -noprompt"
BROKER_COMMON_PARAMS="-storetype JKS -storepass brokerpw -keypass brokerpw -noprompt"

# 创建密钥存储
keytool -genkeypair -keystore broker.keystore.jks ${BROKER_COMMON_PARAMS} -keyalg RSA -keysize 2048 -alias broker -validity $DAYS \
-dname 'CN=broker,OU=Unknown,O=Unknown,L=Unknown,ST=Unknown,C=Unknown'
keytool -genkeypair -keystore client.keystore.jks ${CLIENT_COMMON_PARAMS} -keyalg RSA -keysize 2048 -alias client -validity $DAYS \
-dname 'CN=client,OU=Unknown,O=Unknown,L=Unknown,ST=Unknown,C=Unknown'

# 导出证书
keytool -exportcert -keystore broker.keystore.jks ${BROKER_COMMON_PARAMS} -file broker.cer -alias broker
keytool -exportcert -keystore client.keystore.jks ${CLIENT_COMMON_PARAMS} -file client.cer -alias client

# 生成信任存储
keytool -importcert -keystore client.truststore.jks ${CLIENT_COMMON_PARAMS} -file broker.cer -alias truststore
keytool -importcert -keystore broker.truststore.jks ${BROKER_COMMON_PARAMS} -file client.cer -alias truststore
```

:::note

要配置[主机名验证](#hostname-verification)，您需要将 ` -ext SAN=IP:127.0.0.1,IP:192.168.20.2,DNS:broker.example.com` 附加到 `BROKER_COMMON_PARAMS` 的值作为主题备用名称 (SAN)。

:::


### 步骤 2：配置 broker

在 `conf/broker.conf` 文件中配置以下参数，并通过文件系统权限限制对存储文件的访问。

```properties
brokerServicePortTls=6651
webServicePortTls=8081

# 需要受信任的客户端证书来连接 TLS
# 如果客户端证书不受信任，则拒绝连接。
# 实际上，这要求所有连接的客户端都执行 TLS 客户端认证。
tlsRequireTrustedClientCertOnConnect=true
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
brokerClientTlsKeyStoreType=JKS
brokerClientTlsKeyStore=/var/private/tls/client.keystore.jks
brokerClientTlsKeyStorePassword=clientpw
```

要禁用非 TLS 端口，您需要将 `brokerServicePort` 和 `webServicePort` 的值设置为空。

:::note

`tlsRequireTrustedClientCertOnConnect` 的默认值为 `false`，表示单向 TLS。当设置为 `true`（启用双向 TLS）时，broker/代理需要受信任的客户端证书；否则，broker/代理拒绝来自客户端的连接请求。

:::

### 步骤 3：配置代理

在代理上配置 mTLS 包括两个方向的连接，从客户端到代理，以及从代理到 broker。

```properties
servicePortTls=6651
webServicePortTls=8081

tlsRequireTrustedClientCertOnConnect=true

# 密钥存储
tlsKeyStoreType=JKS
tlsKeyStore=/var/private/tls/proxy.keystore.jks
tlsKeyStorePassword=brokerpw

# 信任存储
tlsTrustStoreType=JKS
tlsTrustStore=/var/private/tls/proxy.truststore.jks
tlsTrustStorePassword=brokerpw

# 内部客户端/管理客户端配置
tlsEnabledWithKeyStore=true
brokerClientTlsEnabled=true
brokerClientTlsEnabledWithKeyStore=true
brokerClientTlsTrustStoreType=JKS
brokerClientTlsTrustStore=/var/private/tls/client.truststore.jks
brokerClientTlsTrustStorePassword=clientpw
brokerClientTlsKeyStoreType=JKS
brokerClientTlsKeyStore=/var/private/tls/client.keystore.jks
brokerClientTlsKeyStorePassword=clientpw
```

### 步骤 4：配置客户端

与[使用 PEM 配置 mTLS 加密](#configure-clients)类似，您需要为最小配置提供 TrustStore 信息。

以下是一个示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java client"
  values={[{"label":"Java client","value":"Java client"},{"label":"Java admin client","value":"Java admin client"}]}>
<TabItem value="Java client">

```java
    import org.apache.pulsar.client.api.PulsarClient;

    PulsarClient client = PulsarClient.builder()
        .serviceUrl("pulsar+ssl://broker.example.com:6651/")
        .useKeyStoreTls(true)
        .tlsTrustStoreType("JKS")
        .tlsTrustStorePath("/var/private/tls/client.truststore.jks")
        .tlsTrustStorePassword("clientpw")
        .tlsKeyStoreType("JKS")
        .tlsKeyStorePath("/var/private/tls/client.keystore.jks")
        .tlsKeyStorePassword("clientpw")
        .enableTlsHostnameVerification(false) // 默认为 false，无论如何
        .allowTlsInsecureConnection(false) // 默认为 false，无论如何
        .build();
```

:::note

如果将 `useKeyStoreTls` 设置为 `true`，请务必配置 `tlsTrustStorePath`。

:::

</TabItem>
<TabItem value="Java admin client">

```java
    PulsarAdmin amdin = PulsarAdmin.builder().serviceHttpUrl("https://broker.example.com:8443")
        .tlsTrustStoreType("JKS")
        .tlsTrustStorePath("/var/private/tls/client.truststore.jks")
        .tlsTrustStorePassword("clientpw")
        .tlsKeyStoreType("JKS")
        .tlsKeyStorePath("/var/private/tls/client.keystore.jks")
        .tlsKeyStorePassword("clientpw")
        .enableTlsHostnameVerification(false) // 默认为 false，无论如何
        .allowTlsInsecureConnection(false) // 默认为 false，无论如何
        .build();
```

</TabItem>
</Tabs>
````

### 步骤 5：配置 CLI 工具

对于像 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)、[`pulsar-perf`](pathname:///reference/#/@pulsar:version_reference@/pulsar-perf/) 和 [`pulsar-client`](pathname:///reference/#/@pulsar:version_reference@/pulsar-client/) 这样的[命令行工具](reference-cli-tools.md)，使用 Pulsar 安装中的 `conf/client.conf` 配置文件。

```properties
authPlugin=org.apache.pulsar.client.impl.auth.AuthenticationKeyStoreTls
authParams={"keyStoreType":"JKS","keyStorePath":"/var/private/tls/client.keystore.jks","keyStorePassword":"clientpw"}
```

## 启用 TLS 日志记录

您可以通过使用 `javax.net.debug` 系统属性启动 broker 和/或客户端来在 JVM 级别启用 TLS 调试日志记录。例如：

```shell
-Djavax.net.debug=all
```

有关更多详细信息，请参阅 [Oracle 文档](http://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/ReadDebug.html)。