---
id: deploy-kubernetes
title: 概述
sidebar_label: "Kubernetes"
---

Apache Pulsar Helm Chart 提供了在 Kubernetes 上部署和运行 Pulsar 最便捷的方式之一。Helm Chart 包含了所有必需的组件，具有可扩展性，因此适用于大规模部署。

Apache Pulsar Helm Chart 包含支持 Pulsar 提供的所有功能和特性的组件。您可以单独安装和配置这些组件。详情请参阅 [README](https://github.com/apache/pulsar-helm-chart#readme)。

## 后续步骤

* 要在**非生产**用例中快速启动和运行 Pulsar Helm Chart 以进行概念验证（PoC），请参阅[快速入门指南](getting-started-helm.md)。

* 要在生产环境中持续负载下启动和运行 Pulsar Helm Chart，请参阅[准备工作](helm-prepare.md)和[部署指南](helm-deploy.md)。

* 要升级现有的 Pulsar Helm Chart，请参阅[升级指南](helm-upgrade.md)。

:::tip

* Helm 中的模板化是通过 Golang 的 [text/template](https://golang.org/pkg/text/template/) 和 [sprig](https://godoc.org/github.com/Masterminds/sprig) 实现的。有关所有内部工作原理的更多信息，请查看这些文档：
  - [函数和管道](https://helm.sh/docs/chart_template_guide/functions_and_pipelines/)
  - [子图表和全局变量](https://helm.sh/docs/chart_template_guide/subcharts_and_globals/)

* 有关使用 Helm 开发的其他信息，请查看 Helm 仓库中的[提示和技巧](https://helm.sh/docs/howto/charts_tips_and_tricks/)。

:::