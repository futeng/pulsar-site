---
id: io-canal-source
title: Canal source connector
sidebar_label: "Canal source connector"
---

:::note

您可以在[下载页面](pathname:///download)下载所有 Pulsar 连接器。

:::

Canal source 连接器从 MySQL 拉取消息到 Pulsar Topic。

## 配置

Canal source 连接器的配置具有以下属性。

### 属性

| 名称 | 必需 | 默认值 | 描述 |
|------|----------|---------|-------------|
| `username` | true | None | Canal 服务器账户（不是 MySQL）。|
| `password` | true | None | Canal 服务器密码（不是 MySQL）。 |
|`destination`|true|None|Canal source 连接器连接的源目标。|
| `singleHostname` | false | None | Canal 服务器地址。|
| `singlePort` | false | None | Canal 服务器端口。|
| `cluster` | true | false | 是否根据 Canal 服务器配置启用集群模式。<br /><br /><li>true：**集群**模式。<br />如果设置为 true，它会与 `zkServers` 通信以找出实际的数据库主机。<br /><br /></li><li>false：**独立**模式。<br />如果设置为 false，它会连接到由 `singleHostname` 和 `singlePort` 指定的数据库。 </li>|
| `zkServers` | true | None | Canal source 连接器与之通信以找出实际数据库主机的 Zookeeper 地址和端口。|
| `batchSize` | false | 1000 | 从 Canal 获取的批处理大小。 |

### 示例

在使用 Canal 连接器之前，您可以通过以下方法之一创建配置文件。

* JSON

  ```json
  {
      "zkServers": "127.0.0.1:2181",
      "batchSize": "5120",
      "destination": "example",
      "username": "",
      "password": "",
      "cluster": false,
      "singleHostname": "127.0.0.1",
      "singlePort": "11111",
  }
  ```

* YAML

  您可以创建一个 YAML 文件，并将下面的[内容](https://github.com/apache/pulsar/blob/master/pulsar-io/canal/src/main/resources/canal-mysql-source-config.yaml)复制到您的 YAML 文件中。

  ```yaml
  configs:
      zkServers: "127.0.0.1:2181"
      batchSize: 5120
      destination: "example"
      username: ""
      password: ""
      cluster: false
      singleHostname: "127.0.0.1"
      singlePort: 11111
  ```

## 使用方法

这里是使用上述配置文件存储 MySQL 数据的示例。

1. 启动一个 MySQL 服务器。

   ```bash
   docker pull mysql:5.7
   docker run -d -it --rm --name pulsar-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=canal -e MYSQL_USER=mysqluser -e MYSQL_PASSWORD=mysqlpw mysql:5.7
   ```

2. 创建一个配置文件 `mysqld.cnf`。

   ```properties
   [mysqld]
   pid-file    = /var/run/mysqld/mysqld.pid
   socket      = /var/run/mysqld/mysqld.sock
   datadir     = /var/lib/mysql
   #log-error  = /var/log/mysql/error.log
   # By default we only accept connections from localhost
   #bind-address   = 127.0.0.1
   # Disabling symbolic-links is recommended to prevent assorted security risks
   symbolic-links=0
   log-bin=mysql-bin
   binlog-format=ROW
   server_id=1
   ```

3. 将配置文件 `mysqld.cnf` 复制到 MySQL 服务器。

   ```bash
   docker cp mysqld.cnf pulsar-mysql:/etc/mysql/mysql.conf.d/
   ```

4.  重启 MySQL 服务器。

   ```bash
   docker restart pulsar-mysql
   ```

5.  在 MySQL 服务器中创建一个测试数据库。

   ```bash
   docker exec -it pulsar-mysql /bin/bash
   mysql -h 127.0.0.1 -uroot -pcanal -e 'create database test;'
   ```

6. 启动一个 Canal 服务器并连接到 MySQL 服务器。

   ```bash
   docker pull canal/canal-server:v1.1.2
   docker run -d -it --link pulsar-mysql -e canal.auto.scan=false -e canal.destinations=test -e canal.instance.master.address=pulsar-mysql:3306 -e canal.instance.dbUsername=root -e canal.instance.dbPassword=canal -e canal.instance.connectionCharset=UTF-8 -e canal.instance.tsdb.enable=true -e canal.instance.gtidon=false --name=pulsar-canal-server -p 8000:8000 -p 2222:2222 -p 11111:11111 -p 11112:11112 -m 4096m canal/canal-server:v1.1.2
   ```

7. 启动 Pulsar standalone。

   ```bash
   docker pull apachepulsar/pulsar:@pulsar:version@
   docker run --user 0 -d -it --link pulsar-canal-server -p 6650:6650 -p 8080:8080 -v $PWD/data:/pulsar/data --name pulsar-standalone apachepulsar/pulsar:@pulsar:version@ bin/pulsar standalone
   ```

8. 修改配置文件 `canal-mysql-source-config.yaml`。

   ```yaml
   configs:
       zkServers: ""
       batchSize: "5120"
       destination: "test"
       username: ""
       password: ""
       cluster: false
       singleHostname: "pulsar-canal-server"
       singlePort: "11111"
   ```

9. 创建一个消费者文件 `pulsar-client.py`。

   ```python
   import pulsar

   client = pulsar.Client('pulsar://localhost:6650')
   consumer = client.subscribe('my-topic',
                               subscription_name='my-sub')

   while True:
       msg = consumer.receive()
       print("Received message: '%s'" % msg.data())
       consumer.acknowledge(msg)

   client.close()
   ```

10. 将配置文件 `canal-mysql-source-config.yaml` 和消费者文件 `pulsar-client.py` 复制到 Pulsar 服务器。

   ```bash
   docker cp canal-mysql-source-config.yaml pulsar-standalone:/pulsar/conf/
   docker cp pulsar-client.py pulsar-standalone:/pulsar/
   ```

11. 下载一个 Canal 连接器并启动它。

   ```bash
   docker exec -it pulsar-standalone /bin/bash
   curl -LO --output-dir connectors "https://www.apache.org/dyn/closer.lua/pulsar/pulsar-@pulsar:version@/connectors/pulsar-io-canal-@pulsar:version@.nar?action=download"
   ./bin/pulsar-admin source localrun \
      --archive $PWD/connectors/pulsar-io-canal-@pulsar:version@.nar \
      --classname org.apache.pulsar.io.canal.CanalStringSource \
      --tenant public \
      --namespace default \
      --name canal \
      --destination-topic-name my-topic \
      --source-config-file /pulsar/conf/canal-mysql-source-config.yaml \
      --parallelism 1
   ```

12. 从 MySQL 消费数据。

   ```bash
   docker exec -it pulsar-standalone /bin/bash
   python pulsar-client.py
   ```

13. 打开另一个窗口登录 MySQL 服务器。

   ```bash
   docker exec -it pulsar-mysql /bin/bash
   mysql -h 127.0.0.1 -uroot -pcanal
   ```

14. 在 MySQL 服务器中创建表，并插入、删除和更新数据。

   ```bash
   mysql> use test;
   mysql> show tables;
   mysql> CREATE TABLE IF NOT EXISTS `test_table`(`test_id` INT UNSIGNED AUTO_INCREMENT,`test_title` VARCHAR(100) NOT NULL,
   `test_author` VARCHAR(40) NOT NULL,
   `test_date` DATE,PRIMARY KEY ( `test_id` ))ENGINE=InnoDB DEFAULT CHARSET=utf8;
   mysql> INSERT INTO test_table (test_title, test_author, test_date) VALUES("a", "b", NOW());
   mysql> UPDATE test_table SET test_title='c' WHERE test_title='a';
   mysql> DELETE FROM test_table WHERE test_title='c';
   ```
