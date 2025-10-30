---
id: admin-api-functions
title: 管理函数
sidebar_label: "函数"
description: 学习如何使用 Pulsar CLI 和管理 API 管理函数。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

:::tip

本页面仅显示**一些常用操作**。有关最新和完整的信息，请参阅下面的**参考文档**。

:::

类别|方法|如果您想管理函数...
|---|---|---
[Pulsar CLI](reference-cli-tools.md) |[pulsar-admin](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)，它列出所有命令、标志、描述等。| 查看 `functions` 命令
[Pulsar 管理 API](admin-api-overview.md)| {@inject: rest:REST API:/}，它列出所有参数、响应、示例等。|查看 `/admin/v3/functions` 端点
[Pulsar 管理 API](admin-api-overview.md)|[Java 管理 API](/api/admin/)，它列出所有类、方法、描述等。|查看 `PulsarAdmin` 对象的 `functions` 方法


您可以对[函数](functions-overview.md/#what-are-pulsar-functions)执行以下操作。
## 创建函数

您可以使用管理 CLI、REST API 或 Java 管理 API 在集群模式下创建 Pulsar 函数（将其部署在 Pulsar 集群上）。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`create`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=create) 子命令。

**示例**

```shell
pulsar-admin functions create \
    --tenant public \
    --namespace default \
    --name (Pulsar Functions 的名称) \
    --inputs test-input-topic \
    --output persistent://public/default/test-output-topic \
    --classname org.apache.pulsar.functions.api.examples.ExclamationFunction \
    --jar $PWD/examples/api-examples.jar
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_registerFunction)

</TabItem>
<TabItem value="Java">

```java
FunctionConfig functionConfig = new FunctionConfig();
functionConfig.setTenant(tenant);
functionConfig.setNamespace(namespace);
functionConfig.setName(functionName);
functionConfig.setRuntime(FunctionConfig.Runtime.JAVA);
functionConfig.setParallelism(1);
functionConfig.setClassName("org.apache.pulsar.functions.api.examples.ExclamationFunction");
functionConfig.setProcessingGuarantees(FunctionConfig.ProcessingGuarantees.ATLEAST_ONCE);
functionConfig.setTopicsPattern(sourceTopicPattern);
functionConfig.setSubName(subscriptionName);
functionConfig.setAutoAck(true);
functionConfig.setOutput(sinkTopic);
admin.functions().createFunction(functionConfig, fileName);
```

</TabItem>

</Tabs>
````

## 更新函数

您可以使用管理 CLI、REST API 或 Java 管理 API更新已部署到 Pulsar 集群的 Pulsar 函数。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`update`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=update) 子命令。

**示例**

```shell
pulsar-admin functions update \
    --tenant public \
    --namespace default \
    --name (Pulsar Functions 的名称) \
    --output persistent://public/default/update-output-topic \
    # 其他选项
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_updateFunction)

</TabItem>
<TabItem value="Java">

```java
FunctionConfig functionConfig = new FunctionConfig();
functionConfig.setTenant(tenant);
functionConfig.setNamespace(namespace);
functionConfig.setName(functionName);
functionConfig.setRuntime(FunctionConfig.Runtime.JAVA);
functionConfig.setParallelism(1);
functionConfig.setClassName("org.apache.pulsar.functions.api.examples.ExclamationFunction");
UpdateOptions updateOptions = new UpdateOptions();
updateOptions.setUpdateAuthData(updateAuthData);
admin.functions().updateFunction(functionConfig, userCodeFile, updateOptions);
```

</TabItem>

</Tabs>
````

## 启动函数

您可以[启动函数的一个实例](#启动函数的一个实例)或[启动函数的所有实例](#启动函数的所有实例)。
### 启动函数的一个实例

您可以使用管理 CLI、REST API 或 Java 管理 API 通过 `instance-id` 启动已停止的函数实例。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`start`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=start) 子命令。

```shell
pulsar-admin functions start \
    --tenant public \
    --namespace default \
    --name (Pulsar Functions 的名称) \
    --instance-id 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_startFunction?summary=an+instance)

</TabItem>
<TabItem value="Java">

```java
admin.functions().startFunction(tenant, namespace, functionName, Integer.parseInt(instanceId));
```

</TabItem>

</Tabs>
````

### 启动函数的所有实例

您可以使用管理 CLI、REST API 或 Java 管理 API 启动所有已停止的函数实例。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`start`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=start) 子命令。

**示例**

```shell
pulsar-admin functions start \
    --tenant public \
    --namespace default \
    --name (Pulsar Functions 的名称) \
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_startFunction?summary=all)

