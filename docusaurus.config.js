// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Jean Nascimento',
  tagline: 'Desenvolvedor e Arquiteto de Software Java, entusiasta em boas práticas de codificação',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://jeancnasc.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Jean Carneiro do Nascimento', // Usually your GitHub org/user name.
  projectName: 'jeancnasc.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js')
          //editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
           routeBasePath: '/',
           showReadingTime: true,
           blogTitle: 'Blog',
           
           feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Jean Carneiro do Nascimento.`
           }
          
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        items: [          
          {
            to: '/', 
            label: 'Início',
            position: 'left'
          },
          {
            type: 'docSidebar',
            sidebarId: 'praticasSidebar',
            position: 'left',
            label: 'Práticas',
          },
          {
            href: 'https://github.com/jeancnasc',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Autor',
            items: [
              {
                html: `
                      <div class="avatar">
                        <a
                          class="avatar__photo-link avatar__photo avatar__photo--lg"
                          href="https://www.linkedin.com/in/jeancnasc/">
                          <img
                            alt="Jean Carneiro do Nascimento"
                            src="https://www.gravatar.com/avatar/6c6af18d483c5ee926c130a4aaa24ad9" />
                        </a>
                        <div class="avatar__intro">
                          <div class="avatar__name">Jean Carneiro do Nascimento</div>
                          <small class="avatar__subtitle">
                          Desenvolvedor e Arquiteto de Software Java, entusiasta em boas práticas de codificação
                          </small>
                        </div>
                      </div>`
              },
            ],
          },
          
          {
            title: 'Redes Socias',
            items: [
              {
                label: 'Linkedin',
                href: 'https://www.linkedin.com/in/jeancnasc/'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/jeancnasc',
              }              
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Jean Carneiro do Nascimento.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java']
      }
    }),
};

module.exports = config;
