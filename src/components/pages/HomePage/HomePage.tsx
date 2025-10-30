import React from 'react';

import Layout from "@theme/Layout";
import Features from './Features/Features';
import ShortInfo from './ShortInfo/ShortInfo';
import Users from './Users/Users';
import communityNumbers from "@site/data/community-numbers";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import Slider from '@site/src/components/ui/Slider/Slider';
import BrowserOnly from "@docusaurus/BrowserOnly";

import cases from '@site/data/usecases';
import Button from '@site/src/components/ui/Button/Button';

import s from './HomePage.module.css';
import HowPulsarWorks from './HowPulsarWorks/HowPulsarWorks';

const HomePage = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      pulsarUseCases: "Pulsar 用例",
      useCasesDescription: "独特和常见用例的结合使 Pulsar 区别于其他消息中间件。",
      readMore: "了解更多",
      pulsarTrustedCommunity: "Pulsar 可信社区",
      joinUsAndStartContributing: "加入我们并开始贡献"
    },
    'en': {
      pulsarUseCases: "Pulsar use cases",
      useCasesDescription: "A combination of unique and common use cases sets Pulsar apart from other message brokers.",
      readMore: "Read more",
      pulsarTrustedCommunity: "Pulsar trusted community",
      joinUsAndStartContributing: "Join us and start contributing"
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  const makeiconclass = (iconname) => {
    let icon = '';
    switch(iconname){
      case 'user': icon = s.user; break;
      case 'arrow': icon = s.arrow; break;
      case 'speech': icon = s.speech; break;
      case 'check': icon = s.check; break;
    }
    return icon;
  }

  return (
    <Layout
      title={"Apache Pulsar"}
      description={"Apache Pulsar is an open-source, distributed messaging and streaming platform built for the cloud."}
      wrapperClassName="LandingPage"
    >
      <div className={s.Page}>
        <div className={s.Background}></div>
        <div className={s.FirstScreen}>
          <ShortInfo />
        </div>
        <div className={s.OtherScreens}>
          <Features />
          <HowPulsarWorks />

          <section className={s.UseCases}>
            <div className={s.CommunityContent}>
              <div>
                <h2>{t('pulsarUseCases')}</h2>
                <p>{t('useCasesDescription')}</p>
              </div>
              <div className={s.Slider}>
                <BrowserOnly>
                  {() => (
                    <Slider centerMode={window.innerWidth > 1000} slidesToShow={2} invertMode={true}>
                      {cases.map((scase, i) => (
                        <div key={i} className={s.Slide+' '+s.SlideCommunity}>
                          <div>
                            <div className={makeiconclass(scase.icon)}></div>
                            <h3>{scase.title}</h3>
                            <div className={s.SlideMB}>{scase.smallText}</div>
                            <div>
                                <Button title={t('readMore')} href={'/use-cases#case'+i} variant='transparentBlack' />
                            </div>
                          </div>
                        </div>
                      ))}
                    </Slider>
                  )}
                </BrowserOnly>
              </div>
            </div>
          </section>

          <section className={s.CommunityNumbers}>
            <div className={s.CommunityNumbersBlur} />
            <div className={s.CommunityContent}>
              <div>
                <h2>{t('pulsarTrustedCommunity')}</h2>
                <p>{t('joinUsAndStartContributing')}</p>
              </div>
            </div>
            <div className={s.CommunityContent}>
              <div className={s.CommunityNumbersContainer}>
              {communityNumbers.map((number, i) => (
                <div key={i}>
                  {(number.isLink) ? 
                    <a title={number.linkTitle} href={number.link} target='_blank' className={s.CommunityNumbersBig}>{number.number}{(number.icon) ? <img src={useBaseUrl(number.icon)} /> : <span className={s.CommunityNumbersBigSymbol}>+</span>}</a>
                    :
                    <div className={s.CommunityNumbersBig}>{number.number}{(number.icon) ? <img src={useBaseUrl(number.icon)} /> : <span className={s.CommunityNumbersBigSymbol}>+</span>}</div>
                  }
                  <span className={s.CommunityNumbersBigTitle}>{number.title}</span>
                  {number.linkTitle ? <div className="margin-top--lg"><Button title={number.linkTitle} href={number.link} target='_blank' variant='transparentBlack' /></div> : ''}
                </div>
              ))}
              </div>
            </div>
          </section>

          <Users />
        </div>
      </div>
    </Layout>
  )
}

export default HomePage
