---
id: deploy-monitoring
title: 监控
sidebar_label: "监控"
---

您可以使用不同的方式来监控 Pulsar 集群，这些方式可以暴露与 Topic 使用情况相关的指标以及集群各个组件的整体健康状况。

## 收集指标

您可以收集 Broker 统计信息、ZooKeeper 统计信息和 BookKeeper 统计信息。

### Broker 统计信息

您可以从 Broker 收集 Pulsar Broker 指标，并以 JSON 格式导出这些指标。Pulsar Broker 指标主要有两种类型：

* *目标转储*，包含每个 Topic 的统计信息。您可以使用以下命令获取目标转储：

  ```shell
  bin/pulsar-admin broker-stats destinations
  ```

* Broker 指标，包含 Broker 信息和在命名空间级别聚合的 Topic 统计信息。您可以使用以下命令获取 Broker 指标：

  ```shell
  bin/pulsar-admin broker-stats monitoring-metrics
  ```

所有消息速率每分钟更新一次。

聚合的 Broker 指标也会以 [Prometheus](https://prometheus.io) 格式暴露在以下地址：

```shell
http://$BROKER_ADDRESS:8080/metrics/
```

### ZooKeeper 统计信息

Pulsar 附带的本地 ZooKeeper、配置存储服务器和客户端可以通过 Prometheus 暴露详细的统计信息。

```shell
http://$LOCAL_ZK_SERVER:8000/metrics
http://$GLOBAL_ZK_SERVER:8001/metrics
```

本地 ZooKeeper 的默认端口是 `8000`，配置存储的默认端口是 `8001`。您可以通过在 `conf/zookeeper.conf` 文件中配置 `metricsProvider.httpPort` 来使用不同的统计端口。

### BookKeeper 统计信息

您可以通过修改 `conf/bookkeeper.conf` 文件中的 `statsProviderClass` 来为 BookKeeper 配置统计框架。

默认的 BookKeeper 配置启用了 Prometheus 导出器。该配置包含在 Pulsar 发行版中。

```shell
http://$BOOKIE_ADDRESS:8000/metrics
```

Bookie 的默认端口是 `8000`。您可以通过在 `conf/bookkeeper.conf` 文件中配置 `prometheusStatsHttpPort` 来更改端口。

### 托管游标确认状态
确认状态首先持久化到 Ledger。当确认状态无法持久化到 Ledger 时，会持久化到 ZooKeeper。要跟踪确认的统计信息，您可以为托管游标配置指标。

```
pulsar_ml_cursor_persistLedgerSucceed(namespace=", ledger_name="", cursor_name:")
pulsar_ml_cursor_persistLedgerErrors(namespace="", ledger_name="", cursor_name:"")
pulsar_ml_cursor_persistZookeeperSucceed(namespace="", ledger_name="", cursor_name:"")
pulsar_ml_cursor_persistZookeeperErrors(namespace="", ledger_name="", cursor_name:"")
pulsar_ml_cursor_nonContiguousDeletedMessagesRange(namespace="", ledger_name="", cursor_name:"")
```

这些指标已添加到 Prometheus 接口中，您可以在 Grafana 中监控和检查指标统计。

### 函数和连接器统计信息

您可以从 `functions-worker` 收集函数工作器统计信息，并以 JSON 格式导出指标，这些指标包含函数工作器 JVM 指标。

```shell
pulsar-admin functions-worker monitoring-metrics
```

您可以从 `functions-worker` 收集函数和连接器指标，并以 JSON 格式导出。

```shell
pulsar-admin functions-worker function-stats
```

聚合的函数和连接器指标可以按以下方式以 Prometheus 格式暴露。您可以从 `functions_worker.yml` 文件中获取 [`FUNCTIONS_WORKER_ADDRESS`](/functions-worker.md) 和 `WORKER_PORT`。

```shell
http://$FUNCTIONS_WORKER_ADDRESS:$WORKER_PORT/metrics:
```

## 配置 Prometheus

您可以使用 Prometheus 收集为 Pulsar 组件暴露的所有指标，并设置 [Grafana](https://grafana.com/) 仪表板来显示指标并监控您的 Pulsar 集群。详情请参考 [Prometheus 指南](https://prometheus.io/docs/introduction/getting_started/)。

当您在裸机上运行 Pulsar 时，可以提供要探测的节点列表。当您在 Kubernetes 集群中部署 Pulsar 时，监控会自动设置。详情请参考 [Kubernetes 说明](helm-deploy.md)。

## 仪表板

当您收集时间序列统计信息时，主要问题是确保附加到数据的维度数量不会爆炸性增长。因此，您只需要收集在命名空间级别聚合的指标时间序列。

### Pulsar 每个 Topic 的仪表板

每个 Topic 的仪表板说明可在 [Pulsar 管理器](administration-pulsar-manager.md) 中找到。

### Grafana

您可以使用 Grafana 创建由存储在 Prometheus 中的数据驱动的仪表板。

当您使用 Pulsar Helm Chart 在 Kubernetes 上部署 Pulsar 时，默认启用 `pulsar-grafana` Docker 镜像。您可以使用带有主要仪表板的 Docker 镜像。

以下是一些 Grafana 仪表板示例：

- [pulsar-grafana](deploy-monitoring.md#grafana)：一个 Grafana 仪表板，显示为在 Kubernetes 上运行的 Pulsar 集群收集的 Prometheus 中的指标。
- [apache-pulsar-grafana-dashboard](https://github.com/streamnative/apache-pulsar-grafana-dashboard)：一组 Grafana 仪表板模板，适用于在 Kubernetes 和本地机器上运行的不同 Pulsar 组件。

## 告警规则
您可以根据您的 Pulsar 环境设置告警规则。要为 Apache Pulsar 配置告警规则，请参考 [告警规则](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)。

## OpenTelemetry

### 状态
Pulsar 从 3.3.0 版本开始发射 OpenTelemetry 指标。OpenTelemetry 日志和追踪信号未被 Pulsar 暴露。
OpenTelemetry 支持目前是**实验性的**，是对预先存在的 Prometheus 指标系统的补充，
目标是最终替换它。它暴露的指标在语义上等同于 Prometheus 指标。

有关 Pulsar 暴露的 OpenTelemetry 指标的详细列表，请参考 [OpenTelemetry 指标](reference-metrics-opentelemetry.md)。

### 范围
Pulsar OpenTelemetry 指标正在逐步添加，目前仅针对 Broker。对代理和函数工作器的支持计划在未来的版本中提供。

### OpenTelemetry 配置
Pulsar 通过手动检测原生支持 OpenTelemetry，而不是依赖 OpenTelemetry 自动检测代理。
Pulsar 使用 OpenTelemetry 的自动配置[扩展](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md)
来管理 SDK 配置。该扩展允许从环境变量和 Java 系统属性输入参数。
以下说明依赖于环境变量，但也可以调整为使用系统属性。
这些变量必须通过相应的部署方法暴露给 Pulsar 进程。

请注意，实验性的[基于文件的配置](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#file-configuration)
目前不被 Pulsar 支持。

#### 遥测启用
实验性的 OpenTelemetry 功能在 Pulsar 中默认明确禁用。设置环境变量
`OTEL_SDK_DISABLED=false` 来启用 SDK。禁用时，指标将不会被收集或导出。

#### 导出器配置

使用原生 OpenTelemetry 协议和 Prometheus 的导出器默认包含在 Pulsar 发行版程序集中，
可以开箱即用。目前不支持其他导出器。

##### OTLP

原生 OTLP 导出器是从 Pulsar 获取指标的推荐方式，因为 Apache Pulsar 社区正在致力于修改它（而不是 Prometheus）以实现高性能。
除非被环境变量 `OTEL_METRICS_EXPORTER` 覆盖，Pulsar 默认使用 OTLP 导出器。

要使用该导出器，将环境变量 `OTEL_EXPORTER_OTLP_ENDPOINT` 设置为相应的 URL 端点。
这应该代表 OpenTelemetry [收集器](https://opentelemetry.io/docs/collector/)的位置。
Pulsar 支持 gRPC 和 HTTP 端点。

导出器定期收集和发送指标。此过程默认每 60 秒发生一次，可以通过更改环境变量 `OTEL_METRIC_EXPORT_INTERVAL` 来控制。

可以配置的其他参数，如身份验证、压缩和超时，在导出器[文档](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#otlp-exporter-span-metric-and-log-exporters)中描述。

###### 远程收集器注意事项

如果远程 OTLP 收集器将数据下游发送到 Prometheus 或类似 Prometheus 的系统，建议将 OpenTelemetry 资源属性 `pulsar.cluster` 复制到每个时间序列（指标）的 Prometheus 标签。
这可以使用[收集器转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)来完成。

下面的示例利用[OpenTelemetry 转换语言](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl)
和[转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)
来实现这一点。

```
metrics:
  set(attributes["pulsar_cluster"], resource.attributes["pulsar.cluster"])
```

##### Prometheus

Pulsar 支持以 Prometheus 格式导出 OpenTelemetry 指标。此导出器是基于拉取的，通过在本地 Pulsar 进程中打开服务器来运行。
要使用它，设置 `OTEL_METRICS_EXPORTER=prometheus` 并使用以下环境变量配置 Prometheus 监听器详细信息：

```shell
OTEL_EXPORTER_PROMETHEUS_HOST
OTEL_EXPORTER_PROMETHEUS_PORT
```

此端点必须可被远程 Prometheus 抓取服务器访问。请注意，此导出器比 OTLP 导出器资源效率低。

所有 OpenTelemetry 资源属性都会自动复制到每个时间序列的 Prometheus 标签。

有关进一步的配置详细信息，请参考导出器[文档](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#prometheus-exporter)。

#### 资源属性配置

Pulsar 自动设置以下资源属性：

| 属性             | 描述                                                                           |
|-------------------|-----------------------------------------------------------------------------------|
| `pulsar.cluster`  | Pulsar 集群的名称。                                                   |
| `service.name`    | Pulsar 服务的名称。对于 Broker，默认为 `pulsar-broker`。 |
| `service.version` | Pulsar 服务的版本。                                                |

这些属性中的任何一个都可以通过环境变量 `OTEL_RESOURCE_ATTRIBUTES` 覆盖。也可以添加额外的属性。例如：

```shell
OTEL_RESOURCE_ATTRIBUTES=pulsar.cluster=my-cluster,service.name=my-broker,service.version=1.0.0,custom.attr=custom-value
```

有关配置资源属性的更多详细信息，请参考 SDK [文档](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure#opentelemetry-resource-attributes)。

额外的运行时资源属性，如主机名、进程 ID 或操作系统，由 SDK 使用资源提供程序自动推断。
有关这些属性的描述，请参考相应的[文档](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)。
有关资源提供程序配置的更多详细信息可通过[文档](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure#resource-provider-spi)获取。

#### 属性基数配置

OpenTelemetry 提供了一种实验机制来控制属性的最大基数。这对于限制导出器的资源使用很有用。
Pulsar 默认将值设置为 10000 个属性。对于拥有大量 Topic 的 Broker，这可能证明是不够的。
该值由环境变量 `OTEL_EXPERIMENTAL_METRICS_CARDINALITY_LIMIT` 控制。

#### 内存重用配置

OpenTelemetry 提供了一种实验机制来控制指标属性的重用。这对于具有高基数指标的系统特别有用，因为它减少了收集器运行导致的内存分配次数。
该机制在 Pulsar 中默认启用，可以通过环境变量 `OTEL_JAVA_EXPERIMENTAL_EXPORTER_MEMORY_MODE` 覆盖。
有关更多详细信息和有效配置值，请参考导出器配置[文档](https://opentelemetry.io/docs/languages/java/configuration/#exporters)。