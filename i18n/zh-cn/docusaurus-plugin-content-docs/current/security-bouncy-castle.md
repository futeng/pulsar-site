---
id: security-bouncy-castle
title: Bouncy Castle Providers
sidebar_label: "Bouncy Castle Providers"
description: Get a comprehensive understanding of concepts and packaging methods of BouncyCastle in Pulsar.
---

## BouncyCastle 介绍

`Bouncy Castle` 是一个 Java 库，它补充了默认的 Java 加密扩展（JCE），提供了比 Sun 提供的默认 JCE 更多的密码套件和算法。

除此之外，`Bouncy Castle` 还有很多实用工具，用于读取像 PEM 和 ASN.1 这样的神秘格式，这些格式没有正常人想要重写。

在 Pulsar 中，安全和加密功能依赖于 BouncyCastle JAR。有关详细安装和配置 Bouncy Castle FIPS 的信息，请参阅 [BC FIPS 文档](https://www.bouncycastle.org/documentation.html)，特别是**用户指南**和**安全策略** PDF 文件。

`Bouncy Castle` 提供 [FIPS](https://www.bouncycastle.org/fips_faq.html) 和非 FIPS 版本。但在 JVM 中，你不能同时包含这两个版本，需要在包含另一个版本之前排除当前版本。

在 Pulsar 中，安全和加密方法也依赖于 `Bouncy Castle`，特别是在 [mTLS 认证](security-tls-authentication.md) 和[传输加密](security-encryption.md) 中。本文档包含在使用 Pulsar 时 BouncyCastle FIPS(BC-FIPS) 和非 FIPS(BC-non-FIPS) 版本之间的配置。

## BouncyCastle 模块在 Pulsar 中的打包方式

在 Pulsar 的 `bouncy-castle` 模块中，我们提供 2 个子模块：`bouncy-castle-bc`（用于非 FIPS 版本）和 `bouncy-castle-bcfips`（用于 FIPS 版本），将 BC JAR 一起打包，使 `Bouncy Castle` 的包含和排除更容易。

为了实现这个目标，我们需要将几个 `bouncy-castle` JAR 一起打包到 `bouncy-castle-bc` 或 `bouncy-castle-bcfips` JAR 中。
每个原始的 bouncy-castle JAR 都与安全相关，因此 BouncyCastle 认真地为每个 JAR 提供签名。
但是当我们重新打包时，Maven shade 会展开 BouncyCastle JAR 文件，将签名放入 META-INF 中，
这些签名对于这个新的 uber-jar 是无效的（签名仅用于原始的 BC JAR）。
通常，你会遇到像 `java.lang.SecurityException: Invalid signature file digest for Manifest main attributes` 这样的错误。

你可以在 mvn pom 文件中排除这些签名以避免上述错误。

```xml
<exclude>META-INF/*.SF</exclude>
<exclude>META-INF/*.DSA</exclude>
<exclude>META-INF/*.RSA</exclude>
```

但这也可能导致新的、神秘的错误，例如 `java.security.NoSuchAlgorithmException: PBEWithSHA256And256BitAES-CBC-BC SecretKeyFactory not available`
通过显式指定在哪里找到算法，如：`SecretKeyFactory.getInstance("PBEWithSHA256And256BitAES-CBC-BC","BC")`
它会得到真正的错误：`java.security.NoSuchProviderException: JCE cannot authenticate the provider BC`

因此，我们使用了[可执行打包插件](https://github.com/nthuemmel/executable-packer-maven-plugin)，它使用 jar-in-jar 方法在单个可执行 JAR 中保留 BouncyCastle 签名。

### 包含 BC-non-FIPS 的依赖

Pulsar 模块 `bouncy-castle-bc`，由 `bouncy-castle/bc/pom.xml` 定义，包含 Pulsar 所需的非 FIPS JAR，并打包为 jar-in-jar（需要提供 `<classifier>pkg</classifier>`）。

```xml
<dependency>
    <groupId>org.apache.pulsar</groupId>
    <artifactId>bouncy-castle-bc</artifactId>
    <version>${pulsar.version}</version>
    <classifier>pkg</classifier>
</dependency>
```

### 包含 BC-FIPS 的依赖

Pulsar 模块 `bouncy-castle-bcfips`，由 `bouncy-castle/bcfips/pom.xml` 定义，包含 Pulsar 所需的 FIPS JAR，并打包为 jar-in-jar（需要提供 `<classifier>pkg</classifier>`）。

```xml
<dependency>
    <groupId>org.apache.pulsar</groupId>
    <artifactId>bouncy-castle-bcfips</artifactId>
    <version>${pulsar.version}</version>
    <classifier>pkg</classifier>
</dependency>
```

## 在 Pulsar 中使用 BouncyCastle

### 默认配置

默认情况下，Pulsar 使用 BouncyCastle 的非 FIPS 版本。要使用 FIPS 版本，你需要：

1. 排除默认的 BouncyCastle 依赖
2. 包含 FIPS 版本的依赖

### 使用 FIPS 版本

要在 Pulsar 中使用 BouncyCastle FIPS 版本，你需要：

1. 更新你的 Maven 依赖：

   ```xml
   <dependency>
       <groupId>org.apache.pulsar</groupId>
       <artifactId>pulsar-client-all</artifactId>
       <version>${pulsar.version}</version>
       <exclusions>
           <exclusion>
               <groupId>org.apache.pulsar</groupId>
               <artifactId>bouncy-castle-bc</artifactId>
           </exclusion>
       </exclusions>
   </dependency>

   <dependency>
       <groupId>org.apache.pulsar</groupId>
       <artifactId>bouncy-castle-bcfips</artifactId>
       <version>${pulsar.version}</version>
       <classifier>pkg</classifier>
   </dependency>
   ```

2. 配置 Pulsar Broker 以使用 FIPS 提供者：

   ```properties
   # 在 conf/broker.conf 中
   cryptoProviderName=BCFIPS
   ```

## 安全和合规性考虑

* **FIPS 合规性**：FIPS 版本适用于需要 FIPS 140-2 合规性的环境。
* **性能考虑**：FIPS 版本可能有性能影响，建议进行基准测试。
* **算法支持**：确保你需要的算法在选择的 BouncyCastle 版本中可用。
* **许可证**：注意不同 BouncyCastle 版本的许可证要求。

## 故障排除

### 常见问题

1. **签名验证错误**：
   * 确保使用正确的 BouncyCastle 版本。
   * 检查类路径中是否存在冲突的 JAR。

2. **算法不可用**：
   * 验证算法在所选 BouncyCastle 版本中可用。
   * 确保正确配置了加密提供者。

3. **FIPS 合规性问题**：
   * 确保使用经过验证的 FIPS 版本。
   * 检查系统配置是否满足 FIPS 要求。