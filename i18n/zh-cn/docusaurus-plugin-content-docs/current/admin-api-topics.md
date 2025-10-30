---
id: admin-api-topics
title: 管理主题
sidebar_label: "主题"
description: 学习如何使用 Pulsar CLI 和管理 API 管理主题。
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

Pulsar 有持久化和非持久化主题。持久化主题是用于发布和消费消息的逻辑端点。持久化主题的名称结构是：

```shell
persistent://tenant/namespace/topic
```

非持久化主题用于只消费实时发布消息且不需要持久化保证的应用程序。通过这种方式，它通过移除持久化消息的开销来减少消息发布延迟。非持久化主题的名称结构是：

```shell
non-persistent://tenant/namespace/topic
```

:::note

主题命名：由于向后兼容性，一些特殊字符，例如 "/," 被允许作为主题名称的一部分。但建议不要在主题名称中使用特殊字符。

:::

## 管理主题资源
无论是持久化还是非持久化主题，您都可以通过 `pulsar-admin` 工具、REST API 和 Java 获取主题资源。

:::note

在 REST API 中，`:schema` 代表持久化或非持久化。`:tenant`、`:namespace`、`:x` 是变量，使用时请将它们替换为真实的租户、命名空间和 `x` 名称。
以 [](swagger:/admin/v2/PersistentTopics_getList) 为例，要在 REST API 中获取持久化主题列表，请使用 `https://pulsar.apache.org/admin/v2/persistent/my-tenant/my-namespace`。要在 REST API 中获取非持久化主题列表，请使用 `https://pulsar.apache.org/admin/v2/non-persistent/my-tenant/my-namespace`。

:::

### 主题列表

您可以通过以下方式获取给定命名空间下的主题列表。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics list my-tenant/my-namespace
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_getList)

</TabItem>
<TabItem value="Java">

```java
String namespace = "my-tenant/my-namespace";
admin.topics().getList(namespace);
```

</TabItem>

</Tabs>
````

### 授予权限

您可以通过以下方式向客户端角色授予权限以在给定主题上执行特定操作。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics grant-permission \
    --actions produce,consume \
    --role application1 \
    persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_grantPermissionsOnTopic)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
String role = "test-role";
Set<AuthAction> actions  = Sets.newHashSet(AuthAction.produce, AuthAction.consume);
admin.topics().grantPermission(topic, role, actions);
```

</TabItem>

</Tabs>
````

### 获取权限

您可以通过以下方式获取权限。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics permissions persistent://test-tenant/ns1/tp1
```

示例输出：

```
application1    [consume, produce]
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getPermissionsOnTopic)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().getPermissions(topic);
```

</TabItem>

</Tabs>
````

### 撤销权限

您可以通过以下方式撤销授予客户端角色的权限。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics revoke-permission \
    --role application1 \
    persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_revokePermissionsOnTopic)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
String role = "test-role";
admin.topics().revokePermissions(topic, role);
```

</TabItem>

</Tabs>
````

### 删除主题

您可以通过以下方式删除主题。如果有任何活跃的订阅或生产者连接到主题，则无法删除该主题。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics delete persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_deleteTopic)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().delete(topic);
```

</TabItem>

</Tabs>
````

### 卸载主题

