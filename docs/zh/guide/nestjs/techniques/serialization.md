---
title: 序列化
lang: zh-CN
---

## 序列化介绍

序列化是在网络响应中返回对象之前发生的过程。这是提供转换和清理要返回给客户端数据规则的适当位置。例如，应始终将敏感数据(如密码)从响应中排除。或者，某些属性可能需要进行其他转换，例如仅发送实体属性的子集。手动执行这些转换可能很麻烦且容易出错，还可能使您不确定是否已涵盖所有情况。


## 概要

`Nest` 提供了内置功能，可帮助确保可以直接方式执行这些操作。`ClassSerializerInterceptor` 拦截器使用功能强大的 [<font color=red>class-transformer</font>](https://github.com/typestack/class-transformer) 包来提供声明性和可扩展的对象转换方式。它执行的基本操作是获取方法处理程序返回的值，并应用来自 [<font color=red>class-transformer</font>](https://github.com/typestack/class-transformer) 的 `classToPlain()` 函数。这样，它可以将由类转换器装饰器表达的规则应用于实体 `/DTO` 类，如下所述。



## 排除属性

假设我们要自动从用户实体中排除密码属性。我们对实体进行如下注释：

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```

现在考虑一个带有方法处理程序的控制器，该方法返回该类的实例。

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password',
  });
}
```

::: warning
注意，我们必须返回该类的实例。如果返回简单的 `JavaScript` 对象，例如 `{user：new UserEntity()}`，则该对象将无法正确序列化。
:::

::: tip
从 `@nestjs/common` 导入 `ClassSerializerInterceptor`。
:::

当请求此终结点时，客户端收到以下响应：

```json
{
  "id": 1,
  "firstName": "Kamil",
  "lastName": "Mysliwiec"
}
```

请注意，拦截器可以在整个应用程序范围内应用(如[<font color=red>此处</font>](https://docs.nestjs.com/interceptors#binding-interceptors)所述)。拦截器和实体类声明的组合确保了任何返回 `UserEntity` 的方法都将确保删除 `password` 属性。这使您可以评估该业务规则的集中实施。



## 公开属性

您可以使用 `@Expose()` 装饰器为属性提供别名，或执行一个函数以计算属性值(类似于 `getter` 函数)，如下所示。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
```


## 转换

您可以使用 `@Transform()` 装饰器执行其他数据转换。例如，以下构造返回 `RoleEntity` 的 `name` 属性，而不返回整个对象。

```typescript
@Transform(role => role.name)
role: RoleEntity;
```


## 通行证选项

您可能需要修改转换函数的默认行为。要覆盖默认设置，请使用 `@SerializeOptions()` 装饰器将其传递给选项对象。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}
```

::: tip
`@SerializeOptions()` 装饰器是从 `@nestjs/common` 导入的。
:::

通过 `@SerializeOptions()` 传递的选项作为基础 `classToPlain()` 函数的第二个参数传递。在此示例中，我们将自动排除以**_**前缀开头的所有属性。



## `WebSocket` 和微服务

尽管本章显示了使用 `HTTP` 样式应用程序(例如 `Express` 或 `Fastify`)的示例，但无论使用哪种传输方法，`ClassSerializerInterceptor` 都可用于 `WebSockets` 和微服务。


## 学习更多

在[<font color=red>这里</font>](https://github.com/typestack/class-transformer)阅读更多有关 `class-transformer` 包提供的可用装饰器和选项的信息。