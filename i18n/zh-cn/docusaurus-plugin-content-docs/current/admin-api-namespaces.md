---
id: admin-api-namespaces
title: 管理命名空间
sidebar_label: "命名空间"
description: 学习如何使用 Pulsar CLI 和管理 API 管理命名空间。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````


:::tip

 本页面仅显示**一些常用操作**。

 - 有关 `Pulsar admin` 的最新和完整信息，包括命令、标志、描述和更多信息，请参阅 [Pulsar admin 文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

 - 有关 `REST API` 的最新和完整信息，包括参数、响应、示例和更多信息，请参阅 {@inject: rest:REST:/} API 文档。

 - 有关 `Java 管理 API` 的最新和完整信息，包括类、方法、描述和更多信息，请参阅 [Java 管理 API 文档](/api/admin/)。

:::

Pulsar [命名空间](reference-terminology.md#namespace)是[主题](reference-terminology.md#topic)的逻辑分组。

命名空间可以通过以下方式进行管理：

* [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) 工具的 `namespaces` 命令
* 管理 {@inject: rest:REST:/} API 的 `/admin/v2/namespaces` 端点
* [Java API](client-libraries-java.md) 中 `PulsarAdmin` 对象的 `namespaces` 方法

## 命名空间资源

### 创建命名空间

您可以在给定的[租户](reference-terminology.md#tenant)下创建新的命名空间。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`create`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=create) 子命令并按名称指定命名空间：

```shell
pulsar-admin namespaces create test-tenant/test-namespace
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_createNamespace)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().createNamespace(namespace);
```

</TabItem>

</Tabs>
````

### 获取策略

您可以随时获取与命名空间关联的当前策略。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`policies`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=policies) 子命令并指定命名空间：

```shell
pulsar-admin namespaces policies test-tenant/test-namespace
```

示例输出：

```json
{
  "auth_policies": {
    "namespace_auth": {},
    "destination_auth": {}
  },
  "replication_clusters": [],
  "bundles_activated": true,
  "bundles": {
    "boundaries": [
      "0x00000000",
      "0xffffffff"
    ],
    "numBundles": 1
  },
  "backlog_quota_map": {},
  "persistence": null,
  "latency_stats_sample_rate": {},
  "message_ttl_in_seconds": 0,
  "retention_policies": null,
  "deleted": false
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getPolicies)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getPolicies(namespace);
```

</TabItem>

</Tabs>
````

### 列出命名空间

您可以列出给定 Pulsar [租户](reference-terminology.md#tenant)中的所有命名空间。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`list`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=list) 子命令并指定租户：

```shell
pulsar-admin namespaces list test-tenant
```

示例输出：

```
test-tenant/namespace1
test-tenant/namespace2
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getTenantNamespaces)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getNamespaces(tenant);
```

</TabItem>

</Tabs>
````

### 删除命名空间

您可以从租户中删除现有的命名空间。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`delete`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=delete) 子命令并指定命名空间：

```shell
pulsar-admin namespaces delete test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_deleteNamespace)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().deleteNamespace(namespace);
```

</TabItem>

</Tabs>
````

### 配置复制集群

#### 设置复制集群

您可以为命名空间设置复制集群，使 Pulsar 能够内部地将发布的消息从一个共址设施复制到另一个。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-clusters test-tenant/namespace1 --clusters cl1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setNamespaceReplicationClusters)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setNamespaceReplicationClusters(namespace, clusters);
```

</TabItem>

</Tabs>
````

#### 获取复制集群

您可以获取给定命名空间的复制集群列表。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-clusters test-tenant/cluster1/namespace1
```

示例输出：

```
cluster2
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getNamespaceReplicationClusters)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getNamespaceReplicationClusters(namespace)
```

</TabItem>

</Tabs>
````

### 配置积压配额策略

#### 设置积压配额策略

积压配额帮助 Broker 在命名空间达到一定阈值限制时限制带宽/存储。管理员可以设置限制并在达到限制后采取相应的操作。

  1.  producer_request_hold：生产者保存消息并重试，直到超过客户端配置的 `sendTimeoutMs`

  2.  producer_exception：生产者在尝试发送消息时抛出异常

  3.  consumer_backlog_eviction：Broker 开始丢弃积压消息

积压配额限制可以通过定义积压配额类型的限制来处理：destination_storage。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-backlog-quota --limit 10G \
    --limitTime 36000 \
    --policy producer_request_hold \
    test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setBacklogQuota)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setBacklogQuota(namespace, new BacklogQuota(limit, limitTime, policy))
