---
id: functions-deploy-cluster-encryption
title: 启用端到端加密
sidebar_label: "启用端到端加密"
description: 在 Pulsar 中为函数启用端到端加密。
---

要启用端到端[加密](security-encryption.md)，你可以在 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/) CLI 中指定 `--producer-config` 和 `--input-specs`，并配置应用程序的公私钥对。只有拥有有效密钥的消费者才能解密加密的消息。

加密/解密相关的配置 [`CryptoConfig`](functions-cli.md) 包含在 `ProducerConfig` 和 `inputSpecs` 中。关于 `CryptoConfig` 的具体可配置字段如下：

```java
public class CryptoConfig {
    private String cryptoKeyReaderClassName;
    private Map<String, Object> cryptoKeyReaderConfig;

    private String[] encryptionKeys;
    private ProducerCryptoFailureAction producerCryptoFailureAction;

    private ConsumerCryptoFailureAction consumerCryptoFailureAction;
}
```

- `producerCryptoFailureAction` 定义了生产者在加密数据失败时采取的操作。可用选项为 `FAIL` 或 `SEND`。
- `consumerCryptoFailureAction` 定义了消费者在解密接收到的数据失败时采取的操作。可用选项为 `FAIL`、`DISCARD` 或 `CONSUME`。

有关这些选项的更多信息，请参考[生产者配置](pathname:///reference/#/@pulsar:version_reference@/client/client-configuration-producer)和[消费者配置](pathname:///reference/#/@pulsar:version_reference@/client/client-configuration-consumer)。