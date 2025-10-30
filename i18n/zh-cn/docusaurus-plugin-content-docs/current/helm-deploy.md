---
id: helm-deploy
title: 在 Kubernetes 上部署 Pulsar 集群
sidebar_label: "部署"
description: 学习如何在 Kubernetes 上部署 Pulsar 集群。
---

在部署 Pulsar 集群之前，您需要[准备 Kubernetes 资源](helm-prepare.md)，然后继续以下步骤。

## 步骤 1: 选择配置选项

使用 Helm 的 `--set option.name=value` 命令行选项指定如何运行 Pulsar。在每个部分中，收集要与 `helm install` 命令结合使用的选项。

#### Kubernetes 命名空间

默认情况下，Pulsar Helm Chart 安装在名为 `pulsar` 的命名空间中。

```yaml
namespace: pulsar
```

要将 Pulsar Helm Chart 安装到不同的 Kubernetes 命名空间，您可以在 `helm install` 命令中包含此选项。

```bash
--set namespace=<different-k8s-namespace>
```

默认情况下，Pulsar Helm Chart 不会创建命名空间。

```yaml
namespaceCreate: false
```

要使用 Pulsar Helm Chart 自动创建 Kubernetes 命名空间，您可以在 `helm install` 命令中包含此选项。

```bash
--set namespaceCreate=true
```

#### 持久化

默认情况下，Pulsar Helm Chart 创建卷声明，期望动态供应器创建底层的持久卷。

```yaml
volumes:
  persistence: true
```

:::note

在安装 Pulsar 的生产实例之前，确保规划好存储设置以避免额外的存储迁移工作。因为在初始安装后，如果要更改存储设置，必须手动编辑 Kubernetes 对象。

:::

Pulsar Helm Chart 专为生产使用而设计。要在开发环境（如 Minikube）中使用 Pulsar Helm Chart，您可以通过在 `helm install` 命令中包含此选项来禁用持久化。

```bash
--set volumes.persistence=false
```

#### 亲和性

默认情况下，启用 `anti-affinity` 以确保相同组件的 Pod 可以运行在不同的节点上。

```yaml
affinity:
  anti_affinity: true
```

要在开发环境（如 Minikube）中使用 Pulsar Helm Chart，您可以通过在 `helm install` 命令中包含此选项来禁用 `anti-affinity`。

```bash
--set affinity.anti_affinity=false
```

#### 组件

Pulsar Helm Chart 专为生产使用而设计。它部署一个生产就绪的 Pulsar 集群，包括 Pulsar 核心组件和监控组件。

您可以通过打开/关闭单个组件来自定义要部署的组件。

```yaml
## 组件
##
## 控制为集群部署哪些 Apache Pulsar 组件
components:
  # zookeeper
  zookeeper: true
  # bookkeeper
  bookkeeper: true
  # bookkeeper - autorecovery
  autorecovery: true
  # broker
  broker: true
  # functions
  functions: true
  # proxy
  proxy: true
  # toolset
  toolset: true
  # pulsar manager
  pulsar_manager: true
```

##### 监控组件

Pulsar Helm Chart 使用依赖的 Helm chart [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts) 安装监控组件。您可以自定义此 Helm chart 以指定要安装哪些监控组件。这些组件默认启用。

```yaml
## 监控组件
##
## 控制为集群部署 kube-prometheus-stack Helm chart 的哪些组件
kube-prometheus-stack:
  # 完全控制此 Helm chart 的部署
  enabled: true
  # prometheus
  prometheus:
    enabled: true
  promtheus-node-exporter:
    enabled: true
  # grafana
  grafana:
    enabled: true
```

#### Docker 镜像

Pulsar Helm Chart 旨在实现可控升级。因此它可以为组件配置独立的镜像版本。您可以通过设置单个组件来自定义镜像。

```yaml
## 镜像
##
## 控制每个组件使用什么镜像
images:
  zookeeper:
    repository: apachepulsar/pulsar-all
    tag: latest
    pullPolicy: IfNotPresent
  bookie:
    repository: apachepulsar/pulsar-all
    tag: latest
    pullPolicy: IfNotPresent
  autorecovery:
    repository: apachepulsar/pulsar-all
    tag: latest
    pullPolicy: IfNotPresent
  broker:
    repository: apachepulsar/pulsar-all
    tag: latest
    pullPolicy: IfNotPresent
  proxy:
    repository: apachepulsar/pulsar-all
    tag: latest
    pullPolicy: IfNotPresent
  functions:
    repository: apachepulsar/pulsar-all
    tag: latest
  pulsar_manager:
    repository: apachepulsar/pulsar-manager
    tag: v0.3.0
    pullPolicy: IfNotPresent
    hasCommand: false
```

Pulsar Helm Chart 还允许您指定用于协调依赖 Pulsar 资源创建和连接的初始化容器所使用的镜像版本。

