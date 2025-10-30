---
id: deploy-bare-metal
title: 在裸机上部署集群
sidebar_label: "裸机"
description: 学习如何在裸机上部署 Pulsar 集群。
---

:::tip

1. 在大多数用例中，您可以使用单集群 Pulsar 安装，例如实验 Pulsar 或在初创公司或单个团队中使用 Pulsar。如果您需要运行多集群 Pulsar 实例，请参阅[指南](deploy-bare-metal-multi-cluster.md)。
2. 如果您想使用所有内置的 [Pulsar IO](io-overview.md) 连接器，您需要下载 `apache-pulsar-io-connectors` 包，并在每个 broker 节点上或每个 function-worker 节点上的 pulsar 目录下的 `connectors` 目录中安装 `apache-pulsar-io-connectors`（如果您为 [Pulsar Functions](functions-overview.md) 运行了单独的函数工作者集群）。
3. 如果您想在 Pulsar 部署中使用[分层存储](concepts-tiered-storage.md)功能，您需要下载 `apache-pulsar-offloaders` 包，并在每个 broker 节点上的 Pulsar 目录下的 `offloaders` 目录中安装 `apache-pulsar-offloaders`。有关如何配置此功能的更多详细信息，您可以参考[分层存储 cookbook](cookbooks-tiered-storage.md)。

:::

在裸机上部署 Pulsar 集群包括以下步骤。

## 准备工作

### 要求

目前，Pulsar 可用于 64 位 **macOS** 和 **Linux**。如果您想在 **Windows** 上运行 Pulsar，请参阅[在 Docker 中运行 Pulsar](getting-started-docker.md)。

另外，您需要安装适当的 64 位 JRE/JDK 版本。请参阅 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。

:::tip

您可以重用现有的 Zookeeper 集群。

:::

要在裸机上运行 Pulsar，推荐以下配置：

