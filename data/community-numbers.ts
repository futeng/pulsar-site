export type CommunityNumber = {
    title: string;
    number: string;
    isLink?: boolean;
    icon?: string;
    link?: string;
    linkTitle?: string;
  };
  
  const communityNumbers: CommunityNumber[] = [
    {
      title: "GitHub",
      number: "14800",
      icon: "img/star.svg",
      isLink: true,
      linkTitle: '查看',
      link: 'https://github.com/apache/pulsar'
    },
    {
        title: "贡献者",
        number: "740",
        linkTitle: '查看',
        link: 'https://github.com/apache/pulsar/graphs/contributors'
    },
    {
        title: "Slack 成员",
        number: "10750",
        linkTitle: '加入',
        link: 'https://communityinviter.com/apps/apache-pulsar/apache-pulsar'
    },
  ];
  
  export default communityNumbers;
  