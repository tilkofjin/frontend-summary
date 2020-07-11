module.exports = {
  title: "frontend summary",
  port: "8005",
  base: '/frontend-summary/',
  head: [
    ['link', { rel: 'icon', href: '/img/headLogo.jpg' }],
  ],
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Frontend self-study guide',
      description: 'The journey of front-end learning',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: '前端自学指南',
      description: '前端学习的心路历程'
    }
  },
  themeConfig: {
    logo: '/img/searchLogo.jpg',
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        ariaLabel: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        serviceWorker: {
          updatePopup: {
            message: "New content is available.",
            buttonText: "Refresh"
          }
        },
        algolia: {},
        nav: require('./nav-us'),
        sidebar: require('./sidebar-us'),
      },
      '/zh/': {
        // 多语言下拉菜单的标题
        selectText: '选择语言',
        // 该语言在下拉菜单中的标签
        label: '简体中文',
        // 编辑链接文字
        editLinkText: '在 GitHub 上编辑此页',
        // Service Worker 的配置
        serviceWorker: {
          updatePopup: {
            message: "发现新内容可用.",
            buttonText: "刷新"
          }
        },
        // 当前 locale 的 algolia docsearch 选项
        algolia: {},
        nav: require('./nav-zh'),
        sidebar: require('./sidebar-zh'),
      }
    },
  }
};
