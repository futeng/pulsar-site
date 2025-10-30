---
id: admin-api-clusters
title: 管理集群
sidebar_label: "集群"
description: 学习如何使用 Pulsar CLI 和管理 API 管理集群。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

:::tip

本页面仅显示**一些常用操作**。有关最新和完整的信息，请参阅下面的**参考文档**。

:::

类别|方法|如果您想管理集群...
|---|---|---
[Pulsar CLI](reference-cli-tools.md) |[pulsar-admin](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)，它列出所有命令、标志、描述等。| 查看 `clusters` 命令
[Pulsar 管理 API](admin-api-overview.md)| {@inject: rest:REST API:/}，它列出所有参数、响应、示例等。|查看 `/admin/v2/clusters` 端点
[Pulsar 管理 API](admin-api-overview.md)|[Java 管理 API](/api/admin/)，它列出所有类、方法、描述等。|查看 `PulsarAdmin` 对象的 `clusters` 方法

您可以对[集群](reference-terminology.md#cluster)执行以下操作。

## 配置集群

您可以使用管理接口配置新集群。

:::note

- 此操作需要超级用户权限。

- 配置新集群时，您需要[初始化集群元数据](deploy-bare-metal.md#initialize-cluster-metadata)。集群元数据只能通过 pulsar-admin CLI 初始化。无法通过 Pulsar 管理 API（REST API 和 Java 管理 API）执行。

:::

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

您可以使用 [`create`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/clusters?id=create) 子命令配置新集群。这是一个示例：

```shell
pulsar-admin clusters create cluster-1 \
    --url http://my-cluster.org.com:8080 \
    --broker-url pulsar://my-cluster.org.com:6650
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/ClustersBase_createCluster)

</TabItem>
<TabItem value="Java">

```java
ClusterData clusterData = new ClusterData(
        serviceUrl,
        serviceUrlTls,
        brokerServiceUrl,
        brokerServiceUrlTls
);
admin.clusters().createCluster(clusterName, clusterData);
```

</TabItem>

</Tabs>
````

## 获取集群配置

您可以随时获取现有集群的[配置](reference-configuration.md)。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`get`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/clusters?id=get) 子命令并指定集群名称。这是一个示例：

```shell
pulsar-admin clusters get cluster-1
```
输出：

```json
{
    "serviceUrl": "http://my-cluster.org.com:8080/",
    "serviceUrlTls": null,
    "brokerServiceUrl": "pulsar://my-cluster.org.com:6650/",
    "brokerServiceUrlTls": null,
    "peerClusterNames": null
}
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/ClustersBase_getCluster)

</TabItem>
<TabItem value="Java">

```java
admin.clusters().getCluster(clusterName);
```

</TabItem>

</Tabs>
````

## 更新集群

### 更新集群配置

您可以随时更新现有集群的配置。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`update`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/clusters?id=update) 子命令并使用标志指定新的配置值。

```shell
pulsar-admin clusters update cluster-1 \
    --url http://my-cluster.org.com:4081 \
    --broker-url pulsar://my-cluster.org.com:3350
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/ClustersBase_updateCluster)

</TabItem>
<TabItem value="Java">

```java
ClusterData clusterData = new ClusterData(
        serviceUrl,
        serviceUrlTls,
        brokerServiceUrl,
        brokerServiceUrlTls
);
admin.clusters().updateCluster(clusterName, clusterData);
```

</TabItem>

</Tabs>
````

### 更新对等集群数据

可以为 Pulsar [实例](reference-terminology.md#instance)中的给定集群配置对等集群。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`update-peer-clusters`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/clusters?id=update) 子命令并指定对等集群名称列表。

```shell
pulsar-admin update-peer-clusters cluster-1 --peer-clusters cluster-2
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/ClustersBase_setPeerClusterNames)

</TabItem>
<TabItem value="Java">

```java
admin.clusters().updatePeerClusterNames(clusterName, peerClusterList);
```

</TabItem>

</Tabs>
````

## 列出集群

您可以获取 Pulsar [实例](reference-terminology.md#instance)中所有集群的列表。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`list`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/clusters?id=list) 子命令。

```shell
pulsar-admin clusters list
```

输出：

```
cluster-1
cluster-2
```
</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/ClustersBase_getClusters)

</TabItem>
<TabItem value="Java">

```java
admin.clusters().getClusters();
```

</TabItem>

</Tabs>
````
## 删除集群

可以从 Pulsar [实例](reference-terminology.md#instance)中删除集群。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

使用 [`delete`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/clusters?id=delete) 子命令并指定集群名称。

```
pulsar-admin clusters delete cluster-1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v2/ClustersBase_deleteCluster)

</TabItem>
<TabItem value="Java">

```java
admin.clusters().deleteCluster(clusterName);
```

</TabItem>

</Tabs>
````