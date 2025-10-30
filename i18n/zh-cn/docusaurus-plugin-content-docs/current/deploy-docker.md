---
id: deploy-docker
title: 在 Docker 上部署集群
sidebar_label: "Docker"
description: 学习如何在 Docker 上部署 Pulsar 集群。
---

要使用 Docker 命令在 Docker 上部署 Pulsar 集群，您需要完成以下步骤。

## 步骤 1：拉取 Pulsar 镜像

要在 Docker 上运行 Pulsar，您需要为每个 Pulsar 组件创建容器：ZooKeeper、bookie 和 broker。您可以在 Docker Hub 上分别拉取 ZooKeeper 和 bookie 的镜像，为 broker 拉取 Pulsar 镜像。您也可以只拉取一个 Pulsar 镜像并用此镜像创建三个容器。本教程以第二个选项为例。

您可以使用以下命令从 Docker Hub 拉取 Pulsar 镜像。如果您不想使用某些连接器，可以使用 `apachepulsar/pulsar:latest`。
```bash
docker pull apachepulsar/pulsar-all:latest
```

## 步骤 2：创建网络

要在 Docker 上部署 Pulsar 集群，您需要创建一个网络，并将 ZooKeeper、bookie 和 broker 的容器连接到此网络。
使用以下命令创建网络 `pulsar`：

```bash
docker network create pulsar
```

## 步骤 3：创建并启动容器

### 创建 ZooKeeper 容器

创建 ZooKeeper 容器并启动 ZooKeeper 服务。

```bash
docker run -d -p 2181:2181 --net=pulsar \
    -e metadataStoreUrl=zk:zookeeper:2181 \
    -e cluster-name=cluster-a -e managedLedgerDefaultEnsembleSize=1 \
    -e managedLedgerDefaultWriteQuorum=1 \
    -e managedLedgerDefaultAckQuorum=1 \
    -v $(pwd)/data/zookeeper:/pulsar/data/zookeeper \
    --name zookeeper --hostname zookeeper \
    apachepulsar/pulsar-all:latest \
    bash -c "bin/apply-config-from-env.py conf/zookeeper.conf && bin/generate-zookeeper-config.sh conf/zookeeper.conf && exec bin/pulsar zookeeper"
```

### 初始化集群元数据

成功创建 ZooKeeper 容器后，您可以使用以下命令初始化集群元数据。

```bash
docker run --net=pulsar \
    --name initialize-pulsar-cluster-metadata \
    apachepulsar/pulsar-all:latest bash -c "bin/pulsar initialize-cluster-metadata \
--cluster cluster-a \
--zookeeper zookeeper:2181 \
--configuration-store zookeeper:2181 \
--web-service-url http://broker:8080 \
--broker-service-url pulsar://broker:6650"
```

### 创建 bookie 容器

创建 bookie 容器并启动 bookie 服务。

```bash
docker run -d -e clusterName=cluster-a \
    -e zkServers=zookeeper:2181 --net=pulsar \
    -e metadataServiceUri=metadata-store:zk:zookeeper:2181 \
    -v $(pwd)/data/bookkeeper:/pulsar/data/bookkeeper \
    --name bookie --hostname bookie \
    apachepulsar/pulsar-all:latest \
    bash -c "bin/apply-config-from-env.py conf/bookkeeper.conf && exec bin/pulsar bookie"
```

### 创建 broker 容器

创建 broker 容器并启动 broker 服务。

```bash
docker run -d -p 6650:6650 -p 8080:8080 --net=pulsar \
    -e metadataStoreUrl=zk:zookeeper:2181 \
    -e zookeeperServers=zookeeper:2181 \
    -e clusterName=cluster-a \
    -e managedLedgerDefaultEnsembleSize=1 \
    -e managedLedgerDefaultWriteQuorum=1 \
    -e managedLedgerDefaultAckQuorum=1 \
    --name broker --hostname broker \
    apachepulsar/pulsar-all:latest \
    bash -c "bin/apply-config-from-env.py conf/broker.conf && exec bin/pulsar broker"
```