您可以通过以下方式卸载主题。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics unload persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_unloadTopic)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().unload(topic);
```

</TabItem>

</Tabs>
````

### 获取统计信息

有关主题的详细统计信息，请参阅 [Pulsar 统计信息](administration-stats.md#topic-stats)。

以下是主题状态的示例。

```json
{
  "msgRateIn" : 0.0,
  "msgThroughputIn" : 0.0,
  "msgRateOut" : 0.0,
  "msgThroughputOut" : 0.0,
  "bytesInCounter" : 504,
  "msgInCounter" : 9,
  "bytesOutCounter" : 2296,
  "msgOutCounter" : 41,
  "averageMsgSize" : 0.0,
  "msgChunkPublished" : false,
  "storageSize" : 504,
  "backlogSize" : 0,
  "filteredEntriesCount" : 100,
  "earliestMsgPublishTimeInBacklogs": 0,
  "offloadedStorageSize" : 0,
  "publishers" : [ {
    "accessMode" : "Shared",
    "msgRateIn" : 0.0,
    "msgThroughputIn" : 0.0,
    "averageMsgSize" : 0.0,
    "chunkedMessageRate" : 0.0,
    "producerId" : 0,
    "metadata" : { },
    "address" : "/127.0.0.1:65402",
    "connectedSince" : "2021-06-09T17:22:55.913+08:00",
    "clientVersion" : "2.9.0-SNAPSHOT",
    "producerName" : "standalone-1-0"
  } ],
  "waitingPublishers" : 0,
  "subscriptions" : {
    "sub-demo" : {
      "msgRateOut" : 0.0,
      "msgThroughputOut" : 0.0,
      "bytesOutCounter" : 2296,
      "msgOutCounter" : 41,
      "msgRateRedeliver" : 0.0,
      "chunkedMessageRate" : 0,
      "msgBacklog" : 0,
      "backlogSize" : 0,
      "earliestMsgPublishTimeInBacklog": 0,
      "msgBacklogNoDelayed" : 0,
      "blockedSubscriptionOnUnackedMsgs" : false,
      "msgDelayed" : 0,
      "unackedMessages" : 0,
      "type" : "Exclusive",
      "activeConsumerName" : "20b81",
      "msgRateExpired" : 0.0,
      "totalMsgExpired" : 0,
      "lastExpireTimestamp" : 0,
      "lastConsumedFlowTimestamp" : 1623230565356,
      "lastConsumedTimestamp" : 1623230583946,
      "lastAckedTimestamp" : 1623230584033,
      "lastMarkDeleteAdvancedTimestamp" : 1623230584033,
      "filterProcessedMsgCount": 100,
      "filterAcceptedMsgCount": 100,
      "filterRejectedMsgCount": 0,
      "filterRescheduledMsgCount": 0,
      "consumers" : [ {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 2296,
        "msgOutCounter" : 41,
        "msgRateRedeliver" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "20b81",
        "availablePermits" : 959,
        "unackedMessages" : 0,
        "avgMessagesPerEntry" : 314,
        "blockedConsumerOnUnackedMsgs" : false,
        "lastAckedTimestamp" : 1623230584033,
        "lastConsumedTimestamp" : 1623230583946,
        "metadata" : { },
        "address" : "/127.0.0.1:65172",
        "connectedSince" : "2021-06-09T17:22:45.353+08:00",
        "clientVersion" : "2.9.0-SNAPSHOT"
      } ],
      "allowOutOfOrderDelivery": false,
      "consumersAfterMarkDeletePosition" : { },
      "nonContiguousDeletedMessagesRanges" : 0,
      "nonContiguousDeletedMessagesRangesSerializedSize" : 0,
      "durable" : true,
      "replicated" : false
    }
  },
  "replication" : { },
  "deduplicationStatus" : "Disabled",
  "nonContiguousDeletedMessagesRanges" : 0,
  "nonContiguousDeletedMessagesRangesSerializedSize" : 0,
  "ownerBroker" : "localhost:8080"
}
```

要获取主题的状态，您可以使用以下方式。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics stats persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getStats)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().getStats(topic);
```

</TabItem>

</Tabs>
````

### 获取内部统计信息

