---
id: cookbooks-bookkeepermetadata
title: BookKeeper Ledger元数据
description: 全面了解 BookKeeper Ledger元数据。
---

Pulsar 将数据存储在 BookKeeper Ledger上，你可以通过检查附加到Ledger的元数据来了解Ledger的内容。
此类元数据存储在 ZooKeeper 上，并且可以使用 BookKeeper API 读取。

当前元数据的描述：

| 范围  | 元数据名称 | 元数据值 |
| ------------- | ------------- | ------------- |
| 所有Ledger  | application  | 'pulsar' |
| 所有Ledger  | component  | 'managed-ledger', 'schema', 'compacted-topic' |
| 托管Ledger | pulsar/managed-ledger | Ledger的名称 |
| 游标 | pulsar/cursor | 游标的名称 |
| 压缩主题 | pulsar/compactedTopic | 原始主题的名称 |
| 压缩主题 | pulsar/compactedTo | 最后压缩消息的 ID |