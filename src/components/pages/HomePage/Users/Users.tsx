import React from 'react';
import _ from 'lodash'

import Button from '@site/src/components/ui/Button/Button';
import Slider from '@site/src/components/ui/Slider/Slider';
import testimonials from '@site/data/testimonials';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import Quote from './img/quote.svg';
import s from './Users.module.css';
import ScreenTitle from '../ui/ScreenTitle/ScreenTitle';
import BrowserOnly from '@docusaurus/BrowserOnly';

const Users: React.FC = () => {
  const { siteConfig, i18n } = useDocusaurusContext();
  const shuffledTestimonials = React.useMemo(() => _.shuffle(testimonials), [testimonials]);

  const translations = {
    'zh-cn': {
      pulsarUsers: "Pulsar 用户",
      description: "在生产环境中大规模运行，每秒跨数百万个主题处理数百万条消息，Pulsar 现在被数千家公司用于实时工作负载。",
      seeCaseStudies: "查看案例研究"
    },
    'en': {
      pulsarUsers: "Pulsar Users",
      description: "Run in production at scale with millions of messages per second across millions of topics, Pulsar is now used by thousands of companies for real-time workloads.",
      seeCaseStudies: "See case studies"
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  return (
    <section className={s.block}>
      <div className={s.container}>
        <div className={s.title_container}>
          <ScreenTitle>
            {t('pulsarUsers')}
          </ScreenTitle>

          <span className={s.text}>
            {t('description')}
          </span>

          <div className={s.link_button}>
            <Button
              title={t('seeCaseStudies')}
              variant='regular'
              href={`${siteConfig.baseUrl}case-studies`}
            />
          </div>
        </div>
        <BrowserOnly>
          {() => (
            <Slider centerMode={window.innerWidth > 1000} slidesToShow={2}>
              {Object.values(shuffledTestimonials).flat().map((caseStudy, i) => (
                <div key={i} className={s.slide}>
                  <div className={s.slide_container}>
                    <Quote className={s.quote} />

                    <span className={s.slider_text}>
                      {caseStudy.text}
                    </span>

                    <span className={s.author}>
                      {caseStudy.author}
                    </span>

                    <span className={s.platform}>
                      {caseStudy.company}
                    </span>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </BrowserOnly>
      </div>
    </section>
  )
}

export default Users;
