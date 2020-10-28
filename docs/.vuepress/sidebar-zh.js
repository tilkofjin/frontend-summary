module.exports = {
  "/zh/basics/": ["css", "js"],
  "/zh/guide/": [
    // "nodejs",
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
            ["/zh/guide/nestjs/fundamentals/injectionScopes", "注入作用域"],
            ["/zh/guide/nestjs/fundamentals/circularDependency", "循环依赖"],
            ["/zh/guide/nestjs/fundamentals/moduleRef", "模塊參考"],
            ["/zh/guide/nestjs/fundamentals/executionContext", "執行上下文"],
            ["/zh/guide/nestjs/fundamentals/lifecycleEvents", "生命周期事件"],
            ["/zh/guide/nestjs/fundamentals/platformAgnosticism", "平台未知性"],
            ["/zh/guide/nestjs/fundamentals/testing", "测试"],
          ],
        },
        {
          title: "技术",
          children: [
            ["/zh/guide/nestjs/techniques/authentication", "认证方式"], 
            ["/zh/guide/nestjs/techniques/database", "数据库"],
            ["/zh/guide/nestjs/techniques/mongo", "Mongo"],
            ["/zh/guide/nestjs/techniques/configuration", "配置"],
            ["/zh/guide/nestjs/techniques/validation", "验证"],
            ["/zh/guide/nestjs/techniques/caching", "缓存"],
          ],
        },
      ],
    },
    "ci",
  ],
};