有关主题内部的详细内部统计信息，请参阅 [Pulsar 统计信息](administration-stats.md#topic-internal-stats)。

以下是主题内部统计信息的示例。

```json
{
    "entriesAddedCounter":0,
    "numberOfEntries":0,
    "totalSize":0,
    "currentLedgerEntries":0,
    "currentLedgerSize":0,
    "lastLedgerCreatedTimestamp":"2021-01-22T21:12:14.868+08:00",
    "lastLedgerCreationFailureTimestamp":null,
    "waitingCursorsCount":0,
    "pendingAddEntriesCount":0,
    "lastConfirmedEntry":"3:-1",
    "state":"LedgerOpened",
    "ledgers":[
        {
            "ledgerId":3,
            "entries":0,
            "size":0,
            "offloaded":false,
            "metadata":null
        }
    ],
    "cursors":{
        "test":{
            "markDeletePosition":"3:-1",
            "readPosition":"3:-1",
            "waitingReadOp":false,
            "pendingReadOps":0,
            "messagesConsumedCounter":0,
            "cursorLedger":4,
            "cursorLedgerLastEntry":1,
            "individuallyDeletedMessages":"[]",
            "lastLedgerSwitchTimestamp":"2021-01-22T21:12:14.966+08:00",
            "state":"Open",
            "numberOfEntriesSinceFirstNotAckedMessage":0,
            "totalNonContiguousDeletedMessagesRange":0,
            "properties":{

            }
        }
    },
    "schemaLedgers":[
        {
            "ledgerId":1,
            "entries":11,
            "size":10,
            "offloaded":false,
            "metadata":null
        }
    ],
    "compactedLedger":{
        "ledgerId":-1,
        "entries":-1,
        "size":-1,
        "offloaded":false,
        "metadata":null
    }
}
```

要获取主题的内部状态，您可以使用以下方式。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics stats-internal persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_getInternalStats)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().getInternalStats(topic);
```

</TabItem>

</Tabs>
````

### 查看消息

您可以通过以下方式查看给定主题的特定订阅的若干消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics peek-messages \
    --count 10 --subscription my-subscription \
    persistent://test-tenant/ns1/tp1
```

示例输出：

```
Message ID: 77:2
Publish time: 1668674963028
Event time: 0
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 68 65 6c 6c 6f 2d 31                            |hello-1         |
+--------+-------------------------------------------------+----------------+
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_peekNthMessage)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
String subName = "my-subscription";
int numMessages = 1;
admin.topics().peekMessages(topic, subName, numMessages);
```

</TabItem>

</Tabs>
````

### 根据 ID 获取消息

您可以通过以下方式获取具有给定 ledger ID 和 entry ID 的消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics get-message-by-id \
    -l 10 -e 0 persistent://public/default/my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getMessageById)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
long ledgerId = 10;
long entryId = 10;
admin.topics().getMessageById(topic, ledgerId, entryId);
```

</TabItem>

</Tabs>
````

### 检查消息

您可以通过相对于最早或最新消息的位置来检查主题上的特定消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics examine-messages \
    -i latest -m 1 persistent://public/default/my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_examineMessage)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().examineMessage(topic, "latest", 1);
```

</TabItem>

</Tabs>
````

### 获取消息 ID

您可以获取在给定日期时间或之后发布的消息 ID。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics get-message-id \
    persistent://public/default/my-topic \
    -d 2021-06-28T19:01:17Z
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getMessageIdByTimestamp)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
long timestamp = System.currentTimeMillis()
admin.topics().getMessageIdByTimestamp(topic, timestamp);
```

</TabItem>

</Tabs>
````


### 跳过消息

您可以通过以下方式跳过给定主题的特定订阅的若干消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics skip \
    --count 10 --subscription my-subscription \
    persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_skipMessages)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
String subName = "my-subscription";
int numMessages = 1;
admin.topics().skipMessages(topic, subName, numMessages);
```

</TabItem>

</Tabs>
````

### 跳过所有消息

您可以跳过给定主题的特定订阅的所有旧消息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics clear-backlog \
    --subscription my-subscription \
    persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_skipAllMessages)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
String subName = "my-subscription";
admin.topics().skipAllMessages(topic, subName);
```

</TabItem>

</Tabs>
````

### 重置游标

您可以将订阅游标位置重置到 X 秒（或其他时间单位，如 100m、3h、2d、5w）之前记录的位置。它基本上计算 X 秒前游标的时间和位置，并在该位置重置它。您可以通过以下方式重置游标。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics reset-cursor \
    --subscription my-subscription --time 10 \
    persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_resetCursor)

</TabItem>
<TabItem value="Java">

```java

String topic = "persistent://my-tenant/my-namespace/my-topic";
String subName = "my-subscription";
long timestamp = 2342343L;
admin.topics().resetCursor(topic, subName, timestamp);

```

</TabItem>

</Tabs>
````

### 查找主题的所有者 broker

您可以通过以下方式定位给定主题的所有者 broker。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics lookup persistent://test-tenant/ns1/tp1
```

示例输出：

```
"pulsar://broker1.org.com:4480"
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->lookup/TopicLookup_lookupTopicAsync)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.lookups().lookupDestination(topic);
```

