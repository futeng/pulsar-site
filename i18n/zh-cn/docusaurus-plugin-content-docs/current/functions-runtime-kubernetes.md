---
id: functions-runtime-kubernetes
title: 配置 Kubernetes 运行时
sidebar_label: "配置 Kubernetes 运行时"
description: 在 Pulsar 中为函数配置 Kubernetes 运行时。
---

Kubernetes 运行时在函数工作器生成并应用 Kubernetes 清单时工作。函数工作器生成的清单包括：
* 一个 `StatefulSet`
  默认情况下，`StatefulSet` 清单具有一个具有多个副本的 pod。副本数量由函数的[并行度](functions-deploy-cluster-parallelism.md)决定。pod 在 pod 启动时下载函数负载（通过函数工作器 REST API）。如果配置了函数运行时，pod 的容器镜像是可配置的。
* 一个 `Service`（用于与 pod 通信）
* 一个用于身份验证凭据的 `Secret`（当适用时）。
  Kubernetes 运行时支持密钥。您可以创建 Kubernetes 密钥并将其作为环境变量暴露在 pod 中。

:::tip

关于将 Pulsar 对象名称转换为 Kubernetes 资源标签的规则，请参阅[说明](admin-api-overview.md#how-to-define-pulsar-resource-names-when-running-pulsar-in-kubernetes)。

:::

### 配置基本设置

要快速配置 Kubernetes 运行时，您可以在 `conf/functions_worker.yml` 文件中使用 [`KubernetesRuntimeFactoryConfig`](https://github.com/apache/pulsar/blob/master/pulsar-functions/runtime/src/main/java/org/apache/pulsar/functions/runtime/kubernetes/KubernetesRuntimeFactoryConfig.java) 的默认设置。

如果您已经[使用 [Helm chart](helm-install.md) 在 Kubernetes 上设置了 Pulsar 集群，这意味着函数工作器也已经在 Kubernetes 上设置，您可以使用与函数工作器运行的 pod 关联的 `serviceAccount`。否则，您可以通过将 `functionRuntimeFactoryConfigs` 设置为 `k8Uri` 来配置函数工作器与 Kubernetes 集群通信。

### 集成 Kubernetes 密钥

Kubernetes 中的 [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) 是一个保存一些机密数据的对象，如密码、令牌或密钥。当您在部署函数的 Kubernetes 命名空间中创建密钥时，函数可以安全地引用和分发它。要启用此功能，请在 `conf/functions-worker.yml` 文件中将 `secretsProviderConfiguratorClassName` 设置为 `org.apache.pulsar.functions.secretsproviderconfigurator.KubernetesSecretsProviderConfigurator`。

例如，您[向 `pulsar-func` Kubernetes 命名空间部署函数](functions-deploy.md)，并且您有一个名为 `database-creds` 的密钥，其字段名为 `password`，您希望将其作为名为 `DATABASE_PASSWORD` 的环境变量挂载到 pod 中。以下配置使函数能够引用密钥并将值作为环境变量挂载到 pod 中。

```yaml
tenant: "mytenant"
namespace: "mynamespace"
name: "myfunction"
inputs: [ "persistent://mytenant/mynamespace/myfuncinput" ]
className: "com.company.pulsar.myfunction"

secrets:
  # 密钥将从 `database-creds` 密钥中的 `password` 字段挂载为名为 `DATABASE_PASSWORD` 的环境变量
  DATABASE_PASSWORD:
    path: "database-creds"
    key: "password"
```

### 启用令牌身份验证

当您使用令牌身份验证、TLS 加密或自定义身份验证来保护与 Pulsar 集群的通信时，Pulsar 会将您的证书颁发机构（CA）传递给客户端，以便客户端可以使用您的签名证书对集群进行身份验证。

要为您的 Pulsar 集群启用令牌身份验证，您需要通过实现 `org.apache.pulsar.functions.auth.KubernetesFunctionAuthProvider` 接口来指定运行函数的 pod 对 broker 进行身份验证的机制。

* 对于令牌身份验证，Pulsar 包含上述接口的实现来分发 CA。函数工作器捕获部署（或更新）函数的令牌，将其保存为密钥，并将其挂载到 pod 中。

  `conf/function-worker.yml` 文件中的配置如下。`functionAuthProviderClassName` 用于指定此实现的路径。

  ```yaml
  functionAuthProviderClassName: org.apache.pulsar.functions.auth.KubernetesSecretsTokenAuthProvider
  ```

* 对于 TLS 或自定义身份验证，您可以实现 `org.apache.pulsar.functions.auth.KubernetesFunctionAuthProvider` 接口或使用替代机制。

:::note

如果您用于部署函数的令牌有到期日期，您可能需要在到期后再次部署函数。

:::

### 为函数 pod 身份验证启用 Kubernetes 服务账户令牌投影

`KubernetesServiceAccountTokenAuthProvider` 使用[服务账户令牌卷投影](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection)将令牌挂载到函数的 pod 中。函数工作器和 broker 可以使用 OpenID Connect 验证此令牌。此集成的主要好处是令牌生存时间短，由 Kubernetes 管理，并且不继承用于创建函数的权限。

:::note

此功能要求 broker 和函数工作器配置为使用 `AuthenticationProviderOpenID`。有关启用此提供程序的文档可以在[这里](security-openid-connect.md)找到。

:::

以下是函数工作器利用此功能的示例配置：

```yaml
functionAuthProviderClassName: "org.apache.pulsar.functions.auth.KubernetesServiceAccountTokenAuthProvider"
kubernetesContainerFactory:
  kubernetesFunctionAuthProviderConfig:
    # 必需
    serviceAccountTokenExpirationSeconds: "600"
    serviceAccountTokenAudience: "the-required-audience"
    # 可选
    brokerClientTrustCertsSecretName: "my-secret-pulsar-broker-client-trust-certs"
```

函数 pod 使用目标命名空间的默认 Kubernetes 服务账户部署。由于服务账户名称映射到投影到 pod 文件系统的 JWT 上的 `sub` 声明，因此具有相同服务账户的所有 pod 在 Pulsar 内部将具有相同的权限。正在进行改进此集成的工作。

以下是此功能在 EKS 中运行生成的示例 JWT（某些信息已编辑）：

```json
{
  "aud": [
    "your-audience"
  ],
  "exp": 1710969822,
  "iat": 1679433822,
  "iss": "https://oidc.eks.us-east-2.amazonaws.com/id/some-id",
  "kubernetes.io": {
    "namespace": "pulsar-function",
    "pod": {
      "name": "function-pod-0",
      "uid": "fbac8f9e-a47d-4ad7-a8f0-cc9a65d1331c"
    },
    "serviceaccount": {
      "name": "default",
      "uid": "5964f9d3-3dce-467c-8dbe-d0f463063d7a"
    },
    "warnafter": 1679437429
  },
  "nbf": 1679433822,
  "sub": "system:serviceaccount:pulsar-function:default"
}
```

要向此函数 pod 授予权限，您需要向角色声明授予权限，默认情况下这是 `sub` 声明，`system:serviceaccount:pulsar-function:default`。

### 自定义 Kubernetes 运行时

自定义 Kubernetes 运行时允许您自定义运行时创建的 Kubernetes 资源，包括如何生成清单、如何将身份验证数据传递给 pod 以及如何集成密钥。

要自定义 Kubernetes 运行时，您可以在 `conf/functions-worker.yml` 文件中设置 `runtimeCustomizerClassName` 并使用完全限定的类名。

函数 API 提供了一个名为 `customRuntimeOptions` 的标志，它被传递给 `org.apache.pulsar.functions.runtime.kubernetes.KubernetesManifestCustomizer` 接口。要初始化 `KubernetesManifestCustomizer`，您可以在 `conf/functions-worker.yml` 文件中设置 `runtimeCustomizerConfig`。

:::note

`runtimeCustomizerConfig` 在所有函数中都是相同的。如果您同时提供 `runtimeCustomizerConfig` 和 `customRuntimeOptions`，您需要在 `KubernetesManifestCustomizer` 接口的实现中决定如何管理这两个配置。

:::

Pulsar 包含一个使用 `runtimeCustomizerConfig` 初始化的内置实现。它使您能够将 JSON 文档作为具有某些属性的 `customRuntimeOptions` 传递以进行增强。要使用此内置实现，请将 `runtimeCustomizerClassName` 设置为 `org.apache.pulsar.functions.runtime.kubernetes.BasicKubernetesManifestCustomizer`。

如果同时提供 `runtimeCustomizerConfig` 和 `customRuntimeOptions` 并且存在冲突，`BasicKubernetesManifestCustomizer` 使用 `customRuntimeOptions` 覆盖 `runtimeCustomizerConfig`。

以下是配置 `customRuntimeOptions` 的示例。

```json
{
  "jobName": "jobname", // 运行此函数实例的 k8s pod 名称
  "jobNamespace": "namespace", // 在其中运行此函数的 k8s 命名空间
  "extractLabels": {           // 要附加到 statefulSet、service 和 pod 的额外标签
    "extraLabel": "value"
  },
  "extraAnnotations": {        // 要附加到 statefulSet、service 和 pod 的额外注释
    "extraAnnotation": "value"
  },
  "nodeSelectorLabels": {      // 要添加到 pod 规范的节点选择器标签
    "customLabel": "value"
  },
  "tolerations": [             // 要添加到 pod 规范的容忍度
    {
      "key": "custom-key",
      "value": "value",
      "effect": "NoSchedule"
    }
  ],
  "resourceRequirements": {  // cpu 和内存的值应按此处描述定义：https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container
    "requests": {
      "cpu": 1,
      "memory": "4G"
    },
    "limits": {
      "cpu": 2,
      "memory": "8G"
    }
  }
}
```

### 在 Kubernetes 中运行 Pulsar 时如何定义 Pulsar 资源名称

如果您在 Kubernetes 上运行 Pulsar Functions 或连接器，无论您使用哪个管理界面，都需要遵循 Kubernetes 命名约定来定义 Pulsar 资源的名称。

Kubernetes 要求一个可以用作 DNS 子域名名称的名称，如 [RFC 1123](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) 中所定义。Pulsar 支持比 Kubernetes 命名约定更多的合法字符。如果您使用 Kubernetes 不支持的特殊字符创建 Pulsar 资源名称（例如，在 Pulsar 命名空间名称中包含冒号），Kubernetes 运行时会将 Pulsar 对象名称转换为符合 RFC 1123 形式的 Kubernetes 资源标签。因此，您可以使用 Kubernetes 运行时运行函数或连接器。将 Pulsar 对象名称转换为 Kubernetes 资源标签的规则如下：

- 截断为 63 个字符

- 将以下字符替换为破折号 (-)：

  - 非字母数字字符

  - 下划线 (_)

  - 点 (.)

- 将开头和结尾的非字母数字字符替换为 0

:::tip

- 如果在将 Pulsar 对象名称转换为 Kubernetes 资源标签时遇到错误（例如，如果您的 Pulsar 对象名称太长，可能会出现命名冲突）或想要自定义转换规则，请参阅[自定义 Kubernetes 运行时](functions-runtime-kubernetes.md#customize-kubernetes-runtime)。
- 有关如何配置 Kubernetes 运行时，请参阅[说明](functions-runtime-kubernetes.md)。

:::