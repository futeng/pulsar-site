---
id: functions-runtime-process
title: 配置进程运行时
sidebar_label: "配置进程运行时"
description: 在 Pulsar 中为函数配置进程运行时。
---

您可以在 `conf/functions_worker.yml` 文件中使用进程运行时的默认配置。

如果您想自定义更多参数，请参考以下示例。

```yaml
functionRuntimeFactoryClassName: org.apache.pulsar.functions.runtime.process.ProcessRuntimeFactory
functionRuntimeFactoryConfigs:
  # 存储函数日志的目录
  logDirectory:
  # 仅当您将 java 实例 jar 放在不同位置时才更改 jar 位置
  javaInstanceJarLocation:
  # 仅当您将 python 实例 jar 放在不同位置时才更改 python 实例位置
  pythonInstanceLocation:
  # 更改额外依赖项位置：
  extraFunctionDependenciesDir:
```

更多详情，请参阅[代码](https://github.com/apache/pulsar/blob/master/pulsar-functions/runtime/src/main/java/org/apache/pulsar/functions/runtime/process/ProcessRuntimeFactoryConfig.java)。

### 使用配置文件设置运行时参数

Pulsar Functions 现在支持**在 Python 中**使用配置文件设置运行时参数。

**示例**

您可以使用配置文件 `config.ini` 通过以下命令启动 Python 运行时。

```shell
pulsar-admin functions localrun \
  --py /path/to/python_instance.py \
  --config-file /path/to/config.ini \
  --classname MyFunction \
  --logging_level debug \
  --inputs persistent://public/default/my-input-topic \
  --output persistent://public/default/my-output-topic \
  --log-topic persistent://public/default/functions-logs
```

`--config-file` 是配置文件的路径。请注意：

- `--config-file` 应该以 `.ini` 格式编写，每个参数配置为 `key = value`。

    **示例**

    ```ini
    [DEFAULT]
    logging_level = info
    max_pending_async_requests = 1000
    max_concurrent_requests = 50
    ```

- 当您通过配置文件和命令行同时设置参数时，如上例中的 `logging_level`，通过命令行设置的值将**优先于**通过配置文件设置的值。因此，`logging_level` 的值是 `debug`。