import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  orchestratorSidebar: [
    'intro',
    {
      type: 'category',
      label: 'API & Integration',
      items: [
        'docs/API_Integration_Guide',
        'docs/Frontend_Integration_Guide',
        'docs/IP_Rate_Limiting',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'docs/Railway_Deployment_Guide',
        'docs/Google_Cloud_Deployment_Guide',
        'docs/Google_Cloud_Quick_Start',
        'docs/Artifact_Registry_Build_and_Run_Guide',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'docs/Local_Development',
        'docs/CI_CD_Pipeline',
      ],
    },
    {
      type: 'category',
      label: 'Observability',
      items: [
        'docs/LangSmith_Technical_Setup',
      ],
    },
    {
      type: 'category',
      label: 'Architecture & Compliance',
      items: [
        'docs/Technical_Solution_AI_Agents',
        'docs/EU_AI_Act_GDPR_Risk_Analysis',
      ],
    },
  ],
};

export default sidebars;
