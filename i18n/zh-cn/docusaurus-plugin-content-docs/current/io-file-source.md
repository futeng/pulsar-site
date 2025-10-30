---
id: io-file-source
title: File source connector
sidebar_label: "File source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

File source 连接器从目录中的文件拉取消息，并将消息持久化到 Pulsar topic。

## 配置

File source 连接器的配置包含以下属性。

### 属性

| 名称 | 类型|必需 | 默认值 | 描述
|------|----------|----------|---------|-------------|
| `inputDirectory` | String|true  | 无默认值|拉取文件的输入目录。 |
| `recurse` | Boolean|false | true | 是否从子目录拉取文件。|
| `keepFile` |Boolean|false | false | 如果设置为 true，文件处理后不会被删除，这意味着文件可以被持续拾取。 |
| `fileFilter` | String|false| [^\\.].* | 名称匹配给定正则表达式的文件会被拾取。 |
| `pathFilter` | String |false | NULL | 如果 `recurse` 设置为 true，路径匹配给定正则表达式的子目录会被扫描。 |
| `minimumFileAge` | Integer|false | 0 | 文件可以被处理的最小年龄。<br /><br />任何比 `minimumFileAge` 更年轻的文件（根据最后修改日期）都会被忽略。 |
| `maximumFileAge` | Long|false |Long.MAX_VALUE | 文件可以被处理的最大年龄。<br /><br />任何比 `maximumFileAge` 更老的文件（根据最后修改日期）都会被忽略。 |
| `minimumSize` |Integer| false |1 | 文件可以被处理的最小大小（以字节为单位）。 |
| `maximumSize` | Double|false |Double.MAX_VALUE| 文件可以被处理的最大大小（以字节为单位）。 |
| `ignoreHiddenFiles` |Boolean| false | true| 是否忽略隐藏文件。 |
| `pollingInterval`|Long | false | 10000L | 表示执行目录列表之前等待的时间。 |
| `numWorkers` | Integer | false | 1 | 处理文件的工作线程数量。<br /><br />这允许您并发处理更多的文件。<br /><br />但是，将其设置为大于 1 的值会使来自多个文件的数据混合在目标 topic 中。 |
| `processedFileSuffix` | String | false | NULL | 如果设置，不删除但只重命名已处理的文件。<br /><br />此配置仅在 'keepFile' 属性为 false 时有效。 |

### 示例

在使用 File source 连接器之前，您需要通过以下方法之一创建配置文件。

* JSON

  ```json
  {
     "configs": {
        "inputDirectory": "/Users/david",
        "recurse": true,
        "keepFile": true,
        "fileFilter": "[^\\.].*",
        "pathFilter": ".*",
        "minimumFileAge": 0,
        "maximumFileAge": 9999999999,
        "minimumSize": 1,
        "maximumSize": 5000000,
        "ignoreHiddenFiles": true,
        "pollingInterval": 5000,
        "numWorkers": 1,
        "processedFileSuffix": ".processed_done"
     }
  }
  ```

* YAML

  ```yaml
  configs:
      inputDirectory: "/Users/david"
      recurse: true
      keepFile: true
      fileFilter: "[^\\.].*"
      pathFilter: ".*"
      minimumFileAge: 0
      maximumFileAge: 9999999999
      minimumSize: 1
      maximumSize: 5000000
      ignoreHiddenFiles: true
      pollingInterval: 5000
      numWorkers: 1
      processedFileSuffix: ".processed_done"
  ```

## 使用方法

以下是使用 File source 连接器的示例。

1. 拉取 Pulsar 镜像。

   ```bash
   docker pull apachepulsar/pulsar:{version}
   ```

2. 启动 Pulsar standalone。

   ```bash
   docker run -d -it -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-standalone apachepulsar/pulsar:{version} bin/pulsar standalone
   ```

3. 创建配置文件 _file-connector.yaml_。

   ```yaml
   configs:
       inputDirectory: "/opt"
   ```

4. 将配置文件 _file-connector.yaml_ 复制到容器。

   ```bash
   docker cp connectors/file-connector.yaml pulsar-standalone:/pulsar/
   ```

5. 下载 File source 连接器。

   ```bash
   curl -O https://mirrors.tuna.tsinghua.edu.cn/apache/pulsar/pulsar-{version}/connectors/pulsar-io-file-{version}.nar
   ```

6. 将其复制到 `connectors` 文件夹，然后重启容器。

   ```bash
   docker cp pulsar-io-file-{version}.nar pulsar-standalone:/pulsar/connectors/
   docker restart pulsar-standalone
   ```

7. 启动 File source 连接器。

   ```bash
   docker exec -it pulsar-standalone /bin/bash

   ./bin/pulsar-admin sources localrun \
      --archive /pulsar/connectors/pulsar-io-file-{version}.nar \
      --name file-test \
      --destination-topic-name  pulsar-file-test \
      --source-config-file /pulsar/file-connector.yaml
   ```

8. 启动消费者。

   ```bash
   ./bin/pulsar-client consume -s file-test -n 0 pulsar-file-test
   ```

9. 将消息写入文件 _test.txt_。

   ```bash
   echo "hello world!" > /opt/test.txt
   ```

   消费者终端窗口上会出现以下信息。

   ```bash
   ----- got message -----
   hello world!
   ```
