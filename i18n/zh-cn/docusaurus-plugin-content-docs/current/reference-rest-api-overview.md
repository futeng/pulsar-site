---
id: reference-rest-api-overview
title: Pulsar REST APIs
sidebar_label: "REST APIs"
description: Get a comprehensive understanding of Pulsar REST APIs.
---

REST API（也称为 RESTful API，REpresentational State Transfer Application Programming Interface）是一组用于构建和集成应用软件的定义和协议，使用 HTTP 请求来 GET、PUT、POST 和 DELETE 数据，遵循 REST 标准。本质上，REST API 是一组使用标准方法在两个系统之间请求和返回特定格式数据的远程调用。

Pulsar 提供了多种 REST API，使您能够与 Pulsar 交互以检索信息或执行操作。

| REST API 类别 | 描述 |
| --- | --- |
| [Admin](/admin-rest-api/?version=@pulsar:version_number@) | 用于管理操作的 REST API。|
| [Functions](/functions-rest-api/?version=@pulsar:version_number@) | 用于函数特定操作的 REST API。|
| [Sources](/source-rest-api/?version=@pulsar:version_number@) | 用于源特定操作的 REST API。|
| [Sinks](/sink-rest-api/?version=@pulsar:version_number@) | 用于接收器特定操作的 REST API。|
| [Packages](/packages-rest-api/?version=@pulsar:version_number@) | 用于包特定操作的 REST API。包可以是一组函数、源和接收器。|
| [Transactions](/transactions-rest-api/?version=@pulsar:version_number@) | 用于事务特定操作的 REST API。|
| [Lookup](/lookup-rest-api/?version=@pulsar:version_number@) | 用于查找特定操作的 REST API，例如获取 Topic 的所有者 Broker、获取 Topic 所属的命名空间 Bundle 等。|
