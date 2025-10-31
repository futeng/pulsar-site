import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import type {Props} from '@theme/BlogLayout';

import s from './index.module.css';

export default function BlogLayout(props: Props): JSX.Element {
  const { i18n } = useDocusaurusContext();
  // @ts-ignore
  const {header, sidebar, toc, children, ...layoutProps} = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

  const translations = {
    'zh-cn': {
      title: "博客",
      description: "了解最新版本发布，探索新功能，发现即将举行的活动，并通过Apache Pulsar博客上的文章获得见解。"
    },
    'en': {
      title: "Blog",
      description: "Read about the latest releases, explore new features, discover upcoming events, and gain insights through articles on the Apache Pulsar Blog."
    }
  };

  const t = (key: string) => translations[i18n.currentLocale]?.[key] || translations['en'][key];

  return (
    <Layout {...layoutProps}>
      <div className="container margin-top--lg">
        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main
            className={clsx('col', {
              'col--7': hasSidebar,
              'col--12': !hasSidebar,
            })}
            itemScope
            itemType="https://schema.org/Blog">
            {header &&
              <section className={s.BlogHeader}>
                <h1>{t('title')}</h1>
                <p>{t('description')}</p>
              </section>
            }
            {children}
          </main>
          {toc && <div className="col col--2">{toc}</div>}
        </div>
      </div>
    </Layout>
  );
}
