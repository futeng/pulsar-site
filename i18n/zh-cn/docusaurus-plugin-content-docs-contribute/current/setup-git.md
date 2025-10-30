---
id: setup-git
title: Setting up Git for maintenance of Pulsar
---

## Git 配置

### 工具

#### 为 GitHub 安装 `gh` 命令行工具

使用 `brew` 安装，对于其他包管理器，请按照 https://cli.github.com/ 上的说明操作。

```shell
brew install gh
```

安装后向 GitHub 进行身份验证

```shell
gh auth login
```

#### 可选：为 git 安装 `tig` 命令行 UI

`tig` 对于查看 git 日志很方便，也可以用于暂存文件和协助 `git` 命令行使用。

MacOS

```shell
brew install tig
```

Ubuntu Linux

```shell
sudo apt install tig
```

还有其他更多功能丰富的替代品，如 [`gitui`](https://github.com/extrawurst/gitui) 或 [`lazygit`](https://github.com/jesseduffield/lazygit)。

### Git 配置调整

使用 mergetool 和 difftool 增加默认重命名文件检测限制

```shell
git config --global merge.renameLimit 2048
git config --global diff.renameLimit 2048
```

为 Git 启用 [rerere](https://git-scm.com/book/en/v2/Git-Tools-Rerere)，"reuse recorded resolution"。

```shell
git config --global rerere.enabled true
```

注意！在某些情况下，在无效的合并解决方案后禁用 rerere 可能很有用。在这种情况下，你需要使用 `git rerere forget file` 来忘记合并结果。

### 在单独的工作目录中检出每个 Pulsar 维护分支

为了维护 Pulsar，将所有维护分支在单独的工作目录中检出很方便

检出 Pulsar 仓库

```shell
# 假设 GitHub 身份验证已通过 "gh auth login" 配置
git checkout https://github.com/apache/pulsar
cd pulsar
# 将你 fork 的仓库添加为远程，你可以有自己的偏好来命名远程
git remote add forked https://github.com/your_github_id/pulsar
```

添加共享本地 git 仓库的单独工作目录

```shell
for branch in branch-3.3 branch-3.2 branch-3.1 branch-3.0; do
   git worktree add ../pulsar-$branch $branch
done
```

之后，你将在与原始检出的 `pulsar` 目录相同的级别下有这些目录：

```
pulsar-branch-3.3
pulsar-branch-3.2
pulsar-branch-3.1
pulsar-branch-3.0
```

有一个限制，即每个分支一次只能在一个工作目录中检出。如果这成为问题，你可以暂时使用 `git commit --detach HEAD` 命令分离工作目录中的当前分支。

## 合并冲突解决工具 {#mergetool}

对于 Apache Pulsar 核心开发者，处理 git 合并冲突解决是必要的。
为了高效解决合并冲突，设置有助于可视化这些冲突并解决它们的工具是必要的。

对于开始使用自动化工具在 cherry-pick 期间解决合并冲突的开发者，IntelliJ 是推荐的选项。它提供出色的工具，但与命令行工作流的集成并不无缝。当你在 IntelliJ 中启动 cherry-pick 过程并在同一环境中处理合并冲突解决时，它表现良好。然而，解决合并冲突通常涉及多个步骤，包括还原和修改更改，直到达到满意的解决方案。在许多情况下，使用工具组合可能比完全依赖 IntelliJ 执行所有所需操作更有效。

对于在命令行上使用 `git` 的高级用户，建议设置 `git mergetool`。
以下是设置 `kdiff3` 作为 mergetool 的示例。

### 在 MacOS 上配置 kdiff3

使用 `brew` 安装 `kdiff3` 的 cask 版本：
```shell
# 重要！安装 kdiff3 的 cask 版本
brew install --cask kdiff3
```

将 `kdiff3` 配置为 git 的 mergetool 和 difftool

```shell
git config --global mergetool.kdiff3.path /Applications/kdiff3.app/Contents/MacOS/kdiff3
git config --global mergetool.kdiff3.args '$base $local $other -o $output'
git config --global mergetool.kdiff3.trustExitCode false
git config --global merge.tool kdiff3
git config --global difftool.kdiff3.path /Applications/kdiff3.app/Contents/MacOS/kdiff3
git config --global difftool.kdiff3.args '$base $local $other -o $output'
git config --global difftool.kdiff3.trustExitCode false
git config --global diff.guitool kdiff3
```

`kdiff3` 版本 1.11.1 包含[bug #487338](https://bugs.kde.org/show_bug.cgi?id=487338)。你可能需要从 https://download.kde.org/stable/kdiff3/ 安装 kdiff3 1.10.7，直到问题解决。

### 在 Linux 上配置 kdiff3

从你的包管理器安装 `kdiff3`。例如，在 Ubuntu 上：

```shell
sudo apt install kdiff3
```

将 `kdiff3` 配置为 git 的 mergetool 和 difftool

```shell
git config --global mergetool.kdiff3.path /usr/bin/kdiff3
git config --global merge.tool kdiff3
git config --global difftool.kdiff3.path /usr/bin/kdiff3
git config --global diff.guitool kdiff3
```

### 使用 mergetool kdiff3

如果在 cherry-pick、合并或 rebase 后出现任何合并冲突，你应该运行 `git mergetool` 来解决它们。
你可以随时运行 `git mergetool`，因为没有冲突要解决时命令会返回。

`kdiff3` 工具不是最用户友好的工具，需要时间来适应它的工作方式。
[这篇博客文章中](https://www.eseth.org/2020/mergetools.html)有关于 mergetools 的评论，可以帮助
你理解工具的作用以及在不同工具中如何可视化合并。
`kdiff3` 的一个优点是它包含一个自定义合并算法，可以在不需要选择的情况下解决一些冲突。
在某些情况下，可能会有错误的机会，但这些是罕见的，也可能在
手动选择解决方案时发生。无论如何，解决方案都需要验证。

使用 `kdiff3` 的技巧

- 当合并冲突解决过程开始时，将出现一个带有三个窗格和窗口底部拆分窗格的视图。
  - 左窗格显示文件公共版本的差异。这可能令人困惑，通常不太有用。你可以通过取消选择"Window -> Show Window A"来隐藏它。
  - 中间窗格显示本地版本。
  - 右窗格显示远程版本。
  - 底部窗格是输出，这是合并的结果。你也可以在此窗格中进行手动编辑以手动解决冲突。
- 学习如何导航到下一个和上一个合并冲突以及如何使用键盘快捷键选择解决方案是有益的。
  - 在 MacOS 上，你可能需要重新映射一些键盘快捷键以提高可用性。这在使用外部键盘时特别必要。

### Git 还原和提交修改工具

解决合并冲突有时可能比简单还原一些更改并在 IDE 中修改原始源代码更复杂。这个过程可能涉及多个步骤，包括还原和修改合并提交的更改。合并提交还应包含回传所需的必要更改。
在许多情况下，还有必要在 IDE 中修复导入语句并将这些更改修改到合并提交中。

为此，`git gui` 工具非常出色。它允许部分还原到先前的提交，并便于向最新提交添加额外更改，所有操作都有清晰的可视化。

安装 `git gui` 工具：

```shell
# 在 MacOS 上
brew install git-gui
```

```shell
# 在 Linux 上，从你的包管理器安装 "git-gui"，Ubuntu 的示例
sudo apt install git-gui
```

有许多工具可用于此目的，但 `git gui` 是最简单和最有效的之一。


### 使用 IntelliJ 进行 cherry-picking 和合并冲突解决。

- [Cherry-pick 单独提交](https://www.jetbrains.com/help/idea/apply-changes-from-one-branch-to-another.html#cherry-pick)
- [解决 Git 合并冲突：简单方法](https://www.youtube.com/watch?v=mSfq1SoMocg)

### 有用链接

- [git mergetools 比较](https://www.eseth.org/2020/mergetools.html)
- [文件比较工具比较](https://en.wikipedia.org/wiki/Comparison_of_file_comparison_tools#General)
- [Git GUI 客户端](https://git-scm.com/downloads/guis)