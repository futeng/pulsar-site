---
id: functions-worker-run-separately
title: 单独运行函数工作器
sidebar_label: "单独运行函数工作器"
description: 单独运行 Pulsar 函数工作器。
---

下图说明了函数工作器如何在单独的机器中作为单独进程运行。

![Pulsar 中函数工作器单独运行](/assets/function-workers-separated.svg)

:::note

插图中的 `Service URLs` 代表 Pulsar 客户端和 Pulsar 管理员用于连接到 Pulsar 集群的 Pulsar 服务 URL。

:::

要设置单独运行的函数工作器，请完成以下步骤：

## 步骤 1：配置函数工作器单独运行

:::note

要单独运行函数工作器，您需要在 `conf/broker.conf` 文件中保持 `functionsWorkerEnabled` 为其默认值（`false`）。

:::

### 配置工作器参数

在 `conf/functions_worker.yml` 文件中配置工作器的必需参数。
- `workerId`：工作器节点的身份，在集群中是唯一的。类型为字符串。
- `workerHostname`：工作器节点的主机名。
- `workerPort`：工作器服务器监听的端口。如果您不自定义，请保持默认值。设置为 `null` 以禁用明文端口。
- `workerPortTls`：工作器服务器监听的 TLS 端口。如果您不自定义，请保持默认值。有关 TLS 加密设置的更多信息，请参阅[设置](#启用-tls-加密)。

:::note

当访问函数工作器来管理函数时，`pulsar-admin` CLI 或任何客户端应该使用配置的 `workerHostname` 和 `workerPort` 来生成 `--admin-url`。

:::

### 配置函数包参数

在 `conf/functions_worker.yml` 文件中配置 `numFunctionPackageReplicas` 参数。它表示存储函数包的副本数量。

:::note

为了确保生产部署中的高可用性，将 `numFunctionPackageReplicas` 设置为等于 bookie 的数量。默认值 `1` 仅适用于单节点集群部署。

:::

### 配置函数元数据参数

在 `conf/functions_worker.yml` 文件中配置函数元数据的必需参数。
- `pulsarServiceUrl`：您的 broker 集群的 Pulsar 服务 URL。
- `pulsarWebServiceUrl`：您的 broker 集群的 Pulsar web 服务 URL。
- `pulsarFunctionsCluster`：将值设置为您的 Pulsar 集群名称（与 `conf/broker.conf` 文件中的 `clusterName` 设置相同）。

如果在您的 broker 集群上启用了身份验证，您必须配置以下身份验证设置，以便函数工作器与 broker 通信。
- `brokerClientAuthenticationEnabled`：是否启用函数工作器用于与 broker 通信的 broker 客户端身份验证。
- `clientAuthenticationPlugin`：工作器服务中使用的 Pulsar 客户端要使用的身份验证插件。
- `clientAuthenticationParameters`：工作器服务中使用的 Pulsar 客户端要使用的身份验证参数。

### 启用安全设置

当您在配置了身份验证的集群中单独运行函数工作器时，您的函数工作器需要与 broker 通信并对传入请求进行身份验证。因此，您需要配置 broker 进行身份验证和授权所需的属性。

:::note

您必须配置函数工作器身份验证和授权，以便服务器对传入请求进行身份验证，并配置客户端以进行身份验证以与 broker 通信。

:::

例如，如果您使用令牌身份验证，您需要在 `conf/function-worker.yml` 文件中配置以下属性。

```yaml
brokerClientAuthenticationPlugin: org.apache.pulsar.client.impl.auth.AuthenticationToken
brokerClientAuthenticationParameters: file:///etc/pulsar/token/admin-token.txt
configurationMetadataStoreUrl: zk:zookeeper-cluster:2181 # 身份验证需要连接到 zookeeper
authenticationProviders:
 - "org.apache.pulsar.broker.authentication.AuthenticationProviderToken"
authorizationEnabled: true
authenticationEnabled: true
superUserRoles:
  - superuser
  - proxy
properties:
  tokenSecretKey: file:///etc/pulsar/jwt/secret # 如果使用秘密令牌，密钥文件必须是 DER 编码的
  tokenPublicKey: file:///etc/pulsar/jwt/public.key # 如果使用公/私钥令牌，密钥文件必须是 DER 编码的
```

您可以在函数工作器上启用以下安全设置。
- [启用 TLS 加密](#启用-tls-加密)
- [启用身份验证提供程序](#启用身份验证提供程序)
- [启用授权提供程序](#启用授权提供程序)
- [启用端到端加密](functions-deploy-cluster-encryption.md)


#### 启用 TLS 加密

要启用 TLS 加密，配置以下设置。

```yaml
useTLS: true
pulsarServiceUrl: pulsar+ssl://localhost:6651/
pulsarWebServiceUrl: https://localhost:8443

tlsEnabled: true
tlsCertificateFilePath: /path/to/functions-worker.cert.pem
tlsKeyFilePath:         /path/to/functions-worker.key-pk8.pem
tlsTrustCertsFilePath:  /path/to/ca.cert.pem

// Pulsar 客户端用于与 Pulsar broker 进行身份验证的受信任证书路径
brokerClientTrustCertsFilePath: /path/to/ca.cert.pem
```

有关 TLS 加密的更多详情，请参阅[使用 TLS 的传输加密](security-tls-transport.md)。


#### 启用身份验证提供程序

要在函数工作器上启用身份验证提供程序，请将 `authenticationProviders` 参数替换为您要启用的提供程序。

```properties
authenticationEnabled: true
authenticationProviders: [provider1, provider2]
```

对于 [mTLS 身份验证](security-tls-authentication.md)提供程序，按照以下示例添加必需的设置。

```properties
brokerClientAuthenticationPlugin: org.apache.pulsar.client.impl.auth.AuthenticationTls
brokerClientAuthenticationParameters: tlsCertFile:/path/to/admin.cert.pem,tlsKeyFile:/path/to/admin.key-pk8.pem

authenticationEnabled: true
authenticationProviders: ['org.apache.pulsar.broker.authentication.AuthenticationProviderTls']
```

对于 SASL 身份验证提供程序，在 `properties` 下添加 `saslJaasClientAllowedIds` 和 `saslJaasServerSectionName`。

```properties
properties:
  saslJaasClientAllowedIds: .*pulsar.*
  saslJaasServerSectionName: Broker
```

对于[令牌身份验证](security-jwt.md)提供程序，在 `properties` 下添加必需的设置。

```properties
properties:
  tokenSecretKey:       file://my/secret.key
  # 如果使用公/私钥
  # tokenPublicKey:     file://path/to/public.key
```

:::note

密钥文件必须是 DER（区别编码规则）编码的。

:::

#### 启用授权提供程序

要在函数工作器上启用授权，请完成以下步骤。

1. 在 `functions_worker.yml` 文件中配置 `authorizationEnabled`、`authorizationProvider` 和 `configurationMetadataStoreUrl`。身份验证提供程序连接到 `configurationMetadataStoreUrl` 以接收命名空间策略。

   ```yaml
   authorizationEnabled: true
   authorizationProvider: org.apache.pulsar.broker.authorization.PulsarAuthorizationProvider
   configurationMetadataStoreUrl: <meta-type>:<configuration-metadata-store-url>
   ```

2. 配置超级用户角色列表。超级用户角色可以访问任何管理 API。以下配置是一个示例。

   ```yaml
   superUserRoles:
     - role1
     - role2
     - role3
   ```

### 配置 BookKeeper 身份验证

如果在 BookKeeper 集群上启用了身份验证，您需要为函数工作器配置以下 BookKeeper 身份验证设置。
- `bookkeeperClientAuthenticationPlugin`：BookKeeper 客户端的身份验证插件名称。
- `bookkeeperClientAuthenticationParametersName`：BookKeeper 客户端的身份验证插件参数，包括名称和值。
- `bookkeeperClientAuthenticationParameters`：BookKeeper 客户端的身份验证插件参数。

## 步骤 2：启动函数工作器

:::note

在启动函数工作器之前，确保已配置[函数运行时](functions-runtime.md)。

:::

* 您可以使用 [`pulsar-daemon`](reference-cli-tools.md) CLI 工具在后台启动函数工作器：

  ```bash
  bin/pulsar-daemon start functions-worker
  ```

* 要在前台启动函数工作器，您可以按如下方式使用 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) CLI。

  ```bash
  bin/pulsar functions-worker
  ```

## 步骤 3：为独立函数工作器配置代理

当您在单独的集群中运行函数工作器时，管理 rest 端点被拆分为两个集群，如下图所示。`functions`、`function-worker`、`source` 和 `sink` 端点现在由工作器集群提供服务，而所有其他剩余端点由 broker 集群提供服务。这要求您在 `pulsar-admin` CLI 中相应地使用正确的服务 URL。为了解决这种不便，您可以启动一个代理集群，作为管理服务的中央入口点，用于路由管理 rest 请求。

![assets/functions-worker-separated-proxy.svg](/assets/function-workers-separated-with-proxy.svg)

:::tip

如果您还没有设置代理集群，请按照[说明](administration-proxy.md)部署一个。

:::

要启用代理以将与管理函数相关的管理请求路由到函数工作器，您可以编辑 `conf/proxy.conf` 文件来修改以下设置：

```conf
functionWorkerWebServiceURL=<pulsar-functions-worker-web-service-url>
functionWorkerWebServiceURLTLS=<pulsar-functions-worker-web-service-url>
```