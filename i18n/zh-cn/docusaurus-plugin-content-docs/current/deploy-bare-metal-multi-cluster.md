---
id: deploy-bare-metal-multi-cluster
title: 在裸机上部署多集群
sidebar_label: "裸机多集群"
description: 学习如何在裸机上部署多集群 Pulsar 实例。
---

:::tip

1. 在大多数用例中，您可以使用单集群 Pulsar 安装，例如实验 Pulsar 或在初创公司或单个团队中使用 Pulsar。如果您需要运行多集群 Pulsar 实例，请参阅[指南](deploy-bare-metal-multi-cluster.md)。
2. 如果您想使用所有内置的 [Pulsar IO](io-overview.md) 连接器，您需要下载 `apache-pulsar-io-connectors` 包，并在每个 broker 节点上或每个 function-worker 节点上的 pulsar 目录下的 `connectors` 目录中安装 `apache-pulsar-io-connectors`（如果您为 [Pulsar Functions](functions-overview.md) 运行了单独的函数工作者集群）。
3. 如果您想在 Pulsar 部署中使用[分层存储](concepts-tiered-storage.md)功能，您需要下载 `apache-pulsar-offloaders` 包，并在每个 broker 节点上的 Pulsar 目录下的 `offloaders` 目录中安装 `apache-pulsar-offloaders`。有关如何配置此功能的更多详细信息，您可以参考[分层存储 cookbook](cookbooks-tiered-storage.md)。

:::

一个 Pulsar 实例由多个协同工作的 Pulsar 集群组成。您可以将集群分布在数据中心或地理区域，并使用[跨地域复制](administration-geo.md)在集群之间进行复制。

