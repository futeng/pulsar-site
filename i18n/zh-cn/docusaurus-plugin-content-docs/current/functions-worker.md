---
id: functions-worker
title: 设置函数工作器
sidebar_label: "设置函数工作器"
---

您有两种方式来设置[函数工作器](functions-concepts.md#function-worker)。
- [与 broker 一起运行函数工作器](functions-worker-corun.md)。在以下情况下使用：
    - 在进程或线程模式下运行函数时不需要资源隔离；
    - 您配置函数工作器在 Kubernetes 上运行函数（资源隔离问题由 Kubernetes 解决）。
- [单独运行函数工作器](functions-worker-run-separately.md)。当您想将函数和 broker 分开时使用。

**可选配置**
* [配置临时文件路径](functions-worker-temp-file-path.md)
* [启用有状态函数](functions-worker-stateful.md)
* [为异地复制集群配置函数工作器](functions-worker-for-geo-replication.md)

**参考**
* [故障排除](functions-worker-troubleshooting.md)