```

</TabItem>

</Tabs>
````

#### 获取积压配额策略

您可以获取给定命名空间的已配置积压配额。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-backlog-quotas test-tenant/namespace1
```

示例输出：

```
destination_storage    BacklogQuotaImpl(limit=10737418240, limitSize=10737418240, limitTime=36000, policy=producer_request_hold)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getBacklogQuotaMap)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getBacklogQuotaMap(namespace);
```

</TabItem>

</Tabs>
````

#### 移除积压配额策略

您可以移除给定命名空间的积压配额策略。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces remove-backlog-quota test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_removeBacklogQuota)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().removeBacklogQuota(namespace, backlogQuotaType)
```

</TabItem>

</Tabs>
````

### 配置持久化策略

#### 设置持久化策略

持久化策略允许用户为给定命名空间下的所有主题消息配置持久化级别。

  -   Bookkeeper-ack-quorum：每个条目要等待的确认数量（保证副本数），默认：2

  -   Bookkeeper-ensemble：用于主题的 bookie 数量，默认：2

  -   Bookkeeper-write-quorum：每个条目的写入次数，默认：2

  -   Ml-mark-delete-max-rate：标记删除操作的限流速率（0 表示不限流），默认：0

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-persistence \
    --bookkeeper-ack-quorum 2 --bookkeeper-ensemble 3 \
    --bookkeeper-write-quorum 2 --ml-mark-delete-max-rate 0 \
    test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setPersistence)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setPersistence(namespace,new PersistencePolicies(bookkeeperEnsemble, bookkeeperWriteQuorum,bookkeeperAckQuorum,managedLedgerMaxMarkDeleteRate))
```

</TabItem>

</Tabs>
````

#### 获取持久化策略

您可以获取给定命名空间的已配置持久化策略。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-persistence test-tenant/namespace1
```

示例输出：

```json
{
  "bookkeeperEnsemble": 3,
  "bookkeeperWriteQuorum": 2,
  "bookkeeperAckQuorum": 2,
  "managedLedgerMaxMarkDeleteRate": 0
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getPersistence)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getPersistence(namespace)
```

</TabItem>

</Tabs>
````

### 配置命名空间分片

#### 卸载命名空间分片

命名空间分片是属于同一命名空间的主题的虚拟组。如果 Broker 因分片数量而超载，此命令可以帮助从该 Broker 卸载分片，以便其他负载较低的 Broker 可以为其提供服务。命名空间分片 ID 的范围从 0x00000000 到 0xffffffff。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces unload --bundle 0x00000000_0xffffffff test-tenant/namespace1
pulsar-admin namespaces unload --bundle 0x00000000_0xffffffff test-tenant/namespace1
pulsar-admin namespaces unload --bundle 0x00000000_0xffffffff --destinationBroker broker1.use.org.com:8080 test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_unloadNamespaceBundle)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().unloadNamespaceBundle(namespace, bundle)
```

</TabItem>

</Tabs>
````

#### 拆分命名空间分片

一个命名空间分片可以包含多个主题，但只能由一个 Broker 提供服务。如果单个分片在 Broker 上造成过大的负载，管理员可以使用以下命令拆分分片，允许卸载一个或多个新分片，从而在 Broker 之间平衡负载。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces split-bundle --bundle 0x00000000_0xffffffff test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_splitNamespaceBundle)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().splitNamespaceBundle(namespace, bundle, unloadSplitBundles, splitAlgorithmName)
```

</TabItem>

</Tabs>
````

### 配置消息 TTL

#### 设置消息-ttl

您可以配置消息的生存时间（以秒为单位）持续时间。在下面的示例中，message-ttl 设置为 100s。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-message-ttl --messageTTL 100 test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setNamespaceMessageTTL)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setNamespaceMessageTTL(namespace, messageTTL)
```

</TabItem>


</Tabs>
````

#### 获取消息-ttl

当为命名空间设置了 message-ttl 时，您可以使用以下命令获取配置的值。此示例继续命令 `set message-ttl` 的示例，因此返回值为 100(s)。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-message-ttl test-tenant/namespace1
```
示例输出：

```
100
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getNamespaceMessageTTL)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getNamespaceMessageTTL(namespace)
```

```
100
```

</TabItem>

</Tabs>
````

#### 移除消息-ttl

移除配置命名空间的消息 TTL。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces remove-message-ttl test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_removeNamespaceMessageTTL)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().removeNamespaceMessageTTL(namespace)
```

</TabItem>

</Tabs>
````


