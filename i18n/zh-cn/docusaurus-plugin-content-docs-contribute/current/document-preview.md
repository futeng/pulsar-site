# Previewing content

本指南解释了为什么以及如何通过详细步骤和各种示例在本地预览 Pulsar 内容。

## 为什么要在本地预览更改？

**必须**在本地预览您的更改并在 PR 描述中附上预览截图。这带来许多好处，包括但不限于：

* 您可以测试您的写作。这是一种检查您是否使用正确[语法](document-syntax.md)的方式。您**必须确保**文档可以正确编译和发布。
* 您可以更快地让您的 PR 合并。审查者清楚地了解您的更改并可以加快审查过程。

## 如何在本地预览更改？

Pulsar 文档使用 [Docusaurus](https://docusaurus.io/) 构建。要在编辑文件时预览您的更改，您可以运行一个本地开发服务器，该服务器为您的网站提供服务并反映最新的更改。

### 先决条件

要在提交贡献之前验证文档构建正确，您应该设置本地环境来本地构建和显示文档。

* Node v20 LTS（与 Node v23 存在兼容性问题）
* Corepack 可用并启用（`corepack enable`）
* 虽然您可以使用 Linux、macOS 或 Windows 在本地构建 Pulsar 文档，但 macOS 是首选的构建环境，因为它提供最完整的文档构建支持。

在 macOS 或 Linux 上使用 [Homebrew](https://brew.sh/) 安装先决条件：

```shell
# 卸载任何现有的 node 安装
brew uninstall node
# 安装 node v20 LTS
brew install node@20
# 链接 node v20
brew link node@20
# 启用 corepack
corepack enable
```

#### Corepack 安装故障排除 - macOS 或 Linux 上的 Homebrew 安装

Docusaurus 支持 Node v18 LTS 和 v20 LTS，因此请确保您安装了这些版本之一。
有时 Homebrew 已安装 Corepack，但它不可用。

一些修复 `corepack` 安装的命令：

```shell
# 如果存在 node 符号链接则删除
brew unlink node
# 卸载默认 node 版本
brew uninstall node
# 卸载 yarn
brew uninstall yarn
# 升级包
brew upgrade
# 删除 node@20 符号链接
brew unlink node@20
# 如果尚未安装 node v20 LTS，则安装
brew install node@20
# 重新创建符号链接
brew link node@20
# 删除 /opt/homebrew/bin 中的损坏符号链接
find /opt/homebrew/bin -type l ! -exec test -e {} \; -delete
# 启用 corepack，如果命令失败，从 `/opt/homebrew/bin` 中删除冲突文件并重试
corepack enable
```

请确保您已将 Homebrew 包升级到最新版本。运行 `brew upgrade` 来升级所有已安装的包。

不要从包管理器单独安装 `yarn`，因为它包含在 `node@20` 捆绑的 `corepack` 中。如果您使用 Homebrew，请使用 `brew uninstall yarn` 卸载任何现有的 `yarn` 安装以避免冲突。

如果 `corepack enable` 因文件冲突而失败，请验证没有遗留的 `corepack` 或 `yarn` 包已安装。如果找到，请删除它们。不建议在更新的 Homebrew 安装上删除 `corepack`，因为它会卸载 `node@20` 包。
如果 `corepack enable` 由于冲突文件而继续失败，请手动从 `/opt/homebrew/bin` 中删除冲突文件并重试。

### 预览更改

Pulsar 网站更改指对 Pulsar 网站所做的所有更改，包括但不限于以下页面：

* [用户文档](pathname:///docs)
* [贡献指南](about.md)
* [发布说明](pathname:///release-notes/)
* [生态系统页面](pathname:///ecosystem)
* [案例研究](pathname:///case-studies)
* ...

按照以下步骤预览网站更改。

1. 切换到工作目录：

    ```bash
    cd pulsar-site/
    ```

2. 运行以下命令预览更改：

   ```bash
   # 预览 master 上的更改（下一版本文档）
   ./preview.sh

   # 预览特定版本上的更改
   ./preview.sh 4.0.x

   # 预览多个版本上的更改
   ./preview.sh 4.0.x 3.0.x current
   ```

如果您遇到内容陈旧问题，可以将 `--clean`（或 `-c`）标志传递给 `preview.sh` 脚本来清理 Docusaurus 缓存并开始新构建。
这会在启动预览服务器之前运行 `yarn run docusaurus clear`。

默认情况下，浏览器窗口将在 [http://localhost:3000](http://localhost:3000) 打开以显示更改：

![alt_text](media/website-preview.png)

:::tip

当您点击 `Docs` 时，您将被带到最新的稳定版本（例如，`http://localhost:3000/docs/2.10.x/`）。如果您想在 `master` 上预览更改，请将 URL 更改为 `http://localhost:3000/docs/next`

:::
### 停止预览

切换到您的命令行界面并按 **Control+C**。