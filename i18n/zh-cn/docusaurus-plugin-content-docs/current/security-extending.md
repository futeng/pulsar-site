---
id: security-extending
title: Extend Authentication and Authorization in Pulsar
sidebar_label: "Extend Authentication and Authorization"
description: Learn how to use custom authentication and authorization mechanisms.
---

Pulsar 提供了使用自定义认证和授权机制的方式。

## 认证

您可以通过两个插件的形式提供实现来使用自定义认证机制。
* 客户端认证插件 `org.apache.pulsar.client.api.AuthenticationDataProvider` 为 broker/proxy 提供认证数据。
* Broker/Proxy 认证插件 `org.apache.pulsar.broker.authentication.AuthenticationProvider` 认证来自客户端的认证数据。

### 客户端认证插件

对于客户端库，您需要实现 `org.apache.pulsar.client.api.Authentication`。通过输入以下命令，您可以在创建 Pulsar 客户端时传递此类。

```java
PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://localhost:6650")
    .authentication(new MyAuthentication())
    .build();
```

您可以在客户端实现 2 个接口：
 * [`Authentication`](/api/client/org/apache/pulsar/client/api/Authentication.html)
 * [`AuthenticationDataProvider`](/api/client/org/apache/pulsar/client/api/AuthenticationDataProvider.html)

这反过来要求您以 `org.apache.pulsar.client.api.AuthenticationDataProvider` 的形式提供客户端凭证，同时也为不同类型的连接返回不同类型的认证令牌或传递用于 TLS 的证书链提供机会。

您可以找到以下不同客户端认证插件的示例：
 * [Mutual TLS](https://github.com/apache/pulsar/blob/master/pulsar-client/src/main/java/org/apache/pulsar/client/impl/auth/AuthenticationTls.java)
 * [Athenz](https://github.com/apache/pulsar/blob/master/pulsar-client-auth-athenz/src/main/java/org/apache/pulsar/client/impl/auth/AuthenticationAthenz.java)
 * [Kerberos](https://github.com/apache/pulsar/blob/master/pulsar-client-auth-sasl/src/main/java/org/apache/pulsar/client/impl/auth/AuthenticationSasl.java)
 * [JSON Web Token (JWT)](https://github.com/apache/pulsar/blob/master/pulsar-client/src/main/java/org/apache/pulsar/client/impl/auth/AuthenticationToken.java)
 * [OAuth 2.0](https://github.com/apache/pulsar/blob/master/pulsar-client/src/main/java/org/apache/pulsar/client/impl/auth/oauth2/AuthenticationOAuth2.java)
 * [Basic auth](https://github.com/apache/pulsar/blob/master/pulsar-client/src/main/java/org/apache/pulsar/client/impl/auth/AuthenticationBasic.java)

### Broker/Proxy 认证插件

在 broker/proxy 端，您需要配置相应的插件来验证客户端发送的凭证。代理和 broker 可以同时支持多个认证提供者。

在 `conf/broker.conf` 中，您可以选择指定有效提供者列表：

```properties
# 认证提供者名称列表，以逗号分隔的类名列表
authenticationProviders=
```

:::tip

Pulsar 支持包含多个具有相同认证方法名称的认证提供者的认证提供者链。

例如，您的 Pulsar 集群使用 JSON Web Token (JWT) 认证（认证方法名为 `token`），并且您希望升级它以使用具有相同认证名称的 OAuth2.0 认证。在这种情况下，您可以实现自己的认证提供者 `AuthenticationProviderOAuth2` 并按如下方式配置 `authenticationProviders`。

```properties
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderToken,org.apache.pulsar.broker.authentication.AuthenticationProviderOAuth2
```

因此，当接收到使用 `token` 认证方法的请求时，broker 会查找具有 `token` 认证方法的认证提供者（JWT 和 OAuth2.0 认证）。如果客户端无法通过 JWT 认证，则使用 OAuth2.0 认证。

:::

有关 `org.apache.pulsar.broker.authentication.AuthenticationProvider` 接口的实现，请参考[代码](https://github.com/apache/pulsar/blob/master/pulsar-broker-common/src/main/java/org/apache/pulsar/broker/authentication/AuthenticationProvider.java)。

您可以找到以下不同 broker 认证插件的示例：

 * [Mutual TLS](https://github.com/apache/pulsar/blob/master/pulsar-broker-common/src/main/java/org/apache/pulsar/broker/authentication/AuthenticationProviderTls.java)
 * [Athenz](https://github.com/apache/pulsar/blob/master/pulsar-broker-auth-athenz/src/main/java/org/apache/pulsar/broker/authentication/AuthenticationProviderAthenz.java)
 * [Kerberos](https://github.com/apache/pulsar/blob/master/pulsar-broker-auth-sasl/src/main/java/org/apache/pulsar/broker/authentication/AuthenticationProviderSasl.java)
 * [JSON Web Token (JWT)](https://github.com/apache/pulsar/blob/master/pulsar-broker-common/src/main/java/org/apache/pulsar/broker/authentication/AuthenticationProviderToken.java)
 * [Basic auth](https://github.com/apache/pulsar/blob/master/pulsar-broker-common/src/main/java/org/apache/pulsar/broker/authentication/AuthenticationProviderToken.java)

## 授权

授权是检查特定"角色"或"主体"是否有权限执行某个操作的操作。

默认情况下，您可以使用 Pulsar 提供的嵌入式授权提供者。您也可以通过插件配置不同的授权提供者。请注意，虽然认证插件是为在代理和 broker 中使用而设计的，但授权插件仅为在 broker 上使用而设计。

### Broker 授权插件

要提供自定义授权提供者，您需要实现 `org.apache.pulsar.broker.authorization.AuthorizationProvider` 接口，将此类放在 Pulsar broker 类路径中，并在 `conf/broker.conf` 中配置该类：

 ```properties
 # 授权提供者完全限定类名
 authorizationProvider=org.apache.pulsar.broker.authorization.PulsarAuthorizationProvider
 ```

有关 `org.apache.pulsar.broker.authorization.AuthorizationProvider` 接口的实现，请参考[代码](https://github.com/apache/pulsar/blob/master/pulsar-broker-common/src/main/java/org/apache/pulsar/broker/authorization/AuthorizationProvider.java)。