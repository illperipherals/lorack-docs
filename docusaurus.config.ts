import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const buildId = new Date().toISOString();

const config: Config = {
  title: 'LoRACK! Documentation',
  tagline: 'Mobile LoRaWAN Network Management via ChirpStack',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://illperipherals.github.io',
  baseUrl: '/lorack-docs/',

  organizationName: 'illperipherals',
  projectName: 'lorack-docs',

  customFields: {
    buildId,
  },

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl:
            'https://github.com/illperipherals/lorack-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'LoRACK!',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'User Guide',
        },
        {
          href: 'https://github.com/illperipherals/LoRACK-AI-mobile',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'User Guide',
              to: '/user-guide',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'ChirpStack Docs',
              href: 'https://www.chirpstack.io/docs/',
            },
            {
              label: 'Nightjar Solutions',
              href: 'https://nightjarsolutions.io',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/illperipherals/LoRACK-AI-mobile',
            },
          ],
        },
      ],
      copyright: `Copyright \u00a9 ${new Date().getFullYear()} Nightjar Solutions. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
