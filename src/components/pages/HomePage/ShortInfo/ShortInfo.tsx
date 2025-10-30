import React from 'react';

import Button from '@site/src/components/ui/Button/Button';
import Parallax from './Parallax/Parallax';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import s from './ShortInfo.module.css';
import ScreenTitle from '../ui/ScreenTitle/ScreenTitle';

const versions = require("@site/versions.json");
const latestVersion = versions[0];

const ShortInfo: React.FC = () => {
  const { siteConfig, i18n } = useDocusaurusContext();

  const isChineseLocale = i18n.currentLocale === 'zh-cn';

  const translations = {
    'zh-cn': {
      subtitle: "云原生、分布式消息和流平台",
      description: "Apache Pulsar 是一个为云而生的开源分布式消息和流平台。",
      exploreDocs: "探索文档",
      quickstart: "快速入门",
      caseStudies: "Pulsar 在数百个不同规模的公司中得到了大规模验证，每秒处理数百万条消息。",
      seeCaseStudies: "查看案例研究",
      whatIsPulsar: "什么是 Pulsar",
      platformDescription: "Apache Pulsar 是一个全能的消息和流平台。消息可以单独消费和确认，也可以作为流消费，延迟低于 10 毫秒。其分层架构允许快速扩展到数百个节点，而无需重新分片数据。",
      featuresDescription: "其特性包括具有资源分离和访问控制的多租户、跨区域的地理复制、分层存储以及对六种官方客户端语言的支持。它支持多达一百万个独特主题，旨在简化您的应用程序架构。",
      communityDescription: "Pulsar 是 Apache 软件基金会的前 10 项目，拥有充满活力和热情的社区和用户群体，涵盖小公司和大型企业。"
    },
    'en': {
      subtitle: "Cloud-Native, Distributed Messaging and Streaming",
      description: "Apache Pulsar is an open-source, distributed messaging and streaming platform built for the cloud.",
      exploreDocs: "Explore docs",
      quickstart: "Quickstart",
      caseStudies: "Pulsar is proven at scale by hundreds of companies of different sizes, serving millions of messages per second.",
      seeCaseStudies: "See case studies",
      whatIsPulsar: "What is Pulsar",
      platformDescription: "Apache Pulsar is an all-in-one messaging and streaming platform. Messages can be consumed and acknowledged individually or consumed as streams with less than 10ms of latency. Its layered architecture allows rapid scaling across hundreds of nodes, without data reshuffling.",
      featuresDescription: "Its features include multi-tenancy with resource separation and access control, geo-replication across regions, tiered storage and support for six official client languages. It supports up to one million unique topics and is designed to simplify your application architecture.",
      communityDescription: "Pulsar is a Top 10 Apache Software Foundation project and has a vibrant and passionate community and user base spanning small companies and large enterprises."
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  return (
    <section className={`${s.block}`}>
      <div className={`${s.container} ${s.short_container}`}>
        <Parallax>
          <div className={s.docs_container}>
            <h1 className={s.header}>
              <span className={s.title}>Apache Pulsar™</span><br />
              <span className={s.subtitle}>{t('subtitle')}</span>
            </h1>
            <span className={s.text}>{t('description')}</span>

            <div className={s.buttons}>
              <Button
                title={t('exploreDocs')}
                variant='action'
                href={`${siteConfig.baseUrl}docs/${latestVersion}`}
              />
              <Button
                title={t('quickstart')}
                variant='regular'
                href={`${siteConfig.baseUrl}docs/${latestVersion}/concepts-overview`}
              />
            </div>

            <p className={s.case_studies}>
              {t('caseStudies')}
              <br />
              <a href="/case-studies">{t('seeCaseStudies')}</a>
            </p>
          </div>
        </Parallax>
      </div>

      <div className={s.fullsize_container}>
        <div className={s.blur} />

        <div className={s.container}>
          <div className={s.info_container}>
            <ScreenTitle>
              {t('whatIsPulsar')}
            </ScreenTitle>

            <p>
              {t('platformDescription')}
            </p>

            <p>
              {t('featuresDescription')}
            </p>

            <p>
              {t('communityDescription')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShortInfo;