</TabItem>

</Tabs>
````

### 查找分区主题的所有者 broker

您可以通过以下方式定位给定分区主题的所有者 broker。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics partitioned-lookup persistent://test-tenant/ns1/my-topic
```

示例输出：

```
"persistent://test-tenant/ns1/my-topic-partition-0   pulsar://localhost:6650"
"persistent://test-tenant/ns1/my-topic-partition-1   pulsar://localhost:6650"
"persistent://test-tenant/ns1/my-topic-partition-2   pulsar://localhost:6650"
"persistent://test-tenant/ns1/my-topic-partition-3   pulsar://localhost:6650"
```

按 broker URL 排序查找分区主题

```shell
pulsar-admin topics partitioned-lookup \
    persistent://test-tenant/ns1/my-topic --sort-by-broker
```

示例输出：

```
pulsar://localhost:6650   [persistent://test-tenant/ns1/my-topic-partition-0, persistent://test-tenant/ns1/my-topic-partition-1, persistent://test-tenant/ns1/my-topic-partition-2, persistent://test-tenant/ns1/my-topic-partition-3]
```

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.lookups().lookupPartitionedTopic(topic);
```

</TabItem>

</Tabs>
````

### 获取 bundle

您可以通过以下方式获取给定主题所属的 bundle 的范围。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics bundle-range persistent://test-tenant/ns1/tp1
```

示例输出：

```
"0x00000000_0xffffffff"
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->lookup/TopicLookup_getNamespaceBundle)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.lookups().getBundleRange(topic);
```

</TabItem>

</Tabs>
````

### 获取订阅

您可以通过以下方式检查给定主题的所有订阅名称。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics subscriptions persistent://test-tenant/ns1/tp1
```

示例输出：

```
my-subscription
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getSubscriptions)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().getSubscriptions(topic);
```

</TabItem>

</Tabs>
````

### 最后消息 ID

您可以获取持久化主题的最后提交消息 ID。自 2.3.0 版本开始可用。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics last-message-id topic-name
```

示例输出：

```json
{
  "ledgerId" : 97,
  "entryId" : 9,
  "partitionIndex" : -1
}
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getLastMessageId)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().getLastMessage(topic);
```

</TabItem>

</Tabs>
````

### 获取积压大小

您可以获取具有给定消息 ID 的单个分区主题或非分区主题的积压大小（以字节为单位）。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics get-backlog-size \
  -m 1:1 \
  persistent://test-tenant/ns1/tp1-partition-0
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getBacklogSizeByMessageId)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
MessageId messageId = MessageId.earliest;
admin.topics().getBacklogSizeByMessageId(topic, messageId);
```

</TabItem>

</Tabs>
````


### 配置去重快照间隔

#### 获取去重快照间隔

要获取主题级别的去重快照间隔，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics get-deduplication-snapshot-interval my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_getDeduplicationSnapshotInterval)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getDeduplicationSnapshotInterval(topic)
```

</TabItem>

</Tabs>
````

#### 设置去重快照间隔

要设置主题级别的去重快照间隔，请使用以下方法之一。

> **先决条件** `brokerDeduplicationEnabled` 必须设置为 `true`。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics set-deduplication-snapshot-interval my-topic -i 1000
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_setDeduplicationSnapshotInterval)

```json
{
  "interval": 1000
}
```

</TabItem>
<TabItem value="Java">

```java
admin.topics().setDeduplicationSnapshotInterval(topic, 1000)
```

</TabItem>

</Tabs>
````

#### 移除去重快照间隔

要移除主题级别的去重快照间隔，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics remove-deduplication-snapshot-interval my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_deleteDeduplicationSnapshotInterval)

</TabItem>
<TabItem value="Java">

```java
admin.topics().removeDeduplicationSnapshotInterval(topic)
```

</TabItem>

</Tabs>
````


### 配置非活跃主题策略

#### 获取非活跃主题策略

要获取主题级别的非活跃主题策略，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics get-inactive-topic-policies my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_getInactiveTopicPolicies)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getInactiveTopicPolicies(topic)
```

</TabItem>

</Tabs>
````

#### 设置非活跃主题策略

要设置主题级别的非活跃主题策略，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics set-inactive-topic-policies my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_setInactiveTopicPolicies)

