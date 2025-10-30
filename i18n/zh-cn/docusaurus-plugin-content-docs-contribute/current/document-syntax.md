---
id: document-syntax
title: Writing syntax
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

本指南解释了如何使用与 MDX 兼容的 Markdown 语法来编写 Pulsar 文档。

## 背景

Pulsar 文档使用 [Markdown](https://www.markdownguide.org/basic-syntax/) 作为标记语言，并使用 [Docusaurus](https://docusaurus.io/) 来生成文档和网站，同时通过 [MDX](https://mdxjs.com/) 进行增强。

### 为什么使用新的 Markdown 语法？

新的 Pulsar 网站已升级到 Docusaurus V2，该版本使用 MDX 作为解析引擎。MDX 的功能远不止解析标准 Markdown 语法，例如可以在文档中渲染 React 组件。

### 如何测试文档更改？

你可以在 [MDX Playground](https://mdxjs.com/playground/) 中练习 MDX 格式。编写一些 MDX 代码来查看它会变成什么样子。你可以看到渲染结果、生成的代码以及中间的 AST（抽象语法树）。这对于调试或探索非常有帮助。

关于如何在本地测试文档更改，请阅读[内容预览指南](document-preview.md)。

## 语法

本指南仅强调一些选定的重要规则和常用语法。完整的语法指南，请阅读 Docusaurus 的 [Markdown 功能](https://docusaurus.io/docs/markdown-features)文档和 MDX 的 [Markdown](https://mdxjs.com/docs/what-is-mdx/#markdown)文档。

### Markdown

* 尽可能使用 Markdown 而不是 HTML，否则 MDX 可能无法识别。例如，在构建复杂表格时，不要使用 `<table>`。
* 使用闭合标签。`<li><li/>` 和 `<br/>` 对于构建复杂表格特别有用，比如创建列表并添加空行。

#### 示例 1

```markdown
| Directory | Contains                            |
|:----------|:------------------------------------|
| **Hello** | <li>a</li><li>b</li><br/><li>c</li> |
```

| Directory | Contains                            |
|:----------|:------------------------------------|
| **Hello** | <li>a</li><li>b</li><br/><li>c</li> |

#### 示例 2

```markdown
| a   | b   | c                        |
|-----|-----|--------------------------|
| aa  | bb  | cc1<br/>cc2<br/><br/>cc3 |
```

| a   | b   | c                        |
|-----|-----|--------------------------|
| aa  | bb  | cc1<br/>cc2<br/><br/>cc3 |

### 选项卡

在使用多个选项卡之前，在文件开头添加这些导入：

`````markdown
````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````
`````

然后，你可以这样编写选项卡：

```markdown
<Tabs>
  <TabItem value="apple" label="Apple" default>
    This is an apple 🍎
  </TabItem>
  <TabItem value="orange" label="Orange">
    This is an orange 🍊
  </TabItem>
  <TabItem value="banana" label="Banana">
    This is a banana 🍌
  </TabItem>
</Tabs>
```

<Tabs>
  <TabItem value="apple" label="Apple" default>
    This is an apple 🍎
  </TabItem>
  <TabItem value="orange" label="Orange">
    This is an orange 🍊
  </TabItem>
  <TabItem value="banana" label="Banana">
    This is a banana 🍌
  </TabItem>
</Tabs>

阅读更多关于如何编写多个选项卡的内容，请访问[选项卡](https://docusaurus.io/docs/markdown-features/tabs)。

### 代码块

阅读更多关于如何使用语法高亮和支持的语言的内容，请访问[语法高亮](https://docusaurus.io/docs/markdown-features/code-blocks#syntax-highlighting)。

### 警告框

Docusaurus 支持这些警告框：

```markdown
:::note

Some **content** with _Markdown_ `syntax`.

:::

:::tip

Some **content** with _Markdown_ `syntax`.

:::

:::info

Some **content** with _Markdown_ `syntax`.

:::

:::caution

Some **content** with _Markdown_ `syntax`.

:::

:::danger

Some **content** with _Markdown_ `syntax`.

:::
```

:::note

Some **content** with _Markdown_ `syntax`.

:::

:::tip

Some **content** with _Markdown_ `syntax`.

:::

:::info

Some **content** with _Markdown_ `syntax`.

:::

:::caution

Some **content** with _Markdown_ `syntax`.

:::

:::danger

Some **content** with _Markdown_ `syntax`.

:::

阅读更多关于如何编写警告框的内容，请访问[警告框](https://docusaurus.io/docs/markdown-features/admonitions)。

### 资源

静态资源托管在 `/assets` 目录下，用于所有文档：

```markdown
![Page Linking](/assets/page-linking.png)
```

### 缩进和空格

* 对运行文本和代码块使用相同的缩进。
* 对于**有序列表**后面的内容块，只缩进 3 个空格（不是 4 个空格）。
* 对于**无序列表**后面的内容块，只缩进 2 个空格。
* 在代码块和运行文本之间插入**正好一个**空行（不是两个或更多空行）。

:::caution

如果不插入空行，文本将无法正确渲染。你应该通过[预览](document-preview.md)遇到错误。

:::

### 元数据

如果你创建一个新的 `.md` 文件，为 `sidebar_label` 的值添加引号。

```yaml
---
id: admin-api-partitioned-topics
title: Managing partitioned topic
sidebar_label: "Partitioned topics"
---
```

如果你不设置 `sidebar_label` 属性，标签默认为 `title`。

### 表格

为了帮助表格更容易维护，考虑在列宽度中添加额外的空格以保持一致性。例如：

```
| App name | Description         | Requirements   |
| :------- | :------------------ | :------------- |
| App 1    | Description text 1. | Requirements 1 |
| App 2    | Description text 2. | None           |
```

为了轻松格式化表格，你可以在编辑器中安装插件或扩展，如下所示：

* Visual Studio Code: [Markdown Table Prettifier](https://marketplace.visualstudio.com/items?itemName=darkriszty.markdown-table-prettify)
* Sublime Text: [Markdown Table Formatter](https://packagecontrol.io/packages/Markdown%20Table%20Formatter)
*  Atom: [Markdown Table Formatter](https://atom.io/packages/markdown-table-formatter)

### 链接

使用链接而不是总结，以帮助在 Pulsar 文档中保持单一信息源。

#### 锚点链接

标题在渲染时会生成锚点链接。例如：

`## This is an example` 生成锚点 `#this-is-an-example`。

:::caution

* 避免对标题进行交叉引用文档，除非你需要链接到文档的特定部分。这样可以避免在标题更改时破坏锚点。
* 如果可能，避免更改标题，因为它们不仅在内部链接。互联网上有各种指向 Pulsar 文档的链接，如教程、演示文稿、StackOverflow 帖子和其他来源。

:::

#### 内部文档链接

内部指的是同一 Pulsar 项目中的文档。

一般规则：

* 使用相对链接而不是绝对 URL。
* 不要在文件或目录的链接前添加 `./` 或 `../../`。

示例：

| 场景 | 好的做法 | 坏的做法 |
|----------------------------------------------------------------------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 对其他 markdown 文件的交叉引用（不需要 /path/xx/） | `[Function overview](function-overview.md)` | <li>`[Function overview](functions-overview)`</li><li>`[Function overview](https://pulsar.apache.org/docs/next/functions-overview/)`</li><li>`[Function overview](../../function-overview.md)`</li> |
| 对同一 markdown 文件中其他章节的交叉引用（需要 # 和 -） | `[Install builtin connectors (optional)](#install-builtin-connectors-optional)` | N/A |

阅读更多关于如何编写 Markdown 链接的内容，请访问[Markdown 链接](https://docusaurus.io/docs/markdown-features/links)。

#### 外部文档链接

在描述与外部软件的交互时，通常包含外部文档的链接很有帮助。如果可能，确保你链接到[权威来源](#authoritative-sources)。

例如，如果你在描述 Microsoft Active Directory 中的一个功能，请包含指向官方 Microsoft 文档的链接。

#### 链接到代码的特定行

在链接到文件中的特定行时使用**永久链接**，以确保用户登陆到你所引用的行，即使代码行会随时间变化。

![alt_text](media/obtain-github-permalink.png)

### 权威来源

在引用外部信息时，使用创建项目或产品的人员编写的来源。这些来源最有可能保持准确和最新。

* ✅ 权威来源包括以下内容：
  * 产品的官方文档。

    例如，如果你在设置与 Google OAuth 2 授权服务器的接口，请包含指向 Google 文档的链接。

  * 项目的官方文档。

    例如，如果你在引用 NodeJS 功能，请直接参考 [NodeJS 文档](https://nodejs.org/en/docs/)。

  * 来自权威出版商的书籍。

* ❌ 权威来源不包括以下内容：
  * 个人博客文章。
  * 描述另一公司产品的公司文档。
  * 不可信的文章。
  * 论坛讨论，如 Stack Overflow。

虽然许多这些要避免的来源可以帮助你学习技能或功能，但它们可能很快过时。没有人有义务维护这些网站。因此，你应该避免将它们用作参考资料。

只有在没有等效的权威来源时，非权威来源才是可接受的。即使在这种情况下，也要专注于被广泛引用或同行评审的非权威来源。

### 转义

使用反引号或 HTML 转义字符转义 `<` 和 `>`。

### 标题

* 每个文档页面以**级别 2**标题（`##`）开始。当页面渲染为 HTML 时，这将成为 `<h1>` 元素。
* 不要跳过级别。
* 在标题前后留一个空行。
* 不要在标题文本中使用链接。
* 当你更改标题文本时，锚点链接会改变。为了避免断开链接：
    * 不要在标题中使用步骤编号。
    * 如果可能，不要使用将来可能更改的词语。