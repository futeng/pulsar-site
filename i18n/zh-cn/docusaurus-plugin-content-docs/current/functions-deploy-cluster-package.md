---
id: functions-deploy-cluster-package
title: 启用包管理服务
sidebar_label: "启用包管理服务"
---

[包管理服务](admin-api-packages.md)为函数、sink 和 source 启用了版本管理和简化的升级/回滚过程。当在不同命名空间中使用相同的函数、sink 和 source 时，你可以将它们上传到一个通用的包管理系统。

启用包管理服务后，你可以[上传函数包](pathname:///reference/#/@pulsar:version_reference@/pulsar-admin/functions?id=upload)到服务并获取包 URL。因此，你可以通过将 `--jar`、`--py` 或 `--go` 设置为包 URL 来创建函数。

默认情况下，包管理服务是禁用的。要在集群中启用它，请在 `conf/broker.conf` 文件中设置以下属性。

```properties
enablePackagesManagement=true
packagesManagementStorageProvider=org.apache.pulsar.packages.management.storage.bookkeeper.BookKeeperPackagesStorageProvider
packagesReplicas=1
packagesManagementLedgerRootPath=/ledgers
```

:::tip

为了确保生产环境部署（具有多个 broker 的集群）的高可用性，请将 `packagesReplicas` 设置为等于 bookie 的数量。默认值 `1` 仅适用于单节点集群部署。

:::