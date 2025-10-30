---
id: setup-ide
title: Setting up an IDE
---

Apache Pulsar 使用 [lombok](https://projectlombok.org/)，因此你必须确保你的 IDE 配置了所需的插件。

## IntelliJ IDEA

### 配置项目 JDK 为 JDK 21

1. 打开 **Project Settings**。点击 **File** → **Project Structure** → **Project Settings** → **Project**。
2. 选择 JDK 版本。从 JDK 版本下拉列表中，选择 **Download JDK...** 或选择一个现有的最近安装的 Java 21 JDK 版本 [由 SDKMAN 安装](setup-buildtools.md)。
3. 在下载对话框中，选择版本 **17** 和供应商 **Amazon Corretto**。

### 为 Maven 配置 Java 版本

1. 打开 Maven Importing Settings。点击 **Settings** → **Build, Execution, Deployment** → **Build Tools** → **Maven** → **Importing**。
2. 对于 **JDK for Importer** 设置，选择 **Use Project JDK**。这会在导入项目时使用 Java 21 JDK 来运行 Maven。
3. 确保 **Maven** → **Runner** 对话框中的 JRE 设置为 **Use Project JDK**。

:::caution

Maven 构建中的一些配置是基于 JDK 版本的条件配置。当"JDK for Importer"与"Project JDK"不同时，会选择不正确的配置。

:::

### 配置注解处理

1. 打开 Annotation Processors Settings。点击 **Settings** → **Build, Execution, Deployment** → **Compiler** → **Annotation Processors**。
2. 选择以下按钮：
   1. **Enable annotation processing**
   2. **Obtain processors from project classpath**
   3. Store generated sources relative to: **Module output directory**
3. 将生成的源目录设置为与 Maven 目录相同：
   1. 将"Production sources directory:"设置为"generated-sources"。
   2. 将"Test sources directory:"设置为"generated-test-sources"。
4. 点击 **OK**。
5. 在 IntelliJ 中启用 lombok 插件。

### 为编译器进程配置 VM 选项以避免 Lombok 的 StackOverflowError

1. 打开 Compiler Settings。点击 **Settings** → **Build, Execution, Deployment** → **Compiler**
2. 在 **Build Process** 下，将 **Shared VM options** 设置为 `-Xss1500k`
3. 点击 **OK**。

### 配置代码风格

1. 通过进入 **Settings** → **Editor** → **Code Style** 打开 Code Style Settings 对话框。
2. 点击 :gear: 符号 → **Import scheme** → **IntelliJ IDEA code style XML**
3. 选择文件 `${pulsar_dir}/src/idea-code-style.xml`
4. 在打开的对话框中，点击 **OK**。
5. 确保在 **Scheme** 下拉列表中选择了你刚创建的方案，然后点击 **OK**。

### 配置 Checkstyle

1. 安装 Checkstyle-IDEA 插件。
2. 打开 Checkstyle Settings。点击 **Settings** → **Tools** → **Checkstyle**。
3. 将 **Checkstyle version** 设置为 **10.14.2**。
4. 将 **Scan scope** 设置为 **Only Java sources (including tests)**。
5. 在 **Configuration** 部分点击 **+** 按钮打开选择 checkstyle 配置文件的对话框。
   1. 输入一个 **Description**。例如，Pulsar。
   2. 选择 **Use a local checkstyle file**。
   3. 将 **File** 设置为 **buildtools/src/main/resources/pulsar/checkstyle.xml**。
   4. 选择 **Store relative to project location**。
   5. 点击 **Next**
   6. 对于抑制文件，设置 **buildtools/src/main/resources/pulsar/suppressions.xml** 文件的绝对路径。在 shell 中你可以使用 `echo $PWD/buildtools/src/main/resources/pulsar/suppressions.xml` 命令找到它。
   7. 点击 **Next** → **Finish**。
6. 通过切换相应的框激活你刚添加的配置。
7. 点击 **OK**。

你可以通过激活左侧栏中的 CheckStyle UI 来扫描单个文件。图标是一个铅笔。

![IntelliJ 中的 Checkstyle UI](/assets/intellij-checkstyle.png)

### 进一步配置

* 在 IntelliJ 中处理 Pulsar 核心模块时，减少 IntelliJ 中的活动项目数量以加快 IDE 操作速度并减少不相关的 IDE 警告。
  * 在 IntelliJ 的 Maven UI 树视图中的"Profiles"下
    * 激活"core-modules" Maven 配置文件
    * 停用"main" Maven 配置文件
    * 从 Maven UI 工具栏运行"Reload All Maven Projects"操作。你也可以通过按两次 **Shift** 键激活的 IntelliJ"Search Everywhere"窗口中按名称找到该操作。
* 从 Maven UI 工具栏运行"Generate Sources and Update Folders For All Projects"操作。你也可以通过按两次 **Shift** 键激活的 IntelliJ"Search Everywhere"窗口中按名称找到该操作。运行该操作对于所有项目大约需要 10 分钟。当"core-modules"配置文件是唯一活动的配置文件时，这会更快。

### 故障排除

* 如果出现缺少 Protobuf 类的编译错误，确保运行"Generate Sources and Update Folders For All Projects"操作。
* 当所有 Pulsar 源代码在 IntelliJ 中无法正确编译并且存在编译错误时：
  * 如果在 Pulsar 核心模块上工作，使用"core-modules"配置文件，因为这些模块的源代码可以在 IntelliJ 中编译。
  * 有时通过右键单击项目名称并从菜单中选择 **Ignore Projects** 来在 IntelliJ Maven UI 中标记特定项目为忽略可能会有帮助。
  * 目前，由于编译问题，并不总是可以直接从 IDE 运行单元测试。作为一种变通方法，可以使用 `mvn test -Dtest=TestClassName` 命令运行单个测试类。
* 已执行以上所有步骤，但测试仍然无法运行。
  * 在这种情况下，请尝试以下步骤：
    1. 关闭 IntelliJ。
    2. 在命令行上运行 `mvn clean install -DskipTests`。
    3. 重新打开 IntelliJ。
  * 如果仍然不起作用：
    1. 验证 Maven 使用的是支持的版本。目前，支持的 Maven 版本在根 `pom.xml` 文件的 `<requireMavenVersion>` 部分中指定。
    2. 尝试在 IntelliJ 中"restart and clear caches"并重复上述步骤重新加载项目并生成源代码。

## Visual Studio Code (VS Code)

在开始之前，确保你已在 VS Code 中安装了 [Java Extension Pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)。

由于 Pulsar 开发使用多个版本的 Java，建议使用 [SDKMAN](https://sdkman.io/installation) 来管理不同版本的 Java。单独的指南 [如何设置构建工具](setup-buildtools.md) 解释了如何使用 SDKMAN 安装 Java 17 和 21。

使用 SDKMAN 安装 Java 版本后，你可以将以下设置添加（或修改）到你的 VS Code 用户级别 `settings.json` 文件中。有关更多详细信息，请查看 [VS Code 文档](https://code.visualstudio.com/docs/getstarted/settings)。打开设置文件最简单的方法是从命令面板 (`Ctrl+Shift+P` 或 Mac 上的 `Cmd+Shift+P`) 运行 `Preferences: Open Settings (JSON)` 命令。

```json
{
    "java.jdt.ls.vmargs": "-Xmx6g -XX:+UseZGC -XX:+ZGenerational -Dsun.zip.disableMemoryMapping=true",
    "java.jdt.ls.java.home": "~/.sdkman/candidates/java/21",
    "java.configuration.runtimes": [
        {
            "name": "JavaSE-21",
            "path": "~/.sdkman/candidates/java/21",
            "default": true
        },
        {
            "name": "JavaSE-17",
            "path": "~/.sdkman/candidates/java/17"
        }
    ],
    "java.autobuild.enabled": false,
    "java.debug.settings.onBuildFailureProceed": true,
    "java.compile.nullAnalysis.mode": "disabled",
    "java.configuration.updateBuildConfiguration": "interactive"
}
```

如果 `java.jdt.ls.java.home` 设置没有指向 Java 21 JDK，你必须从 `java.jdt.ls.vmargs` 设置中删除 `-XX:+ZGenerational`，因为 Java 21 是支持代际 ZGC 的第一个版本。

`java.autobuild.enabled` 设置为 `false`，因为在 VS Code 中构建 Pulsar 项目需要很长时间。

`java.debug.settings.onBuildFailureProceed` 设置为 `true`，以便即使存在单个构建失败也可以运行测试。

在运行测试之前，你需要至少使用以下命令手动构建项目一次：

```shell
mvn -Pcore-modules,-main -T 1C clean install -DskipTests -Dspotbugs.skip=true -Dcheckstyle.skip=true -Dlicense.skip=true -DnarPluginPhase=none
```

这将使 protobuf / lightproto 生成的类可在 IDE 中运行的测试使用。没有这个，运行时会出现缺少类或 Mockito 相关的错误。

有关故障排除，请查看 [Java 扩展文档的语言支持](https://github.com/redhat-developer/vscode-java/wiki/Troubleshooting)。如果问题与语言服务器相关，在设置中添加 `"java.transport": "stdio"` 可以帮助在错误日志中显示错误。

## Eclipse

按照[这些说明](https://howtodoinjava.com/automation/lombok-eclipse-installation-examples/)来配置你的 Eclipse 设置。