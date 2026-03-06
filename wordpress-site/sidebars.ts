import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  wordpressSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'docs/Local_Setup_Guide',
        'docs/VAT_Deep_Chatbot',
      ],
    },
  ],
};

export default sidebars;