</TabItem>
<TabItem value="Java">

```java
admin.topics().setInactiveTopicPolicies(topic, inactiveTopicPolicies)
```

</TabItem>

</Tabs>
````

#### 移除非活跃主题策略

要移除主题级别的非活跃主题策略，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics remove-inactive-topic-policies my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_removeInactiveTopicPolicies)

</TabItem>
<TabItem value="Java">

```java
admin.topics().removeInactiveTopicPolicies(topic)
```

</TabItem>

</Tabs>
````


### 配置卸载策略

#### 获取卸载策略

要获取主题级别的卸载策略，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics get-offload-policies my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_getOffloadPolicies)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getOffloadPolicies(topic)
```

</TabItem>

</Tabs>
````

#### 设置卸载策略

要设置主题级别的卸载策略，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics set-offload-policies my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_setOffloadPolicies)

</TabItem>
<TabItem value="Java">

```java
admin.topics().setOffloadPolicies(topic, offloadPolicies)
```

</TabItem>

</Tabs>
````

#### 移除卸载策略

要移除主题级别的卸载策略，请使用以下方法之一。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics remove-offload-policies my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->Namespaces_removeOffloadPolicies)

</TabItem>
<TabItem value="Java">

```java
admin.topics().removeOffloadPolicies(topic)
```

</TabItem>

</Tabs>
````


## 管理非分区主题
您可以使用 Pulsar [管理 API](admin-api-overview.md) 来创建、删除和检查非分区主题的状态。

### 创建
非分区主题必须显式创建。创建新的非分区主题时，您需要为主题提供名称。

默认情况下，创建后 60 秒，主题被视为非活跃并自动删除以避免生成垃圾数据。要禁用此功能，请将 `brokerDeleteInactiveTopicsEnabled` 设置为 `false`。要更改检查非活跃主题的频率，请将 `brokerDeleteInactiveTopicsFrequencySeconds` 设置为特定值。

有关这两个参数的更多信息，请参见[此处](reference-configuration.md#broker)。

您可以通过以下方式创建非分区主题。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

当您使用 [`create`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=create) 命令创建非分区主题时，需要将主题名称指定为参数。

```shell
pulsar-admin topics create \
    persistent://my-tenant/my-namespace/my-topic
```

:::note

当您创建带有后缀 '-partition-' 后跟数值如 'xyz-topic-partition-x' 的非分区主题时，如果存在带有相同后缀 'xyz-topic-partition-y' 的分区主题，那么非分区主题的数值(x)必须大于分区主题的分区数(y)。否则，您无法创建这样的非分区主题。

:::

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_createNonPartitionedTopic)

</TabItem>
<TabItem value="Java">

```java
String topicName = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().createNonPartitionedTopic(topicName);
```

</TabItem>

</Tabs>
````

### 删除

您可以通过以下方式删除非分区主题。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics delete \
    persistent://my-tenant/my-namespace/my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_deleteTopic)

</TabItem>
<TabItem value="Java">

```java
admin.topics().delete(topic);
```

</TabItem>

</Tabs>
````

### 列表

您可以通过以下方式获取给定命名空间下的主题列表。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics list tenant/namespace
```

示例输出：

```
persistent://tenant/namespace/topic1
persistent://tenant/namespace/topic2
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_getList)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getList(namespace);
```

</TabItem>

</Tabs>
````

### 统计信息

