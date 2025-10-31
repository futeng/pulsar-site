import React, { useState } from "react";
import Layout from "@theme/Layout";
import Cards from "./Cards/Cards";
import * as data from '@site/data/ecosystem';
import Input from "@site/src/components/ui/Input/Input";
import Select from "@site/src/components/ui/Select/Select";
import Page from "@site/src/components/ui/Page/Page";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import s from './EcosystemPage.module.css';
import ContributeDataDrivenPage from "../../ui/ContributeDataDrivenPage/ContributeDataDrivenPage";

type CategoryFilterOption = data.Category | 'any';
const categoryFilterOptions = ['any', ...data.categories] as const;

const EcosystemPage: React.FC = () => {
  const { i18n } = useDocusaurusContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilterOption>('any');

  const translations = {
    'zh-cn': {
      title: "生态系统",
      description: "了解 Apache Pulsar 生态系统和扩展工具",
      header: "生态系统",
      description1: (
        <>
          为了构建更好的流数据管道和事件驱动应用程序，您可以使用 Pulsar 的强大扩展，包括{" "}
          <a href="/docs/next/io-overview">连接器</a>、协议处理器、工具等。此外，您可以使用{" "}
          <a href="/docs/next/client-libraries">客户端库</a>开发应用程序。
        </>
      ),
      description2: (
        <>
          此页面列出了内置和第三方工具。请注意，一些第三方工具未经社区充分测试，可能无法按预期工作。我们只接受具有{" "}
          <a href="https://opensource.org/licenses" target="_blank" rel="noopener noreferrer">
            OSI 批准许可证
          </a>{" "}
          的开源组件。
        </>
      ),
      allCategories: "所有分类",
      search: "搜索",
      categoryLabels: {
        client_api: '客户端 API',
        client_wrapper: '客户端包装器',
        database_integration: '数据库集成',
        io: 'IO',
        logging: '日志',
        observability: '可观测性',
        protocol_handlers: '协议处理器',
        search_and_query: '搜索和查询',
        security_plugins: '安全插件',
        stream_processing: '流处理',
        tools: '工具'
      }
    },
    'en': {
      title: "Ecosystem",
      description: "Learn about the basics of using Apache Pulsar",
      header: "Ecosystem",
      description1: (
        <>
          To build better streaming data pipelines and event-driven applications, you can use the powerful extensions to Pulsar, including{" "}
          <a href="/docs/next/io-overview">connectors</a>, protocol handlers, tools, and more. Additionally, you can develop applications using{" "}
          <a href="/docs/next/client-libraries">client libraries</a>.
        </>
      ),
      description2: (
        <>
          This page lists both built-in and third-party tools. Note that some of the third-party tools were not tested thoroughly by the community, and may not work as expected. We only accept open source components with{" "}
          <a href="https://opensource.org/licenses" target="_blank" rel="noopener noreferrer">
            OSI approved licenses
          </a>
          .
        </>
      ),
      allCategories: "All Categories",
      search: "Search",
      categoryLabels: data.categoryLabels
    }
  };

  const t = (key: string) => translations[i18n.currentLocale]?.[key] || translations['en'][key];

  return (
    <Layout
      title={t('title')}
      description={t('description')}
      wrapperClassName="LandingPage"
    >
      <Page>
        <section className={s.Header}>
          <h1>{t('header')}</h1>
          <p>{t('description1')}</p>
          <p>{t('description2')}</p>
          <ContributeDataDrivenPage />
        </section>

        <section>
          <form>
            <div className={s.Filters}>
              <Select<data.Category | 'any'>
                value={categoryFilter}
                onChange={setCategoryFilter}
                list={categoryFilterOptions.map((option) => ({
                  type: 'item',
                  value: option,
                  title: option === 'any' ? t('allCategories') : t('categoryLabels')[option]
                }))}
              />

              <Input placeholder={t('search')} value={searchQuery} onChange={setSearchQuery} clearable />
            </div>

            <div>
              {categoryFilter === 'any' && <Cards search={searchQuery} resources={Object.values(data.resources).flat()} />}
              {data.categories.map((category) => {
                if (categoryFilter === category) {
                  return <Cards key={category} search={searchQuery} resources={data.resources[category]} />
                }
              })}
            </div>
          </form>
        </section>
      </Page>
    </Layout>
  );
}

export default EcosystemPage;
