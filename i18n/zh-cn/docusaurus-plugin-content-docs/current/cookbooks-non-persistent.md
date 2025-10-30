---
id: cookbooks-non-persistent
title: 非持久化消息
sidebar_label: "非持久化消息"
description: 全面了解 Pulsar 中非持久化消息的概念、使用方法和管理方法。
---

本教程提供：

* 非持久化主题的基本[概念概述](#overview)
* 与非持久化主题相关的[可配置参数](#configuration-for-standalone-mode)信息
* 用于管理非持久化主题的 [CLI 界面](#manage-with-cli)指南

## 概述

默认情况下，Pulsar 会将*所有*未确认的消息持久化存储到多个 bookie（存储节点）上。因此，持久化主题上的消息数据可以在 broker 重启和订阅者故障转移后仍然存活。

然而，Pulsar 也支持**非持久化主题**，这类主题上的消息*永远不会*持久化到磁盘，只存在于内存中。使用非持久化传递时，杀死 Pulsar [broker](reference-terminology.md#broker) 或断开主题的订阅者意味着该（非持久化）主题上所有传输中的消息都会丢失，这意味着客户端可能会看到消息丢失。

非持久化主题的名称格式如下（注意名称中的 `non-persistent`）：

```http
non-persistent://tenant/namespace/topic
```

> 有关非持久化主题的更多高级信息，请参阅[概念和架构](concepts-messaging.md#non-persistent-topics)文档。

## 使用

要使用非持久化主题，你需要在 Pulsar broker 配置中[启用](#enable)它们，并在与其交互时通过名称来区分它们。例如，这个 [`pulsar-client produce`](reference-cli-tools.md) 命令将在独立集群的非持久化主题上生成一条消息：

```bash
bin/pulsar-client produce non-persistent://public/default/example-np-topic \
  --num-produce 1 \
  --messages "This message will be stored only in memory"
```

> 有关从管理员角度对非持久化主题的更详细指南，请参阅[非持久化主题](admin-api-topics.md)指南。

## 启用

要在 Pulsar broker 中启用非持久化主题，[`enableNonPersistentTopics`](reference-configuration.md#broker-enableNonPersistentTopics) 必须设置为 `true`。这是默认设置，因此你不需要采取任何操作来启用非持久化消息传递。

> #### 独立模式配置
> 如果你在独立模式下运行 Pulsar，相同的可配置参数可在 [`standalone.conf`](reference-configuration.md#standalone) 配置文件中使用。

如果你想在 broker 中*仅*启用非持久化主题，可以将 [`enablePersistentTopics`](reference-configuration.md#broker-enablePersistentTopics) 参数设置为 `false`，并将 `enableNonPersistentTopics` 参数设置为 `true`。

## 使用 CLI 管理

可以使用 [`pulsar-admin non-persistent`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=topics) 命令行界面管理非持久化主题。使用该界面，你可以执行诸如[创建分区非持久化主题](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=create-partitioned-topic)、[获取非持久化主题的统计信息](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=stats)、[列出命名空间下的非持久化主题](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/topics?id=list-partitioned-topics)等操作。

## 与 Pulsar 客户端一起使用

除了确保使用带有 `non-persistent` 作为主题类型的正确[主题名称](#use)外，你不需要对 Pulsar 客户端进行任何更改来使用非持久化消息传递。