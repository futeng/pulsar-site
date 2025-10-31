import React, { useState } from "react";
import Layout from "@theme/Layout";
import Cards from "./Cards/Cards";
import * as data from '@site/data/resources';
import Page from "@site/src/components/ui/Page/Page";
import s from './PresentationsPage.module.css';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const categoryFilterOptions = [...data.categories] as const;

const PresentationsPage: React.FC = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      title: "演示文稿",
      description: "了解使用 Apache Pulsar 的基础知识",
      header: "演示文稿",
      description: "查找 Apache Pulsar 教程、操作指南和其他技术内容。"
    },
    'en': {
      title: "Presentations",
      description: "Learn about the basics of using Apache Pulsar",
      header: "Presentations",
      description: "Find Apache Pulsar tutorials, how-tos and other technical content."
    }
  };

  const t = (key: string) => translations[i18n.currentLocale]?.[key] || translations['en'][key];

  return (
    <Layout
      title={t('title')}
      description={t('description')}
    >
      <Page>
        <div className={s.TopBlock}>
          <section className={s.Header}>
            <h1>{t('header')}</h1>
            <p>
              {t('description')}
            </p>
          </section>
        </div>
        <section>
            <div>
              <Cards key={'presentations'} resources={data.resources['presentations']} />
            </div>
        </section>
      </Page>
    </Layout>
  );
}

export default PresentationsPage;
