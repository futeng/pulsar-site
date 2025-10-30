---
id: security-overview
title: Pulsar security overview
sidebar_label: "Overview"
description: Get a comprehensive understanding of Pulsar security, including encryption, authentication, and authorization.
---

:::note

Apache Pulsar 有单独的页面用于[安全公告和安全策略](https://pulsar.apache.org/security/)。

:::

作为企业的中央消息总线，Apache Pulsar 经常用于存储关键任务数据。因此，在 Pulsar 中启用安全功能至关重要。本章描述了 Pulsar 使用的主要安全控制措施，以帮助保护您的数据。

Pulsar 安全基于以下核心支柱。
- [加密](#encryption)
- [认证](#authentication)
- [授权](#authorization)

默认情况下，Pulsar 不配置加密、认证或授权。任何客户端都可以通过纯文本服务 URL 与 Pulsar 通信。因此，您必须确保通过这些纯文本服务 URL 访问 Pulsar 仅限于受信任的客户端。在这种情况下，您可以使用网络分段和/或授权 ACL 来限制对受信任 IP 的访问。如果您两者都不使用，集群状态是完全开放的，任何人都可以访问集群。

Apache Pulsar 使用[认证提供者](#authentication)或[认证提供者链](security-extending.md#proxybroker-authentication-plugin)来建立客户端的身份，然后为该客户端分配*角色令牌*（如 `admin` 或 `app1` 等字符串）。此角色令牌可以代表单个客户端或多个客户端，然后用于[授权](security-authorization.md)以确定客户端被授权执行什么操作。您可以使用角色来控制客户端向某些主题生产或消费的权限、管理租户的配置等等。

## 加密

加密确保如果攻击者获得对您数据的访问权，攻击者在没有加密密钥访问权的情况下无法读取数据。加密为保护传输中的数据提供了重要机制，以满足您对加密算法和密钥管理的安全要求。

**下一步做什么？**

- 要配置端到端加密，请参阅[端到端加密](security-encryption.md)了解更多详细信息。
- 要配置传输层加密，请参阅[TLS 加密](security-tls-transport.md)了解更多详细信息。

## 认证

认证是验证客户端身份的过程。在 Pulsar 中，认证提供者负责正确识别客户端并将其与角色令牌关联。请注意，如果您仅启用认证，经过认证的角色令牌可以访问集群中的所有资源。

### 认证在 Pulsar 中如何工作

Pulsar 提供可插拔的认证框架，Pulsar broker/proxy 使用此机制对客户端进行认证。

每个客户端向 broker 传递其认证数据的方式根据其使用的协议而有所不同。Broker 在建立连接时验证认证凭据，并检查认证数据是否已过期。
- 当使用 HTTP/HTTPS 协议进行集群管理时，每个客户端基于 HTTP/HTTPS 请求头传递认证数据，broker 在请求时检查数据。
- 当使用 [Pulsar 协议](developing-binary-protocol.md) 进行生产/消费时，每个客户端在连接到 broker 时通过发送 `CommandConnect` 命令传递认证数据。Broker 缓存数据并定期检查数据是否已过期，并了解客户端是否支持认证刷新。默认情况下，`authenticationRefreshCheckSeconds` 设置为 60 秒。
  - 如果客户端支持认证刷新且凭据已过期，broker 发送 `CommandAuthChallenge` 命令与客户端交换认证数据。如果下一次检查发现之前的认证交换尚未返回，broker 将断开客户端连接。
  - 如果客户端不支持认证刷新且凭据已过期，broker 将断开客户端连接。

### 代理上的认证数据限制

当您在客户端和 broker 之间使用代理时，有两种认证数据：
* 来自代理的认证数据，broker 默认对其进行认证 - 称为**自认证**。
* 来自客户端的认证数据，代理将其转发给 broker 进行认证 - 称为**原始认证**。

**重要提示：** 如果您的认证数据包含过期时间，或者您的授权提供者依赖于认证数据，您必须：

1. 确保代理的认证数据没有过期时间，因为 broker 不支持刷新此认证数据。
2. 在 `conf/proxy.conf` 文件中将 `forwardAuthorizationCredentials` 设置为 `true`。
3. 在 `conf/broker.conf` 文件中将 `authenticateOriginalAuthData` 设置为 `true`，这确保 broker 重新检查客户端认证。

**下一步做什么？**

- 要配置内置认证插件，请阅读：
  - [mTLS 认证](security-tls-authentication.md)
  - [Athenz 认证](security-athenz.md)
  - [Kerberos 认证](security-kerberos.md)
  - [JSON Web Token (JWT) 认证](security-jwt.md)
  - [OAuth 2.0 认证](security-oauth2.md)
  - [OpenID Connect](security-openid-connect.md)
  - [HTTP 基本认证](security-basic-auth.md)
- 要自定义认证插件，请阅读[扩展认证](security-extending.md)。

:::note

从 2.11.0 版本开始，您可以将 [TLS 加密](security-tls-transport.md)与上述任何一种认证提供者一起配置。

:::

## 授权

[授权](security-authorization.md)是向客户端授予权限并确定客户端可以做什么的过程。

拥有最多权限的角色令牌是超级用户，他们可以创建和删除租户，以及完全访问所有租户资源。当超级用户创建租户时，该租户被分配管理员角色令牌。具有管理员角色令牌的客户端随后可以创建、修改和销毁命名空间，并在这些命名空间上向其他角色令牌授予和撤销权限。