---
id: transactions-guarantee
title: Transactions Guarantee
sidebar_label: "Transactions Guarantee"
---

Pulsar 事务支持以下保证。

## 原子多分区写入和多订阅确认
事务支持向多个主题和分区的原子写入。事务中的一批消息可以从多个分区接收、生产到多个分区，并被多个分区确认。事务中涉及的所有操作作为单个单元成功或失败。

## 读取事务消息
事务中的所有消息只有在事务提交后才对消费者可用。

## 确认事务消息
在使用事务 ID 确认消息时，消息只被订阅下的消费者成功确认一次。