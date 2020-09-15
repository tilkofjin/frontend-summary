---
title: 守卫
lang: zh-CN
---

## 守卫介绍

守卫是用 `@Injectable()` 装饰器注释的类。 所有的守卫都应实现 `CanActivate` 接口。

![img](https://docs.nestjs.com/assets/Guards_1.png "守卫")

守卫负有单一责任。他们确定给定的请求是否将由路由处理程序处理，取决于运行时出现的某些条件(例如权限，角色，`ACL` 等)。这通常称为授权，授权(身份验证)通常由传统 `Express` 应用程序中的中间件处理。中间件是进行身份验证的不错选择，因为令牌验证和将属性附加到 `请求对象` 等与特定的路由上下文(及其元数据)之间没有牢固的联系。

但是中间件从本质上来说是错误的，调用 `next()` 函数后，它不知道将执行哪个处理程序。另一方面，**`Guards`** 可以访问 `ExecutionContext` 实例，因此确切知道下一步将要执行什么。它们的设计非常类似于异常过滤器，管道和拦截器，使您可以在**请求/响应**周期中的正确位置插入处理逻辑，并以声明的方式进行。这有助于使代码保持整洁性和声明性。

::: tip
在每个中间件之后但在任何拦截器或管道之前执行守护。
:::

## 守卫授权

如前所述，授权是 `Guards` 的一个很好的用例，因为只有当呼叫者(通常是经过身份验证的特定用户)具有足够的权限时，特定的路由才可用。现在，我们将构建的 `AuthGuard` 假设已通过身份验证的用户(因此，令牌附加到了请求标头中)。它将提取并验证令牌，并使用提取的信息来确定请求是否可以继续进行。

::: tip 官方示例
    auth.guard.ts
:::

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```
`validateRequest()` 函数中的逻辑可以根据需要简单或复杂。该示例的重点是显示守卫如何适应**请求/响应周期**。

每个守卫都必须实现  `canActivate()` 函数，此函数应返回一个布尔值，指示是否允许当前请求。它可以同步或异步返回响应(通过 `Promise` 或 `Observable`)。`Nest` 使用返回值控制下一步操作：
  - 如果返回 `true`，则将处理请求。
  - 如果返回 `false`，则 `Nest` 将拒绝该请求。

## 执行上下文

`canActivate()` 函数采用一个参数，即 `ExecutionContext` 实例。`ExecutionContext` 继承自 `ArgumentsHost`。我们之前在异常过滤器一章中看到了  `ArgumentsHost`。在上面的示例中，我们只使用了与先前使用的 `ArgumentsHost` 上定义的相同的帮助程序方法，来获取对 `Request` 对象的引用。您可以参考[异常过滤器](https://docs.nestjs.com/exception-filters#arguments-host)一章的 `"Arguments host"` 部分，以获取有关此主题的更多信息。通过扩展`ArgumentsHost`，`ExecutionContext` 还添加了几个新的辅助方法，这些方法提供有关当前执行过程的更多详细信息。这些详细信息有助于构建可以在广泛的控制器，方法和执行上下文中使用的更多通用守护。 在[此处](https://docs.nestjs.com/fundamentals/execution-context)了解有关 `ExecutionContext` 的更多信息。


## 基于角色的身份验证

让我们构建一个功能更强大的守卫，仅允许具有特定角色的用户访问。我们将从一个基本的守卫模板开始，并在接下来的部分中以此为基础。目前，它允许所有请求继续进行：

::: tip 官方示例
    roles.guard.ts
:::

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
```

## 绑定守卫

与管道和异常过滤器一样，守卫可以是控制器范围，方法范围或全局范围的。下面，我们使用 `@UseGuards()` 装饰器设置了一个控制器范围的防护。此修饰符可以采用单个参数，也可以采用逗号分隔的参数列表。这使您可以通过一个声明，轻松地应用一组适当的守卫。

```typescript
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

::: tip
`@UseGuards()` 装饰器从 `@nestjs/common` 包导入。
:::

上面，我们传递了 `RolesGuard `类型(而不是实例)，将实例化责任留给了框架并启用了依赖注入。与管道和异常过滤器一样，我们还可以传递此实例：

```typescript
@Controller('cats')
@UseGuards(new RolesGuard())
export class CatsController {}
```

上面的构造将守卫程序附加到此控制器声明的每个处理程序上。如果我们希望守卫仅适用于单个方法，则可以在方法级别应用 `@UseGuards()` 装饰器。为了设置全局守卫，请使用 `Nest` 应用程序实例的 `useGlobalGuards()` 方法：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```
::: tip
对于混合应用程序，默认情况下，`useGlobalGuards()` 方法未设置网关和微服务的防护(有关如何更改此行为的信息，请参阅[混合应用程序](https://docs.nestjs.com/faq/hybrid-application))。对于 **"标准"(非混合)**微服务应用程序，`useGlobalGuards()` 确实在全局安装了守卫。
:::

对于每个控制器和每个路由处理程序，整个应用程序都使用全局防护。在依赖关系注入方面，从任何模块外部注册的全局守卫(如上例中使用 `useGlobalGuards()`)都不能注入依赖关系，因为这是在任何模块上下文之外完成的。为了解决此问题，您可以使用以下结构直接从任何模块设置守卫：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```
::: tip
使用此方法对守卫执行依赖注入时，请注意，无论采用哪种结构的模块，实际上守卫都是全局的，应该在哪里做？选择定义了守卫(在上面的示例中为 `RolesGuard` )的模块。同样，`useClass` 不是处理自定义提供程序注册的唯一方法。 [了解更多](https://docs.nestjs.com/fundamentals/custom-providers)。
:::

## 设置每个处理程序的角色

我们的 `RolesGuard` 正在运行，但还不是很聪明。我们尚未利用最重要的守卫功能-执行上下文。它尚不了解角色，或每个处理程序允许哪些角色。例如，对于不同的路由，`CatsController` 可能具有不同的权限方案。有些可能仅对管理员用户可用，而另一些可能对所有人开放。我们如何以灵活且可重用的方式将角色与路由匹配？

这是自定义元数据起作用的地方([了解更多](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata))。`Nest` 提供了通过`@SetMetadata()` 装饰器将自定义元数据附加到路由处理程序的功能。该元数据提供了我们缺少的角色数据，智能守卫需要进行决策。让我们看一下使用 `@SetMetadata()` 的方法：

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

::: tip
`@SetMetadata()` 装饰器从 `@nestjs/common` 包导入。
:::

通过上面的构造，我们将角色元数据(角色是键，而 `['admin']` 是特定值)附加到 `create()` 方法。虽然这可行，但在路由中直接使用  `@SetMetadata()` 并不是一个好习惯。而是应该创建您自己的装饰器，如下所示：

::: tip 官方示例
    roles.decorator.ts
:::

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

这种方法更干净，更易读，并且类型严格。现在我们有了一个自定义的 `@Roles()` 装饰器，我们可以使用它来装饰 `create()` 方法。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

## 全部放在一起

现在，让我们将其与 `RolesGuard`结合在一起。当前，它在所有情况下都只返回 `true`，从而允许每个请求继续进行。我们希望根据将分配给当前用户的角色与正在处理的当前路由所需的实际角色进行比较来确定返回值的条件。为了访问路由的角色(自定义元数据)，我们将使用 `Reflector` 帮助器类，该类由框架提供，并通过 `@nestjs/core` 包公开。

::: tip 官方示例
    roles.guard.ts
:::

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
```

::: tip
在 `node.js` 世界中，通常的做法是将授权用户附加到请求对象。因此，在上面的示例代码中，我们假设 `request.user` 包含用户实例和允许的角色。在您的应用中，您可能会在自定义身份验证防护(或中间件)中建立该关联。
:::

::: warning
`matchRoles()` 函数内部的逻辑可以根据需要简单或复杂。该示例的重点是显示守卫如何适应请求/响应周期。
:::

有关以上下文相关方式使用 `Reflector` 的更多详细信息，请参见 **"执行"** 上下文一章的 **"反射和元数据"**部分。

当特权不足的用户请求端点时，`Nest` 自动返回以下响应：

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

请注意，在幕后，当守卫返回 `false` 时，框架将引发 `ForbiddenException`。如果要返回不同的错误响应，则应抛出自己的特定异常。例如：

```typescript
throw new UnauthorizedException();
```

守卫抛出的任何异常将由异常层处理(全局异常过滤器和应用于当前上下文的所有异常过滤器)。
