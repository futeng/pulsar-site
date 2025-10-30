---
id: create-gpg-keys
title: Creating GPG keys
---

本页面为 Pulsar 提交者提供如何进行初始 GPG 设置的说明。

这是 http://apache.org/dev/openpgp.html 上可用说明的精简版本。

在添加自定义配置之前，使用适当的权限创建 ~/.gnupg 目录：
```shell
mkdir ~/.gnupg
chmod 0700 ~/.gnupg
```

安装 GnuPG。例如在 macOS 上：

```shell
brew install gnupg
# 在 MacOS 上，安装钥匙串集成
brew install pinentry-mac
echo "pinentry-program $(brew --prefix)/bin/pinentry-mac" | tee -a ~/.gnupg/gpg-agent.conf
```

配置 gnupg 使用标准 DNS 解析：

```shell
# 解决常见的 "gpg: keyserver receive failed: Network is unreachable" 和
# "gpg: keyserver receive failed: No keyserver available" 错误
echo "standard-resolver" >  ~/.gnupg/dirmngr.conf
sudo pkill dirmngr
```

设置默认使用 `SHA512` 密钥的配置：

```shell
cat <<EOL >> ~/.gnupg/gpg.conf
personal-digest-preferences SHA512
cert-digest-algo SHA512
default-preference-list SHA512 SHA384 SHA256 SHA224 AES256 AES192 AES CAST5 ZLIB BZIP2 ZIP Uncompressed
EOL
```

检查版本：

```shell
gpg --version

# gpg (GnuPG) 2.1.22
# ...
```

生成新的 GPG 密钥：

:::note

新生成的 **RSA** 密钥应至少为 **4096** 位。

请求的密码短语用于您的 GPG 私钥。密码短语应该是一个强密码，您应该将其安全地存储在个人密码管理器中。

:::


```shell
# 对于 1.x 或 2.0.x
gpg --gen-key

# 对于 2.1.x
gpg --full-gen-key

gpg (GnuPG) 2.1.22; Copyright (C) 2017 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
Your selection? 1
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (2048) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) y

GnuPG needs to construct a user ID to identify your key.

Real name: test user
Email address: test@apache.org
Comment: CODE SIGNING KEY
You selected this USER-ID:
    "test user (CODE SIGNING KEY) <test@apache.org>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
<Enter passphrase>
```

## 将密钥上传到公钥服务器

使用密钥 ID 将其发布到多个公钥服务器：

```shell
# 查找您的密钥 ID
APACHEID=your_asf_id
KEY_ID=$(gpg --list-keys --with-colons $APACHEID@apache.org | egrep "^pub" | awk -F: '{print $5}')
echo "key id: $KEY_ID"
# 将公钥发送到多个服务器
gpg --send-key $KEY_ID
gpg --send-key --keyserver=keys.openpgp.org $KEY_ID
gpg --send-key --keyserver=keyserver.ubuntu.com $KEY_ID
```

## 将 Apache 密钥设置为 GPG 的默认密钥

这是签名发布制品所必需的

```shell
APACHEID=your_asf_id
KEY_ID=$(gpg --list-keys --with-colons $APACHEID@apache.org | egrep "^pub" | awk -F: '{print $5}')
echo "default-key $KEY_ID" >> ~/.gnupg/gpg.conf
```

## 将密钥附加到 KEYS 文件

GPG 密钥需要附加到 `KEYS` 文件中用于发布候选版本。

:::note

PMC 成员应完成此步骤。
请向 PMC 成员提供您的 GPG 密钥 ID，以验证其与上传到密钥服务器的密钥匹配。

:::

```shell
# 检出包含 KEYS 文件的 SVN 文件夹
svn co https://dist.apache.org/repos/dist/release/pulsar pulsar-dist-release-keys --depth files
cd pulsar-dist-release-keys
svn up KEYS

APACHEID=apacheid

# 从密钥服务器导入密钥，确保密钥 ID 与提交者提供的匹配
gpg --search-keys $APACHEID@apache.org
KEY_ID=$(gpg --list-keys --with-colons $APACHEID@apache.org | egrep "^pub" | awk -F: '{print $5}')
echo "key id: $KEY_ID"

# 以 ascii 格式导出密钥并将其附加到文件中
# 确保 GPG 密钥 ID 与提交者的匹配
( gpg --list-sigs $APACHEID@apache.org
  gpg --export --armor $APACHEID@apache.org ) | tee -a KEYS

# 提交到 SVN
svn ci -m "Added gpg key for $APACHEID"
```