### 清除积压

#### 清除命名空间积压

它清除属于特定命名空间的所有主题的所有消息积压。您也可以清除特定订阅的积压。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces clear-backlog --sub my-subscription test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_clearNamespaceBacklogForSubscription)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().clearNamespaceBacklogForSubscription(namespace, subscription)
```

</TabItem>

</Tabs>
````

#### 清除分片积压

它清除属于特定 NamespaceBundle 的所有主题的所有消息积压。您也可以清除特定订阅的积压。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces clear-backlog \
    --bundle 0x00000000_0xffffffff \
    --sub my-subscription \
    test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_clearNamespaceBundleBacklogForSubscription)

</TabItem>
<TabItem value="Java">

```java

admin.namespaces().clearNamespaceBundleBacklogForSubscription(namespace, bundle, subscription)

```

</TabItem>

</Tabs>
````

### 配置保留

#### 设置保留

每个命名空间包含多个主题，每个主题的保留大小（存储大小）不应超过特定阈值或应存储一定时间。此命令帮助配置给定命名空间中主题的保留大小和时间。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-retention --size 100M --time 10m test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setRetention)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setRetention(namespace, new RetentionPolicies(retentionTimeInMin, retentionSizeInMB))
```

</TabItem>

</Tabs>
````

#### 获取保留

它显示给定命名空间的保留信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-retention test-tenant/namespace1
```

```json
{
  "retentionTimeInMinutes": 10,
  "retentionSizeInMB": 100
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getRetention)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getRetention(namespace)
```

</TabItem>

</Tabs>
````

### 配置主题的调度限流

#### 设置主题的调度限流

它为给定命名空间下的所有主题设置消息调度速率。调度速率可以通过每 X 秒的消息数（`msg-dispatch-rate`）或每 X 秒的消息字节数（`byte-dispatch-rate`）来限制。调度速率以秒为单位，可以使用 `dispatch-rate-period` 配置。`msg-dispatch-rate` 和 `byte-dispatch-rate` 的默认值为 -1，这会禁用限流。

:::note

- 如果既没有配置 `clusterDispatchRate` 也没有配置 `topicDispatchRate`，则禁用调度限流。
- 如果没有配置 `topicDispatchRate`，则 `clusterDispatchRate` 生效。
- 如果配置了 `topicDispatchRate`，则 `topicDispatchRate` 生效。

:::

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-dispatch-rate test-tenant/namespace1 \
    --msg-dispatch-rate 1000 \
    --byte-dispatch-rate 1048576 \
    --dispatch-rate-period 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setDispatchRate)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setDispatchRate(namespace, new DispatchRate(1000, 1048576, 1))
```

</TabItem>

</Tabs>
````

#### 获取主题的已配置消息速率

它显示命名空间的已配置消息速率（此命名空间下的主题每秒可以调度这么多消息）

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-dispatch-rate test-tenant/namespace1
```

示例输出：

```json
{
  "dispatchThrottlingRateInMsg" : 1000,
  "dispatchThrottlingRateInByte" : 1048576,
  "relativeToPublishRate" : false,
  "ratePeriodInSecond" : 1
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getDispatchRate)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getDispatchRate(namespace)
```

</TabItem>

</Tabs>
````

### 配置订阅的调度限流

#### 设置订阅的调度限流

它为给定命名空间下主题的所有订阅设置消息调度速率。调度速率可以通过每 X 秒的消息数（`msg-dispatch-rate`）或每 X 秒的消息字节数（`byte-dispatch-rate`）来限制。调度速率以秒为单位，可以使用 `dispatch-rate-period` 配置。`msg-dispatch-rate` 和 `byte-dispatch-rate` 的默认值为 -1，这会禁用限流。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-subscription-dispatch-rate test-tenant/namespace1 \
    --msg-dispatch-rate 1000 \
    --byte-dispatch-rate 1048576 \
    --dispatch-rate-period 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setSubscriptionDispatchRate)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setSubscriptionDispatchRate(namespace, new DispatchRate(1000, 1048576, 1))
```

</TabItem>

</Tabs>
````

#### 获取订阅的已配置消息速率

