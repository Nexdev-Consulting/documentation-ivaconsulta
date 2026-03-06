import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  ragtoolSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Architecture & Configuration',
      items: [
        'docs/Architecture',
        'docs/Configuration_Guide',
        'docs/Files_Management',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'docs/IVA_CONSULTA_API',
        'docs/GUARDRAILS_IVA_CONSULTA_API',
      ],
    },
    {
      type: 'category',
      label: 'Deployment & Operations',
      items: [
        'docs/Deployment_Guide',
        'docs/Troubleshooting_and_Performance',
      ],
    },
    {
      type: 'category',
      label: 'Monitoring',
      items: [
        'docs/Langsmith_Integration',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'docs/DOCUMENTATION_CONSOLIDATION_SUMMARY',
        'CONTRIBUTING',
      ],
    },
  ],
};

export default sidebars;
