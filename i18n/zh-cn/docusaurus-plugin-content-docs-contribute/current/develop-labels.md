---
id: develop-labels
title: Label strategy
---

本指南解释了 [apache/pulsar](http://github.com/apache/pulsar) 仓库（主仓库）中使用的标签。

## type/*

type/* 标签主要用于区分 issue 和 PR 是用于错误报告、错误修复、功能请求、功能支持。

|  标签             | 描述                                                                                                  |
|--------------------|------------------------------------------------------------------------------------------------------|
| `type/cleanup`     | 代码或文档清理，例如删除过时的文档或删除不再使用的代码                                                |
| `type/feature`     | PR 添加了新功能或 issue 请求了新功能                                                                 |
| `type/bug`         | 您的 PR 修复了错误或 issue 报告了错误                                                                |
| `type/refactor`    | 代码或文档重构，例如重构代码结构或方法以提高代码可读性                                                |
| `type/enhancement` | 对现有功能或文档的增强，例如减少延迟消息的内存使用                                                    |

## component/*

component/* 标签表示 issue 或 PR 发生在哪个组件中

| 标签                               | 描述                                  |
|-------------------------------------|----------------------------------------------|
| `component/function`                |                                              |
| `component/broker`                  |                                              |
| `component/cli`                     | pulsar-admin, pulsar-client, pulsar-perf ... |
| `component/client`                  | Java 客户端                                  |
| `component/proxy`                   | Pulsar 代理                                  |
| `component/tieredstorage`           |                                              |
| `component/sql`                     | 基于 trino 的 Pulsar SQL                     |
| `component/transaction`             |                                              |
| `component/schema`                  |                                              |
| `component/security`                |                                              |
| `component/config`                  | Pulsar 配置                                  |
| `component/authentication`          |                                              |
| `component/build`                   |                                              |
| `component/geo-replication`         |                                              |
| `component/metrics`                 |                                              |
| `component/metadata`                |                                              |
| `component/tool`                    |                                              |
| `component/admin`                   |                                              |
| `component/test`                    | 提高测试覆盖率或增强测试                    |
| `component/ci`                      |                                              |
| `component/compaction`              |                                              |
| `component/connector`               |                                              |
| `component/websocket`               |                                              |
| `component/ML`                      | Managed Ledger                               |
| `component/authorization`           |                                              |
| `component/dependency`              |                                              |

## category/*

除了能够识别 issue、PR 修复或增强的组件之外。类别标签将提供有关功能、可靠性或性能的修复或增强的更多信息。在大多数情况下，类别标签仅适用于 type/bug 和 type/enhancement。

| 标签                    | 描述                                                                                                                                       |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `category/functionality` | 某些功能不工作，例如出现错误。                                                                                                |
| `category/reliability`   | 功能在大多数情况下工作正常。在特定环境或故障下无法正常工作，例如数据丢失、消费卡顿 |
| `category/performance`   | 性能问题修复或改进。                                                                                                           |

## ready-to-test

在 [PR-17693](https://github.com/apache/pulsar/pull/17693) 合并后，除了[仅文档更改](https://github.com/apache/pulsar/blob/master/.github/changes-filter.yaml#L5)之外，拉取请求应该首先在您自己的 fork 中测试，因为基于 GitHub Actions 的 Pulsar CI 资源和配额受限。GitHub Actions 为在 fork 仓库中执行的拉取请求提供单独的配额。

当提交者认为 PR 准备好测试时，他们会给 PR 打上 `ready-to-test` 标签，然后您可以通过评论 `/pulsarbot run-failure-checks` 来重新运行 CI 任务并触发完整的 CI 验证。

另请参阅 [在 Fork 中进行 CI 测试](personal-ci.md)。

## doc-*

提交 issue 或 PR 时，您必须[选择一个文档复选框](https://github.com/apache/pulsar/blob/master/.github/PULL_REQUEST_TEMPLATE.md#documentation)，这样自动化可以正确标记 PR。

| 标签               | 描述                                                                                                                                                                                                                                                                                               |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `doc-not-needed`    | 您的 PR 更改不影响文档                                                                                                                                                                                                                                                                        |
| `doc`               | 您的 PR 包含文档更改，无论更改是在 markdown 文件还是代码文件中。                                                                                                                                                                                                                |
| `doc-required`      | 您的 PR 更改影响文档，您稍后会更新。                                                                                                                                                                                                                                                    |
| `doc-complete`      | 您的 PR 更改影响文档，相关文档已经添加。                                                                                                                                                                                                                                                 |
| `doc-label-missing` | 如果满足以下条件之一，机器人会在 PR 中应用此标签：<br/><li>您没有提供文档标签。</li><li>您提供了多个文档标签。</li><li>您删除了文档标签中的反引号 (``)。</li><li>您在方括号中添加了空格。</li> |

## release/*

| 标签                      | 描述                                                                                                                         |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `release/important-notice` | 重要的更改应该在发布说明中提及                                                                                             |
| `release/blocker`          | 表示应该阻止发布的 PR 或 issue，直到它得到解决                                                       |
| `release/<version>`        | 这些标签表示 issue/PR 已修复或将要修复，取决于版本是否已发布 |

## cherry-picked/*
cherry-picked/* 标签主要用于 Pulsar 提交者，以确保修复被 cherry-pick 到发布分支。该标签只能在相应分支的 cherry-picking 完成后添加。这样发布管理者就可以获得应该被 cherry-pick 的 PR 列表。