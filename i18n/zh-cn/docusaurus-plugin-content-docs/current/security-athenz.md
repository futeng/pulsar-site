---
id: security-athenz
title: Authentication using Athenz
sidebar_label: "Authentication using Athenz"
description: Get a comprehensive understanding of concepts and configuration methods of Athenz authentication in Pulsar.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

[Athenz](https://github.com/AthenZ/athenz) 是一个基于角色的认证/授权系统。在 Pulsar 中，你可以使用 Athenz 角色令牌（也称为 *z-tokens*）来建立客户端的身份。

一个[去中心化的 Athenz 系统](https://github.com/AthenZ/athenz/blob/master/docs/decent_authz_flow.md)包含一个[授**Z**权 **M**anagement **S**ystem](https://github.com/AthenZ/athenz/blob/master/docs/setup_zms.md) (ZMS) 服务器和一个[授**Z**权 **T**oken **S**ystem](https://github.com/AthenZ/athenz/blob/master/docs/setup_zts.md) (ZTS) 服务器。

## 前提条件

首先，你需要通过为*提供者*（向其他服务提供一些资源并具有一些认证/授权策略）和*租户*（被配置为访问提供者中的某些资源）创建域来设置 Athenz 服务访问控制。在这种情况下，提供者对应于 Pulsar 服务本身，租户对应于使用 Pulsar 的每个应用程序（通常是 Pulsar 中的[租户](reference-terminology.md#tenant)）。

### 创建租户域和服务

在租户端，执行以下操作：

1. 创建一个域，例如 `shopping`。
2. 生成一个私钥/公钥对。
3. 在域上使用公钥创建一个服务，例如 `some_app`。

请注意，当 Pulsar 客户端连接到 Broker 时，你需要指定在步骤 2 中生成的私钥。

有关涉及 Athenz UI 的更具体步骤，请参阅[示例服务访问控制设置](https://github.com/AthenZ/athenz/blob/master/docs/example_service_athenz_setup.md#client-tenant-domain)。

### 创建提供者域并将租户服务添加到角色成员

在提供者端，你需要执行以下操作：

1. 创建一个域，例如 `pulsar`。
2. 创建一个角色。
3. 将租户服务添加到角色的成员中。

请注意，你可以在步骤 2 中指定任何操作和资源，因为它们在 Pulsar 中不使用。换句话说，Pulsar 仅将 Athenz 角色令牌用于认证，*不*用于授权。

有关涉及 Athenz UI 的更具体步骤，请参阅[示例服务访问控制设置](https://github.com/AthenZ/athenz/blob/master/docs/example_service_athenz_setup.md#server-provider-domain)。

## 在 Broker/代理上启用 Athenz 认证

要配置 Broker/代理使用 Athenz 对客户端进行认证，请将以下参数添加到 `conf/broker.conf` 和 `conf/proxy.conf` 文件中，并提供 Athenz 认证提供者的类名以及逗号分隔的提供者域名列表。如果你使用独立的 Pulsar，则需要将这些参数添加到 `conf/standalone.conf` 文件中。

```properties
# 添加 Athenz 认证提供者
authenticationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderAthenz
athenzDomainNames=pulsar

# Broker 本身的认证设置。当 Broker 连接到其他 Broker 时使用，或当代理连接到 Broker 时使用，无论是在相同还是其他集群中
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationAthenz
brokerClientAuthenticationParameters={"tenantDomain":"shopping","tenantService":"some_app","providerDomain":"pulsar","privateKey":"file:///path/to/private.pem","keyId":"v1"}
```

## 在 Pulsar 客户端中配置 Athenz 认证

要使用 Athenz 作为认证提供者，你需要在一个哈希中为四个参数提供值：
* `tenantDomain`
* `tenantService`
* `providerDomain`
* `privateKey`

:::tip

`privateKey` 参数支持以下三种模式格式：
* `file:///path/to/file`
* `file:/path/to/file`
* `data:application/x-pem-file;base64,<base64-encoded value>`

:::

你还可以设置一个可选的 `keyId`。以下是一个示例。

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"},{"label":"Node.js","value":"Node.js"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
Map<String, String> authParams = new HashMap();
authParams.put("ztsUrl", "http://localhost:9998");
// authParams.put("ztsProxyUrl", "http://localhost:9999"); // 用于访问 ZTS 的代理（可选，自 v3.0.10/v4.0.3/v4.1.0 起）
authParams.put("tenantDomain", "shopping"); // 租户域名
authParams.put("tenantService", "some_app"); // 租户服务名
authParams.put("providerDomain", "pulsar"); // 提供者域名
authParams.put("privateKey", "file:///path/to/private.pem"); // 租户私钥路径
authParams.put("keyId", "v1"); // 租户私钥的密钥 ID（可选，默认："0"）

Authentication athenzAuth = AuthenticationFactory
        .create(AuthenticationAthenz.class.getName(), authParams);

PulsarClient client = PulsarClient.builder()
        .serviceUrl("pulsar://my-broker.com:6650")
        .authentication(athenzAuth)
        .build();
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Client, AuthenticationAthenz

auth_params = {
    "ztsUrl": "http://localhost:9998",
    # "ztsProxyUrl": "http://localhost:9999",  # 用于访问 ZTS 的代理（可选，自 v3.0.10/v4.0.3/v4.1.0 起）
    "tenantDomain": "shopping",  # 租户域名
    "tenantService": "some_app",  # 租户服务名
    "providerDomain": "pulsar",  # 提供者域名
    "privateKey": "file:///path/to/private.pem",  # 租户私钥路径
    "keyId": "v1"  # 租户私钥的密钥 ID（可选，默认："0"）
}

client = Client(
    "pulsar://my-broker.com:6650",
    authentication=AuthenticationAthenz(**auth_params)
)
```

</TabItem>
<TabItem value="C++">

```cpp
#include <pulsar/Client.h>

pulsar::AuthenticationDataPtr authData = pulsar::AuthAthenz::create(
    "http://localhost:9998",  // ztsUrl
    "shopping",  // tenantDomain
    "some_app",  // tenantService
    "pulsar",  // providerDomain
    "file:///path/to/private.pem",  // privateKey
    "v1"  // keyId（可选）
);

pulsar::ClientConfiguration config;
config.setAuth(authData);

pulsar::Client client("pulsar://my-broker.com:6650", config);
```

</TabItem>
<TabItem value="Node.js">

```javascript
const { Pulsar, AuthenticationAthenz } = require('pulsar-client');

const authParams = {
    ztsUrl: 'http://localhost:9998',
    // ztsProxyUrl: 'http://localhost:9999', // 用于访问 ZTS 的代理（可选，自 v3.0.10/v4.0.3/v4.1.0 起）
    tenantDomain: 'shopping', // 租户域名
    tenantService: 'some_app', // 租户服务名
    providerDomain: 'pulsar', // 提供者域名
    privateKey: 'file:///path/to/private.pem', // 租户私钥路径
    keyId: 'v1' // 租户私钥的密钥 ID（可选，默认："0"）
};

const auth = new AuthenticationAthenz(authParams);

const client = new Pulsar.Client({
    serviceUrl: 'pulsar://my-broker.com:6650',
    authentication: auth
});
```

</TabItem>
<TabItem value="Go">

```go
import (
    "github.com/apache/pulsar-client-go/pulsar"
)

auth := pulsar.NewAuthenticationAthenz(map[string]string{
    "ztsUrl":        "http://localhost:9998",
    // "ztsProxyUrl": "http://localhost:9999", // 用于访问 ZTS 的代理（可选，自 v3.0.10/v4.0.3/v4.1.0 起）
    "tenantDomain":  "shopping", // 租户域名
    "tenantService": "some_app", // 租户服务名
    "providerDomain": "pulsar", // 提供者域名
    "privateKey":   "file:///path/to/private.pem", // 租户私钥路径
    "keyId":        "v1", // 租户私钥的密钥 ID（可选，默认："0"）
})

client, err := pulsar.NewClient(pulsar.ClientOptions{
    URL:            "pulsar://my-broker.com:6650",
    Authentication: auth,
})
```

</TabItem>
</Tabs>
````

## Athenz 认证工作流程

Athenz 认证在 Pulsar 中的工作流程如下：

1. **客户端初始化**：Pulsar 客户端使用租户私钥生成 Athenz 角色令牌。
2. **令牌获取**：客户端向 ZTS 服务器请求角色令牌。
3. **令牌验证**：Broker 接收到连接请求时，使用 Athenz 认证提供者验证令牌。
4. **身份建立**：如果令牌有效，Broker 建立客户端身份并允许连接。

## 故障排除

### 常见问题

1. **令牌过期**：
   * 确保客户端时钟与 ZTS 服务器同步。
   * 检查令牌有效期设置。

2. **私钥格式错误**：
   * 确保私钥是有效的 PEM 格式。
   * 验证私钥文件权限。

3. **域配置错误**：
   * 验证租户域和提供者域的配置。
   * 确保服务已正确添加到角色成员中。

4. **网络连接问题**：
   * 检查客户端与 ZTS 服务器的网络连接。
   * 验证防火墙设置。

### 调试技巧

* 启用 Athena 认证提供者的调试日志。
* 使用 Athenz UI 验证域和角色配置。
* 检查 Broker 日志中的认证错误信息。