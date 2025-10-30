---
id: tiered-storage-filesystem
title: Use filesystem offloader with Pulsar
sidebar_label: "Filesystem offloader"
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

本章指导您完成安装和配置文件系统卸载器的每个步骤，以及如何在 Pulsar 中使用它。

## 安装

本节描述如何安装文件系统卸载器。

### 前提条件

- Pulsar：2.4.2 或更高版本

### 步骤

1. [下载 Pulsar 压缩包](getting-started-standalone.md#download-pulsar-distribution)。
2. 下载并解压 Pulsar 卸载器包，然后将 Pulsar 卸载器作为 `offloaders` 复制到 Pulsar 目录中。请参阅[安装分层存储卸载器](tiered-storage-overview.md#how-to-install-tiered-storage-offloaders)。

## 配置

:::note

在将数据从 BookKeeper 卸载到文件系统之前，您需要配置文件系统卸载器驱动程序的一些属性。

:::

此外，您还可以配置文件系统卸载器自动运行或手动触发。

### 配置文件系统卸载器驱动程序

您可以在 `broker.conf` 或 `standalone.conf` 配置文件中配置文件系统卸载器驱动程序。

````mdx-code-block
<Tabs
  defaultValue="HDFS"
  values={[{"label":"HDFS","value":"HDFS"},{"label":"NFS","value":"NFS"}]}>
<TabItem value="HDFS">

- **必需**配置如下所示。

  | 参数                    | 描述                                                                                                                                       | 示例值                               |
  |------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
  | `managedLedgerOffloadDriver` | 卸载器驱动程序名称，不区分大小写。                                                                                             | filesystem                            |
  | `fileSystemURI`              | 连接地址，即访问默认 Hadoop 分布式文件系统的 URI。                                                                                   | hdfs://127.0.0.1:9000                 |
  | `offloadersDirectory`        | 卸载器目录                                                                                                                           | offloaders                            |
  | `fileSystemProfilePath`      | Hadoop 配置文件路径。配置文件存储在 Hadoop 配置文件路径中。它包含 Hadoop 性能调优的各种设置。 | conf/filesystem_offload_core_site.xml |


- **可选**配置如下所示。

  | 参数                                   | 描述                                                                                                                                                                   | 示例值 |
  |---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
  | `managedLedgerMinLedgerRolloverTimeMinutes` | 主题的 ledger 滚动之间的最短时间。<br /><br />**注意**：不建议在生产环境中设置此参数。                            | 10            |
  | `managedLedgerMaxEntriesPerLedger`          | 在触发滚动之前追加到 ledger 的最大条目数。<br /><br />**注意**：不建议在生产环境中设置此参数。 | 50000         |


</TabItem>
<TabItem value="NFS">

- **必需**配置如下所示。

  | 参数                    | 描述                                                                                                                      | 示例值                               |
  |------------------------------|----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
  | `managedLedgerOffloadDriver` | 卸载器驱动程序名称，不区分大小写。                                                                                | filesystem                            |
  | `offloadersDirectory`        | 卸载器目录                                                                                                              | offloaders                            |
  | `fileSystemProfilePath`      | NFS 配置文件路径。配置文件存储在 NFS 配置文件路径中。它包含性能调优的各种设置。 | conf/filesystem_offload_core_site.xml |

- **可选**配置如下所示。

  | 参数                                   | 描述                                                                                                                                                                   | 示例值 |
  |---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
  | `managedLedgerMinLedgerRolloverTimeMinutes` | 主题的 ledger 滚动之间的最短时间。<br /><br />**注意**：不建议在生产环境中设置此参数。                            | 10            |
  | `managedLedgerMaxEntriesPerLedger`          | 在触发滚动之前追加到 ledger 的最大条目数。<br /><br />**注意**：不建议在生产环境中设置此参数。 | 50000         |

</TabItem>
</Tabs>
````

### 自动运行文件系统卸载器

您可以配置命名空间策略，一旦达到阈值就自动卸载数据。阈值基于主题在 Pulsar 集群上存储的数据大小。一旦主题存储达到阈值，就会自动触发卸载操作。

| 阈值 | 操作                                                                           |
|-----------------|----------------------------------------------------------------------------------|
| &gt; 0          | 如果主题存储达到其阈值，它将触发卸载操作。 |
| = 0             | 它导致 broker 尽快卸载数据。                          |
| &lt; 0          | 它禁用自动卸载操作。                                      |

当新段添加到主题日志时，自动卸载运行。如果您在命名空间上设置阈值，但很少有消息生成到主题，文件系统卸载器不会工作，直到当前段已满。

您可以使用 CLI 工具（如 pulsar-admin）配置阈值。

#### 示例

此示例使用 pulsar-admin 将文件系统卸载器阈值设置为 10 MB。

```bash
pulsar-admin namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

:::tip

有关 `pulsar-admin namespaces set-offload-threshold options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

:::

### 手动运行文件系统卸载器

对于单个主题，您可以使用以下方法之一手动触发文件系统卸载器：

- 使用 REST 端点。

- 使用 CLI 工具（如 pulsar-admin）。

要通过 CLI 工具手动触发文件系统卸载器，您需要指定应在 Pulsar 集群上为主题保留的最大数据量（阈值）。如果 Pulsar 集群上的主题数据大小超过此阈值，则将主题的段卸载到文件系统，直到不再超过阈值。较旧的段首先卸载。

#### 示例

- 此示例使用 pulsar-admin 手动运行文件系统卸载器。

  ```bash
  pulsar-admin topics offload --size-threshold 10M persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```bash
  Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
  ```

  :::tip

  有关 `pulsar-admin topics offload options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

- 此示例使用 pulsar-admin 检查文件系统卸载器状态。

  ```bash
  pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```bash
  Offload is currently running
  ```

  要等待文件系统完成作业，请添加 `-w` 标志。

  ```bash
  pulsar-admin topics offload-status -w persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```
  Offload was a success
  ```

  如果卸载操作中出现错误，错误会传播到 `pulsar-admin topics offload-status` 命令。

  ```bash
  pulsar-admin topics offload-status persistent://my-tenant/my-namespace/topic1
  ```

  **输出**

  ```
  Error in offload
  null

  Reason: Error offloading: org.apache.bookkeeper.mledger.ManagedLedgerException: java.util.concurrent.CompletionException: com.amazonaws.services.s3.model.AmazonS3Exception: Anonymous users cannot initiate multipart uploads.  Please authenticate. (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied; Request ID: 798758DE3F1776DF; S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=), S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=
  ```

  :::tip

  有关 `pulsar-admin topics offload-status options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

  :::

## 教程

本节提供了如何使用文件系统卸载器将数据从 Pulsar 移动到 Hadoop 分布式文件系统（HDFS）或网络文件系统（NFS）的分步说明。

### 将数据卸载到 HDFS

:::tip

本教程设置了 Hadoop 单节点集群并使用 Hadoop 3.2.1。有关如何设置 Hadoop 单节点集群的详细信息，请参阅[此处](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html)。

:::

#### 步骤 1：准备 HDFS 环境

1. 下载并解压缩 Hadoop 3.2.1。

   ```shell
   wget https://mirrors.bfsu.edu.cn/apache/hadoop/common/hadoop-3.2.1/hadoop-3.2.1.tar.gz

   tar -zxvf hadoop-3.2.1.tar.gz -C $HADOOP_HOME
   ```

2. 配置 Hadoop。

   ```xml
   # $HADOOP_HOME/etc/hadoop/core-site.xml
   <configuration>
       <property>
           <name>fs.defaultFS</name>
           <value>hdfs://localhost:9000</value>
       </property>
   </configuration>

   # $HADOOP_HOME/etc/hadoop/hdfs-site.xml
   <configuration>
       <property>
           <name>dfs.replication</name>
           <value>1</value>
       </property>
   </configuration>
   ```

3. 设置无密码 ssh。

   ```bash
   # 现在检查您是否可以无密码 ssh 到 localhost：
   ssh localhost
   # 如果您不能无密码 ssh 到 localhost，请执行以下命令
   ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
   chmod 0600 ~/.ssh/authorized_keys
   ```

4. 启动 HDFS。

   ```bash
   # 不要重复执行此命令，重复执行会导致 datanode 的 clusterId 与 namenode 不一致
   $HADOOP_HOME/bin/hadoop namenode -format
   $HADOOP_HOME/sbin/start-dfs.sh
   ```

5. 导航到 [HDFS 网站](http://localhost:9870/)。

   您可以看到**概览**页面。

   ![](/assets/FileSystem-1.png)

   1. 在顶部导航栏上，单击**Datanodes**以检查 DataNode 信息。

       ![](/assets/FileSystem-2.png)

   2. 单击**HTTP Address**以获取有关 localhost:9866 的更详细信息。

       如下所示，**Capacity Used**的大小为 4 KB，这是初始值。

       ![](/assets/FileSystem-3.png)

#### 步骤 2：安装文件系统卸载器

有关详细信息，请参阅[安装](#installation)。

#### 步骤 3：配置文件系统卸载器

如[配置](#configuration)部分所示，在使用文件系统卸载器之前，您需要为文件系统卸载器驱动程序配置一些属性。本教程假设您已经如下配置了文件系统卸载器驱动程序，并以**独立**模式运行 Pulsar。

在 `conf/standalone.conf` 文件中设置以下配置。

```conf
managedLedgerOffloadDriver=filesystem
fileSystemURI=hdfs://127.0.0.1:9000
fileSystemProfilePath=conf/filesystem_offload_core_site.xml
```

:::note

出于测试目的，您可以设置以下两个配置以加速 ledger 滚动，但不建议在生产环境中设置它们。

:::

```conf
managedLedgerMinLedgerRolloverTimeMinutes=1
managedLedgerMaxEntriesPerLedger=100
```

#### 步骤 4：将数据从 BookKeeper 卸载到文件系统

在您下载 Pulsar 压缩包的存储库中执行以下命令。例如，`~/path/to/apache-pulsar-2.5.1`。

1. 启动 Pulsar 独立模式。

   ```shell
   bin/pulsar standalone -a 127.0.0.1
   ```

2. 为确保生成的数据不会立即被删除，建议设置[保留策略](cookbooks-retention-expiry.md#retention-policies)，该策略可以是**大小**限制或**时间**限制。您为保留策略设置的值越大，数据可以保留的时间越长。

   ```shell
   bin/pulsar-admin namespaces set-retention public/default --size 100M --time 2d
   ```

   :::tip

   有关 `pulsarctl namespaces set-retention options` 命令的更多信息，包括标志、描述、默认值和简写，请参阅[此处](https://docs.streamnative.io/pulsarctl/v2.7.0.6/#-em-set-retention-em-)。

   :::

3. 使用 pulsar-client 生成数据。

   ```shell
   bin/pulsar-client produce -m "Hello FileSystem Offloader" -n 1000 public/default/fs-test
   ```

4. 卸载操作在触发 ledger 滚动后开始。为确保成功卸载数据，建议您等待触发几个 ledger 滚动。在这种情况下，您可能需要等待一秒钟。您可以使用 pulsarctl 检查 ledger 状态。

   ```shell
   bin/pulsar-admin topics stats-internal public/default/fs-test
   ```

   **输出**

   ledger 696 的数据未卸载。

   ```shell
   {
   "version": 1,
   "creationDate": "2020-06-16T21:46:25.807+08:00",
   "modificationDate": "2020-06-16T21:46:25.821+08:00",
   "ledgers": [
   {
       "ledgerId": 696,
       "isOffloaded": false
   }
   ],
   "cursors": {}
   }
   ```

5. 等待一秒钟并向主题发送更多消息。

   ```shell
   bin/pulsar-client produce -m "Hello FileSystem Offloader" -n 1000 public/default/fs-test
   ```

6. 使用 pulsarctl 检查 ledger 状态。

   ```shell
   bin/pulsar-admin topics stats-internal public/default/fs-test
   ```

   **输出**

   ledger 696 已滚动。

   ```shell
   {
   "version": 2,
   "creationDate": "2020-06-16T21:46:25.807+08:00",
   "modificationDate": "2020-06-16T21:48:52.288+08:00",
   "ledgers": [
   {
       "ledgerId": 696,
       "entries": 1001,
       "size": 81695,
       "isOffloaded": false
   },
   {
       "ledgerId": 697,
       "isOffloaded": false
   }
   ],
   "cursors": {}
   }
   ```

7. 使用 pulsarctl 手动触发卸载操作。

   ```shell
   bin/pulsar-admin topics offload -s 0 public/default/fs-test
   ```

   **输出**

   ledger 697 之前的数据被卸载。

   ```shell
   # 卸载信息，697 之前的 ledger 将被卸载
   Offload triggered for persistent://public/default/fs-test3 for messages before 697:0:-1
   ```

8.  使用 pulsarctl 检查 ledger 状态。

   ```shell
   bin/pulsar-admin topics stats-internal public/default/fs-test
   ```

   **输出**

   ledger 696 的数据已卸载。

   ```shell
   {
   "version": 4,
   "creationDate": "2020-06-16T21:46:25.807+08:00",
   "modificationDate": "2020-06-16T21:52:13.25+08:00",
   "ledgers": [
   {
       "ledgerId": 696,
       "entries": 1001,
       "size": 81695,
       "isOffloaded": true
   },
   {
       "ledgerId": 697,
       "isOffloaded": false
   }
   ],
   "cursors": {}
   }
   ```

   并且 **Capacity Used** 从 4 KB 更改为 116.46 KB。

   ![](/assets/FileSystem-8.png)


### 将数据卸载到 NFS

:::note

在本节中，假设您已启用 NFS 服务并设置了 NFS 服务的共享路径。在本节中，`/Users/test` 用作 NFS 服务的共享路径。

:::

#### 步骤 1：安装文件系统卸载器

有关详细信息，请参阅[安装](#installation)。

#### 步骤 2：将您的 NFS 挂载到本地文件系统

此示例将 */Users/pulsar_nfs* 挂载到 */Users/test*。

```shell
mount -e 192.168.0.103:/Users/test/Users/pulsar_nfs
```

#### 步骤 3：配置文件系统卸载器驱动程序

如[配置](#configuration)部分所示，在使用文件系统卸载器之前，您需要为文件系统卸载器驱动程序配置一些属性。本教程假设您已经如下配置了文件系统卸载器驱动程序，并以**独立**模式运行 Pulsar。

1. 在 `conf/standalone.conf` 文件中设置以下配置。

   ```conf
   managedLedgerOffloadDriver=filesystem
   fileSystemProfilePath=conf/filesystem_offload_core_site.xml
   ```

2. 如下修改 *filesystem_offload_core_site.xml*。

   ```xml
   <property>
       <name>fs.defaultFS</name>
       <value>file:///</value>
   </property>

   <property>
       <name>hadoop.tmp.dir</name>
       <value>file:///Users/pulsar_nfs</value>
   </property>

   <property>
       <name>io.file.buffer.size</name>
       <value>4096</value>
   </property>

   <property>
       <name>io.seqfile.compress.blocksize</name>
       <value>1000000</value>
   </property>
   <property>

       <name>io.seqfile.compression.type</name>
       <value>BLOCK</value>
   </property>

   <property>
       <name>io.map.index.interval</name>
       <value>128</value>
   </property>
   ```

#### 步骤 4：将数据从 BookKeeper 卸载到文件系统

请参阅[将数据卸载到 HDFS](#step-4-offload-data-from-bookkeeper-to-filesystem)的步骤 4。


## 从文件系统读取卸载的数据

* 卸载的数据作为 `MapFile` 存储在文件系统的以下新路径中：

  ```properties
  path = storageBasePath + "/" + managedLedgerName + "/" + ledgerId + "-" + uuid.toString();
  ```

  * `storageBasePath` 是 `hadoop.tmp.dir` 的值，在 `broker.conf` 或 `filesystem_offload_core_site.xml` 中配置。
  * `managedLedgerName` 是持久化 Topic 管理器的 ledger 名称。

  ```shell
  persistent://public/default/topics-name 的 managedLedgerName 是 public/default/persistent/topics-name。
  ```

  您可以使用以下方法获取 `managedLedgerName`：

  ```shell
  String managedLedgerName = TopicName.get("persistent://public/default/topics-name").getPersistenceNamingEncoding();
  ```

要从文件系统将数据作为 ledger 条目读出，请完成以下步骤。
1. 创建一个读取器来读取具有新路径的 `MapFile` 和文件系统的 `configuration`。

  ```shell
  MapFile.Reader reader = new MapFile.Reader(new Path(dataFilePath),  configuration);
  ```

2. 从文件系统将数据作为 `LedgerEntry` 读取。

  ```java
    LongWritable key = new LongWritable();
    BytesWritable value = new BytesWritable();
    key.set(nextExpectedId - 1);
    reader.seek(key);
    reader.next(key, value);
    int length = value.getLength();
    long entryId = key.get();
    ByteBuf buf = PooledByteBufAllocator.DEFAULT.buffer(length, length);
    buf.writeBytes(value.copyBytes());
    LedgerEntryImpl ledgerEntry = LedgerEntryImpl.create(ledgerId, entryId, length, buf);
  ```

3. 将 `LedgerEntry` 反序列化为 `Message`。

  ```java
       ByteBuf metadataAndPayload = ledgerEntry.getDataBuffer();
       long totalSize = metadataAndPayload.readableBytes();
       BrokerEntryMetadata brokerEntryMetadata = Commands.peekBrokerEntryMetadataIfExist(metadataAndPayload);
       MessageMetadata metadata = Commands.parseMessageMetadata(metadataAndPayload);

       Map<String, String> properties = new TreeMap();
       properties.put("X-Pulsar-batch-size", String.valueOf(totalSize
               - metadata.getSerializedSize()));
       properties.put("TOTAL-CHUNKS", Integer.toString(metadata.getNumChunksFromMsg()));
       properties.put("CHUNK-ID", Integer.toString(metadata.getChunkId()));

       // 如果需要则解码
       CompressionCodec codec = CompressionCodecProvider.getCompressionCodec(metadata.getCompression());
       ByteBuf uncompressedPayload = codec.decode(metadataAndPayload, metadata.getUncompressedSize());
       // 复制到堆缓冲区以实现输出流兼容性
       ByteBuf data = PulsarByteBufAllocator.DEFAULT.heapBuffer(uncompressedPayload.readableBytes(),
               uncompressedPayload.readableBytes());
       data.writeBytes(uncompressedPayload);
       uncompressedPayload.release();

       MessageImpl message = new MessageImpl(topic, ((PositionImpl)ledgerEntry.getPosition()).toString(), properties,
               data, Schema.BYTES, metadata);
       message.setBrokerEntryMetadata(brokerEntryMetadata);
  ```