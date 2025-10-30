---
id: develop-load-manager
title: Broker 负载均衡器
sidebar_label: "Broker 负载均衡器"
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

如果您想开发 Broker 负载均衡器，请查看以下文档。

Pulsar 有以下类型的负载管理器：

- 简单负载管理器，在 [SimpleLoadManagerImpl](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/loadbalance/impl/SimpleLoadManagerImpl.java) 中实现，它试图简化负载管理方式，同时提供抽象，以便可以实现复杂的负载管理策略。

- 模块化负载管理器，在 [ModularLoadManagerImpl](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/loadbalance/impl/ModularLoadManagerImpl.java) 中实现，它是 [`SimpleLoadManagerImpl`](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/loadbalance/impl/SimpleLoadManagerImpl.java) 的灵活替代方案。

- 可扩展负载管理器，在 [ExtensibleLoadManagerImpl](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/loadbalance/extensions/ExtensibleLoadManagerImpl.java) 中实现，它依赖于系统主题和表视图来实现负载均衡元数据存储和复制。

## 概念

在开始实现之前，请确保您理解以下基础知识。

:::note

以下概念仅适用于模块化负载管理器。

:::

### 数据

模块化负载管理器监控的数据包含在 [`LoadData`](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/loadbalance/LoadData.java) 类中。
这里，可用的数据被细分为 Bundle 数据和 Broker 数据。

### Broker

Broker 数据包含在 [`BrokerData`](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/BrokerData.java) 类中。它进一步分为两个部分，
一部分是每个 Broker 单独写入 ZooKeeper 的本地数据，另一部分是由 Leader Broker 写入 ZooKeeper 的历史 Broker 数据。

### Leader Broker

模块化负载管理器是**集中式**的，意味着所有分配 Bundle 的请求——无论是以前见过的还是第一次——都只由 Leader Broker 处理（Leader Broker 可能随时间变化）。要确定当前的 Leader Broker，请检查 ZooKeeper 中的 `/loadbalance/leader` 节点。

### 本地 Broker 数据

