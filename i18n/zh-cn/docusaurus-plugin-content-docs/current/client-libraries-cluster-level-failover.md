---
id: client-libraries-cluster-level-failover
title: 配置集群级故障转移
sidebar_label: "配置集群级故障转移"
description: 学习如何在 Pulsar 中配置集群级故障转移。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

有关集群级故障转移的更多信息，包括概念、优势、使用场景、约束、用法和工作原理，请参阅 [集群级故障转移概念](concepts-cluster-level-failover.md)。

:::tip

- 只有当集群包含足够的资源来处理所有可能的后果时，您才应该配置集群级故障转移。备份集群上的工作负载强度可能会显著增加。

- 将集群连接到不间断电源（UPS）单元以减少意外断电的风险。

:::

## 前提条件

* Pulsar Java 客户端 2.10 或更高版本。
* 对于备份集群：
  * BookKeeper 节点的数量应大于或等于副本集法定人数。
  * ZooKeeper 节点的数量应大于或等于 3。
* 在主集群和任何依赖集群（主到备份或备份到备份）之间**开启地理复制**以防止数据丢失。
* [启用复制订阅](administration-geo.md#enable-replicated-subscription)。

## 配置集群级故障转移

### 自动故障转移

这是一个如何构建 Java Pulsar 客户端以使用自动集群级故障转移的示例。切换会自动触发。

```java
private PulsarClient getAutoFailoverClient() throws PulsarClientException {
    String primaryUrl = "pulsar+ssl://localhost:6651";
    String secondaryUrl = "pulsar+ssl://localhost:6661";
    String primaryTlsTrustCertsFilePath = "primary/path";
    String secondaryTlsTrustCertsFilePath = "secondary/path";
    Authentication primaryAuthentication = AuthenticationFactory.create(
        "org.apache.pulsar.client.impl.auth.AuthenticationTls",
        "tlsCertFile:/path/to/primary-my-role.cert.pem,"
                + "tlsKeyFile:/path/to/primary-role.key-pk8.pem");
    Authentication secondaryAuthentication = AuthenticationFactory.create(
        "org.apache.pulsar.client.impl.auth.AuthenticationTls",
        "tlsCertFile:/path/to/secondary-my-role.cert.pem,"
                + "tlsKeyFile:/path/to/secondary-role.key-pk8.pem");

    // 您可以将更多的故障转移集群配置放入映射中
    Map<String, String> secondaryTlsTrustCertsFilePaths = new HashMap<>();
    secondaryTlsTrustCertsFilePaths.put(secondaryUrl, secondaryTlsTrustCertsFilePath);
    Map<String, Authentication> secondaryAuthentications = new HashMap<>();
    secondaryAuthentications.put(secondaryUrl, secondaryAuthentication);
    ServiceUrlProvider failover = AutoClusterFailover.builder()
        .primary(primaryUrl)
        .secondary(List.of(secondaryUrl))
        .failoverDelay(30, TimeUnit.SECONDS)
        .switchBackDelay(60, TimeUnit.SECONDS)
        .checkInterval(1000, TimeUnit.MILLISECONDS)
        .secondaryTlsTrustCertsFilePath(secondaryTlsTrustCertsFilePaths)
        .secondaryAuthentication(secondaryAuthentications)
        .build();

    PulsarClient pulsarClient = PulsarClient.builder()
        .serviceUrlProvider(failover)
        .authentication(primaryAuthentication)
        .tlsTrustCertsFilePath(primaryTlsTrustCertsFilePath)
        .build();

    return pulsarClient;
}
```

配置以下参数：

参数|默认值|是否必需|描述
|---|---|---|---
`primary`|不适用|是|主集群的服务 URL。
`secondary`|不适用|是|一个或多个备份集群的服务 URL。<br /><br />您可以使用逗号分隔的列表指定多个备份集群。<br /><br />请注意：<br />- 备份集群按照列表中显示的顺序选择。 <br />- 如果所有备份集群都可用，Pulsar 客户端选择第一个备份集群。
`failoverDelay`|不适用|是|Pulsar 客户端从主集群切换到备份集群之前的延迟。<br /><br />自动故障转移由探测任务控制：<br />1) 探测任务首先检查主集群的健康状态。<br />2) 如果探测任务发现主集群的连续故障时间超过 `failoverDelayMs`，它会将 Pulsar 客户端切换到备份集群。
`switchBackDelay`|不适用|是|Pulsar 客户端从备份集群切换回主集群之前的延迟。<br /><br />自动故障转移切换由探测任务控制：<br />1) Pulsar 客户端从主集群切换到备份集群后，探测任务继续检查主集群的状态。<br />2) 如果主集群功能正常且连续保持活动状态的时间超过 `switchBackDelay`，Pulsar 客户端会切换回主集群。
`checkInterval`|30 秒|否|执行探测任务的频率（以秒为单位）。
`secondaryTlsTrustCertsFilePath`|不适用|否|备份集群的受信任 TLS 证书文件的路径。
`secondaryAuthentication`|不适用|否|备份集群的认证。

