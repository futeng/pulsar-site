import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Button, { ButtonVariant } from "@site/src/components/ui/Button/Button";
import s from "./DiscussionPlatforms.module.css";
import Slider from '@site/src/components/ui/Slider/Slider';
import BrowserOnly from "@docusaurus/BrowserOnly";

type ActionButtonProps = {
  id: string;
  text: string;
  href: string;
  type: "primary" | "normal" | "link";
  isExternal?: boolean;
};

export type ContentCardProps = {
  title: string;
  description: React.ReactNode;
  image?: {
    src: string;
  };
  actions?: ActionButtonProps[];
};

const ContentCard: React.FC<ContentCardProps> = (props) => {
  return (
    <div className={s.DiscussionPlatformCard}>
      {props.image && (
        <div className={s.DiscussionPlatformCardImage}>
          <img src={props.image.src} />
        </div>
      )}
      <div className={s.DiscussionPlatformCardText}>
        <h3>{props.title}</h3>
        <div>{props.description}</div>
      </div>
      <div className={s.DiscussionPlatformCardActions}>
        {(props.actions || []).map((action) => (
          <ActionButton key={action.id} {...action} />
        ))}
      </div>
    </div>
  );
};

const ActionButton: React.FC<ActionButtonProps> = (props) => {
  if (props.type === "link") {
  }

  let buttonVariant: ButtonVariant;
  switch (props.type) {
    case "primary":
      buttonVariant = "transparentBlack";
      break;
    case "normal":
      buttonVariant = "clean";
      break;
  }

  return (
    <div className={s.ActionButton}>
      <Button
        variant={buttonVariant}
        target={props.isExternal ? "_blank" : undefined}
        href={props.href}
        title={props.text}
      />
    </div>

  );
};