它显示命名空间的已配置消息速率（此命名空间下的主题每秒可以调度这么多消息）。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-subscription-dispatch-rate test-tenant/namespace1
```

示例输出：

```json
{
  "dispatchThrottlingRateInMsg" : 1000,
  "dispatchThrottlingRateInByte" : 1048576,
  "relativeToPublishRate" : false,
  "ratePeriodInSecond" : 1
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getSubscriptionDispatchRate)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getSubscriptionDispatchRate(namespace)
```

</TabItem>

</Tabs>
````

### 配置复制器的调度限流

#### 设置复制器的调度限流

它为给定命名空间下复制集群之间的所有复制器设置消息调度速率。调度速率可以通过每 X 秒的消息数（`msg-dispatch-rate`）或每 X 秒的消息字节数（`byte-dispatch-rate`）来限制。调度速率以秒为单位，可以使用 `dispatch-rate-period` 配置。`msg-dispatch-rate` 和 `byte-dispatch-rate` 的默认值为 -1，这会禁用限流。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-replicator-dispatch-rate test-tenant/namespace1 \
    --msg-dispatch-rate 1000 \
    --byte-dispatch-rate 1048576 \
    --dispatch-rate-period 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setDispatchRate)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setReplicatorDispatchRate(namespace, new DispatchRate(1000, 1048576, 1))
```

</TabItem>

</Tabs>
````

#### 获取复制器的已配置消息速率

它显示命名空间的已配置消息速率（此命名空间下的主题每秒可以调度这么多消息）

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-replicator-dispatch-rate test-tenant/namespace1
```

```json
{
  "dispatchThrottlingRatePerTopicInMsg" : 1000,
  "dispatchThrottlingRatePerTopicInByte" : 1048576,
  "ratePeriodInSecond" : 1
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getDispatchRate)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getReplicatorDispatchRate(namespace)
```

</TabItem>

</Tabs>
````

### 配置去重快照间隔

#### 获取去重快照间隔

它显示命名空间的已配置 `deduplicationSnapshotInterval`（命名空间下的每个主题将根据此间隔进行去重快照）

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-deduplication-snapshot-interval test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getDeduplicationSnapshotInterval)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getDeduplicationSnapshotInterval(namespace)
```

</TabItem>

</Tabs>
````

#### 设置去重快照间隔

为命名空间设置已配置的 `deduplicationSnapshotInterval`。命名空间下的每个主题将根据此间隔进行去重快照。`brokerDeduplicationEnabled` 必须设置为 `true` 才能使此属性生效。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces set-deduplication-snapshot-interval test-tenant/namespace1 --interval 1000
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setDeduplicationSnapshotInterval)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setDeduplicationSnapshotInterval(namespace, 1000)
```

</TabItem>

</Tabs>
````

#### 移除去重快照间隔

移除命名空间的已配置 `deduplicationSnapshotInterval`（命名空间下的每个主题将根据此间隔进行去重快照）。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces remove-deduplication-snapshot-interval test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setDeduplicationSnapshotInterval)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().removeDeduplicationSnapshotInterval(namespace)
```

</TabItem>

</Tabs>
````

### 命名空间隔离

您可以使用 [Pulsar 隔离策略](administration-isolation.md)为命名空间分配资源（broker 和 bookie）。

### 从 Broker 卸载命名空间

您可以从当前负责它的 Pulsar [broker](reference-terminology.md#broker)中卸载命名空间或[命名空间分片](reference-terminology.md#namespace-bundle)。

#### pulsar-admin

使用 [`namespaces`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces) 命令的 [`unload`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/namespaces?id=unload) 子命令。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces unload my-tenant/my-ns
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_unloadNamespace)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().unload(namespace)
```

</TabItem>

</Tabs>
````
### 配置条目过滤器策略

#### 设置条目过滤器策略

条目过滤器有助于在服务器端过滤消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```
pulsar-admin namespaces set-entry-filters \
    --desc "用于用户帮助的条目过滤器的描述。" \
    --entry-filters-name "条目过滤器的类名。" \
    --entry-filters-dir "所有条目过滤器实现的目录。" \
    test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_setEntryFiltersPerTopic)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().setEntryFilters(namespace, new EntryFilters("desc", "classes name", "class files localtion"))
```

</TabItem>

</Tabs>
````

#### 获取条目过滤器策略

您可以获取给定命名空间的已配置条目过滤器。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces get-entry-filters test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_getEntryFiltersPerTopic)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().getEntryFilters(namespace);
```

</TabItem>

</Tabs>
````

#### 移除条目过滤器策略

您可以移除给定命名空间的条目过滤器策略。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin namespaces remove-entry-filters test-tenant/namespace1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/Namespaces_removeNamespaceEntryFilters)

</TabItem>
<TabItem value="Java">

```java
admin.namespaces().removeEntryFilters(namespace)
```

</TabItem>

</Tabs>
````