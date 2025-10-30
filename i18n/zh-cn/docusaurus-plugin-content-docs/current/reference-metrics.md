---
id: reference-metrics
title: Pulsar metrics
sidebar_label: "Metrics"
---



Pulsar 以 Prometheus 格式暴露以下指标。您可以使用这些指标监控集群。

- [](./reference-metrics.md)
  - [Pulsar Functions](#pulsar-functions)
  - [Connectors](#connectors)
  - [Proxy](#proxy)
  - [Pulsar transaction](#pulsar-transaction)

提供以下类型的指标：

- [Counter](https://prometheus.io/docs/concepts/metric_types/#counter)：一个累积指标，表示一个单调递增的计数器。默认情况下值会增加。您可以将值重置为零或重启集群。
- [Gauge](https://prometheus.io/docs/concepts/metric_types/#gauge)：一个表示可以任意上升和下降的单个数值的指标。
- [Histogram](https://prometheus.io/docs/concepts/metric_types/#histogram)：直方图对观察值（通常是请求持续时间或响应大小等）进行采样，并在可配置的桶中计数。`_bucket` 后缀是直方图桶内的观察值数量，使用参数 `{le="<upper inclusive bound>"}` 配置。`_count` 后缀是观察值数量，显示为时间序列并像计数器一样运行。`_sum` 后缀是观察值的总和，也显示为时间序列并像计数器一样运行。这些后缀在本文档中统称为 `_*`。
- [Summary](https://prometheus.io/docs/concepts/metric_types/#summary)：与直方图类似，摘要对观察值（通常是请求持续时间和响应大小等）进行采样。虽然它也提供观察值的总数和所有观察值的总和，但它在滑动时间窗口内计算可配置的分位数。

## ZooKeeper

ZooKeeper 指标在端口 `8000` 下的 "/metrics" 暴露。您可以通过在 `conf/zookeeper.conf` 中配置 `metricsProvider.httpPort` 来使用不同的端口。

ZooKeeper 自 3.6.0 起提供了新的指标系统。有关更详细的指标，请参阅 [ZooKeeper 监控指南](https://zookeeper.apache.org/doc/r3.7.0/zookeeperMonitor.html)。

## BookKeeper

BookKeeper 指标在端口 `8000` 下的 "/metrics" 暴露。您可以通过更新 `bookkeeper.conf` 配置文件中的 `prometheusStatsHttpPort` 来更改端口。

### 服务器指标

| 名称 | 类型 | 描述 |
|---|---|---|
| bookie_SERVER_STATUS | Gauge | Bookie 服务器的服务器状态。<br /><ul><li>1：bookie 以可写模式运行。</li><li>0：bookie 以只读模式运行。</li></ul> |
| bookkeeper_server_ADD_ENTRY_count | Counter | Bookie 接收的 ADD_ENTRY 请求总数。`success` 标签用于区分成功和失败。 |
| bookkeeper_server_READ_ENTRY_count | Counter | Bookie 接收的 READ_ENTRY 请求总数。`success` 标签用于区分成功和失败。 |
| bookie_WRITE_BYTES | Counter | 写入 Bookie 的字节总数。 |
| bookie_READ_BYTES | Counter | 从 Bookie 读取的字节总数。 |
| bookkeeper_server_ADD_ENTRY_REQUEST | Summary | Bookie 处理 ADD_ENTRY 请求的请求延迟摘要。`success` 标签用于区分成功和失败。 |
| bookkeeper_server_READ_ENTRY_REQUEST | Summary | Bookie 处理 READ_ENTRY 请求的请求延迟摘要。`success` 标签用于区分成功和失败。 |
| bookkeeper_server_BookieReadThreadPool_queue_\{thread_id\}|Gauge|读取线程队列中要处理的请求数量。|
| bookkeeper_server_BookieReadThreadPool_task_queued|Summary | 在读取线程队列中处理的任务的等待时间。 |
| bookkeeper_server_BookieReadThreadPool_task_execution|Summary | 读取线程队列中任务的执行时间。|

### Journal 指标

| 名称 | 类型 | 描述 |
|---|---|---|
| bookie_journal_JOURNAL_SYNC_count | Counter | Bookie 发生的 journal fsync 操作总数。`success` 标签用于区分成功和失败。 |
| bookie_journal_JOURNAL_QUEUE_SIZE | Gauge | journal 队列中待处理的请求数量。 |
| bookie_journal_JOURNAL_FORCE_WRITE_QUEUE_SIZE | Gauge | 强制写入（fsync）队列中待处理的强制写入请求数量。 |
| bookie_journal_JOURNAL_CB_QUEUE_SIZE | Gauge | 回调队列中待处理的回调数量。 |
| bookie_journal_JOURNAL_ADD_ENTRY | Summary | 向 journal 添加条目的请求延迟摘要。 |
| bookie_journal_JOURNAL_SYNC | Summary | 将数据同步到 journal 磁盘的 fsync 延迟摘要。 |
| bookie_journal_JOURNAL_CREATION_LATENCY| Summary | journal 日志文件创建的延迟。 |

### 存储指标

| 名称 | 类型 | 描述 |
|---|---|---|
| bookie_ledgers_count | Gauge | Bookie 中存储的 Ledger 总数。 |
| bookie_entries_count | Gauge | Bookie 中存储的 Entry 总数。 |
| bookie_write_cache_size | Gauge | Bookie 写入缓存大小（以字节为单位）。 |
| bookie_read_cache_size | Gauge | Bookie 读取缓存大小（以字节为单位）。 |
| bookie_DELETED_LEDGER_COUNT | Counter | 自 Bookie 启动以来删除的 Ledger 总数。 |
| bookie_ledger_writable_dirs | Gauge | Bookie 中可写目录的数量。 |
| bookie_flush | Gauge| Bookie 内存的表刷新延迟。 |
| bookie_throttled_write_requests | Counter | 要限流的写入请求数量。 |

### 复制指标

| 名称 | 类型 | 描述 |
|---|---|---|
| auditor_NUM_UNDER_REPLICATED_LEDGERS | Summary | 每次审计器运行时未充分复制的 Ledger 数量分布。 |
| auditor_UNDER_REPLICATED_LEDGERS_TOTAL_SIZE | Summary | 每次审计器运行时未充分复制的 Ledger 总大小分布。 |
| auditor_URL_PUBLISH_TIME_FOR_LOST_BOOKIE | Summary | 为丢失的 Bookie 发布未充分复制 Ledger 的延迟分布。 |
| auditor_BOOKIE_TO_LEDGERS_MAP_CREATION_TIME | Summary | 创建 bookies-to-ledgers 映射的延迟分布。 |
| auditor_CHECK_ALL_LEDGERS_TIME | Summary | 检查所有 Ledger 的延迟分布。 |
| auditor_PLACEMENT_POLICY_CHECK_TIME | Summary | placementPolicy 检查的延迟分布。 |
| auditor_REPLICAS_CHECK_TIME | Summary | 副本检查的延迟分布。 |
| auditor_AUDIT_BOOKIES_TIME | Summary | 审计所有 Bookie 的延迟分布。 |
| auditor_NUM_LEDGERS_CHECKED | Counter | 审计器检查的 Ledger 数量。 |
| auditor_NUM_FRAGMENTS_PER_LEDGER | Summary | 每个 Ledger 的片段数量分布。 |
| auditor_NUM_BOOKIES_PER_LEDGER | Summary | 每个 Ledger 的 Bookie 数量分布。 |
| auditor_NUM_BOOKIE_AUDITS_DELAYED | Counter | 延迟的 bookie-audit 数量。 |
| auditor_NUM_DELAYED_BOOKIE_AUDITS_DELAYES_CANCELLED | Counter | 取消的延迟 bookie-audit 数量。 |
| auditor_NUM_LEDGERS_NOT_ADHERING_TO_PLACEMENT_POLICY | Gauge | 在放置策略检查中发现的不遵循放置策略的 Ledger 数量。 |
| auditor_NUM_LEDGERS_SOFTLY_ADHERING_TO_PLACEMENT_POLICY | Gauge | 在放置策略检查中发现的软遵循放置策略的 Ledger 数量。 |
| auditor_NUM_UNDERREPLICATED_LEDGERS_ELAPSED_RECOVERY_GRACE_PERIOD | Gauge | 超过恢复宽限期的未充分复制 Ledger 数量。 |
| auditor_NUM_LEDGERS_HAVING_NO_REPLICA_OF_AN_ENTRY | Gauge | 具有所有副本都丢失的 Entry 的 Ledger 数量。 |
| auditor_NUM_LEDGERS_HAVING_LESS_THAN_AQ_REPLICAS_OF_AN_ENTRY | Gauge | 具有 Entry 副本数量少于 AQ 的 Ledger 数量，不包括计入 numLedgersHavingNoReplicaOfAnEntry 的 Ledger。 |
| auditor_NUM_LEDGERS_HAVING_LESS_THAN_WQ_REPLICAS_OF_AN_ENTRY | Gauge | 具有 Entry 副本数量少于 WQ 的 Ledger 数量，不包括计入 numLedgersHavingLessThanAQReplicasOfAnEntry 的 Ledger。 |
| election_attempts | Counter | 审计器选举尝试次数。 |
| replication_worker_NUM_BYTES_READ | Summary | 复制器读取的 Entry 大小分布。 |
| replication_worker_NUM_ENTRIES_READ | Counter | 复制器读取的 Entry 数量。 |

*注意：由于文件内容非常长，这里仅展示了文件的开头部分作为示例。完整的 metrics 文档包含更多详细的指标说明。*