### 受控故障转移

这是一个如何构建 Java Pulsar 客户端以使用受控集群级故障转移的示例。切换由管理员手动触发。

:::note
您可以有一个或多个备份集群，但只能指定一个。
:::

```java
public PulsarClient getControlledFailoverClient() throws IOException {
    Map<String, String> header = new HashMap();
    header.put("service_user_id", "my-user");
    header.put("service_password", "tiger");
    header.put("clusterA", "tokenA");
    header.put("clusterB", "tokenB");

    ServiceUrlProvider provider =
            ControlledClusterFailover.builder()
                    .defaultServiceUrl("pulsar://localhost:6650")
                    .checkInterval(1, TimeUnit.MINUTES)
                    .urlProvider("http://localhost:8080/test")
                    .urlProviderHeader(header)
                    .build();

    PulsarClient pulsarClient =
            PulsarClient.builder()
                    .serviceUrlProvider(provider)
                    .build();

    return pulsarClient;
}
```

参数|默认值|是否必需|描述
|---|---|---|---
`defaultServiceUrl`|不适用|是|Pulsar 服务 URL。
`checkInterval`|30 秒|否|执行探测任务的频率（以秒为单位）。
`urlProvider`|不适用|是|URL 提供者服务。
`urlProviderHeader`|不适用|否|`urlProviderHeader` 是包含令牌和凭据的映射。<br /><br />如果您在 Pulsar 客户端与主集群和备份集群之间启用认证或授权，则需要提供 `urlProviderHeader`。

以下是 `urlProviderHeader` 如何工作的示例。

![Pulsar 中 urlProviderHeader 的工作流程](/assets/cluster-level-failover-3.png)

假设您想要将 Pulsar 客户端 1 连接到集群 A。

1. Pulsar 客户端 1 将令牌 *t1* 发送到 URL 提供者服务。

2. URL 提供者服务向 Pulsar 客户端返回凭据 *c1* 和集群 A URL。

   URL 提供者服务管理所有令牌和凭据。它根据不同的令牌和不同的目标集群 URL 向不同的 Pulsar 客户端返回不同的凭据。

   :::note

   凭据必须是 JSON 文件，并包含如所示的参数。

   :::

   ```java
   {
   "serviceUrl": "pulsar+ssl://target:6651",
   "tlsTrustCertsFilePath": "/security/ca.cert.pem",
   "authPluginClassName":"org.apache.pulsar.client.impl.auth.AuthenticationTls",
   "authParamsString": " \"tlsCertFile\": \"/security/client.cert.pem\"
       \"tlsKeyFile\": \"/security/client-pk8.pem\" "
   }
   ```

3. Pulsar 客户端 1 使用凭据 *c1* 连接到集群 A。
