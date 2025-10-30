---
id: helm-prepare
title: 准备 Kubernetes 资源
sidebar_label: "准备"
description: 在部署 Apache Pulsar Helm Chart 之前，学习如何创建 Kubernetes 集群。
---

对于一个功能完整的 Pulsar 集群，在部署 Apache Pulsar Helm Chart 之前你需要一些资源。本节提供了在部署 Pulsar Helm Chart 之前需要做的准备工作信息。

## 前置条件

通过安装必需的工具来设置你的环境。

### 安装 kubectl

`kubectl` 1.18 或更高版本是与 Kubernetes API 通信的必需工具。它需要与你的集群兼容（[与集群版本相差 +/- 1 个次要版本](https://kubernetes.io/docs/tasks/tools/install-kubectl/#before-you-begin)）。在连接到集群之前，无法获取 `kubectl` 的服务器版本。

有关安装说明，请参阅 [Kubernetes 文档](https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl)。

### 安装 Helm

Helm 是 Kubernetes 的包管理器。Apache Pulsar Helm Chart 支持 Helm v3（3.0.2 或更高版本）。

你可以从项目的[发布页面](https://github.com/helm/helm/releases)获取 Helm，或者按照[安装 Helm](https://helm.sh/docs/intro/install/)官方文档中的其他选项操作。

## 创建 Kubernetes 集群

继续部署需要 Kubernetes 集群版本 1.18 或更高版本。有关如何创建 Kubernetes 集群的详细信息，请参阅 [Kubernetes 文档](https://kubernetes.io/docs/setup/production-environment/tools/)。