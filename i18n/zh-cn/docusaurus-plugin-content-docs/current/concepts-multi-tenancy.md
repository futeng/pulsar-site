---
id: concepts-multi-tenancy
title: 多租户
sidebar_label: "多租户"
description: 全面了解 Pulsar 中租户和命名空间的概念。
---

Pulsar 从头开始设计为多租户系统。为了支持多租户，Pulsar 具有租户的概念。租户可以跨集群分布，并且每个租户都可以应用自己的[身份验证和授权](security-overview.md)方案。它们也是可以管理存储配额、[消息 TTL](cookbooks-retention-expiry.md#time-to-live-ttl)和隔离策略的管理单元。

Pulsar 的多租户性质主要体现在主题 URL 中，其结构如下：

```http
persistent://tenant/namespace/topic
```

正如你所看到的，租户是主题分类的最基本单位（比命名空间和主题名称更基础）。

## 租户

Pulsar 租户是用于分配容量和执行身份验证或授权方案的管理单元。对于 Pulsar 实例中的每个租户，你可以分配：

* 一个[授权](security-authorization.md)方案
* 租户配置应用到的[集群](reference-terminology.md#cluster)集

## 命名空间

Pulsar 命名空间是主题的逻辑分组。租户和命名空间是 Pulsar 支持多租户的两个关键概念。

* Pulsar 为指定租户提供配置，为租户分配适当的容量。
* 命名空间是租户内的管理单元命名法。在命名空间上设置的配置策略适用于在该命名空间中创建的所有主题。租户可以通过使用 REST API 和[`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) CLI 工具进行自我管理来创建多个命名空间。例如，具有不同应用程序的租户可以为每个应用程序创建单独的命名空间。

同一命名空间中主题的名称将如下所示：

```http

persistent://tenant/app1/topic-1

persistent://tenant/app1/topic-2

persistent://tenant/app1/topic-3

```

### 命名空间变更事件和主题级策略

Pulsar 是一个多租户事件流系统。管理员可以通过在不同级别设置策略来管理租户和命名空间。然而，诸如保留策略和存储配额策略等策略仅在命名空间级别可用。在许多用例中，用户需要在主题级别设置策略。命名空间变更事件方法被提出用于以有效的方式支持主题级策略。在此方法中，Pulsar 用作事件日志来存储命名空间变更事件（如主题策略变更）。命名空间变更事件方法有一些好处：
- 避免使用 ZooKeeper 并给 ZooKeeper 带来更多负载。
- 使用 Pulsar 作为事件日志来传播策略缓存。它可以有效扩展。

每个命名空间都有一个名为`__change_events`的[系统主题](concepts-messaging.md#system-topic)。此系统主题存储给定命名空间的变更事件。下图说明了如何利用系统主题来更新主题级策略。

![利用系统主题在 Pulsar 中更新主题级策略](/assets/system-topic-for-topic-level-policies.svg)

1. Pulsar Admin 客户端与管理 Restful API 通信以更新主题级策略。
2. 接收到 Admin HTTP 请求的任何 broker 都会将主题策略变更事件发布到命名空间的相应系统主题（`__change_events`）。
3. 拥有命名空间包的每个 broker 都订阅系统主题（`__change_events`）以接收命名空间的变更事件。
4. 每个 broker 将变更事件应用到其策略缓存。
5. 策略缓存更新后，broker 将响应发送回 Pulsar Admin 客户端。