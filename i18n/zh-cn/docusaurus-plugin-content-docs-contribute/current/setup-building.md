---
id: setup-building
title: Setup and building
---

## 先决条件

| 依赖项 | 描述                                                                                                                                                                                                         |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Git        | Pulsar 的源代码托管在 GitHub 上作为 git 仓库。要使用 git 仓库，请[安装 git](https://git-scm.com/downloads)。我们强烈建议你还[设置 Git mergetool](setup-git.md#mergetool)来解决合并冲突。 |
| JDK        | Pulsar 的源代码主要是用 Java 编写的。因此，你需要一个可用的 Java 开发工具包（JDK）来构建它。建议使用 SDKMAN 安装 Corretto OpenJDK 21 和 17，详情请参阅["使用 SDKMAN 设置 JDK 和 Maven"](setup-buildtools.md)。 |
| Maven      | Pulsar 的源代码由 [Apache Maven](https://maven.apache.org/) 管理。推荐的 Maven 版本是 3.9.9。建议使用 SDKMAN 安装 Maven，详情请参阅["使用 SDKMAN 设置 JDK 和 Maven"](setup-buildtools.md)。 |
| Zip        | 构建过程需要 Zip 作为实用工具。 |

:::note

在 Windows 上，将下面的命令中的 `./mvnw` 替换为 `mvnw.cmd`。

:::

:::note

Pulsar 尚不支持在 Windows 上运行服务器，你必须使用 Docker 来运行 Pulsar。
请考虑查看[在 Docker 中运行 Pulsar](https://pulsar.apache.org/docs/3.1.x/getting-started-docker/)

:::

## 克隆

将源代码克隆到你的开发机器：

```bash
git clone https://github.com/apache/pulsar
```

以下命令假设从项目根目录执行：

```bash
cd pulsar
```

## 构建

编译并安装到本地 Maven 仓库：

```bash
./mvnw clean install -DskipTests
```

## 运行

```bash
bin/pulsar standalone
```

## 连接

```bash
bin/pulsar-shell
```