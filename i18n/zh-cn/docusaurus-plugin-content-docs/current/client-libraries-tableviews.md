---
id: client-libraries-tableviews
title: 使用 TableView
sidebar_label: "使用 TableView"
description: 学习如何在 Pulsar 中使用 TableView。
---

````mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
````

设置好客户端后，你可以探索更多以开始使用 [TableView](concepts-clients.md#tableview)。

## 配置 TableView


````mdx-code-block
<Tabs groupId="lang-choice"
defaultValue="Java"
values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"}]}>
<TabItem value="Java">

  以下是配置 TableView 的示例。

  ```java
    TableView<String> tv = client.newTableViewBuilder(Schema.STRING)
    .topic("my-tableview")
    .create()
  ```

你可以使用 `loadConf` 配置中的可用参数或 API [`TableViewBuilder`](/api/client/org/apache/pulsar/client/api/TableViewBuilder.html) 来自定义你的 TableView。

  | 名称 | 类型| 必需? |  <div>描述</div> | 默认值
  |---|---|---|---|---
  | `topic` | string | 是 | TableView 的主题名称。 | N/A
  | `autoUpdatePartitionInterval` | int | 否 | 检查新添加分区的间隔。 | 60 (秒)
  | `subscriptionName` | string | 否 | TableView 的订阅名称。 | null

</TabItem>

<TabItem value="C++">


  此功能在 C++ 客户端 3.2.0 或更高版本中受支持。


  ```cpp
  ClientConfiguration clientConfiguration;
  clientConfiguration.setPartititionsUpdateInterval(100);
  Client client("pulsar://localhost:6650", clientConfiguration);
  TableViewConfiguration tableViewConfiguration{schemaInfo, "test-subscription-name"};
  TableView tableView;
  client.createTableView("my-tableview", tableViewConfiguration, tableView)
  ```

  你可以使用以下参数来自定义你的 TableView。

  | 名称 | 类型| 必需? |  <div>描述</div> | 默认值
  |---|---|---|---|---
  | `topic` | string | 是 | TableView 的主题名称。 | N/A
  | `schemaInfo` | struct | 否 | 声明此 TableView 可以接受的数据的模式。该模式与主题的模式进行检查，如果不兼容则 TableView 创建失败。 | N/A
  | `subscriptionName` | string | 否 | TableView 的订阅名称。 | reader-{随机字符串}
  | `partititionsUpdateInterval` | int | 否 | 主题分区更新间隔（秒）。在 C++ 客户端中，`partititionsUpdateInterval` 在同一客户端内是全局的。 | 60


</TabItem>

</Tabs>
````

## 注册监听器

你可以使用 `forEachAndListen` 为主题上的现有消息和进入主题的新消息注册监听器，并使用 `forEach` 指定对所有现有消息执行操作。

以下是向 TableView 注册监听器的示例。


````mdx-code-block
<Tabs groupId="lang-choice"
defaultValue="Java"
values={[{"label":"Java","value":"Java"},{"label":"C++","value":"C++"}]}>

<TabItem value="Java">

  ```java
  // 为所有现有和传入消息注册监听器
  tv.forEachAndListen((key, value) -> /*对所有现有和传入消息的操作*/)

  // 为所有现有消息注册操作
  tv.forEach((key, value) -> /*对所有现有消息的操作*/)
  ```

</TabItem>


<TabItem value="C++">

    ```cpp
    // 为所有现有和传入消息注册监听器
    tableView.forEach([](const std::string& key, const std::string& value) {});

    // 为所有现有消息注册操作
    tableView.forEachAndListen([](const std::string& key, const std::string& value) {});
    ```

</TabItem>

</Tabs>
````