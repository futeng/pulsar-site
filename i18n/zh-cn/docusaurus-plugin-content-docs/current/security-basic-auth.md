---
id: security-basic-auth
title: Authentication using HTTP basic
sidebar_label: "Authentication using HTTP basic"
description: Get a comprehensive understanding of concepts and configuration methods of HTTP basic authentication in Pulsar.
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

[基本认证](https://en.wikipedia.org/wiki/Basic_access_authentication)是内置在 HTTP 协议中的简单认证方案，它使用 base64 编码的用户名和密码对作为凭据。

## 前提条件

在你的环境中安装 [`htpasswd`](https://httpd.apache.org/docs/2.4/programs/htpasswd.html) 来创建用于存储用户名-密码对的密码文件。

* 对于 Ubuntu/Debian，运行以下命令安装 `htpasswd`。

   ```bash
   apt install apache2-utils
   ```

* 对于 CentOS/RHEL，运行以下命令安装 `htpasswd`。

   ```bash
   yum install httpd-tools
   ```

## 创建认证文件

:::note

目前，你可以使用 MD5（推荐）和 CRYPT 加密来认证你的密码。

:::

要使用用户账户 `superuser/admin` 创建名为 `.htpasswd` 的密码文件，可以使用以下方法。

* 使用 MD5 加密（推荐）：

   ```bash
   htpasswd -cmb /path/to/.htpasswd superuser admin
   ```

* 使用 CRYPT 加密：

   ```bash
   htpasswd -cdb /path/to/.htpasswd superuser admin
   ```

* 添加更多用户：

   ```bash
   htpasswd -mb /path/to/.htpasswd newuser newpassword
   ```

## 在 Broker 中启用基本认证

1. 在 `conf/broker.conf` 文件中启用认证：

   ```properties
   # 启用认证
   authenticationEnabled=true
   authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderBasic

   # 认证设置
   basicAuthConf=/path/to/.htpasswd
   ```

2. 对于独立模式，编辑 `conf/standalone.conf` 文件：

   ```properties
   authenticationEnabled=true
   authenticationProviders=org.apache.pulsar.broker.authentication.AuthenticationProviderBasic
   basicAuthConf=/path/to/.htpasswd
   ```

## 在 Pulsar 客户端中配置基本认证

````mdx-code-block
<Tabs groupId="lang-choice"
  defaultValue="Java"
  values={[{"label":"Java","value":"Java"},{"label":"Python","value":"Python"},{"label":"C++","value":"C++"},{"label":"Node.js","value":"Node.js"},{"label":"Go","value":"Go"}]}>
<TabItem value="Java">

```java
import org.apache.pulsar.client.api.AuthenticationBasic;
import org.apache.pulsar.client.api.PulsarClient;

PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://localhost:6650")
    .authentication(
        AuthenticationBasic.builder()
            .userName("superuser")
            .password("admin")
            .build()
    )
    .build();
```

</TabItem>
<TabItem value="Python">

```python
from pulsar import Client, AuthenticationBasic

client = Client(
    "pulsar://localhost:6650",
    authentication=AuthenticationBasic("superuser", "admin")
)
```

</TabItem>
<TabItem value="C++">

```cpp
#include <pulsar/Client.h>

pulsar::ClientConfiguration config;
config.setAuth(pulsar::AuthBasic::create("superuser", "admin"));

pulsar::Client client("pulsar://localhost:6650", config);
```

</TabItem>
<TabItem value="Node.js">

```javascript
const { Pulsar, AuthenticationBasic } = require('pulsar-client');

const auth = new AuthenticationBasic('superuser', 'admin');

const client = new Pulsar.Client({
    serviceUrl: 'pulsar://localhost:6650',
    authentication: auth
});
```

</TabItem>
<TabItem value="Go">

```go
import (
    "github.com/apache/pulsar-client-go/pulsar"
)

auth := pulsar.NewAuthenticationBasic("superuser", "admin")

client, err := pulsar.NewClient(pulsar.ClientOptions{
    URL:            "pulsar://localhost:6650",
    Authentication: auth,
})
```

</TabItem>
</Tabs>
````

## 安全注意事项

* **密码存储**：基本认证使用 base64 编码，这不是加密。应始终与 TLS 一起使用以保护凭据。
* **密码强度**：使用强密码并定期更换。
* **文件权限**：确保 `.htpasswd` 文件具有适当的文件权限，只有授权用户可以读取。
* **定期审查**：定期审查用户账户并移除不再需要的账户。

## 故障排除

### 常见问题

1. **认证失败**：
   * 检查用户名和密码是否正确。
   * 验证 `.htpasswd` 文件路径和格式。

2. **文件权限错误**：
   * 确保 Pulsar 进程可以读取 `.htpasswd` 文件。
   * 检查文件和目录权限。

3. **加密方式不匹配**：
   * 确保使用支持的加密方式（MD5 或 CRYPT）。
   * 验证密码文件的生成方式。