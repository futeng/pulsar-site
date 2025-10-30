---
id: client-libraries
title: Pulsar 客户端库
sidebar_label: "概述"
description: 全面了解 Pulsar 客户端库。
---

## 特定语言的客户端库

Pulsar 支持以下特定语言的客户端库：

| 语言  | 文档                                                                                                      | 发布说明                                          | 代码仓库                                                             |
|-----------|--------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|-----------------------------------------------------------------------|
| Java      | [用户文档](client-libraries-java.md)   <br/> [API 文档](/api/client/)                                               | [独立版本](pathname:///release-notes/client-java)   | [内置](https://github.com/apache/pulsar/tree/master/pulsar-client) |
| C++       | [用户文档](client-libraries-cpp.md)    <br/> [API 文档](@pulsar:apidoc:cpp@)                                        | [独立版本](pathname:///release-notes/client-cpp)    | [独立版本](https://github.com/apache/pulsar-client-cpp)             |
| Python    | [用户文档](client-libraries-python.md) <br/> [API 文档](@pulsar:apidoc:python@)                                     | [独立版本](pathname:///release-notes/client-python) | [独立版本](https://github.com/apache/pulsar-client-python)          |
| Go 客户端 | [用户文档](client-libraries-go.md)   <br/> [API 文档](https://pkg.go.dev/github.com/apache/pulsar-client-go/pulsar) | [独立版本](pathname:///release-notes/client-go)     | [独立版本](https://github.com/apache/pulsar-client-go)              |
| Node.js   | [用户文档](client-libraries-node.md)  <br/> [API 文档](@pulsar:apidoc:js@)                                          | [独立版本](pathname:///release-notes/client-node)   | [独立版本](https://github.com/apache/pulsar-client-node)            |
| C#/DotPulsar | [用户文档](client-libraries-dotnet.md)                                                                             | [独立版本](pathname:///release-notes/client-cs)     | [独立版本](https://github.com/apache/pulsar-dotpulsar)              |

:::tip

如果您想创建自己的客户端库，请阅读[二进制协议文档](developing-binary-protocol.md)。

:::

## 语言无关的客户端库

Pulsar 支持以下语言无关的客户端库：

| 接口 | 文档                             | 发布说明                                      | 代码仓库                                                                |
|-----------|-------------------------------------------|---------------------------------------------------|--------------------------------------------------------------------------|
| REST      | [用户文档](client-libraries-rest.md)      | [内置版本](pathname:///release-notes/)             | [内置版本](https://github.com/apache/pulsar/tree/master/pulsar-broker)    |
| WebSocket | [用户文档](client-libraries-websocket.md) | [独立版本](pathname:///release-notes/client-ws) | [内置版本](https://github.com/apache/pulsar/tree/master/pulsar-websocket) |

:::note

**客户端/代理兼容性**

Pulsar 的设计目标是确保所有版本的客户端和代理之间的完全兼容性。当客户端连接到代理时，他们同意使用的协议版本。因此，依赖于协议更新的新功能仅在同时使用较新的客户端和较新的代理时才可用。

:::

## 功能矩阵

[客户端功能矩阵](/client-feature-matrix/)页面提供了特定语言客户端最新功能支持性的概述。

## 第三方客户端

除了官方发布的客户端外，还有多个以不同语言开发 Pulsar 客户端的项目可用。