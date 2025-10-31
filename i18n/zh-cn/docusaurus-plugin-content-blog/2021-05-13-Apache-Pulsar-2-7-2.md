---
author: Enrico Olivelli
authorURL: https://twitter.com/eolivelli
title: "Apache Pulsar 2.7.2"
---
我们很高兴地看到 Apache Pulsar 社区成功发布了 2.7.2 版本。
这是一个次要版本，引入了稳定性修复和一些新功能，没有破坏性更改。

<!--truncate-->

### 新闻和值得注意的功能

以下是 Pulsar 2.7.2 中添加的最优秀和主要的增强功能精选。

- 改进 Kinesis 连接器的稳定性 [#10420](https://github.com/apache/pulsar/pull/10420)。
- 改进向 bookie 传递 ENV 变量（PULSAR_EXTRA_OPTS）[#10397](https://github.com/apache/pulsar/pull/10397)。
- 允许在 Windows 中构建 C++ 客户端并添加 CI 进行验证 [#10387](https://github.com/apache/pulsar/pull/10387)。
- 允许在 broker 中激活每个 BookKeeper 客户端功能 [#9232](https://github.com/apache/pulsar/pull/9232)。
- 改进 Pulsar 代理。
- 升级核心网络库：Jetty 和 Netty。

[这里](https://github.com/apache/pulsar/pulls?page=1&q=is%3Apr+label%3Arelease%2F2.7.2]) 您可以找到所有改进和错误修复的列表。

### 2.7.2 版本的贡献者

我们要感谢这个版本的所有贡献者。
与其他可持续的开源项目一样，Apache Pulsar 之所以伟大，是因为它得到了充满活力的社区的支持。

代码贡献者（姓名取自 GitHub API）：
Ali Ahmed, Andrey Yegorov, Binbin Guo, David Kjerrumgaard, Deon van der Vyver, Devin Bost, Enrico Olivelli, Guangning E, Kevin Wilson,
Lari Hotari, Marvin Cai, Masahiro Sakamoto, Matteo Merli, Michael Marshall, Rajan Dhabalia, Shen Liu, Ting Yuan, Vincent Royer,
Yong Zhang, Yunze Xu, Zhanpeng Wu, Zike Yang, baomingyu, CongBo, dockerzhang, feynmanlin, hangc0276, li jinquan, limingnihao,
linlinnn, mlyahmed, PengHui Li, Ran.

文档贡献者：
Anonymitaet (Yu Liu), Jennifer Huang

另外，我们要感谢所有花时间报告问题和分享使用 Pulsar 故事的每个人。

期待您对 [Apache Pulsar](https://github.com/apache/pulsar) 的贡献。