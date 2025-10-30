import React from 'react';
import s from './FeaturesPage.module.css'
import Card, { CardProps } from './Card/Card';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
const versions = require("@site/versions.json");
import Button from '@site/src/components/ui/Button/Button';
const latestVersion = versions[0];

const FeaturesPage: React.FC = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      title: "Pulsar 特性",
      subtitle: "消息和流处理的完整平台。",
      description: "使 Apache Pulsar 不仅仅是一个消息代理的特性组合。",
      readyToStart: "准备开始了吗？",
      exploreDocsDesc: "探索文档，深入了解 pulsar 的工作原理",
      exploreDocs: "探索文档",
      seeCaseStudies: "查看案例研究",
      moreFeatures: "更多特性",
      // 卡片内容翻译
      rapidHorizontalScalability: "快速水平扩展",
      rapidHorizontalScalabilityDesc: "水平扩展以处理增加的负载。其独特的设计和独立的存储层能够在几秒钟内通过扩展来处理突发流量激增。",
      rapidHorizontalScalabilityMore: "Apache Pulsar 服务器 - 代理 - 不会将接收到的消息持久化到本地磁盘上的文件中。相反，它将消息写入另一个名为 Apache Bookkeeper 的系统 - 这个系统可以简短地描述为分布式（多个节点）只追加虚拟文件存储。消息被写入到这样的只追加虚拟文件，即 Ledger。这种设计使 Pulsar 的代理成为无状态的；因此在流量突然激增时，它可以在几秒钟内扩展 - 添加更多节点并在它们之间自动分配主题（见下面的负载均衡器功能），在 Pulsar 中不需要任何数据移动。<br />一个主题实际上是一个账本列表（虚拟只追加文件）。活动账本在每个可配置的大小/时间时关闭，并打开和使用一个新的账本。<br />Apache Bookkeeper 也可以在几秒钟内扩展。当添加节点时，不需要数据移动。由于主动写入的主题不断替换其活动账本，新的 bookkeeper 节点也被选择作为统一选择过程的一部分来托管新文件，从而平衡消息写入。这意味着新节点立即帮助平衡高流量激增。",

      lowLatency: "低延迟消息和流处理",
      lowLatencyDesc: "单独确认消息（RabbitMQ 风格）或按分区累积确认（即类似偏移量）。支持分布式工作队列或保序数据流等用例，可在非常大規模（数百个节点）和低延迟（<10ms）下运行。",
      lowLatencyMore: "Pulsar 提供向主题和分区主题（分为分区的主题）写入消息的功能。消息可以通过多种方式消费：<br /><ul><li><strong>流式处理：</strong>按分区顺序，并累积确认（到特定分区的特定消息 ID），类似于 Apache Kafka 的工作方式。</li><li><strong>消息处理：</strong>无序，单独确认每条消息，类似于 RabbitMQ 的工作方式。这使得可以有大量消费者同时，无论分区数量如何。非常适合分布式工作队列（即作业）和加速机器学习工作负载。</li><li><strong>按键有序消息处理：</strong>按键排序。您可以根据需要拥有任意数量的并发消费者。代理将键在消费者之间平均分配，特定键的所有消息将到达与该键关联的同一个单一消费者。这保持了按键的消息处理顺序。</li></ul>所有这些都以非常低的延迟（<10ms）支持，包括产生消息和端到端延迟，以及大规模（数百个节点）集群。",

      supportsUpTo1MTopics: "支持多达 100 万个主题",
      supportsUpTo1MTopicsDesc: "Pulsar 独特的架构在单个集群中支持多达 100 万个主题。通过避免将多个流复用到单个主题中来简化您的架构。",
      supportsUpTo1MTopicsMore: "Pulsar 将消息持久化到虚拟只追加文件中，即存储在 Apache Bookkeeper（一个单独的系统）中的 Ledger。由于它不是每个主题的活跃物理文件，Pulsar 不受文件描述符限制的限制；因此它允许有多达 100 万个主题。这可以为您的应用程序支持独特、简化的架构。与传统系统相比，传统系统迫使您将多个流复用到单个主题中，使您的应用程序变得笨重。",

      multiTenancy: "多租户为一等公民",
      multiTenancyDesc: "使用租户为整个组织维护一个集群。控制哪些用户可以访问数据（命名空间/主题）和操作（生产/消费/…）。",
      multiTenancyMore: "Pulsar 中的租户存在是为了将 Pulsar 中的数据划分为几个部分。租户持有命名空间，命名空间又持有主题和 Pulsar 函数。组织通常给每个部门/团队自己的租户，在其中他们为他们拥有的每个域创建命名空间，以及为该域需要的实现创建主题。<br />租户主要与细粒度访问控制功能结合使用。租户有一个租户管理员用户列表，他们可以授予特定用户对特定命名空间或主题的权限，如生产/消费/函数/…等。<br />最后，如果 Pulsar 实例有多个集群，租户可以被限制到特定集群。<br />租户使组织中的部门能够自主管理其数据的安全性和对其的操作。",

      automaticLoadBalancing: "自动负载均衡",
      automaticLoadBalancingDesc: "添加或删除节点，让 Pulsar 自动负载均衡主题束。热点主题束会自动分割并均匀分布在代理之间。",
      automaticLoadBalancingMore: "Pulsar 支持在代理之间自动负载均衡主题，以达到 CPU、内存和流量的均衡代理负载。这是可能的，因为 Pulsar 代理是无状态的，因此当主题在代理之间移动时不需要任何数据移动。<br />由于 Pulsar 支持多达 100 万个主题，平衡的单位不是主题而是主题束（使用哈希选择的一组主题）。负载均衡器在代理之间移动束，这将在代理之间移动与束关联的所有主题。<br />当束处于极端负载下时，会发生自动分割，以允许在两个束之间平衡该束的负载，这可以连续进行，直到达到均衡的集群。",

      k8sReady: "K8s 就绪（云原生）",
      k8sReadyDesc: "Pulsar 从第一天起就是为云构建的。由于 Pulsar 是无状态的，Bookkeeper 旨在避免数据重新分片，同时仍然利用所有新加入的节点，因此 Pulsar 和 Bookkeeper 节点都可以快速扩展。",
      k8sReadyMore: "<strong>原生支持扩展：</strong><ul><li>Pulsar 代理是无状态的（消息存储在 Bookkeeper 中）；因此扩展是即时的，因为没有数据移动到新代理。Pulsar 具有自动负载均衡，因此新节点将自动获得在整个集群中均匀平衡的新主题。</li><li>Apache Bookkeeper 原生支持扩展，因为它在启动新节点时不会重新分片数据。Pulsar 中的主题是账本链，其中最后一个是活跃的。活动账本旋转相当快，这意味着新的 Bookkeeper 节点将几乎立即共享传入消息的负载。</li></ul>Pulsar 捆绑了 k8s helm charts，包含操作所需的所有组件：Pulsar 代理、Bookkeeper、Zookeeper、Function Workers 等。",

      seamlessGeoReplication: "无缝地理复制",
      seamlessGeoReplicationDesc: "使用跨不同地理区域的复制来防止整个区域故障。在远程 Pulsar 集群之间灵活且可配置的复制策略。独特支持自动客户端故障转移到健康集群。",
      seamlessGeoReplicationMore1: "Pulsar 支持 Pulsar 实例的概念：一组 Pulsar 集群，由于单一全局元数据存储（即 ZK）而彼此了解。您在集群之间定义复制策略：主动-备用、主动-主动等。这允许您在不同的区域中拥有每个集群，实现开箱即用的地理复制。它为您提供数据冗余和灾难恢复。",
      seamlessGeoReplicationMore2: "集群复制数据（消息）和订阅（消费者确认状态）。<br />如果这还不够，Pulsar 客户端支持自动故障转移。如果它检测到主集群（使用指定的 URL 检查）宕机，它会自动故障转移到辅助集群。由于数据和消费状态（订阅）被复制，您只需从主集群中断的地方继续。",

      officialMultiLanguageSupport: "官方多语言支持",
      officialMultiLanguageSupportDesc: "官方维护的 Pulsar 客户端支持 Java、Go、Python、C++、Node.js 和 C#。",
      officialMultiLanguageSupportMore: "Pulsar 有官方维护的 Java、Go、Python、C++、Node.js 和 C# 客户端。详细信息和功能矩阵（比较每种语言支持的功能）可以在客户端文档页面上找到。<br />还有第三方开发的非官方客户端，如原生 Node.js 客户端、.NET、Haskell、PHP、Rust 和 Scala。",

      tieredStorage: "分层存储支持无限保留（S3/GCS/…）",
      tieredStorageDesc: "通过将数据从 Bookkeeper 无缝卸载到 blob 存储（如 S3）来实现无限保留。通过在 Bookkeeper 和 S3 中保留热数据来保持高性能和弹性。",
      tieredStorageMore: "Pulsar 主题是账本列表（如上所述）。只有最新的账本被认为是打开写入的；其他账本是关闭的 - 即不可变的。<br />Pulsar 支持将这些不可变账本卸载到分层存储，如 S3、GCS、Azure BlobStore 等。您可以选择配置在账本成功卸载后在 Bookkeeper 中保留账本多长时间。<br />此功能允许您以低成本无限保留。<br />Pulsar 根据账本位置在从 Bookkeeper 或分层存储系统读取之间无缝切换，使其对客户端透明。它非常适合将\"冷\"数据卸载到低成本系统中，因为假设这些数据将被访问频率较低，并且要求较少的读取性能（由于分层存储系统的性质）。",

      builtInSchemaRegistry: "内置模式注册表",
      builtInSchemaRegistryDesc: "支持根据主题模式验证传入和传出数据。通过支持每个新模式版本的向后和向前兼容性检查来确保未来兼容性。",
      builtInSchemaRegistryMore: "Pulsar 有内置的模式注册表。这提供了为存储在主题中的消息指定模式的能力。注册表支持演进模式，内置的向前和向后兼容性检查，以防止在使用不兼容模式产生或消费消息时犯严重错误。<br />支持多种模式语言，包括 Avro 和 Protobuf。",

      granularAccessControl: "细粒度访问控制",
      granularAccessControlDesc: "Pulsar 支持用户身份验证，能够设置对特定命名空间或主题的访问权限，具有有限权限（消费、生产等）。",
      granularAccessControlMore: "Pulsar 有用户的概念和他们每个对给定命名空间或主题拥有的权限列表。有一个配置的用户列表分配给超级管理员角色的独特角色，授予他们访问一切的权限。每个租户都有这样的租户管理员角色列表，授予用户授予租户内包含的命名空间和主题权限的能力。<br />权限包括：产生消息、消费消息、运行函数以及安装连接器、接收器或源。<br />这使组织能够授权团队自主管理其应用程序数据访问（通常包含在租户内）。",

      guaranteedMessagePersistency: "保证消息持久性",
      guaranteedMessagePersistencyDesc: "Pulsar 写入 Bookkeeper 保证已写入磁盘（即 fsync），为机器故障提供高弹性。可以禁用以获得更高的吞吐量。",
      guaranteedMessagePersistencyMore: "当 Pulsar 接收到消息时，它使用其客户端将其写入 Bookkeeper，默认并行写入 3 个 Bookkeeper 节点。只有当 2 个 Bookkeeper 节点成功写入时，写入才被认为是成功的。只有那时 Pulsar 向客户端确认写入。<br />Bookkeeper 默认将消息写入磁盘，进入称为预写日志的日志，然后写入内存，只有那时才向客户端报告写入成功。Bookkeeper 的关键特性是它在考虑写入成功之前确保写入磁盘已刷新（保证写入磁盘 - 即 fsync）。性能通过每批消息调用昂贵的 fsync 操作一次来实现。<br />这种默认行为非常适合您根本不能丢失已写入消息的情况。您可以关闭它，从而获得性能提升，并依赖其他副本生存，而 Bookkeeper \"修复\"机制在后台修复其他副本。",

      separateComputeFromStorage: "计算与存储分离",
      separateComputeFromStorageDesc: "由于 Pulsar 独特的架构，分别为存储和 CPU 选择最佳的实例类型。通过直接从 Bookkeeper 读取支持大规模并行查询引擎。",
      separateComputeFromStorageMore: "Pulsar 有一个名为 Pulsar IO 的内置框架，它简化了编写和执行连接器，这实现了将数据从第三方系统读入 Pulsar 主题或将存储在 Pulsar 主题中的消息写入第三方系统。<br /><br />Pulsar 有几个官方维护的流行第三方连接器：MySQL、Elasticsearch、Cassandra 等。完整列表可在此处找到。<br /><br />Pulsar IO 是在 Pulsar Functions 之上编写的，因此连接器（无论是接收器还是源）都是 Pulsar Function。连接器使用基于选择的运行时（线程、进程或 K8s pod）的 Pulsar Function Worker 运行。这意味着它也支持并行性（增加运行连接器的实例数量并在它们之间分配工作）。",

      builtToSupportAdditionalProtocols: "内置支持其他协议（Kafka、RabbitMQ、…）",
      builtToSupportAdditionalProtocolsDesc: "使用流行的消息系统客户端，以 Pulsar 作为后端，由社区插件提供支持：Kafka、RabbitMQ 等。这有助于逐步迁移到 Pulsar。",
      builtToSupportAdditionalProtocolsMore: "Pulsar 有许多插件类型，其中一种称为协议处理器。它允许向现有的 Pulsar 二进制协议添加额外的消息协议。插件负责从套接字读取数据，并将其转换为 Pulsar 命令，如写入消息、列出主题等。<br /><br />这使社区能够开发对广泛采用的附加协议的支持，如 AMQP、Kafka、RabbitMQ、RocketMQ 和 MQTT。请参阅此页面以获取现有社区协议处理器的列表。这使例如使用 Kafka 客户端或 RabbitMQ 客户端但以 Pulsar 作为后端系统成为可能。",

      serverlessFunctions: "无服务器函数",
      serverlessFunctionsDesc: "使用 Pulsar Functions 原生编写和部署函数。使用 Java、Go 或 Python 处理消息，无需部署完整应用程序。捆绑了 Kubernetes 运行时。",
      serverlessFunctionsMore: "Pulsar 非常适合摄取消息，以各种方式消费它们，并根据需要保留它们。人们经常编写一个完整的应用程序来消费它们并运行复杂的逻辑。在某些情况下，您需要对消息进行简单的转换。您可以为此推出自己的应用程序或使用流处理工具，如 Spark、Flink 等。两者都是过度的：为次要消息修改推出应用程序仍然需要编写大量管道代码，而推出 Spark / Flink 需要大量这些系统的知识和维护它们的时间。<br /><br />Pulsar 提供了一个名为 Pulsar Functions 的轻量级流处理框架。它使您能够在 Java、Go 或 Python 中的单个文件中编写函数，并将其部署到 Pulsar Functions，该函数为您运行该函数。函数将在定义的主题中的每条消息上运行，并可以选择在任何主题上写入消息。它非常适合简单的消息转换：从主题读取消息，转换它，然后写入另一个主题。它也被用于各种更大的任务，如 ML 训练。<br /><br />Pulsar Functions 支持并行性，允许您指定它将运行的函数实例数量。它有一个协调和执行这些函数的独特过程，称为 Pulsar Function Worker。它支持在线程、专用进程或 K8s 中的 pod 中运行函数。",

      official3rdPartyConnectors: "官方第三方连接器",
      official3rdPartyConnectorsDesc: "使用 Pulsar Functions 原生编写和部署函数。使用 Java、Go 或 Python 处理消息，无需部署完整应用程序。捆绑了 Kubernetes 运行时。",
      official3rdPartyConnectorsMore: "Pulsar 有一个名为 Pulsar IO 的内置框架，它简化了编写和执行连接器，这实现了将数据从第三方系统读入 Pulsar 主题或将存储在 Pulsar 主题中的消息写入第三方系统。<br /><br />Pulsar 有几个官方维护的流行第三方连接器：MySQL、Elasticsearch、Cassandra 等。完整列表可在此处找到。<br /><br />Pulsar IO 是在 Pulsar Functions 之上编写的，因此连接器（无论是接收器还是源）都是 Pulsar Function。连接器使用基于选择的运行时（线程、进程或 K8s pod）的 Pulsar Function Worker 运行。这意味着它也支持并行性（增加运行连接器的实例数量并在它们之间分配工作）。",

      supportVeryLargeMessages: "支持非常大的消息",
      supportVeryLargeMessagesDesc: "Pulsar 欢迎非常大的消息，使用客户端分块。",
      supportVeryLargeMessagesMore: "大消息不会被拒绝。相反，Pulsar 客户端支持分块：非常大的消息被分成块，这些块由消费者（Pulsar 客户端的一部分）重新组装成原始消息。",

      delayedMessaging: "延迟消息传递",
      delayedMessagingDesc: "写入具有给定延迟的消息，然后才能消费。非常适合计划任务和指数退避重试。",
      delayedMessagingMore: "Pulsar 支持写入具有给定延迟的消息，这意味着它只有在定义的延迟过期后才可用于消费。它还支持提供消息变得可用于消费的确切日期和时间。这对于使用延迟消息调度任务非常有用。<br />Pulsar 客户端利用该功能提供具有指数退避的客户端重试。",

      supportsLargeNumberOfConnectedConsumers: "支持大量连接的消费者",
      supportsLargeNumberOfConnectedConsumersDesc: "支持大量并发连接到主题的消费者，无论分区数量如何。",
      supportsLargeNumberOfConnectedConsumersMore: "通过增加分区数量来扩展对分区主题的消息写入处理。通过增加消费者数量来扩展消息消费，这完全独立于主题中的分区数量。这可以用于无序消费或按键有序消费。",

      easyToOperateCoordinationMetadataStore: "易于操作协调元数据存储",
      easyToOperateCoordinationMetadataStoreDesc: "Zookeeper 只是元数据存储的插件之一。由于系统与 Pulsar 本身分离，因此快速隔离元数据相关问题。允许未来可扩展的元数据存储。",
      easyToOperateCoordinationMetadataStoreMore: "Pulsar 元数据存储是可插拔的，官方支持 Zookeeper 和 etcd，以及未来可能的社区贡献。Zookeeper 和 etcd 是具有超过十年生产经验的坚固产品。<br />这种设计让您快速隔离元数据相关问题，因为系统与 Pulsar 分离。",

      easyToOperate: "易于操作",
      easyToOperateDesc: "内置 REST API 和 CLI 用于管理操作",
      easyToOperateMore: "Pulsar 有内置的 REST API，用于管理操作，如创建主题、删除命名空间等。它还捆绑了一个 Admin CLI，提供了一个易于使用的 REST API 包装器。",

      // More Features section
      flexibleMessageRetention: "灵活的消息保留",
      flexibleMessageRetentionDesc: "按时间、大小或未确认大小",
      topicCompaction: "主题压缩",
      topicCompactionDesc: "只保留相同键消息的最后一个",
      messageDeduplication: "消息去重",
      messageDeduplicationDesc: "生产时实现精确一次",
      transactions: "事务",
      transactionsDesc: "生产和确认为原子操作"
    },
    'en': {
      title: "Pulsar Features",
      subtitle: "The complete platform for messaging and streaming.",
      description: "The combination of features that makes Apache Pulsar more than just a message broker.",
      readyToStart: "Ready to start?",
      exploreDocsDesc: "Explore documentation to get more insights on how pulsar works",
      exploreDocs: "Explore docs",
      seeCaseStudies: "See case studies",
      moreFeatures: "More Features",
      rapidHorizontalScalability: "Rapid Horizontal Scalability",
      rapidHorizontalScalabilityDesc: "Scales horizontally to handle the increased load. Its unique design and separate storage layer enable controlling the sudden surge in traffic by scaling out in seconds.",
      rapidHorizontalScalabilityMore: "Apache Pulsar server - the Broker - does not persist a received message to a file on the local disk. Instead, it writes the message to another system called Apache Bookkeeper - which can be shortly described as a distributed (multiple nodes) append-only virtual-file storage. The message is written to such append-only virtual file, a.k.a. Ledger. This design makes Pulsar's broker stateless; hence upon sudden surge in traffic, it can scale out in seconds - adding more nodes and spreading the topics among them automatically (see load balancer feature below), without any data movement needed in Pulsar.<br />A topic is, in fact, a list of ledgers (virtual append-only files). The active ledger is closed each configurable size/time, and a new one is opened and used.<br />Apache Bookkeeper can also scale out in seconds. When adding nodes, no data movement is required. Since actively written topics keep replacing their active ledger, the new bookkeeper nodes are also selected, as part of a uniform selection process to host new files, hence balancing out the message writes. This means the new nodes help balance the high surge of traffic immediately.",

      lowLatency: "Low-latency, messaging and streaming",
      lowLatencyDesc: "Acknowledge messages individually (RabbitMQ style) or cumulative per partition (i.e., offset-like). Enables use cases such as distributed work queues or order-preserving data streams at massive scales (hundreds of nodes) and low latency (<10ms).",
      lowLatencyMore: "Pulsar offers writing messages to topics and partitioned topics (topics divided into partitions). Messages can be consumed in multiple ways:<br /><ul><li><strong>Streaming:</strong> In order, by partition, and acknowledge them cumulatively (up to a specific message ID for a specific partition), similar to the way Apache Kafka works.</li><li><strong>Messaging:</strong> Out of order, acknowledging each message individually, similar to the way RabbitMQ works. This enables having vast amounts of consumers concurrently regardless of partition count. Perfect for distributed work queues (i.e., jobs) and accelerating machine learning workloads.</li><li><strong>Messaging in-order:</strong> In order, by key. You can have as many consumers as needed concurrently. The broker divides the keys equally between the consumers, and all messages for a particular key will arrive at the same single consumer associated with that key. This preserves the ordering of message processing by key.</li></ul>All of this is supported at very low latency (<10 ms), both for producing messages and end-to-end latency, and large scale (hundreds of nodes) cluster.",

      supportsUpTo1MTopics: "Supports up to 1M topics",
      supportsUpTo1MTopicsDesc: "Pulsar's unique architecture supports up to 1 million topics in a single cluster. Simplify your architecture by avoiding multiplexing multiple streams into a single topic.",
      supportsUpTo1MTopicsMore: "Pulsar persists the messages into a virtual append-only file, a.k.a. Ledger, stored in Apache Bookkeeper (a separate system). Since it's not an active physical file per topic, Pulsar is not constrained by file descriptors limit; hence it allows having up to 1 million topics. This can support unique, simplified architectures or your applications. Compare this with traditional systems, which force you to multiplex many streams into a single topic, making your application cumbersome. The Cogito case study presented at Pulsar Summit is a great example.",

      multiTenancy: "Multi-tenancy as a first-class citizen",
      multiTenancyDesc: "Maintain one cluster for your entire organization using tenants. Control which user has access across data (namespaces/topics) and actions (produce/consume/…).",
      multiTenancyMore: "Tenants in Pulsar exist to divide the data in Pulsar into sections. A tenant holds namespaces which in turn hold topics and Pulsar Functions. Organizations typically give each department/team its tenant, in which they create namespaces per domain they own and topics for the implementation they need for that domain.<br />Tenants are primarily used in combination with the Granular Access Control feature. A tenant has a list of Tenant Admin users who can grant permissions like produce/consume/functions/… on a specific namespace or topic to particular users. Tenants also enable configuring a specific authentication plugin, allowing, for example, to have one tenant authenticate using JWT and another using mTLS.<br />Lastly, a tenant can be restricted to a specific cluster if a Pulsar instance has multiple clusters.<br />Tenants enable departments in an organization to self-service regarding the security of their data and actions on it.",

      automaticLoadBalancing: "Automatic Load Balancing",
      automaticLoadBalancingDesc: "Add or remove nodes and let Pulsar load balance topic bundles automatically. Hot spotted topic bundles are automatically split and evenly distributed across the brokers.",
      automaticLoadBalancingMore: "Pulsar supports automatic load balancing topics across brokers to reach a balanced broker load in CPU, memory, and traffic. This is possible since Pulsar brokers are stateless, hence do not need any data movement when a topic moves between brokers.<br />Since Pulsar supports up to 1 million topics, the unit of balancing is not a topic but a topic bundle (a group of topics selected using hashing). The load balancer moves bundles across brokers, which moves all topics associated with the bundle between brokers.<br />When a bundle is under extreme load, an automatic split occurs to allow balancing the load of that bundle across two bundles, which can go on in succession until a balanced cluster is reached.",

      k8sReady: "K8s Ready (Cloud-native)",
      k8sReadyDesc: "Pulsar was built for the cloud from day one. Both Pulsar and Bookkeeper nodes can scale up quickly as Pulsar is stateless, and Bookkeeper was designed to avoid data reshuffling while still utilizing all newly joined nodes.",
      k8sReadyMore: "<strong>Scale-up is natively supported:</strong><ul><li>The Pulsar broker is stateless (messages are stored in Bookkeeper); hence scaling up is immediate since there is no data move to the new brokers. Pulsar has automatic load balancing, so new nodes will automatically get new topics evenly balanced across the cluster.</li><li>Apache Bookkeeper supports scaling up natively since it doesn't reshuffle data when starting new nodes. A topic in Pulsar is a chain of ledgers, where the last one is the active one. The active ledger is rotated quite rapidly, which means the new Bookkeeper nodes will almost immediately share the load of incoming messages.</li></ul>Pulsar comes bundled with k8s helm charts, which contains all the components needed to operate: Pulsar brokers, Bookkeeper, Zookeeper, Function Workers, and more.",

      seamlessGeoReplication: "Seamless Geo-Replication",
      seamlessGeoReplicationDesc: "Protect against complete zone outages using replication across different geographic regions. Flexible and configurable replication strategies across distant Pulsar Clusters. Uniquely supports automatic client failover to healthy clusters.",
      seamlessGeoReplicationMore1: "Pulsar supports the notion of a Pulsar Instance: A set of Pulsar Clusters, each aware of each other due to a single global metadata store (i.e., ZK). You define a replication policy between the clusters: active-standby, active-active, and more. This allows you to have each cluster in a different region, achieving geo-replication out of the box. It provides you with data redundancy and disaster recovery.",
      seamlessGeoReplicationMore2: "The cluster replicates the data (messages) and the subscription (consumer acknowledgment state).<br />If that's not enough, Pulsar clients support automatic failover. If it detects that the primary cluster (using a designated URL to check that) is down, it automatically fails over to the secondary cluster. Since the data and consumption state (subscription) is replicated, you simply pick up where you left off on the primary cluster.",

      officialMultiLanguageSupport: "Official multi-language support",
      officialMultiLanguageSupportDesc: "Officially maintained Pulsar Clients for Java, Go, Python, C++, Node.js, and C#.",
      officialMultiLanguageSupportMore: "Pulsar has officially maintained Clients for Java, Go, Python, C++, Node.js, and C#. The details and a feature matrix comparing which feature is supported for each language can be found on the Clients' documentation page.<br />There are also unofficial clients developed by 3rd parties, such as native Node.js client, .NET, Haskell, PHP, Rust, and Scala.",

      tieredStorage: "Tiered storage support for unlimited retention (S3/GCS/…)",
      tieredStorageDesc: "Unlimited retention by seamless data offloading from Bookkeeper to blob storage (e.g., S3). Keep high performance with resiliency by keeping warm data both in Bookeeper and S3.",
      tieredStorageMore: "A pulsar topic is a list of ledgers (as explained above). Only the latest ledger is considered open for writing; the other ledgers are closed - i.e., immutable.<br />Pulsar supports offloading those immutable ledgers into Tiered Storage such as S3, GCS, Azure BlobStore, and more. You can optionally configure how long to retain the ledgers in Bookkeeper after they have been offloaded successfully.<br />This feature allows you to have unlimited retention at a low cost.<br />Pulsar seamlessly switches between reading from Bookkeeper or a tiered storage system based on the ledger location, making it transparent to the client. It's perfect for offloading \"cold\" data into a low-cost system, as it is assumed this data will be accessed less frequently and demand less read performance (due to the nature of tiered storage systems).",

      builtInSchemaRegistry: "Built-in Schema Registry",
      builtInSchemaRegistryDesc: "Support validating incoming and outgoing data against a topic schema. Future proof by supporting backward and forward compatibility checks for each new schema version.",
      builtInSchemaRegistryMore: "Pulsar has a built-in schema registry. This provides the ability to specify a schema for the messages stored in a topic. The registry supports evolving the schema with baked-in forward and backward compatibility checks to prevent making grave mistakes when producing or consuming messages with incompatible schema.<br />Several schema languages are supported, including Avro and Protobuf.",

      granularAccessControl: "Granular Access Control",
      granularAccessControlDesc: "Pulsar supports user authentication with the ability to set access to specific namespaces or topics with limited permissions (consume, produce, etc.)",
      granularAccessControlMore: "Pulsar has the notion of users and a list of permissions they each have for a given namespace or topic. There is a configured list of users assigned the unique role of Super Admin, granting them access to everything. Each tenant has such a list for the role of Tenant Admin, giving users the ability to grant permissions for namespaces and topics contained within the tenant.<br />The permissions include: producing messages, consuming messages, running functions, and installing connectors, sinks, or sources.<br />This enables an organization to empower teams to self-manage access to their application's data (typically contained within a tenant).",

      guaranteedMessagePersistency: "Guaranteed message persistency",
      guaranteedMessagePersistencyDesc: "Pulsar writes to Bookkeeper are guaranteed to be written to disk (a.k.a fsync), providing high resiliency to machine failures. It can be disabled to favor higher throughput.",
      guaranteedMessagePersistencyMore: "When Pulsar receives a message, it writes it to Bookkeeper using its client, which writes to 3 Bookkeeper nodes in parallel by default. The write is considered a success only if 2 Bookkeeper nodes write it successfully. Only then Pulsar acknowledge the write to the client.<br />Bookkeeper, by default, writes the message to the disk, into a write-ahead-log called a journal, then to the memory, and only then reports the write as a success back to the client. The vital feature of Bookkeeper is that it ensures the write to disk has been flushed (written to the disk guaranteed - a.k.a. fsync) before considering the write as a success. Performance is regarded by calling the expensive fsync operation once per batch of messages.<br />This default behavior is perfect for cases where you simply can't lose a written message. You can turn it off and thereby gain a performance gain and rely on the other replica to survive, while a Bookkeeper \"repair\" mechanism fixes the other replicas in the background.",

      separateComputeFromStorage: "Separate Compute from Storage",
      separateComputeFromStorageDesc: "Choose the best instance types for storage and CPU separately due to Pulsar's unique architecture. Support massive parallel query engines by a direct read from Bookkeeper.",
      separateComputeFromStorageMore: "Pulsar has a built-in framework called Pulsar IO, which simplifies authoring and executing Connectors, which enables reading data from a third-party system into a Pulsar topic or writing messages stored in Pulsar topics to a third-party system.<br /><br />Pulsar has several officially maintained connectors of popular 3rd parties: MySQL, Elasticsearch, Cassandra, and more. The complete list is available here.<br /><br />Pulsar IO was written on top of Pulsar Functions, so a Connector (be it Sink or Source) is a Pulsar Function. The connector runs using Pulsar Function Worker based on the runtime chosen (thread, process, or K8s pod). This means it also supports parallelism (increasing the number of instances running the connector and dividing the work among them).",

      builtToSupportAdditionalProtocols: "Built to support additional protocols (Kafka, RabbitMQ, …)",
      builtToSupportAdditionalProtocolsDesc: "Use popular messaging system clients with Pulsar as the backend, powered by community plugins: Kafka, RabbitMQ, and more. This facilitates moving to Pulsar gradually.",
      builtToSupportAdditionalProtocolsMore: "Pulsar has many plugin types, among them one called Protocol Handler. It allows adding additional messaging protocols to the existing Pulsar binary protocol. The plugin is in charge of reading the data from the socket, and translating it to Pulsar commands, such as writing a message, listing a topic, etc.<br /><br />This has allowed the community to develop support for additional protocols which are widely adopted, such as AMQP, Kafka, RabbitMQ, RocketMQ, and MQTT. See this page for a listing of existing community protocol handlers. This enabled working, for example, with the Kafka client or RabbitMQ client but with Pulsar as the backend system.",

      serverlessFunctions: "Serverless Functions",
      serverlessFunctionsDesc: "Write and deploy functions natively using Pulsar Functions. Process messages using Java, Go, or Python without deploying fully-fledged applications. Kubernetes runtime is bundled.",
      serverlessFunctionsMore: "Pulsar is great for ingesting messages, consuming them in various ways, and retaining them for your desired duration. People often write a fully-fledged application to consume and run complex logic on them. On some occasions, you need a simple transformation to the messages. You can roll your own app for it or use a stream processing tool like Spark, Flink, etc. Both are overkill: Rolling an app for a minor message modification still requires writing a lot of plumbing code, while rolling Spark / Flink requires lots of knowledge of those systems and time to maintain them.<br /><br />Pulsar offers a lightweight stream processing framework called Pulsar Functions. It enables you to author a function in a single file in Java, Go, or Python and deploy it to Pulsar Functions, which runs that function for you. Functions will run on each message in the topic defined and have the option to write a message on any topic. It's perfect for simple message transformations: Read a message from a topic, transform it, and write it to another topic. It's also been used for various bigger tasks, such as ML training.<br /><br />Pulsar Functions support parallelism by allowing you to specify how many instances of the function it will run. It has a unique process for coordinating and executing those functions called Pulsar Function Worker. It supports running functions in a thread, a dedicated process, or a pod in K8s.",

      official3rdPartyConnectors: "Official 3rd party Connectors",
      official3rdPartyConnectorsDesc: "Write and deploy functions natively using Pulsar Functions. Process messages using Java, Go, or Python without deploying fully-fledged applications. Kubernetes runtime is bundled.",
      official3rdPartyConnectorsMore: "Pulsar has a built-in framework called Pulsar IO, which simplifies authoring and executing Connectors, which enables reading data from a third-party system into a Pulsar topic or writing messages stored in Pulsar topics to a third-party system.<br /><br />Pulsar has several officially maintained connectors of popular 3rd parties: MySQL, Elasticsearch, Cassandra, and more. The complete list is available here.<br /><br />Pulsar IO was written on top of Pulsar Functions, so a Connector (be it Sink or Source) is a Pulsar Function. The connector runs using Pulsar Function Worker based on the runtime chosen (thread, process, or K8s pod). This means it also supports parallelism (increasing the number of instances running the connector and dividing the work among them).",

      supportVeryLargeMessages: "Support very large messages.",
      supportVeryLargeMessagesDesc: "Very large messages are welcomed in Pulsar, using client-side chunking.",
      supportVeryLargeMessagesMore: "A large message is not rejected. Instead, Pulsar clients support chunking: very large messages are split into chunks, which are assembled back into the original message by the consumer (part of the Pulsar client).",

      delayedMessaging: "Delayed messaging",
      delayedMessagingDesc: "Write a message with a given delay before it is available for consumption. Great for scheduled tasks and exponential back-off retries.",
      delayedMessagingMore: "Pulsar supports writing a message with a given delay, which means it will be available for consumption only after the delay defined expires. It also supports providing an exact date and time for the message to become available for consumption. This is great for scheduling a task using a delayed message.<br />Pulsar clients utilize that feature to provide client-side retry with exponential back-off.",

      supportsLargeNumberOfConnectedConsumers: "Supports a Large Number of Connected Consumers",
      supportsLargeNumberOfConnectedConsumersDesc: "Supports a large number of concurrently connected consumers to a topic, regardless of partition count.",
      supportsLargeNumberOfConnectedConsumersMore: "Scale up the handling of writes of messages to a partitioned topic by increasing the number of partitions. Scale up consumption of messages by increasing the number of consumers, which is entirely independent of the number of partitions in a topic. This can be done both for out-of-order consumption or ordered-by-message-key consumption.",

      easyToOperateCoordinationMetadataStore: "Easy to operate Coordination Metadata store",
      easyToOperateCoordinationMetadataStoreDesc: "Zookeeper is just one of the plugins for the metadata store. Quickly isolate metadata-related issues as the system is separated from Pulsar itself. Allows future scalable metadata stores.",
      easyToOperateCoordinationMetadataStoreMore: "Pulsar Metadata stores are pluggable, with official support for Zookeeper and etcd, and potentially future community contributions. Zookeeper and etcd are rock-solid products with over a decade of production experience.<br />This design lets you quickly isolate metadata-related issues as the system is separated from Pulsar.",

      easyToOperate: "Easy to Operate",
      easyToOperateDesc: "Built-in REST API and CLI for administrative operations",
      easyToOperateMore: "Pulsar has a built-in REST API for administrative operations such as creating topics, deleting namespace, and more. It is also bundled with an Admin CLI providing an easy-to-use wrapper on top of the REST API.",

      flexibleMessageRetention: "Flexible message retention",
      flexibleMessageRetentionDesc: "By time, size, or unacknowledge size",
      topicCompaction: "Topic compaction",
      topicCompactionDesc: "Keep only the last of the same key messages.",
      messageDeduplication: "Message deduplication",
      messageDeduplicationDesc: "Achieve Exactly Once when producing.",
      transactions: "Transactions",
      transactionsDesc: "Produce and acknowledge as an atomic operation"
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  const cards: CardProps[] = [
    {
      className: s.RapidHorizontalScalabilityCard,
      rightContent: (
        <div className={s.RapidHorizontalScalabilityCardMainContent}>
          <h3>{t('rapidHorizontalScalability')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('rapidHorizontalScalabilityDesc') }} />
        </div>
      ),
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('rapidHorizontalScalabilityMore') }} />
        )
      }
    },
    {
      className: s.LowLatencyCard,
      leftContent: (
        <div className={s.LowLatencyCardMainContent}>
          <h3>{t('lowLatency')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('lowLatencyDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        bottomContent: (
          <div>
            <p className={s.LowLatencyCardSingleColumn} style={{ marginBottom: '2rem', marginTop: '2rem'}}>
              Pulsar offers writing messages to topics and partitioned topics (topics divided into partitions). Messages can be consumed in multiple ways:
            </p>
            <div className={s.LowLatencyCardSingleColumn}>
              <ul>
                <li>
                  <p className={s.SmallText}><a href='https://pulsar.apache.org/docs/4.0.x/concepts-messaging/#failover--partitioned-topics' target='_blank' title='Streaming'>Streaming:</a> In order, by partition, and acknowledge them cumulatively (up to a specific message ID for a specific partition), similar to the way Apache Kafka works.</p>
                </li>
                <li style={{ paddingTop: '2rem'}}>
                  <p className={s.SmallText}><a href='https://pulsar.apache.org/docs/4.0.x/concepts-messaging/#shared' target='_blank' title='Messaging'>Messaging:</a> Out of order, acknowledging each message individually, similar to the way RabbitMQ works. This enables having vast amounts of consumers concurrently regardless of partition count. Perfect for distributed work queues (i.e., jobs) and accelerating machine learning workloads.</p>
                </li>
                <li style={{ paddingTop: '2rem' }}>
                  <p className={s.SmallText}><a href='https://pulsar.apache.org/docs/4.0.x/concepts-messaging/#key_shared' target='_blank' title='Messaging in-order'>Messaging in-order:</a> In order, by key. You can have as many consumers as needed concurrently. The broker divides the keys equally between the consumers, and all messages for a particular key will arrive at the same single consumer associated with that key. This preserves the ordering of message processing by key.</p>
                </li>
              </ul>
            </div>
            <div className={s.LowLatencyCardSingleColumn} style={{ marginTop: '2rem', paddingBottom: '7rem'}}>
              <p className={s.SmallText}>
                All of this is supported at very low latency (&lt;10 ms), both for producing messages and end-to-end latency, and large scale (hundreds of nodes) cluster.
              </p>
            </div>
          </div>
        )
      }
    },
    {
      className: s.SupportManyTopicsCard,
      leftContent: (
        <div className={s.SupportManyTopicsCardMainContent}>
          <h3>{t('supportsUpTo1MTopics')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('supportsUpTo1MTopicsDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        leftContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('supportsUpTo1MTopicsMore') }} />
        )
      }
    },
    {
      className: s.MultiTenancyCard,
      leftContent: (
        <div>
          <h3 className={s.MultiTenancyCardHeader}>{t('multiTenancy')}</h3>
          <p className={s.MultiTenancyCardFirstParagraph} dangerouslySetInnerHTML={{ __html: t('multiTenancyDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        leftContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('multiTenancyMore') }} />
        )
      }
    },
    {
      className: s.LoadBalancingCard,
      leftContent: (
        <div className={s.LoadBalancingCardMainContent}>
          <h3>{t('automaticLoadBalancing')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('automaticLoadBalancingDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        leftContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('automaticLoadBalancingMore') }} />
        )
      }
    },
    {
      className: s.K8sReadyCard,
      leftContent: (
        <div>
          <h3>{t('k8sReady')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('k8sReadyDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        bottomContent: (
          <div className={s.K8sReadyCardMore}>
            <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('k8sReadyMore') }} />
          </div>
        )
      }
    },
    {
      className: s.GeoReplicationCard,
      leftContent: (
        <div className={s.GeoReplicationCardMain}>
          <h3>{t('seamlessGeoReplication')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('seamlessGeoReplicationDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        bottomContent: (
          <div className={s.GeoReplicationCardColumns}>
            <div>
              <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('seamlessGeoReplicationMore1') }} />
            </div>
            <div>
              <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('seamlessGeoReplicationMore2') }} />
            </div>
          </div>
        )
      }
    },
    {
      className: s.LanguagesCard,
      leftContent: (
        <div className={s.LanguagesCardMain}>
          <h3>{t('officialMultiLanguageSupport')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('officialMultiLanguageSupportDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        bottomContent: (
          <div className={s.LanguagesCardMore}>
            <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('officialMultiLanguageSupportMore') }} />
          </div>
        )
      }
    },
    {
      className: s.TieredStorageCard,
      leftContent: <h3>{t('tieredStorage')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('tieredStorageDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('tieredStorageMore') }} />
        )
      }
    },
    {
      className: s.SchemaRegistryCard,
      leftContent: <h3>{t('builtInSchemaRegistry')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('builtInSchemaRegistryDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('builtInSchemaRegistryMore') }} />
        )
      }
    },
    {
      className: s.AccessControlCard,
      leftContent: <h3>{t('granularAccessControl')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('granularAccessControlDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('granularAccessControlMore') }} />
        )
      }
    },
    {
      className: s.MessagePersistencyCard,
      leftContent: <h3>{t('guaranteedMessagePersistency')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('guaranteedMessagePersistencyDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('guaranteedMessagePersistencyMore') }} />
        )
      }
    },
    {
      className: s.SeparateComputeFromStorageCard,
      leftContent: (
        <div className={s.SeparateComputeFromStorageCardMain}>
          <h3>{t('separateComputeFromStorage')}</h3>
          <p style={{ marginBottom: '2rem' }} dangerouslySetInnerHTML={{ __html: t('separateComputeFromStorageDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        leftContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('separateComputeFromStorageMore') }} />
        )
      }
    },
    {
      className: s.AdditionalProtocolsCard,
      leftContent: <h3>{t('builtToSupportAdditionalProtocols')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('builtToSupportAdditionalProtocolsDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('builtToSupportAdditionalProtocolsMore') }} />
        )
      }
    },
    {
      className: s.ServerlessFunctionsCard,
      rightContent: (
        <div className={s.ServerlessFunctionsCardMainContent}>
          <h3>{t('serverlessFunctions')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('serverlessFunctionsDesc') }} />
        </div>
      ),
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('serverlessFunctionsMore') }} />
        )
      }
    },
    {
      className: s.ConnectorsCard,
      leftContent: (
        <div className={s.ConnectorsCardMainContent}>
          <h3>{t('official3rdPartyConnectors')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('official3rdPartyConnectorsDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        leftContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('official3rdPartyConnectorsMore') }} />
        )
      }
    },
    {
      className: s.SupportLargeMsgsCard,
      leftContent: (
        <div className={s.SupportLargeMsgsCardMain}>
          <h3>{t('supportVeryLargeMessages')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('supportVeryLargeMessagesDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        leftContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('supportVeryLargeMessagesMore') }} />
        )
      }
    },
    {
      className: s.DelayedMsgCard,
      leftContent: (
        <div className={s.DelayedMsgCardMain}>
          <h3>{t('delayedMessaging')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('delayedMessagingDesc') }} />
        </div>
      ),
      showMore: {
        position: 'left',
        leftContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('delayedMessagingMore') }} />
        )
      }
    },
    {
      className: s.LargeConnectedCard,
      leftContent: <h3>{t('supportsLargeNumberOfConnectedConsumers')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('supportsLargeNumberOfConnectedConsumersDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('supportsLargeNumberOfConnectedConsumersMore') }} />
        )
      }
    },
    {
      className: s.Easy2OperateCard,
      leftContent: <h3>{t('easyToOperateCoordinationMetadataStore')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('easyToOperateCoordinationMetadataStoreDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('easyToOperateCoordinationMetadataStoreMore') }} />
        )
      }
    },
    {
      className: s.EasyCard,
      leftContent: <h3>{t('easyToOperate')}</h3>,
      rightContent: <p dangerouslySetInnerHTML={{ __html: t('easyToOperateDesc') }} />,
      showMore: {
        position: 'right',
        rightContent: (
          <p className={s.SmallText} dangerouslySetInnerHTML={{ __html: t('easyToOperateMore') }} />
        )
      }
    },
  ];

  return (
    <Layout
      title={t('title')}
      description={t('description')}
    >
      <div className={s.FeaturesPage}>
        <div className={s.Cards}>
          <section className={s.Intro}>
            <h1 className={s.IntroTextA}>
              {t('title')}
            </h1>
            <h2 className={s.IntroTextB}>
              {t('subtitle')}
            </h2>
            <p className={s.IntroTextC}>
              {t('description')}
            </p>
          </section>

          {cards.map((card, i) => (
            <div key={i} className={s.Card}>
              <Card {...card} />
            </div>
          ))}
        </div>
        <section className={s.MoreFeats}>
          <div className={s.MoreFeatsChild}>
            <h2>{t('moreFeatures')}</h2>
            <div className={s.MoreFeatsGrandChild}>
              <div className={s.FlexibleMessageContent}>
                <p><strong>{t('flexibleMessageRetention')}</strong><br />
                {t('flexibleMessageRetentionDesc')}</p>
              </div>
            </div>
            <div className={s.MoreFeatsGrandChild}>
              <div className={s.TopicCompactionContent}>
                <p><strong>{t('topicCompaction')}</strong><br />
                {t('topicCompactionDesc')}</p>
              </div>
            </div>
            <div className={s.MoreFeatsGrandChild}>
              <div className={s.MessageDeduplicationContent}>
                <p><strong>{t('messageDeduplication')}</strong><br />
                {t('messageDeduplicationDesc')}</p>
              </div>
            </div>
            <div className={s.MoreFeatsGrandChild}>
              <div className={s.TransactionsContent}>
                <p><strong>{t('transactions')}</strong><br />
                {t('transactionsDesc')}</p>
              </div>
            </div>
          </div>
        </section>
        <section className={s.LinkBarFooter}>
          <div>
            <div className={s.LinkBarFooterLeft}>
              <p>
                <strong>{t('readyToStart')}</strong><br />
                {t('exploreDocsDesc')}
              </p>
            </div>
            <div className={s.LinkBarFooterRight}>
              <div>
                <Button
                  title={t('exploreDocs')}
                  variant='negativefull'
                  href={`/docs/${latestVersion}`}
                />
              </div>
              <div>
                <Button
                  title={t('seeCaseStudies')}
                  variant='action'
                  href='/case-studies'
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default FeaturesPage;