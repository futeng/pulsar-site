import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { ContentCardProps } from "../../shared/ContentCard/ContentCard";
import ContentCardsLayout from "../../shared/ContentCard/ContentCardsLayout";

const ProjectGovernance: React.FC = () => {
  const { i18n } = useDocusaurusContext();

  const translations = {
    'zh-cn': {
      pmcTitle: "项目管理委员会（PMC）",
      pmcDesc1: "Apache Pulsar 由其 PMC 独立管理，PMC 是负责项目管理的治理机构。",
      pmcDesc2: "成员负责技术方向、对新提交者和 PMC 成员进行投票、制定政策以及对软件产品发布进行正式投票。",
      pmcDesc3: "了解更多关于<a href=\"https://community.apache.org/projectIndependence\" title=\"Project independence overview\" target=\"_blank\">项目独立性概述</a>、<a href=\"https://www.apache.org/foundation/governance/pmcs.html\" title=\"PMCs\" target=\"_blank\">PMC</a>、<a href=\"https://www.apache.org/foundation/voting.html\" title=\"Voting process\" target=\"_blank\">投票流程</a>和<a href=\"https://www.apache.org/theapacheway/index.html\" title=\"The Apache way guidelines\" target=\"_blank\">Apache 方式指南</a>"
    },
    'en': {
      pmcTitle: "Project Management Committee (PMC)",
      pmcDesc1: "Apache Pulsar is independently managed by its PMC, the governing body tasked with project management.",
      pmcDesc2: "Members are resposible for Technical direction, Voting on new committers and PMC members, Setting policies and Formally voting on software product releases.",
      pmcDesc3: "Learn more about <a href=\"https://community.apache.org/projectIndependence\" title=\"Project independence overview\" target=\"_blank\">Project independence overview</a>, <a href=\"https://www.apache.org/foundation/governance/pmcs.html\" title=\"PMCs\" target=\"_blank\">PMCs</a>, <a href=\"https://www.apache.org/foundation/voting.html\" title=\"Voting process\" target=\"_blank\">Voting process</a> and <a href=\"https://www.apache.org/theapacheway/index.html\" title=\"The Apache way guidelines\" target=\"_blank\">The Apache way guidelines</a>"
    }
  };

  const t = (key) => translations[i18n.currentLocale][key] || translations['en'][key];

  const cards: ContentCardProps[] = [
    {
      description: (
        <div>
          <p>
            {t('pmcTitle')}<br />
            {t('pmcDesc1')}
          </p>
          <p>
            {t('pmcDesc2')}
          </p>
          <p dangerouslySetInnerHTML={{ __html: t('pmcDesc3') }} />
        </div>
      ),
    },
  ];

  return <ContentCardsLayout cards={cards} columns={1} />;
};

export default ProjectGovernance;
