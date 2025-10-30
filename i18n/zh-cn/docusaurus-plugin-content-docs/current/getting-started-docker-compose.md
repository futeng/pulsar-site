---
id: getting-started-docker-compose
title: 使用 Docker Compose 在本地运行 Pulsar 集群
sidebar_label: "使用 Docker Compose 本地运行 Pulsar"
description: 使用 Docker Compose 在您的本地机器上开始使用 Apache Pulsar。
---

要使用 Docker Compose 在本地运行 Pulsar，请按照以下步骤操作。

## 前提条件

- [Docker](https://docs.docker.com/get-docker/) (推荐版本 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (推荐版本 2.0+)
- 集群至少需要 8GB 可用 RAM
- 至少 10GB 可用磁盘空间

## 步骤 1: 配置 `compose.yml` 模板

要快速启动并运行 Pulsar 集群，您可以使用以下模板创建 `compose.yml` 文件，通过修改或添加 **environment** 部分中的配置。

```yaml
version: '3'
networks:
  pulsar:
    driver: bridge
services:
  # 启动 zookeeper
  zookeeper:
    image: apachepulsar/pulsar:latest
    container_name: zookeeper
    restart: on-failure
    networks:
      - pulsar
    volumes:
      - ./data/zookeeper:/pulsar/data/zookeeper
    environment:
      - metadataStoreUrl=zk:zookeeper:2181
      - PULSAR_MEM=-Xms256m -Xmx256m -XX:MaxDirectMemorySize=256m
    command:
      - bash
      - -c
      - |
        bin/apply-config-from-env.py conf/zookeeper.conf && \
        bin/generate-zookeeper-config.sh conf/zookeeper.conf && \
        exec bin/pulsar zookeeper
    healthcheck:
      test: ["CMD", "bin/pulsar-zookeeper-ruok.sh"]
      interval: 10s
      timeout: 5s
      retries: 30

  # 初始化集群元数据
  pulsar-init:
    container_name: pulsar-init
    hostname: pulsar-init
    image: apachepulsar/pulsar:latest
    networks:
      - pulsar
    command:
      - bash
      - -c
      - |
        bin/pulsar initialize-cluster-metadata \
        --cluster cluster-a \
        --zookeeper zookeeper:2181 \
        --configuration-store zookeeper:2181 \
        --web-service-url http://broker:8080 \
        --broker-service-url pulsar://broker:6650
    depends_on:
      zookeeper:
        condition: service_healthy

  # 启动 bookie
  bookie:
    image: apachepulsar/pulsar:latest
    container_name: bookie
    restart: on-failure
    networks:
      - pulsar
    environment:
      - clusterName=cluster-a
      - zkServers=zookeeper:2181
      - metadataServiceUri=metadata-store:zk:zookeeper:2181
      # 否则每次我们运行 docker compose up 或 down 都会因 Cookie 导致启动失败
      # 参考: https://github.com/apache/bookkeeper/blob/405e72acf42bb1104296447ea8840d805094c787/bookkeeper-server/src/main/java/org/apache/bookkeeper/bookie/Cookie.java#L57-68
      - advertisedAddress=bookie
      - BOOKIE_MEM=-Xms512m -Xmx512m -XX:MaxDirectMemorySize=256m
    depends_on:
      zookeeper:
        condition: service_healthy
      pulsar-init:
        condition: service_completed_successfully
    # 将本地目录映射到容器以避免因容器磁盘不足导致的 bookie 启动失败
    volumes:
      - ./data/bookkeeper:/pulsar/data/bookkeeper
    command: bash -c "bin/apply-config-from-env.py conf/bookkeeper.conf && exec bin/pulsar bookie"

  # 启动 broker
  broker:
    image: apachepulsar/pulsar:latest
    container_name: broker
    hostname: broker
    restart: on-failure
    networks:
      - pulsar
    environment:
      - metadataStoreUrl=zk:zookeeper:2181
      - zookeeperServers=zookeeper:2181
      - clusterName=cluster-a
      - managedLedgerDefaultEnsembleSize=1
      - managedLedgerDefaultWriteQuorum=1
      - managedLedgerDefaultAckQuorum=1
      - advertisedAddress=broker
      - advertisedListeners=external:pulsar://127.0.0.1:6650
      - PULSAR_MEM=-Xms512m -Xmx512m -XX:MaxDirectMemorySize=256m
    depends_on:
      zookeeper:
        condition: service_healthy
      bookie:
        condition: service_started
    ports:
      - "6650:6650"
      - "8080:8080"
    command: bash -c "bin/apply-config-from-env.py conf/broker.conf && exec bin/pulsar broker"
```

## 步骤 2: 创建 Pulsar 集群

作为准备工作，创建数据目录并将数据目录的所有权更改为 uid(10000)，这是 Pulsar Docker 容器中使用的默认用户 ID。

```bash
sudo mkdir -p ./data/zookeeper ./data/bookkeeper
# 在 Linux 以外的平台上可能不需要此步骤
sudo chown -R 10000 data
```

要使用 `compose.yml` 文件创建 Pulsar 集群，请运行以下命令。

```bash
docker compose up -d
```

## 步骤 3: 销毁 Pulsar 集群

如果要销毁包含所有容器的 Pulsar 集群，请运行以下命令。它还将删除容器连接的网络。

```bash
docker compose down
```