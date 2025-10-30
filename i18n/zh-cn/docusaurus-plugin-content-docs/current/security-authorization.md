---
id: security-authorization
title: Authentication and authorization in Pulsar
sidebar_label: "Authorization and ACLs"
description: Get a comprehensive understanding of authentication and authorization in Pulsar.
---


在 Pulsar 中，[认证提供者](security-overview.md#authentication) 负责正确识别客户端并将客户端与角色令牌关联。如果只启用认证，经过认证的角色令牌可以访问集群中的所有资源。*授权*是确定客户端可以做什么的过程。

具有最多权限的角色令牌是*超级用户*。*超级用户*可以创建和销毁租户，并对所有租户资源具有完全访问权限。

当超级用户创建[租户](reference-terminology.md#tenant)时，该租户被分配一个管理员角色。具有管理员角色令牌的客户端随后可以创建、修改和销毁命名空间，并在这些命名空间上向*其他角色令牌*授予和撤销权限。

## Broker 和代理设置

### 启用授权并分配超级用户

你可以在 Broker（[`conf/broker.conf`](reference-configuration.md#broker) 或 `conf/standalone.conf`）配置文件中启用授权并分配超级用户。

```conf
authorizationEnabled=true
superUserRoles=broker_client,admin,proxy,<custom-super-user-1>,<custom-super-user-2>
```

> 完整的参数列表可在 `conf/broker.conf` 或 `conf/standalone.conf` 文件中找到。
> 你还可以在 [Broker 配置](reference-configuration.md) 中找到这些参数的默认值。

通常，你使用超级用户角色来管理管理员、客户端以及 Broker 到 Broker 的授权。当你使用[地域复制](concepts-replication.md)时，每个 Broker 都需要能够发布到所有集群的所有其他 Topic。

你也可以在代理配置文件（`conf/proxy.conf`）中为代理启用授权。一旦在代理上启用授权，代理在将请求转发给 Broker 之前会进行额外的授权检查。
如果你在 Broker 上启用授权，Broker 在接收到转发的请求时会检查请求的授权。

### 代理角色

默认情况下，Broker 将代理和 Broker 之间的连接视为普通用户连接。Broker 将用户认证为在 `proxy.conf` 中配置的角色（请参阅[在代理上启用 mTLS 认证](security-tls-authentication.md#enable-mtls-authentication-on-proxies)）。然而，当用户通过代理连接到集群时，用户很少需要认证。用户期望能够以他们向代理认证的角色与集群交互。

Pulsar 使用*代理角色*来启用认证。代理角色在 Broker 配置文件 [`conf/broker.conf`](reference-configuration.md) 中指定。如果经过 Broker 认证的客户端是其 `proxyRoles` 之一，则来自该客户端的所有请求还必须携带有关向代理认证的客户端角色的信息。此信息称为*原始主体*。如果缺少*原始主体*，客户端将无法访问任何内容。

请注意，如果代理未正确配置为使用 `proxyRoles` 中的角色，连接将被拒绝。

你必须同时授权*代理角色*和*原始主体*访问资源，以确保资源可通过代理访问。管理员可以采用两种方法来授权*代理角色*和*原始主体*。

更安全的方法是每次授予资源访问权限时，都向代理角色授予访问权限。例如，如果你有一个名为 `proxy1` 的代理角色，当超级用户创建租户时，你应该将 `proxy1` 指定为一个管理员角色。当一个角色被授予从命名空间生产或消费的权限时，如果该客户端希望通过代理进行生产或消费，你还应该向 `proxy1` 授予相同的权限。

另一种方法是使代理角色成为超级用户。这允许代理访问所有资源。客户端仍需要向代理进行认证，并且通过代理发出的所有请求的角色都会降级为经过认证的客户端的*原始主体*。但是，如果代理被攻破，恶意行为者可能会获得对集群的完全访问权限。

你可以在 [`conf/broker.conf`](reference-configuration.md#broker) 中将角色指定为代理角色。

```properties
proxyRoles=proxy,<my-proxy-role>
```

## 授权模型

Pulsar 使用基于角色的访问控制（RBAC）模型。资源访问权限在命名空间级别管理。

### 权限类型

Pulsar 支持以下权限类型：

| 权限 | 描述 |
|------|------|
| `produce` | 允许生产者向 Topic 发送消息 |
| `consume` | 允许消费者从 Topic 接收消息 |
| `functions` | 允许管理 Pulsar Functions |
| `sources` | 允许管理 Pulsar IO Sources |
| `sinks` | 允许管理 Pulsar IO Sinks |
| `packages` | 允许管理 Pulsar Packages |

### 授权命令

你可以使用 `pulsar-admin` 工具管理权限：

```bash
# 授予角色权限
bin/pulsar-admin namespaces grant-permission \
  --role <role-name> \
  --action produce,consume \
  persistent://tenant/namespace/topic

# 撤销角色权限
bin/pulsar-admin namespaces revoke-permission \
  --role <role-name> \
  persistent://tenant/namespace/topic

# 列出权限
bin/pulsar-admin namespaces permissions \
  persistent://tenant/namespace
```

## 最佳实践

* **最小权限原则**：只授予用户和服务所需的最小权限。
* **定期审查权限**：定期审查和撤销不再需要的权限。
* **使用角色组**：将相似的用户分组到角色中，而不是单独管理每个用户。
* **监控权限更改**：监控权限更改以及时检测未经授权的访问。
* **安全配置超级用户**：限制超级用户角色，只用于必要的操作。