---
title: 自定义路由装饰器
lang: zh-CN
---


## 自定义路由装饰器介绍

`Nest` 是围绕一种称为装饰器的语言功能构建的。装饰器是许多常用编程语言中的众所周知的概念，但是在 `JavaScript` 领域，它们仍然是相对较新的。为了更好地了解装饰器的工作原理，建议阅读本文。这是一个简单的定义：

::: tip
`ES2016` 装饰器是一个返回函数的表达式，可以将目标，名称和属性描述符作为参数。您可以通过在装饰器前面加上 `@` 字符来应用它，并将其放在要装饰的内容的最顶部。可以为类，方法或属性定义装饰器。
:::

## 参数装饰器

`Nest` 提供了一组有用的参数修饰符，您可以将其与 `HTTP` 路由处理程序一起使用。以下是提供的装饰器及其表示的普通 `Express(或Fastify)` 对象的列表。

| 参数 | 返回值 |
|:----------:|:----------:|
| `@Request()	` | `req`  |
| `@Response()` | `res`  |
| `@Next()` |  `next`    |
| `@Session()` | `req.session` |
| `@Param(param?: string)` | `req.params / req.params[param]` |
| `@Body(param?: string)` | `req.body / req.body[param]` |
| `@Query(param?: string)` | `req.query / req.query[param]` |
| `@Headers(param?: string)` | `req.headers / req.headers[param]` |
| `@Ip()` | `req.ip` |


此外，您可以创建自己的自定义装饰器。为什么这有用？

在 `node.js` 世界中，通常将属性附加到请求对象。然后，使用以下代码在每个路由处理程序中手动提取它们：

```typescript
const user = req.user;
```

为了使代码更具可读性和透明度，您可以创建一个 `@User()` 装饰器，并在所有控制器中重用它。

::: tip 官方示例
    user.decorator.ts
:::

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

然后，您可以在任何适合您需求的地方使用它。

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
```

## 数据传递

当装饰器的行为取决于某些条件时，可以使用 `data` 参数将参数传递给装饰器的工厂函数。一个用例是自定义装饰器，它通过 `key`从请求对象中提取属性。例如，假设我们的身份验证层验证请求并将用户实体附加到请求对象。经过身份验证的请求的用户实体可能类似于：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}
```

让我们定义一个将属性名称作为 `key` 的装饰器，如果存在则返回关联的值(如果不存在则返回未定义的值，或者如果尚未创建用户对象，则返回未定义的值)。

::: tip 官方示例
    user.decorator.ts
:::

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user && user[data] : user;
  },
);
```

然后，您可以通过控制器中的 `@User()` 装饰器访问特定属性：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
```

您可以将同一装饰器与不同的 `key` 一起使用以访问不同的属性。如果用户对象很深或很复杂，这会使请求处理程序的实现更加容易和可读。

::: tip
对于 `TypeScript` 用户，请注意 `createParamDecorator <T>()` 是通用的。这意味着您可以显式强制执行类型安全，例如 `createParamDecorator <string>((data，ctx)=> ...)`。或者，在工厂函数中指定参数类型，例如 `createParamDecorator((data：string，ctx)=> ...)`。如果两者都省略，则数据类型将为任意。
:::

## 使用管道

`Nest` 以与内置装饰器相同的方式对待自定义参数装饰器 `(@Body()，@Param() 和 @Query())`。这意味着还为自定义带注释的参数(在我们的示例中为 `user` 参数)执行管道。此外，您可以将管道直接应用于自定义装饰器：

```typescript
@Get()
async findOne(@User(new ValidationPipe()) user: UserEntity) {
  console.log(user);
}
```


## 装饰者组成

`Nest` 提供了一种辅助方法来组成多个装饰器。例如，假设您要将与身份验证相关的所有装饰器组合到一个装饰器中。这可以通过以下构造完成：

```typescript
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized"' }),
  );
}
```

然后，您可以按以下方式使用此自定义 `@Auth()` 装饰器：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}
```

这具有通过一个声明应用所有四个装饰器的效果。

::: warning
`@nestjs/swagger` 包中的 `@ApiHideProperty()` 装饰器是不可组合的，无法与 `applyDecorators` 函数一起正常使用。
:::
