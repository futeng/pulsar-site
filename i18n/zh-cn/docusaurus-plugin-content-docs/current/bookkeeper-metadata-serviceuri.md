---
id: bookkeeper-metadata-serviceuri
title: BookKeeper 元数据配置 (metadataServiceUri)
---

# BookKeeper 元数据配置 (metadataServiceUri)

BookKeeper 需要知道在哪里存储 ledger 元数据，以便在不同机架之间放置数据（机架感知）。
有**三种主要配置方式**，其行为会根据您使用的方式而有所不同。

### **1\. 默认行为 — 当您不进行任何配置时**

如果您在 **bookkeeper.conf** 中省略 **metadataServiceUri**：

1. **BookKeeper 会查找这些较旧的配置**：
* zkServers → ZooKeeper 主机列表，例如：

  | zk1:2181,zk2:2181,zk3:2181 |
  | :---- |

* zkLedgersRootPath `→` BookKeeper 元数据在 ZooKeeper 中的存储位置，例如：

  | /ledgers |
  | :---- |

2. **如果找到**，BookKeeper 会在内部自动**构建这种旧式 URI**：

* 通常是

  | zk+hierarchical:*//zk1:2181,zk2:2181,zk3:2181/ledgers* |
  | :---- |

* 但如果没有设置布局类型，可能是：

  | zk+null:*//zk1:2181,zk2:2181,zk3:2181/ledgers* |
  | :---- |

3. 如果缺少布局类型或您明确使用：**metadataServiceUri=zk+hierarchical://…**。
* BookKeeper 可能会记录如下警告：
  Failed to initialize DNS Resolver org.apache.pulsar.zookeeper.ZkBookieRackAffinityMapping, used default subnet resolver because METADATA\_STORE\_INSTANCE failed to init BookieId list
* 这种 URI 格式可以工作，但可能会破坏**机架感知**（Pulsar 问题 \#24455）
* 仅当使用 metadataServiceUri=zk+hierarchical://… 时才会出现警告。

* 这可能发生在 Pulsar 3.x 或 4.x 中。

### **2\. 旧式显式 ZooKeeper 配置（已弃用但仍然有效）**

较旧的设置没有 **metadataServiceUri**。
而是使用

| zkServers=zk1:2181,zk2:2181,zk3:2181<br>zkLedgersRootPath=/ledgers |
| :---- |

BookKeeper 为了**向后兼容**仍然支持这种方式，
但它基本上与上面的"默认"行为相同 —
最终在内部变为：

| zk+null:*//zk1:2181,zk2:2181,zk3:2181/ledgers* |
| :---- |

（如果指定了布局类型，有时是 zk+hierarchical://zk1:2181,zk2:2181,zk3:2181/ledgers）

* 在 Pulsar 3.x 和 4.x 中仍然有效。
* 使用此样式时必须设置 zkLedgersRootPath。
* 这是"旧"方式 — 仅为了向后兼容而保留。
* Pulsar 中的新功能可能未在此模式下充分测试，因此请计划迁移。

### **3\. 元数据服务 URI（首选）**

根据我们的 **OSS Pulsar 4.x 测试**，**正确且有效的设置**是：

| metadataServiceUri=metadata-store:zk:pulsar-mini-zookeeper:2181<br>zkLedgersRootPath=/ledgers<br>zkServers= |
| :---- |

* 在 Pulsar 3.x 和 4.x 中与机架感知配合良好工作。
* 在大多数 Pulsar 3.x 和 4.x 部署中，正确的元数据驱动程序已经启用，但如果需要，设置：

| -Dbookkeeper.metadata.client.drivers=org.apache.pulsar.metadata.bookkeeper.PulsarMetadataClientDriver<br>-Dbookkeeper.metadata.bookie.drivers=org.apache.pulsar.metadata.bookkeeper.PulsarMetadataBookieDriver |
| :---- |


#### **避免使用此格式**

| metadataServiceUri=zk+hierarchical:*//zk1:2181,zk2:2181,zk3:2181/ledgers* |
| :---- |

* 这是因为，在 Pulsar 3.x 和 4.x 中，使用此格式时机架感知可能会失败。
* 这是一个已知错误 — 参见 [Pulsar \#24426](https://github.com/apache/pulsar/issues/24426)。
* 请改用 **metadata-store:zk:**。

### **总结：**

始终在 bookkeeper.conf 中设置 **metadataServiceUri**。例如：

| metadataServiceUri=metadata-store:zk:zk1:2181,zk2:2181,zk3:2181/ledgers |
| :---- |

*  → 这是现代、可靠的方法。在 Pulsar 3.x 和 4.x 中与机架感知配合良好。

* 如果您**不设置它**，BookKeeper 将：

  1. 检查旧配置 zkServers + zkLedgersRootPath。

  2. "警告/失败"仅在使用 metadataServiceUri=zk+hierarchical://… 时发生，而不是在使用旧式 zkServers 时。
      → 这可能会导致在 Pulsar 3.x 和 4.x 中**机架感知失效**。
