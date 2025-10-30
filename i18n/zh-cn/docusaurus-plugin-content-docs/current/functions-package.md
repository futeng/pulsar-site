---
id: functions-package
title: 打包 Pulsar Functions
sidebar_label: "如何打包"
---

如果要以集群模式提交和运行函数，您需要先打包您的函数。

## 先决条件

在运行 Pulsar 函数之前，您需要启动 Pulsar。

您可以[在 Docker 中运行独立的 Pulsar](getting-started-docker.md)，或[在 Kubernetes 中运行 Pulsar](getting-started-helm.md)。要检查 Docker 镜像是否启动，您可以使用 `docker ps` 命令。

## 按编程语言打包函数

* [打包 Java 函数](functions-package-java.md)
* [打包 Python 函数](functions-package-python.md)
* [打包 Go 函数](functions-package-go.md)