---
id: security-openid-connect
title: Authentication using OpenID Connect
sidebar_label: "Authentication using OpenID Connect"
description: Get a comprehensive understanding of concepts and configuration methods of OpenID Connect authentication in Pulsar.
---

Apache Pulsar 支持使用 [OpenID Connect](https://openid.net/connect) 对客户端进行认证，这是 OAuth 2.0 协议的实现。使用从符合 OpenID Connect 标准的身份提供者服务（充当令牌颁发者）获得的访问令牌，您可以标识 Pulsar 客户端，并将其与被允许执行某些操作的"主体"（或"角色"）关联，例如向主题发布消息或执行某些管理操作。

OpenID Connect 实现的源代码在 Apache Pulsar git 仓库的 [pulsar-broker-auth-oidc](https://github.com/apache/pulsar/blob/master/pulsar-broker-auth-oidc/) 子模块中。

:::note
Pulsar 的 OpenID Connect 集成从 3.0.0 版本开始可用。
:::

## OpenID Connect 认证流程

与身份提供者认证后，Pulsar 客户端从服务器获取访问令牌，并将此访问令牌传递给 Pulsar 服务器（Broker、Proxy、WebSocket 代理或 Function Worker）进行认证。当使用 `AuthenticationProviderOpenID` 类时，Pulsar 服务器按顺序执行以下验证：

1. 验证令牌的颁发者声明（`iss`）是否是允许的令牌颁发者之一（`openIDAllowedTokenIssuers`）。
2. 按照 [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) 规范从颁发者检索并缓存 OpenID Connect 发现文档。
3. 验证生成的 JSON 文档的 `issuer` 字段是否与令牌的颁发者声明匹配。
4. 从步骤 2 中获得的发现文档提供的 `jwks_uri` 检索并缓存公钥集。
5. 使用步骤 4 中获得的公钥集验证令牌的签名。
6. 验证令牌的声明，如 `aud`、`exp`、`iat` 和 `nbf`。
7. 当令牌验证成功时，Pulsar 服务器从令牌中提取 `sub` 声明（或配置的 `openIDRoleClaim`）并将其用作授权的主体。
8. 当令牌过期时，Pulsar 服务器要求客户端重新与身份提供者进行认证并提供新的访问令牌。如果客户端重新认证失败，Pulsar 服务器将关闭连接。

## 在 Broker 和代理中启用 OpenID Connect 认证

要配置 Pulsar 服务器使用 OpenID Connect 对客户端进行认证，请将以下参数添加到 `conf/broker.conf` 和 `conf/proxy.conf`。如果您使用独立的 Pulsar，请将这些参数添加到 `conf/standalone.conf` 文件中：

```properties
# 启用认证的配置
authenticationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.oidc.AuthenticationProviderOpenID

# AuthenticationProviderOpenID 的必需设置
# 允许的或受信任的令牌颁发者的逗号分隔列表。令牌颁发者是令牌颁发者的 URL。
PULSAR_PREFIX_openIDAllowedTokenIssuers=https://my-issuer-1.com,https://my-issuer-2.com
# 令牌的允许受众列表。受众是令牌的预期接收者。具有至少一个这些受众声明的令牌将通过受众验证检查。
PULSAR_PREFIX_openIDAllowedAudiences=audience-1,audience-2

# 可选设置（显示的值为默认值）
# 包含令牌颁发者受信任证书的文件的路径。如果未设置，使用 JVM 的默认信任存储。
PULSAR_PREFIX_openIDTokenIssuerTrustCertsFilePath=
# 在授权期间用于角色/主体的 JWT 声明。
PULSAR_PREFIX_openIDRoleClaim=sub
# 验证令牌过期时间时使用的宽限期，以秒为单位。
PULSAR_PREFIX_openIDAcceptedTimeLeewaySeconds=0

# 缓存设置
PULSAR_PREFIX_openIDCacheSize=5
PULSAR_PREFIX_openIDCacheRefreshAfterWriteSeconds=64800
PULSAR_PREFIX_openIDCacheExpirationSeconds=86400
PULSAR_PREFIX_openIDHttpConnectionTimeoutMillis=10000
PULSAR_PREFIX_openIDHttpReadTimeoutMillis=10000

# 当令牌出现不在缓存中的密钥 ID（kid 声明）时，刷新 JWKS 之前等待的秒数。此设置在下面有文档说明。
PULSAR_PREFIX_openIDKeyIdCacheMissRefreshSeconds=300

# 是否要求颁发者使用 HTTPS。使用 HTTPS 是 OIDC 规范的一部分，因此默认为 true。
# 此设置用于测试目的，不建议在任何生产环境中使用。
PULSAR_PREFIX_openIDRequireIssuersUseHttps=true

# 描述当颁发者不在允许的颁发者列表中时如何处理 OpenID Connect 配置文档发现的设置。此设置在下面有文档说明。
PULSAR_PREFIX_openIDFallbackDiscoveryMode=DISABLED
```

:::note

当使用 OIDC 连接到 broker 的客户端通过代理时，有必要将 broker 的 `openIDAcceptedTimeLeewaySeconds` 设置为代理的 `authenticationRefreshCheckSeconds` 配置的两倍，因为代理缓存客户端的令牌，仅在令牌过期时才刷新它。因此，在某些情况下，当代理向 broker 发起新连接时，令牌在代理中可能尚未过期，但在到达 broker 时可能已过期。您可以通过正确设置 broker 的 `openIDAcceptedTimeLeewaySeconds` 来缓解这种边缘情况。

:::

### 签名密钥轮换

[OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) 规范为 `AuthenticationProviderOpenID` 提供了一种发现受信任公钥的方法。公钥格式化为 [JSON Web Key (JWK)](https://www.rfc-editor.org/rfc/rfc7517) 集，也称为 JWKS。当身份提供者轮换签名密钥时，身份提供者可能会在 JWKS 缓存刷新之前开始使用新密钥签署令牌。为避免拒绝使用新密钥签署的令牌，OIDC 认证提供者将在令牌具有受信任的颁发者声明但密钥 ID（kid 声明）不在颁发者缓存的 JWKS 中时尝试刷新 JWKS。`openIDKeyIdCacheMissRefreshSeconds` 设置确定 OIDC 认证提供者在尝试刷新 JWKS 之前等待多长时间。默认值为 300 秒。这意味着 JWKS 必须已在缓存中至少 300 秒，然后缺失的密钥 ID 才会触发缓存失效。`openIDKeyIdCacheMissRefreshSeconds` 设置保护 OIDC 认证提供者免受恶意客户端的攻击，该客户端每次连接时都呈现具有新密钥 ID 的令牌。

## 在 Function Worker 中启用 OpenID Connect 认证

要配置 Pulsar Function Worker 使用 OpenID Connect 对客户端进行认证，请将以下参数添加到 `conf/functions_worker.yml` 文件中。这些设置的文档在[上面](#enable-openid-connect-authentication-in-the-brokers-proxies-and-websocket-proxies)。

```yaml
# 启用认证的配置
authenticationEnabled: true
authenticationProviders: ["org.apache.pulsar.broker.authentication.oidc.AuthenticationProviderOpenID"]
properties:
  openIDAllowedTokenIssuers: "https://my-issuer-1.com,https://my-issuer-2.com"
  openIDAllowedAudiences: "audience-1,audience-2"
  openIDTokenIssuerTrustCertsFilePath: ""
  openIDRoleClaim: "sub"
  openIDAcceptedTimeLeewaySeconds: 0
  openIDCacheSize: 5
  openIDCacheRefreshAfterWriteSeconds: 64800
  openIDCacheExpirationSeconds: 86400
  openIDHttpConnectionTimeoutMillis: 10000
  openIDHttpReadTimeoutMillis: 10000
  openIDRequireIssuersUseHttps: true
  openIDFallbackDiscoveryMode: "DISABLED"
```

## 启用与 Kubernetes 的自定义 OpenID Connect 集成

Kubernetes 具有内置的 OpenID Connect 集成，其中[服务账户令牌卷投影](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection)可以轻松地作为签名的 JWT 挂载到 pod 中，用作 OpenID Connect 访问令牌。唯一的缺点是 [Kubernetes 令牌颁发者发现](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#service-account-issuer-discovery)功能不完全符合 OpenID 规范（如其文档明确提到的）。为了解决这些差异，Pulsar 使用 `openIDFallbackDiscoveryMode` 设置来与 Kubernetes 集成，同时在技术上以记录的方式破坏规范。

这些模式配置 Open ID Connect 认证提供者应如何处理具有不在 `openIDAllowedTokenIssuers` 配置的允许颁发者集中的颁发者声明的 JWT。当前实现依赖于使用 Kubernetes API 服务器的 Open ID Connect 功能来发现额外的颁发者或额外的公钥以信任。

`openIDFallbackDiscoveryMode` 的可用值为：`DISABLED`、`KUBERNETES_DISCOVER_TRUSTED_ISSUER` 和 `KUBERNETES_DISCOVER_PUBLIC_KEYS`。快速总结是 EKS 目前需要 `KUBERNETES_DISCOVER_TRUSTED_ISSUER`，但 GKE 和 AKS 需要 `KUBERNETES_DISCOVER_PUBLIC_KEYS`。实现细节如下。

1. `DISABLED`：不会发现额外的受信任颁发者或公钥。此设置要求操作员明确允许所有将被信任的颁发者。为了使 Kubernetes 服务账户令牌投影工作，操作员必须明确信任令牌 `iss` 声明上的颁发者。这是默认设置，因为它是唯一明确遵循 OIDC 规范来验证发现的提供者配置的模式。
2. `KUBERNETES_DISCOVER_TRUSTED_ISSUER`：Kubernetes API 服务器将用于发现额外的受信任颁发者，通过获取 API 服务器的 `/.well-known/openid-configuration` 端点上的颁发者，验证该颁发者与提供的令牌上的 `iss` 声明匹配，然后通过该颁发者的 `/.well-known/openid-configuration` 端点发现 `jwks_uri` 将该颁发者视为受信任的颁发者。此模式在 EKS 环境中很有用，其中在 `/openid/v1/jwks` 端点提供的 API 服务器的公钥与在颁发者的 `jwks_uri` 提供的公钥不同。它不符合 OIDC 规范，因为用于发现提供者配置的 URL 与令牌上的颁发者声明不同。
3. `KUBERNETES_DISCOVER_PUBLIC_KEYS`：Kubernetes API 服务器将用于发现额外的有效公钥集，通过获取 API 服务器的 `/.well-known/openid-configuration` 端点上的颁发者，验证该颁发者与提供的令牌上的 `iss` 声明匹配，然后调用 API 服务器端点以使用 Kubernetes 客户端获取公钥。此模式目前对于从 API 服务器获取公钥很有用，因为 API 服务器需要自定义 TLS 和认证，而 Kubernetes 客户端会自动处理这些。它不符合 OIDC 规范，因为用于发现提供者配置的 URL 与令牌上的颁发者声明不同。

:::note

当使用 `KUBERNETES_DISCOVER_TRUSTED_ISSUER` 或 `KUBERNETES_DISCOVER_PUBLIC_KEYS` 部署时，您可能会遇到类似以下错误 `forbidden: User \"system:serviceaccount:pulsar:superuser\" cannot get path \"/.well-known/openid-configuration/\"`。该错误是 https://github.com/kubernetes/kubernetes/issues/117455 的结果，这是因为 `AuthenticationProviderOpenID` 插件使用 Java Kubernetes 客户端连接到 Kubernetes API 服务器。解决方案是侵入性最小的，是对您的目标 Kubernetes 集群运行以下命令：

```bash
kubectl patch clusterrole system:service-account-issuer-discovery --patch '{"rules":[{"nonResourceURLs":["/.well-known/openid-configuration/","/.well-known/openid-configuration","/openid/v1/jwks/","/openid/v1/jwks"],"verbs":["get"]}]}'
```

:::

## 配置 Pulsar 组件和应用程序使用投影的服务账户令牌与其他 Pulsar 组件进行认证

要在您的 pulsar 组件中利用[服务账户令牌卷投影](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection)，请按照 Kubernetes 文档关于挂载服务账户令牌的说明，然后配置 pulsar 组件使用令牌的以下配置：

```properties
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationToken
brokerClientAuthenticationParameters=file:///path/to/mounted/token
```

我们使用 `AuthenticationToken` 客户端插件，因为 Kubernetes 会自动为我们检索和刷新令牌。`AuthenticationToken` 有效，因为它总是从文件系统读取令牌，这确保它总是读取最新的令牌。

## 同时启用 AuthenticationProviderOpenID Connect 和 AuthenticationProviderToken

为了简化从静态 JWT 到 OIDC 认证的迁移，可以同时配置 `AuthenticationProviderOpenID` 和 `AuthenticationProviderToken`。这允许从静态 JWT 到 OIDC 令牌的无缝过渡。`AuthenticationProviderToken` 将用于认证不提供 OIDC 令牌的客户端，而 `AuthenticationProviderOpenID` 将用于认证提供 OIDC 令牌的客户端。

## 在 Pulsar 客户端和 CLI 工具中配置 OIDC 认证

Pulsar OAuth2 客户端插件可用于依赖客户端凭证流程的客户端进行 OIDC。有关配置客户端与运行 OIDC 认证提供者的 Pulsar 服务器集成的信息，请参阅 [OAuth2 客户端](security-oauth2.md#configure-oauth2-authentication-in-pulsar-clients) 文档。