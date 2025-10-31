import React, { useState, useMemo } from "react";
import Layout from "@theme/Layout";
import Cards from "./Cards/Cards";
import * as data from '@site/data/case-studies';
import Input from "@site/src/components/ui/Input/Input";
import Select from "@site/src/components/ui/Select/Select";
import Page from "@site/src/components/ui/Page/Page";
import s from './CaseStudiesPage.module.css';
import ContributeDataDrivenPage from "../../ui/ContributeDataDrivenPage/ContributeDataDrivenPage";
import shuffle from 'lodash/shuffle';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

type CategoryFilterOption = data.Category | 'any';
const categoryFilterOptions = ['any', ...data.categories] as const;

const CaseStudiesPage: React.FC = () => {
  const { i18n } = useDocusaurusContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilterOption>('any');

  const translations = {
    'zh-cn': {
      title: "案例研究",
      description: "了解使用 Apache Pulsar 的基础知识",
      header: "案例研究",
      description: "全球各地的组织依靠 Apache Pulsar 来管理其最严苛的实时需求。",
      allIndustries: "所有行业",
      search: "搜索"
    },
    'en': {
      title: "Case studies",
      description: "Learn about the basics of using Apache Pulsar",
      header: "Case Studies",
      description: "Organizations around the globe rely on Apache Pulsar to manage their most demanding real-time requirements.",
      allIndustries: "All Industries",
      search: "Search"
    }
  };

  const t = (key: string) => translations[i18n.currentLocale]?.[key] || translations['en'][key];

  const shuffledResources = useMemo(
    () => categoryFilter === 'any' ? shuffle(Object.values(data.resources).flat()) : [],
    [data.resources, categoryFilter]
  );

  return (
    <Layout
      title={t('title')}
      description={t('description')}
      wrapperClassName="LandingPage"
    >
      <Page>
        <section className={s.Header}>
          <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: '0'}}>{t('header')}</h1>
          <p>{t('description')}</p>

          <ContributeDataDrivenPage />
        </section>

        <section>
          <form>
            <div className={s.Filters}>
              <Select<CategoryFilterOption>
                value={categoryFilter}
                onChange={setCategoryFilter}
                list={categoryFilterOptions.map((option) => ({
                  type: 'item',
                  value: option,
                  title: option === 'any' ? t('allIndustries') : data.categoryLabels[option]
                }))}
              />

              <Input placeholder={t('search')} value={searchQuery} onChange={setSearchQuery} clearable />
            </div>

            <div>
              {categoryFilter === 'any' && <Cards search={searchQuery} resources={shuffledResources} sort={false}/>}
              {categoryFilter !== 'any' && data.categories.map((category) => {
                if (categoryFilter === category) {
                  return <Cards key={category} search={searchQuery} resources={data.resources[category]} sort={true} />
                }
              })}
            </div>
          </form>
        </section>
      </Page>
    </Layout>
  );
}

export default CaseStudiesPage;