* 至少 6 台 Linux 机器或虚拟机
  * 3 台用于运行 [ZooKeeper](https://zookeeper.apache.org)
  * 3 台用于运行 Pulsar broker 和 [BookKeeper](https://bookkeeper.apache.org) bookie
* 覆盖所有 Pulsar broker 主机的单个 [DNS](https://en.wikipedia.org/wiki/Domain_Name_System) 名称（可选）

:::note

* Broker 仅在 64 位 JVM 上受支持。
* 如果您没有足够的机器，或者您想在集群模式下测试 Pulsar（并稍后扩展集群），您可以在一个节点上完全部署 Pulsar，在该节点上运行 ZooKeeper、bookie 和 broker。
* 如果您没有 DNS 服务器，可以在服务 URL 中使用多主机格式代替。
* 集群中的每台机器都需要安装推荐的 Java 版本（例如 [Java 17](https://adoptium.net/?variant=openjdk17)）。请根据您的目标 Pulsar 版本参阅 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。

:::

以下是一个显示基本设置的图表：

![Pulsar 集群的基本设置](/assets/pulsar-basic-setup.png)

在此图表中，连接客户端需要使用单个 URL 与 Pulsar 集群通信。在这种情况下，`pulsar-cluster.acme.com` 抽象了所有消息处理 brokers。Pulsar 消息 brokers 在与 BookKeeper bookies 相同的机器上运行；而 brokers 和 bookies 又依赖于 ZooKeeper。

### 硬件考虑

如果您部署 Pulsar 集群，在进行容量规划时请记住以下基本更好的选择。

##### ZooKeeper

对于运行 ZooKeeper 的机器，建议使用性能较弱的机器或虚拟机。Pulsar 仅将 ZooKeeper 用于定期的协调相关和配置相关任务，而不是基本操作。例如，如果您在 [Amazon Web Services](https://aws.amazon.com/) (AWS) 上运行 Pulsar，[t2.small](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/t2-instances.html) 实例可能就足够了。

##### Bookies 和 Brokers

对于运行 bookie 和 Pulsar broker 的机器，需要更强大的机器。例如，对于 AWS 部署，[i3.4xlarge](https://aws.amazon.com/blogs/aws/now-available-i3-instances-for-demanding-io-intensive-applications/) 实例可能是合适的。在这些机器上，您可以使用以下配置：

* 快速 CPU 和 10Gbps [NIC](https://en.wikipedia.org/wiki/Network_interface_controller)（用于 Pulsar brokers）
* 小型快速[固态硬盘](https://en.wikipedia.org/wiki/Solid-state_drive) (SSD) 或带有 [RAID](https://en.wikipedia.org/wiki/RAID) 控制器和电池备份写缓存的[硬盘驱动器](https://en.wikipedia.org/wiki/Hard_disk_drive) (HDD)（用于 BookKeeper bookies）

##### 硬件建议

要启动 Pulsar 实例，以下是最低和推荐的硬件设置。

一个集群由 3 个 broker 节点、3 个 bookie 节点和 3 个 ZooKeeper 节点组成。以下建议适用于一个节点。

- 最低硬件设置（**250 个 Pulsar topics**）

   组件 | CPU|内存|存储|吞吐量 |速率
   |---|---|---|---|---|---
   Broker|0.2|256 MB|/|写入吞吐量：3 MB/s<br /><br />读取吞吐量：6 MB/s<br /><br />|写入速率：350 条目/s<br /><br />读取速率：650 条目/s
   Bookie|0.2|256 MB|Journal：8 GB<br /><br />PD-SSDLedger：16 GB，PD-STANDARD|写入吞吐量：2 MB/s<br /><br />读取吞吐量：2 MB/s<br /><br />|写入速率：200 条目/s<br /><br />读取速率：200 条目/s
   ZooKeeper|0.05|256 MB|Log：8 GB，PD-SSD<br /><br />Data：2 GB，PD-STANDARD|/|/

- 推荐硬件设置（**1000 个 Pulsar topics**）

   组件 | CPU|内存|存储|吞吐量 |速率
   |---|---|---|---|---|---
   Broker|8|8 GB|/|写入吞吐量：100 MB/s<br /><br />读取吞吐量：200 MB/s<br /><br />|写入速率：10,000 条目/s<br /><br />读取速率：20,000 条目/s
   Bookie|4|8GB|Journal：256 GB<br /><br />PD-SSDLedger：2 TB，PD-STANDARD|写入吞吐量：75 MB/s<br /><br />读取吞吐量：75 MB/s<br /><br />|写入速率：7,500 条目/s<br /><br />读取速率：7,500 条目/s
   ZooKeeper|1|2 GB|Log：64 GB，PD-SSD<br /><br />Data：256 GB，PD-STANDARD|/|/

### 安装 Pulsar 二进制包

> 您需要在集群中的每台机器上安装 Pulsar 二进制包，包括运行 ZooKeeper 和 BookKeeper 的机器。

要开始在裸机上部署 Pulsar 集群，您需要通过以下方式之一下载二进制 tarball 发布包：

* 直接点击下面的链接，这会自动触发下载：
  * <a href="pulsar:binary_release_url" download>Pulsar @pulsar:version@ 二进制发布包</a>
* 从 Pulsar [下载页面](pulsar:download_page_url)
* 从 GitHub 上的 Pulsar [发布页面](https://github.com/apache/pulsar/releases/latest)
* 使用 [wget](https://www.gnu.org/software/wget)：

```bash
wget pulsar:binary_release_url
```

下载 tarball 后，解压缩它并 `cd` 进入生成的目录：

```bash
tar xvzf apache-pulsar-@pulsar:version@-bin.tar.gz
cd apache-pulsar-@pulsar:version@
```

解压缩的目录包含以下子目录：

目录 | 包含
:---------|:--------
`bin` |Pulsar 的[命令行工具](reference-cli-tools.md)，如 [`pulsar`](reference-cli-tools.md) 和 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)
`conf` | Pulsar 的配置文件，包括 [broker 配置](reference-configuration.md#broker)、[ZooKeeper 配置](reference-configuration.md#zookeeper) 等
`data` | ZooKeeper 和 BookKeeper 使用的数据存储目录
`lib` | Pulsar 使用的 [JAR](https://en.wikipedia.org/wiki/JAR_(file_format)) 文件
`logs` | 安装创建的日志

### 安装内置连接器（可选）

要使用 `内置` 连接器，您需要在每个 broker 节点上通过以下方式之一下载连接器 tarball 发布包：

* 点击下面的链接并从 Apache 镜像下载发布包：

  * <a href="pulsar:connector_release_url" download>Pulsar IO Connectors @pulsar:version@ 发布包</a>

* 从 Pulsar [下载页面](pulsar:download_page_url)
* 从 Pulsar [发布页面](https://github.com/apache/pulsar/releases/latest)
* 使用 [wget](https://www.gnu.org/software/wget)：

  ```shell
  wget pulsar:connector_release_url/{connector}-@pulsar:version@.nar
  ```

下载 .nar 文件后，将文件复制到 pulsar 目录中的 `connectors` 目录。
例如，如果您下载连接器文件 `pulsar-io-aerospike-@pulsar:version@.nar`：

```bash
mkdir connectors
mv pulsar-io-aerospike-@pulsar:version@.nar connectors

ls connectors
pulsar-io-aerospike-@pulsar:version@.nar
...
```

### 安装分层存储卸载器（可选）

要使用分层存储卸载器，您需要在每个 broker 节点上通过以下方式之一下载卸载器 tarball 发布包：

* 点击下面的链接并从 Apache 镜像下载发布包：

  * <a href="pulsar:offloader_release_url" download>Pulsar Tiered Storage Offloaders @pulsar:version@ 发布包</a>

* 从 Pulsar [下载页面](pulsar:download_page_url)
* 从 Pulsar [发布页面](https://github.com/apache/pulsar/releases/latest)
* 使用 [wget](https://www.gnu.org/software/wget)：

  ```shell
  wget pulsar:offloader_release_url
  ```

下载 tarball 后，在 Pulsar 目录中，解压缩卸载器包，并将卸载器复制为 Pulsar 目录中的 `offloaders`：

```bash
tar xvfz apache-pulsar-offloaders-@pulsar:version@-bin.tar.gz

# 您可以在 pulsar 目录中找到名为 `apache-pulsar-offloaders-@pulsar:version@` 的目录
# 然后复制卸载器

mv apache-pulsar-offloaders-@pulsar:version@/offloaders offloaders

ls offloaders
tiered-storage-jcloud-@pulsar:version@.nar
```

有关如何配置分层存储功能的更多详细信息，您可以参考[分层存储 cookbook](cookbooks-tiered-storage.md)


## 步骤 1：部署 ZooKeeper 集群

:::note

如果您已经有现有的 zookeeper 集群并想使用它，可以跳过此部分。

:::

[ZooKeeper](https://zookeeper.apache.org) 为 Pulsar 管理各种基本的协调相关和配置相关任务。要部署 Pulsar 集群，您需要先部署 ZooKeeper。3 节点 ZooKeeper 集群是推荐的配置。Pulsar 不会大量使用 ZooKeeper，因此轻量级机器或虚拟机应该足以运行 ZooKeeper。

首先，将所有 ZooKeeper 服务器添加到 [`conf/zookeeper.conf`](reference-configuration.md#zookeeper) 中指定的配置（在您[上面](#install-the-pulsar-binary-package)创建的 Pulsar 目录中）。以下是一个示例：

```properties
server.1=zk1.us-west.example.com:2888:3888
server.2=zk2.us-west.example.com:2888:3888
server.3=zk3.us-west.example.com:2888:3888
```

> 如果您只有一台机器来部署 Pulsar，您只需要在配置文件中添加一个服务器条目。

> 如果您的机器在 NAT 后面，使用 0.0.0.0 作为本地地址的服务器条目。如果节点在 NAT 后面在配置中使用外部 IP 配置自身，zookeper 服务将无法启动，因为它尝试在 linux 机器不拥有的外部 ip 上放置监听器。使用 0.0.0.0 在所有 ip 上启动监听器，以便 NAT 网络流量可以到达它。

_server.3_ 上的配置示例

```properties
server.1=zk1.us-west.example.com:2888:3888
server.2=zk2.us-west.example.com:2888:3888
server.3=0.0.0.0:2888:3888
```

在每个主机上，您需要在 `myid` 文件中指定节点的 ID，该文件默认在每个服务器的 `data/zookeeper` 文件夹中（您可以通过 [`dataDir`](reference-configuration.md#zookeeper-dataDir) 参数更改文件位置）。

> 有关 `myid` 和更多详细信息，请参阅 ZooKeeper 文档中的[多服务器设置指南](https://zookeeper.apache.org/doc/r3.4.10/zookeeperAdmin.html#sc_zkMulitServerSetup)。

例如，在像 `zk1.us-west.example.com` 这样的 ZooKeeper 服务器上，您可以按如下方式设置 `myid` 值：

```bash
mkdir -p data/zookeeper
echo 1 > data/zookeeper/myid
```

在 `zk2.us-west.example.com` 上，命令是 `echo 2 > data/zookeeper/myid`，以此类推。

一旦您将每个服务器添加到 `zookeeper.conf` 配置中并具有适当的 `myid` 条目，您就可以在所有主机上使用 [`pulsar-daemon`](reference-cli-tools.md) CLI 工具启动 ZooKeeper（在后台，使用 nohup）：

```bash
bin/pulsar-daemon start zookeeper
```

> 如果您计划在同一节点上部署 Zookeeper 和 Bookie，您需要通过在 zookeeper.conf 中配置 `metricsProvider.httpPort` 来使用不同的统计端口启动 zookeeper。

## 步骤 2：初始化集群元数据

:::note

当配置新集群时，您需要在元数据存储（例如，ZooKeeper）上初始化集群元数据。您只需要初始化它**一次**。

:::


您可以使用 [`pulsar`](reference-cli-tools.md) CLI 工具的 [`initialize-cluster-metadata`](reference-cli-tools.md) 命令初始化这些元数据。此命令可以在您的 Pulsar 集群中的任何机器上运行，因此可以从 ZooKeeper、broker 或 bookie 机器初始化元数据。以下是一个示例：

```shell
bin/pulsar initialize-cluster-metadata \
    --cluster pulsar-cluster-1 \
    --metadata-store zk:zk1.us-west.example.com:2181,zk2.us-west.example.com:2181 \
    --configuration-metadata-store zk:zk1.us-west.example.com:2181,zk2.us-west.example.com:2181 \
    --web-service-url http://pulsar.us-west.example.com:8080 \
    --web-service-url-tls https://pulsar.us-west.example.com:8443 \
    --broker-service-url pulsar://pulsar.us-west.example.com:6650 \
    --broker-service-url-tls pulsar+ssl://pulsar.us-west.example.com:6651
```

从上面的示例中可以看到，您需要指定以下配置。带 * 的项目是**必需**的标志。

标志 | 描述
:----|:-----------
`--cluster`* | 集群的名称
`--metadata-store`* | 集群的"本地"元数据存储连接字符串。此连接字符串只需要包括 ZooKeeper 集群中的*一个*机器。
`--configuration-metadata-store`* | 整个实例的配置元数据存储连接字符串。与 `--metadata-store` 标志一样，此连接字符串只需要包括 ZooKeeper 集群中的*一个*机器。
`--web-service-url`* | 集群的 Web 服务 URL 加上端口。此 URL 应该是标准 DNS 名称。默认端口是 8080（您最好不要使用不同的端口）。
`--web-service-url-tls` | 如果您使用 [TLS](security-tls-transport.md)，您还需要为集群指定 TLS Web 服务 URL。默认端口是 8443（您最好不要使用不同的端口）。
`--broker-service-url`* | enable 与集群中 brokers 交互的 broker 服务 URL。此 URL 不应使用与 Web 服务 URL 相同的 DNS 名称，而应使用 `pulsar` 方案。默认端口是 6650（您最好不要使用不同的端口）。
`--broker-service-url-tls` | 如果您使用 [TLS](security-tls-transport.md)，您还需要为集群指定 TLS Web 服务 URL 以及为集群中的 brokers 指定 TLS broker 服务 URL。默认端口是 6651（您最好不要使用不同的端口）。

:::note

如果您没有 DNS 服务器，可以在服务 URL 中使用多主机格式，设置如下：

```shell
--web-service-url http://host1:8080,host2:8080,host3:8080 \
--web-service-url-tls https://host1:8443,host2:8443,host3:8443 \
--broker-service-url pulsar://host1:6650,host2:6650,host3:6650 \
--broker-service-url-tls pulsar+ssl://host1:6651,host2:6651,host3:6651
```

如果您想使用现有的 BookKeeper 集群，可以添加 `--existing-bk-metadata-service-uri` 标志，如下所示：

```shell
--existing-bk-metadata-service-uri "zk+null://zk1:2181;zk2:2181/ledgers" \
--web-service-url http://host1:8080,host2:8080,host3:8080 \
--web-service-url-tls https://host1:8443,host2:8443,host3:8443 \
--broker-service-url pulsar://host1:6650,host2:6650,host3:6650 \
--broker-service-url-tls pulsar+ssl://host1:6651,host2:6651,host3:6651
```

您可以使用 `bin/bookkeeper shell whatisinstanceid` 命令获取现有 BookKeeper 集群的元数据服务 URI。由于多个元数据服务 URI 用分号分隔，您必须将值用双引号括起来。

:::

## 步骤 3：部署 BookKeeper 集群

[BookKeeper](https://bookkeeper.apache.org) 处理 Pulsar 中的所有持久数据存储。您需要部署 BookKeeper bookies 集群来使用 Pulsar。您可以选择运行 **3-bookie BookKeeper 集群**。

您可以使用 [`conf/bookkeeper.conf`](reference-configuration.md#bookkeeper) 配置文件配置 BookKeeper bookies。为我们的目的配置 bookies 的最重要步骤是确保将 `metadataServiceUri` 设置为 ZooKeeper 集群的 URI。以下是一个示例：

```properties
metadataServiceUri=zk://zk1.us-west.example.com:2181;zk2.us-west.example.com:2181;zk3.us-west.example.com:2181/ledgers
```

这在 `metadataServiceUri` 中使用 `;` 作为分隔符

:::

一旦您适当地修改了 `metadataServiceUri` 参数，您就可以进行任何其他需要的配置更改。您可以[在此处](reference-configuration.md#bookkeeper) 找到可用 BookKeeper 配置参数的完整列表。但是，查阅 [BookKeeper 文档](https://bookkeeper.apache.org/docs/next/reference/config/) 以获取更深入的指南可能是更好的选择。

一旦您在 `conf/bookkeeper.conf` 中应用了所需的配置，您就可以在每个 BookKeeper 主机上启动一个 bookie。您可以在后台或前台启动每个 bookie。

要在后台启动 bookie，请使用 [`pulsar-daemon`](reference-cli-tools.md) CLI 工具：

```bash
bin/pulsar-daemon start bookie
```

要在前台启动 bookie：

```bash
bin/pulsar bookie
```

您可以通过在 [BookKeeper shell](reference-cli-tools.md) 上运行 `bookiesanity` 命令来验证 bookie 是否正常工作：

```bash
bin/bookkeeper shell bookiesanity
```

此命令在本地 bookie 上创建一个临时的 BookKeeper ledger，写入几个条目，读取它们，最后删除该 ledger。

启动所有 bookies 后，您可以在任何 bookie 节点上使用 [BookKeeper shell](reference-cli-tools.md) 的 `simpletest` 命令，以验证集群中的所有 bookies 都在运行。

```bash
bin/bookkeeper shell simpletest --ensemble <num-bookies> --writeQuorum <num-bookies> --ackQuorum <num-bookies> --numEntries <num-entries>
```

此命令在集群上创建一个 `num-bookies` 大小的 ledger，写入几个条目，最后删除该 ledger。


## 步骤 4：部署 Pulsar brokers

Pulsar brokers 是您需要在 Pulsar 集群中部署的最后东西。Brokers 处理 Pulsar 消息并提供 Pulsar 的管理接口。一个好的选择是运行 **3 个 brokers**，每个已经运行 BookKeeper bookie 的机器一个。

### 配置 Brokers

您可以使用 `conf/broker.conf` 配置文件配置 brokers。broker 配置的最重要的元素是确保每个 broker 都知道您已部署的 ZooKeeper 集群。确保 [`metadataStoreUrl`](reference-configuration.md#broker) 和 [`configurationMetadataStoreUrl`](reference-configuration.md#broker) 参数是正确的。在这种情况下，由于您只有 1 个集群且没有设置配置存储，`configurationMetadataStoreUrl` 指向相同的 `metadataStoreUrl`。

```properties
metadataStoreUrl=zk:zk1.us-west.example.com:2181,zk2.us-west.example.com:2181,zk3.us-west.example.com:2181
configurationMetadataStoreUrl=zk:zk1.us-west.example.com:2181,zk2.us-west.example.com:2181,zk3.us-west.example.com:2181
```

您还需要指定集群名称（与您[初始化集群元数据](#initialize-cluster-metadata)时提供的名称匹配）：

```properties
clusterName=pulsar-cluster-1
```

此外，您需要匹配初始化集群元数据时提供的 broker 和 Web 服务端口（特别是当您使用与默认不同的端口时）：

```properties
brokerServicePort=6650
brokerServicePortTls=6651
webServicePort=8080
webServicePortTls=8443
```

> 如果您在单节点集群中部署 Pulsar，应该将 `conf/broker.conf` 中的复制设置更新为 `1`。
>
> ```properties
> # 创建 ledger 时要使用的 bookie 数量
> managedLedgerDefaultEnsembleSize=1
>
> # 为每条消息存储的副本数量
> managedLedgerDefaultWriteQuorum=1
>
> # 保证副本数量（写入完成前等待的确认）
> managedLedgerDefaultAckQuorum=1
> ```


### 启用 Pulsar Functions（可选）

如果您想启用 [Pulsar Functions](functions-overview.md)，您可以按照以下说明操作：

1. 编辑 `conf/broker.conf` 通过将 `functionsWorkerEnabled` 设置为 `true` 来启用 functions worker。

   ```conf
   functionsWorkerEnabled=true
   ```

2. 编辑 `conf/functions_worker.yml` 并将 `pulsarFunctionsCluster` 设置为您在[初始化集群元数据](#initialize-cluster-metadata)时提供的集群名称。

   ```conf
   pulsarFunctionsCluster: pulsar-cluster-1
   ```

如果您想了解更多关于部署 functions worker 的选项，请查看[部署和管理 functions worker](functions-worker.md)。

### 启动 Brokers

然后您可以在 [`conf/broker.conf`](reference-configuration.md#broker) 文件中提供任何其他您想要的配置更改。一旦您决定了配置，就可以为您的 Pulsar 集群启动 brokers。像 ZooKeeper 和 BookKeeper 一样，您可以在前台或后台启动 brokers，使用 nohup。

您可以使用 [`pulsar broker`](reference-cli-tools.md) 命令在前台启动 broker：

```bash
bin/pulsar broker
```

您可以使用 [`pulsar-daemon`](reference-cli-tools.md) CLI 工具在后台启动 broker：

```bash
bin/pulsar-daemon start broker
```

一旦您成功启动了所有您打算使用的 brokers，您的 Pulsar 集群应该就准备好了！

## 连接到运行的集群

一旦您的 Pulsar 集群启动并运行，您应该能够使用 Pulsar 客户端连接它。其中一个客户端是 [`pulsar-client`](reference-cli-tools.md) 工具，它包含在 Pulsar 二进制包中。`pulsar-client` 工具可以向 Pulsar topics 发布消息和从 Pulsar topics 消费消息，从而提供一种简单的方法来确保您的集群正常运行。

要使用 `pulsar-client` 工具，首先修改二进制包中的 [`conf/client.conf`](reference-configuration.md#client) 中的客户端配置文件。您需要更改 `webServiceUrl` 和 `brokerServiceUrl` 的值，将 `localhost`（默认值）替换为您分配给您的 broker/bookie 主机的 DNS 名称。以下是一个示例：

```properties
webServiceUrl=http://us-west.example.com:8080
brokerServiceurl=pulsar://us-west.example.com:6650
```

:::note

如果您没有 DNS 服务器，可以在服务 URL 中指定多主机，如下所示：
```properties
webServiceUrl=http://host1:8080,host2:8080,host3:8080
brokerServiceurl=pulsar://host1:6650,host2:6650,host3:6650
```

:::

完成后，您可以向 Pulsar topic 发布消息：

```bash
bin/pulsar-client produce \
    persistent://public/default/test \
    -n 1 \
    -m "Hello Pulsar"
```

此命令向 Pulsar topic 发布单条消息。此外，您可以在发布消息之前在不同的终端中订阅 Pulsar topic，如下所示：

```bash
bin/pulsar-client consume \
    persistent://public/default/test \
    -n 100 \
    -s "consumer-test" \
    -t "Exclusive"
```

一旦您成功向 topic 发布上述消息，您应该会在标准输出中看到它：

```
----- got message -----
key:[null], properties:[], content:Hello Pulsar
```

## 运行 Functions

> 如果您已经[启用](#enable-pulsar-functions-optional)了 Pulsar Functions，您现在可以试用 Pulsar Functions。

创建一个 ExclamationFunction `exclamation`。

```bash
bin/pulsar-admin functions create \
    --jar $PWD/examples/api-examples.jar \
    --classname org.apache.pulsar.functions.api.examples.ExclamationFunction \
    --inputs persistent://public/default/exclamation-input \
    --output persistent://public/default/exclamation-output \
    --tenant public \
    --namespace default \
    --name exclamation
```

通过[触发](functions-deploy-trigger.md)函数来检查函数是否按预期运行。

```bash
bin/pulsar-admin functions trigger --name exclamation --trigger-value "hello world"
```

您应该看到以下输出：

```shell
hello world!
```