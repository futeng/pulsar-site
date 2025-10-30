---
id: setup-buildtools
title: Setting up JDKs and Maven using SDKMAN
---

## 使用 SDKMAN 设置 JDK 和 Maven

### 安装 SDKMAN

请参阅 https://sdkman.io/install 获取详细说明。

### 安装 JDK 版本 21 和 17

在 Pulsar 开发中，我们使用 [Amazon Corretto OpenJDK](https://docs.aws.amazon.com/corretto/) 来构建 Pulsar。

- JDK 21 用于 Pulsar 版本 >= 3.3
  - 代码将使用 Java 21 为 Java 17 编译
  - Pulsar docker 镜像从 3.3.0 开始运行 Java 21
- JDK 17 用于 Pulsar 版本 >= 2.11
- JDK 8 或 11 用于 Pulsar 版本 < 2.11

#### 使用 SDKMAN 安装 Amazon Corretto OpenJDK 版本 21 和 17。

```shell
# 查找最新的 Amazon Corretto 发布
sdk l java |grep amzn
# 安装
sdk i java 21.0.9-amzn
sdk i java 17.0.17-amzn
# 在版本之间切换
sdk u java 17.0.17-amzn
sdk u java 21.0.9-amzn
# 添加/更新别名
cd ~/.sdkman/candidates/java
rm -f 17 && ln -s 17.0.17-amzn 17
rm -f 21 && ln -s 21.0.9-amzn 21
# 使用别名在版本之间切换
sdk u java 17
sdk u java 21
```

#### 设置 SDKMAN Java 版本自动切换（可选）

使用自动切换，当目录中有 `.sdkmanrc` 文件时，SDKMAN 将切换到定义的 Java 版本。
这对于开发者在不同版本的 Java 之间切换很方便。

```shell
# 启用 sdkman_auto_env
echo sdkman_auto_env=true >> ~/.sdkman/etc/config
# 默认忽略 .sdkmanrc 文件
echo .sdkmanrc >> ~/.gitignore_global
# 启用全局 ~/.gitignore_global 文件
git config --global core.excludesfile $HOME/.gitignore_global

# 现在你可以在仓库目录中添加 .sdkmanrc 文件以自动切换 JDK 版本
echo java=21 > .sdkmanrc && cd $PWD
```

### 安装 Maven

```shell
sdk i maven 3.9.9
```