</TabItem>
<TabItem value="Java">

```java
admin.functions().startFunction(tenant, namespace, functionName);
```

</TabItem>

</Tabs>
````

## 停止函数

您可以[停止函数的一个实例](#停止函数的一个实例)或[停止函数的所有实例](#停止函数的所有实例)。

### 停止函数的一个实例

您可以使用管理 CLI、REST API 或 Java 管理 API 通过 `instance-id` 停止函数实例。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`stop`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=stop) 子命令。

**示例**

```shell
pulsar-admin functions stop \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称) \
	--instance-id 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_stopFunction?summary=an+instance)

</TabItem>
<TabItem value="Java">

```java
admin.functions().stopFunction(tenant, namespace, functionName, Integer.parseInt(instanceId));
```

</TabItem>

</Tabs>
````

### 停止函数的所有实例

您可以使用管理 CLI、REST API 或 Java 管理 API 停止所有函数实例。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`stop`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=stop) 子命令。

**示例**

```shell
pulsar-admin functions stop \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_stopFunction?summary=all)

</TabItem>
<TabItem value="Java">

```java
admin.functions().stopFunction(tenant, namespace, functionName);
```

</TabItem>

</Tabs>
````

## 重启函数

您可以[重启函数的一个实例](#重启函数的一个实例)或[重启函数的所有实例](#重启函数的所有实例)。

### 重启函数的一个实例

使用管理 CLI、REST API 或 Java 管理 API 通过 `instance-id` 重启函数实例。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`restart`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=restart) 子命令。

**示例**

```shell
pulsar-admin functions restart \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称) \
	--instance-id 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_restartFunction?summary=an+instance)

</TabItem>
<TabItem value="Java">

```java
admin.functions().restartFunction(tenant, namespace, functionName, Integer.parseInt(instanceId));
```

</TabItem>

</Tabs>
````

### 重启函数的所有实例

您可以使用管理 CLI、REST API 或 Java 管理 API 重启所有函数实例。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`restart`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=restart) 子命令。

**示例**

```shell
pulsar-admin functions restart \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_restartFunction?summary=all)

</TabItem>
<TabItem value="Java">

```java
admin.functions().restartFunction(tenant, namespace, functionName);
```

</TabItem>

</Tabs>
````

## 列出所有函数

您可以使用管理 CLI、REST API 或 Java 管理 API 列出在特定租户和命名空间下运行的所有 Pulsar 函数。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`list`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=list) 子命令。

**示例**

```shell
pulsar-admin functions list \
	--tenant public \
	--namespace default
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_listFunctions)

</TabItem>
<TabItem value="Java">

```java
admin.functions().getFunctions(tenant, namespace);
```

</TabItem>

</Tabs>
````

## 删除函数

您可以使用管理 CLI、REST API 或 Java 管理 API 删除在 Pulsar 集群上运行的 Pulsar 函数。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`delete`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=delete) 子命令。

**示例**

```shell
pulsar-admin functions delete \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_deregisterFunction)

</TabItem>
<TabItem value="Java">

```java
admin.functions().deleteFunction(tenant, namespace, functionName);
```

</TabItem>

</Tabs>
````

## 获取函数信息

您可以使用管理 CLI、REST API 或 Java 管理 API 获取当前在集群模式下运行的 Pulsar 函数的信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`get`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=get) 子命令。

**示例**

```shell
pulsar-admin functions get \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_getFunctionInfo)

</TabItem>
<TabItem value="Java">

```java
admin.functions().getFunction(tenant, namespace, functionName);
```

</TabItem>

</Tabs>
````

## 获取函数状态

您可以[获取函数一个实例的状态](#获取函数一个实例的状态)或[获取函数所有实例的状态](#获取函数所有实例的状态)。

### 获取函数一个实例的状态

您可以使用管理 CLI、REST API 或 Java 管理 API 通过 `instance-id` 获取 Pulsar 函数实例的当前状态。
````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`status`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=status) 子命令。

**示例**

```shell
pulsar-admin functions status \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称) \
	--instance-id 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_getFunctionInstanceStatus)

