---
id: security-token-admin
title: Token authentication admin
sidebar_label: "Token authentication admin"
---

## 令牌认证概述

Pulsar 支持使用基于 [JSON Web Tokens](https://jwt.io/introduction/) ([RFC-7519](https://tools.ietf.org/html/rfc7519)) 的安全令牌对客户端进行认证。

令牌用于标识 Pulsar 客户端并与某个"主体"（或"角色"）关联，然后该主体将被授予权限以执行某些操作（例如：从主题发布或消费）。

用户通常会从管理员（或某些自动化服务）那里获得一个令牌字符串。

签名 JWT 的紧凑表示是一个看起来像这样的字符串：

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.ipevRNuRP6HflG8cFKnmUPtypruRC4fb1DWtoLL62SY
```

应用程序在创建客户端实例时指定令牌。另一种方法是传递"令牌提供者"，也就是说，一个在客户端库需要时返回令牌的函数。

> #### 始终使用 TLS 传输加密
> 发送令牌相当于在线上发送密码。强烈建议在与 Pulsar 服务通信时始终使用 TLS 加密。请参阅[使用 TLS 的传输加密](security-tls-transport.md)

## 密钥 vs 公钥/私钥

JWT 支持两种不同的密钥来生成和验证令牌：

 * 对称：
    - 有一个单一的***密钥***密钥，既用于生成也用于验证
 * 非对称：有一对密钥。
    - ***私钥***密钥用于生成令牌
    - ***公钥***密钥用于验证令牌

### 密钥

使用密钥时，管理员将创建密钥并用它来生成客户端令牌。此密钥也将配置给 broker 以允许它们验证客户端。

#### 创建密钥

> 输出文件将在您的 pulsar 安装目录的根目录中生成。您也可以为输出文件提供绝对路径。

```shell
bin/pulsar tokens create-secret-key --output my-secret.key
```

要生成 base64 编码的私钥

```shell
bin/pulsar tokens create-secret-key --output  /opt/my-secret.key --base64
```

### 公钥/私钥

使用公钥/私钥时，我们需要创建一对密钥。Pulsar 支持 Java JWT 库支持的所有算法，如[此处](https://github.com/jwtk/jjwt#signature-algorithms-keys)所示

#### 创建密钥对

> 输出文件将在您的 pulsar 安装目录的根目录中生成。您也可以为输出文件提供绝对路径。

```shell
bin/pulsar tokens create-key-pair --output-private-key my-private.key --output-public-key my-public.key
```

 * `my-private.key` 将存储在安全位置，仅由管理员用于生成新令牌。
 * `my-public.key` 将分发给所有 Pulsar broker。此文件可以公开分享而没有任何安全顾虑。

## 生成令牌

令牌是与用户关联的凭证。关联是通过"主体"或"角色"完成的。对于 JWT 令牌，此字段通常称为**主题（subject）**，尽管它完全是相同的概念。

生成的令牌需要具有**主题**字段集。

```shell
bin/pulsar tokens create --secret-key file:///path/to/my-secret.key \
         --subject test-user
```

这将在 stdout 上打印令牌字符串。

类似地，可以通过传递"私钥"来创建令牌：

```shell
bin/pulsar tokens create --private-key file:///path/to/my-private.key \
         --subject test-user
```

最后，也可以创建具有预定义 TTL 的令牌。在该时间之后，令牌将自动失效。

```shell
bin/pulsar tokens create --secret-key file:///path/to/my-secret.key \
         --subject test-user \
         --expiry-time 1y
```

## 授权

令牌本身没有任何关联的权限。这将由授权引擎确定。创建令牌后，可以为此令牌授予权限以执行某些操作。例如：

```shell
bin/pulsar-admin namespaces grant-permission my-tenant/my-namespace \
         --role test-user \
         --actions produce,consume
```

## 启用令牌认证 ...

### ... 在 Broker 上

要配置 broker 对客户端进行认证，请在 `broker.conf` 中放入以下内容：

```properties
# 启用认证和授权的配置
authenticationEnabled=true
authorizationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderToken

# 如果使用密钥（注意：密钥文件必须是 DER 编码的）
tokenSecretKey=file:///path/to/secret.key
# 密钥也可以内联传递：
# tokenSecretKey=data:;base64,FLFyW0oLJ2Fi22KKCm21J18mbAdztfSHN/lAT5ucEKU=

# 如果使用公钥/私钥（注意：密钥文件必须是 DER 编码的）
# tokenPublicKey=file:///path/to/public.key
```

### ... 在代理上

要配置代理对客户端进行认证，请在 `proxy.conf` 中放入以下内容：

代理将拥有自己用于与 broker 通信的令牌。此密钥对的角色令牌应在 broker 的 `proxyRoles` 中配置。有关更多详细信息，请参阅[授权指南](security-authorization.md)。

```properties
# 对于连接到代理的客户端
authenticationEnabled=true
authorizationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderToken
tokenSecretKey=file:///path/to/secret.key

# 对于代理连接到 broker
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationToken
brokerClientAuthenticationParameters={"token":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXIifQ.9OHgE9ZUDeBTZs7nSMEFIuGNEX18FLR3qvy8mqxSxXw"}
# 或者，从文件读取令牌
# brokerClientAuthenticationParameters=file:///path/to/proxy-token.txt
```