const DiscussionPlatforms: React.FC = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      slackTitle: "Slack",
      slackDesc: "用于即时消息和实时讨论。<br />您可以在 Linen 上搜索 Slack 讨论历史记录。",
      joinSlack: "加入 Slack",
      goToSlack: "前往 Slack",
      showHistory: "显示历史",

      devMailingListTitle: "开发者邮件列表",
      devMailingListDesc: "与 Pulsar 开发相关的问题和讨论。",
      subscribe: "订阅",
      showArchives: "显示存档",

      communityMeetingsTitle: "社区会议",
      communityMeetingsDesc: "社区会议在每两周的周四举行，讨论新提案、开放的拉取请求和主持公开讨论。",
      learnMore: "了解更多",

      githubDiscussionsTitle: "GitHub 讨论",
      githubDiscussionsDesc: "提问、提出想法或获得支持的好地方。特别是如果您不习惯使用邮件列表。",
      newDiscussion: "新讨论",
      browseDiscussions: "浏览讨论",

      stackOverflowTitle: "Stack Overflow",
      stackOverflowDesc: "对于技术问题，我们建议您发布到 Stack Overflow 并使用 apache-pulsar 标签。",
      askQuestion: "提问",
      browseQuestions: "浏览问题",

      userMailingListTitle: "用户邮件列表",
      userMailingListDesc: "用于用户相关讨论的通用邮件列表。",

      wechatTitle: "微信",
      wechatDesc: "欢迎使用微信上的非官方 Apache Pulsar 账号！账号 ID 是 ApachePulsar。",
      goToWechat: "前往微信"
    },
    'en': {
      slackTitle: "Slack",
      slackDesc: "Use it for instant messaging and real-time discussions.<br />You can search the Slack discussions history on Linen.",
      joinSlack: "Join Slack",
      goToSlack: "Go to Slack",
      showHistory: "Show History",

      devMailingListTitle: "Developer Mailing List",
      devMailingListDesc: "Questions and discussions related to Pulsar development.",
      subscribe: "Subscribe",
      showArchives: "Show Archives",

      communityMeetingsTitle: "Community Meetings",
      communityMeetingsDesc: "The community meeting occurs biweekly on Thursdays to discuss new proposals, open pull requests, and host open discussions.",
      learnMore: "Learn More",

      githubDiscussionsTitle: "Discussions at GitHub",
      githubDiscussionsDesc: "A good place to ask any question, bring an idea or get support. Especially if you are not friends with mailing lists.",
      newDiscussion: "New discussion",
      browseDiscussions: "Browse discussions",

      stackOverflowTitle: "Stack Overflow",
      stackOverflowDesc: "For technical questions, we ask that you post them to Stack Overflow using the tag apache-pulsar.",
      askQuestion: "Ask question",
      browseQuestions: "Browse questions",

      userMailingListTitle: "User Mailing List",
      userMailingListDesc: "General mailing list for user-related discussions.",

      wechatTitle: "WeChat",
      wechatDesc: "Welcome to the unofficial Apache Pulsar Account at WeChat! The account ID is ApachePulsar.",
      goToWechat: "Go to WeChat"
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  const platforms: ContentCardProps[] = [
    {
      title: t('slackTitle'),
      description: (
        <span dangerouslySetInnerHTML={{ __html: t('slackDesc') }} />
      ),
      actions: [
        {
          id: "join-slack",
          text: t('joinSlack'),
          href: "https://communityinviter.com/apps/apache-pulsar/apache-pulsar",
          type: "primary",
          isExternal: true,
        },
        {
          id: "launch-slack",
          text: t('goToSlack'),
          href: "https://apache-pulsar.slack.com/",
          type: "normal",
          isExternal: true,
        },
        {
          id: "history-slack",
          text: t('showHistory'),
          href: "https://www.linen.dev/s/apache-pulsar",
          isExternal: true,
          type: "normal",
        },
      ],
      image: {
        src: useBaseUrl("/img/community_sl.svg"),
      },
    },
    {
      title: t('devMailingListTitle'),
      description: (
        <div>{t('devMailingListDesc')}</div>
      ),
      actions: [
        {
          id: "subscribe",
          text: t('subscribe'),
          href: "mailto:dev-subscribe@pulsar.apache.org?subject=subscribe&body=subscribe",
          type: "primary",
        },
        {
          id: "showarchives",
          text: t('showArchives'),
          href: "https://lists.apache.org/list.html?dev@pulsar.apache.org",
          isExternal: true,
          type: "normal",
        },
      ],
      image: {
        src: useBaseUrl("/img/community_email.svg"),
      },
    },
    {
      title: t('communityMeetingsTitle'),
      description: (
        <span>{t('communityMeetingsDesc')}</span>
      ),
      actions: [
        {
          id: "learnmore",
          text: t('learnMore'),
          href: "https://github.com/apache/pulsar/wiki/Community-Meetings",
          type: "primary",
          isExternal: true,
        },
      ],
      image: {
        src: useBaseUrl("/img/community_grp.svg"),
      },
    },
    {
      title: t('githubDiscussionsTitle'),
      description: (
        <div>{t('githubDiscussionsDesc')}</div>
      ),
      actions: [
        {
          id: "new-discussion",
          text: t('newDiscussion'),
          href: "https://github.com/apache/pulsar/discussions/new/choose",
          type: "primary",
          isExternal: true,
        },
        {
          id: "open",
          text: t('browseDiscussions'),
          href: "https://github.com/apache/pulsar/discussions",
          type: "normal",
          isExternal: true,
        },
      ],
      image: {
        src: useBaseUrl("/img/community_gh.svg"),
      },
    },
    {
      title: t('stackOverflowTitle'),
      description: (
        <span>{t('stackOverflowDesc')}</span>
      ),
      actions: [
        {
          id: "as",
          text: t('askQuestion'),
          href: "https://stackoverflow.com/questions/ask?tags=apache-pulsar",
          type: "primary",
          isExternal: true,
        },
        {
          id: "browse",
          text: t('browseQuestions'),
          href: "https://stackoverflow.com/questions/tagged/apache-pulsar",
          type: "normal",
          isExternal: true,
        },
      ],
      image: {
        src: useBaseUrl("/img/community_so.svg"),
      },
    },
    {
      title: t('userMailingListTitle'),
      description: (
        <div>{t('userMailingListDesc')}</div>
      ),
      actions: [
        {
          id: "subscribe",
          text: t('subscribe'),
          href: "mailto:users-subscribe@pulsar.apache.org?subject=subscribe&body=subscribe",
          type: "primary",
        },
        {
          id: "showarchives",
          text: t('showArchives'),
          href: "https://lists.apache.org/list.html?users@pulsar.apache.org",
          isExternal: true,
          type: "normal",
        },
      ],
      image: {
        src: useBaseUrl("/img/community_email.svg"),
      },
    },
    {
      title: t('wechatTitle'),
      description: (
        <span>{t('wechatDesc')}</span>
      ),
      actions: [{
        id: "wechat",
        text: t('goToWechat'),
        href: "https://web.wechat.com/",
        type: "primary",
        isExternal: true,
      }],
      image: {
        src: useBaseUrl("/img/community_wc.svg"),
      },
    },
  ];

  return <div>
    <div className={s.DiscussionPlatformsDesktop}>{(platforms || []).map((card) => (
        <div key={card.title} className={s.Card}>
          <ContentCard {...card} />
        </div>
      ))}</div>
    <div className={s.DiscussionPlatformsMobile}>
      <div className={s.Slider}>
        <BrowserOnly>
          {() => (
            <Slider centerMode={window.innerWidth > 800} slidesToShow={2}>
              {(platforms || []).map((card) => (
                <div key={card.title} className={s.Card}>
                  <ContentCard {...card} />
                </div>
              ))}
            </Slider>
          )}
        </BrowserOnly>
      </div>
    </div>
  </div>;
};

export default DiscussionPlatforms;

