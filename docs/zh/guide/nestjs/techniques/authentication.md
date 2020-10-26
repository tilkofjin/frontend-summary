---
title: 认证方式
lang: zh-CN
---

## 认证方式介绍

身份验证是大多数应用程序中必不可少的部分。有很多不同的方法和策略来处理身份验证。任何项目采用的方法取决于其特定的应用程序要求。本章介绍了几种可以适应各种不同要求的身份验证方法：

[<font color=red>Passport</font>](https://github.com/jaredhanson/passport)是最受欢迎的 `node.js` 身份验证库，在社区中广为人知并成功用于许多生产应用中。使用 `@nestjs/passport` 模块将该库与 `Nest` 应用程序集成起来很简单。在较高级别，`Passport` 执行一系列步骤以：

- 通过验证用户的 "凭据" (例如用户名/密码，JSON Web token(JWT) 或来自身份提供者的身份令牌)
- 管理身份验证状态(通过发出可移植的 token (例如JWT) 或创建 [<font color=red>Express 会话</font>](https://github.com/expressjs/session))
- 将有关经过身份验证的用户的信息附加到 `Request` 对象，以在路由处理程序中进一步使用

`Passport` 具有丰富的策略生态系统，可实施各种身份验证机制。虽然概念上很简单，但是您可以选择的 `Passport` 策略集很大，并且存在很多变化。`Passport` 将这些不同的步骤抽象为标准模式，`@nestjs/passport` 模块将该模式包装并标准化为熟悉的 `Nest` 结构。

在本章中，我们将使用这些强大而灵活的模块为 `RESTful API` 服务器实现完整的端到端身份验证解决方案。您可以使用此处描述的概念来实施任何 `Passport` 策略以自定义身份验证方案。您可以按照本章中的步骤构建完整的示例。您可以在[此处](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)找到带有完整示例应用程序的存储库。

## 认证要求

让我们充实我们的要求。 对于此用例，客户端将从使用用户名和密码进行身份验证开始。一旦通过身份验证，服务器将发出一个 `JWT`，该 `JWT` 可以作为[承载令牌在后续请求中的授权标头](https://tools.ietf.org/html/rfc6750)中发送以证明身份验证。我们还将创建一个受保护的路由，只有包含有效 `JWT` 的请求才能访问该路由。

我们将从第一个要求开始：对用户进行身份验证。然后，我们将通过发布 `JWT` 来扩展它。最后，我们将创建一个受保护的路由，以检查请求上的有效 `JWT` 。

首先，我们需要安装所需的软件包。`Passport` 提供了称为[passport-local](https://github.com/jaredhanson/passport-local)的策略，该策略实现了用户名/密码身份验证机制，符合我们对用例这一部分的需求。

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
```

::: tip
对于您选择的任何 `Passport` 策略，您将始终需要 `@nestjs/passport` 和护照包。然后，您需要安装特定于策略的软件包(例如，`passport-jwt` 或 `passport-local`)，以实现您要构建的特定身份验证策略。此外，您还可以为任何 `Passport` 策略安装类型定义，如上面的 `@types/passport-local` 所示，它在编写 `TypeScript` 代码时提供了帮助。
:::

## 实施 `Passport` 策略

现在，我们准备实现身份验证功能。我们将首先概述用于任何 `Passport` 策略的过程。可以将 `Passport` 本身视为一个小型框架。该框架的优雅之处在于，它将身份验证过程抽象为您根据要实施的策略自定义的几个基本步骤。您可以通过以回调函数的形式提供自定义参数(作为纯 `JSON` 对象)和自定义代码来进行配置。`@nestjs/ passport` 模块将此框架包装在 `Nest` 样式包中，从而易于集成到 `Nest` 应用程序中。我们将在下面使用 `@nestjs/passport`，但首先让我们考虑一下 `Vanilla Passport` 的工作原理。

在 `Vanilla Passport` 中，您通过提供以下两点来配置策略：
  1、特定于该策略的一组选项。例如，在 `JWT` 策略中，您可以提供一个秘密来对令牌进行签名。
  2、"验证回调"，您可以在其中告诉 `Passport` 如何与用户商店进行交互(您可以在其中管理用户帐户)。在这里，您验证用户是否存在（或创建一个新用户），以及他们的凭据是否有效。如果验证成功，`Passport` 库希望此回调返回完整的用户，如果失败，则返回 `null`(失败定义为找不到用户，或者，如果是 `passport-local`，则密码不匹配)。

使用 `@nestjs/passport`，可以通过扩展 `PassportStrategy` 类来配置 `Passport` 策略。通过在子类中调用 `super()` 方法来传递策略选项(上面的项目1)，可以选择传入一个选项对象。您可以通过在子类中实现 `validate()` 方法来提供 `verify` 回调(上面的项目2)。

我们将从生成一个 `AuthModule` 以及其中的 `AuthService` 开始：

```bash
$ nest g module auth
$ nest g service auth
```

在实现 `AuthService` 时，我们发现将用户操作封装在 `UsersService` 中很有用，因此，让我们现在生成该模块和服务：

```bash
$ nest g module users
$ nest g service users
```

替换这些生成文件的默认内容，如下所示。对于我们的示例应用程序，`UsersService` 只需维护一个硬编码的内存用户列表，以及一个通过用户名检索的查找方法。在真实的应用中，您可以使用选择的库(例如 `TypeORM，Sequelize，Mongoose` 等)在此处构建用户模型和持久层。

::: tip 官方示例
    users/users.service.js
:::

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        userId: 2,
        username: 'chris',
        password: 'secret',
      },
      {
        userId: 3,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async findOne(username) {
    return this.users.find(user => user.username === username);
  }
}
```

在 `UsersModule` 中，唯一需要做的更改是将 `UsersService` 添加到 `@Module` 装饰器的 `exports` 数组中，以便在此模块外部可见(我们将在 `AuthService` 中很快使用它)。

::: tip 官方示例
    users/users.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

我们的 `AuthService` 负责检索用户并验证密码。为此，我们创建一个 `validateUser()` 方法。在下面的代码中我们使用方便的 `ES6` 扩张操作符(...)在返回用户对象之前从用户对象中删除 `password` 属性。稍后，我们将从 `Passport` 本地策略中调用 `validateUser()` 方法。

::: tip 官方示例
    auth/auth.service.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
```

::: warning
当然，在实际的应用程序中，您不会以纯文本形式存储密码。取而代之的是使用带有单向哈希算法的 [<font color=red>bcrypt</font>](https://github.com/kelektiv/node.bcrypt.js#readme)之类的库。采用这种方法，您只需存储哈希密码，然后将存储的密码与输入密码的哈希版本进行比较，因此，切勿以纯文本格式存储或公开用户密码。为了使我们的示例应用程序简单，我们违反了该绝对授权，并使用纯文本。<font color=red>不要在您的真实应用中这样做！</font>
:::

现在，我们更新 `AuthModule` 以导入 `UsersModule`。

::: tip 官方示例
    auth/auth.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
```


## 在本地实施 `Passport`
现在我们可以实施我们的 `Passport` 本地身份验证策略，在 `auth` 文件夹中创建一个名为 `local.strategy.ts` 的文件，并添加以下代码：

::: tip 官方示例
    auth/local.strategy.ts
:::

```typescript
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

对于所有 `Passport` 策略，我们都遵循了前面介绍的方法。在我们的本地护照使用案例中，没有配置选项，因此我们的构造函数只调用 `super()`，而没有选项对象。

::: tip
我们可以在对 `super()` 的调用中传递一个 `options` 对象，以自定义护照策略的行为。在此示例中，默认情况下，本地护照策略在请求正文中期望使用名为用户名和密码的属性。传递一个选项对象以指定不同的属性名称。例如：`super({{usernameField：'email'})`。有关更多信息，请参见 `Passport` 文档。
:::

我们还实现了 `validate()` 方法。对于每种策略，`Passport` 将使用适当的策略特定的参数集调用 `verify` 函数(通过 `@nestjs/passport` 中的 `validate()` 方法实现)。对于本地策略，`Passport` 希望使用带有以下签名的 `validate()` 方法：`validate(username: string, password:string): any`。

大多数验证工作是在我们的 `AuthService` 中完成的(借助于 `UsersService` 的帮助)，因此此方法非常简单。任何 `Passport` 策略的 `validate()` 方法将遵循类似的模式，仅在表示凭据的方式细节方面有所不同。如果找到用户并且凭据有效，返回用户，以便 `Passport` 可以完成其任务(例如，在 `Request` 对象上创建 `user`属性)，并且请求处理管道可以继续。如果找不到，我们将抛出一个异常并让我们的[异常层](https://docs.nestjs.com/exception-filters)处理它。

通常，每种策略的 `validate()` 方法的唯一重要区别是您如何确定用户是否存在并有效。例如，在 `JWT` 策略中，根据要求，我们可能会评估解码令牌中携带的 `userId` 是否与我们的用户数据库中的记录匹配，或匹配已撤销令牌的列表。因此，这种子分类和实施策略特定验证的模式是一致，优雅且可扩展的。

我们需要配置 `AuthModule` 以使用我们刚刚定义的 `Passport` 功能。更新 `auth.module.ts` 如下所示：

::: tip 官方示例
    auth/auth.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
```


## 内置 `passport` 守卫

`Guards` 一章介绍了 `Guards` 的主要功能：确定请求是否将由路由处理程序处理。事实仍然如此，我们将很快使用该标准功能。但是，在使用 `@nestjs/passport` 模块的情况下，我们还将介绍一些起初可能会引起混淆的细微新皱纹，所以现在让我们进行讨论。从身份验证的角度考虑，您的应用可以处于两种状态：
  1、用户/客户端未登录(未认证)
  2、用户/客户端已登录(已验证)

在第一种情况下(用户未登录)，我们需要执行两个不同的功能：
  - 限制未经身份验证的用户可以访问的路由(即拒绝访问受限制的路由)。通过将 `Guard` 放在受保护的路由上，我们将以其熟悉的能力使用 `Guards` 来处理此功能。如您所料，我们将检查此 `Guard` 中是否存在有效的 `JWT`，因此，一旦我们成功发布 `JWT`，我们将在稍后使用此 `Guard`。
  - 当先前未经身份验证的用户尝试登录时，初始化**身份验证步骤**。这是我们向有效用户发出 `JWT` 的步骤。考虑片刻，我们需要发送用户名/密码凭证才能启动身份验证，因此我们将设置 `POST /auth  /login` 路由来处理该问题。这就提出了一个问题：我们究竟如何在那条路线中调用 `passport-local` 策略?

答案很简单：通过使用另一种略有不同的 `Guard` 类型。`@nestjs/passport` 模块为我们提供了一个内置的 `Guard` 来为我们执行此操作。该 `Guard` 调用 `Passport` 策略并启动上述步骤(检索凭据，运行验证功能，创建用户属性等)。

上面列举的第二种情况(登录用户)仅依赖于我们已经讨论过的 `Guard` 的标准类型，以使登录用户能够访问受保护的路由。


## 登陆路由