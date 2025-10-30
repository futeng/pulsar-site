---
id: security-oauth2
title: Authentication using OAuth 2.0 access tokens
sidebar_label: "Authentication using OAuth 2.0 access tokens"
description: Get a comprehensive understanding of concepts and configuration methods of OAuth authentication in Pulsar.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

Pulsar 支持使用 OAuth 2.0 访问令牌对客户端进行认证。使用从 OAuth 2.0 授权服务（充当令牌颁发者）获得的访问令牌，您可以标识 Pulsar 客户端，并将其与被允许执行某些操作的"主体"（或"角色"）关联，例如向主题发布消息或从主题消费消息。

与 OAuth 2.0 服务器通信后，Pulsar 客户端从服务器获取访问令牌，并将此访问令牌传递给 broker 进行认证。默认情况下，broker 可以使用 `org.apache.pulsar.broker.authentication.AuthenticationProviderToken`。或者，您可以自定义 `AuthenticationProvider` 的值。

## 在 broker/proxy 上启用 OAuth2 认证

要配置 broker/proxy 使用 OAuth2 对客户端进行认证，请将以下参数添加到 `conf/broker.conf` 和 `conf/proxy.conf` 文件中。如果您使用独立的 Pulsar，则需要将这些参数添加到 `conf/standalone.conf` 文件中：

```properties
# 启用认证的配置
authenticationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderToken

# Broker 本身的认证设置。当 broker 连接到其他 broker 时使用，或当代理连接到 broker 时使用，无论是在相同还是其他集群中
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.oauth2.AuthenticationOAuth2
brokerClientAuthenticationParameters={"privateKey":"file:///path/to/privateKey","audience":"https://dev-kt-aa9ne.us.auth0.com/api/v2/","issuerUrl":"https://dev-kt-aa9ne.us.auth0.com"}
# brokerClientAuthenticationParameters={"privateKey":"data:application/json;base64,privateKey-body-to-base64","audience":"https://dev-kt-aa9ne.us.auth0.com/api/v2/","issuerUrl":"https://dev-kt-aa9ne.us.auth0.com"}

# 如果使用密钥（注意：密钥文件必须是 DER 编码的）
tokenSecretKey=file:///path/to/secret.key
# 密钥也可以内联传递：
# tokenSecretKey=data:;base64,FLFyW0oLJ2Fi22KKCm21J18mbAdztfSHN/lAT5ucEKU=

# 如果使用公钥/私钥（注意：密钥文件必须是 DER 编码的）
# tokenPublicKey=file:///path/to/public.key
```

## 在 Pulsar 客户端中配置 OAuth2 认证

您可以将 OAuth2 认证提供者与以下 Pulsar 客户端一起使用。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"},{"label":"Node.js","value":"Node.js"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.client.impl.auth.oauth2.AuthenticationFactoryOAuth2;

URL issuerUrl = new URL("https://dev-kt-aa9ne.us.auth0.com");
URL credentialsUrl = new URL("file:///path/to/KeyFile.json");
String audience = "https://dev-kt-aa9ne.us.auth0.com/api/v2/";

PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://broker.example.com:6650/")
    .authentication(
        AuthenticationFactoryOAuth2.clientCredentials(issuerUrl, credentialsUrl, audience))
    .build();
```

此外，您还可以使用编码参数为 Pulsar Java 客户端配置认证。

```java
Authentication auth = AuthenticationFactory
    .create(AuthenticationOAuth2.class.getName(), "{"type":"client_credentials","privateKey":"./key/path/..","issuerUrl":"...","audience":"..."}");
PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://broker.example.com:6650/")
    .authentication(auth)
    .build();
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Client, AuthenticationOauth2

params = '''
{
    "issuer_url": "https://dev-kt-aa9ne.us.auth0.com",
    "private_key": "/path/to/privateKey",
    "audience": "https://dev-kt-aa9ne.us.auth0.com/api/v2/"
}
'''

client = Client("pulsar://my-cluster:6650", authentication=AuthenticationOauth2(params))
```

</TabItem>
<TabItem value="C++">

```cpp
#include <pulsar/Client.h>

pulsar::ClientConfiguration config;
std::string params = R"({
    "issuer_url": "https://dev-kt-aa9ne.us.auth0.com",
    "private_key": "../../pulsar-broker/src/test/resources/authentication/token/cpp_credentials_file.json",
    "audience": "https://dev-kt-aa9ne.us.auth0.com/api/v2/"})";

config.setAuth(pulsar::AuthOauth2::create(params));

pulsar::Client client("pulsar://broker.example.com:6650/", config);
```

</TabItem>
<TabItem value="Node.js">

```javascript
    const Pulsar = require('pulsar-client');
    const issuer_url = process.env.ISSUER_URL;
    const private_key = process.env.PRIVATE_KEY;
    const audience = process.env.AUDIENCE;
    const scope = process.env.SCOPE;
    const service_url = process.env.SERVICE_URL;
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    (async () => {
      const params = {
        issuer_url: issuer_url
      }
      if (private_key.length > 0) {
        params['private_key'] = private_key
      } else {
        params['client_id'] = client_id
        params['client_secret'] = client_secret
      }
      if (audience.length > 0) {
        params['audience'] = audience
      }
      if (scope.length > 0) {
        params['scope'] = scope
      }
      const auth = new Pulsar.AuthenticationOauth2(params);
      // 创建客户端
      const client = new Pulsar.Client({
        serviceUrl: service_url,
        tlsAllowInsecureConnection: true,
        authentication: auth,
      });
      await client.close();
    })();
