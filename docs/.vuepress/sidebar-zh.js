module.exports = {
  "/zh/basics/": ["css", "js"],
  "/zh/guide/": [
    "nodejs",
    {
      title: "Nestjs",
      children: [
        ["/zh/guide/nestjs/introduction", "介绍"],
        {
          title: "概览",
          children: [
            ["/zh/guide/nestjs/overview/firstSteps", "第一步"],
            ["/zh/guide/nestjs/overview/controllers", "控制器"], 
            ["/zh/guide/nestjs/overview/providers", "提供者"], 
            ["/zh/guide/nestjs/overview/module", "模块"], 
            ["/zh/guide/nestjs/overview/middleware", "中间件"], 
            ["/zh/guide/nestjs/overview/exceptionFilters", "异常过滤器"], 
            ["/zh/guide/nestjs/overview/pipes", "管道"], 
            ["/zh/guide/nestjs/overview/guards", "守卫"], 
            ["/zh/guide/nestjs/overview/interceptors", "拦截器"], 
            ["/zh/guide/nestjs/overview/customDecorators", "自定义路由装饰器"], 
          ],
        },
        {
          title: "基本原理",
          children: [
            ["/zh/guide/nestjs/fundamentals/customProviders", "自定义提供者"], 
            ["/zh/guide/nestjs/fundamentals/asyncProviders", "异步提供者"], 
            ["/zh/guide/nestjs/fundamentals/dynamicModules", "动态模块"], 
          ],
        },
      ],
    },
    "ci",
  ],
};
