---
id: helm-upgrade
title: 升级 Pulsar Helm 发行版
sidebar_label: "升级"
description: 学习如何将 Apache Pulsar Helm 升级到更新版本。
---


要将 Apache Pulsar Helm 升级到更新版本，请完成以下步骤。

1. 检查你要升级到的特定版本的变更日志，并阅读可能与新 Pulsar Helm Chart 版本相关的发布说明。

2. 逐步阅读[部署指南](helm-deploy.md)。

3. 使用以下命令提取你之前的 `--set` 参数，如果需要则更改值。

   ```bash
   helm get values <release-name> > pulsar.yaml
   ```

   :::note

   强烈建议使用 `helm upgrade --set key=value` 语法或 `-f values.yml` 提供所有值，而不是使用 `--reuse-values`，因为一些当前值可能已被弃用。

   你可以使用 `helm get values <release-name>` 清晰地检索之前的 `--set` 参数。如果将其导入文件（`helm get values <release-name> > pulsar.yml`），你可以安全地通过 `-f` 传递此文件，即 `helm upgrade <release-name> apache/pulsar -f pulsar.yaml`。这安全地替换了 `--reuse-values` 的行为。

   :::

4. 执行升级，使用步骤 3 中提取的所有 `--set` 参数。

   ```bash
   helm upgrade <release-name> apache/pulsar \
       --version <new version> \
       -f pulsar.yaml \
       --set ...
   ```