```

:::note

OAuth2 认证的支持仅在 Node.js 客户端 1.6.2 及更高版本中可用。

:::

</TabItem>
<TabItem value="Go">

```go
oauth := pulsar.NewAuthenticationOAuth2(map[string]string{
		"type":       "client_credentials",
		"issuerUrl":  "https://dev-kt-aa9ne.us.auth0.com",
		"audience":   "https://dev-kt-aa9ne.us.auth0.com/api/v2/",
		"privateKey": "/path/to/privateKey",
		"clientId":   "0Xx...Yyxeny",
	})
client, err := pulsar.NewClient(pulsar.ClientOptions{
		URL:              "pulsar://my-cluster:6650",
		Authentication:   oauth,
})
```

</TabItem>
</Tabs>
````

## 在 CLI 工具中配置 OAuth2 认证

本节描述如何使用 Pulsar CLI 工具通过 OAuth2 认证插件连接集群。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"pulsar-client","value":"pulsar-client"},{"label":"pulsar-perf","value":"pulsar-perf"}]}>
<TabItem value="pulsar-admin">

```shell
bin/pulsar-admin --admin-url https://streamnative.cloud:443 \
    --auth-plugin org.apache.pulsar.client.impl.auth.oauth2.AuthenticationOAuth2 \
    --auth-params '{"privateKey":"file:///path/to/key/file.json",
        "issuerUrl":"https://dev-kt-aa9ne.us.auth0.com",
        "audience":"https://dev-kt-aa9ne.us.auth0.com/api/v2/"}' \
    tenants list
```

</TabItem>
<TabItem value="pulsar-client">

```shell
bin/pulsar-client \
    --url SERVICE_URL \
    --auth-plugin org.apache.pulsar.client.impl.auth.oauth2.AuthenticationOAuth2 \
    --auth-params '{"privateKey":"file:///path/to/key/file.json",
        "issuerUrl":"https://dev-kt-aa9ne.us.auth0.com",
        "audience":"https://dev-kt-aa9ne.us.auth0.com/api/v2/"}' \
    produce test-topic -m "test-message" -n 10
```

</TabItem>
<TabItem value="pulsar-perf">

```shell
bin/pulsar-perf produce --service-url pulsar+ssl://streamnative.cloud:6651 \
    --auth-plugin org.apache.pulsar.client.impl.auth.oauth2.AuthenticationOAuth2 \
    --auth-params '{"privateKey":"file:///path/to/key/file.json",
        "issuerUrl":"https://dev-kt-aa9ne.us.auth0.com",
        "audience":"https://dev-kt-aa9ne.us.auth0.com/api/v2/"}' \
    -r 1000 -s 1024 test-topic
```

</TabItem>
</Tabs>
````

* 将 `admin-url` 参数设置为 Web 服务 URL。Web 服务 URL 是协议、主机名和端口 ID 的组合，例如 `pulsar://localhost:6650`。
* 根据密钥文件中的配置将 `privateKey`、`issuerUrl` 和 `audience` 参数设置为值。有关详细信息，请参阅[认证类型](#authentication-types)。

#### 认证类型

目前，Pulsar 客户端仅支持 `client_credentials` 认证类型。认证类型决定如何通过 OAuth 2.0 授权服务获取访问令牌。

下表概述了 `client_credentials` 认证类型的参数。

| 参数 | 描述 | 示例 | 是否必需 |
| --- | --- | --- | --- |
| `type` | OAuth 2.0 认证类型。 |  `client_credentials`（默认） | 可选 |
| `issuerUrl` | 允许 Pulsar 客户端获取访问令牌的认证提供者的 URL。 | `https://accounts.google.com` | 必需 |
| `privateKey` | JSON 凭证文件的 URL。 | 支持以下模式格式： <br /> <li> `file:///path/to/file` </li><li>`file:/path/to/file` </li><li> `data:application/json;base64,<base64-encoded value>` </li>| 必需 |
| `audience`  | Pulsar 集群的 OAuth 2.0"资源服务器"标识符。 | `https://broker.example.com` | 可选 |
| `scope` |  访问请求的范围。<br />有关更多信息，请参阅[访问令牌范围](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3)。 | api://pulsar-cluster-1/.default | 可选 |

凭证文件 `credentials_file.json` 包含与客户端认证类型一起使用的服务账户凭证。以下是凭证文件的示例。认证类型默认设置为 `client_credentials`。字段 "client_id" 和 "client_secret" 是必需的。

```json
{
  "type": "client_credentials",
  "client_id": "d9ZyX97q1ef8Cr81WHVC4hFQ64vSlDK3",
  "client_secret": "on1uJ...k6F6R",
  "client_email": "1234567890-abcdefghijklmnopqrstuvwxyz@developer.gserviceaccount.com",
  "issuer_url": "https://accounts.google.com"
}
```

以下是一个典型的原始 OAuth2 请求的示例，用于从 OAuth2 服务器获取访问令牌。

```bash
curl --request POST \
  --url https://dev-kt-aa9ne.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
  "client_id":"Xd23RHsUnvUlP7wchjNYOaIfazgeHd9x",
  "client_secret":"rT7ps7WY8uhdVuBTKWZkttwLdQotmdEliaM5rLfmgNibvqziZ-g07ZH52N_poGAb",
  "audience":"https://dev-kt-aa9ne.us.auth0.com/api/v2/",
  "grant_type":"client_credentials"}'
```

在上面的示例中，映射关系如下所示。
- `issuerUrl` 参数映射到 `--url https://dev-kt-aa9ne.us.auth0.com`。
- `privateKey` 参数应至少包含 `client_id` 和 `client_secret` 字段。
- `audience` 参数映射到 `"audience":"https://dev-kt-aa9ne.us.auth0.com/api/v2/"`。此字段仅由某些身份提供者使用。