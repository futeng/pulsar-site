---
id: security-kerberos
title: Authentication using Kerberos
sidebar_label: "Authentication using Kerberos"
description: Get a comprehensive understanding of concepts and configuration methods of Kerberos authentication in Pulsar.
---

[Kerberos](https://web.mit.edu/kerberos/) 是一种网络认证协议，旨在通过使用密钥加密为客户端应用程序和服务器应用程序提供强认证。

在 Pulsar 中，您可以将 Kerberos 与 [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) 一起用作认证的选择。由于 Pulsar 使用 [Java 认证和授权服务 (JAAS)](https://en.wikipedia.org/wiki/Java_Authentication_and_Authorization_Service) 进行 SASL 配置，您需要为 Kerberos 认证提供 JAAS 配置。

:::note

Kerberos 认证使用经过认证的主体作为 [Pulsar 授权](security-authorization.md) 的角色令牌。如果您启用了 `authorizationEnabled`，则需要在 `broker.conf` 中设置 `superUserRoles`，该角色对应于在 KDC 中注册的名称。例如：

```bash
superUserRoles=client/{clientIp}@EXAMPLE.COM
```

:::

## 先决条件

- 设置并运行 [密钥分发中心(KDC)](https://en.wikipedia.org/wiki/Key_distribution_center)。
- 如果您的组织没有 Kerberos 服务器，请安装一个。您的 Linux 供应商可能有 Kerberos 的软件包。有关如何安装和配置 Kerberos，请参阅 [Ubuntu](https://help.ubuntu.com/community/Kerberos) 和 [Redhat](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Managing_Smart_Cards/installing-kerberos.html)。
- 如果您使用 Oracle Java，则需要下载您的 Java 版本的 JCE 策略文件，并将它们复制到 `$JAVA_HOME/jre/lib/security` 目录。

## 在 broker 上启用 Kerberos 认证

要在 broker 上启用 Kerberos 认证，请完成以下步骤。

### 步骤 1：创建 Kerberos 主体

如果您使用现有的 Kerberos 系统，请向您的 Kerberos 管理员请求为集群中的每个 broker 以及通过 Kerberos 认证访问 Pulsar 的每个操作系统用户（通过客户端和 CLI 工具）获取一个主体。

如果您安装了自己的 Kerberos 系统，则需要使用以下命令创建这些主体：

```shell
### 为 broker 添加主体
sudo /usr/sbin/kadmin.local -q 'addprinc -randkey broker/{hostname}@{REALM}'
sudo /usr/sbin/kadmin.local -q "ktadd -k /etc/security/keytabs/{broker-keytabname}.keytab broker/{hostname}@{REALM}"
### 为客户端添加主体
sudo /usr/sbin/kadmin.local -q 'addprinc -randkey client/{hostname}@{REALM}'
sudo /usr/sbin/kadmin.local -q "ktadd -k /etc/security/keytabs/{client-keytabname}.keytab client/{hostname}@{REALM}"
```

broker 主体的第一部分（例如，`broker/{hostname}@{REALM}` 中的 `broker`）是每台主机的 `serverType`。`serverType` 的建议值是 `broker`（主机运行 Pulsar broker 服务）和 `proxy`（主机运行 Pulsar Proxy 服务）。

请注意，*Kerberos* 要求您所有的主机都可以通过其 FQDN 解析。

### 步骤 2：配置 broker

在 `broker.conf` 文件中，设置与 Kerberos 相关的配置。这是一个示例：

```conf
authenticationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderSasl
saslJaasClientAllowedIds=.*client.* ## 允许连接到 broker 的主体的正则表达式
saslJaasServerSectionName=PulsarBroker ## 对应于 broker 的 JAAS 配置文件中的部分

# Broker 本身的认证设置。当 broker 连接到其他 broker 时使用，或当代理连接到 broker 时使用，无论是在相同还是其他集群中
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationSasl
brokerClientAuthenticationParameters={"saslJaasClientSectionName":"PulsarClient", "serverType":"broker"}
```

为了使 Pulsar 内部管理客户端正常工作，您需要：
- 将 `brokerClientAuthenticationPlugin` 设置为客户端插件 `AuthenticationSasl`；
- 将 `brokerClientAuthenticationParameters` 设置为 JSON 字符串值 `{"saslJaasClientSectionName":"PulsarClient", "serverType":"broker"}`，其中 `PulsarClient` 是 `pulsar_jaas.conf` 文件中的部分名称，`"serverType":"broker"` 表示内部管理客户端连接到 broker。

### 步骤 3：配置 JAAS

JAAS 配置文件提供连接 KDC 的信息。这是一个名为 `pulsar_jaas.conf` 的示例：

```conf
 PulsarBroker {
   com.sun.security.auth.module.Krb5LoginModule required
   useKeyTab=true
   storeKey=true
   useTicketCache=false
   keyTab="/etc/security/keytabs/pulsarbroker.keytab"
   principal="broker/localhost@EXAMPLE.COM";
};

 PulsarClient {
   com.sun.security.auth.module.Krb5LoginModule required
   useKeyTab=true
   storeKey=true
   useTicketCache=false
   keyTab="/etc/security/keytabs/pulsarclient.keytab"
   principal="client/localhost@EXAMPLE.COM";
};
```

在上面的示例中：
- `PulsarBroker` 是 JAAS 文件中每个 broker 使用的部分名称。此部分告诉 broker 在 Kerberos 中使用哪个主体以及存储主体的 keytab 的位置。
- `PulsarClient` 是 JASS 文件中每个客户端使用的部分名称。此部分告诉客户端在 Kerberos 中使用哪个主体以及存储主体的 keytab 的位置。

您需要将 `pulsar_jaas.conf` 文件路径设置为 JVM 参数。例如：

```shell
    -Djava.security.auth.login.config=/etc/pulsar/pulsar_jaas.conf
```

### 步骤 4：连接到 KDC

:::note

如果您的配置了 Kerberos 的机器已经有系统范围的配置，您可以跳过此配置。

:::

`krb5.conf` 文件的内容指示默认的 Realm 和 KDC 信息。有关更多详细信息，请参阅 [JDK 的 Kerberos 要求](https://docs.oracle.com/javase/8/docs/technotes/guides/security/jgss/tutorials/KerberosReq.html)。

要为 broker 指定 `krb5.conf` 文件的路径，请输入以下命令。

```shell
-Djava.security.krb5.conf=/etc/pulsar/krb5.conf
```

这是 `krb5.conf` 文件的一个示例。

```conf
[libdefaults]
 default_realm = EXAMPLE.COM

[realms]
 EXAMPLE.COM  = {
  kdc = localhost:62037
 }
```

在上面的示例中：
- `EXAMPLE.COM` 是默认的 Realm；
- `kdc = localhost:62037` 是 `EXAMPLE.COM` Realm 的 KDC 服务器 URL。

## 在代理上启用 Kerberos 认证

如果您想在 broker 和客户端之间使用代理，Pulsar 代理（作为 Kerberos 中的 SASL 服务器）将在 broker 认证代理之前对客户端（作为 Kerberos 中的 SASL 客户端）进行认证。

要在代理上启用 Kerberos 认证，请完成以下步骤。

### 步骤 1：创建 Kerberos 主体

为 Pulsar 代理添加新的主体。

```shell
### 为 Pulsar Proxy 添加主体
sudo /usr/sbin/kadmin.local -q 'addprinc -randkey proxy/{hostname}@{REALM}'
sudo /usr/sbin/kadmin.local -q "ktadd -k /etc/security/keytabs/{proxy-keytabname}.keytab proxy/{hostname}@{REALM}"
```

有关为 broker 和客户端设置的主体，请参见[此处](#create-kerberos-principals)。

### 步骤 2：配置代理

在 `proxy.conf` 文件中，设置与 Kerberos 相关的配置。

```shell
## 与认证客户端相关
authenticationEnabled=true
authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderSasl
saslJaasClientAllowedIds=.*client.*
saslJaasServerSectionName=PulsarProxy

## 与被 broker 认证相关
brokerClientAuthenticationPlugin=org.apache.pulsar.client.impl.auth.AuthenticationSasl
brokerClientAuthenticationParameters={"saslJaasClientSectionName":"PulsarProxy", "serverType":"broker"}
forwardAuthorizationCredentials=true
```

在上面的示例中：
- 第一部分与客户端和代理之间的认证相关。在此阶段，客户端作为 SASL 客户端工作，而代理作为 SASL 服务器工作。
- 第二部分与代理和 broker 之间的认证相关。在此阶段，代理作为 SASL 客户端工作，而 broker 作为 SASL 服务器工作。

### 步骤 3：配置 JAAS

在 `pulsar_jaas.conf` 文件中为代理添加新部分。这是一个示例：

```conf
 PulsarProxy {
   com.sun.security.auth.module.Krb5LoginModule required
   useKeyTab=true
   storeKey=true
   useTicketCache=false
   keyTab="/etc/security/keytabs/pulsarproxy.keytab"
   principal="proxy/localhost@EXAMPLE.COM";
};
```

## 在 Java 客户端中配置 Kerberos 认证

:::note

确保启动 Pulsar 客户端的操作系统用户可以访问 `pulsar_jaas.conf` 文件中配置的 keytab 和 `krb5.conf` 文件中配置的 KDC 服务器。

:::

1. 在客户端应用程序中，在您的项目依赖中包含 `pulsar-client-auth-sasl`。

   ```xml
       <dependency>
         <groupId>org.apache.pulsar</groupId>
         <artifactId>pulsar-client-auth-sasl</artifactId>
         <version>${pulsar.version}</version>
       </dependency>
   ```

2. 将认证类型配置为使用 `AuthenticationSasl` 并提供以下参数。
   - 将 `saslJaasClientSectionName` 设置为 `PulsarClient`；
   - 将 `serverType` 设置为 `broker`。`serverType` 代表此客户端是连接到 broker 还是代理。客户端使用此参数知道应该使用哪个服务器端主体。

   以下是配置 Java 客户端的示例：

    ```java
    System.setProperty("java.security.auth.login.config", "/etc/pulsar/pulsar_jaas.conf");
    System.setProperty("java.security.krb5.conf", "/etc/pulsar/krb5.conf");

    Map<String, String> authParams = Maps.newHashMap();
    authParams.put("saslJaasClientSectionName", "PulsarClient");
    authParams.put("serverType", "broker");

    Authentication saslAuth = AuthenticationFactory
            .create(org.apache.pulsar.client.impl.auth.AuthenticationSasl.class.getName(), authParams);

    PulsarClient client = PulsarClient.builder()
            .serviceUrl("pulsar://my-broker.com:6650")
            .authentication(saslAuth)
            .build();
    ```

   :::note

   - 要为代理配置客户端，您需要将 `serverType` 设置为 `proxy` 而不是 `broker`。
   - 上面示例中的前两行是硬编码的。或者，您可以在运行应用程序时为 `pulsar_jaas.conf` 和 `krb5.conf` 文件设置额外的 JVM 参数，如下所示：

   ```shell
   java -cp -Djava.security.auth.login.config=/etc/pulsar/pulsar_jaas.conf -Djava.security.krb5.conf=/etc/pulsar/krb5.conf $APP-jar-with-dependencies.jar $CLASSNAME
   ```

   :::

## 在 CLI 工具中配置 Kerberos 认证

像 [`pulsar-admin`](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/)、[`pulsar-perf`](pathname:///reference/#/@pulsar:version_reference@/pulsar-perf/) 和 [`pulsar-client`](pathname:///reference/#/@pulsar:version_reference@/pulsar-client/) 这样的[命令行工具](reference-cli-tools.md)使用 Pulsar 安装中的 `conf/client.conf` 文件。

使用命令行工具时，您需要执行以下步骤：

1. 配置 `conf/client.conf` 文件。

   ```shell
   authPlugin=org.apache.pulsar.client.impl.auth.AuthenticationSasl
   authParams={"saslJaasClientSectionName":"PulsarClient", "serverType":"broker"}
   ```

2. 为 `pulsar_jaas.conf` 文件和 `krb5.conf` 文件设置带有附加选项的 JVM 参数。

   ```shell
   -Djava.security.auth.login.config=/etc/pulsar/pulsar_jaas.conf -Djava.security.krb5.conf=/etc/pulsar/krb5.conf
   ```

   您可以在文件 [`pulsar_tools_env.sh`](https://github.com/apache/pulsar/blob/master/conf/pulsar_tools_env.sh) 的 `PULSAR_EXTRA_OPTS` 末尾添加此内容，或者直接将此行 `OPTS="$OPTS -Djava.security.auth.login.config=/etc/pulsar/pulsar_jaas.conf -Djava.security.krb5.conf=/etc/pulsar/krb5.conf"` 添加到 CLI 工具脚本中。配置的含义与 Java 客户端部分中配置的含义相同。

## 在 ZooKeeper 和 broker 之间配置 Kerberos 认证

Pulsar broker 在与 Zookeeper 认证时充当 Kerberos 客户端。

1. 在 `conf/zookeeper.conf` 中添加设置。

   ```conf
   authProvider.1=org.apache.zookeeper.server.auth.SASLAuthenticationProvider
   requireClientAuthScheme=sasl
   ```

2. 输入以下命令，在 Pulsar broker 使用的 `pulsar_jaas.conf` 中添加 `Client` 配置部分：

   ```
    Client {
      com.sun.security.auth.module.Krb5LoginModule required
      useKeyTab=true
      storeKey=true
      useTicketCache=false
      keyTab="/etc/security/keytabs/pulsarbroker.keytab"
      principal="broker/localhost@EXAMPLE.COM";
   };
   ```

   在此设置中，Pulsar broker 的主体和 keytab 文件指示了您在与 ZooKeeper 认证时 broker 的角色。

有关更多信息，请参阅 [ZooKeeper 文档](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Client-Server+mutual+authentication)

## 为 BookKeeper 和 broker 配置 Kerberos 认证

Pulsar broker 在与 Bookie 认证时充当 Kerberos 客户端。

1. 在 `broker.conf` 中添加 `bookkeeperClientAuthenticationPlugin` 参数。

   ```conf
   bookkeeperClientAuthenticationPlugin=org.apache.bookkeeper.sasl.SASLClientProviderFactory
   ```

   `SASLClientProviderFactory` 在 broker 中创建 BookKeeper SASL 客户端，broker 使用创建的 SASL 客户端与 Bookie 节点进行认证。

2. 在 broker/proxy 使用的 `pulsar_jaas.conf` 文件中添加 `BookKeeper` 配置部分。

   ```conf
    BookKeeper {
      com.sun.security.auth.module.Krb5LoginModule required
      useKeyTab=true
      storeKey=true
      useTicketCache=false
      keyTab="/etc/security/keytabs/pulsarbroker.keytab"
      principal="broker/localhost@EXAMPLE.COM";
   };
   ```

   在此设置中，Pulsar broker 的主体和 keytab 文件指示了您在与 Bookie 认证时 broker 的角色。

有关更多信息，请参阅 [BookKeeper 文档](https://bookkeeper.apache.org/docs/next/security/sasl/)。