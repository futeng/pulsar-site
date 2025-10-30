---
id: getting-started-helm
title: 在 Kubernetes 中运行独立 Pulsar 集群
sidebar_label: "在 Kubernetes 中运行 Pulsar"
description: 使用 Kubernetes 在本地机器上开始使用 Apache Pulsar。
---

本节指导你完成在 Kubernetes 上使用 Helm 安装和运行 Apache Pulsar 的每一步。

对于部署用于生产用途的 Pulsar 集群，请阅读关于[如何配置和安装 Pulsar Helm chart](helm-deploy.md)的文档。

:::warning 安全通知

本快速入门指南使用仅适用于开发和测试的默认配置。默认 Helm chart 配置**不满足生产安全要求**。对于生产部署，你必须审查并自定义安全设置，包括认证、授权、TLS 加密和网络策略。

:::

## 前置条件

- Kubernetes 服务器 1.25.0+（推荐[最新稳定版本](https://kubernetes.io/releases/patch-releases/#detailed-release-history-for-active-branches)）
- 与你的 k8s 服务器版本兼容的 kubectl 版本（[+/- 1 个次要版本](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#before-you-begin)）
- Helm 3.12+（选择[与你的 k8s 服务器版本兼容的 helm 版本](https://helm.sh/docs/topics/version_skew/#supported-version-skew)）
- Kubernetes 集群中至少 8GB 可用 RAM
- 至少 20GB 可用持久化存储

:::tip

对于以下步骤，步骤 2 和步骤 3 针对**开发者**，步骤 4 和步骤 5 针对**管理员**。

:::

要在 Kubernetes 上使用 Helm 运行 Pulsar，请按照以下步骤操作。

## 步骤 0：准备 Kubernetes 集群

在安装 Pulsar Helm chart 之前，你必须创建一个 Kubernetes 集群。你可以按照[说明](helm-prepare.md)准备 Kubernetes 集群。

我们在本快速入门指南中使用 [Minikube](https://minikube.sigs.k8s.io/docs/start/)。要准备 Kubernetes 集群，请按照以下步骤：

1. 在 Minikube 上创建 Kubernetes 集群。

   ```bash
   minikube start --memory=8192 --cpus=4
   ```


2. 设置 `kubectl` 使用 Minikube。

   ```bash
   kubectl config use-context minikube
   ```

3. 要在 Minikube 上使用 [Kubernetes Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/) 与本地 Kubernetes 集群，输入以下命令：

   ```bash
   minikube dashboard
   ```

   该命令自动触发在浏览器中打开网页。

## 步骤 1：安装 Pulsar Helm chart

1. 添加 Pulsar charts 仓库。

   ```bash
   helm repo add apache https://pulsar.apache.org/charts
   ```

   ```bash
   helm repo update
   ```

2. 克隆 Pulsar Helm chart 仓库。

   ```bash
   git clone https://github.com/apache/pulsar-helm-chart
   cd pulsar-helm-chart
   ```

3. 运行脚本 `prepare_helm_release.sh` 创建安装 Apache Pulsar Helm chart 所需的密钥。用户名 `pulsar` 和密码 `pulsar` 用于登录 Grafana 仪表板和 Pulsar Manager。

   :::note

   运行脚本时，你可以使用 `-n` 指定安装 Pulsar Helm chart 的 Kubernetes 命名空间，使用 `-k` 定义 Pulsar Helm 发行版名称，使用 `-c` 创建 Kubernetes 命名空间。有关脚本的更多信息，运行 `./scripts/pulsar/prepare_helm_release.sh --help`。

   :::

   ```bash
   ./scripts/pulsar/prepare_helm_release.sh \
       -n pulsar \
       -k pulsar-mini \
       -c
   ```

4. 使用 Pulsar Helm chart 将 Pulsar 集群安装到 Kubernetes。

   ```bash
   helm install \
       --values examples/values-minikube.yaml \
       --namespace pulsar \
       pulsar-mini apache/pulsar
   ```

:::tip

确保 `values-minikube.yaml` 文件包含以下行：

```yaml
pulsar_manager:
  configData:
    ENV_SPRING_CONFIGURATION_FILE: "/pulsar-manager/pulsar-manager/application.properties"
    SPRING_CONFIGURATION_FILE: "/pulsar-manager/pulsar-manager/application.properties"
    PULSAR_MANAGER_OPTS: " -Dlog4j2.formatMsgNoLookups=true"
```

:::

5. 检查所有 pod 的状态。

   ```bash
   kubectl get pods -n pulsar
   ```

   如果所有 pod 都成功启动，你可以看到 `STATUS` 已更改为 `Running` 或 `Completed`。

   **输出**

   ```bash
   NAME                                         READY   STATUS      RESTARTS   AGE
   pulsar-mini-bookie-0                         1/1     Running     0          9m27s
   pulsar-mini-bookie-init-5gphs                0/1     Completed   0          9m27s
   pulsar-mini-broker-0                         1/1     Running     0          9m27s
   pulsar-mini-grafana-6b7bcc64c7-4tkxd         1/1     Running     0          9m27s
   pulsar-mini-prometheus-5fcf5dd84c-w8mgz      1/1     Running     0          9m27s
   pulsar-mini-proxy-0                          1/1     Running     0          9m27s
   pulsar-mini-pulsar-init-t7cqt                0/1     Completed   0          9m27s
   pulsar-mini-pulsar-manager-9bcbb4d9f-htpcs   1/1     Running     0          9m27s
   pulsar-mini-toolset-0                        1/1     Running     0          9m27s
   pulsar-mini-zookeeper-0                      1/1     Running     0          9m27s
   ```

6. 检查命名空间 `pulsar` 中所有服务的状态。

   ```bash
   kubectl get services -n pulsar
   ```

   **输出**

   ```bash
   NAME                         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                       AGE
   pulsar-mini-bookie           ClusterIP      None             <none>        3181/TCP,8000/TCP             11m
   pulsar-mini-broker           ClusterIP      None             <none>        8080/TCP,6650/TCP             11m
   pulsar-mini-grafana          LoadBalancer   10.106.141.246   <pending>     3000:31905/TCP                11m
   pulsar-mini-prometheus       ClusterIP      None             <none>        9090/TCP                      11m
   pulsar-mini-proxy            LoadBalancer   10.97.240.109    <pending>     80:32305/TCP,6650:31816/TCP   11m
   pulsar-mini-pulsar-manager   LoadBalancer   10.103.192.175   <pending>     9527:30190/TCP                11m
   pulsar-mini-toolset          ClusterIP      None             <none>        <none>                        11m
   pulsar-mini-zookeeper        ClusterIP      None             <none>        2888/TCP,3888/TCP,2181/TCP    11m
   ```

## 步骤 2：使用 pulsar-admin 创建 Pulsar 租户/命名空间/Topic

`pulsar-admin` 是 Pulsar 的 CLI（命令行界面）工具。在这一步中，你可以使用 `pulsar-admin` 创建资源，包括租户、命名空间和 Topic。

1. 进入 `toolset` 容器。

   ```bash
   kubectl exec -it -n pulsar pulsar-mini-toolset-0 -- /bin/bash
   ```

   :::tip

   要执行健康检查，你可以使用 `bin/pulsar-admin brokers healthcheck` 命令。有关更多信息，请参阅 [Pulsar 管理文档](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)。

   :::

2. 在 `toolset` 容器中，创建一个名为 `apache` 的租户。

   ```bash
   bin/pulsar-admin tenants create apache
   ```

   然后你可以列出租户以查看租户是否创建成功。

   ```bash
   bin/pulsar-admin tenants list
   ```

   你应该看到类似以下的输出。租户 `apache` 已成功创建。

   ```bash
   "apache"
   "public"
   "pulsar"
   ```

3. 在 `toolset` 容器中，在租户 `apache` 中创建一个名为 `pulsar` 的命名空间。

   ```bash
   bin/pulsar-admin namespaces create apache/pulsar
   ```

   然后你可以列出租户 `apache` 的命名空间以查看命名空间是否创建成功。

   ```bash
   bin/pulsar-admin namespaces list apache
   ```

   你应该看到类似以下的输出。命名空间 `apache/pulsar` 已成功创建。

   ```bash
   "apache/pulsar"
   ```

4. 在 `toolset` 容器中，在命名空间 `apache/pulsar` 中创建一个具有 `4` 个分区的 Topic `test-topic`。

   ```bash
   bin/pulsar-admin topics create-partitioned-topic apache/pulsar/test-topic -p 4
   ```

5. 在 `toolset` 容器中，列出命名空间 `apache/pulsar` 中的所有分区 Topic。

   ```bash
   bin/pulsar-admin topics list-partitioned-topics apache/pulsar
   ```

   然后你可以看到命名空间 `apache/pulsar` 中的所有分区 Topic。

   ```bash
   "persistent://apache/pulsar/test-topic"
   ```

## 步骤 3：使用 Pulsar 客户端发送和消费消息

你可以使用 Pulsar 客户端创建生产者和消费者来发送和消费消息。

默认情况下，Pulsar Helm chart 通过 Kubernetes `LoadBalancer` 暴露 Pulsar 集群。在 Minikube 中，你可以使用以下命令检查代理服务。

```bash
kubectl get services -n pulsar | grep pulsar-mini-proxy
```

你将看到类似以下的输出。

```bash
pulsar-mini-proxy            LoadBalancer   10.97.240.109    <pending>     80:32305/TCP,6650:31816/TCP   28m
```

此输出告诉你 Pulsar 集群的二进制端口和 HTTP 端口映射到哪些节点端口。`80:` 后面的端口是 HTTP 端口，而 `6650:` 后面的端口是二进制端口。

然后你可以通过运行以下命令找到 Minikube 服务器的 IP 地址和暴露的端口。

```bash
minikube service pulsar-mini-proxy -n pulsar
```

**输出**

```bash
|-----------|-------------------|-------------|-------------------------|
| NAMESPACE |       NAME        | TARGET PORT |           URL           |
|-----------|-------------------|-------------|-------------------------|
| pulsar    | pulsar-mini-proxy | http/80     | http://172.17.0.4:32305 |
|           |                   | pulsar/6650 | http://172.17.0.4:31816 |
|-----------|-------------------|-------------|-------------------------|
🏃  Starting tunnel for service pulsar-mini-proxy.
|-----------|-------------------|-------------|------------------------|
| NAMESPACE |       NAME        | TARGET PORT |          URL           |
|-----------|-------------------|-------------|------------------------|
| pulsar    | pulsar-mini-proxy |             | http://127.0.0.1:61853 |
|           |                   |             | http://127.0.0.1:61854 |
|-----------|-------------------|-------------|------------------------|
```

此时，你可以获取连接到 Pulsar 客户端的服务 URL。以下是 URL 示例：

```
webServiceUrl=http://127.0.0.1:61853/
brokerServiceUrl=pulsar://127.0.0.1:61854/
```

然后你可以继续以下步骤：

1. 从[下载页面](/download/)下载 Apache Pulsar 压缩包。

2. 根据你的下载文件解压缩包。

   ```bash
   tar -xf <file-name>.tar.gz
   ```

3. 暴露 `PULSAR_HOME`。

   (1) 进入解压下载文件的目录。

   (2) 将 `PULSAR_HOME` 暴露为环境变量。

   ```bash
   export PULSAR_HOME=$(pwd)
   ```

4. 配置 Pulsar 客户端。

   在 `${PULSAR_HOME}/conf/client.conf` 文件中，将 `webServiceUrl` 和 `brokerServiceUrl` 替换为你从上述步骤获得的服务 URL。

5. 创建订阅以从 `apache/pulsar/test-topic` 消费消息。

   ```bash
   bin/pulsar-client consume -s sub apache/pulsar/test-topic  -n 0
   ```

6. 打开一个新终端。在新终端中，创建生产者并向 `test-topic` Topic 发送 10 条消息。

   ```bash
   bin/pulsar-client produce apache/pulsar/test-topic  -m "---------hello apache pulsar-------" -n 10
   ```

7. 验证结果。

   - 从生产者端

       **输出**

       消息已成功发送。

       ```bash
       18:15:15.489 [main] INFO  org.apache.pulsar.client.cli.PulsarClientTool - 10 messages successfully produced
       ```

   - 从消费者端

       **输出**

       同时，你可以收到如下消息。

       ```bash
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ----- got message -----
       ---------hello apache pulsar-------
       ```

## 步骤 4：使用 Pulsar Manager 管理集群

[Pulsar Manager](administration-pulsar-manager.md) 是一个基于 Web 的 GUI 管理工具，用于管理和监控 Pulsar。

1. 要创建超级用户帐户，连接到 pulsar-manager pod 并创建帐户：

```bash
kubectl exec -it YOUR_PULSAR_MANAGER_POD_NAME -n pulsar -- /bin/bash
CSRF_TOKEN=$(curl http://localhost:7750/pulsar-manager/csrf-token)
curl \
    -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
    -H "Cookie: XSRF-TOKEN=$CSRF_TOKEN;" \
    -H 'Content-Type: application/json' \
    -X PUT http://localhost:7750/pulsar-manager/users/superuser \
    -d '{"name": "pulsar", "password": "pulsar", "description": "test", "email": "username@test.org"}'
```

2. 默认情况下，`Pulsar Manager` 作为单独的 `LoadBalancer` 暴露。你可以使用以下命令打开 Pulsar Manager UI：

   ```bash
   minikube service -n pulsar pulsar-mini-pulsar-manager
   ```

3. Pulsar Manager UI 将在你的浏览器中打开。你可以使用用户名 `pulsar` 和密码 `pulsar` 登录 Pulsar Manager。

4. 在 Pulsar Manager UI 中，你可以创建一个环境。

   - 点击左上角的**新环境**。
   - 在弹出窗口中的`环境名称`字段输入 `pulsar-mini`。
   - 在弹出窗口中的`服务 URL`字段输入 `http://pulsar-mini-broker:8080`。
   - 在弹出窗口中的`Bookie URL`字段输入 `http://pulsar-mini-bookie:8080`。
   - 在弹出窗口中点击**确认**。

5. 成功创建环境后，你可以使用 Pulsar Manager 创建 `租户`、`命名空间`和 `Topic`。

## 步骤 5：使用 Prometheus 和 Grafana 监控集群

Grafana 是一个开源可视化工具，可用于将时间序列数据可视化到仪表板中。

1. 默认情况下，Grafana 作为单独的 `LoadBalancer` 暴露。你可以使用以下命令打开 Grafana UI：

   ```bash
   minikube service pulsar-mini-grafana -n pulsar
   ```

2. Grafana UI 在你的浏览器中打开。你可以使用用户名 `pulsar` 和密码 `pulsar` 登录 Grafana 仪表板。

3. 你可以查看 Pulsar 集群不同组件的仪表板。