您可以通过以下方式检查给定主题及其连接的生产者和消费者的当前统计信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics stats \
    persistent://test-tenant/namespace/topic \
    --get-precise-backlog
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getStats)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getStats(topic, false /* 是精确积压 */);
```

</TabItem>

</Tabs>
````

以下是一个示例。有关主题统计信息的描述，请参阅 [Pulsar 统计信息](administration-stats.md#topic-stats)。

```json
{
  "msgRateIn": 4641.528542257553,
  "msgThroughputIn": 44663039.74947473,
  "msgRateOut": 0,
  "msgThroughputOut": 0,
  "averageMsgSize": 1232439.816728665,
  "storageSize": 135532389160,
  "publishers": [
    {
      "msgRateIn": 57.855383881403576,
      "msgThroughputIn": 558994.7078932219,
      "averageMsgSize": 613135,
      "producerId": 0,
      "producerName": null,
      "address": null,
      "connectedSince": null
    }
  ],
  "subscriptions": {
    "my-topic_subscription": {
      "msgRateOut": 0,
      "msgThroughputOut": 0,
      "msgBacklog": 116632,
      "type": null,
      "msgRateExpired": 36.98245516804671,
      "consumers": []
    }
  },
  "replication": {}
}
```

### 内部统计信息

您可以检查主题的详细统计信息。以下是一个示例。有关每个内部主题统计信息的描述，请参阅 [Pulsar 统计信息](administration-stats.md#topic-internal-stats)。

```json
{
  "entriesAddedCounter": 20449518,
  "numberOfEntries": 3233,
  "totalSize": 331482,
  "currentLedgerEntries": 3233,
  "currentLedgerSize": 331482,
  "lastLedgerCreatedTimestamp": "2016-06-29 03:00:23.825",
  "lastLedgerCreationFailureTimestamp": null,
  "waitingCursorsCount": 1,
  "pendingAddEntriesCount": 0,
  "lastConfirmedEntry": "324711539:3232",
  "state": "LedgerOpened",
  "ledgers": [
    {
      "ledgerId": 324711539,
      "entries": 0,
      "size": 0
    }
  ],
  "cursors": {
    "my-subscription": {
      "markDeletePosition": "324711539:3133",
      "readPosition": "324711539:3233",
      "waitingReadOp": true,
      "pendingReadOps": 0,
      "messagesConsumedCounter": 20449501,
      "cursorLedger": 324702104,
      "cursorLedgerLastEntry": 21,
      "individuallyDeletedMessages": "[(324711539:3134‥324711539:3136], (324711539:3137‥324711539:3140], ]",
      "lastLedgerSwitchTimestamp": "2016-06-29 01:30:19.313",
      "state": "Open"
    }
  }
}
```

您可以通过以下方式获取分区主题的内部统计信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics stats-internal \
    persistent://test-tenant/namespace/topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_getInternalStats)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getInternalStats(topic);
```

</TabItem>

</Tabs>
````

## 管理分区主题
您可以使用 Pulsar [管理 API](admin-api-overview.md) 来创建、更新、删除和检查分区主题的状态。

### 创建

创建新的分区主题时，您需要提供主题的名称和分区数量。

:::note

默认情况下，如果创建后 60 秒内没有消息，主题被视为非活跃并自动删除以避免生成垃圾数据。要禁用此功能，请将 `brokerDeleteInactiveTopicsEnabled` 设置为 `false`。要更改检查非活跃主题的频率，请将 `brokerDeleteInactiveTopicsFrequencySeconds` 设置为特定值。

:::

有关这两个参数的更多信息，请参见[此处](reference-configuration.md#broker)。

您可以通过以下方式创建分区主题。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

当您使用 [`create-partitioned-topic`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=create-partitioned-topic) 命令创建分区主题时，需要将主题名称指定为参数，并使用 `-p` 或 `--partitions` 标志指定分区数量。

```shell
pulsar-admin topics create-partitioned-topic \
    persistent://my-tenant/my-namespace/my-topic \
    --partitions 4
```

:::note

如果存在带有后缀 '-partition-' 后跟数值如 'xyz-topic-partition-10' 的非分区主题，您不能创建名称为 'xyz-topic' 的分区主题，因为分区主题的分区可能会覆盖现有的非分区主题。要创建这样的分区主题，您必须先删除该非分区主题。

:::

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_createPartitionedTopic)

</TabItem>
<TabItem value="Java">

```java
String topicName = "persistent://my-tenant/my-namespace/my-topic";
int numPartitions = 4;
admin.topics().createPartitionedTopic(topicName, numPartitions);
```

</TabItem>

</Tabs>
````

### 创建缺失的分区

当禁用主题自动创建时，如果您有一个没有分区的分区主题，您可以使用 [`create-missed-partitions`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=create-missed-partitions) 命令为主题创建分区。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

您可以使用 [`create-missed-partitions`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=create-missed-partitions) 命令创建缺失的分区，并将主题名称指定为参数。

