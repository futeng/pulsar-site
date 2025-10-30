import React, { useEffect } from 'react';
import s from './UseCasesPage.module.css';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import cases from '@site/data/usecases';
import Case, { CaseProps } from './Case/Case';

const UseCasesPage: React.FC = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      title: "Pulsar 用例",
      description: "独特和常见用例的结合使 Pulsar 区别于其他消息中间件。"
    },
    'en': {
      title: "Pulsar Use Cases",
      description: "A combination of unique and common use cases sets Pulsar apart from other message brokers."
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  useEffect(() =>{
    const updateSidebarLinks = () => {
      let currentCase = 0;
      let allcases = document.querySelectorAll('.'+s.UseCasesPageCase);
      let allcaselinks = document.querySelectorAll('.'+s.UseCasesPageCaseLink);
      if(allcases.length > 0 && allcaselinks.length > 0 && allcaselinks.length == allcases.length){
        allcases.forEach((e,i) => {
          let postop = e.getBoundingClientRect().top
          if(postop < 96) currentCase = i;
        });
        allcaselinks.forEach((e,i) => {
          if(currentCase == i) e.classList.add(s.active);
          else e.classList.remove(s.active)
        });
      }
    }
    window.addEventListener('load', updateSidebarLinks);
    window.addEventListener('scroll', updateSidebarLinks);
  }, [])
  return (
    <Layout
      title={t('title')}
      description={t('description')}
    >
        <div className={s.UseCasesPageHeader}>
          <div>
            <h1>{t('title')}</h1>
            <h2>{t('description')}</h2>
          </div>
        </div>
        <div className={s.UseCasesPage}>
          <div className={s.UseCasesPageSidebar}>
            <div>
              {cases.map((scase, i) => (
                <a href={`#case${i}`} key={i} className={s.UseCasesPageCaseLink}>{scase.title}</a>
              ))}
            </div>
          </div>
          <div className={s.UseCasesPageContent}>
            {cases.map((scase, i) => (
              <div id={`case${i}`} key={i} className={s.UseCasesPageCase}>
                <Case {...scase} />
              </div>
            ))}
          </div>
      </div>
    </Layout>
  );
}

export default UseCasesPage;


