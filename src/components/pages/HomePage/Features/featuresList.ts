import Scalability from './pictures/scalability.svg';
import MessagingAndStreaming from './pictures/messaging&streaming.svg';
import GeoReplication from './pictures/geoReplication.svg';
import MultiTenancy from './pictures/multiTenancy.svg';
import Balancing from './pictures/balancing.svg';
import MultiLanguage from './pictures/multiLanguage.svg';
import Integrations from './pictures/integrations.svg';
import ServerlessFunctions from './pictures/serverlessFunctions.svg';
import SupportsUp from './pictures/supportsUp.svg';

const featuresList = [
  {
    picture: Scalability,
    title: '快速水平扩展',
    text: '水平扩展以处理增加的负载。其独特的设计和独立的存储层能够在几秒钟内通过扩展来处理突发流量激增。',
    viewBox: '0 0 300 128',
  },
  {
    picture: MessagingAndStreaming,
    title: '低延迟消息和流处理',
    text: '单独确认消息（RabbitMQ 风格）或按分区累积确认（即类似偏移量）。支持分布式工作队列或保序数据流等用例，可在非常大規模（数百个节点）和低延迟（<10ms）下运行。',
    viewBox: '0 0 300 128',
  },
  {
    picture: GeoReplication,
    title: '无缝地理复制',
    text: '使用跨不同地理区域的复制来防止整个区域故障。在远程 Pulsar 集群之间灵活且可配置的复制策略。独特支持自动客户端故障转移到健康集群。',
    viewBox: '0 0 125 128',
  },
  {
    picture: MultiTenancy,
    title: '多租户为一等公民',
    text: '使用租户为整个组织维护一个集群。通过租户策略对数据和操作进行访问控制。在需要最大嘈杂邻居保护时，将特定代理隔离给租户。',
    viewBox: '0 0 250 128',
  },
  {
    picture: Balancing,
    title: '自动负载均衡',
    text: '添加或删除节点，让 Pulsar 自动负载均衡主题束。热点主题束会自动分割并均匀分布在代理之间。',
    viewBox: '0 0 125 128',
  },
  {
    picture: MultiLanguage,
    title: '官方多语言支持',
    text: '官方维护的 Pulsar 客户端支持 Java、Go、Python、C++、Node.js 和 C#。',
    viewBox: '0 0 125 128',
  },
  {
    picture: Integrations,
    title: '官方第三方集成',
    text: 'Pulsar 拥有与流行第三方官方维护的连接器：MySQL、Elasticsearch、Cassandra 等。支持数据流入（源）或流出（接收器）。',
    viewBox: '0 0 125 128',
  },
  {
    picture: ServerlessFunctions,
    title: '无服务器函数',
    text: '使用 Pulsar Functions 原生编写和部署函数。使用 Java、Go 或 Python 处理消息，无需部署完整应用程序。捆绑了 Kubernetes 运行时。',
    viewBox: '0 0 175 128',
  },
  {
    picture: SupportsUp,
    title: '支持多达 100 万个主题',
    text: "Pulsar 独特的架构在单个集群中支持多达 100 万个主题。通过避免将多个流复用到单个主题中来简化您自己的架构。",
    viewBox: '0 0 150 128',
  },
];

export default featuresList;