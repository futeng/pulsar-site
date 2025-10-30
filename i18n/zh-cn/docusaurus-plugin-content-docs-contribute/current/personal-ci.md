---
id: personal-ci
title: Personal CI
---

Apache Pulsar 的 CI 基础设施运行在有限的 Apache 基础设施资源上。为了优化这些资源并减少 CI 队列时间，强烈鼓励贡献者使用"个人 CI"，首先在自己的 fork 中测试 pull request。

当你从你的 fork 创建 pull request 时，GitHub Actions 为 fork 仓库构建提供了单独的配额。这意味着：

1. 你可以立即获得 CI 反馈，而无需等待维护者批准
2. 你的 CI 运行不会消耗主 Pulsar 仓库的 CI 资源
3. 你可以在自己的环境中更快地迭代和修复问题

工作流程很简单：
1. 使用个人 CI 在你的 fork 中彻底测试你的更改
2. 一旦测试持续通过，通知维护者进行最终的 PR 审查

关于测试的一些重要说明：
- Pulsar 有已知的[不稳定测试](https://github.com/apache/pulsar/issues?q=is%3Aissue%20state%3Aopen%20flaky-test)，可能需要多次 CI 运行
- 使用 GitHub Actions 中的"重新运行失败作业"按钮重试失败的工作流
- 对于与你的更改相关的测试失败，通过在 IDE 中运行特定测试在本地调试

关键要求：始终从唯一的功能分支创建 pull request，而不是从你 fork 的 `master` 分支。个人 CI 流程只适用于功能分支。
例如：
- ✅ 创建分支 `feature-xyz` 并从中打开 PR
- ❌ 直接从你的 fork 的 `master` 分支打开 PR 将无法工作

## Fork 中的 CI 工作流

在使用个人 CI 工作流之前，确保在 GitHub UI 中为你的 fork 启用了 GitHub Actions。你可以在 fork 的"设置" > "Actions" > "常规"选项卡下检查这一点。
选择"允许所有操作和可重用工作流"选项。

以下是在 GitHub 上使用个人 CI 的步骤：

1. 将你计划的 pull request 更改推送到 fork 中的新分支（遵循标准流程）。
2. 创建针对你自己 fork 而不是主仓库的 pull request。

你可以通过两种方式创建 pull request：

### 使用 GitHub CLI

首先，安装并配置 [GitHub CLI](https://cli.github.com/)。然后使用这个单一命令创建到你的 fork 的 PR：

```bash
gh pr create --repo=<your-github-id>/pulsar --base master --head <your-pr-branch> -f
```

### 使用 GitHub Web 界面

或者，你可以通过 GitHub Web 界面创建到你自己的 fork 的 PR：

1. 创建新 PR 时，在下拉菜单中选择你的 fork 作为"基础仓库"和"头部仓库"。
2. 选择"master"作为"基础"分支，你的 PR 分支作为"比较"分支（应该是默认的）
3. 像往常一样完成 PR 创建过程

## 与上游保持同步

保持你的 master 分支与 apache/pulsar 的 master（上游）同步是值得的，这样 PR 的差异在你的 own fork 中是合理的。

阅读更多关于从 WebUI、GitHub CI 或命令行同步 fork 的说明，请访问[同步 fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)。

## SSH 到 CI 作业

"个人 CI"的额外好处是，当构建运行时，你可以获得构建 VM 的 SSH 访问权限。这是由 [pulsar-ci.yaml](https://github.com/apache/pulsar/blob/master/.github/workflows/pulsar-ci.yaml) GitHub Actions 工作流文件中的这个逻辑处理的：

```yaml
- name: Setup ssh access to build runner VM
  # ssh access is enabled for builds in own forks
  if: ${{ github.repository != 'apache/pulsar' && github.event_name == 'pull_request' }}
  uses: ./.github/actions/ssh-access
  with:
    limit-access-to-actor: true
```

这是[内联 `ssh-access` 复合操作实现](https://github.com/apache/pulsar/blob/master/.github/actions/ssh-access/action.yml)。

SSH 访问通过在 GitHub 注册的 SSH 密钥保护。例如，你的公钥是 https://github.com/YOUR_GITHUB_ID.keys。你必须首先在 GitHub 中注册 SSH 公钥才能使其工作。