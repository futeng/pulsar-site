---
id: deploy-ibm
title: 通过 Helm chart 在 IBM Kubernetes 集群上安装 Apache Pulsar
sidebar_label: "IBM Cloud Services"
original_id: deploy-ibm
description: 学习如何在 IBM 云上部署 Pulsar 集群。
---

:::tip

本教程使用 Apache Pulsar 2.9.3 作为示例。如果要升级 Pulsar 版本，请遵循 [Helm 升级指南](https://pulsar.apache.org/docs/2.10.x/helm-upgrade/) 中的说明。

:::

在 IBM 云上部署 Pulsar 集群包含以下步骤。

## 步骤 1：在 IBM Cloud 上创建虚拟机

1. 访问 [IBM Cloud]( https://cloud.ibm.com/?cm_sp=freelancer-_-pulsar-iks-_-cta) 并使用您的凭据登录。
2. 搜索 Virtual Server。
3. 选择 Virtual Server for Classic。

![VM Creation Image 1](/assets/IBMCloud/VM1.png)

4. 选择虚拟服务器类型，如图片中选择的"Public"。输入主机名、机器数量和计费方式。

![VM Creation Image 2](/assets/IBMCloud/VM2.png)

5. 根据您所在的区域选择位置值。例如：在下图中我们选择了亚洲地区的 Chennai。

![VM Creation Image 3](/assets/IBMCloud/VM3.png)

6. 选择虚拟机的配置文件。

![VM Creation Image 4](/assets/IBMCloud/VM4.png)

7. 选择操作系统和版本。

![VM Creation Image 5](/assets/IBMCloud/VM5.png)

8. 根据用途选择网络接口。

![VM Creation Image 6](/assets/IBMCloud/VM6.png)

9. 选择安全组。

![VM Creation Image 7](/assets/IBMCloud/VM7.png)

10. 其他设置保持默认即可。点击"Create"按钮。

![VM Creation Image 8](/assets/IBMCloud/VM8.png)

11. 在"Navigation Menu" -> "Resource list" -> Devices 中检查创建的虚拟机

![VM Creation Image 9](/assets/IBMCloud/VM9.png)

![VM Creation Image 10](/assets/IBMCloud/VM10.png)

12. 在概览中检查虚拟机的详细信息

![VM Creation Image 11](/assets/IBMCloud/VM11.png)

13. 检查设备列表，并在同一页面点击菜单选项。

![VM Creation Image 12](/assets/IBMCloud/VM12.png)

## 步骤 2：在 IBM 上创建 Kubernetes 集群

1. 搜索 Kubernetes 服务

![K8S Creation Image 1](/assets/IBMCloud/k8s1.png)

2. 选择计划详情为"Standard"。请注意"Free"计划的资源有限，无法满足 Pulsar 集群的要求。

![K8S Creation Image 2](/assets/IBMCloud/k8s2.png)

3. 选择基础设施类型，我们选择 classic，同时选择 Kubernetes 版本。

![K8S Creation Image 3](/assets/IBMCloud/k8s3.png)

4. 选择位置和资源组。根据需要选择单区域或多区域。

![K8S Creation Image 4](/assets/IBMCloud/k8s4.png)

![K8S Creation Image 5](/assets/IBMCloud/k8s5.png)

5. 选择工作节点池的大小和配置（vCPU、内存）。

![K8S Creation Image 6](/assets/IBMCloud/k8s6.png)

![K8S Creation Image 7](/assets/IBMCloud/k8s7.png)

6. 根据需要设置集群名称。

![K8S Creation Image 8](/assets/IBMCloud/k8s8.png)
7. 其他设置保持默认。您可以禁用以下选项。点击创建并等待集群配置完成。

![K8S Creation Image 9](/assets/IBMCloud/k8s9.png)

8. 集群成功配置后，连接到集群。要连接，请点击"Action"按钮，然后点击"Connect via CLI"，它会为您提供命令，复制该命令并在您的虚拟机中运行，这样我们就可以通过虚拟机与集群通信。在接下来的步骤中我们将描述如何配置虚拟机以与集群通信。

![K8S Creation Image 10](/assets/IBMCloud/k8s10.png)

9. 通过点击集群选项检查创建的集群列表。

![K8S Creation Image 11](/assets/IBMCloud/k8s11.png)

10. 它将显示所有已创建集群的列表。

![K8S Creation Image 12](/assets/IBMCloud/k8s12.png)

## 步骤 3：准备虚拟机以连接到 Kubernetes 集群并在 Kubernetes 集群上部署 Pulsar Helm chart。

**先决条件**
1. 安装 [IBM Cloud CLI](https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli) 并连接到 Kubernetes 主节点。

2. 安装 [IBM Cloud CLI 插件](https://cloud.ibm.com/docs/containers?topic=containers-cs_cli_install) 以连接到 IKS（IBM Kubernetes 服务）。这是必需的步骤。

3. 安装 [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/) 1.23 或更高版本。
4. 安装 [Helm](https://helm.sh/docs/intro/install/)。

:::note

请在运行以下命令之前安装以上所有内容

:::

1. 首先使用您的私钥对虚拟机进行 SSH 连接。逐一运行以下所有命令。
```bash
   $ ibmcloud login
   $ ibmcloud plugin list
```

输出
![Output of Command img IBMLogin](/assets/IBMCloud/IBMLogin.png)

2. 要连接到 Kubernetes 集群，您将在 Kubernetes 集群部分（Kubernetes 控制台）获得如下命令。

```bash
    $ibmcloud ks cluster config --cluster ccql163t064kpvg5gg10
```

:::note

此步骤在创建 Kubernetes 集群时显示。

:::

![K8S Creation Image 11](/assets/IBMCloud/k8s11.png)

3. 运行上图中显示的第二和第三个命令后，您将获得如下输出。您不需要运行第一个命令，因为您已经登录到 IBM Cloud。

输出
![Output of Command IKSConnect](/assets/IBMCloud/IKSConnect.png)

> 现在我们能够运行 kubectl 命令了。

## 步骤 4：验证部署
确保所有 Pulsar pod 都在运行。获取服务 URL 和 broker URL 用于发布和消费消息。

> [在 minikube 集群中安装 Pulsar helm](https://pulsar.apache.org/docs/getting-started-helm/) 这个文档是针对 minikube 集群的，我们参考该文档。

1. 添加 Pulsar chart 仓库

```bash
$ helm repo add apache https://pulsar.apache.org/charts
$ helm repo update
$ helm repo list
```

输出
![Output of Command Helmrepo](/assets/IBMCloud/Helmrepo.png)

2. 克隆 Pulsar Helm chart 仓库，进入 pulsar-helm-chart 目录

```bash
git clone https://github.com/apache/pulsar-helm-chart
cd pulsar-helm-chart
```

3. 运行脚本 `prepare_helm_release.sh` 创建安装 Apache Pulsar Helm chart 所需的密钥。用户名 `pulsar` 和密码 `pulsar` 用于登录 Grafana 仪表板和 Pulsar Manager。

:::note

运行脚本时，您可以使用 `-n` 指定安装 Pulsar Helm chart 的 Kubernetes 命名空间，使用 `-k` 定义 Pulsar Helm 发布名称，使用 `-c` 创建 Kubernetes 命名空间。有关脚本的更多信息，请运行 `./scripts/pulsar/prepare_helm_release.sh --help`。

:::

```bash
 ./scripts/pulsar/prepare_helm_release.sh -n default -k asia -c
```

输出
![Output of Command HelmOutPut](/assets/IBMCloud/HelmOutPut.png)

4. 使用 Pulsar Helm chart 在 Kubernetes 上安装 Pulsar 集群。

```bash
helm install --values examples/values-minikube.yaml --set initialize=true asia apache/pulsar
```

:::note

首次安装 Pulsar 时需要指定 `--set initialize=true`。此命令安装并启动 Apache Pulsar。

:::

输出
![Output of Command HelmInstall](/assets/IBMCloud/HelmInstall.png)

5. 检查所有 pod 的状态。

```bash
kubectl get pods
```
如果所有 pod 都成功启动，您可以看到 `STATUS` 变为 `Running` 或 `Completed`。

输出

![Output of Command PodStatus](/assets/IBMCloud/PodStatus.png)

6. 检查所有服务的状态。

```bash
 kubectl get services
```

输出

![Output of Command Services](/assets/IBMCloud/Services.png)

输出显示了 `services URL` 和 `broker URL`。
代理外部 IP 是刚刚更改的端口：
- 服务 URL 端口是 80。
- Broker URL 端口是 6650。这是默认设置。
如果您成功执行了所有命令，您可以使用 Pulsar 客户端连接到集群，并通过代理外部 IP 生产和消费消息。