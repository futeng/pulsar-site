export type Testimonial = {
  company: string;
  author: string;
  text: string;
};

const testimonials: Testimonial[] = [
  {
    author: "Greg Methvin",
    company: "Iterable",
    text:
      "Pulsar 的独特之处在于它同时支持流处理和队列用例，还支持丰富的功能集，使其成为我们架构中当前使用的许多其他分布式消息技术的可行替代方案。Pulsar 涵盖了我们对 Kafka、RabbitMQ 和 SQS 的所有用例。这让我们能够专注于围绕单一统一系统构建专业知识和工具。",
  },
  {
    author: "Weisheng Xie",
    company: "Orange Financial",
    text:
      "Pulsar 是构建我们统一数据处理栈的完美选择。与像 Spark 这样的统一计算引擎一起，Apache Pulsar 能够提高我们风险控制决策部署的效率。因此，我们能够为商户和消费者提供安全、便捷和高效的服务。",
  },
  {
    author: "Kirill Merkushev",
    company: "Vivy",
    text:
      "我们考虑的功能包括分层存储，因为我们计划拥有无限保留（对事件溯源非常重要），灵活的订阅模型（我们目前使用独占模式，但我们想尝试按键订阅），通过不同方法的授权，包括证书和 JWT（JSON Web Token），以及简单启动和运行的方式。",
  },
  {
    author: "Jowanza Joseph",
    company: "One Click Retail",
    text:
      "由于 Pulsar 独特的消息和流处理组合，我们能够用一个解决方案替换多个系统，该解决方案在我们的 Kubernetes 环境中无缝工作。",
  },
  {
    author: "Dongliang Jiang",
    company: "Appen China",
    text:
      "Apache Pulsar 在我们的 AI 数据平台中扮演着关键角色，作为数据湖连接所有业务功能并使每个组件解耦。",
  },
  {
    author: "Hang Chen",
    company: "BIGO",
    text:
      "Apache Pulsar 的分层架构和新功能，如具有持久性的低延迟、水平可扩展、多租户等，帮助我们在生产环境中解决了很多问题。我们采用 Apache Pulsar 构建消息处理系统，特别是在实时 ETL、短视频推荐和实时数据报告方面。",
  },
  {
    author: "Rocky Jin",
    company: "EMQ",
    text:
      "Apache Pulsar 为无服务器函数提供原生支持，数据以流式方式在到达时立即处理，并提供灵活的部署选项（线程、进程、容器）。我们只需要专注于计算逻辑，而不是处理复杂的配置或管理，这帮助我们更快更方便地构建流平台。",
  },
  {
    author: "Bin Liu",
    company: "Ksyun",
    text:
      "使用 Pulsar，我们可以轻松扩展分区和合并分区，并处理数百万个主题。",
  },
];

export default testimonials;
