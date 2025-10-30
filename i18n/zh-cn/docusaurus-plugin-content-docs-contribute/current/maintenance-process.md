---
id: maintenance-process
title: Cherry-picking
---

以下维护任务由 Apache Pulsar 提交者执行，因为他们有权访问这些任务。

## 为发布分支标记 PR

在合并 PR 之前，请确保你标记了该 PR 应该应用的发布版本。我们当前的流程涉及为下一个待发布版本添加发布标签，以便我们也将修复 cherry-pick 到维护分支。

始终为支持的维护版本分支标记非破坏性修复。查看[支持的 Pulsar 版本页面](https://pulsar.apache.org/contribute/release-policy/#supported-versions)来查找当前支持的分支和当前版本。选择下一个版本的标签。如果标签在 GitHub 中缺失，你应该首先添加它。

例如，当 `branch-3.0` 的最后一个发布是 `3.0.7` 时，下一个版本的相应 PR 标签是 `release/3.0.8`。

这些标签对于在发布过程中搜索需要 cherry-pick 的 PR 至关重要。选择过时的发布标签可能导致 PR 被遗漏。

一个错误修复 PR 应该始终包含在[支持的 Pulsar 版本](https://pulsar.apache.org/contribute/release-policy/#supported-versions)的所有维护分支中。例如，应该避免将修复 cherry-pick 到 `branch-3.0` 但跳过 `branch-3.3`。

新功能（通常是 PIP 实现）只有在[Pulsar 开发邮件列表](https://pulsar.apache.org/contact/#mailing-list)上开启讨论并等待至少一个懒散共识决定后，才能 cherry-pick 到维护分支。[Pulsar 改进流程 (PIP)](https://github.com/apache/pulsar/tree/master/pip#pulsar-improvement-proposal-pip)提到 48 小时作为投票时间。对于将 PIP 添加到维护分支的懒散共识决定应该保持相同的最低时间。应该有一个明确的理由说明为什么需要将功能添加到维护分支。

## Cherry-pick 流程

### 当前流程和职责

在合并 PR 时添加标签就足够了。这是对合并 PR 的 Apache Pulsar 提交者的期望。不应该在未检查 PR 包含必要标签的情况下合并 PR。

积极作为发布管理员的提交者将处理 cherry-picking 和回传。
当 PR 由于合并冲突而无法轻易回传时，发布管理员将请求特定的回传。

### Cherry-picking

Cherry-picks 应该按照 PR 合并到 master 分支的相同顺序执行。
这对于减少维护分支中不必要的合并冲突是必要的。
Cherry-picking 应该保留对原始提交的引用。这可以通过传递 `-x` 参数来实现，这样 cherry-picks 将使用 `git cherry-pick -x <commit hash>` 命令执行。

#### 处理合并冲突

合并冲突很常见，有必要理解工具和流程来处理冲突解决。请参考[为维护 Pulsar 设置具有适当合并和差异工具的 git](setup-git.md)中的建议。

在 PR 无法在没有大量回传工作或破坏性更改风险的情况下应用的情况下，会要求原始 PR 作者向维护分支提交单独的 PR。如果作者不愿意做这项工作，发布管理员会尝试找到志愿者来处理这个问题。

在某些情况下，大量合并冲突表明存在依赖的 PR 也需要在维护分支中，但尚未被 cherry-pick。审查依赖关系并考虑 cherry-pick 是有用的。只有非破坏性错误修复或小改进（不包括 PIP 相关更改）可以在开发邮件列表上讨论的情况下进行 cherry-picking。当修复依赖于较新的 PIP 相关更改时，回传是必要的。

#### Cherry-picking 计划用于发布的更改

在继续之前，确保你已经[设置了 Git mergetool](setup-git.md#mergetool)。这个工具对于解决 cherry-pick 过程中可能出现的合并冲突至关重要。

使用诸如 `is:merged is:pr label:release/3.0.8 -label:cherry-picked/branch-3.0` 之类的搜索来搜索计划用于发布但尚未 cherry-pick 的合并 PR。
有必要按照 PR 合并到 master 分支的顺序处理 cherry-picks。否则，将有不必要的合并冲突需要解决。

#### Cherry-picking CLI 工具

这是一个 shell 脚本，其输出将简化从 master 分支的 cherry-picking：
假设 `gawk` 是 gnu awk。安装 `brew install gawk` 或在 Linux 上使用 `alias gawk=awk`。

```shell
UPSTREAM=origin
git fetch $UPSTREAM
RELEASE_NUMBER=3.0.8
RELEASE_BRANCH=branch-3.0
PR_QUERY="is:merged label:release/$RELEASE_NUMBER -label:cherry-picked/$RELEASE_BRANCH"
PR_NUMBERS=$(gh pr list -L 100 --search "$PR_QUERY" --json number --jq '["#"+(.[].number|tostring)] | join("|")')
ALREADY_PICKED=$(git log --oneline -P --grep="$PR_NUMBERS" --reverse $RELEASE_BRANCH | gawk 'match($0, /\(#([0-9]+)\)/, a) {print substr(a[0], 2, length(a[0])-2)}' | tr '\n' '|' | sed 's/|$//')
if [[ -n "$ALREADY_PICKED" ]]; then
  echo "** Already picked but not tagged as cherry-picked **"
  git log --color --oneline -P --grep="$PR_NUMBERS" --reverse $RELEASE_BRANCH | gawk 'match($0, /\(#([0-9]+)\)/, a) {print $0 " https://github.com/apache/pulsar/pull/" substr(a[0], 3, length(a[0])-3)}'
fi
echo "** Not cherry-picked from $UPSTREAM/master **"
git log --color --oneline -P --grep="$PR_NUMBERS" --reverse $UPSTREAM/master | { [ -n "$ALREADY_PICKED" ] && grep --color -v -E "$ALREADY_PICKED" || cat; } | gawk 'match($0, /\(#([0-9]+)\)/, a) {print $0 " https://github.com/apache/pulsar/pull/" substr(a[0], 3, length(a[0])-3)}'
echo "Check https://github.com/apache/pulsar/pulls?q=is:pr+$(echo "$PR_QUERY" | tr ' ' '+')"
```

这会产生如下输出：

```shell
0fa9572f8af [fix][broker] Fix AvgShedder strategy check (#23156) https://github.com/apache/pulsar/pull/23156
** Not cherry-picked from origin/master **
806fdf86866 [improve][misc] Upgrade Jetty to 9.4.56.v20240826 (#23405) https://github.com/apache/pulsar/pull/23405
Check https://github.com/apache/pulsar/pulls?q=is:pr+is:merged+label:release/3.0.8+-label:cherry-picked/branch-3.0
```

它会加快 cherry-picking 的速度，因为提交 ID 在那里，还有 PR 的链接。
应该使用 `git cherry-pick -x COMMIT_ID` 按此顺序进行 cherry-pick。
当你遇到许多意外合并冲突时，可能需要 cherry-pick 一些依赖的提交。

在 [lhotari 的 `pulsar-contributor-toolbox-functions.sh` shell 脚本函数库](https://github.com/lhotari/pulsar-contributor-toolbox/blob/0272419e70a9fc5f14945717bac964bda355520b/functions/pulsar-contributor-toolbox-functions.sh#L1393-L1455) 中有更高级版本的 cherry-picking CLI 工具。