---
id: develop-triage
title: Triaging an Issue
---

本指南为用户和开发者记录了 [issue 跟踪器](https://github.com/apache/pulsar/issues)。

## 分类检查清单

* [ ] 阅读初始消息和评论。
* [ ] 检查标题是否相当简洁，同时包含足够的细节，以便浏览 issue 列表的人能够快速识别其主题。
* [ ] 留下关于需要采取的下一步行动的简短评论。如果消息列表很长，摘要会非常有帮助。
* [ ] （仅限提交者）设置所有相关的[标签](develop-labels)。
* [ ] （仅限提交者）在适当的情况下，设置受让人、审查者、里程碑字段，并可能 @ 提及相关人员。
* [ ] （仅限提交者）如果 issue 明显无效（与 Pulsar 无关、重复、垃圾邮件等），您可以将其作为["not planned"](https://github.blog/changelog/2022-05-19-the-new-github-issues-may-19th-update/)关闭。

## 受让人

此字段表示谁被期望采取下一步来解决 issue。

由于 Pulsar 社区遵循[同行社区](https://www.apache.org/theapacheway/)模式，只有当贡献者请求或自我分配时才会被分配给 issue。GitHub 只允许团队成员或参与者被分配，请求分配简化了这个限制。

## 帮助分类 Issues

一旦您了解了 Pulsar 源文件的结构并且熟悉了工作流程，帮助分类 issue 是一个很好的贡献方式。但是，要意识到需要 Pulsar 的工作经验才能有效地帮助分类。

全天候，新的 issue 在 [issue 跟踪器](https://github.com/apache/pulsar/issues) 上被打开，现有的 issue 被更新。每个 issue 都需要被分类以确保一切顺利运行。

### 分类报告

Pulsar 提供了五个 issue 模板，它们定义了每个类别中需要的内容。Issue 跟踪器仅保存可操作的项目，包括错误报告和增强。问题和建议建议发布在：

1. [用户邮件列表](mailto:users@pulsar.apache.org)（[订阅](mailto:users-subscribe@pulsar.apache.org)），或
2. [Github 讨论](https://github.com/apache/pulsar/discussions)。

对于[错误报告](https://github.com/apache/pulsar/blob/master/.github/ISSUE_TEMPLATE/bug-report.yml)，issue 需要：

* 提供使用的操作系统和 Pulsar 版本
* 给出重现步骤以方便快速定位问题
* 清楚地解释期望发生什么和实际发生了什么

对于[增强](https://github.com/apache/pulsar/blob/master/.github/ISSUE_TEMPLATE/enhancement.yml)，issue 需要：

* 描述动机（为什么 Pulsar 需要它）
* 描述提议的解决方案并在有相关材料时添加链接等
* 描述考虑过但拒绝的其他替代解决方案或功能

频繁提出的 issue 有自己的模板：[不稳定测试](https://github.com/apache/pulsar/blob/master/.github/ISSUE_TEMPLATE/flaky-test.yml)和[文档 issue](https://github.com/apache/pulsar/blob/master/.github/ISSUE_TEMPLATE/doc.yml)。

Pulsar 改进提案（PIP）有自己的[工作流](https://github.com/apache/pulsar/blob/master/wiki/proposals/PIP.md)。

### 关闭 Issues

来自多年前的陈旧 issue 今天很难处理。此外，巨大的 issue 积压会降低贡献者在 issue 分类上花费的热情。

以下是几个关闭 issue 的常见原因，特别是您可以用来判断的陈旧 issue：

* 如果错误报告与[未维护的版本](release-policy.md#Supported-Versions)相关联，并且在维护版本上很难或无法重现，您可以评论"Closing as stale. If it's still relevant to maintained versions, feel free to open a new issue."来关闭 issue。
* 如果一个增强 ticket 停滞超过一年且似乎没有人在处理，您可以评论"Closing as stale and no one worked on it. Please open a new issue if you volunteer to do it."来关闭 issue。
* 如果用户问题在线程中得到回答，您可以评论"Closing as answered"来关闭 issue；否则，您可以[将 issue 转换为讨论](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions#transferring-a-discussion)在问答类别下。
* 如果一个开放的 issue 已经在 master 上解决或与另一个 issue 重复，您可以直接用这些解决方案关闭 issue。
* 由于历史原因，一些 issue 是关于多语言客户端（C++、Go、Python）或其他已移出到单独仓库的组件。
  您可以[将 issue 转移](https://docs.github.com/en/issues/tracking-your-work-with-issues/transferring-an-issue-to-another-repository)到相应的仓库，
  或者评论"Closing as stale. The development of the specific module is permanently moved to the separate repository. Please open a new issue there if it's still relevant."来关闭。

### 重新评估已关闭的 Issues

您可能会担心一些陈旧的 issue 仍然相关但被急切关闭。

不用担心！任何人都被期望在提问前搜索。一旦他们发现一个已关闭的 issue 是相关的，他们可以接手它或开一个新的并引用前一个。这总是可行的，这里有一些例子：

* [Pulsar 的 DB2 连接器](https://github.com/apache/pulsar/issues/7837)被一个新的志愿者接手处理；
* [在函数 url 中支持 basic-authentication](https://github.com/apache/pulsar/issues/19910)引用了一个已关闭的 issue 并取代了它。

### 找到您可以帮助的 Issue

如果您想帮助分类，您可能还想搜索您有工作知识的模块中的 issue。在 issue 跟踪器中搜索模块名称，按 `component/*` 标签过滤，或使用[高级搜索](https://github.com/search/advanced)来查找这些 issue。