---
id: functions-package-java
title: 打包 Java Functions
sidebar_label: "打包 Java Functions"
description: 学习如何在 Pulsar 中打包 Java 函数。
---

:::note

如果您计划打包并分发您的函数供他人使用，您有义务正确地为您的代码添加许可和版权。记住要为您代码使用的所有库以及您的分发添加许可和版权。

如果您使用 [NAR](#package-as-nar) 方法，NAR 插件会自动在生成的 NAR 包中创建一个 `DEPENDENCIES` 文件，包括您函数所有库的正确许可和版权。

关于运行时 Java 版本，请根据您的目标 Pulsar 版本参考 [Pulsar 运行时 Java 版本建议](https://github.com/apache/pulsar/blob/master/README.md#pulsar-runtime-java-version-recommendation)。

:::

有两种方法可以打包 Java Functions：

## 打包为 JAR

要将 Java 函数打包为 JAR，请完成以下步骤。

1. 创建一个带有 pom 文件的新 maven 项目。在以下代码示例中，`mainClass` 的值是您的包名。

   ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>

        <groupId>java-function</groupId>
        <artifactId>java-function</artifactId>
        <version>1.0-SNAPSHOT</version>

        <dependencies>
            <dependency>
                <groupId>org.apache.pulsar</groupId>
                <artifactId>pulsar-functions-api</artifactId>
                <version>@pulsar:version@</version>
            </dependency>
        </dependencies>

        <build>
            <plugins>
                <plugin>
                    <artifactId>maven-assembly-plugin</artifactId>
                    <configuration>
                        <appendAssemblyId>false</appendAssemblyId>
                        <descriptorRefs>
                            <descriptorRef>jar-with-dependencies</descriptorRef>
                        </descriptorRefs>
                        <archive>
                        <manifest>
                            <mainClass>org.example.test.ExclamationFunction</mainClass>
                        </manifest>
                    </archive>
                    </configuration>
                    <executions>
                        <execution>
                            <id>make-assembly</id>
                            <phase>package</phase>
                            <goals>
                                <goal>assembly</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.11.0</version>
                    <configuration>
                        <release>17</release>
                    </configuration>
                </plugin>
            </plugins>
        </build>

    </project>
   ```

2. 打包您的 Java 函数。

   ```bash
    mvn package
   ```

   Java 函数打包后，会自动创建一个 `target` 目录。打开 `target` 目录检查是否有类似于 `java-function-1.0-SNAPSHOT.jar` 的 JAR 包。

3. 使用以下命令运行 Java 函数。

   ```bash
    ./bin/pulsar-admin functions localrun \
       --classname org.example.test.ExclamationFunction \
       --jar $PWD/target/java-function-1.0-SNAPSHOT.jar \
       --inputs persistent://public/default/my-topic-1 \
       --output persistent://public/default/test-1 \
       --tenant public \
       --namespace default \
       --name JavaFunction
   ```

   以下日志表示 Java 函数启动成功。

   ```text
    ...
    07:55:03.724 [main] INFO  org.apache.pulsar.functions.runtime.ProcessRuntime - Started process successfully
    ...
   ```

## 打包为 NAR

要将 Java 函数打包为 NAR，请完成以下步骤。

1. 创建一个带有 pom 文件的新 maven 项目。

   ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>

        <groupId>java-function</groupId>
        <artifactId>java-function</artifactId>
        <version>1.0-SNAPSHOT</version>

        <dependencies>
            <dependency>
                <groupId>org.apache.pulsar</groupId>
                <artifactId>pulsar-functions-api</artifactId>
                <version>@pulsar:version@</version>
            </dependency>
        </dependencies>

        <build>
            <plugins>
                <plugin>
                    <groupId>org.apache.nifi</groupId>
                    <artifactId>nifi-nar-maven-plugin</artifactId>
                    <version>1.5.0</version>
                    </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.11.0</version>
                    <configuration>
                        <release>17</release>
                    </configuration>
                </plugin>
            </plugins>
        </build>

    </project>
   ```

   您还必须创建一个 `resources/META-INF/services/pulsar-io.yaml` 文件。在以下代码示例中，`functionClass` 的值是您的函数类名。`name` 是当函数作为[内置](functions-deploy-cluster-builtin.md)函数部署时使用的名称。

   ```yaml
   name: java-function
   description: my java function
   functionClass: org.example.test.ExclamationFunction
   ```

2. 打包您的 Java 函数。

   ```bash
   mvn package
   ```

   Java 函数打包后，会自动创建一个 `target` 目录。打开 `target` 目录检查是否有类似于 `java-function-1.0-SNAPSHOT.nar` 的 NAR 包。

3. 使用以下命令运行 Java 函数。

   ```bash
    ./bin/pulsar-admin functions localrun \
       --jar $PWD/target/java-function-1.0-SNAPSHOT.nar \
       --inputs persistent://public/default/my-topic-1 \
       --output persistent://public/default/test-1 \
       --tenant public \
       --namespace default \
       --name JavaFunction
   ```

   以下日志表示 Java 函数启动成功。

   ```text
    ...
    07:55:03.724 [main] INFO  org.apache.pulsar.functions.runtime.ProcessRuntime - Started process successfully
    ...
   ```