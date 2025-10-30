---
id: develop-plugin
title: Pulsar 插件开发
sidebar_label: "插件"
---

您可以为 Pulsar 开发各种插件，如条目过滤器、协议处理器、拦截器等。

## 附加 Servlet

本章描述什么是附加 Servlet 以及如何使用它们。

### 什么是附加 Servlet？

Pulsar 提供了大量的 REST API 与之交互。为了将额外的自定义逻辑暴露为 REST API，Pulsar 提供了附加 Servlet 的概念。这些 Servlet 作为插件在 Broker 或 Pulsar 代理中运行。

### 如何使用附加 Servlet？

查看[此示例实现](https://github.com/apache/pulsar/blob/master/tests/docker-images/java-test-plugins/src/main/java/org/apache/pulsar/tests/integration/plugins/RandomAdditionalServlet.java)，或按照以下步骤操作：

1. 创建一个 Maven 项目。

2. 实现 `AdditionalServlet` 或 `AdditionalServletWithPulsarService` 接口。

3. 将您的项目打包成 NAR 文件。

4. 配置 `broker.conf` 文件（或 `standalone.conf` 文件）并重启您的 Broker。

#### 步骤 1：创建 Maven 项目

关于如何创建 Maven 项目，请参见[这里](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)。

#### 步骤 2：实现 `AdditionalServlet` 接口

1. 在 `pom.xml` 文件中为 `pulsar-broker` 添加依赖，如所示。否则，您将找不到 [`AdditionalServlet`](https://github.com/apache/pulsar/blob/master/pulsar-broker-common/src/main/java/org/apache/pulsar/broker/web/plugin/servlet/AdditionalServlet.java) 接口。

   ```xml
   <dependency>
      <groupId>org.apache.pulsar</groupId>
      <artifactId>pulsar-broker</artifactId>
      <version>${pulsar.version}</version>
      <scope>provided</scope>
   </dependency>
   ```

2. 实现 `AdditionalServlet` 接口的方法。

   - `loadConfig` 允许您通过从 `PulsarConfiguration` 加载配置属性来配置您的 Servlet。

   - `getBasePath` 定义您的 Servlet 将被加载的路径。

   - `getServletHolder` 返回此 Servlet 的 `ServletHolder`。

   - `close` 允许您释放资源。

3. 描述一个 NAR 文件。

   在 `resources/META-INF/services` 目录中创建一个 `additional_servlet.yml` 文件来描述 NAR 文件。

   ```conf
   name: my-servlet
   description: Describes my-servlet
   additionalServletClass: org.my.package.MyServlet
   ```

#### 步骤 3：将您的项目打包成 NAR 文件

1. 将 NAR 文件的编译插件添加到您的 `pom.xml` 文件中。

   ```xml
   <build>
      <finalName>${project.artifactId}</finalName>
      <plugins>
         <plugin>
            <groupId>org.apache.nifi</groupId>
            <artifactId>nifi-nar-maven-plugin</artifactId>
            <version>1.5.0</version>
            <extensions>true</extensions>
            <configuration>
               <finalName>${project.artifactId}-${project.version}</finalName>
            </configuration>
            <executions>
               <execution>
                  <id>default-nar</id>
                  <phase>package</phase>
                  <goals>
                     <goal>nar</goal>
                  </goals>
               </execution>
            </executions>
         </plugin>
      </plugins>
   </build>
   ```

2. 在 `target` 目录中生成 NAR 文件。

   ```script
   mvn clean install
   ```

#### 步骤 4：配置并重启 Broker

1. 在 `broker.conf` 文件（或 `standalone.conf` 文件）中配置以下参数。

   ```conf
   # 可插拔附加 Servlet 的名称
   # 多个 Servlet 需要用逗号分隔。
   additionalServlets=my-servlet
   # 所有附加 Servlet 实现的目录
   additionalServletDirectory=tempDir
   ```

2. 重启您的 Broker。

   如果插件成功加载，您可以看到以下 Broker 日志。

   ```text
   Successfully loaded additional servlet for name `my-servlet`
   ```

## 条目过滤器

本章描述什么是条目过滤器并展示如何使用条目过滤器。

### 什么是条目过滤器？

条目过滤器是实现自定义消息条目策略的扩展点。使用条目过滤器，您可以决定**是否将消息发送给消费者**（Broker 可以使用条目过滤器的返回值来确定消息是否需要发送或丢弃）或**将消息发送给特定的消费者**。

要实现标记消息或自定义延迟消息等功能，请使用 [`subscriptionProperties`](https://github.com/apache/pulsar/blob/ec0a44058d249a7510bb3d05685b2ee5e0874eb6/pulsar-client-api/src/main/java/org/apache/pulsar/client/api/ConsumerBuilder.java?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L174)、[`properties`](https://github.com/apache/pulsar/blob/ec0a44058d249a7510bb3d05685b2ee5e0874eb6/pulsar-client-api/src/main/java/org/apache/pulsar/client/api/ConsumerBuilder.java?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L533)和条目过滤器。

### 如何使用条目过滤器？

按照以下步骤操作：

1. 创建一个 Maven 项目。

2. 实现 `EntryFilter` 接口。

3. 将实现类打包成 NAR 文件。

4. 配置 `broker.conf` 文件（或 `standalone.conf` 文件）并重启您的 Broker。

#### 步骤 1：创建 Maven 项目

关于如何创建 Maven 项目，请参见[这里](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)。

#### 步骤 2：实现 `EntryFilter` 接口

1. 在 `pom.xml` 文件中为 Pulsar Broker 添加依赖以显示。否则，您将找不到 [`EntryFilter` 接口](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/service/plugin/EntryFilter.java)。

   ```xml
   <dependency>
   <groupId>org.apache.pulsar</groupId>
   <artifactId>pulsar-broker</artifactId>
   <version>${pulsar.version}</version>
   <scope>provided</scope>
   </dependency>
   ```

2. 实现 [`FilterResult filterEntry(Entry entry, FilterContext context);` 方法](https://github.com/apache/pulsar/blob/2adb6661d5b82c5705ee00ce3ebc9941c99635d5/pulsar-broker/src/main/java/org/apache/pulsar/broker/service/plugin/EntryFilter.java#L34)。

   - 如果方法返回 `ACCEPT` 或 NULL，此消息将发送给消费者。

   - 如果方法返回 `REJECT`，此消息将被过滤掉，不消耗消息许可。

   - 如果有多个条目过滤器，此消息将以轮询方式通过管道中的所有过滤器。如果任何条目过滤器返回 `REJECT`，此消息将被丢弃。

   您可以通过 `FilterContext` 获取条目元数据、订阅和其他信息。

3. 描述一个 NAR 文件。

   在 `resources/META-INF/services` 目录中创建一个 `entry_filter.yml` 或 `entry_filter.yaml` 文件来描述 NAR 文件。

   ```conf
   # 条目过滤器名称，稍后应在 broker.conf 文件中配置
   name: entryFilter
   # 条目过滤器描述
   description: entry filter
   # 条目过滤器的实现类名
   entryFilterClass: com.xxxx.xxxx.xxxx.DefaultEntryFilterImpl
   ```

#### 步骤 3：将条目过滤器的实现类打包成 NAR 文件

1. 将 NAR 文件的编译插件添加到您的 `pom.xml` 文件中。

   ```xml
   <build>
           <finalName>${project.artifactId}</finalName>
           <plugins>
               <plugin>
                   <groupId>org.apache.nifi</groupId>
                   <artifactId>nifi-nar-maven-plugin</artifactId>
                   <version>1.5.0</version>
                   <extensions>true</extensions>
                   <configuration>
                       <finalName>${project.artifactId}-${project.version}</finalName>
                   </configuration>
                   <executions>
                       <execution>
                           <id>default-nar</id>
                           <phase>package</phase>
                           <goals>
                               <goal>nar</goal>
                           </goals>
                       </execution>
                   </executions>
               </plugin>
           </plugins>
       </build>
   ```

2. 在 `target` 目录中生成 NAR 文件。

   ```script
   mvn clean install
   ```

#### 步骤 4：配置并重启 Broker

1. 在 `broker.conf` 文件（或 `standalone.conf` 文件）中配置以下参数。

   ```conf
   # 可插拔条目过滤器的类名
   # 多个类需要用逗号分隔。
   entryFilterNames=entryFilter1,entryFilter2,entryFilter3
   # 所有条目过滤器实现的目录
   entryFiltersDirectory=tempDir
   ```

2. 重启您的 Broker。

   如果插件成功加载，您可以看到以下 Broker 日志。

   ```text
   Successfully loaded entry filter for name `{您的条目过滤器的名称}`
   ```