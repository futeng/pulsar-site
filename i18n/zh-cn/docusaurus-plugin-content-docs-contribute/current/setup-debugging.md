---
id: setup-debugging
title: Debugging Pulsar source code in IDE
sidebar_label: "Debugging"
description: Getting started to debugging Pulsar in IDE.
---

在 IDE 中调试 Pulsar 源代码对于在开发过程中识别和解决问题至关重要。本页面提供了在独立模式下调试 Pulsar 和调试 Apache Pulsar 源代码版本的逐步说明。

## 在独立模式下调试 Pulsar

### 下载并解压 Pulsar 二进制分发版

下载所需 Pulsar 发布的二进制分发版并将其解压到你选择的目录中。

### 使用调试器选项在独立模式下运行 Pulsar

导航到 Pulsar 目录并运行以下命令：

```bash
OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" ./bin/pulsar standalone -nss -nfw
```

:::note

`suspend=n` 允许进程在不等待调试器立即连接的情况下启动。如果你希望进程等待调试器连接，可以将 `suspend=n` 更改为 `suspend=y`。

:::

:::note

在你的 IDE 中，按照[设置 IDE](setup-ide.md)中的说明为 Pulsar 开发配置你的 IDE。

:::

## 为远程调试配置 IntelliJ IDEA

首先，在 IntelliJ IDEA 中打开你的 Pulsar 项目：

1. 打开 IntelliJ IDEA。
2. 转到 `File > Open` 并导航到你的 Pulsar 项目。


然后，创建远程调试器配置：

1. 通过单击右上角附近的下拉菜单（`Run/Debug` 按钮旁边）并选择 `Edit Configurations` 来打开 `Run/Debug Configurations` 对话框。
2. 单击 `+` 按钮添加新配置并从列表中选择 `Remote`。
3. 为你的配置提供一个名称（例如，"Pulsar Remote Debugger"）。
4. 将 `Debugger mode` 设置为 `Attach to remote JVM`。
5. 将 `Host` 设置为 localhost 或运行 Pulsar 的机器的 IP 地址。
6. 将 `Port` 设置为你的 Pulsar 启动命令中使用的相同端口号（例如，5005）。
7. 单击 `Ok` 保存配置。


:::note

要重置持久状态，你可以在启动前删除 `data` 文件夹下的数据：`rm -rf data`。

:::

## 调试 Pulsar 的源代码版本

从源代码克隆并编译 Pulsar，并使用调试器选项在独立模式下运行 Pulsar：

```bash
git clone https://github.com/apache/pulsar
cd pulsar
mvn -Pcore-modules,-main -T 1C install -DskipTests -Dspotbugs.skip=true
OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" ./bin/pulsar standalone -nss -nfw
```

## 调试 pulsar-shell 和 pulsar-client

```bash
# 对于 Pulsar-Shell
OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" ./bin/pulsar-shell
# 对于 Pulsar-Client
# Consumer
OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" ./bin/pulsar-client consume -s sub apache/pulsar/test-topic -n 0
# Producer
OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" ./bin/pulsar-client produce apache/pulsar/test-topic  -m "---------hello apache pulsar-------" -n 10
```

确保调试器在你的 IDE 中配置为连接到指定的端口。

通过遵循这些步骤，你可以有效地调试独立模式和 Apache Pulsar 的源代码版本，包括 pulsar-shell 和 pulsar-client 进程。

## 在 IDE 或本地运行单元测试时为特定类启用调试日志

在处理 Pulsar 单元测试时，有时你希望为特定类、一组类或某个包启用调试日志，以观察代码在运行时的行为。对于不同的竞争条件以及涉及时间和超时的情况，逐步调试并不是可行的方法。在这些情况下，如果代码中还没有存在调试日志语句，你可以添加它们。这有助于理解失败测试用例的行为。

对于 pulsar-broker 模块中的测试，你需要编辑 [`pulsar-broker/src/test/resources/log4j2.xml` 文件](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/test/resources/log4j2.xml) 来启用日志记录。在 `Loggers` 中添加 `Logger` 元素可以用来为完整的包树或特定类启用调试日志记录。

```xml
    <Logger name="<<package or classname>>" level="DEBUG" additivity="false">
      <AppenderRef ref="CONSOLE"/>
    </Logger>
```

这是一个例子：

```xml
<Configuration xmlns="http://logging.apache.org/log4j/2.0/config"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xsi:schemaLocation="http://logging.apache.org/log4j/2.0/config https://logging.apache.org/log4j/2.0/log4j-core.xsd">
  <Appenders>
    <!-- setting follow="true" is required for using ConsoleCaptor to validate log messages -->
    <Console name="CONSOLE" target="SYSTEM_OUT" follow="true">
      <PatternLayout pattern="%d{ISO8601} - %-5p - [%t:%c{1}] - %m%n"/>
    </Console>
  </Appenders>
  <Loggers>
    <Root level="INFO">
      <AppenderRef ref="CONSOLE"/>
    </Root>
    <Logger name="org.apache.pulsar.broker.service.persistent.PersistentStickyKeyDispatcherMultipleConsumers" level="DEBUG" additivity="false">
      <AppenderRef ref="CONSOLE"/>
    </Logger>
    <!-- loggers for debugging Key_Shared / PIP-379 -->
    <Logger name="org.apache.pulsar.broker.service.persistent.PersistentStickyKeyDispatcherMultipleConsumers" level="DEBUG" additivity="false">
      <AppenderRef ref="CONSOLE"/>
    </Logger>
    <Logger name="org.apache.pulsar.broker.service.DrainingHashesTracker" level="DEBUG" additivity="false">
      <AppenderRef ref="CONSOLE"/>
    </Logger>
    <Logger name="org.apache.pulsar.broker.service.persistent.RescheduleReadHandler" level="DEBUG" additivity="false">
      <AppenderRef ref="CONSOLE"/>
    </Logger>
  </Loggers>
</Configuration>
```

你也可以在包级别设置调试来调试并排除导致日志记录过于冗长的类。在这些情况下，你可以为过于冗长的类将日志级别设置为 `WARN`。

```xml
    <Logger name="org.apache.pulsar.client.impl.ClientCnx" level="WARN" additivity="false">
      <AppenderRef ref="CONSOLE"/>
    </Logger>
```

当你调试 Pulsar 独立服务器而不是调试 Pulsar 单元测试失败时，可以使用相同的方法来修改 `conf/log4j2.yaml` 中可用的 Pulsar 独立日志记录配置。主要区别在于语法是 YAML。默认配置文件包含针对特定日志记录器配置的示例。