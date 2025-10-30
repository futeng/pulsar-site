---
id: release-note-guide
title: Writing release notes
---

Pulsar 发布说明包括以下部分：

* [核心](pathname:///release-notes/)
* [Java 客户端](pathname:///release-notes/client-java)
* [WebSocket 客户端](pathname:///release-notes/client-ws)
* [C++ 客户端](pathname:///release-notes/client-cpp)
* [Python 客户端](pathname:///release-notes/client-python)
* [Go 客户端](pathname:///release-notes/client-go)
* [Node.js 客户端](pathname:///release-notes/client-node)
* [C# 客户端](pathname:///release-notes/client-cs)

## 先决条件

要生成发布说明，建议你安装 [GitHub CLI](https://cli.github.com/) 并首先进行身份验证：

```shell
brew install gh
gh auth login
```

## 将新发布的版本注册到 releases.json、data/release-pulsar.js 和 data/release-java.js 文件

```bash
# 将 3.0.6 替换为目标版本标签
VERSION_WITHOUT_RC=3.0.6
PREVIOUS_VERSION=3.0.5
```

```bash
# 将 apache/pulsar 替换为组件仓库
./scripts/register_new_version.py $VERSION_WITHOUT_RC $PREVIOUS_VERSION $(gh release view "v$VERSION_WITHOUT_RC" -R apache/pulsar --json author,publishedAt | jq -r '[.author.login, .publishedAt] | join(" ")')
```

或者，对于标签而不是发布：

```bash
# 对于标签而不是发布
./scripts/register_new_version.py $VERSION_WITHOUT_RC $PREVIOUS_VERSION $(cd $PULSAR_PATH && git show -s --format="%ae %aI" "v$VERSION_RC" | tail -n 1 | sed 's/@.* / /')
```

## 生成发布说明

目前还没有确定的方法。你需要手动将 PR 分类到不同的部分并编辑发布说明文件。这些命令用于生成发布说明条目。

这里有 2 种方法：

使用 "git log"（使用 pbcopy 复制输出到剪贴板）

```shell
PREVIOUS_VERSION=3.0.3
VERSION_WITHOUT_RC=3.0.4
```

```shell
cd $PULSAR_PATH
git log --reverse --oneline v$PREVIOUS_VERSION..v$VERSION_WITHOUT_RC | colrm 1 12 | sed 's/\] \[/][/' | sed 's/^[[:space:]]*//' | awk -F ']' '{
    if ($1 ~ /^\[/) {
        print $1 "]" $2 " | " $0
    } else {
        print "[zzz] | " $0
    }
}' | sort | sed 's/^[^|]* | //' | sed 's/\(#\([0-9]\+\)\)/[#\2](https:\/\/github.com\/apache\/pulsar\/pull\/\2)/g' | sed 's/^/- /' | sed 's/</\&lt;/g' | sed 's/>/\&gt;/g' \
| pbcopy
```

或者使用 "gh pr list"

```bash
gh pr list -L 1000 --search "is:pr is:merged label:release/2.10.6 label:cherry-picked/branch-2.10" --json title,number,url | jq -r '.[] | "- \(.title) ([#\(.number)](\(.url)))"' | sort | pbcopy
```

对于功能发布，使用里程碑：

```bash
gh pr list -L 1000 --search "is:pr is:merged milestone:4.0.0" --json title,number,url | jq -r '.[] | "- \(.title) ([#\(.number)](\(.url)))"' | sort | pbcopy
```

从剪贴板复制到发布说明文件

首先，回到 pulsar-site 目录，然后：

```shell
# 不要将此命令复制到剪贴板，因为它会替换那里的内容
# 在命令行中写入这个命令
pbpaste >> release-notes/versioned/pulsar-${VERSION_WITHOUT_RC}.md
```

## 对发布说明条目进行分类

有一个单独的脚本可以自动分类发布说明项目。

```shell
./scripts/release_notes_reorder_script.py release-notes/versioned/pulsar-${VERSION_WITHOUT_RC}.md
```

你需要检查结果，有时需要手动重新排序条目。

如果你一次发布多个维护版本，你可以使用另一个发布作为排序的参考，这样你就不必重复相同的手动重新排序。

```shell
./scripts/release_notes_reorder_script.py release-notes/versioned/pulsar-X.Y.Z.md release-notes/versioned/pulsar-${VERSION_WITHOUT_RC}.md
```

## 创建 Java 客户端发布说明

将"客户端"和适用的"库更新"条目复制到 client-java 发布说明中。

## 在 GitHub 发布中更新发布说明

将文件内容复制到剪贴板，并通过在 https://github.com/apache/pulsar/releases 编辑发布说明粘贴到正确的位置

```shell
cat release-notes/versioned/pulsar-${VERSION_WITHOUT_RC}.md | pbcopy
```

## 更新发布说明页面

以下步骤由脚本 `./scripts/register_new_version.py` 处理。

1. 复制相关的发布说明条目并添加一个[版本化发布说明文件](https://github.com/apache/pulsar-site/tree/main/release-notes/versioned)。
2. 更新[版本元数据文件](https://github.com/apache/pulsar-site/tree/main/data)（`release-*.js`）。对于 apache/pulsar 发布，这意味着更新 `release-java.js`（Java 客户端）和 `release-pulsar.js`（Pulsar）。
3. 对于每个 apache/pulsar 发布，你应该在 `releases.json` 文件的相应位置添加一个 `<release-version>` 条目。

更新 swagger 文件。参考：[swagger 文件](https://pulsar.apache.org/contribute/release-process/#swagger-files)

要预览结果，请按照[预览内容](document-preview.md#preview-changes)的说明操作。

## 提交发布说明

向[网站仓库](https://github.com/apache/pulsar-site)提交一个 PR，包含添加的版本发布说明文件和更新的版本元数据文件。

以下是一些示例：

* [添加 C++ 客户端 3.1.0 的发布说明](https://github.com/apache/pulsar-site/pull/326)
* [添加 Python 客户端 3.0.0 的发布说明](https://github.com/apache/pulsar-site/pull/343)
* [添加 Pulsar 3.0.3 的发布说明](https://github.com/apache/pulsar-site/pull/834)

在网站更新并成功构建后，检查发布信息是否显示在 [Pulsar 发布说明页面](pathname:///release-notes/)上。