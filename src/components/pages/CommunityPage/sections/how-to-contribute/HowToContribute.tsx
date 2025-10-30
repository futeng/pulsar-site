import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import React from "react";

import ContentCard, { ContentCardProps } from "../../shared/ContentCard/ContentCard";
import ContentCardsLayout from "../../shared/ContentCard/ContentCardsLayout";

import Slider from '@site/src/components/ui/Slider/Slider';
import BrowserOnly from "@docusaurus/BrowserOnly";

import Button, { ButtonVariant } from "@site/src/components/ui/Button/Button";

import s from "./HowToContribute.module.css";

type ActionButtonProps = {
  id: string;
  text: string;
  href: string;
  type: "primary" | "normal" | "link" | "transparentWhite" | "transparentBlack";
  isExternal?: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = (props) => {
  if (props.type === "link") {
  }

  let buttonVariant: ButtonVariant;
  switch (props.type) {
    case "primary":
      buttonVariant = "action";
      break;
    case "normal":
      buttonVariant = "regular";
      break;
    case "transparentBlack":
      buttonVariant = "transparentBlack";
      break;
    case "transparentWhite":
      buttonVariant = "transparentWhite";
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

const HowToContribute: React.FC = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      contributionGuide: "贡献指南",
      codingConventions: "编码规范",

      contributingToProject: "为项目做贡献",
      contributingToProjectDesc: "Pulsar 有许多不同的贡献机会 — 您可以编写新的示例/教程、添加新的面向用户的库、编写新的 Pulsar IO 连接器、参与文档编写等等。",

      reportingBugs: "报告错误",
      reportingBugsDesc: "如果您在使用 Pulsar 时遇到问题，首先寻求帮助的地方是用户邮件列表或 Stack Overflow。<br />如果在寻求帮助后，您怀疑您发现了 Pulsar 中的错误，您应该向开发者邮件列表报告或通过 GitHub Issue 报告。请尽可能提供关于您问题的详细信息。不要忘记指明您正在运行的 Pulsar 版本和运行环境。",

      reportingVulnerability: "报告漏洞",
      reportingVulnerabilityDesc: "要报告 Pulsar 的漏洞，请联系 <a href=\"https://www.apache.org/security/projects.html\">Apache 安全团队</a>。<br />报告漏洞的流程在<a href=\"https://www.apache.org/security/\" target=\"_blank\">这里</a>概述。当向 <a href=\"mailto:security@apache.org\">security@apache.org</a> 报告漏洞时，您可以将邮件抄送到 <a href=\"mailto:private@pulsar.apache.org\">private@pulsar.apache.org</a>，将您的报告发送给 Apache Pulsar 项目管理委员会。这是一个私有邮件列表。"
    },
    'en': {
      contributionGuide: "Contribution guide",
      codingConventions: "Coding conventions",

      contributingToProject: "Contributing to the Project",
      contributingToProjectDesc: "Pulsar has many different opportunities for contributions — you can write new examples/tutorials, add new user-facing libraries, write new Pulsar IO connectors, participate in documentation, and more.",

      reportingBugs: "Reporting Bugs",
      reportingBugsDesc: "If you encounter a problem with Pulsar, the first places to ask for help are the user mailing list or Stack Overflow.<br />If, after having asked for help, you suspect that you have found a bug in Pulsar, you should report it to the developer mailing list or by opening GitHub Issue. Please provide as much detail as you can on your problem. Don't forget to indicate which version of Pulsar you are running and on which environment.",

      reportingVulnerability: "Reporting a Vulnerability",
      reportingVulnerabilityDesc: "To report a vulnerability for Pulsar, contact the Apache Security Team.<br />The process for reporting a vulnerability is outlined here. When reporting a vulnerability to security@apache.org, you can copy your email to private@pulsar.apache.org to send your report to the Apache Pulsar Project Management Committee. This is a private mailing list."
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  const actions: ActionButtonProps[] = [
    {
      id: "contributing-to-the-project",
      href: useBaseUrl("/contribute"),
      text: t('contributionGuide'),
      type: "transparentBlack",
    },
    {
      id: "develop-coding-conventions",
      href: useBaseUrl("/contribute/develop-coding-conventions"),
      text: t('codingConventions'),
      type: "transparentBlack",
    },
  ];
  const contentCards: ContentCardProps[] = [
    {
      format: "column",
      title: t('contributingToProject'),
      image: {
        src: useBaseUrl("/img/community_blt.svg"),
      },
      description: (
        <div dangerouslySetInnerHTML={{ __html: t('contributingToProjectDesc') }} />
      ),
    },
    {
      format: "column",
      title: t('reportingBugs'),
      image: {
        src: useBaseUrl("/img/community_bug.svg"),
      },
      description: (
        <div dangerouslySetInnerHTML={{ __html: t('reportingBugsDesc') }} />
      ),
    },
    {
      format: "column",
      title: t('reportingVulnerability'),
      image: {
        src: useBaseUrl("/img/community_shld.svg"),
      },
      description: (
        <div dangerouslySetInnerHTML={{ __html: t('reportingVulnerabilityDesc') }} />
      ),
    },
  ];

  return <div>
    <div className={s.HowToContributeDesktop}>
      <ContentCardsLayout cards={contentCards} columns={3} />
    </div>
    <div className={s.HowToContributeMobile}>
      <div className={s.Slider}>
        <BrowserOnly>
          {() => (
            <Slider slidesToShow={1}>
              {(contentCards || []).map((card) => (
                <div key={card.title} className={s.Card}>
                  <ContentCard {...card} />
                </div>
              ))}
            </Slider>
          )}
        </BrowserOnly>
      </div>
    </div>
    <div className={s.Actions}>
      {(actions || []).map((action) => (
        <ActionButton key={action.id} {...action} />
      ))}
    </div>
  </div>;
};

export default HowToContribute;
