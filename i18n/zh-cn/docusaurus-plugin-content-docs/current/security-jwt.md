---
id: security-jwt
title: Authentication using tokens based on JSON Web Tokens
sidebar_label: "Authentication using JWT"
description: Get a comprehensive understanding of concepts and configuration methods of JWT authentication in Pulsar.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

Pulsar 支持使用基于 [JSON Web Tokens](https://jwt.io/introduction/) ([RFC-7519](https://tools.ietf.org/html/rfc7519)) 的安全令牌对客户端进行认证，包括 [Java JWT 库](https://github.com/jwtk/jjwt#signature-algorithms-keys) 支持的所有算法。

令牌是与用户关联的凭证。关联是通过"主体"或"角色"完成的。对于 JWT 令牌，它通常指代一个**主题（subject）**。您可以使用令牌来标识 Pulsar 客户端，并将其与被允许执行特定操作的**主题**关联，例如向主题发布消息或从主题消费消息。另一种方法是传递"令牌提供者"（一个在客户端库需要时返回令牌的函数）。

应用程序在创建客户端实例时指定令牌。用户通常从管理员那里获取令牌字符串。签名 JWT 的紧凑表示是一个看起来像下面的字符串：

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY
```

:::note

连接到 Pulsar 服务时始终使用 [TLS 加密](security-tls-transport.md)，因为发送令牌相当于在线上发送密码。

:::

## 创建客户端证书

JWT 认证支持两种不同的密钥来生成和验证令牌：

- 对称：单个***密钥***密钥。
- 非对称：密钥对，包括：
  - 用于生成令牌的***私钥***密钥。
  - 用于验证令牌的***公钥***密钥。

### 创建密钥

管理员创建密钥并使用它来生成客户端令牌。您也可以为 broker 配置此密钥以验证客户端。

您可以使用以下命令创建密钥。输出文件在您的 Pulsar 安装目录的根目录中生成。

```shell
bin/pulsar tokens create-secret-key --output my-secret.key
```

您也可以使用以下命令为输出文件提供绝对路径。

```shell
bin/pulsar tokens create-secret-key --output /opt/my-secret.key
```

要生成 base64 编码的私钥，请输入以下命令。

```shell
bin/pulsar tokens create-secret-key --output my-secret.key --base64
```

### 创建密钥对

要使用非对称密钥加密，您需要使用以下命令创建一对密钥。输出文件在您的 Pulsar 安装目录的根目录中生成。

```shell
bin/pulsar tokens create-key-pair --output-private-key my-private.key --output-public-key my-public.key
```

 * 将 `my-private.key` 存储在安全位置，只有管理员可以使用此私钥生成新令牌。
 * 公钥文件 `my-public.key` 分发给所有 Pulsar broker。您可以公开分享它而没有任何安全顾虑。

### 生成令牌

1. 使用此命令要求生成的令牌具有**主题**字段集。此命令在 `stdout` 上打印令牌字符串。

   ```shell
   bin/pulsar tokens create --secret-key file:///path/to/my-secret.key \
               --subject test-user
   ```

2. 通过使用以下命令传递"私钥"来创建令牌：

   ```shell
   bin/pulsar tokens create --private-key file:///path/to/my-private.key \
               --subject test-user
   ```

3. 创建具有预定义 TTL 的令牌。然后令牌自动失效。

   ```shell
   bin/pulsar tokens create --secret-key file:///path/to/my-secret.key \
               --subject test-user \
               --expiry-time 1y
   ```

:::tip

令牌本身没有任何关联的权限。您需要[启用授权并分配超级用户](security-authorization.md#enable-authorization-and-assign-superusers)，并使用 `bin/pulsar-admin namespaces grant-permission` 命令向令牌授予权限。

:::

## 在 broker/proxy 上启用 JWT 认证

要配置 broker/proxy 使用 JWT 对客户端进行认证，请将以下参数添加到 `conf/broker.conf` 和 `conf/proxy.conf` 文件中。如果您使用独立的 Pulsar，则需要将这些参数添加到 `conf/standalone.conf` 文件中：

```properties
# 启用认证的配置
authenticationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderToken

# Broker 本身的认证设置。当 broker 连接到其他 broker 时使用，或当代理连接到 broker 时使用，无论是在相同还是其他集群中
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationToken
brokerClientAuthenticationParameters={"token":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXIifQ.9OHgE9ZUDeBTZs7nSMEFIuGNEX18FLR3qvy8mqxSxXw"}
# 可以配置令牌字符串或指定从文件读取。以下三种可用格式都有效：
# brokerClientAuthenticationParameters={"token":"your-token-string"}
# brokerClientAuthenticationParameters=token:your-token-string
# brokerClientAuthenticationParameters=file:///path/to/token

# 如果使用密钥（注意：密钥文件必须是 DER 编码的）
tokenSecretKey=file:///path/to/secret.key
# 密钥也可以内联传递：
# tokenSecretKey=data:;base64,FLFyW0oLJ2Fi22KKCm21J18mbAdztfSHN/lAT5ucEKU=

# 如果使用公钥/私钥（注意：密钥文件必须是 DER 编码的）
# tokenPublicKey=file:///path/to/public.key
```

## 在 CLI 工具中配置 JWT 认证

像 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)、[`pulsar-perf`](pathname:///reference/#/@pulsar:version_reference@/pulsar-perf/) 和 [`pulsar-client`](pathname:///reference/#/@pulsar:version_reference@/pulsar-client/) 这样的[命令行工具](reference-cli-tools.md)使用 Pulsar 安装中的 `conf/client.conf` 配置文件。

您需要将以下参数添加到 `conf/client.conf` 配置文件中，以便将 JWT 认证与 Pulsar 的 CLI 工具一起使用：

```properties
webServiceUrl=https://broker.example.com:8443/
brokerServiceUrl=pulsar://broker.example.com:6650/
authPlugin=org.apache.pulsar.client.impl.auth.AuthenticationToken
authParams=token:eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY
```

令牌字符串也可以从文件中读取，例如：

```properties
authParams=file:///path/to/token/file
```

## 在 Pulsar 客户端中配置 JWT 认证

您可以使用令牌对以下 Pulsar 客户端进行认证。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"Go","value":"Go"},{"label":"C++","value":"C++"},{"label":"C#","value":"C#"}]}>
<TabItem value="Java">

```java
PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://broker.example.com:6650/")
    .authentication(
        AuthenticationFactory.token("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY"))
    .build();
```

类似地，您也可以传递 `Supplier`：

```java
PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://broker.example.com:6650/")
    .authentication(
        AuthenticationFactory.token(() -> {
            // 从自定义源读取令牌
            return readToken();
        }))
    .build();
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Client, AuthenticationToken

client = Client('pulsar://broker.example.com:6650/',
                authentication=AuthenticationToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY'))
```

或者，您也可以传递 `Supplier`：

```python
def read_token():
    with open('/path/to/token.txt') as tf:
        return tf.read().strip()

client = Client('pulsar://broker.example.com:6650/',
                authentication=AuthenticationToken(read_token))
```

</TabItem>
<TabItem value="Go">

```go
client, err := pulsar.NewClient(pulsar.ClientOptions{
	URL:            "pulsar://localhost:6650",
	Authentication: NewAuthenticationToken("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY"),
})
```

类似地，您也可以传递 `Supplier`：

```go
client, err := pulsar.NewClient(pulsar.ClientOptions{
	URL:            "pulsar://localhost:6650",
	Authentication: pulsar.NewAuthenticationTokenSupplier(func () string {
        // 从自定义源读取令牌
		return readToken()
	}),
})
```

</TabItem>
<TabItem value="C++">

```cpp
#include <pulsar/Client.h>

pulsar::ClientConfiguration config;
config.setAuth(pulsar::AuthToken::createWithToken("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY"));

pulsar::Client client("pulsar://broker.example.com:6650/", config);
```

</TabItem>
<TabItem value="C#">

```csharp
var client = PulsarClient.Builder()
                         .AuthenticateUsingToken("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY")
                         .Build();
```

</TabItem>

</Tabs>
````