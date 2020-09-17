---
title: 注入作用域
lang: zh-CN
---

## 注入作用域介绍

对于来自不同编程语言背景的人们来说，意外地发现在 `Nest` 中几乎所有内容都是在传入请求中共享的。我们有一个到数据库的连接池，具有全局状态的单例服务等。请记住，`Node.js` 并不遵循**请求/响应**多线程无状态模型，在该模型中，每个请求都由单独的线程处理。因此，使用单例实例对于我们的应用程序是完全安全的。但是，在某些情况下，基于请求的生存期可能是所需的行为，例如 `GraphQL` 应用程序中的每个请求缓存，请求跟踪和多租户。注入作用域提供了一种获取所需提供者生命周期行为的机制。


## 提供者作用域

提供者可以具有以下任意範圍：

|  类型 | 说明 |
|:---------:|:---------:|
| `DEFAULT` | 提供者的单个实例在整个应用程序中共享。实例生存期与应用程序生命周期直接相关。应用程序启动后，所有单例提供程序都将实例化。默认情况下使用单例作用域。
| `REQUEST` | 将为每个传入请求专门创建提供者的新实例。请求完成处理后，实例将被垃圾回收。 |
| `TRANSIENT` | 临时提供程序不跨消费者共享。每个注入临时提供者的使用者都将收到一个新的专用实例。 |

::: tip
在大多數情況下，建議使用單例作用域。在使用者和請求之間共享提供者意味著在應用程序啟動期間，實例可以被緩存並且其初始化僅發生一次。
:::


## 用法

通過將 `scope` 屬性傳遞給 `@Injectable()` 裝飾器選項對象來指定注入範圍：

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

同樣，對於[<font color=red>自定義提供者</font>](https://docs.nestjs.com/fundamentals/custom-providers)，請以長格式設置作用域的屬性以進行提供者註冊：


```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}
```

::: tip
從 `@nestjs/common` 導入 `Scope` 枚舉
:::

::: tip
網關不應使用請求域的提供者，因為它們必須充當單例。每個網關都封裝了一個真實的套接字，並且不能多次實例化。
:::

默認情況下使用单例作用域，無需聲明。如果確實要聲明提供者為單例作用域的，則將 `Scope.DEFAULT` 值用作 `scope` 屬性。


## 控制器作用域

控制器也可以具有作用域，该作用域适用于该控制器中声明的所有请求方法处理程序。像提供者作用域一样，控制器的作用域声明其生存期。对于请求作用域的控制器，将为每个入站请求创建一个新实例，并在请求完成处理后进行垃圾回收。

使用 `ControllerOptions` 对象的 `scope` 属性声明控制器作用域：

```typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}
```


## 作用域层次

示波器使注射链产生气泡。依赖于请求作用域的提供者的控制器本身将成为请求作用域。

想象以下依赖关系图：`CatsController <-CatsService <-CatsRepository`。如果 `CatsService` 是请求域的(其他均为默认单例)，则 `CatsController` 将变为请求域的，因为它取决于注入的服务。不依赖的 `CatsRepository` 将保持单例作用域。


## 請求提供者

在基于 `HTTP` 服务器的应用程序中(例如，使用 `@nestjs/platform-express` 或 `@nestjs/platform-fastify`)，使用请求作用域的提供者时，您可能希望访问对原始请求对象的引用。您可以通过注入 `REQUEST` 对象来实现。

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

由于基础平台/协议的差异，对于微服务或 `GraphQL` 应用程序，您访问入站请求的方式略有不同。在 `GraphQL` 应用程序中，您注入 `CONTEXT` 而不是 `REQUEST`：

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private context) {}
}
```

然后，您可以配置上下文值(在 `GraphQLModule` 中)以包含请求作为其属性。


## 性能

使用请求作用域的提供者将对应用程序性能产生影响。虽然 `Nest` 尝试缓存尽可能多的元数据，但仍必须在每个请求上创建您的类的实例。因此，这会减慢您的平均响应时间和总体基准测试结果。除非提供者必须是请求作用域的，否则强烈建议您使用默认的单例作用域。


