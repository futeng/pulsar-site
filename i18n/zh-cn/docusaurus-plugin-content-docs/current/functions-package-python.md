---
id: functions-package-python
title: 打包 Python Functions
sidebar_label: "打包 Python Functions"
description: 学习如何在 Pulsar 中打包 Python 函数。
---

Python 函数支持以下三种打包格式：

## 单个 Python 文件

要将 Python 函数打包为**单个 Python 文件**，请完成以下步骤。

1. 编写 Python 函数。

   ```python
   from pulsar import Function #  从 Pulsar 导入 Function 模块

   # 经典的 ExclamationFunction，在输入末尾附加感叹号
   class ExclamationFunction(Function):
       def __init__(self):
           pass

       def process(self, input, context):
           return input + '!'
   ```

    在此示例中，当您编写 Python 函数时，需要继承 Function 类并实现 `process()` 方法。

    `process()` 主要有两个参数：

    - `input` 代表您的输入。

    - `context` 代表 Pulsar Function 暴露的接口。您可以根据提供的上下文对象在 Python 函数中获取属性。

2. 安装 Python 客户端。Python 函数的实现依赖于 Python 客户端。

   ```bash
   pip install pulsar-client==2.10.0
   ```

   并安装 protobuf 工具来生成 proto 文件：

   ```bash
   pip install 'protobuf==3.20.*'
   ```

3. 将 Python 函数文件复制到 Pulsar 镜像。

   ```bash
   docker exec -it [容器 ID] /bin/bash
   docker cp <Python 函数文件的路径>  容器 ID:/pulsar
   ```

4. 使用以下命令运行 Python 函数。

   ```bash
   ./bin/pulsar-admin functions localrun \
       --classname <Python 函数文件名>.<Python 函数类名> \
       --py <Python 函数文件的绝对路径> \
       --inputs persistent://public/default/my-topic-1 \
       --output persistent://public/default/test-1 \
       --tenant public \
       --namespace default \
       --name PythonFunction
   ```

   以下日志表示 Python 函数启动成功。

   ```text
    ...
    07:55:03.724 [main] INFO  org.apache.pulsar.functions.runtime.ProcessRuntime - Started process successfully
    ...
   ```

## ZIP 文件

要将 Python 函数打包为 **ZIP 文件**，请完成以下步骤。

1. 准备 ZIP 文件。

   ```text
    假设 zip 文件名为 `func.zip`，解压 `func.zip` 文件夹：
        "func/src"
        "func/requirements.txt"
        "func/deps"
   ```

   以 [exclamation.zip](https://github.com/apache/pulsar/tree/master/tests/docker-images/latest-version-image/python-examples) 文件为例。示例的内部结构如下。

   ```text
    .
    ├── deps
    │   └── sh-1.12.14-py2.py3-none-any.whl
    └── src
        └── exclamation.py
   ```

2. 将 ZIP 文件复制到 Pulsar 镜像。

   ```bash
    docker exec -it [容器 ID] /bin/bash
    docker cp <ZIP 文件的路径>  容器 ID:/pulsar
   ```

3. 使用以下命令运行 Python 函数。

   ```shell
   ./bin/pulsar-admin functions localrun \
       --classname exclamation \
       --py <ZIP 文件的绝对路径> \
       --inputs persistent://public/default/in-topic \
       --output persistent://public/default/out-topic \
       --tenant public \
       --namespace default \
       --name PythonFunction
   ```

    以下日志表示 Python 函数启动成功。

   ```text
    ...
    07:55:03.724 [main] INFO  org.apache.pulsar.functions.runtime.ProcessRuntime - Started process successfully
    ...
   ```

## PIP

:::note

PIP 方法仅在 Kubernetes 运行时中受支持。

:::

要使用 **PIP** 打包 Python 函数，请完成以下步骤。

1. 配置 `functions_worker.yml` 文件。

   ```shell
    #### Kubernetes 运行时 ####
    installUserCodeDependencies: true
   ```

2. 编写您的 Python 函数。

   ```python
   from pulsar import Function
   import js2xml

   # 经典的 ExclamationFunction，在输入末尾附加感叹号
   class ExclamationFunction(Function):
       def __init__(self):
           pass

       def process(self, input, context):
           # 添加您的逻辑
           return input + '!'
   ```

   您可以引入额外的依赖项。当 Python 函数检测到当前使用的文件是 `whl` 并且指定了 `installUserCodeDependencies` 参数时，系统使用 `pip install` 命令安装 Python 函数中所需的依赖项。

3. 生成 `whl` 文件。

   ```shell
   cd $PULSAR_HOME/pulsar-functions/scripts/python
   chmod +x generate.sh
   ./generate.sh <您的 Python 函数的路径> <whl 输出目录的路径> <whl 的版本>
   # 例如: ./generate.sh /path/to/python /path/to/python/output 1.0.0
   ```

   输出写入 `/path/to/python/output`：

   ```text
    -rw-r--r--  1 root  staff   1.8K  8 27 14:29 pulsarfunction-1.0.0-py2-none-any.whl
    -rw-r--r--  1 root  staff   1.4K  8 27 14:29 pulsarfunction-1.0.0.tar.gz
    -rw-r--r--  1 root  staff     0B  8 27 14:29 pulsarfunction.whl
   ```