# Introduction

Pulsar 网站使用 [Docusaurus](http://docusaurus.io/) 框架构建。你可以在[其文档](https://docusaurus.io/docs)中找到所有技术细节。

具体来说，本章提供了一个[写作语法](document-syntax.md)指南，选择了编写网站内容的知识。

## Source

目前，网站的源代码位于 [apache/pulsar-site](http://github.com/apache/pulsar-site) 仓库。

## Pages

Docusaurus 默认提供三种类型的页面：[文档](https://docusaurus.io/docs/docs-introduction)、[博客](https://docusaurus.io/docs/blog)和 [JSX 页面](https://docusaurus.io/docs/creating-pages)。

Pulsar 网站页面包括：

| Page                                                       | Type      | Source                                                                                            |
|------------------------------------------------------------|-----------|---------------------------------------------------------------------------------------------------|
| [用户文档](pathname:///docs)                              | docs      | <ul><li>docs/</li><li>versioned_docs/</li><li>versioned_sidebars/</li><li>sidebars.json</li></ul> |
| [贡献指南](about.md)                            | docs      | <ul><li>contribute/</li><li>sidebarsDevelopment.js</li></ul>                                      |
| [发布说明](pathname:///release-notes)                 | docs      | <ul><li>release-notes/</li><li>sidebarsReleaseNotes.js</li></ul>                                  |
| [安全](pathname:///security)                           | docs      | <ul><li>security/</li></ul>                                                                       |
| [博客](pathname:///blog)                                  | blog      | <ul><li>blog/</li></ul>                                                                           |
| [客户端功能矩阵](pathname:///client-feature-matrix) | docs      | <ul><li>client-feature-matrix/</li><li>data/matrix.js</li></ul>                                   |
| 其他页面                                                | JSX pages | <ul><li>src/pages/</li></ul>                                                                      |

此外，网站还提供在框架外生成的多个静态页面，包括 API 文档、参考文档和 swagger 文件。你可以在 `static` 文件夹下找到它们。

## Tools

### preview.sh

最常用的工具是 `preview.sh`。你可以通过以下方式预览本地更改：

```shell
./preview.sh
```

如果你想预览特定版本的网站，可以将版本作为参数传递：

```shell
./preview.sh 4.0.x
```

有关更多详细信息，请参阅[预览内容](document-preview.md)指南。

### docker-compose.yaml

`preview.sh` 脚本使用 Docusaurus 开发服务器进行测试，这与在线提供网站的基于 Apache Web Server 的真实环境不同。

要模拟服务器端逻辑，如 `.htaccess` 重写规则，你可以运行：

```shell
yarn build
docker-compose up
```

### Pytools

网站仓库有一组用于生成内容和同步/更新/发布网站的 Python 脚本。

你可以阅读 pytools 的 [README](https://github.com/apache/pulsar-site/tree/main/tools/pytools/README.md) 文件了解详细信息。

## How-tos

本节包含有关网站维护和故障排除的常见操作指南。

### 如何修复搜索索引不匹配？

首先，你应该获得访问 [Algolia Crawler 控制台](https://crawler.algolia.com/)上 `apache_pulsar` 爬虫的权限。你可以发送邮件到 dev@pulsar.apache.org 请求权限。

修复搜索索引不匹配的最常见方法是重新索引页面。你可以通过在[爬虫页面](https://crawler.algolia.com/admin/crawlers/7a3458ba-2373-47d5-9520-90cc9cc10736/overview)上点击"Restart crawling"按钮来做到这一点。通常，这需要大约 1 到 2 小时完成。

### 如何在本地预览更改？

如果你对网站进行了任何更改，在提交拉取请求之前，你应该在本地预览更改。阅读[预览内容](document-preview.md)指南了解说明。

### 如何更新参考页面？

如果你要更新内容，请阅读[更新参考文档](document-contribution.md#update-reference-docs)指南了解参考页面的来源。

如果你要调试参考生成过程，请阅读 [reference-doc-generator](https://github.com/apache/pulsar-site/tree/main/tools/pytools#reference-doc-generator) 使用部分及其源代码。

### 如何更新数据驱动的页面？

你可以通过点击下面的 **✍️ Edit &lt;file_name&gt;** 链接之一并提交拉取请求来更新它。

* **案例研究** [/case-studies](pathname:///case-studies)
  * [✍️ 编辑 case-studies.ts](https://github.com/apache/pulsar-site/edit/main/data/case-studies.ts)
* **Powered by** [/powered-by](pathname:///powered-by)
  * [✍️ 编辑 powered-by.ts](https://github.com/apache/pulsar-site/edit/main/data/powered-by.ts)
* **生态系统** [/ecosystem](pathname:///ecosystem)
  * [✍️ 编辑 ecosystem.ts](https://github.com/apache/pulsar-site/edit/main/data/ecosystem.ts)
* **事件** [/events](pathname:///events)
  * [✍️ 编辑 events.ts](https://github.com/apache/pulsar-site/edit/main/data/events.ts)
* **资源** [/resources](pathname:///resources)
  * [✍️ 编辑 resources.ts](https://github.com/apache/pulsar-site/edit/main/data/resources.ts)
* **团队** [/team](pathname:///team)
  * [✍️ 编辑 team.js](https://github.com/apache/pulsar-site/edit/main/data/team.js)

    PMC 成员可以像 [lhotari](https://github.com/lhotari) 在 https://github.com/apache/pulsar-site/pull/387 中那样生成 `team.js` 文件。
* **下载** [/downloads](pathname:///download)
  * [✍️ 编辑 releases.json](https://github.com/apache/pulsar-site/edit/main/releases.json)
  * [✍️ 编辑 connectors.js](https://github.com/apache/pulsar-site/edit/main/data/connectors.js)
  * [✍️ 编辑 release-cpp.js](https://github.com/apache/pulsar-site/edit/main/data/release-cpp.js)
  * [✍️ 编辑 release-pulsar-manager.js](https://github.com/apache/pulsar-site/edit/main/data/release-pulsar-manager.js)
  * [✍️ 编辑 release-pulsar-adapters.js](https://github.com/apache/pulsar-site/edit/main/data/release-pulsar-adapters.js)
  * [✍️ 编辑 download.tsx](https://github.com/apache/pulsar-site/edit/main/src/components/download.tsx)
  * [✍️ 编辑 download.mdx](https://github.com/apache/pulsar-site/edit/main/src/pages/download.mdx)
* **发布说明** [/release-notes](pathname:///release-notes)
  * data/release-*.js
  * release-notes/
  * src/components/ClientReleaseTable.js
  * src/components/PulsarReleaseTable.js
* **客户端功能矩阵** [/client-feature-matrix](pathname:///client-feature-matrix)
  * [✍️ 编辑 matrix.js](https://github.com/apache/pulsar-site/edit/main/data/matrix.js)
  * [✍️ 编辑 client-feature-matrix/index.mdx](https://github.com/apache/pulsar-site/edit/main/client-feature-matrix/index.mdx)