```shell
pulsar-admin topics create-missed-partitions \
    persistent://my-tenant/my-namespace/my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_createMissedPartitions)

</TabItem>
<TabItem value="Java">

```java
String topicName = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().createMissedPartitions(topicName);
```

</TabItem>

</Tabs>
````

### 获取元数据

分区主题与元数据相关联，您可以将其视为 JSON 对象。以下元数据字段可用。

字段 | 描述
:-----|:-------
`partitions` | 主题被划分的分区数。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

您可以使用 [`get-partitioned-topic-metadata`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=get-partitioned-topic-metadata) 子命令检查分区主题中的分区数量。

```shell
pulsar-admin topics get-partitioned-topic-metadata \
    persistent://my-tenant/my-namespace/my-topic
```

示例输出：

```json
{
  "partitions" : 4,
  "deleted" : false
}
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_getPartitionedMetadata)

</TabItem>
<TabItem value="Java">

```java
String topicName = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().getPartitionedTopicMetadata(topicName);
```

</TabItem>

</Tabs>
````

### 更新

您可以更新现有分区主题的分区数量。但是，您只能增加分区数量。减少分区数量会删除主题，这在 Pulsar 中不受支持。

生产者和消费者可以自动找到新创建的分区。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

您可以使用 [`update-partitioned-topic`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=update-partitioned-topic) 命令更新分区主题。

```shell
pulsar-admin topics update-partitioned-topic \
    persistent://my-tenant/my-namespace/my-topic \
    --partitions 8
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_updatePartitionedTopic)

</TabItem>
<TabItem value="Java">

```java
admin.topics().updatePartitionedTopic(topic, numPartitions);
```

</TabItem>

</Tabs>
````

### 删除
您可以使用 [`delete-partitioned-topic`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=delete-partitioned-topic) 命令、REST API 和 Java 删除分区主题。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics delete-partitioned-topic \
    persistent://my-tenant/my-namespace/my-topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_deletePartitionedTopic)

</TabItem>
<TabItem value="Java">

```java
admin.topics().deletePartitionedTopic(topic);
```

</TabItem>

</Tabs>
````

### 列表

您可以通过以下方式获取给定命名空间下的分区主题列表。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics list-partitioned-topics tenant/namespace
```

示例输出：

```
persistent://tenant/namespace/topic1
persistent://tenant/namespace/topic2
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getPartitionedTopicList)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getPartitionedTopicList(namespace);
```

</TabItem>

</Tabs>
````

### 统计信息

