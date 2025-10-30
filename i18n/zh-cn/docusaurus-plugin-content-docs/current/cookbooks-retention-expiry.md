---
id: cookbooks-retention-expiry
title: 消息保留和过期
sidebar_label: "保留和过期"
description: 了解 Pulsar 中的消息保留和过期策略。
---

Pulsar 提供了灵活的消息保留和过期策略，允许您控制消息在主题上保留多长时间。

## 消息保留

消息保留策略确定消息在主题上保留多长时间，即使所有订阅都已消费了这些消息。

### 基于时间的保留

```bash
# 设置消息保留时间为 7 天
bin/pulsar-admin namespaces set-retention my-tenant/my-namespace \
  --time 7d
```

### 基于大小的保留

```bash
# 设置保留大小为 10 GB
bin/pulsar-admin namespaces set-retention my-tenant/my-namespace \
  --size 10G
```

### 基于时间和大小的组合

```bash
# 设置消息保留 7 天或 10 GB，以先到者为准
bin/pulsar-admin namespaces set-retention my-tenant/my-namespace \
  --time 7d --size 10G
```

## 消息过期

消息过期策略确定消息在多长时间未被消费后过期。

```bash
# 设置消息在 2 分钟后过期
bin/pulsar-admin namespaces set-message-ttl my-tenant/my-namespace \
  --ttl 2m
```

## 策略考虑

- 保留策略适用于已确认的消息
- 过期策略适用于未确认的消息
- 可以在租户、命名空间或主题级别设置这些策略
- 无限保留需要谨慎考虑存储成本