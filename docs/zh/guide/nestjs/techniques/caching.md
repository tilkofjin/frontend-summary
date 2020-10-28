---
title: 缓存
lang: zh-CN
---

## 缓存介绍

缓存是一种很棒且简单的技术，可帮助您提高应用程序的性能。它充当提供高性能数据访问的临时数据存储。


## 安装

首先安装所需的软件包：

```bash
$ npm install --save cache-manager
```



## 内存缓存

`Nest` 为各种缓存存储提供商提供了统一的 `API`。内置的是内存中的数据存储。但是，您可以轻松地切换到更全面的解决方案，例如 `Redis`。为了启用缓存，首先导入 `CacheModule` 并调用其 `register()` 方法。

```typescript
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class ApplicationModule {}
```

::: warning
在 [<font color=red>GraphQL</font>](https://docs.nestjs.com/graphql/quick-start) 应用程序中，拦截器是针对每个字段解析器单独执行的。因此，`CacheModule` (使用拦截器缓存响应)将无法正常工作。
:::

然后，将 `CacheInterceptor` 绑定到要缓存数据的位置。

```typescript
@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}
```

::: warning
仅缓存 `GET` 端点。另外，注入本机响应对象( `@Res()` )的 `HTTP` 服务器路由也不能使用缓存拦截器。有关更多详细信息，请参见[响应映射](https://docs.nestjs.com/interceptors#response-mapping)。
:::




## 全局缓存

为了减少所需的样板，可以将 `CacheInterceptor` 全局绑定到所有端点：

```typescript
import { CacheModule, Module, CacheInterceptor } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class ApplicationModule {}
```



## 自定义缓存

所有缓存的数据都有其自己的到期时间(`TTL`)。要自定义默认值，请将 `options` 对象传递给 `register()` 方法。

```typescript
CacheModule.register({
  ttl: 5, // seconds
  max: 10, // maximum number of items in cache
});
```



## 全局缓存覆盖

启用全局缓存后，缓存条目存储在基于路由路径自动生成的 `CacheKey` 下。您可以逐个方法覆盖某些缓存设置( `@CacheKey()` 和 `@CacheTTL()` )，从而允许为单个控制器方法定制缓存策略。使用[<font color=red>不同的缓存存储</font>](https://docs.nestjs.com/techniques/caching#different-stores)区时，可能是最有意义的。

```typescript
@Controller()
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] {
    return [];
  }
}
```

::: tip
`@CacheKey()` 和 `@CacheTTL()` 装饰器是从 `@nestjs/common` 包导入的。
:::

`@CacheKey()` 装饰器可以有或没有一个与之相应的 `@CacheTTL()` 装饰器，反之亦然。可以选择仅覆盖 `@CacheKey()` 或仅覆盖 `@CacheTTL()`。未用装饰器覆盖的设置将使用全局注册的默认值(请参阅[<font color=red>自定义缓存</font>](https://docs.nestjs.com/techniques/caching#customize-caching))。



## `WebSocket` 和微服务

您还可以将 `CacheInterceptor` 应用于 `WebSocket` 订阅者以及微服务的模式(无论使用哪种传输方法)。

```typescript
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
```

但是，需要额外的 `@CacheKey()` 装饰器，以指定用于随后存储和检索缓存数据的键。另外，请注意，您不应该缓存所有内容。不应该缓存执行除查询数据的某些其他业务操作。

此外，您可以使用 `@CacheTTL()` 装饰器指定缓存过期时间( `TTL` )，它将覆盖全局默认 `TTL` 值。

```typescript
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
```

::: tip
`@CacheTTL()` 装饰器和 `@CacheKey()` 装饰器可以一起使用，也可以不一起使用。
:::



## 不同的存储

该服务利用后台的[<font color=red>缓存管理器</font>](https://github.com/BryanDonovan/node-cache-manager)。高速缓存管理器软件包支持各种有用的存储，例如 [<font color=red>Redis</font>](https://github.com/dabroek/node-cache-manager-redis-store) 存储。[<font color=red>此处</font>](https://github.com/BryanDonovan/node-cache-manager#store-engines)提供受支持存储的完整列表。要设置 `Redis` 存储，只需将包连同相应的选项一起传递给 `register()` 方法。

```typescript
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
  controllers: [AppController],
})
export class ApplicationModule {}
```


## 调整追踪

默认情况下，`Nest` 使用请求 `URL` (在 `HTTP` 应用程序中)或缓存键(在 `websockets` 和微服务应用程序中，通过 `@CacheKey()` 装饰器设置)将缓存记录与端点关联。不过，有时可能希望基于不同的因素来设置跟踪，例如使用 `HTTP` 标头(例如正确识别配置文件终结点的授权)。

为了完成此任务，请创建 `CacheInterceptor` 的子类并重写 `trackBy()` 方法。

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}
```



## 异步配置

您可能希望异步传递模块选项，而不是在编译时静态传递它们。在这种情况下，请使用 `registerAsync()` 方法，该方法提供了几种处理异步配置的方法。

一种方法是使用工厂函数：

```typescript
CacheModule.registerAsync({
  useFactory: () => ({
    ttl: 5,
  }),
});
```

我们工厂的行为类似于所有其他异步模块工厂(它可以是异步的，并且可以通过注入来注入依赖项)。


```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.getString('CACHE_TTL'),
  }),
  inject: [ConfigService],
});
```

另外，您可以使用 `useClass` 方法：

```typescript
CacheModule.registerAsync({
  useClass: CacheConfigService,
});
```

上面的构造将实例化 `CacheModule` 中的 `CacheConfigService` 并将使用它来获取 `options` 对象。`CacheConfigService` 必须实现 `CacheOptionsFactory` 接口，以提供配置选项：

```typescript
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      ttl: 5,
    };
  }
}
```

如果要使用从其他模块导入的配置提供程序，请使用 `useExisting` 语法：

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这项功能与 `useClass` 相同，但有一个关键的区别-- `CacheModule` 将查找导入的模块以重用任何已创建的 `ConfigService`，而不是实例化其自身。