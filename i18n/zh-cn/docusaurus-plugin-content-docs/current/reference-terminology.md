---
id: reference-terminology
title: Pulsar Terminology
sidebar_label: "Terminology"
description: Get a comprehensive understanding of Pulsar terminologies.
---

以下是 Apache Pulsar 相关术语的术语表：

## 概念

### Pulsar

Pulsar 是一个分布式消息系统，最初由 Yahoo 创建，但现在由 Apache 软件基金会管理。

### 命名空间 Bundle

命名空间 Bundle 是属于同一[命名空间](concepts-multi-tenancy.md#namespaces)的 [Topic](concepts-messaging.md#topics) 的虚拟组。命名空间 Bundle 定义为两个 32 位哈希之间的范围，例如 0x00000000 和 0xffffffff。

### 命名空间

命名空间是特定[租户](concepts-multi-tenancy.md#tenants)下 [Topic](concepts-messaging.md#topics) 的虚拟分组。命名空间由字符串名称定义，例如 `my-tenant/my-namespace`。

### Pub-Sub

Pub-Sub 是一种消息模式，其中 [生产者](concepts-clients.md#producer) 进程在 [Topic](concepts-messaging.md#topics) 上发布消息，然后由 [消费者](concepts-clients.md#consumer) 进程消费（处理）这些消息。

### 读取器

Pulsar 读取器是类似于 Pulsar [消费者](concepts-clients.md#consumer) 的消息处理器，但有两个关键区别：

- 您可以指定读取器在 Topic 上的哪个位置开始处理消息（消费者总是从最新的可用未确认消息开始）；
- 读取器不保留数据或确认消息。

### 游标

游标是 [消费者](concepts-clients.md#consumer) 的订阅位置。

### 未确认

未确认意味着消息已传递给消费者进行处理，但尚未被消费者确认为已处理。

### 保留策略

保留策略是您可以在 [命名空间](concepts-multi-tenancy.md#namespaces) 上设置的大小和时间限制，用于配置已[确认](concepts-messaging.md#acknowledgment)的 [消息](concepts-messaging.md#messages) 的保留。

### 多租户

多租户是能够隔离 [命名空间](concepts-multi-tenancy.md#namespaces)、指定配额，并按 [租户](concepts-multi-tenancy.md#tenants) 配置认证和授权的能力。

### 故障域

故障域是 Pulsar 集群下的逻辑域。每个逻辑域包含预配置的 Broker 列表。

### 反亲和性命名空间

反亲和性命名空间是一组相互具有反亲和性的命名空间。


## 架构

### 独立模式

独立模式是一个轻量级的 Pulsar Broker，其中所有组件都在单个 Java 虚拟机（JVM）进程中运行。独立集群可以在单台机器上运行，适用于开发目的。

### Topic 查找

Topic 查找是 Pulsar [Broker](concepts-architecture-overview.md#brokers) 提供的一项服务，使连接的客户端能够自动确定哪个 Pulsar [集群](concepts-architecture-overview.md#clusters) 负责特定的 [Topic](concepts-messaging.md#topics)（从而确定该 Topic 的消息流量需要路由到哪里）。

### 分发器

分发器是一个异步 TCP 服务器，用于 Pulsar [Broker](concepts-architecture-overview.md#brokers) 的所有数据传入和传出。Pulsar 分发器对所有通信使用自定义二进制协议。

### Broker

Broker 是接收、确认并向消费者传递消息的 Pulsar 服务器。一个 Pulsar 集群可以有一个或多个 Broker。

## 存储

### Bookie

Bookie 是单个 BookKeeper 服务器的名称。它实际上是 Pulsar 的存储服务器。