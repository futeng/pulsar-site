---
id: cookbooks-bookkeepermetadata
title: BookKeeper 账本元数据
description: 全面了解 BookKeeper 账本元数据。
---

Pulsar 将数据存储在 BookKeeper 账本上，你可以通过检查附加到账本的元数据来了解账本的内容。
此类元数据存储在 ZooKeeper 上，并且可以使用 BookKeeper API 读取。

当前元数据的描述：

| 范围  | 元数据名称 | 元数据值 |
| ------------- | ------------- | ------------- |
| 所有账本  | application  | 'pulsar' |
| 所有账本  | component  | 'managed-ledger', 'schema', 'compacted-topic' |
| 托管账本 | pulsar/managed-ledger | 账本的名称 |
| 游标 | pulsar/cursor | 游标的名称 |
| 压缩主题 | pulsar/compactedTopic | 原始主题的名称 |
| 压缩主题 | pulsar/compactedTo | 最后压缩消息的 ID |