您可以通过以下方式检查给定分区主题及其连接的生产者和消费者的当前统计信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics partitioned-stats \
    persistent://test-tenant/namespace/topic \
    --per-partition
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->NonPersistentTopics_getPartitionedStats)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getPartitionedStats(topic, true /* 按分区 */, false /* 是精确积压 */);
```

</TabItem>

</Tabs>
````

以下是一个示例。有关每个主题统计信息的描述，请参阅 [Pulsar 统计信息](administration-stats.md#topic-stats)。

请注意，在订阅 JSON 对象中，`chuckedMessageRate` 已被弃用。请使用 `chunkedMessageRate`。目前两者都会在 JSON 中发送。

```json
{
  "msgRateIn" : 999.992947159793,
  "msgThroughputIn" : 1070918.4635439808,
  "msgRateOut" : 0.0,
  "msgThroughputOut" : 0.0,
  "bytesInCounter" : 270318763,
  "msgInCounter" : 252489,
  "bytesOutCounter" : 0,
  "msgOutCounter" : 0,
  "averageMsgSize" : 1070.926056966454,
  "msgChunkPublished" : false,
  "storageSize" : 270316646,
  "backlogSize" : 200921133,
  "publishers" : [ {
    "msgRateIn" : 999.992947159793,
    "msgThroughputIn" : 1070918.4635439808,
    "averageMsgSize" : 1070.3333333333333,
    "chunkedMessageRate" : 0.0,
    "producerId" : 0
  } ],
  "subscriptions" : {
    "test" : {
      "msgRateOut" : 0.0,
      "msgThroughputOut" : 0.0,
      "bytesOutCounter" : 0,
      "msgOutCounter" : 0,
      "msgRateRedeliver" : 0.0,
      "chuckedMessageRate" : 0,
      "chunkedMessageRate" : 0,
      "msgBacklog" : 144318,
      "msgBacklogNoDelayed" : 144318,
      "blockedSubscriptionOnUnackedMsgs" : false,
      "msgDelayed" : 0,
      "unackedMessages" : 0,
      "msgRateExpired" : 0.0,
      "lastExpireTimestamp" : 0,
      "lastConsumedFlowTimestamp" : 0,
      "lastConsumedTimestamp" : 0,
      "lastAckedTimestamp" : 0,
      "consumers" : [ ],
      "isDurable" : true,
      "isReplicated" : false
    }
  },
  "replication" : { },
  "metadata" : {
    "partitions" : 3
  },
  "partitions" : { }
}
```

### 内部统计信息

您可以检查分区主题的详细统计信息。以下是一个示例。有关每个内部主题统计信息的描述，请参阅 [Pulsar 统计信息](administration-stats.md#topic-internal-stats)。

```json
{
  "entriesAddedCounter": 20449518,
  "numberOfEntries": 3233,
  "totalSize": 331482,
  "currentLedgerEntries": 3233,
  "currentLedgerSize": 331482,
  "lastLedgerCreatedTimestamp": "2016-06-29 03:00:23.825",
  "lastLedgerCreationFailureTimestamp": null,
  "waitingCursorsCount": 1,
  "pendingAddEntriesCount": 0,
  "lastConfirmedEntry": "324711539:3232",
  "state": "LedgerOpened",
  "ledgers": [
    {
      "ledgerId": 324711539,
      "entries": 0,
      "size": 0
    }
  ],
  "cursors": {
    "my-subscription": {
      "markDeletePosition": "324711539:3133",
      "readPosition": "324711539:3233",
      "waitingReadOp": true,
      "pendingReadOps": 0,
      "messagesConsumedCounter": 20449501,
      "cursorLedger": 324702104,
      "cursorLedgerLastEntry": 21,
      "individuallyDeletedMessages": "[(324711539:3134‥324711539:3136], (324711539:3137‥324711539:3140], ]",
      "lastLedgerSwitchTimestamp": "2016-06-29 01:30:19.313",
      "state": "Open"
    }
  }
}
```

您可以通过以下方式获取分区主题的内部统计信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="pulsar-admin">

```shell
pulsar-admin topics partitioned-stats-internal \
    persistent://test-tenant/namespace/topic
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getPartitionedStatsInternal)

</TabItem>
<TabItem value="Java">

```java
admin.topics().getPartitionedInternalStats(topic);
```

</TabItem>

</Tabs>
````


## 管理订阅

您可以使用 [Pulsar 管理 API](admin-api-overview.md) 来创建、检查和删除订阅。

### 创建订阅

您可以使用以下方法之一为主题创建订阅。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="pulsar-admin">

```shell
pulsar-admin topics create-subscription \
    --subscription my-subscription \
    persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_createSubscription)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
String subscriptionName = "my-subscription";
admin.topics().createSubscription(topic, subscriptionName, MessageId.latest);
```

</TabItem>

</Tabs>
````

### 获取订阅

您可以使用以下方法之一检查给定主题的所有订阅名称。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="pulsar-admin">

```shell
pulsar-admin topics subscriptions persistent://test-tenant/ns1/tp1
```

示例输出：

```
my-subscription
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_getSubscriptions)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
admin.topics().getSubscriptions(topic);
```

</TabItem>

</Tabs>
````

### 取消订阅订阅

当订阅不再处理消息时，您可以使用以下方法之一取消订阅它。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="pulsar-admin"
  values={[{"label":"pulsar-admin","value":"pulsar-admin"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>

<TabItem value="pulsar-admin">

```shell
pulsar-admin topics unsubscribe \
    --subscription my-subscription \
    persistent://test-tenant/ns1/tp1
```

</TabItem>
<TabItem value="REST API">

<!-- Swagger API 参考：/admin/v2/ -->PersistentTopics_deleteSubscription)

</TabItem>
<TabItem value="Java">

```java
String topic = "persistent://my-tenant/my-namespace/my-topic";
String subscriptionName = "my-subscription";
admin.topics().deleteSubscription(topic, subscriptionName);
```

</TabItem>

</Tabs>
````