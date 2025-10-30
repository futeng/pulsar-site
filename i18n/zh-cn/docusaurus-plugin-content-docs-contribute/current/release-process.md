---
id: release-process
title: Release process
---

本页面包含 Pulsar 提交者关于如何执行发布的说明。

本文档中使用的术语功能/补丁发布定义如下：

* 功能发布包含 2.10.0、2.11.0、3.0.0 等。
* 补丁发布指的是错误修复发布，如 2.10.1、2.10.2 等。
* 预览发布指的是在 LTS 版本发布过程中发生的 LTS 发布预览发布。

## 准备工作

在 dev@pulsar.apache.org 上开启讨论，通知其他人你自愿作为特定发布的发布管理员。如果没有分歧，你可以开始发布流程。

对于 LTS 和功能发布，一旦所有带有 X.Y.0 里程碑的 PR 被合并，你应该创建一个名为 `branch-X.Y` 的新分支。如果一些带有 X.Y.0 里程碑的 PR 仍在进行中并且可能需要很长时间完成，如果它们不重要，你可以将它们移动到下一个里程碑。在这种情况下，你最好在 PR 中通知作者。

对于 LTS 发布的预览发布，创建一个分支 `branch-X.0-preview`。这个分支将用于保存将版本更改为预览版本的提交。预览发布将在此分支中标记。

对于补丁发布，如果没有分歧，你应该将所有标记为 `release/X.Y.Z` 的合并 PR cherry-pick 到 `branch-X.Y`。在这些 PR 被 cherry-pick 之后，你应该添加 `cherry-picked/branch-X.Y` 标签。

有时一些 PR 无法干净地 cherry-pick，你可能需要创建一个单独的 PR 并将 `release/X.Y.Z` 标签从原始 PR 移动到它。在这种情况下，你可以请求作者帮助创建新的 PR。

对于仍然开放的 PR，你可以选择将它们延迟到下一个发布或 ping 其他人进行审查以便它们可以被合并。

如果你还没有完成，[创建并发布 GPG 密钥](create-gpg-keys.md)。你将使用该密钥对发布工件进行签名。

在你开始下一个发布步骤之前，确保你已经安装了这些软件：

* Amazon Corretto OpenJDK
  * JDK 21 用于 Pulsar 版本 >= 3.3
    * 代码将使用 Java 21 为 Java 17 编译
    * Pulsar docker 镜像从 3.3.0 开始运行 Java 21
  * JDK 17 用于 Pulsar 版本 >= 2.11
  * JDK 11 用于早期版本
* Maven 3.9.9（最新的稳定 Maven 3.9.x 版本）
  * 使用 `sdkman i maven 3.9.9` 安装
* Zip

请参考["使用 SDKMAN 设置 JDK 和 Maven"](setup-buildtools.md)了解如何使用 SDKMAN 安装 JDK 和 Maven 的详细信息。

## 准备发布分支