> #### 在本地或 Kubernetes 上运行 Pulsar？
> 本指南向您展示如何在非 Kubernetes 环境中以生产方式部署 Pulsar。如果您想在单台机器上运行独立的 Pulsar 集群用于开发目的，请参阅[设置本地集群](getting-started-standalone.md)指南。如果您想在 [Kubernetes](https://kubernetes.io) 上运行 Pulsar，请参阅 [Pulsar on Kubernetes](deploy-kubernetes.md)指南，其中包括在 Kubernetes、在 Google Kubernetes Engine 和在 Amazon Web Services 上运行 Pulsar 的部分。

在裸机上部署多集群 Pulsar 实例包括以下步骤。

## 系统要求

目前，Pulsar 可用于 64 位 **macOS** 和 **Linux**。如果您想在 **Windows** 上运行 Pulsar，请参阅[在 Docker 中运行 Pulsar](getting-started-docker.md)。

另外，您需要安装适当的 64 位 JRE/JDK 版本。请参阅 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。

## 安装 Pulsar

要开始运行 Pulsar，请通过以下方式之一下载二进制 tarball 发布包：

* 点击下面的链接并从 Apache 镜像下载发布包：

  * <a href="pulsar:binary_release_url" download>Pulsar @pulsar:version@ 二进制发布包</a>

* 从 Pulsar [下载页面](pulsar:download_page_url)
* 从 Pulsar [发布页面](https://github.com/apache/pulsar/releases/latest)
* 使用 [wget](https://www.gnu.org/software/wget)：

  ```shell
  wget 'https://www.apache.org/dyn/mirrors/mirrors.cgi?action=download&filename=pulsar/pulsar-@pulsar:version@/apache-pulsar-@pulsar:version@-bin.tar.gz' -O apache-pulsar-@pulsar:version@-bin.tar.gz
  ```

下载 tarball 后，解压缩它并 `cd` 进入生成的目录：

```bash
tar xvfz apache-pulsar-@pulsar:version@-bin.tar.gz
cd apache-pulsar-@pulsar:version@
```

Pulsar 二进制包最初包含以下目录：

目录 | 包含
:---------|:--------
`bin` | Pulsar 的[命令行工具](reference-cli-tools.md)，如 [`pulsar`](reference-cli-tools.md) 和 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)
`conf` | Pulsar 的配置文件，包括 [broker 配置](reference-configuration.md#broker)、[ZooKeeper 配置](reference-configuration.md#zookeeper) 等
`examples` | 包含示例 [Pulsar Functions](functions-overview.md) 的 Java JAR 文件
`lib` | Pulsar 使用的 [JAR](https://en.wikipedia.org/wiki/JAR_(file_format)) 文件
`licenses` | Pulsar 代码库各种组件的许可证文件，格式为 `.txt`

一旦您开始运行 Pulsar，就会创建以下目录：

目录 | 包含
:---------|:--------
`data` | ZooKeeper 和 BookKeeper 使用的数据存储目录
`instances` | 为 [Pulsar Functions](functions-overview.md) 创建的工件
`logs` | 安装创建的日志


## 步骤 1：部署 ZooKeeper

每个 Pulsar 实例依赖于两个独立的 ZooKeeper 法定群体。

* 本地 ZooKeeper 在集群级别运行，并提供集群特定的配置管理和协调。每个 Pulsar 集群需要一个专用的 ZooKeeper 集群。
* 配置存储在实例级别运行，并为整个系统（因此跨集群）提供配置管理。独立的机器集群或本地 ZooKeeper 使用的相同机器可以提供配置存储法定群体。

您可以使用独立的机器集群或本地 ZooKeeper 使用的相同机器来提供配置存储法定群体。

### 部署本地 ZooKeeper

ZooKeeper 为 Pulsar 管理各种基本的协调和配置相关任务。

您需要为每个 Pulsar 集群建立一个本地 ZooKeeper 集群来部署 Pulsar 实例。

首先，将所有 ZooKeeper 服务器添加到 [`conf/zookeeper.conf`](reference-configuration.md#zookeeper) 文件中指定的法定群体配置中。为集群中的每个节点向配置添加一个 `server.N` 行，其中 `N` 是 ZooKeeper 节点的编号。以下是一个三节点集群的示例：

```properties
server.1=zk1.us-west.example.com:2888:3888
server.2=zk2.us-west.example.com:2888:3888
server.3=zk3.us-west.example.com:2888:3888
```

在每个主机上，您需要在每个节点的 `myid` 文件中指定节点的 ID，该文件默认在每个服务器的 `data/zookeeper` 文件夹中（您可以通过 [`dataDir`](reference-configuration.md#zookeeper-dataDir) 参数更改文件位置）。

:::tip

有关 `myid` 和更多详细信息，请参阅 ZooKeeper 文档中的[多服务器设置指南](https://zookeeper.apache.org/doc/r3.4.10/zookeeperAdmin.html#sc_zkMulitServerSetup)。

:::

例如，在 `zk1.us-west.example.com` 的 ZooKeeper 服务器上，您可以像这样设置 `myid` 值：

```shell
mkdir -p data/zookeeper
echo 1 > data/zookeeper/myid
```

在 `zk2.us-west.example.com` 上，命令看起来像 `echo 2 > data/zookeeper/myid`，以此类推。

一旦您将每个服务器添加到 `zookeeper.conf` 配置中，并且每个服务器都有适当的 `myid` 条目，您就可以在所有主机上使用 [`pulsar-daemon`](reference-cli-tools.md) CLI 工具启动 ZooKeeper（在后台，使用 nohup）：

```shell
bin/pulsar-daemon start zookeeper
```

### 部署配置存储

在上面的部分中配置和启动的 ZooKeeper 集群是一个本地 ZooKeeper 集群，您可以使用它来管理单个 Pulsar 集群。但是，除了本地集群之外，完整的 Pulsar 实例还需要一个配置存储来处理一些实例级别的配置和协调任务。

如果您部署单集群实例，则不需要为配置存储设置单独的集群。但是，如果您部署多集群实例，您应该为配置任务建立一个单独的 ZooKeeper 集群。

#### 单集群 Pulsar 实例

如果您的 Pulsar 实例只包含一个集群，那么您可以在与本地 ZooKeeper 法定群体相同的机器上部署配置存储，但在不同的 TCP 端口上运行。

要在单集群实例中部署 ZooKeeper 配置存储，请将相同的 ZooKeeper 服务器添加到本地法定群体。您需要使用 [`conf/global_zookeeper.conf`](reference-configuration.md#configuration-store) 中的配置文件，使用与[本地 ZooKeeper](#deploy-local-zookeeper) 相同的方法，但确保使用不同的端口（2181 是 ZooKeeper 的默认端口）。以下是一个在端口 2184 上用于三节点 ZooKeeper 集群的示例：

```properties
clientPort=2184
server.1=zk1.us-west.example.com:2185:2186
server.2=zk2.us-west.example.com:2185:2186
server.3=zk3.us-west.example.com:2185:2186
```

和之前一样，在 `data/global-zookeeper/myid` 上为每个服务器创建 `myid` 文件。

#### 多集群 Pulsar 实例

当您部署全局 Pulsar 实例时，集群分布在不同的地理区域，配置存储作为一个高可用性和强一致性的元数据存储，可以容忍跨越整个区域的故障和分区。

这里的关键是确保 ZK 法定群体成员分布在至少 3 个区域中，其他区域作为观察者运行。

同样，考虑到配置存储服务器上预期的非常低的负载，您可以共享用于本地 ZooKeeper 法定群体的相同主机。

例如，假设一个具有以下集群的 Pulsar 实例：`us-west`、`us-east`、`us-central`、`eu-central`、`ap-south`。还假设，每个集群都有自己的本地 ZK 服务器，命名如下：

```
zk[1-3].${CLUSTER}.example.com
```

在这种情况下，如果您想从几个集群中选择法定群体参与者，并让所有其他人都成为 ZK 观察者。例如，要形成 7 服务器法定群体，您可以从 `us-west` 选择 3 个服务器，从 `us-central` 选择 2 个，从 `us-east` 选择 2 个。

这种方法保证了即使这些区域之一不可达，也可以写入配置存储。

所有服务器中的 ZK 配置如下所示：

```properties
clientPort=2184
server.1=zk1.us-west.example.com:2185:2186
server.2=zk2.us-west.example.com:2185:2186
server.3=zk3.us-west.example.com:2185:2186
server.4=zk1.us-central.example.com:2185:2186
server.5=zk2.us-central.example.com:2185:2186
server.6=zk3.us-central.example.com:2185:2186:observer
server.7=zk1.us-east.example.com:2185:2186
server.8=zk2.us-east.example.com:2185:2186
server.9=zk3.us-east.example.com:2185:2186:observer
server.10=zk1.eu-central.example.com:2185:2186:observer
server.11=zk2.eu-central.example.com:2185:2186:observer
server.12=zk3.eu-central.example.com:2185:2186:observer
server.13=zk1.ap-south.example.com:2185:2186:observer
server.14=zk2.ap-south.example.com:2185:2186:observer
server.15=zk3.ap-south.example.com:2185:2186:observer
```

此外，ZK 观察者需要具有以下参数：

```properties
peerType=observer
```

##### 启动服务

一旦您的配置存储配置就位，您就可以使用 [`pulsar-daemon`](reference-cli-tools.md) 启动服务

```shell
bin/pulsar-daemon start configuration-store
```

## 步骤 2：集群元数据初始化

一旦您为实例设置了集群特定的 ZooKeeper 和配置存储法定群体，您需要为实例中的每个集群向 ZooKeeper 写入一些元数据。**您只需要写入这些元数据一次**。

您可以使用 [`pulsar`](reference-cli-tools.md) CLI 工具的 [`initialize-cluster-metadata`](reference-cli-tools.md) 命令初始化这些元数据。以下是一个示例：

```shell
bin/pulsar initialize-cluster-metadata \
    --cluster us-west \
    --metadata-store zk:zk1.us-west.example.com:2181,zk2.us-west.example.com:2181/my-chroot-path \
    --configuration-metadata-store zk:zk1.us-west.example.com:2181,zk2.us-west.example.com:2181/my-chroot-path \
    --web-service-url http://pulsar.us-west.example.com:8080/ \
    --web-service-url-tls https://pulsar.us-west.example.com:8443/ \
    --broker-service-url pulsar://pulsar.us-west.example.com:6650/ \
    --broker-service-url-tls pulsar+ssl://pulsar.us-west.example.com:6651/
```

从上面的示例中可以看到，您需要指定以下内容：

* 集群的名称
* 集群的本地元数据存储连接字符串
* 整个实例的配置存储连接字符串
* 集群的 Web 服务 URL
* 一个 enable 与集群中 [brokers](reference-terminology.md#broker) 交互的 broker 服务 URL

如果您使用 [TLS](security-tls-transport.md)，您还需要为集群指定 TLS Web 服务 URL 以及为集群中的 brokers 指定 TLS broker 服务 URL。

确保为您实例中的每个集群运行 `initialize-cluster-metadata`。

## 步骤 3：部署 BookKeeper

BookKeeper 为 Pulsar 提供[持久消息存储](concepts-architecture-overview.md#persistent-storage)。

每个 Pulsar broker 都需要自己的 Bookie 集群。BookKeeper 集群与 Pulsar 集群共享本地 ZooKeeper 法定群体。

### 配置 bookies

您可以使用 [`conf/bookkeeper.conf`](reference-configuration.md#bookkeeper) 配置文件配置 BookKeeper bookies。配置每个 bookie 的最重要方面是确保将 [`zkServers`](reference-configuration.md#bookkeeper-zkServers) 参数设置为 Pulsar 集群的本地 ZooKeeper 的连接字符串。

### 启动 bookies

您可以通过两种方式启动 bookie：在前台或作为后台守护进程。

要在后台启动 bookie，请使用 [`pulsar-daemon`](reference-cli-tools.md) CLI 工具：

```bash
bin/pulsar-daemon start bookie
```

您可以使用 [BookKeeper shell](reference-cli-tools.md) 的 `bookiesanity` 命令验证 bookie 是否正常工作：

```bash
bin/bookkeeper shell bookiesanity
```

此命令在本地 bookie 上创建一个新的 ledger，写入几个条目，读取它们，最后删除该 ledger。

启动所有 bookies 后，您可以在任何 bookie 节点上使用 [BookKeeper shell](reference-cli-tools.md) 的 `simpletest` 命令，以验证集群中的所有 bookies 都在运行。

```bash
bin/bookkeeper shell simpletest --ensemble <num-bookies> --writeQuorum <num-bookies> --ackQuorum <num-bookies> --numEntries <num-entries>
```

Bookie 主机负责将消息数据存储在磁盘上。为了使 bookies 提供最佳性能，具有合适的硬件配置对 bookies 至关重要。以下是 bookie 硬件容量的关键维度。

* 磁盘 I/O 容量读/写
* 存储容量

写入 bookies 的消息条目总是在向 Pulsar broker 返回确认之前同步到磁盘。为了确保低写入延迟，BookKeeper 被设计为使用多个设备：

* 一个 **journal** 来确保持久性。对于顺序写入，在 bookie 主机上具有快速的 [fsync](https://linux.die.net/man/2/fsync) 操作至关重要。通常，小型快速[固态硬盘](https://en.wikipedia.org/wiki/Solid-state_drive) (SSD) 应该足够，或者带有 [RAID](https://en.wikipedia.org/wiki/RAID) 控制器和电池备份写缓存的[硬盘驱动器](https://en.wikipedia.org/wiki/Hard_disk_drive) (HDD)。两种解决方案都可以达到约 0.4 ms 的 fsync 延迟。
* 一个 **ledger 存储设备** 是数据存储的地方，直到所有消费者都确认消息。写入在后台发生，因此写入 I/O 不是大问题。大多数时候读取是顺序进行的，只有在消费者排空的情况下才会清空积压。为了存储大量数据，典型配置涉及多个带有 RAID 控制器的 HDD。



## 步骤 4：部署 brokers

一旦您设置了 ZooKeeper、初始化了集群元数据并启动了 BookKeeper bookies，您就可以部署 brokers。

### Broker 配置

您可以使用 [`conf/broker.conf`](reference-configuration.md#broker) 配置文件配置 brokers。

broker 配置的最重要元素是确保每个 broker 都知道其本地 ZooKeeper 法定群体以及配置存储法定群体。确保您将 [`metadataStoreUrl`](reference-configuration.md#broker) 参数设置为反映本地法定群体，将 [`configurationMetadataStoreUrl`](reference-configuration.md#broker) 参数设置为反映配置存储法定群体（尽管您只需要指定位于同一集群中的那些 ZooKeeper 服务器）。

您还需要使用 [`clusterName`](reference-configuration.md#broker-clusterName) 参数指定 broker 所属的[集群](reference-terminology.md#cluster)的名称。此外，您需要匹配初始化集群元数据时提供的 broker 和 Web 服务端口（特别是当您使用与默认不同的端口时）。

以下是一个示例配置：

```properties
# 本地 ZooKeeper 服务器
metadataStoreUrl=zk1.us-west.example.com:2181,zk2.us-west.example.com:2181,zk3.us-west.example.com:2181

# 配置存储法定群体连接字符串。
configurationMetadataStoreUrl=zk1.us-west.example.com:2184,zk2.us-west.example.com:2184,zk3.us-west.example.com:2184

clusterName=us-west

# Broker 数据端口
brokerServicePort=6650

# TLS 的 Broker 数据端口
brokerServicePortTls=6651

# 用于服务 HTTP 请求的端口
webServicePort=8080

# 用于服务 HTTPS 请求的端口
webServicePortTls=8443
```

### Broker 硬件

Pulsar brokers 不需要任何特殊硬件，因为它们不使用本地磁盘。您最好选择快速 CPU 和 10Gbps [NIC](https://en.wikipedia.org/wiki/Network_interface_controller)，以便软件可以充分利用它们。

### 启动 broker 服务

您可以通过使用 [nohup](https://en.wikipedia.org/wiki/Nohup) 与 [`pulsar-daemon`](reference-cli-tools.md) CLI 工具在后台启动 broker：

```shell
bin/pulsar-daemon start broker
```

您也可以通过使用 [`pulsar broker`](reference-cli-tools.md) 在前台启动 brokers：

```shell
bin/pulsar broker
```

## 服务发现

连接到 Pulsar brokers 的[客户端](client-libraries.md)需要使用单个 URL 与整个 Pulsar 实例通信。

您可以使用自己的服务发现系统，只需要满足一个要求：当客户端对 Pulsar 集群的[端点](reference-configuration.md)执行 HTTP 请求时，例如 `http://pulsar.us-west.example.com:8080`，客户端需要被重定向到所需集群中的一些活跃 brokers，无论是通过 DNS、HTTP 或 IP 重定向，还是其他方式。

> **许多调度系统已经提供服务发现**
> 许多大规模部署系统，如 [Kubernetes](deploy-kubernetes.md)，都内置了服务发现系统。如果您在这样的系统上运行 Pulsar，您可能不需要提供自己的服务发现机制。

## 管理客户端和验证

此时，您的 Pulsar 实例应该可以使用了。您现在可以配置可以用作每个集群的[管理客户端](admin-api-overview.md)的客户端机器。您可以使用 [`conf/client.conf`](reference-configuration.md#client) 配置文件配置管理客户端。

最重要的是，您将 [`serviceUrl`](reference-configuration.md#client-serviceUrl) 参数指向集群的正确服务 URL：

```properties
serviceUrl=http://pulsar.us-west.example.com:8080/
```

## 配置新租户

Pulsar 被构建为一个根本上的多租户系统。

如果新租户想要使用系统，您需要创建一个新的。您可以使用 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) CLI 工具创建新租户：

```shell
bin/pulsar-admin tenants create test-tenant \
--allowed-clusters us-west \
--admin-roles test-admin-role
```

在此命令中，标识为 `test-admin-role` 角色的用户可以管理 `test-tenant` 租户的配置。`test-tenant` 租户只能使用 `us-west` 集群。从现在开始，这个租户可以管理其资源。

创建租户后，您需要为该租户内的 topics 创建[命名空间](reference-terminology.md#namespace)。


第一步是创建命名空间。命名空间是一个可以包含许多 topics 的管理单元。常见的做法是为来自单个租户的每个不同用例创建一个命名空间。

```shell
bin/pulsar-admin namespaces create test-tenant/ns1
```

##### 测试生产者和消费者


现在一切都准备好发送和接收消息。测试系统的最快方法是通过 [`pulsar-perf`](reference-cli-tools.md) 客户端工具。


您可以使用刚刚创建的命名空间中的 topic。Topics 在生产者或消费者第一次尝试使用它们时自动创建。

在这种情况下，topic 名称可以是：

```http
persistent://test-tenant/ns1/my-topic
```

启动一个在 topic 上创建订阅并等待消息的消费者：

```shell
bin/pulsar-perf consume persistent://test-tenant/ns1/my-topic
```

启动一个以固定速率发布消息并每 10 秒报告统计信息的生产者：

```shell
bin/pulsar-perf produce persistent://test-tenant/ns1/my-topic
```

要报告 topic 统计信息：

```shell
bin/pulsar-admin topics stats persistent://test-tenant/ns1/my-topic
```