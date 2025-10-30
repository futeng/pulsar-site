---
id: client-libraries-cpp
title: Pulsar C++ 客户端
sidebar_label: "C++ 客户端"
---

你可以使用 Pulsar C++ 客户端在 C++ 中创建 Pulsar [生产者](concepts-clients.md#producer)、[消费者](concepts-clients.md#consumer)和[读取器](concepts-clients.md#reader)。Pulsar C++ 客户端中的所有方法都是线程安全的。

## 入门指南

1. [设置 C++ 客户端库](client-libraries-cpp-setup.md)
2. [初始化 C++ 客户端](client-libraries-cpp-initialize.md)
3. [使用 C++ 客户端](client-libraries-cpp-use.md)

## 后续步骤

- [使用客户端](client-libraries-clients.md)
- [使用生产者](client-libraries-producers.md)
- [使用消费者](client-libraries-consumers.md)
- [使用读取器](client-libraries-readers.md)

## 参考文档

- [C++ 客户端 API 文档](@pulsar:apidoc:cpp@)
  - [客户端配置](@pulsar:apidoc:cpp@/classpulsar_1_1_client_configuration.html)
  - [生产者配置](@pulsar:apidoc:cpp@/classpulsar_1_1_producer_configuration.html)
  - [消费者配置](@pulsar:apidoc:cpp@/classpulsar_1_1_consumer_configuration.html)
  - [读取器配置](@pulsar:apidoc:cpp@/classpulsar_1_1_reader_configuration.html)
- [发布说明](/release-notes/client-cpp)
- [代码示例](https://github.com/apache/pulsar-client-cpp/tree/main/examples)
- [支持的 Schema 类型](https://github.com/apache/pulsar-client-cpp/blob/main/include/pulsar/Schema.h)
- [客户端功能矩阵](/client-feature-matrix/)

## 3.0.0 及更高版本的变更

新版本的 Pulsar C++ 客户端从 3.0.0 开始，已不再与自 2.10.x 以来的 Pulsar 保持一致。有关最新发布版本，请参阅[下载](/download/)页面。

以 [3.0.0 版本](pathname:///download#pulsar-c-client)为例，有以下子目录：
- apk-arm64：适用于 ARM64 架构的 Alpine Linux 包
- apk-x86_64：适用于 x64 架构的 Alpine Linux 包
- deb-arm64：适用于 ARM64 架构的基于 Debian 的 Linux 包
- deb-x86_64：适用于 x64 架构的基于 Debian 的 Linux 包
- rpm-arm64：适用于 ARM64 架构的基于 RedHat 的 Linux 包
- rpm-x86_64：适用于 x64 架构的基于 RedHat 的 Linux 包

上述这些 Linux 包都包含安装在 `/usr/include` 下的 C++ 头文件和安装在 `/usr/lib` 下的以下库：
- libpulsar.so：静态链接第三方依赖项的共享库
- libpulsar.a：静态库
- libpulsarwithdeps.a：包含所有第三方依赖项的胖静态库

以下是为名为 `main.cc` 的 C++ 源文件链接这些库的示例：

```bash
# 链接到 libpulsar.so
g++ -std=c++11 main.cc -lpulsar
# 链接到 libpulsarwithdeps.a
g++ -std=c++11 main.cc /usr/lib/libpulsarwithdeps.a -lpthread -ldl
# 链接到 libpulsar.a
g++ -std=c++11 main.cc /usr/lib/libpulsar.a \
  -lprotobuf -lcurl -lssl -lcrypto -lz -lzstd -lsnappy -lpthread -ldl
```

:::caution

链接到 `libpulsar.a` 对初学者来说可能很困难，因为第三方依赖项必须兼容。例如，对于 Pulsar C++ 客户端 3.0.0，protobuf 版本必须是 3.20.0 或更高版本。最好改为链接到 `libpulsarwithdeps.a`。

:::

:::danger

在 3.0.0 之前，有一个 `libpulsarnossl.so`，现在已被移除。

:::