---
id: admin-api-brokers
title: 管理 Broker
sidebar_label: "Broker"
description: 学习如何使用 Pulsar CLI 和管理 API 管理 Broker。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

:::tip

本页面仅显示**一些常用操作**。有关最新和完整的信息，请参阅下面的**参考文档**。

:::

| 类别 | 方法 | 如果您想管理 Broker... |
|------|------|-------------------|
| [Pulsar CLI](reference-cli-tools.md) | [pulsar-admin](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)，其中列出了所有命令、标志、描述等。 | 查看 `broker` 命令 |
| [Pulsar 管理 API](admin-api-overview.md) | <!-- Swagger API 参考：/admin/v2/ -->{@inject: rest:REST API:/}，其中列出了所有参数、响应、示例等。 | 查看 `/admin/v2/brokers` 端点 |
| [Pulsar 管理 API](admin-api-overview.md) | [Java 管理 API](/api/admin/)，其中列出了所有类、方法、描述等。 | 查看 `PulsarAdmin` 对象的 `brokers` 方法 |

## 列出活跃的 Broker

获取所有正在提供流量的可用活跃 Broker 及其集群名称。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`list`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=list) 子命令。

```shell
pulsar-admin brokers list use
```

输出：

```
```
broker1.use.org.com:8080
broker2.use.org.com:8080
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getActiveBrokers)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getActiveBrokers(clusterName);
```

</TabItem>

</Tabs>
````

## 获取所有命名空间

获取特定 Broker 提供服务的所有命名空间。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`namespaces`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=namespaces) 子命令。

```shell
pulsar-admin brokers namespaces use \
    --broker-host broker1.use.org.com
```

输出：

```
```
my-tenant/my-ns1
my-tenant/my-ns2
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getNamespaces)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getOwnedNamespaces(clusterName, brokerUrl);
```

</TabItem>

</Tabs>
````

## 获取所有动态配置

获取特定 Broker 的所有动态配置值。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get-all-dynamic-config`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=get-all-dynamic-config) 子命令。

```shell
pulsar-admin brokers get-all-dynamic-config \
    --broker-host broker1.use.org.com
```

输出：

```
{
  "brokerShutdownTimeoutMinutes": 3,
  " backlogQuotaCheckEnabled": "true",
  "loadBalancerAutoBundleSplitEnabled": "true",
  "loadBalancerAutoTuneServerEnabled": "true",
  "loadBalancerNamespaceBundleToBrokerRatioMax": "50",
  "loadBalancerBrokerComfortLoadLevel": "0.8",
  "loadBalancerBrokerMaxThroughput": "50000",
  "loadBalancerBrokerWarmupSeconds": "120",
  "loadBalancerHostUsageCheckIntervalMinutes": "1",
  "loadBalancerLeastResourceDistribution": "true",
  "loadBalancerMaxShufflePerMinute": "30",
  "loadBalancerModularLoadManagerStrategy": "least_long_term_message_rate",
  "loadBalancerNamespaceBundleToBrokerRatioMin": "1",
  "loadBalancerNamespaceToBrokerRatioMax": "2",
  "loadBalancerNamespaceToBrokerRatioMin": "1",
  "loadBalancerReportUpdateThresholdSeconds": "120",
  "loadBalancerReportUpdateMaxBatchSize": "500",
  "loadBalancerResourceQuotaUpdateIntervalMinutes": "15",
  "loadAllocatorModularRankingStrategy": "bandwidth_usage",
  "loadBalancerSchedulingStrategy": "weight_random",
  "loadBalancerTestBrokerOverrideHotspotCleanup": "false",
  "loadBalancerUpdateBrokerAssignmentIntervalMinutes": "15",
  "loadBalancerUpdatePoliciesIntervalMinutes": "15",
  "loadBalancerUpdatePoliciesMaxBatchSize": "100",
  "replicatedPoliciesDefaultNamespace replication_factor": "2",
  "replicatedPoliciesGlobal replication_enabled": "false",
  "replicatedPolicies_sys_pulsar replication_factor": "2",
  "replicatedPolicies_sys_pulsar_manager replication_factor": "2",
  "replicatedPolicies_public replication_factor": "2",
  "replicatedPolicies_public/default replication_factor": "1",
  "replicatedPolicies_pulsar replication_factor": "2",
  "replicatedPolicies_pulsar/system replication_factor": "2",
  "replicatedPolicies_pulsar/standalone replication_factor": "1",
  "replicatedPolicies_pulsar/functions replication_factor": "1",
  "replicatedPolicies_sample replication_factor": "1",
  "replicatedPolicies_sample/ns1 replication_factor": "1",
  "replicatedPolicies_sample/ns1-standalone replication_factor": "1",
  "replicatedPolicies_sample/ns1-local replication_factor": "1",
  "replicatedPolicies_sample/ns1-remote replication_factor": "2",
  "replicatedPolicies_sample/ns1-remote-standalone replication_factor": "2",
  "replicatedPolicies_test replication_factor": "1",
  "replicatedPolicies_test/ns1 replication_factor": "1",
  "replicatedPolicies_test/ns1-standalone replication_factor": "1",
  "replicatedPolicies_test/ns1-local replication_factor": "1",
  "replicatedPolicies_test/ns1-remote replication_factor": "2",
  "replicatedPolicies_test/ns1-remote-standalone replication_factor": "2"
}
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getAllDynamicConfiguration)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getAllDynamicConfigurations(clusterName, brokerName);
```

</TabItem>

</Tabs>
````

## 获取动态配置

获取特定 Broker 的特定动态配置值。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get-dynamic-config`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=get-dynamic-config) 子命令。

