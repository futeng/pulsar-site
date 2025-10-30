---
id: security-encryption
title: End-to-End Encryption
sidebar_label: "End-to-End Encryption"
description: Get a comprehensive understanding of the workflow, usage, and troubleshooting of end-to-end encryption in Pulsar.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

应用程序可以使用 Pulsar 端到端加密（E2EE）在生产者端加密消息，在消费者端解密消息。你可以使用应用程序配置的公钥和私钥对来执行加密和解密。只有拥有有效密钥的消费者才能解密加密的消息。

## 端到端加密在 Pulsar 中如何工作

Pulsar 使用动态生成的对称会话密钥来加密消息（数据）。你可以使用应用程序提供的 ECDSA（椭圆曲线数字签名算法）或 RSA（Rivest–Shamir–Adleman）密钥对来加密会话密钥（数据密钥），这样你就不必与所有人共享秘密。

下图说明了 Pulsar 如何在生产者端加密消息，在消费者端解密消息。

![End-to-end encryption in Pulsar](/assets/pulsar-encryption.svg)

Pulsar 中端到端加密的工作流程如下。

1. 生产者定期生成会话密钥（每 4 小时或发布一定数量的消息后）以使用对称算法（如 AES）加密消息有效载荷，并每 4 小时获取一次非对称公钥。密文被打包为消息体。
2. 生产者使用消费者的公钥使用非对称算法（如 RSA）加密会话密钥，并在消息头中添加带有加密秘密的别名。
3. 消费者读取消息头并使用其私钥解密会话密钥。
4. 消费者使用解密的会话密钥解密消息有效载荷。

:::note

* 消费者的公钥与生产者共享，但只有消费者可以访问私钥。
* Pulsar 不会在 Pulsar 服务的任何地方存储加密密钥。如果你丢失或删除私钥，你的消息将永久丢失且无法恢复。

:::

