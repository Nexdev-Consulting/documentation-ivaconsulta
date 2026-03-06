import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  railwaySidebar: [
    'intro',
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'docs/Deployment_Configuration',
        'docs/Express_Redis_API',
      ],
    },
    {
      type: 'category',
      label: 'Rate Limiting & Security',
      items: [
        'docs/Rate_Limiting_Architecture',
        'docs/Security_Best_Practices',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'docs/Troubleshooting_and_Recovery',
      ],
    },
  ],
};

export default sidebars;
