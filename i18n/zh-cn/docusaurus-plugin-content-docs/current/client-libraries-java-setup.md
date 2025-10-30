---
id: client-libraries-java-setup
title: 设置 Java 客户端
sidebar_label: "设置"
description: 学习如何在 Pulsar 中设置 Java 客户端库。
---

要在 Pulsar 中设置 Java 客户端，请完成以下步骤。

## 步骤 1：安装 Java 客户端库

Pulsar Java 客户端库的最新版本可通过 [Maven Central](http://search.maven.org/#artifactdetails%7Corg.apache.pulsar%7Cpulsar-client%7C@pulsar:version@%7Cjar) 获取。要使用最新版本，请将 `pulsar-client` 库添加到您的构建配置中。

:::tip

- [`pulsar-client`](https://search.maven.org/artifact/org.apache.pulsar/pulsar-client) 和 [`pulsar-client-admin`](https://search.maven.org/artifact/org.apache.pulsar/pulsar-client-admin) 通过 [maven-shade-plugin](https://maven.apache.org/plugins/maven-shade-plugin/) 对依赖进行 Shade 处理，以避免底层依赖包（如 Netty）的冲突。如果您不想手动管理依赖冲突，可以使用它们。
- [`pulsar-client-original`](https://search.maven.org/artifact/org.apache.pulsar/pulsar-client-original) 和 [`pulsar-client-admin-original`](https://search.maven.org/artifact/org.apache.pulsar/pulsar-client-admin-original) **不会**对依赖进行 Shade 处理。如果您想手动管理依赖，可以使用它们。

:::

### Maven

如果您使用 Maven，请将以下信息添加到 `pom.xml` 文件中。

```xml
<!-- 在您的 <properties> 块中 -->
<pulsar.version>@pulsar:version@</pulsar.version>

<!-- 在您的 <dependencies> 块中 -->
<dependency>
  <groupId>org.apache.pulsar</groupId>
  <artifactId>pulsar-client</artifactId>
  <version>${pulsar.version}</version>
</dependency>
```

### Gradle

如果您使用 Gradle，请将以下信息添加到 `build.gradle` 文件中。

```groovy
def pulsarVersion = '@pulsar:version@'

dependencies {
	implementation "org.apache.pulsar:pulsar-client:${pulsarVersion}"
}
```

### Pulsar BOM

虽然上述依赖足以获取 Pulsar Java 客户端，但建议也使用 [Pulsar BOM](https://github.com/apache/pulsar/blob/master/pip/pip-326.md) 来确保所有 Pulsar 依赖（直接和传递的）都处于相同的预期版本。
为了使用 BOM，之前的说明需要稍作修改：

#### Maven {#pulsar-bom-maven}

:::note

请注意，当使用 Spring Boot 和默认的 Maven 构建时，需要使用 Spring Boot Maven 插件功能来配置 Pulsar 版本。请参阅 [使用 Maven 的 Spring Boot](#spring-boot-maven) 部分了解详细信息。

:::

如果您使用 Maven，请将以下信息添加到 `pom.xml` 文件中。

```xml
<!-- 在您的 <properties> 块中 -->
<pulsar.version>@pulsar:version@</pulsar.version>

<!-- 在您的 <dependencyManagement>/<dependencies> 块中 -->
<dependency>
  <groupId>org.apache.pulsar</groupId>
  <artifactId>pulsar-bom</artifactId>
  <version>${pulsar.version}</version>
  <type>pom</type>
  <scope>import</scope>
</dependency>

<!-- 在您的 <dependencies> 块中 -->
<dependency>
  <groupId>org.apache.pulsar</groupId>
  <artifactId>pulsar-client</artifactId>
</dependency>
```

#### Gradle {#pulsar-bom-gradle}

如果您使用 Gradle，请将以下信息添加到 `build.gradle` 文件中。

:::note

请注意，当使用 Spring Boot 和默认的带有 Spring Dependency Management 插件（`io.spring.dependency-management`）的 Gradle 构建时，需要使用 Spring Dependency Management 插件功能来配置 Pulsar 版本。请参阅 [使用 Gradle 的 Spring Boot](#spring-boot-gradle) 部分了解详细信息。

:::

```groovy
def pulsarVersion = '@pulsar:version@'

dependencies {
  implementation enforcedPlatform("org.apache.pulsar:pulsar-bom:${pulsarVersion}")
  implementation 'org.apache.pulsar:pulsar-client'
}
```

注意，`pulsar-client` 依赖的版本号现在被省略了，因为 Pulsar BOM 指定了要使用的版本。

### Spring Boot

您可以在 [Spring Boot 文档](https://docs.spring.io/spring-boot/reference/messaging/pulsar.html) 中找到有关将 Pulsar 与 Spring Boot 一起使用的更多信息。

#### 使用 Maven 的 Spring Boot {#spring-boot-maven}

Spring Boot [依赖版本属性](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-dependency-versions.html)定义了 `pulsar.version` 和 `pulsar-reactive.version` 用于控制 Pulsar Java 客户端版本和 Pulsar Reactive 客户端版本。

```xml
<!-- 在您的 <properties> 块中 -->
<pulsar.version>@pulsar:version@</pulsar.version>

<!-- 在您的 <dependencies> 块中 -->
<!-- Pulsar Java 客户端将作为 spring-boot-starter-pulsar 依赖的传递依赖自动添加到依赖中 -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-pulsar</artifactId>
</dependency>
```

#### 使用 Gradle 的 Spring Boot {#spring-boot-gradle}

请注意，当在 Gradle 中使用 Spring Dependency Management 插件（`io.spring.dependency-management`）时，需要使用 Spring Dependency Management 插件功能来配置 Pulsar 版本。
Spring Boot [依赖版本属性](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-dependency-versions.html)定义了 `pulsar.version` 和 `pulsar-reactive.version` 用于控制 Pulsar Java 客户端版本和 Pulsar Reactive 客户端版本。

要在使用 Gradle 的 Spring Boot 应用程序中为 Pulsar Java 客户端使用特定的 Pulsar 版本，请在 Spring Boot 项目的 `build.gradle` 文件中添加以下内容：

```groovy
// 或者，您可以在 `gradle.properties` 文件中设置 `pulsar.version` 属性。
ext['pulsar.version'] = '@pulsar:version@'

// Pulsar Java 客户端将作为 spring-boot-starter-pulsar 依赖的传递依赖自动添加到依赖中
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-pulsar'
}
```

## 步骤 2：连接到 Pulsar 集群

要使用客户端库连接到 Pulsar，您需要指定一个 [Pulsar 协议](developing-binary-protocol.md) URL。

您可以为特定集群分配 Pulsar 协议 URL，并使用 `pulsar` 协议方案。以下是使用默认端口 `6650` 的 `localhost` 示例：

```http
pulsar://localhost:6650
```

如果您有多个 broker，请用逗号分隔 `IP:port`：

```http
pulsar://localhost:6550,localhost:6651,localhost:6652
```

如果您使用 [mTLS](security-tls-authentication.md) 认证，请在协议方案中添加 `+ssl`：

```http
pulsar+ssl://pulsar.us-west.example.com:6651
```

## Java 客户端性能考虑 {#java-client-performance}

### 增加内存限制

对于高吞吐量应用程序，您可以使用 Java 客户端构建器的 [`memoryLimit` 配置选项](https://pulsar.apache.org/api/client/4.0.x/org/apache/pulsar/client/api/ClientBuilder.html#memoryLimit(long,org.apache.pulsar.client.api.SizeUnit))增加内存量。默认限制为 64MB，这对于高吞吐量应用程序来说通常太低。

默认情况下，Java 应用程序对直接内存分配有限制。分配受 `-XX:MaxDirectMemorySize` JVM 选项限制。在许多 JVM 实现中，除非明确设置，否则默认为最大堆大小。分配发生在 Java 堆之外。

### 启用优化的 Netty 直接内存缓冲区访问

Pulsar Java 客户端底层使用 [Netty](https://netty.io/)，并使用 Netty 直接缓冲区进行数据传输。

Netty 有一项功能允许优化的直接内存缓冲区访问。此功能使 Netty 能够使用低级 API（如 `sun.misc.Unsafe`）进行直接内存操作，这提供了更快的直接缓冲区分配和释放。
更快的释放可以帮助避免直接内存耗尽和 `java.lang.OutOfMemoryError: Direct buffer memory` 错误。当 Netty 内存池和内存分配器无法足够快地将内存释放回操作系统时，可能会发生这些错误。

要在 Java 11 之后的 Java 客户端中启用此功能，您需要将以下 JVM 选项添加到使用 Java 客户端的应用程序中：

- `--add-opens java.base/java.nio=ALL-UNNAMED`
- `--add-opens java.base/jdk.internal.misc=ALL-UNNAMED`

此外，您需要添加以下 JVM 选项之一：

- `-Dorg.apache.pulsar.shade.io.netty.tryReflectionSetAccessible=true` 用于默认的 Shade 处理的 Pulsar 客户端
- `-Dio.netty.tryReflectionSetAccessible=true` 用于未 Shade 处理的"原始" Pulsar 客户端

### 在本机库加载失败时启用优化的校验和计算

Pulsar Java 客户端使用 BookKeeper 客户端中的 `com.scurrilous.circe.checksum.Crc32cIntChecksum` 类进行校验和计算。为了优化的校验和计算，Pulsar 尝试加载 `libcirce-checksum` 本机库。当该库不可用时，使用 `com.scurrilous.circe.checksum.Java9IntHash` 类。
这只在 JVM 选项中传递 `--add-opens java.base/java.util.zip=ALL-UNNAMED` 时才有效。
当缺少所需的 JVM 选项时，错误消息将是 `Unable to use reflected methods:
java.lang.reflect.InaccessibleObjectException: Unable to make private static int java.util.zip.CRC32C.updateBytes(int,byte[],int,int) accessible: module java.base does not "opens java.util.zip" to unnamed module`