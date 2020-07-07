module.exports = {
  title: "frontend summary",
  port: "8005",
  base:'/frontend-summary/',
  head: [
    ['link', {rel: 'icon', href: '/img/headLogo.jpg'}],
  ],
  themeConfig: {
    logo: '/img/searchLogo.jpg',
    sidebar: require('./sidebar'),
    nav: require('./nav')
  },
};