```yaml
## 镜像
##
## 控制 Pulsar 初始化容器使用什么镜像
pulsar_metadata:
  component: pulsar-init
  image:
    repository: apachepulsar/pulsar-all
    tag: latest
    pullPolicy: IfNotPresent
```

:::tip

如果使用私有 Docker 仓库或 pull-thru 缓存，必须相应地更改所有组件定义（包括 `pulsar_metadata` 组件）的 `repository` 配置选项。

:::

#### TLS

可以配置 Pulsar Helm Chart 以启用 TLS（传输层安全）来保护组件之间的所有流量。在启用 TLS 之前，您必须为所需组件配置 TLS 证书。

##### 使用 cert-manager 配置 TLS 证书

要使用 `cert-manager` 配置 TLS 证书，您必须在安装 Pulsar Helm Chart 之前安装 [cert-manager](#install-cert-manager)。成功安装 cert-manager 后，您可以将 `certs.internal_issuer.enabled` 设置为 `true`。因此，Pulsar Helm Chart 可以使用 `cert-manager` 为配置的组件生成 `selfsigning` TLS 证书。

```yaml
certs:
  internal_issuer:
    enabled: false
    component: internal-cert-issuer
    type: selfsigning
```

您还可以通过配置字段来自定义生成的 TLS 证书，如下所示。

```yaml
tls:
  # 生成证书的通用设置
  common:
    # 90d
    duration: 2160h
    # 15d
    renewBefore: 360h
    organization:
      - pulsar
    keySize: 4096
    keyAlgorithm: rsa
    keyEncoding: pkcs8
```

##### 启用 TLS

安装 `cert-manager` 后，您可以将 `tls.enabled` 设置为 `true` 来为整个集群启用 TLS 加密。

```yaml
tls:
  enabled: false
```

您还可以配置是否为单个组件启用 TLS 加密。

```yaml
tls:
  # 为代理生成证书的设置
  proxy:
    enabled: false
    cert_name: tls-proxy
  # 为 broker 生成证书的设置
  broker:
    enabled: false
    cert_name: tls-broker
  # 为 bookie 生成证书的设置
  bookie:
    enabled: false
    cert_name: tls-bookie
  # 为 zookeeper 生成证书的设置
  zookeeper:
    enabled: false
    cert_name: tls-zookeeper
  # 为 recovery 生成证书的设置
  autorecovery:
    cert_name: tls-recovery
  # 为 toolset 生成证书的设置
  toolset:
    cert_name: tls-toolset
```

#### 认证

默认情况下，认证是禁用的。您可以将 `auth.authentication.enabled` 设置为 `true` 来启用认证。
目前，Pulsar Helm Chart 仅支持 JWT 认证提供者。您可以将 `auth.authentication.provider` 设置为 `jwt` 来使用 JWT 认证提供者。

```yaml
# 启用或禁用 broker 认证和授权。
auth:
  authentication:
    enabled: false
    provider: "jwt"
    jwt:
      # 启用 JWT 认证
      # 如果令牌由密钥生成，将 usingSecretKey 设置为 true。
      # 如果令牌由私钥生成，将 usingSecretKey 设置为 false。
      usingSecretKey: false
  superUsers:
    # broker 到 broker 通信
    broker: "broker-admin"
    # 代理到 broker 通信
    proxy: "proxy-admin"
    # pulsar-admin 客户端到 broker/代理通信
    client: "admin"
```

要启用认证，您可以运行 [prepare helm release](#prepare-helm-release) 为 `auth.superUsers` 字段中指定的三个超级用户生成令牌密钥和令牌。生成的令牌密钥和超级用户令牌被上传并存储为以 `<pulsar-release-name>-token-` 为前缀的 Kubernetes 密钥。您可以使用以下命令找到这些密钥。

```bash
kubectl get secrets -n <k8s-namespace>
```

#### 授权

默认情况下，授权是禁用的。只有在启用认证时才能启用授权。

```yaml
auth:
  authorization:
    enabled: false
```

要启用授权，您可以在 `helm install` 命令中包含此选项。

```bash
--set auth.authorization.enabled=true
```

#### CPU 和 RAM 资源要求

默认情况下，Pulsar Helm Chart 中 Pulsar 组件的资源请求和副本数量足以满足小型生产部署。如果您部署非生产实例，可以减少默认值以适应更小的集群。

一旦收集了所有配置选项，您可以在安装 Pulsar Helm Chart 之前安装依赖的 chart。

## 步骤 2: 安装依赖的 chart

### 安装存储供应器

有关存储供应器的更多信息，请参考 [Kubernetes 文档](https://kubernetes.io/docs/concepts/storage/storage-classes/#provisioner)。请注意，您需要为 Kubernetes 集群创建存储类并在 Helm Chart 中配置[存储类名称](https://github.com/apache/pulsar-helm-chart/blob/master/charts/pulsar/values.yaml)。

如果要使用**本地**[持久卷](#persistence)作为持久存储，您需要安装本地存储供应器。这里有两个选项：
* [Local Path Provisioner](https://github.com/rancher/local-path-provisioner)
* [Local Persistence Volume Static Provisioner](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner)

### 安装 cert-manager

Pulsar Helm Chart 使用 [cert-manager](https://github.com/jetstack/cert-manager) 来自动配置和管理 TLS 证书。要为 brokers 或代理启用 TLS 加密，您需要提前安装 cert-manager。

有关如何安装 cert-manager 的详细信息，请遵循[官方说明](https://cert-manager.io/docs/installation/kubernetes/#installing-with-helm)。

或者，我们提供了一个 bash 脚本 [install-cert-manager.sh](https://github.com/apache/pulsar-helm-chart/blob/master/scripts/cert-manager/install-cert-manager.sh) 来将 cert-manager 发布版本安装到命名空间 `cert-manager`。

```bash
git clone https://github.com/apache/pulsar-helm-chart
cd pulsar-helm-chart
./scripts/cert-manager/install-cert-manager.sh
```

## 步骤 3: 准备 Helm 发布版本

一旦安装了所有依赖的 chart 并收集了所有配置选项，您可以运行 [prepare_helm_release.sh](https://github.com/apache/pulsar-helm-chart/blob/master/scripts/pulsar/prepare_helm_release.sh) 来准备 Helm 发布版本。

```bash
git clone https://github.com/apache/pulsar-helm-chart
cd pulsar-helm-chart
./scripts/pulsar/prepare_helm_release.sh -n <k8s-namespace> -k <helm-release-name>
```

`prepare_helm_release` 创建以下资源：

- 用于安装 Pulsar 发布版本的 Kubernetes 命名空间。
- 为三个超级用户生成 JWT 密钥和令牌：`broker-admin`、`proxy-admin` 和 `admin`。默认情况下，它生成非对称公钥/私钥对。您可以通过指定 `--symmetric` 选择生成对称密钥。
  - `broker-admin` 角色用于 broker 间通信。
  - `proxy-admin` 角色用于代理与 brokers 通信。
  - `admin` 角色由管理工具使用。

## 步骤 4: 使用 Helm 部署 Pulsar 集群

完成上述步骤后，您可以安装 Helm 发布版本。

在此示例中，Helm 发布版本命名为 `pulsar`。

```bash
helm repo add apache https://pulsar.apache.org/charts
helm repo update
helm install pulsar apache/pulsar \
    --timeout 10m \
    --set [your configuration options]
```

如果要安装特定版本的 Pulsar Helm Chart，也可以使用 `--version <installation version>` 选项。

:::tip

部署 Pulsar 集群后会输出已安装资源的列表。这可能需要 5-10 分钟。

要检查部署状态，请运行 `helm status pulsar` 命令。如果在另一个终端中运行命令，也可以在部署过程中进行。

:::

## 访问 Pulsar 集群

默认值将为以下资源创建 `ClusterIP`，您可以使用它们与集群交互。

- 代理：您可以使用 IP 地址向已安装的 Pulsar 集群生产和消费消息。
- Pulsar Manager：您可以在 `http://<pulsar-manager-ip>:9527` 访问 Pulsar Manager UI。
- Grafana 仪表板：您可以在 `http://<grafana-dashboard-ip>:3000` 访问 Grafana 仪表板。

要查找这些组件的 IP 地址，请运行以下命令：

```bash
kubectl get service -n <k8s-namespace>
```

您可以将代理和 Pulsar Manager 配置为 `NodePort` 而不是 `ClusterIP`。

```yaml
proxy:
  service:
    type: NodePort
pulsar_manager:
  service:
    type: NodePort
```

## 故障排除

尽管我们已经尽力使这些 chart 尽可能无缝，但问题偶尔会超出我们的控制范围。我们一直在收集用于排除常见问题的提示和技巧。在提出 [issue](https://github.com/apache/pulsar/issues/new/choose) 之前，请先检查它，并欢迎通过创建 [Pull Request](https://github.com/apache/pulsar/compare) 添加您的解决方案。


## 卸载

要卸载 Pulsar Helm Chart，请运行以下命令：

```bash
helm uninstall <pulsar-release-name>
```

为了连续性，这些 chart 中的一些 Kubernetes 对象无法通过使用 `helm uninstall` 命令删除。建议*有意识地*删除这些项目，因为它们会影响重新部署。

* 有状态数据的 PVC：删除这些项目。
  - ZooKeeper：这是您的元数据。
  - BookKeeper：这是您的数据。
  - Prometheus：这是您的指标数据，可以安全删除。
* 密钥：如果密钥是由[准备发布脚本](https://github.com/apache/pulsar-helm-chart/blob/master/scripts/pulsar/prepare_helm_release.sh)生成的，它们包含密钥和令牌。您可以使用[清理发布脚本](https://github.com/apache/pulsar-helm-chart/blob/master/scripts/pulsar/cleanup_helm_release.sh) 根据需要删除这些密钥和令牌。