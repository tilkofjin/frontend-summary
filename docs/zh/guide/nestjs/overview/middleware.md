---
title: 中间件
lang: zh-CN
---

## 中间件介绍

中间件是在路由处理程序之前调用的函数。中间件功能可以访问[请求](http://expressjs.com/en/4x/api.html#req)和[响应](http://expressjs.com/en/4x/api.html#res)对象，以及应用程序的请求-响应周期中的 `next()` 中间件功能。下一个中间件功能通常由名为 `next` 的变量表示。

![img](https://docs.nestjs.com/assets/Middlewares_1.png "中间件")

默认情况下，`Nest` 中间件等效于 `Express`中间件。官方文档中的以下描述描述了中间件的功能：

::: tip 中间件的功能：
中间件功能可以执行以下任务：
  - 执行任何代码。
  - 更改请求和响应对象。
  - 结束请求-响应周期。
  - 调用堆栈中的下一个中间件函数。
  - 如果当前的中间件功能没有结束请求-响应周期，它必须调用 `next()` 才能将控制权传递给下一个中间件函数，否则，请求将被挂起。
:::

您可以在任一函数中实现自定义 `Nest` 中间件，或在具有 `@Injectable()` 装饰器的类中。该类应实现 `NestMiddleware` 接口，而该功能没有任何特殊要求，让我们从使用类方法实现一个简单的中间件功能开始。

::: tip 官方示例
    logger.middleware.ts
:::

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('Request...');
    next();
  }
}
```

## 依赖注入

Nest中间件全面支持依赖注入，就像 `providers` 和 `controllers` 一样，他们能够注入同一模块中可用的依赖项，和平常一样，这是通过构造函数完成的。

## 应用中间件

`@Module()` 装饰器中不可放入中间件, 相反，我们使用模块类的 `configure()` 方法来设置它们。包含中间件的模块必须实现 `NestModule` 接口，我们在  `AppModule` 级别上设置 `LoggerMiddleware`。
::: tip 官方示例
    app.module.ts
:::
```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```
在上面的示例中，我们为先前在 `CatsController` 内部定义的 `/ cats` 路由处理程序设置了 `LoggerMiddleware`，在配置中间件时，我们还可以通过将包含路由路径和请求方法的对象，传递给 `forRoutes()` 方法，进一步将中间件限制为特定的请求方法。在下面的示例中，请注意，我们导入了 `RequestMethod` 枚举以引用所需的请求方法类型。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

::: tip
  可以使用 `async / await` 使 `configure()` 方法异步化（例，可以在 `configure()` 方法主体中，等待异步操作的完成）。
:::

## 路由通配符

路由同样支持模式匹配，例如，可以使用 * 通配符，匹配任何字符组合。

```typescript
  forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
```

路由路径为`'ab * cd'`，将匹配abcd，ab_cd，abecd等等，字符 `?，+，* 及 ()` 是它们的正则表达式对应项的子集。连字符 (`-`) 和点 (`.`) 按字符串路径解析。

::: warning
  fastify软件包使用最新版本的path-to-regexp软件包，该软件包不再支持通配符星号*。 相反，您必须使用参数 (例如 (`.*`)、`:splat*`)。
:::

## 中间件消费者

`MiddlewareConsumer` 是个帮助类。它提供了几种内置方法来管理中间件，他们都可以被简单地链接起来。`forRoutes()` 方法可以使用单个字符串，多个字符串，`RouteInfo` 对象，一个控制器类甚至多个控制器类。在大多数情况下，您可能只需要传递以逗号分隔的控制器列表。以下是单个控制器的示例：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller.ts';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```
::: tip
  `apply()` 方法可以采用单个中间件，也可以使用多个参数来指定多个中间件。
:::

## 排除路由

有时我们想从应用中间件中排除某些路由，我们可以使用 `exclude()` 方法轻松排除某些路由，此方法可以采用一个字符串，多个字符串或一个 `RouteInfo` 对象，以标识要排除的路由，如下所示：

```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/(.*)',
  )
  .forRoutes(CatsController);
```
::: tip
  `exclude()` 方法使用 `path-to-regexp` 包支持通配符参数。
:::

在上面的示例中，`LoggerMiddleware` 将绑定到 `CatsController` 内部定义的所有路由，但传递给 `exclude()` 方法的三个路由除外。

## 函数式中间件

我们一直在使用的 `LoggerMiddleware` 类非常简单，它没有成员，没有其他方法，也没有依赖项。为什么我们不能定义一个简单的函数，而要定义一个类。事实上，我们可以，这种类型的中间件称为 **函数中间件**，让我们将 `logger 中间件` 从基于 **类的中间件** 转变为 **函数式中间件**来说明他们的区别。

::: tip 官方示例
    logger.middleware.ts
:::

```typescript
import { Request, Response } from 'express';

export function logger(req: Request, res: Response, next: Function) {
  console.log(`Request...`);
  next();
};
```
并在 `AppModule` 中使用它

::: tip 官方示例
    app.module.ts
:::

```typescript
  consumer
  .apply(logger)
  .forRoutes(CatsController);
```

::: tip
    每当您的中间件不需要任何依赖关系时，请考虑使用功能更简单的中间件替代方案。
:::

## 多个中间件

如上所述，为了绑定顺序执行的多个中间件，只需在 `apply()` 方法内部使用**逗号**分隔的列表即可。

```typescript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

## 全局中间件

如果我们想一次性将中间件绑定到每个注册的路由，我们可以使用 `INestApplication` 实例提供的 `use()` 方法：

```typescript
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```