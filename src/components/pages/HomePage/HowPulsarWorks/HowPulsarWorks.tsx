import React from 'react';
import s from './HowPulsarWorks.module.css'
import ScreenTitle from '../ui/ScreenTitle/ScreenTitle';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// SVGO breaks the illustration. To fix it, we import it as is.
import illustrationDesktop from '!!raw-loader!./img/illustration-desktop.svg';
import illustrationMobile from '!!raw-loader!./img/illustration-mobile.svg';

import BookkeeperIcon from './img/bookkeeper.svg';
import BrokersIcon from './img/brokers.svg';
import ZookeeperIcon from './img/zookeeper.svg';
import ProducerAndConsumerIcon from './img/producer-and-consumer.svg';
import Slider from '@site/src/components/ui/Slider/Slider';

const HowPulsarWorks: React.FC = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      howDoesPulsarWork: "Pulsar 如何工作",
      producerAndConsumer: "生产者和消费者",
      apacheZookeeper: "Apache Zookeeper",
      pulsarBrokers: "Pulsar 代理",
      apacheBookkeeper: "Apache Bookkeeper"
    },
    'en': {
      howDoesPulsarWork: "How does Pulsar work",
      producerAndConsumer: "Producer & Consumer",
      apacheZookeeper: "Apache Zookeeper",
      pulsarBrokers: "Pulsar Brokers",
      apacheBookkeeper: "Apache Bookkeeper"
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  const cards: CardProps[] = [
    {
      title: t('producerAndConsumer'),
      image: <ProducerAndConsumerIcon />,
      children: (
        <p>
          Pulsar 客户端包含消费者和生产者。
          生产者在主题上写入消息。
          消费者从主题读取消息并确认特定消息或直到特定消息的所有消息。
        </p>
      )
    },
    {
      title: t('apacheZookeeper'),
      image: <ZookeeperIcon />,
      children: (
        <p>
          Pulsar 和 BookKeeper 使用 Apache ZooKeeper 保存节点间协调的元数据，
          例如每个主题的账本列表、每个账本的段以及主题束到代理的映射。
          它是一个高可用和复制服务器集群（通常 3 个）。
        </p>
      )
    },
    {
      title: t('pulsarBrokers'),
      image: <BrokersIcon />,
      children: (
        <p>
          主题（即分区）在 Pulsar 代理之间分配。
          代理接收主题的消息并将它们附加到主题的活动虚拟文件（即账本），
          托管在 BookKeeper 集群上。代理从缓存（大部分）或 BookKeeper 读取消息并将其分发给消费者。
          代理还接收消息确认并将其持久化到 BookKeeper 集群。
          代理是无状态的（不使用/需要磁盘）。
        </p>
      )
    },
    {
      title: t('apacheBookkeeper'),
      image: <BookkeeperIcon />,
      children: (
        <p>
          Apache BookKeeper 是一个称为 bookie 的节点集群。
          每个虚拟文件（即账本）被分成连续的段，每个段默认保存在 3 个 bookie 上
          （由客户端复制 - 即代理）。
          操作员可以快速添加 bookie，因为不需要在它们之间进行数据重新分片（移动）。
          它们立即共享传入的写入负载。
        </p>
      )
    }
  ];

  return (
    <section className={s.HowPulsarWorks}>
      <div className={s.Container}>
        <ScreenTitle>{t('howDoesPulsarWork')}</ScreenTitle>

        <div dangerouslySetInnerHTML={{ __html: illustrationDesktop }} className={s.IllustrationDesktop} />
        <div dangerouslySetInnerHTML={{ __html: illustrationMobile }} className={s.IllustrationMobile} />

        <div className={s.CardsDesktop}>
          {cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </div>

        <div className={s.CardsMobile}>
          <Slider slidesToShow={1}>
            {cards.map((card, i) => {
              return (
                <Card key={i} {...card} />
              )
            })}
          </Slider>
        </div>
      </div>
    </section>
  );
}

type CardProps = {
  title: string;
  image: React.ReactNode;
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = (props) => {
  return (
    <div className={s.Card}>
      <div className={s.CardImage}>
        {props.image}
      </div>
      <h3 className={s.CardTitle}>{props.title}</h3>
      <div className={s.CardContent}>{props.children}</div>
    </div>
  );
}

export default HowPulsarWorks;

