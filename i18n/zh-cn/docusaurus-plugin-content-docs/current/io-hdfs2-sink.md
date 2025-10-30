---
id: io-hdfs2-sink
title: HDFS2 sink connector
sidebar_label: "HDFS2 sink connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

HDFS2 sink 连接器从 Pulsar topic 拉取消息，并将消息持久化到 HDFS 文件中。

## 配置

HDFS2 sink 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `hdfsConfigResources` | String|true| 无 | 包含 Hadoop 文件系统配置的文件或逗号分隔的列表。<br /><br />**示例**<br />'core-site.xml'<br />'hdfs-site.xml' |
| `directory` | String | true | 无|读取或写入文件的 HDFS 目录。 |
| `encoding` | String |false |无 |文件的字符编码。<br /><br />**示例**<br />UTF-8<br />ASCII |
| `compression` | Compression |false |无 |用于压缩或解压缩 HDFS 上文件的压缩代码。<br /><br />以下是可用选项：<br /><li>BZIP2<br /></li><li>DEFLATE<br /></li><li>GZIP<br /></li><li>LZ4<br /></li><li>SNAPPY<br /></li><li>ZSTANDARD</li>|
| `kerberosUserPrincipal` |String| false| 无|用于认证的 Kerberos 用户的主体账户。 |
| `keytab` | String|false|无| 用于认证的 Kerberos keytab 文件的完整路径名。 |
| `filenamePrefix` |String| true | 无 |在 HDFS 目录内创建的文件的前缀。<br /><br />**示例**<br /> topicA 的值会导致文件名为 topicA-。 |
| `fileExtension` | String| 如果 `compression` 设置为 `None` 则为必需。 | 无 | 添加到写入 HDFS 文件的扩展名。<br /><br />**示例**<br />'.txt'<br /> '.seq' |
| `separator` | char|false |无 |用于分隔文本文件中记录的字符。<br /><br />如果未提供值，所有记录的内容将连接成一个连续的字节数组。 |
| `syncInterval` | long| false |0|调用刷新数据到 HDFS 磁盘之间的时间间隔（以毫秒为单位）。 |
| `maxPendingRecords` |int| false|Integer.MAX_VALUE |  在确认之前内存中保存的最大记录数。<br /><br />将此属性设置为 1 使每条记录在确认前发送到磁盘。<br /><br />将此属性设置为更高的值允许在刷新到磁盘之前缓冲记录。 |
| `subdirectoryPattern` | String | false | 无 | 与 sink 创建时间关联的子目录。<br />该模式是 `directory` 子目录的格式化模式。<br /><br />有关模式语法，请参阅 [DateTimeFormatter](https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html)。 |

### 示例

在使用 HDFS2 sink 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "hdfsConfigResources": "core-site.xml",
        "directory": "/foo/bar",
        "filenamePrefix": "prefix",
        "fileExtension": ".log",
        "compression": "SNAPPY",
        "subdirectoryPattern": "yyyy-MM-dd"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      hdfsConfigResources: "core-site.xml"
      directory: "/foo/bar"
      filenamePrefix: "prefix"
      fileExtension: ".log"
      compression: "SNAPPY"
      subdirectoryPattern: "yyyy-MM-dd"
  ```