</TabItem>
<TabItem value="Java">

```java
admin.functions().getFunctionStatus(tenant, namespace, functionName, Integer.parseInt(instanceId));
```

</TabItem>

</Tabs>
````

### 获取函数所有实例的状态

您可以使用管理 CLI、REST API 或 Java 管理 API 获取 Pulsar 函数实例的当前状态。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`status`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=status) 子命令。

**示例**

```shell
pulsar-admin functions status \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_getFunctionStatus)

</TabItem>
<TabItem value="Java">

```java
admin.functions().getFunctionStatus(tenant, namespace, functionName);
```

</TabItem>

</Tabs>
````

## 获取函数统计信息

您可以[获取函数一个实例的统计信息](#获取函数一个实例的统计信息)或[获取函数所有实例的统计信息](#获取函数所有实例的统计信息)。
### 获取函数一个实例的统计信息

您可以使用管理 CLI、REST API 或 Java 管理 API 通过 `instance-id` 获取 Pulsar 函数实例的当前统计信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`stats`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=stats) 子命令。

**示例**

```shell
pulsar-admin functions stats \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称) \
	--instance-id 1
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_getFunctionInstanceStats)

</TabItem>
<TabItem value="Java">

```java
admin.functions().getFunctionStats(tenant, namespace, functionName, Integer.parseInt(instanceId));
```

</TabItem>

</Tabs>
````

### 获取函数所有实例的统计信息

您可以使用管理 CLI、REST API 或 Java 管理 API 获取 Pulsar 函数的当前统计信息。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`stats`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=stats) 子命令。

**示例**

```shell
pulsar-admin functions stats \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_getFunctionStats)

</TabItem>
<TabItem value="Java">

```java
admin.functions().getFunctionStats(tenant, namespace, functionName);
```

</TabItem>

</Tabs>
````

## 触发函数

您可以使用管理 CLI、REST API 或 Java 管理 API 通过提供的值触发指定的 Pulsar 函数。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`trigger`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=trigger) 子命令。

**示例**

```shell
pulsar-admin functions trigger \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称) \
	--topic (输入主题的名称) \
	--trigger-value \"hello pulsar\"
	# 或 --trigger-file (触发文件的路径)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_triggerFunction)

</TabItem>
<TabItem value="Java">

```java
admin.functions().triggerFunction(tenant, namespace, functionName, topic, triggerValue, triggerFile);
```

</TabItem>

</Tabs>
````



## 设置与函数关联的状态

您可以使用管理 CLI、REST API 或 Java 管理 API 设置与 Pulsar 函数关联的状态。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`putstate`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=putstate) 子命令。

**示例**

```shell
pulsar-admin functions putstate \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称) \
	--state "{\"key\":\"pulsar\", \"stringValue\":\"hello pulsar\"}"
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_putFunctionState)

</TabItem>
<TabItem value="Java">

```java
TypeReference<FunctionState> typeRef = new TypeReference<FunctionState>() {};
FunctionState stateRepr = ObjectMapperFactory.getThreadLocal().readValue(state, typeRef);
admin.functions().putFunctionState(tenant, namespace, functionName, stateRepr);
```

</TabItem>

</Tabs>
````

## 获取与函数关联的状态

您可以使用管理 CLI、REST API 或 Java 管理 API 获取与 Pulsar 函数关联的当前状态。

````mdx-code-block
<Tabs groupId="api-choice"
  defaultValue="Admin CLI"
  values={[{"label":"Admin CLI","value":"Admin CLI"},{"label":"REST API","value":"REST API"},{"label":"Java","value":"Java"}]}>
<TabItem value="Admin CLI">

使用 [`querystate`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=querystate) 子命令。

**示例**

```shell
pulsar-admin functions querystate \
	--tenant public \
	--namespace default \
	--name (Pulsar Functions 的名称) \
	--key (状态的键)
```

</TabItem>
<TabItem value="REST API">

[](swagger:/admin/v3/functions/FunctionsBase_getFunctionState)

</TabItem>
<TabItem value="Java">

```java
admin.functions().getFunctionState(tenant, namespace, functionName, key);
```

</TabItem>

</Tabs>
````