Pulsar 隔离了密钥管理，只提供接口（`CryptoKeyReader`）来访问公钥。对于生产系统，强烈建议使用云密钥管理（[KMS](https://docs.aws.amazon.com/kms/latest/developerguide/symmetric-asymmetric.html) 或 [CKM](https://cloud.google.com/security-key-management)）或 PKI（公钥基础设施，如 freeIPA）来扩展/实现 `CryptoKeyReader`。

如果生成的消息跨应用程序边界消费，你需要确保其他应用程序中的消费者可以访问可以解密消息的私钥之一。你可以通过两种方式做到这一点：
- 访问消费者应用程序提供的公钥，并将其添加到生产者的密钥中。
- 授予对生产者使用的密钥对中某个私钥的访问权限。

## 入门指南

要在 Pulsar 中启用端到端加密，请完成以下步骤。

### 前提条件

* Pulsar Java/Python/C++/Node.js 客户端 2.7.1 或更高版本。
* Pulsar Go 客户端 0.6.0 或更高版本。

### 生成密钥对

首先，生成用于加密的公钥和私钥对：

```bash
# 生成 RSA 密钥对
openssl genrsa -out private_key.pem 2048
openssl rsa -in private_key.pem -pubout -out public_key.pem

# 或者生成 ECDSA 密钥对
openssl ecparam -name prime256v1 -genkey -noout -out private_key.pem
openssl ec -in private_key.pem -pubout -out public_key.pem
```

### 实现 CryptoKeyReader

你需要实现 `CryptoKeyReader` 接口来管理密钥：

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"}]}>
<TabItem value="Java">

```java
public class FileBasedCryptoKeyReader implements CryptoKeyReader {
    private final Map<String, PublicKey> publicKeyMap = new HashMap<>();
    private final Map<String, PrivateKey> privateKeyMap = new HashMap<>();

    public FileBasedCryptoKeyReader(String publicKeyFile, String privateKeyFile)
            throws Exception {
        // 加载公钥
        try (BufferedReader reader = new BufferedReader(new FileReader(publicKeyFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 2) {
                    PublicKey publicKey = loadPublicKey(parts[1]);
                    publicKeyMap.put(parts[0], publicKey);
                }
            }
        }

        // 加载私钥
        try (BufferedReader reader = new BufferedReader(new FileReader(privateKeyFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 2) {
                    PrivateKey privateKey = loadPrivateKey(parts[1]);
                    privateKeyMap.put(parts[0], privateKey);
                }
            }
        }
    }

    @Override
    public PublicKey getPublicKey(String keyName, KeyMeta keyMeta) throws Exception {
        return publicKeyMap.get(keyName);
    }

    @Override
    public PrivateKey getPrivateKey(String keyName, KeyMeta keyMeta) throws Exception {
        return privateKeyMap.get(keyName);
    }

    private PublicKey loadPublicKey(String filePath) throws Exception {
        // 实现加载公钥的逻辑
    }

    private PrivateKey loadPrivateKey(String filePath) throws Exception {
        // 实现加载私钥的逻辑
    }
}
```

</TabItem>
<TabItem value="Python">

```python
class FileBasedCryptoKeyReader(CryptoKeyReader):
    def __init__(self, public_key_file, private_key_file):
        self.public_keys = {}
        self.private_keys = {}

        # 加载公钥
        with open(public_key_file, 'r') as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) == 2:
                    self.public_keys[parts[0]] = self._load_public_key(parts[1])

        # 加载私钥
        with open(private_key_file, 'r') as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) == 2:
                    self.private_keys[parts[0]] = self._load_private_key(parts[1])

    def get_public_key(self, key_name, key_meta):
        return self.public_keys.get(key_name)

    def get_private_key(self, key_name, key_meta):
        return self.private_keys.get(key_name)

    def _load_public_key(self, file_path):
        # 实现加载公钥的逻辑
        pass

    def _load_private_key(self, file_path):
        # 实现加载私钥的逻辑
        pass
```

</TabItem>
</Tabs>
````

### 配置端到端加密

在生产者和消费者中启用端到端加密：

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"}]}>
<TabItem value="Java">

```java
// 生产者配置
CryptoKeyReader cryptoKeyReader = new FileBasedCryptoKeyReader(
    "public_keys.txt",
    "private_keys.txt"
);

Producer<byte[]> producer = client.newProducer()
    .topic("my-topic")
    .encryptionKey("my-app-key")  // 用于加密的密钥名称
    .addEncryptionKey("consumer-app-key")  // 消费者的公钥
    .cryptoKeyReader(cryptoKeyReader)
    .create();

// 消费者配置
Consumer<byte[]> consumer = client.newConsumer()
    .topic("my-topic")
    .subscriptionName("my-subscription")
    .cryptoKeyReader(cryptoKeyReader)
    .subscribe();
```

</TabItem>
<TabItem value="Python">

```python
# 生产者配置
crypto_key_reader = FileBasedCryptoKeyReader(
    "public_keys.txt",
    "private_keys.txt"
)

producer = client.create_producer(
    topic="my-topic",
    encryption_key="my-app-key",  # 用于加密的密钥名称
    add_encryption_key="consumer-app-key",  # 消费者的公钥
    crypto_key_reader=crypto_key_reader
)

# 消费者配置
consumer = client.subscribe(
    topic="my-topic",
    subscription_name="my-subscription",
    crypto_key_reader=crypto_key_reader
)
```

</TabItem>
</Tabs>
````

## 最佳实践

* **密钥管理**：使用专门的密钥管理服务（如 AWS KMS、HashiCorp Vault）来管理密钥。
* **密钥轮换**：定期轮换加密密钥以提高安全性。
* **密钥安全**：确保私钥的安全存储和访问控制。
* **监控**：监控加密和解密操作的性能影响。

## 故障排除

### 常见问题

1. **解密失败**：
   * 检查消费者是否有正确的私钥。
   * 验证密钥格式和算法是否匹配。

2. **密钥加载错误**：
   * 确认密钥文件路径和权限。
   * 验证密钥文件格式是否正确。

3. **性能问题**：
   * 端到端加密会增加延迟，监控性能影响。
   * 考虑使用硬件加速来提高加密性能。