```shell
pulsar-admin brokers get-dynamic-config \
    --broker-host broker1.use.org.com \
    --config-name backlogQuotaCheckEnabled
```

输出：

```
```
"true"
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getDynamicConfiguration)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getDynamicConfiguration(clusterName, brokerName, configName);
```

</TabItem>

</Tabs>
````

## 更新动态配置

更新特定 Broker 的动态配置值。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`update-dynamic-config`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=update-dynamic-config) 子命令。

```shell
pulsar-admin brokers update-dynamic-config \
    --broker-host broker1.use.org.com \
    --config backlogQuotaCheckEnabled \
    --value "false"
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_updateDynamicConfiguration)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().updateDynamicConfiguration(clusterName, brokerName, configName, configValue);
```

</TabItem>

</Tabs>
````

## 获取内部配置

获取特定 Broker 的内部配置值。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get-internal-config`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=get-internal-config) 子命令。

```shell
pulsar-admin brokers get-internal-config \
    --broker-host broker1.use.org.com
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getInternalConfigurationData)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getInternalConfiguration(clusterName, brokerName);
```

</TabItem>

</Tabs>
````

## 获取健康状态

获取特定 Broker 的健康状态。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`health-check`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=health-check) 子命令。

```shell
pulsar-admin brokers health-check
```

输出：

```
{
  "status": "ok",
  "info": {
    "msg": "Everything is fine"
  }
}
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_healthCheck)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getHealthCheck(clusterName);
```

</TabItem>

</Tabs>
````

## 获取运行时统计信息

获取特定 Broker 的运行时统计信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get-runtime-stats`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=get-runtime-stats) 子命令。

```shell
pulsar-admin brokers get-runtime-stats \
    --broker-host broker1.use.org.com
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getRuntimeStats)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getRuntimeStats(clusterName, brokerName);
```

</TabItem>

</Tabs>
````

## 获取负载报告

获取特定 Broker 的负载报告。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get-load-report`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=get-load-report) 子命令。

```shell
pulsar-admin brokers get-load-report \
    --broker-host broker1.use.org.com
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getLoadReport)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getLoadReport(clusterName, brokerName);
```

</TabItem>

</Tabs>
````

## 获取版本

获取特定 Broker 的版本信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`version`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=version) 子命令。

```shell
pulsar-admin brokers version
```

输出：

```
{
  "version": "2.7.0",
  "gitSha": "a1b2c3d4e5f6g7h8i9j0",
  "buildTimestamp": "2021-01-01T12:00:00Z"
}
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_version)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getVersion(clusterName);
```

</TabItem>

</Tabs>
````

## 获取 Leader Broker

获取特定集群的 Leader Broker。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get-leader-broker`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/brokers?id=get-leader-broker) 子命令。

```shell
pulsar-admin brokers get-leader-broker
```

输出：

```
{
  "leaderBroker": "broker1.use.org.com:8080"
}
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Brokers_getLeaderBroker)

</TabItem>
<TabItem value="Java">

```java
admin.brokers().getLeaderBroker(clusterName);
```

</TabItem>

</Tabs>
````