本地 Broker 数据包含在类 [`LocalBrokerData`](https://github.com/apache/pulsar/blob/master/pulsar-common/src/main/java/org/apache/pulsar/policies/data/loadbalancer/LocalBrokerData.java) 中，并提供有关以下资源的信息：

* CPU 使用率
* JVM 堆内存使用率
* 直接内存使用率
* 带宽输入/输出使用率
* 所有 Bundle 最近的总消息输入/输出速率
* Topic、Bundle、生产者和消费者的总数
* 分配给此 Broker 的所有 Bundle 的名称
* 此 Broker 的最近 Bundle 分配变化

本地 Broker 数据根据服务配置 "loadBalancerReportUpdateMaxIntervalMinutes" 定期更新。
在任何 Broker 更新其本地 Broker 数据后，Leader Broker 将通过 ZooKeeper watch 立即接收更新，
其中本地数据从 ZooKeeper 节点 `/loadbalance/brokers/<broker host/port>` 读取

### 历史 Broker 数据

历史 Broker 数据包含在 [`TimeAverageBrokerData`](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/TimeAverageBrokerData.java) 类中。

为了在稳态场景下做出良好决策和在关键场景下做出反应性决策的需求，历史数据被分为两部分：用于反应性决策的短期数据和用于稳态决策的长期数据。两个时间框架都维护以下信息：

* 整个 Broker 的消息输入/输出速率
* 整个 Broker 的消息输入/输出吞吐量

与 Bundle 数据不同，Broker 数据不维护全局 Broker 消息速率和吞吐量的样本，因为这在新 Bundle 被移除或添加时不会保持稳定。
相反，这些数据是在 Bundle 的短期和长期数据上聚合的。请参阅 Bundle 数据部分以了解该数据如何收集和维护。

历史 Broker 数据由 Leader Broker 在任何 Broker 将其本地数据写入 ZooKeeper 时在内存中为每个 Broker 更新。
然后，历史数据由 Leader Broker 根据 `loadBalancerResourceQuotaUpdateIntervalMinutes` 配置定期写入 ZooKeeper。

### Bundle 数据

Bundle 数据包含在 [`BundleData`](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/BundleData.java) 中。与历史 Broker 数据一样，Bundle 数据被分为短期和长期时间框架。每个时间框架中维护的信息：

* 此 Bundle 的消息输入/输出速率
* 此 Bundle 的消息输入/输出吞吐量
* 此 Bundle 的当前样本数量

时间框架通过维护一组有限的样本上的这些值的平均值来实现，其中样本通过本地数据中的消息速率和吞吐量值获得。
因此，如果本地数据的更新间隔是 2 分钟，短期样本数是 10，长期样本数是 1000，则短期数据在 `10 个样本 * 2 分钟/样本 = 20 分钟` 的周期内维护，而长期数据类似地在 2000 分钟的周期内维护。
当没有足够的样本来满足给定的时间框架时，平均值仅对现有样本取平均。当没有样本可用时，假设默认值，直到被第一个样本覆盖。目前，默认值是

* 消息输入/输出速率：双向每秒 50 条消息
* 消息输入/输出吞吐量：双向每秒 50KB

Bundle 数据由 Leader Broker 在任何 Broker 将其本地数据写入 ZooKeeper 时在内存中更新。
然后，Bundle 数据由 Leader Broker 根据 `loadBalancerResourceQuotaUpdateIntervalMinutes` 配置定期与历史 Broker 数据同时写入 ZooKeeper。

### 流量分布

模块化负载管理器使用 [`ModularLoadManagerStrategy`](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/loadbalance/ModularLoadManagerStrategy.java) 提供的抽象来做出关于 Bundle 分配的决策。
策略通过考虑服务配置、整个负载数据和要分配的 Bundle 的 Bundle 数据来做出决策。
目前，唯一支持的策略是 [`LeastLongTermMessageRate`](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/loadbalance/impl/LeastLongTermMessageRate.java)，尽管很快用户将能够根据需要注入自己的策略。

### 最小长期消息速率策略

顾名思义，最小长期消息速率策略尝试在 Broker 之间分配 Bundle，以便每个 Broker 在长期时间窗口内的消息速率大致相同。
然而，仅仅基于消息速率平衡负载并不能处理每个 Broker 上每条消息的资源负担不对称的问题。
因此，系统资源使用率，包括 CPU、内存、直接内存、输入带宽和输出带宽，在分配过程中也被考虑。
这是通过根据 `1 / (overload_threshold - max_usage)` 对最终消息速率进行加权来完成的，
其中 `overload_threshold` 对应于配置 `loadBalancerBrokerOverloadedThresholdPercentage`，`max_usage` 是候选 Broker 正在使用的系统资源的最大比例。
这个乘数确保了被相同消息速率更重征税的机器将接收更少的负载。
特别是，它试图确保如果一台机器过载，那么所有机器都大致过载。
在 Broker 的最大使用率超过过载阈值的情况下，该 Broker 不被考虑用于 Bundle 分配。如果所有 Broker 都过载，则随机分配 Bundle。

## 启用

您可以按照以下步骤启用简单、模块化或可扩展负载管理器。

:::note

对于简单和模块化负载管理器：

- 指定负载管理器的任何错误将导致 Pulsar 默认使用 `SimpleLoadManagerImpl`。

- 如果您不指定负载管理器，则使用默认负载管理器（`ModularLoadManagerImpl`）。

:::

### 启用简单负载管理器

您可以使用以下方法之一启用简单负载管理器：

- 方法 1

  将 `conf/broker.conf` 中的 [loadManagerClassName](https://github.com/apache/pulsar/blob/782e91fe327efe2c9c9107d6c679c2837d43935b/conf/broker.conf#L1309) 的值更新为 `org.apache.pulsar.broker.loadbalance.impl.SimpleLoadManagerImpl`。

- 方法 2

  使用 `pulsar-admin` 工具。

   ```shell
   pulsar-admin brokers update-dynamic-config \
   --config loadManagerClassName \
   --value org.apache.pulsar.broker.loadbalance.impl.SimpleLoadManagerImpl
   ```

### 启用模块化负载管理器

您可以使用以下方法之一启用模块化负载管理器：

- 方法 1

  将 `conf/broker.conf` 中的 [loadManagerClassName](https://github.com/apache/pulsar/blob/782e91fe327efe2c9c9107d6c679c2837d43935b/conf/broker.conf#L1309) 的值更新为 `org.apache.pulsar.broker.loadbalance.impl.ModularLoadManagerImpl`。

- 方法 2

  使用 `pulsar-admin` 工具。

   ```shell
   pulsar-admin brokers update-dynamic-config \
   --config loadManagerClassName \
   --value org.apache.pulsar.broker.loadbalance.impl.ModularLoadManagerImpl
   ```

### 启用可扩展负载管理器

您可以通过将 `conf/broker.conf` 中的 [loadManagerClassName](https://github.com/apache/pulsar/blob/782e91fe327efe2c9c9107d6c679c2837d43935b/conf/broker.conf#L1309) 的值更新为 `org.apache.pulsar.broker.loadbalance.extensions.ExtensibleLoadManagerImpl` 来启用可扩展负载管理器。

:::note

[pulsar-admin 工具](./reference-cli-tools.md) 不支持启用可扩展负载管理器。

:::

## 验证

如果您想验证使用的是哪个负载管理器，请按照以下步骤操作。

### 步骤 1：检查 loadManagerClassName

您可以使用 `pulsar-admin` 工具检查 `loadManagerClassName` 元素。

**输入**

```bash
bin/pulsar-admin brokers get-all-dynamic-config
```

**输出**

```bash
{
"loadManagerClassName" : "org.apache.pulsar.broker.loadbalance.impl.ModularLoadManagerImpl"
}
```

如果没有 `loadManagerClassName` 元素，则使用 `conf/broker.conf` 文件中的 [loadManagerClassName](https://github.com/apache/pulsar/blob/782e91fe327efe2c9c9107d6c679c2837d43935b/conf/broker.conf#L1309) 的值。

### 步骤 2：验证负载管理器（可选）

要再次检查使用的是哪个负载管理器，您可以[检查 ZooKeeper 负载报告](#方法-1检查-zookeeper-负载报告)或[检查 monitor-brokers 输出](#方法-2检查-monitor-brokers-输出)。

#### 方法 1：检查负载报告

不同的负载管理器有不同的负载报告。您可以根据输出来验证使用的是哪个负载管理器。

````mdx-code-block
<Tabs groupId="load-manager-report"
  defaultValue="Simple"
  values={[{"label":"Simple","value":"Simple"},{"label":"Modular","value":"Modular"},{"label":"Extensible","value":"Extensible"}]}>
<TabItem value="Simple">

您可以检查 ZooKeeper 负载报告。

1. 连接到 ZooKeeper。

    **输入**

    ```bash
    bin/pulsar zookeeper-shell -server zookeeper:2181
    ```

    **输出**

    ```bash
    Connecting to zookeeper:2181
    2023-08-02T12:48:58,655+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:zookeeper.version=3.8.1-74db005175a4ec545697012f9069cb9dcc8cdda7, built on 2023-01-25 16:31 UTC
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:host.name=broker-1
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:java.version=17.0.7
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:java.vendor=Eclipse Adoptium
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:java.home=/usr/lib/jvm/temurin-17-jdk-amd64
    ```

2. 列出所有 Broker。

    **输入**

    ```bash
    ls /loadbalance/brokers
    ```

    **输出**

    此输出显示有 2 个 Broker。

    ```bash
    [broker-1:8080, broker-2:8080]
    ```

3. 检查 Broker 1 的 ZooKeeper 负载报告。负载报告在 `/loadbalance/brokers/...` 中。

    **输入**

    ```bash
    get /loadbalance/brokers/broker-1:8080
    ```

    **输出**

    ```bash
    {"name":"broker-1:8080","brokerVersionString":"3.1.0-SNAPSHOT","webServiceUrl":"http://broker-1:8080","pulsarServiceUrl":"pulsar://broker-1:6650","persistentTopicsEnabled":true,"nonPersistentTopicsEnabled":true,"timestamp":1691042931108,"msgRateIn":0.0,"msgRateOut":0.0,"numTopics":0,"numConsumers":0,"numProducers":0,"numBundles":0,"protocols":{},"loadManagerClassName":"org.apache.pulsar.broker.loadbalance.impl.SimpleLoadManagerImpl","startTimestamp":1691042931108,"systemResourceUsage":{"bandwidthIn":{"usage":0.595387281695773,"limit":1.0E7},"bandwidthOut":{"usage":0.5799226769764033,"limit":1.0E7},"cpu":{"usage":6.224803359552059,"limit":800.0},"memory":{"usage":152.0,"limit":2096.0},"directMemory":{"usage":0.0,"limit":256.0}},"bundleStats":{},"bundleGains":[],"bundleLosses":[],"allocatedCPU":0.0,"allocatedMemory":0.0,"allocatedBandwidthIn":0.0,"allocatedBandwidthOut":0.0,"allocatedMsgRateIn":0.0,"allocatedMsgRateOut":0.0,"preAllocatedCPU":0.0,"preAllocatedMemory":0.0,"preAllocatedBandwidthIn":0.0,"preAllocatedBandwidthOut":0.0,"preAllocatedMsgRateIn":0.0,"preAllocatedMsgRateOut":0.0,"underLoaded":true,"overLoaded":false,"loadReportType":"LoadReport","msgThroughputIn":0.0,"msgThroughputOut":0.0,"bandwidthIn":{"usage":0.595387281695773,"limit":1.0E7},"bandwidthOut":{"usage":0.5799226769764033,"limit":1.0E7},"memory":{"usage":152.0,"limit":2096.0},"cpu":{"usage":6.224803359552059,"limit":800.0},"directMemory":{"usage":0.0,"limit":256.0},"lastUpdate":1691042931108}
    ```

</TabItem>
<TabItem value="Modular">

您可以检查 ZooKeeper 负载报告。

1. 连接到 ZooKeeper。

    **输入**

    ```bash
    bin/pulsar zookeeper-shell -server zookeeper:2181
    ```

    **输出**

    ```bash
    Connecting to zookeeper:2181
    2023-08-02T12:48:58,655+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:zookeeper.version=3.8.1-74db005175a4ec545697012f9069cb9dcc8cdda7, built on 2023-01-25 16:31 UTC
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:host.name=broker-1
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:java.version=17.0.7
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:java.vendor=Eclipse Adoptium
    2023-08-02T12:48:58,662+0000 [main] INFO  org.apache.zookeeper.ZooKeeper - Client environment:java.home=/usr/lib/jvm/temurin-17-jdk-amd64
    ```

2. 列出所有 Broker。

    **输入**

    ```bash
    ls /loadbalance/brokers
    ```

    **输出**

    此输出显示有 2 个 Broker。

    ```bash
    [broker-1:8080, broker-2:8080]
    ```

3. 检查 Broker 1 的 ZooKeeper 负载报告。负载报告在 `/loadbalance/brokers/...` 中。

    **输入**

    ```bash
    get /loadbalance/brokers/broker-1:8080
    ```

    **输出**

    ```bash
    {"webServiceUrl":"http://broker-1:8080","pulsarServiceUrl":"pulsar://broker-1:6650","persistentTopicsEnabled":true,"nonPersistentTopicsEnabled":true,"cpu":{"usage":7.311714728372232,"limit":800.0},"memory":{"usage":124.0,"limit":2096.0},"directMemory":{"usage":36.0,"limit":256.0},"bandwidthIn":{"usage":0.8324254085661579,"limit":1.0E7},"bandwidthOut":{"usage":0.7155446715644209,"limit":1.0E7},"msgThroughputIn":0.0,"msgThroughputOut":0.0,"msgRateIn":0.0,"msgRateOut":0.0,"lastUpdate":1690979816792,"lastStats":{"my-tenant/my-namespace/0x4ccccccb_0x66666664":{"msgRateIn":0.0,"msgThroughputIn":0.0,"msgRateOut":0.0,"msgThroughputOut":0.0,"consumerCount":2,"producerCount":0,"topics":1,"cacheSize":0}},"numTopics":1,"numBundles":1,"numConsumers":2,"numProducers":0,"bundles":["my-tenant/my-namespace/0x4ccccccb_0x66666664"],"lastBundleGains":[],"lastBundleLosses":[],"brokerVersionString":"3.1.0-SNAPSHOT","protocols":{},"advertisedListeners":{"internal":{"brokerServiceUrl":"pulsar://broker-1:6650"}},"loadManagerClassName":"org.apache.pulsar.broker.loadbalance.impl.ModularLoadManagerImpl","startTimestamp":1690940955211,"maxResourceUsage":0.140625,"loadReportType":"LocalBrokerData"}
    ```

</TabItem>
<TabItem value="Extensible">

:::note

[可扩展负载管理器](./concepts-broker-load-balancing-types.md) 没有 ZooKeeper 负载报告，因为其内部统计信息存储在系统主题中而不是 ZooKeeper 中。

:::

您可以使用 [pulsar-client 工具](./reference-cli-tools.md)从系统主题检查负载报告。

**输入**

```bash
bin/pulsar-client consume non-persistent://pulsar/system/loadbalancer-broker-load-data --subscription-name test
```

**输出**

```bash
2023-08-03T06:21:48,841+0000 [pulsar-client-io-1-3] INFO  org.apache.pulsar.client.impl.ConnectionPool - [[id: 0x69a65535, L:/127.0.0.1:59086 - R:localhost/127.0.0.1:6650]] Connected to server
2023-08-03T06:21:48,926+0000 [pulsar-client-io-1-3] WARN  org.apache.pulsar.client.impl.ConsumerImpl - [non-persistent://pulsar/system/loadbalancer-broker-load-data] Cannot create a [Durable] subscription for a NonPersistentTopic, will use [NonDurable] to subscribe. Subscription name: test
2023-08-03T06:21:49,189+0000 [pulsar-client-io-1-3] INFO  org.apache.pulsar.client.impl.ConsumerStatsRecorderImpl - Starting Pulsar consumer status recorder with config: {"topicNames":["non-persistent://pulsar/system/loadbalancer-broker-load-data"],"topicsPattern":null,"subscriptionName":"test","subscriptionType":"Exclusive","subscriptionProperties":null,"subscriptionMode":"NonDurable","receiverQueueSize":1000,"acknowledgementsGroupTimeMicros":100000,"maxAcknowledgmentGroupSize":1000,"negativeAckRedeliveryDelayMicros":60000000,"maxTotalReceiverQueueSizeAcrossPartitions":50000,"consumerName":null,"ackTimeoutMillis":0,"tickDurationMillis":1000,"priorityLevel":0,"maxPendingChunkedMessage":10,"autoAckOldestChunkedMessageOnQueueFull":false,"expireTimeOfIncompleteChunkedMessageMillis":60000,"cryptoFailureAction":"FAIL","properties":{},"readCompacted":false,"subscriptionInitialPosition":"Latest","patternAutoDiscoveryPeriod":60,"regexSubscriptionMode":"PersistentOnly","deadLetterPolicy":null,"retryEnable":false,"autoUpdatePartitions":true,"autoUpdatePartitionsIntervalSeconds":60,"replicateSubscriptionState":false,"resetIncludeHead":false,"batchIndexAckEnabled":false,"ackReceiptEnabled":false,"poolMessages":true,"startPaused":false,"autoScaledReceiverQueueSizeEnabled":false,"topicConfigurations":[],"maxPendingChuckedMessage":10}
2023-08-03T06:21:49,214+0000 [pulsar-client-io-1-3] INFO  org.apache.pulsar.client.impl.ConsumerStatsRecorderImpl - Pulsar client config: {"serviceUrl":"pulsar://localhost:6650/","authPluginClassName":null,"authParams":null,"authParamMap":null,"operationTimeoutMs":30000,"lookupTimeoutMs":30000,"statsIntervalSeconds":60,"numIoThreads":8,"numListenerThreads":8,"connectionsPerBroker":1,"connectionMaxIdleSeconds":180,"useTcpNoDelay":true,"useTls":false,"tlsKeyFilePath":"","tlsCertificateFilePath":"","tlsTrustCertsFilePath":"","tlsAllowInsecureConnection":false,"tlsHostnameVerificationEnable":false,"concurrentLookupRequest":5000,"maxLookupRequest":50000,"maxLookupRedirects":20,"maxNumberOfRejectedRequestPerConnection":50,"keepAliveIntervalSeconds":30,"connectionTimeoutMs":10000,"requestTimeoutMs":60000,"readTimeoutMs":60000,"autoCertRefreshSeconds":300,"initialBackoffIntervalNanos":100000000,"maxBackoffIntervalNanos":60000000000,"enableBusyWait":false,"listenerName":null,"useKeyStoreTls":false,"sslProvider":null,"tlsKeyStoreType":"JKS","tlsKeyStorePath":"","tlsKeyStorePassword":"*****","tlsTrustStoreType":"JKS","tlsTrustStorePath":"","tlsTrustStorePassword":"*****","tlsCiphers":[],"tlsProtocols":[],"memoryLimitBytes":0,"proxyServiceUrl":null,"proxyProtocol":null,"enableTransaction":false,"dnsLookupBindAddress":null,"dnsLookupBindPort":0,"socks5ProxyAddress":null,"socks5ProxyUsername":null,"socks5ProxyPassword":null,"description":null}
2023-08-03T06:21:49,236+0000 [pulsar-client-io-1-5] INFO  org.apache.pulsar.client.impl.ConnectionPool - [[id: 0xbeee21f2, L:/172.31.0.4:44850 - R:broker-1/172.31.0.4:6650]] Connected to server
2023-08-03T06:21:49,241+0000 [pulsar-client-io-1-5] INFO  org.apache.pulsar.client.impl.ConsumerImpl - [non-persistent://pulsar/system/loadbalancer-broker-load-data][test] Subscribing to topic on cnx [id: 0xbeee21f2, L:/172.31.0.4:44850 - R:broker-1/172.31.0.4:6650], consumerId 0
2023-08-03T06:21:49,273+0000 [pulsar-client-io-1-5] INFO  org.apache.pulsar.client.impl.ConsumerImpl - [non-persistent://pulsar/system/loadbalancer-broker-load-data][test] Subscribed to topic on broker-1/172.31.0.4:6650 -- consumer: 0
----- got message -----
key:[broker-1:8080], properties:[], content:{"cpu":{"usage":14.397985201479854,"limit":800.0},"memory":{"usage":300.0,"limit":2096.0},"directMemory":{"usage":40.0,"limit":256.0},"bandwidthIn":{"usage":0.7817884878178855,"limit":1.0E7},"bandwidthOut":{"usage":0.7213945272139455,"limit":1.0E7},"msgThroughputIn":3.000538680274058,"msgThroughputOut":3.0005621893825616,"msgRateIn":0.03333931866971176,"msgRateOut":0.033339579882028465,"bundleCount":3,"topics":3,"maxResourceUsage":0.15625,"weightedMaxEMA":0.15625,"msgThroughputEMA":38.88925615962549,"updatedAt":1691043751060,"reportedAt":1691043631073}
```

</TabItem>

</Tabs>
````

#### 方法 2：检查 monitor-brokers 输出

您可以使用 [pulsar-perf 工具](reference-cli-tools.md)启动 Broker 监控器。

不同的负载管理器有不同的输出。此输出与[方法 1：检查 ZooKeeper 负载报告](#方法-1检查-zookeeper-负载报告)的输出相同，但它格式良好以便更好地阅读。

````mdx-code-block
<Tabs groupId="load-manager-report"
  defaultValue="Simple"
  values={[{"label":"Simple","value":"Simple"},{"label":"Modular","value":"Modular"},{"label":"Extensible","value":"Extensible"}]}>
<TabItem value="Simple">

**输入**

```bash
pulsar-perf monitor-brokers --connect-string <zookeeper host:port>
````

**输出**

```bash
===================================================================================================================
||COUNT          |TOPIC          |BUNDLE         |PRODUCER       |CONSUMER       |BUNDLE +       |BUNDLE -       ||
||               |4              |4              |0              |2              |0              |0              ||
||RAW SYSTEM     |CPU %          |MEMORY %       |DIRECT %       |BW IN %        |BW OUT %       |MAX %          ||
||               |0.25           |47.94          |0.01           |0.00           |0.00           |47.94          ||
||ALLOC SYSTEM   |CPU %          |MEMORY %       |DIRECT %       |BW IN %        |BW OUT %       |MAX %          ||
||               |0.20           |1.89           |               |1.27           |3.21           |3.21           ||
||RAW MSG        |MSG/S IN       |MSG/S OUT      |TOTAL          |KB/S IN        |KB/S OUT       |TOTAL          ||
||               |0.00           |0.00           |0.00           |0.01           |0.01           |0.01           ||
||ALLOC MSG      |MSG/S IN       |MSG/S OUT      |TOTAL          |KB/S IN        |KB/S OUT       |TOTAL          ||
||               |54.84          |134.48         |189.31         |126.54         |320.96         |447.50         ||
===================================================================================================================
```

</TabItem>
<TabItem value="Modular">

**输入**

```bash
pulsar-perf monitor-brokers --connect-string <zookeeper host:port>
````

**输出**

```bash
===================================================================================================================
||SYSTEM         |CPU %          |MEMORY %       |DIRECT %       |BW IN %        |BW OUT %       |MAX %          ||
||               |0.00           |48.33          |0.01           |0.00           |0.00           |48.33          ||
||COUNT          |TOPIC          |BUNDLE         |PRODUCER       |CONSUMER       |BUNDLE +       |BUNDLE -       ||
||               |4              |4              |0              |2              |4              |0              ||
||LATEST         |MSG/S IN       |MSG/S OUT      |TOTAL          |KB/S IN        |KB/S OUT       |TOTAL          ||
||               |0.00           |0.00           |0.00           |0.00           |0.00           |0.00           ||
||SHORT          |MSG/S IN       |MSG/S OUT      |TOTAL          |KB/S IN        |KB/S OUT       |TOTAL          ||
||               |0.00           |0.00           |0.00           |0.00           |0.00           |0.00           ||
||LONG           |MSG/S IN       |MSG/S OUT      |TOTAL          |KB/S IN        |KB/S OUT       |TOTAL          ||
||               |0.00           |0.00           |0.00           |0.00           |0.00           |0.00           ||
===================================================================================================================
```

</TabItem>
<TabItem value="Extensible">

**输入**

```bash
pulsar-perf monitor-brokers --connect-string pulsar://<host:port> --extensions
````

**输出**

```bash
===================================================================================================================
||SYSTEM         |CPU %          |MEMORY %       |DIRECT %       |BW IN %        |BW OUT %       |MAX %          ||
||               |17.24          |12.40          |26.95          |0.00           |0.00           |26.95          ||
||COUNT          |TOPIC          |BUNDLE         |PRODUCER       |CONSUMER       |BUNDLE +       |BUNDLE -       ||
||               |               |4              |               |               |               |               ||
||LATEST         |MSG/S IN       |MSG/S OUT      |TOTAL          |KB/S IN        |KB/S OUT       |TOTAL          ||
||               |100.02         |0.02           |100.03         |103.89         |0.01           |103.90         ||
===================================================================================================================
````

</TabItem>

</Tabs>