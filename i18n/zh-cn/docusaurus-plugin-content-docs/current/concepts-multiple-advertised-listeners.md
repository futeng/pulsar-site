---
id: concepts-multiple-advertised-listeners
title: 多个公告监听器
sidebar_label: "多个公告监听器"
description: 全面了解 Pulsar 中的公告监听器。
---

在生产环境中，Pulsar 集群通常需要为来自不同网络的客户端提供服务。处理外部连接的传统方法是部署[Pulsar 代理](administration-proxy.md)，但在某些情况下，你可能希望直接客户端到 broker 的连接，而不使用[Pulsar 代理](administration-proxy.md)。多个公告监听器通过允许 broker 向不同的客户端公告不同的地址来实现这一点。

## 查找机制

当客户端对主题执行查找时：

1. 客户端使用服务 URL 连接到 broker。
2. broker 处理查找请求并确定哪个 broker 拥有该主题。
3. broker 根据客户端连接的监听器返回适当的公告地址。
4. 客户端使用返回的地址直接连接到主题所有者。

通过正确配置`bindAddresses`，broker 根据客户端连接的端口自动确定要返回的公告地址。

对于服务 URL，应该有一个负载均衡器连接到任何可用的 broker。

## 用例：不使用 Pulsar 代理的直接客户端到 broker 连接

当客户端需要直接连接到 broker（绕过 Pulsar 代理）时，多个公告监听器是必不可少的。这种方法特别适用于：

- 通过消除代理层减少网络跳数
- 在某些场景中简化部署架构
- 某些工作负载的潜在性能改进
- 偏好直接 broker 连接的环境

## 网络架构考虑

> **注意**：Pulsar 部署期望网络周边安全。这种类型的部署应仅在受信任的网络和受信任的客户端中使用，同时确保妥善处理网络安全。

在具有多个网络的典型部署中：

1. **内部网络**：在私有网络内，broker 可通过标准端口上的私有地址（如 10.x.x.x、172.16.x.x 或 192.168.x.x）访问。

2. **外部网络**：对于私有网络外部的客户端，网络地址转换（NAT）将外部地址/端口映射到内部 broker 地址/端口。

如果没有正确的配置，外部客户端在主题查找期间会收到内部 broker 地址，使得成功连接变得不可能。

## 公告监听器配置

Pulsar 引入了三个关键配置选项来解决这个问题：

- **advertisedListeners**：指定 broker 向客户端公告的多个地址。
- **bindAddresses**：将每个公告监听器映射到特定的本地绑定地址和端口。
- **internalListenerName**：指定 broker 用于内部通信的监听器。

### 配置详情

- **advertisedListeners**：格式为`<listener_name>:<protocol>://<host>:<port>,...`。示例：
  `advertisedListeners=internal:pulsar://192.168.1.11:6650,internal:pulsar+ssl://192.168.1.11:6651,external:pulsar://external-broker-1.example.com:6650,external:pulsar+ssl://external-broker-1.example.com:6651`

- **bindAddresses**：将每个监听器名称映射到本地绑定地址和端口。示例：
  `bindAddresses=internal:pulsar://0.0.0.0:6650,internal:pulsar+ssl://0.0.0.0:6651,external:pulsar://0.0.0.0:16650,external:pulsar+ssl://0.0.0.0:16651`

- **internalListenerName**：指定用于内部通信的监听器。示例：
  `internalListenerName=internal`

## 配置示例

这是一个完整的示例，显示如何配置具有多个公告监听器的 broker：

```properties
# 为内部和外部客户端定义公告监听器
advertisedListeners=internal:pulsar://192.168.1.11:6650,internal:pulsar+ssl://192.168.1.11:6651,external:pulsar://external-broker-1.example.com:6650,external:pulsar+ssl://external-broker-1.example.com:6651

# 为每个监听器定义绑定地址
bindAddresses=internal:pulsar://0.0.0.0:6650,internal:pulsar+ssl://0.0.0.0:6651,external:pulsar://0.0.0.0:16650,external:pulsar+ssl://0.0.0.0:16651

# 指定内部监听器名称
internalListenerName=internal
```

### 网络配置

要使其工作：

1. 如果你使用 DNS 名称，请为每个 broker 实例注册一个唯一的名称（例如，`external-broker-1.example.com`、`external-broker-2.example.com`等）。
2. 配置你的网络网关或防火墙，为每个 broker 实例处理代理或 NAT，以便外部 IP 和端口代理到内部 IP 和外部监听器端口。
3. 添加一个负载均衡器，代理到外部监听器端口上任何健康的可用 broker。

## 客户端配置

使用正确配置的 broker，客户端可以在不指定监听器名称的情况下连接：

在此示例中，"private-brokers.internal" 是可用 broker 的内部负载均衡器，"external-brokers.example.com" 是可用 broker 的外部负载均衡器，连接到每个 broker 上外部监听器的绑定地址端口。

```java
// 使用标准协议的内部客户端
PulsarClient internalClient = PulsarClient.builder()
    .serviceUrl("pulsar://private-brokers.internal:6650")
    .build();

// 使用 SSL 的内部客户端
PulsarClient internalSecureClient = PulsarClient.builder()
    .serviceUrl("pulsar+ssl://private-brokers.internal:6651")
    .build();

// 使用 SSL 的外部客户端
PulsarClient externalClient = PulsarClient.builder()
    .serviceUrl("pulsar+ssl://external-brokers.example.com:6651")
    .build();
```

> **注意**：虽然较旧的 Pulsar 文档建议在客户端配置中使用`listenerName`参数，但在正确配置`bindAddresses`的情况下，这种方法不再必要。Pulsar 查找机制将根据绑定端口返回适当的公告地址。

## Kubernetes 部署建议

虽然 Pulsar 代理通常推荐用于 Kubernetes 部署，但在需要直接 broker 访问时可以使用多个公告监听器。
Apache Pulsar Helm chart 目前不支持这种类型的部署。这些指令作为在 Kubernetes 部署中使用`advertisedListeners`功能的一般指导提供。
在 Kubernetes 部署中有多种方法处理这个问题。在某些服务网格配置中也需要公告监听器。

NodePort 部署建议：

- 为 broker 状态集中的每个 broker pod 创建单独的 NodePort（或 LoadBalancer）服务，映射到外部监听器绑定端口。
- 为集群创建一个单独的 NodePort（或 LoadBalancer）服务，用作客户端的 serviceUrl，映射到外部监听器绑定端口。

```properties
# 内部和外部访问的公告监听器
advertisedListeners=internal:pulsar://192.168.1.11:6650,internal:pulsar+ssl://192.168.1.11:6651,external:pulsar://198.51.100.17:30650,external:pulsar+ssl://198.51.100.17:31650

# 内部和外部访问的不同端口的绑定地址
bindAddresses=internal:pulsar://0.0.0.0:6650,internal:pulsar+ssl://0.0.0.0:6651,external:pulsar+ssl://0.0.0.0:16651

# 指定内部监听器名称
internalListenerName=internal
```

在上面的示例中：

- `192.168.1.11` 是特定 broker pod 的 pod IP。IP 或主机名应在 broker 启动时在此配置中动态设置。
- `198.51.100.17` 是 k8s 节点的外部 IP。在某些情况下，这可以基于`status.hostIP` Kubernetes 信息动态设置。
- `30650`和`31650`是为此 broker pod 分配的特定 NodePort。这可以通过将 StatefulSet pod 索引（`metadata.labels['statefulset.kubernetes.io/pod-index']`）添加到基础端口号来动态计算。