在开始发布之前，除了处理 PR 之外，有必要检查依赖项中没有开放的关键安全漏洞。这可以从 GitHub 安全警报和 [OWASP 依赖检查工作流运行日志](https://github.com/apache/pulsar/actions/workflows/ci-owasp-dependency-check.yaml)中检查。

此外，检查是否有新的 [Netty 发布可用](https://netty.io/news/index.html)包含重要修复也很有用。

要验证发布分支没有被破坏，你应该为 [pulsar-ci.yaml](https://github.com/apache/pulsar/actions/workflows/pulsar-ci.yaml) 和 [pulsar-ci-flaky.yaml](https://github.com/apache/pulsar/actions/workflows/pulsar-ci-flaky.yaml) 工作流触发 Pulsar CI 构建。在执行发布之前，构建必须通过。

## 设置跨命令使用的环境变量 {#env-vars}

```shell
export VERSION_RC=4.0.7-candidate-1
export VERSION_WITHOUT_RC=${VERSION_RC%-candidate-*}
export NEXT_VERSION_WITHOUT_RC=4.0.8
export VERSION_BRANCH=branch-4.0
export UPSTREAM_REMOTE=origin
export SDKMAN_JAVA_VERSION=21
```

对于 3.x 发布，使用 Java 17：

```shell
# 对于 3.x 发布，使用 Java 17 而不是 Java 21
export SDKMAN_JAVA_VERSION=17
```

预览发布的示例：

```shell
export VERSION_RC=4.0.0-preview.1
export VERSION_WITHOUT_RC=${VERSION_RC%-candidate-*}
export VERSION_BRANCH=branch-4.0-preview
export UPSTREAM_REMOTE=origin
export SDKMAN_JAVA_VERSION=21
```

设置你的 ASF 用户 ID

```shell
export APACHE_USER=<你的 ASF 用户ID>
```

此外，你需要设置 `PULSAR_PATH` 指向发布分支的干净检出工作目录。

如果你在 GPG 签名方面遇到问题，设置这个

```shell
export GPG_TTY=$(tty)
```

对于一些命令，使用 `pbcopy` 将模板复制到剪贴板。
这在 MacOS 上已经可用。对于 Linux，创建一个 shell 别名：

```shell
# 仅限 Linux
# 如果缺少 xsel 则安装它
sudo apt install xsel
# 创建别名 pbcopy 用于将 stdin 复制到剪贴板
alias pbcopy="xsel --clipboard --input"
```

## 创建发布候选

### 创建发布分支

我们将创建一个发布分支，标签将在那里生成，新修复将作为发布维护的一部分应用。

该分支只需要为功能发布创建，而不需要为像 `3.3.2` 这样的补丁发布创建。对于补丁发布，转到下一步。

例如，当处理 `3.3.0` 发布时，将创建分支 `branch-3.3`；但对于 `3.3.1`，将使用现有的 `branch-3.3`。

建议创建仓库的新克隆以避免任何本地文件干扰过程：

```shell
git clone https://github.com/apache/pulsar
cd pulsar
export PULSAR_PATH=$(pwd)
git checkout -b $VERSION_BRANCH origin/master
```

或者，你可以使用 git 工作区在你的机器上创建一个新的、干净的目录，而不需要重新下载项目。

```shell
git worktree add ../pulsar-release-$VERSION_BRANCH $VERSION_BRANCH
cd ../pulsar-release-$VERSION_BRANCH
export PULSAR_PATH=$(pwd)
```

如果你收到分支已经检出的错误，转到该目录并将其从分支分离。之后上述命令应该成功
```shell
git checkout --detach HEAD
```

发布后，你可以清理主仓库目录中的工作树
```shell
git worktree remove ../pulsar-release-$VERSION_BRANCH
```

如果你创建了新分支，更新 [CI - OWASP 依赖检查](https://github.com/apache/pulsar/blob/master/.github/workflows/ci-owasp-dependency-check.yaml) 工作流，使其在新分支上运行。请注意，你还应该删除不再[支持安全更新](https://pulsar.apache.org/contribute/release-policy/#supported-versions)的先前 Pulsar 版本的分支。

### Cherry-picking 计划用于发布的更改

请阅读关于[维护任务和 cherry-picking](maintenance-process.md)的单独指南。

### 为下一个发布创建 GitHub 标签并将标记为当前发布的 PR 移动到新标签

在上一个 cherry-picking 步骤中，所有标记为当前发布的 PR 都被 cherry-pick 到发布分支。

现在，我们需要为下一个发布创建新标签。从现在开始，PR 应该标记为新发布标签而不是当前发布标签。

```shell
gh label create "release/$NEXT_VERSION_WITHOUT_RC" --color "#1D76DB"
```

如果仍有任何 PR 标记为当前发布标签，你需要将它们移动到新发布标签。请查看 [cherry-picking 指南](maintenance-process.md)了解如何搜索它们。

### 更新项目版本和标签

在发布过程中，你将最初创建"候选"标签，经过验证和批准后将提升为"真实"最终标签。

在这个过程中，项目的 maven 版本将始终是最终版本。

```shell
# 提升到发布版本
cd $PULSAR_PATH
./src/set-project-version.sh $VERSION_WITHOUT_RC

# 提交
git commit -m "Release $VERSION_WITHOUT_RC" -a
```

```shell
# 创建"候选"标签
git tag -u $APACHE_USER@apache.org v$VERSION_RC -m "Release $VERSION_RC"

# 在推送之前验证你签署了你的标签：
git tag -v v$VERSION_RC

# 将分支和标签推送到 Github 仓库
git push $UPSTREAM_REMOTE $VERSION_BRANCH
git push $UPSTREAM_REMOTE v$VERSION_RC
```

如果需要用更多提交重新开始发布，你可以删除标签。

```shell
# 仅在发布发布投票前重新开始发布时运行。不要在那之后运行！
# 删除本地标签
git tag -d v$VERSION_RC
# 删除远程标签
git push $UPSTREAM_REMOTE :v$VERSION_RC
```

## 指定 MAVEN_OPTS

设置 `MAVEN_OPTS` 以避免构建过程中的问题。

```shell
export MAVEN_OPTS="-Xss1500k -Xmx3072m -XX:+UnlockDiagnosticVMOptions -XX:GCLockerRetryAllocationCount=100"
```

## 清理本地编译的 BookKeeper 工件

有必要确保 BookKeeper 工件是从 Maven 仓库获取的，而不是使用本地编译的 BookKeeper 工件（[参考](https://lists.apache.org/thread/gsbh95b2d9xtcg5fmtxpm9k9q6w68gd2)）。

清理 Pulsar 使用的版本的本地 Maven 仓库 Bookkeeper 工件：

```shell
cd $PULSAR_PATH
sdk u java $SDKMAN_JAVA_VERSION
BOOKKEEPER_VERSION=$(command mvn initialize help:evaluate -Dexpression=bookkeeper.version -pl . -q -DforceStdout)
echo "BookKeeper version is $BOOKKEEPER_VERSION"
[ -n "$BOOKKEEPER_VERSION" ] && ls -G -d ~/.m2/repository/org/apache/bookkeeper/**/"${BOOKKEEPER_VERSION}" 2> /dev/null | xargs -r rm -rf
```

### 构建发布工件

运行以下命令构建工件：

```shell
cd $PULSAR_PATH
# 确保使用正确的 JDK 版本进行构建
sdk u java $SDKMAN_JAVA_VERSION
# 构建二进制文件
command mvn clean install -DskipTests
```

构建后，你应该找到以下 tarball、zip 文件和包含所有 Pulsar IO nar 文件的 connectors 目录：

* `distribution/server/target/apache-pulsar-3.X.Y-bin.tar.gz`
* `distribution/offloaders/target/apache-pulsar-offloaders-3.X.Y-bin.tar.gz`
* `distribution/shell/target/apache-pulsar-shell-3.X.Y-bin.tar.gz`
* `distribution/shell/target/apache-pulsar-shell-3.X.Y-bin.zip`
* 目录 `distribution/io/target/apache-pulsar-io-connectors-3.X.Y-bin`

### 检查许可证

首先，检查 `LICENSE` 和 `NOTICE` 文件是否覆盖了 bin 包的所有包含的 jar。你可以使用脚本交叉验证 `LICENSE` 文件与包含的 jar：

```shell
cd $PULSAR_PATH
src/check-binary-license.sh distribution/server/target/apache-pulsar-*-bin.tar.gz
src/check-binary-license.sh distribution/shell/target/apache-pulsar-*-bin.tar.gz
```

在一些较旧的分支中，脚本被称为 `src/check-binary-license` 而不是 `src/check-binary-license.sh`。

### 如果你还没有完成，创建并发布 GPG 密钥

如果你还没有完成，[创建并发布 GPG 密钥](create-gpg-keys.md)。你将使用该密钥对发布工件进行签名。

在运行下面的脚本之前，确保 `<yourname>@apache.org` 代码签名密钥是默认的 gpg 签名密钥。

确保这一点的一种方法是创建/编辑文件 `~/.gnupg/gpg.conf` 并添加一行：

```
default-key <密钥指纹>
```

... 其中 `<密钥指纹>` 应该替换为 `<yourname>@apache.org` 密钥的私钥指纹。密钥指纹可以在 `gpg -K` 输出中找到。

这可以通过以下命令自动化：

```shell
# KEY_ID 是短格式，在 gpg -K 中可见的子集密钥 ID
KEY_ID=$(gpg --list-keys --with-colons $APACHE_USER@apache.org | egrep "^pub" | awk -F: '{print $5}')
echo "default-key $KEY_ID" >> ~/.gnupg/gpg.conf
```

### 签名并将工件暂存到本地 SVN 目录

src 和 bin 工件需要签名并最终上传到 dist SVN 仓库进行暂存。此步骤不应在 $PULSAR_PATH 内运行。

```shell
# 确保在不同的目录中运行 svn mkdir 命令（不在 $PULSAR_PATH 中）。
mkdir ~/pulsar-svn-release-$VERSION_RC
cd ~/pulsar-svn-release-$VERSION_RC

# 在 SVN 服务器中创建空目录
svn mkdir --username $APACHE_USER -m "Add directory for pulsar $VERSION_RC release" https://dist.apache.org/repos/dist/dev/pulsar/pulsar-$VERSION_RC
# 检出空目录
svn co https://dist.apache.org/repos/dist/dev/pulsar/pulsar-$VERSION_RC

# cd 到目录中
cd pulsar-$VERSION_RC

# 暂存发布工件
$PULSAR_PATH/src/stage-release.sh .

# 请检查 `pulsar-3.X.Y-candidate-1` 中文件的大小。
# 如果你没有用干净的工作空间构建工件，`apache-pulsar-3.X.Y-src.tar.gz` 文件
# 可能太大而无法上传。
ls -ltra
du -ms *

# 验证工件已正确签名并具有正确的校验和：
( for i in **/*.(tar.gz|zip|nar); do echo $i; gpg --verify $i.asc $i || exit 1 ; done )
( for i in **/*.(tar.gz|zip|nar); do echo $i; shasum -a 512 -c $i.sha512 || exit 1 ; done )

# 还不要提交和上传，有单独的步骤处理
```

### 验证发布文件

然后使用[验证发布候选](validate-release-candidate.md)页面中的说明对生成的二进制分发进行一些健全性检查。

确保运行 Apache RAT 来验证 src 包中的许可证头：

```shell
cd /tmp
tar -xvzf ~/pulsar-svn-release-${VERSION_RC}/pulsar-$VERSION_RC/apache-pulsar-*-src.tar.gz
cd apache-pulsar-$VERSION_WITHOUT_RC-src
command mvn apache-rat:check
```

### 将本地 SVN 目录中的暂存文件提交并上传到 ASF SVN 服务器

```shell
cd  ~/pulsar-svn-release-$VERSION_RC/pulsar-$VERSION_RC
svn add *
svn ci -m "Staging artifacts and signature for Pulsar release $VERSION_RC"
```

### 暂存 Maven 模块

:::caution
在并行处理多个发布时，确保一次只运行一个发布。同时运行多个构建将导致所有发布都放入单个暂存仓库中。在执行另一个发布之前，关闭[暂存仓库](https://repository.apache.org/#stagingRepositories)。
:::

在以下行中设置你的 ASF 密码。在命令行的第一个字符处添加一个空格，这样你的密码就不会记录在 shell 历史中。

```shell
 export APACHE_PASSWORD=""
```

将工件上传到 [ASF Nexus](https://repository.apache.org)

```shell
cd $PULSAR_PATH
# 确保使用正确的 JDK 版本进行构建
sdk u java $SDKMAN_JAVA_VERSION
# 确认 $PULSAR_PATH 中没有其他新的目录或文件，因为 $PULSAR_PATH 中的所有文件都将被压缩并上传到 ASF Nexus。
git status

# 将 master 分支的 src/settings.xml 复制到 /tmp/mvn-apache-settings.xml，因为某些分支中缺少它
curl -s -o /tmp/mvn-apache-settings.xml https://raw.githubusercontent.com/apache/pulsar/master/src/settings.xml

# 发布工件
command mvn deploy -DskipTests -Papache-release --settings /tmp/mvn-apache-settings.xml
# 发布 org.apache.pulsar.tests:integration 及其父 pom org.apache.pulsar.tests:tests-parent
command mvn deploy -DskipTests -Papache-release --settings /tmp/mvn-apache-settings.xml -f tests/pom.xml -pl org.apache.pulsar.tests:tests-parent,org.apache.pulsar.tests:integration
```

:::note

`GPG_TTY` 环境变量必须为以下所有步骤设置。否则，某些操作可能会因"gpg failed to sign the data"而失败。

:::

这将询问 GPG 密钥密码，然后将其上传到暂存仓库。

登录到 https://repository.apache.org 的 ASF Nexus 仓库

在左侧边栏点击"Staging Repositories"，然后选择当前的 Pulsar 暂存仓库。这应该叫做类似 `orgapachepulsar-XYZ`。

使用此命令将版本字符串（如"Apache Pulsar 3.0.4-candidate-1"）添加到剪贴板：

```shell
printf "Apache Pulsar $VERSION_RC" |pbcopy
```

使用"Close"按钮关闭仓库。

在点击"Confirm"之前在描述字段中输入版本字符串。

此操作将需要几分钟。完成后点击"Refresh"，现在应该可以访问暂存仓库的链接，类似 https://repository.apache.org/content/repositories/orgapachepulsar-XYZ

### 暂存 Docker 镜像

之后，以下镜像将被构建并推送到你自己的 DockerHub 账户：

* pulsar
* pulsar-all

#### Pulsar 3.0 之前的发布

这仅在 Intel 平台上支持。在 Mac Apple Silicon 上，你可以在虚拟机或 Apple 笔记本外部的物理机中运行 Linux amd64，并使用 `export DOCKER_HOST=tcp://x.x.x.x:port` 使用远程 docker 引擎构建 docker 镜像。不要通过未加密的通道转发 TCP/IP 连接。
你可以在 Linux Intel 机器中使用 `socat TCP-LISTEN:2375,bind=0.0.0.0,reuseaddr,fork UNIX-CLIENT:/var/run/docker.sock` 启动套接字代理。
要在 Mac Apple Silicon 上运行 Linux Intel VM，你可以使用 `limactl create --name=linux_amd64 --rosetta --arch x86_64` 使用 https://lima-vm.io/ 创建 VM。
但是，直接在 Linux arm64 / x86_64 VM 上进行发布更简单。

在 Linux 机器上运行以下命令（或使用 DOCKER_HOST 指向 Linux amd64/Intel 机器的 Mac）：

```shell
cd $PULSAR_PATH/docker
# 确保使用正确的 JDK 版本进行构建
sdk u java $SDKMAN_JAVA_VERSION
./build.sh
DOCKER_USER=<your-username> DOCKER_PASSWORD=<your-password> DOCKER_ORG=<your-organization> ./publish.sh
```

### 发布 Pulsar 3.0 及更高版本

在构建 docker 镜像之前，清理构建历史，这样你就不会在构建过程中耗尽磁盘空间。
Docker Desktop 中的 Docker buildx 默认将构建历史大小限制为 20GB。

```shell
# 检查总 docker 磁盘使用情况
docker system df
# 检查构建缓存的总体大小
docker buildx du
# 清理磁盘空间
# 这是强制性的，如果上一步显示的使用量超过 10GB
docker buildx prune
```

用于创建和发布 docker 镜像，运行以下命令：

```shell
# 设置你的 dockerhub 用户名
DOCKER_USER=<your-dockerhub-username>
```

```shell
# 登录到 dockerhub
docker login -u $DOCKER_USER
```

```shell
# 确保你在本地有最新的基础镜像
docker pull ubuntu:22.04 # 用于 3.0.x
docker pull alpine:3.21 # 用于 3.3.x+

cd $PULSAR_PATH
# 确保使用正确的 JDK 版本进行构建
sdk u java $SDKMAN_JAVA_VERSION

command mvn install -pl docker/pulsar,docker/pulsar-all \
    -DskipTests \
    -Pmain,docker,docker-push \
    -Ddocker.platforms=linux/amd64,linux/arm64 \
    -Ddocker.organization=$DOCKER_USER \
    -Ddocker.noCache=true \
    -Ddocker.skip.tag=false
```

## 呼吁基于发布候选发布版本的投票

在开发邮件列表上开始投票线程。

这是一种呈现投票电子邮件模板的方法。

设置这些 shell 变量

```shell
DOCKER_USER=<your-dockerhub-username>
STAGING_REPO="<从 https://repository.apache.org/#stagingRepositories 输入暂存仓库>"
MY_NAME="Firstname Lastname"
PREVIOUS_VERSION_WITHOUT_RC="4.0.6"
```

```shell
echo "Go to https://hub.docker.com/r/$DOCKER_USER/pulsar/tags to find the layer URL for the pulsar image"
echo "Go to https://hub.docker.com/r/$DOCKER_USER/pulsar-all/tags to find the layer URL for the pulsar image"
```

在查找 URL 后设置这些额外的 shell 变量

```shell
PULSAR_IMAGE_URL="<在上一步中查找>"
PULSAR_ALL_IMAGE_URL="<在上一步中查找>"
```

也设置这些

```shell
PULSAR_IMAGE_NAME="$DOCKER_USER/pulsar:$VERSION_WITHOUT_RC-$(git rev-parse --short=7 v$VERSION_RC^{commit})"
PULSAR_ALL_IMAGE_NAME="$DOCKER_USER/pulsar-all:$VERSION_WITHOUT_RC-$(git rev-parse --short=7 v$VERSION_RC^{commit})"
```

```shell
# 检查 Pulsar standalone 启动（使用 CTRL-C 终止）对于两种架构
docker run --platform linux/arm64 --rm $PULSAR_IMAGE_NAME /pulsar/bin/pulsar standalone
docker run --platform linux/amd64 --rm $PULSAR_IMAGE_NAME /pulsar/bin/pulsar standalone
docker run --platform linux/arm64 --rm $PULSAR_ALL_IMAGE_NAME /pulsar/bin/pulsar standalone
docker run --platform linux/amd64 --rm $PULSAR_ALL_IMAGE_NAME /pulsar/bin/pulsar standalone
```

现在你可以将模板渲染到剪贴板

```shell
VOTE_DURATION=72
tee >(pbcopy) <<EOF
To: dev@pulsar.apache.org
Subject: [VOTE] Release Apache Pulsar $VERSION_WITHOUT_RC based on $VERSION_RC

Hello Apache Pulsar Community,

This is a call for the vote to release the Apache Pulsar version $VERSION_WITHOUT_RC based on $VERSION_RC.

Included changes since the previous release:
https://github.com/apache/pulsar/compare/v$PREVIOUS_VERSION_WITHOUT_RC...v$VERSION_RC

*** Please download, test and vote on this release. This vote will stay open
for at least $VOTE_DURATION hours ***

Only votes from PMC members are binding, but members of the community are
encouraged to test the release and vote with "(non-binding)".

Note that we are voting upon the source (tag), binaries are provided for
convenience.

The release candidate is available at:
https://dist.apache.org/repos/dist/dev/pulsar/pulsar-$VERSION_RC/

SHA-512 checksums:
$(cat $HOME/pulsar-svn-release-$VERSION_RC/pulsar-$VERSION_RC/apache-pulsar-$VERSION_WITHOUT_RC-src.tar.gz.sha512 | sed 's|\./||g')
$(cat $HOME/pulsar-svn-release-$VERSION_RC/pulsar-$VERSION_RC/apache-pulsar-$VERSION_WITHOUT_RC-bin.tar.gz.sha512 | sed 's|\./||g')

Maven staging repo:
$STAGING_REPO

The tag to be voted upon:
v$VERSION_RC (commit $(git rev-parse v$VERSION_RC^{commit}))
https://github.com/apache/pulsar/releases/tag/v$VERSION_RC

Pulsar's KEYS file containing PGP keys you use to sign the release:
https://downloads.apache.org/pulsar/KEYS

Docker images:
docker pull $PULSAR_IMAGE_NAME
$PULSAR_IMAGE_URL
docker pull $PULSAR_ALL_IMAGE_NAME
$PULSAR_ALL_IMAGE_URL

Please download the source package, and follow the README to build
and run the Pulsar standalone service.

More advanced release validation instructions can be found at
https://pulsar.apache.org/contribute/validate-release-candidate/

Thanks,

$MY_NAME
EOF
```

投票应该开放至少 72 小时（3 天）。Pulsar PMC 成员的投票将被视为约束性投票，而其他任何人也被鼓励验证发布并投票。

如果发布在这里获得 3 个 +1 约束性投票获得批准，你可以继续下一步。否则，你应该重复前面的步骤并准备另一个发布候选进行投票。

## LTS 预览发布步骤（这仅适用于预览发布，如 4.0.0-preview.1）

对于预览发布，没有发布投票。预览发布直接在 Pulsar 用户和开发邮件列表上宣布，以便在官方 LTS 发布之前获得发布反馈。

预览发布不是官方 Apache 发布，它相当于项目的夜间构建。
预览发布工件将在 Maven 中央和 Docker Hub 上提供，以便用户可以在现有的构建管道中实际使用工件并向项目提供反馈。二进制文件在 Apache 项目中是补充性的，并不声明官方 ASF 发布。

在继续之前，对工件进行本地[发布验证](validate-release-candidate.md)。
之后，按照"发布 Maven 模块"和"发布 Docker 镜像"步骤在 Maven 中央和 DockerHub 中发布预览发布。预览发布不是官方发布，因此源代码不应在 SVN 上发布。

设置环境变量：

```shell
PULSAR_IMAGE_NAME=apachepulsar/pulsar:$VERSION_WITHOUT_RC
PULSAR_ALL_IMAGE_NAME=apachepulsar/pulsar-all:$VERSION_WITHOUT_RC
LTS_RELEASE=4.0
```

要宣布 LTS 预览发布，你可以使用这个模板：

```shell
tee >(pbcopy) <<EOF
To: dev@pulsar.apache.org, users@pulsar.apache.org
Subject: Apache Pulsar $VERSION_WITHOUT_RC available for testing - Feedback requested

Dear Apache Pulsar Community,

We're excited to announce the availability of Apache Pulsar $VERSION_WITHOUT_RC, a preview release aimed at gathering user feedback for the upcoming Pulsar $LTS_RELEASE LTS release. This preview is not an official Apache release but provides an early look at the new features and changes.

Preview artifacts are now available on Maven Central and Docker Hub, enabling users to integrate and test them in their build pipelines and environments. You can find downloadable artifacts at https://dist.apache.org/repos/dist/dev/pulsar/pulsar-$VERSION_RC/.

Repository tag: v$VERSION_RC (commit $(git rev-parse v$VERSION_RC^{commit}))
https://github.com/apache/pulsar/releases/tag/v$VERSION_RC

Changes since $PREVIOUS_VERSION_WITHOUT_RC:
https://github.com/apache/pulsar/compare/v$PREVIOUS_VERSION_WITHOUT_RC...v$VERSION_RC

Docker images: $PULSAR_IMAGE_NAME and $PULSAR_ALL_IMAGE_NAME.
Docker image tag is "$VERSION_WITHOUT_RC".

For Java client testing, we recommend using the Pulsar BOM in Maven or Gradle builds with version "$VERSION_WITHOUT_RC".
Pulsar BOM usage is explained at https://pulsar.apache.org/docs/next/client-libraries-java-setup/#pulsar-bom.

We urge you to test this preview in your environments and provide feedback. Please report any issues on our GitHub issue tracker at https://github.com/apache/pulsar/issues, checking for existing reports first.
Known blockers are tracked with the "release/blocker" label at https://github.com/apache/pulsar/labels/release%2Fblocker.

Pulsar $LTS_RELEASE timeline:
$(date -I): $LTS_RELEASE preview 1
$(date --date="10 days" -I): Target for $LTS_RELEASE preview 2
$(date --date="10 days" -I): Code freeze for $LTS_RELEASE by branching branch-$LTS_RELEASE from the master branch
$(date --date="13 days" -I): Target for $LTS_RELEASE release candidate 1
$(date --date="18 days" -I): Reserved for $LTS_RELEASE release candidate 2 if needed
$(date --date="20 days" -I): Planned $LTS_RELEASE.0 announcement (if release candidate 1 passes)

Your participation is crucial in shaping the quality of Pulsar $LTS_RELEASE. We appreciate your support and feedback.

Best regards,

$MY_NAME
EOF
```

## 总结发布投票

一旦投票通过，你需要在投票线程上向 [dev@pulsar.apache.org](mailto:dev@pulsar.apache.org) 发送结果投票。

消息：

```shell
tee >(pbcopy) <<EOF
Hello all,

The vote to release Apache Pulsar version ${VERSION_WITHOUT_RC} based on ${VERSION_RC} is now closed.

The vote PASSED with X binding "+1", Y non-binding "+1" and 0 "-1" votes:

"+1" Binding votes:

  - <name>

"+1" Non-Binding votes:

  - <name>

I'll continue with the release process and the release announcement will follow shortly.

Thanks,
<你的名字>
EOF
```

## 推广发布

对于以下命令，你需要设置环境变量 `VERSION_RC`、`VERSION_WITHOUT_RC`、`UPSTREAM_REMOTE` 和 `APACHE_USER`。
请查看[环境变量步骤](#env-vars)进行设置。

### 发布最终标签

创建并推送最终 Git 标签：

```shell
git tag -u $APACHE_USER@apache.org v$VERSION_WITHOUT_RC $(git rev-parse v$VERSION_RC^{}) -m "Release v$VERSION_WITHOUT_RC"
git push $UPSTREAM_REMOTE v$VERSION_WITHOUT_RC
```

### 在 GitHub 中创建发布说明

然后，你可以基于标签[创建 GitHub 发布](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release)。

```shell
# 打开此 URL 并通过单击"Create release from tag"创建发布说明
echo https://github.com/apache/pulsar/releases/tag/v${VERSION_WITHOUT_RC}

# cherry-picked 更改模板
echo "[""Cherry-picked changes](https://github.com/apache/pulsar/pulls?q=is%3Apr+is%3Amerged+label%3Arelease%2F${VERSION_WITHOUT_RC}+label%3Acherry-picked%2F${VERSION_BRANCH}+sort%3Acreated-asc)"|pbcopy
```

1. 在浏览器中打开上述 URL，并通过单击"Create release from tag"创建发布说明。
2. 在文本框上方的 UI 中找到"Previous tag: auto"，在那里选择上一个发布。
3. 单击"Generate release notes"。
4. 审查生成的发布说明。
5. 由于更改是 cherry-picked 的，你必须包含诸如 [Cherry-picked changes](https://github.com/apache/pulsar/pulls?q=is%3Apr+is%3Amerged+label%3Arelease%2F2.11.4+label%3Acherry-picked%2Fbranch-2.11+sort%3Acreated-asc) 之类的链接。有一个[生成自动化发布说明的单独指南](release-note-guide.md)。
6. 取消选择"Set as the latest release"（这应该只为 Pulsar 的实际最新发布选择）
7. 单击"Publish release"。

应该遵循[编写发布说明](release-note-guide.md)指南来生成适当的发布说明。这在"更新文档"部分涵盖。

### 在 SVN 上发布工件

在发布 SVN 仓库 https://dist.apache.org/repos/dist/release 上推广工件。请注意，此仓库仅限于 PMC 成员，如果你不是 PMC 成员，你可能需要 PMC 成员的帮助：

```shell
svn move -m "Release Apache Pulsar $VERSION_WITHOUT_RC" \
  https://dist.apache.org/repos/dist/dev/pulsar/pulsar-$VERSION_RC \
  https://dist.apache.org/repos/dist/release/pulsar/pulsar-$VERSION_WITHOUT_RC
```

### 发布 Maven 模块

推广 Maven 暂存仓库进行发布。登录到 https://repository.apache.org 并选择与已批准的 RC 候选关联的暂存仓库。
从发布投票邮件中仔细检查暂存仓库名称。
选择仓库并单击"Release"。工件现在将在 Maven 中央上可用。

### 发布 Docker 镜像

此步骤由 Apache Pulsar PMC 成员执行。请请求 PMC 成员帮助完成此步骤。

来自 [regclient](https://github.com/regclient/regclient) 的 `regctl` 需要用于复制多架构镜像。使用 `brew install regclient` 或 [其他安装选项](https://github.com/regclient/regclient/blob/main/docs/install.md) 安装 regclient。`regctl` 相对于使用 `docker pull/tag/push` 的好处是它将处理复制 `amd64` 和 `arm64` 镜像。

```shell
RELEASE_MANAGER_DOCKER_USER=otheruser
```

```shell
CANDIDATE_TAG=${VERSION_WITHOUT_RC}-$(git rev-parse --short=7 v$VERSION_RC^{})
regctl image copy ${RELEASE_MANAGER_DOCKER_USER}/pulsar:${CANDIDATE_TAG} apachepulsar/pulsar:$VERSION_WITHOUT_RC
regctl image copy ${RELEASE_MANAGER_DOCKER_USER}/pulsar-all:${CANDIDATE_TAG} apachepulsar/pulsar-all:$VERSION_WITHOUT_RC
```

去检查结果：

* https://hub.docker.com/r/apachepulsar/pulsar/tags
* https://hub.docker.com/r/apachepulsar/pulsar-all/tags

确保比 3.x 更新的镜像支持 amd64 和 arm64。较旧的 2.x 镜像应该只有 amd64。

:::caution

此步骤仅适用于最新发布。

:::

```shell
regctl image copy apachepulsar/pulsar:$VERSION_WITHOUT_RC apachepulsar/pulsar:latest
regctl image copy apachepulsar/pulsar-all:$VERSION_WITHOUT_RC apachepulsar/pulsar-all:latest
```

### 发布 Helm Chart

:::caution

此步骤仅适用于最新的*LTS*发布

:::

1. 在 Helm Chart 中升级镜像版本：[charts/pulsar/values.yaml](https://github.com/apache/pulsar-helm-chart/blob/master/charts/pulsar/values.yaml)
2. 在 Helm Chart 中升级 Chart 版本和 `appVersion` 到发布版本：[charts/pulsar/Chart.yaml](https://github.com/apache/pulsar-helm-chart/blob/master/charts/pulsar/Chart.yaml)
3. 发送拉取请求进行审查并使其合并。
4. 一旦合并，Chart 将自动发布到 https://github.com/apache/pulsar-helm-chart 的 GitHub 发布，并更新到 https://pulsar.apache.org/charts/index.yaml。

### 发布 Homebrew libpulsar 包

对于 2.8、2.9 和 2.10 发布，你应该在 Homebrew 上发布 libpulsar 包。

:::caution

C++ 客户端现在在[单独的仓库](https://github.com/apache/pulsar-client-cpp)中开发。如果你发布版本 >= 3.0.0，你应该查看它自己的发布指南。

:::

为 Homebrew 发布新版本的 libpulsar，你可以按照[这里](https://github.com/Homebrew/homebrew-core/pull/53514)的示例。

### 发布 Python 客户端

对于 2.8、2.9 和 2.10 发布，你应该发布 Python 客户端。

:::note

1. 你需要在 PyPI 上创建账户：https://pypi.org/account/register/
2. 要求之前曾是发布管理员的任何人在 PyPI 上将你添加为 pulsar-docker 的维护者
3. 一旦你完成了本节中的以下步骤，你可以在[下载文件](https://pypi.org/project/pulsar-client/#files)中检查 wheels 是否成功上传。记得在[发布历史](https://pypi.org/project/pulsar-client/#history)中切换到正确版本。

:::

:::caution

确保你在发布标签上运行以下命令！

:::

:::caution

Python 客户端现在在[单独的仓库](https://github.com/apache/pulsar-client-python)中开发。如果你发布版本 >= 3.0.0，你应该查看它自己的发布指南。

:::

#### Linux

有一个脚本在 Docker 镜像内构建和打包 Python 客户端：

```shell
pulsar-client-cpp/docker/build-wheels.sh
```

wheel 文件将留在 `pulsar-client-cpp/python/wheelhouse` 下。确保所有文件名中都有 `manylinux`。否则，这些文件将无法上传到 PyPI。

运行以下命令推送构建的 wheel 文件：

```shell
cd pulsar-client-cpp/python/wheelhouse
pip install twine
twine upload pulsar_client-*.whl
```

#### macOS

有一个脚本在 Docker 镜像内构建和打包 Python 客户端：

```shell
pulsar-client-cpp/python/build-mac-wheels.sh
```

wheel 文件将在 `pulsar-client-cpp/python/pkg/osx/` 下的每个平台目录中生成。然后你可以运行 `twine upload` 上传那些 wheel 文件。

## 更新文档

### 发布说明

此步骤适用于每个发布。阅读[编写发布说明](release-note-guide.md)的特定指南。

### Swagger 文件

此步骤适用于每个发布。

首先，从 apache/pulsar 仓库的发布标签构建 swagger 文件：

```shell
# 确保使用正确的 JDK 版本进行构建
sdk u java $SDKMAN_JAVA_VERSION
git checkout v$VERSION_WITHOUT_RC
command mvn -ntp install -Pcore-modules,swagger,-main -DskipTests -DskipSourceReleaseAssembly=true -Dspotbugs.skip=true -Dlicense.skip=true
PULSAR_PATH=$(pwd)
```

现在，从 apache/pulsar-site 仓库的主分支运行以下脚本：

```shell
cd tools/pytools
poetry install
poetry run bin/rest-apidoc-generator.py --master-path=$PULSAR_PATH --version=$VERSION_WITHOUT_RC
```

```shell
# 提交文件
# 移动到 pulsar-site 根目录
cd ../..
git add -u
git add static/swagger/$VERSION_WITHOUT_RC
git commit -m "update rest-apidoc for $VERSION_WITHOUT_RC"
```

阅读更多 [pytools](https://github.com/apache/pulsar-site/tree/main/tools/pytools/README.md) 的手册。

### Javadoc

:::caution

此步骤仅适用于功能发布，除非你确定针对补丁发布进行了重要的 Javadoc 修复。

:::

发布 Java 库后，从 apache/pulsar-site 仓库的主分支运行以下脚本：

```shell
cd tools/pytools
poetry install
poetry run bin/java-apidoc-generator.py $PULSAR_PATH
```

一旦文档生成，你可以添加它们并在 PR 中提交。预期的文档输出是：

* `static/api/admin`
* `static/api/client`
* `static/api/pulsar-functions`

```shell
cd ../..
git add static/api/*
git commit -m "update java-apidoc for $VERSION_WITHOUT_RC"
```

阅读更多 [pytools](https://github.com/apache/pulsar-site/tree/main/tools/pytools/README.md) 的手册。

### 参考

:::caution

此步骤仅适用于功能发布，除非你确定针对补丁发布进行了重要的参考修复。

:::

你可以通过从 apache/pulsar-site 仓库的主分支运行以下脚本来生成配置和命令行工具的参考：

```shell
# 在 /path/to/pulsar-3.X.Y 下构建 Pulsar 分发
cd tools/pytools
poetry install
# 确保使用 Runtime.getRuntime().availableProcessors() 的默认值将基于 1 作为 CPU 数量
_JAVA_OPTIONS=-XX:ActiveProcessorCount=1 poetry run bin/reference-doc-generator.py --master-path=$PULSAR_PATH --version=$VERSION_WITHOUT_RC
```

对于新的功能发布，你需要手动编辑 `src/static/reference/index.html` 并在 2 个位置为功能发布添加新条目（例如 `4.1.x`）：

```patch
+          '<option value="4.1.x">4.1.x</value>' +
-            values: ["2.6.x", "2.7.x", "2.8.x", "2.9.x", "2.10.x", "2.11.x", "3.0.x", "3.1.x", "3.2.x", "3.3.x", "4.0.x", "next"],
+            values: ["2.6.x", "2.7.x", "2.8.x", "2.9.x", "2.10.x", "2.11.x", "3.0.x", "3.1.x", "3.2.x", "3.3.x", "4.0.x", "4.1.x", "next"],
```

提交更改：

```shell
cd ../..
git add static/reference/*
git commit -m "update reference for $VERSION_WITHOUT_RC"
```

一旦文档生成，你可以添加它们并在 PR 中提交。预期的文档输出是 `static/reference/2.X.x`

阅读更多 [pytools](https://github.com/apache/pulsar-site/tree/main/tools/pytools/README.md) 的手册。

## 更新 `/docs` 重定向

https://pulsar.apache.org/docs 应该重定向到最新功能发布的文档。

如果你正在为 Pulsar 的较旧功能版本进行补丁发布，你可以跳过此步骤。

否则，你应该更新此文件中的版本：`static/.htaccess`

## 更新 `/docs` 版本列表下拉菜单

下拉菜单应该有以下项目：

* Next
* 活动版本[仍在支持中](/contribute/release-policy/#supported-versions)
* 其他

LTS 版本应该这样标记：`<version> LTS`。

<img alt="docs version dropdown" src="/img/version-dropdown.png" width="320px" />

如果你正在为 Pulsar 的较旧功能版本进行补丁发布，你可以跳过此步骤。

否则，你应该更新此文件中的下拉版本列表：`src/theme/DocsVersionDropdownNavbarItem.js`

## 宣布发布

一旦发布工件在 Apache Mirrors 中可用并且网站已更新，你需要宣布发布。你应该向 dev@pulsar.apache.org、users@pulsar.apache.org 和 announce@apache.org 发送电子邮件。以下是示例内容：

```shell
tee >(pbcopy) <<EOF
To: dev@pulsar.apache.org, users@pulsar.apache.org, announce@apache.org
Subject: [ANNOUNCE] Apache Pulsar $VERSION_WITHOUT_RC released

The Apache Pulsar team is proud to announce Apache Pulsar version $VERSION_WITHOUT_RC.

Pulsar is a highly scalable, low latency messaging platform running on
commodity hardware. It provides simple pub-sub semantics over topics,
guaranteed at-least-once delivery of messages, automatic cursor management for
subscribers, and cross-datacenter replication.

For Pulsar release details and downloads, visit:

https://pulsar.apache.org/download

Release Notes are at:
https://pulsar.apache.org/release-notes/versioned/pulsar-$VERSION_WITHOUT_RC/

We would like to thank the contributors that made the release possible.

Regards,

The Pulsar Team
EOF
```

以纯文本模式发送电子邮件，因为 announce@apache.org 邮件列表将拒绝包含 text/html 内容的消息。

在 Gmail 中，"⋮"菜单中有一个设置"Plain text mode"的选项。

## 写博客文章（可选）

鼓励写博客文章来总结此版本中引入的功能，特别是对于功能发布。

你可以按照[这里](https://github.com/apache/pulsar/pull/2308)的示例。请注意，博客的来源已移动到[这里](https://github.com/apache/pulsar-site/tree/main/blog)。

## 删除旧发布

删除旧发布（如果有）。你只需要那里有最新发布，旧发布可以通过 Apache 存档获得：

```shell
# 获取发布列表
svn ls https://dist.apache.org/repos/dist/release/pulsar

# 删除每个发布（除了最后一个）
svn rm https://dist.apache.org/repos/dist/release/pulsar/pulsar-3.X.X
```

## 在 pom.xml 中移动到下一个版本

### 功能发布（master 分支）

你需要将 master 版本移动到下一个迭代 `Y`（`X + 1`）。

```shell
git checkout master
./src/set-project-version.sh 3.Y.0-SNAPSHOT
git commit -a -s -m "[cleanup][build] Bumped version to 3.Y.0-SNAPSHOT'
```

由于这需要合并到 `master`，你需要遵循常规流程并在 GitHub 上创建 Pull Request。

对于功能发布，由于为发布创建了新分支，需要保护新分支免受强制推送，以防止损坏提交历史。这是通过在 `.asf.yaml` 中为新分支的分支保护设置添加规则来完成的。

```yaml
export RELEASE_BRANCH="branch-X.Y"
# 使用 yq 将新分支添加到 .asf.yaml 文件
yq -i '.github.protected_branches[strenv(RELEASE_BRANCH)]={}' .asf.yaml
# 提交对 .asf.yaml 的更改
git add .asf.yaml
git commit -m "[improve][ci] Protect $RELEASE_BRANCH from force pushes'
```

这将防止强制推送到发布分支，这对于维护提交历史的完整性很重要。

### 对于维护分支

发布过程后，你应该提升项目版本并附加 `-SNAPSHOT`。

```shell
./src/set-project-version.sh x.x.x-SNAPSHOT
git add -u
git commit -m "Bump version to next snapshot version"
```