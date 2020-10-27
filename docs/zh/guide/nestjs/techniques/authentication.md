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

有了适当的策略，我们现在可以实现准系统 `/auth /login` 路由，并应用内置的 `Guard` 来启动`passport-local` 流程。

打开 `app.controller.ts` 文件，并将其内容替换为以下内容：

::: tip 官方示例
    app.controller.ts
:::

```typescript
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
}
```

通过 `@UseGuards(AuthGuard('local'))`，我们使用的 `AuthGuard` 在扩展 `passport-local` 策略时会自动为我们提供 `@nestjs/passport`。让我们分解一下。我们的 `Passport` 本地策略的默认名称为 `"local"`。我们在 `@UseGuards()` 装饰器中引用该名称，以将其与 `passport-local` 包提供的代码关联。如果我们的应用程序中有多个 `Passport` 策略(每个策略可能提供特定于策略的 `AuthGuard`)，则使用他的值来消除要调用的策略的歧义。到目前为止，我们只有这样一种策略，我们将很快添加，因此需要消除歧义。

为了测试我们的路由，我们将使用 `/auth  /login` 路由暂时返回用户。这也使我们能够演示另一个 `Passport` 功能：`Passport` 会自动创建一个用户对象，基于我们从 `validate()` 方法返回的值，并将其作为 `req.user` 分配给 `Request` 对象。稍后，我们将其替换为代码以创建并返回 `JWT`。

由于这些是 `API` 路由，我们将使用常用的 [<font color=red>CURL</font>](https://curl.haxx.se/) 库对其进行测试。您可以使用在 `UsersService` 中硬编码的任何用户对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"userId":1,"username":"john"}
```

在此过程中，将策略名称直接传递给 `AuthGuard()` 会在代码库中引入魔术字符串。相反，我们建议您创建自己的类，如下所示：

::: tip 官方示例
    auth/local-auth.guard.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

现在，我们可以更新 `/auth  /login` 路由处理程序，并改用 `LocalAuthGuard`：

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/login')
async login(@Request() req) {
  return req.user;
}
```


## `JWT` 功能

我们准备继续进行身份验证系统的 `JWT` 部分。让我们回顾并完善我们的要求：
  - 允许用户使用用户名/密码进行身份验证，返回一个 `JWT`，以便在随后对受保护的 `API` 端点的调用中使用。我们正在努力满足这一要求。要完成它，我们需要编写发出 `JWT` 的代码。
  - 创建基于有效 `JWT` 作为承载令牌受到保护的 `API` 路由

我们将需要安装更多软件包来支持我们的 `JWT` 要求：

```bash
$ npm install --save @nestjs/jwt passport-jwt
$ npm install --save-dev @types/passport-jwt
```

`@nestjs/jwt` 软件包([请参见此处](https://github.com/nestjs/jwt))是一个实用程序软件包，可帮助进行 `JWT` 操作。`Passport-jwt` 包是实现 `JWT` 策略的 `Passport` 包，`@types/passport-jwt` 提供 `TypeScript` 类型定义。

让我们仔细看看 `POST /auth /login` 请求的处理方式。我们使用 `passport-local` 策略提供的内置 `AuthGuard` 装饰了路线。这意味着：
  1、仅当用户通过验证后，才会调用路由处理程序
  2、`req` 参数将包含一个用户属性(在 `passport-local` 认证流程中由 `Passport` 填充)

考虑到这一点，我们现在可以最终生成一个真实的 `JWT`，并以这种方式返回它。为了保持我们的服务干净模块化，我们将在 `authService` 中处理生成 `JWT`。打开`auth` 文件夹中的 `auth.service.ts` 文件，并添加 `login()` 方法，并导入 `JwtService`，如下所示：

::: tip 官方示例
    auth/auth.service.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

我们正在使用 `@nestjs/jwt` 库，它提供了 `sign()` 函数来根据用户对象属性的子集生成 `JWT`，然后将其作为具有单个 `access_token` 属性的简单对象返回。注意：我们选择 `sub` 的属性名称来保存我们的 `userId` 值，以与 `JWT` 标准保持一致。不要忘记将 `JwtService` 提供程序注入 `AuthService`。

现在，我们需要更新 `AuthModule` 以导入新的依赖项并配置 `JwtModule`。
首先，在 `auth` 文件夹中创建 `constants.ts`，并添加以下代码：

::: tip 官方示例
    auth/constants.ts
:::

```typescript
export const jwtConstants = {
  secret: 'secretKey',
};
```

我们将使用它在 `JWT` 签名和验证步骤之间共享密钥。

::: warning
<font color=red>请勿公开公开此密钥。</font>我们这样做是为了清楚代码在做什么，但是在生产系统中，您必须使用适当的措施(例如，密钥库，环境变量或配置服务)来保护此密钥。
:::

现在，在 `auth` 文件夹中打开 `auth.module.ts` 并将其更新为如下所示：

::: tip 官方示例
    auth/auth.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

我们使用 `register()` 配置 `JwtModule`，并传入配置对象。有关 `Nest JwtModule` 的更多信息，[请参见此处](https://github.com/nestjs/jwt/blob/master/README.md)；有关可用配置选项的更多详细信息，[请参见此处](https://github.com/auth0/node-jsonwebtoken#usage)。

现在，我们可以更新 `/auth  /login` 路由以返回 `JWT`。

::: tip 官方示例
    app.controller.ts
:::

```typescript
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
```

让我们继续使用 `CURL` 测试我们的路线。您可以使用在 `UsersService` 中硬编码的任何用户对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated
```

## 实施 `Passport JWT`

现在，我们可以满足我们的最终要求：通过要求请求中存在有效的 `JWT` 来保护端点。`Passport` 也可以在这里帮助我们。它提供了用于通过 `JSON Web` 令牌保护 `RESTful` 端点的 `password-jwt` 策略。首先在 `auth` 文件夹中创建一个名为 `jwt.strategy.ts` 的文件，然后添加以下代码：

::: tip 官方示例
    auth/jwt.strategy.ts
:::

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

通过我们的 `JwtStrategy`，我们遵循了前面针对所有 `Passport` 策略所述的相同方法。这种策略需要一些初始化，因此我们通过在 `super()` 调用中传入一个 `options` 对象来实现。您可以在[此处](https://github.com/mikenicholson/passport-jwt#configure-strategy)阅读更多有关可用选项的信息。这些选项是：
  - `jwtFromRequest`：提供从请求中提取 `JWT` 的方法。我们将使用在 `API` 请求的 `Authorization` 标头中提供承载令牌的标准方法。[此处](https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request)介绍了其他选项。
  - `ignoreExpiration`：为了明确起见，我们选择默认的 `false` 设置，该设置将确保 `JWT` 尚未过期的责任委托给 `Passport` 模块。这意味着，如果我们的路由提供有过期的 `JWT`，则该请求将被拒绝，并发送 `401` 未经授权的响应。`Passport` 会为我们自动方便地处理此问题。
  - `secretOrKey`：我们正在使用权宜之计，即提供对称加密来对令牌进行签名。其他选项(例如，`PEM` 编码的公共密钥)可能更适合生产应用程序(请参阅[此处](https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request)以获取更多信息)。在任何情况下，如前所述，**请勿公开公开此秘密**。

`validate()` 方法值得讨论。对于 `jwt-strategy`，`Passport` 首先验证 `JWT` 的签名并解码 `JSON`。然后，它调用我们的 `validate()` 方法，将解码后的 `JSON` 作为其单个参数传递。根据 `JWT` 签名的工作方式，我们可以确保我们收到的是先前已签名并颁发给有效用户的有效令牌。

所有这些的结果是，我们对 `validate()` 回调的响应是微不足道的：我们仅返回一个包含 `userId` 和 `username` 属性的对象。再次回想一下，`Passport` 将基于 `validate()` 方法的返回值构建一个用户对象，并将其作为属性附加到 `Request` 对象上。

还值得指出的是，这种方法给我们留下了空间("钩子")，将其他业务逻辑注入到流程中。例如，我们可以在 `validate()` 方法中进行数据库查找，以提取有关用户的更多信息，从而在我们的请求中提供更丰富的用户对象。这也是我们可能决定进行进一步令牌验证的地方，例如在已撤销令牌列表中查找 `userId`，从而使我们能够执行令牌注销。在示例代码中，我们在此处实现的模型是快速"无状态 `JWT` "模型，其中，每个 `API` 调用都会根据有效 `JWT` 的存在以及有关请求者的少量信息(其 `userId` 和 `username`)可在我们的请求管道中找到。

在 `AuthModule` 中将新的 `JwtStrategy` 添加为提供者：

::: tip 官方示例
    auth/auth.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

通过导入在签署 `JWT` 时使用的相同密钥，确保由 `Passport` 执行的验证阶段和在 `AuthService` 中执行的签署阶段均使用公共密钥。

最后，我们定义 `JwtAuthGuard` 类，该类扩展了内置的 `AuthGuard`：

::: tip 官方示例
    auth/jwt-auth.guard.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## 实施受保护的路由和 `JWT` 策略防护

现在，我们可以实现受保护的路由及其关联的 `Guard`。

打开 `app.controller.ts` 文件并如下所示进行更新：

::: tip 官方示例
    app.controller.ts
:::

```typescript
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

再次，我们将应用配置了 `password-jwt` 模块时 `@nestjs/passport` 模块自动为我们配置的 `AuthGuard`。该 `Guard` 由其默认名称 `jwt` 引用。当我们的 `GET /profile` 路由被命中时，`Guard` 将自动调用我们的 `password-jwt` 定制配置的逻辑，验证 `JWT`，并将 `user` 属性分配给 `Request` 对象。

确保该应用程序正在运行，并使用 `CURL` 测试路由。

```bash
$ # GET /profile
$ curl http://localhost:3000/profile
$ # result -> {"statusCode":401,"error":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm... }

$ # GET /profile using access_token returned from previous step as bearer code
$ curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
$ # result -> {"userId":1,"username":"john"}
```

请注意，在 `AuthModule` 中，我们将 `JWT` 配置为具有60秒的到期时间。到期时间可能太短，处理令牌到期和刷新的细节不在本文讨论范围之内。但是，我们选择该方法来证明 `JWT` 的重要质量和 `passport-jwt` 策略。如果您在验证后等待60秒再尝试执行 `GET  /profile` 请求，则会收到401未经授权的响应。这是因为 `Passport` 会自动检查 `JWT` 的到期时间，从而省去了在应用程序中执行此操作的麻烦。

现在，我们已经完成了 `JWT` 身份验证的实现。`JavaScript` 客户端(例如 `Angular/React/Vue`)和其他 `JavaScript` 应用程序现在可以通过我们的 `API` 服务器进行身份验证并进行安全通信。您可以在[此处](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)中找到完整的代码版本。


## 默认策略

在我们的 `AppController` 中，我们在 `AuthGuard()` 函数中传递策略的名称。我们需要这样做，因为我们已经引入了两种 `Passport` 策略(`passport-local` 和 `passport-jwt`)，这两种策略都提供了各种 `Passport` 组件的实现。传递名称将消除我们要链接到实现的歧义。当应用程序中包含多个策略时，我们可以声明一个默认策略，这样，如果使用该默认策略，就不再需要在 `AuthGuard` 函数中传递名称。这是导入 `PassportModule` 时如何注册默认策略的方法。这段代码将放在 `AuthModule` 中：

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    UsersModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```


## 请求范围策略

`passport API` 基于向库的全局实例进行注册的策略。因此，策略的设计不具有依赖于请求的选项，也不是针对每个请求动态实例化的(更多有关[请求范围](https://docs.nestjs.com/fundamentals/injection-scopes)的提供程序的信息)。当您将策略配置为基于请求范围时，`Nest` 将不会实例化该策略，因为它没有绑定到任何特定的路由。没有物理方法可以确定每个请求应执行哪些"请求范围"策略。

但是，有一些方法可以在策略中动态解析请求范围的提供程序。 为此，我们利用[模块参考](https://docs.nestjs.com/fundamentals/module-ref)功能。

首先，打开 `local.strategy.ts` 文件并以常规方式注入 `ModuleRef`：

```typescript
constructor(private moduleRef: ModuleRef) {
  super({
    passReqToCallback: true,
  });
}
```

::: tip
从 `@nestjs/core` 包中导入 `ModuleRef` 类。
:::

确保将 `passReqToCallback` 配置属性设置为 `true`，如上所示。

在下一步中，该请求实例将用于获取当前上下文标识符，而不是生成一个新的标识符(在[此处](https://docs.nestjs.com/fundamentals/module-ref#getting-current-sub-tree)了解有关请求上下文的更多信息)。

现在，在 `LocalStrategy` 类的 `validate()` 方法内部，使用 `ContextIdFactory` 类的 `getByRequest()` 方法创建基于请求对象的上下文 `ID`，并将其传递给`resolve()` 调用：

```typescript
async validate(
  request: Request,
  username: string,
  password: string,
) {
  const contextId = ContextIdFactory.getByRequest(request);
  // "AuthService" is a request-scoped provider
  const authService = await this.moduleRef.resolve(AuthService, contextId);
  ...
}
```

在上面的示例中，`resolve()` 方法将异步返回 `AuthService` 提供程序的请求范围的实例(我们假设 `AuthService` 被标记为请求范围的提供程序)。


## 扩展守卫

在大多数情况下，使用提供的 `AuthGuard` 类就足够了。但是，当您只想扩展默认错误处理或身份验证逻辑时，可能会有用例。为此，您可以扩展内置类并在子类中重写方法。

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```


## 自定义 `Passport`

可以使用 `register()` 方法以相同的方式传递任何标准 `Passport` 定制选项。可用选项取决于所实施的策略。例如：

```typescript
PassportModule.register({ session: true });
```

您还可以在其构造函数中向策略传递选项对象以对其进行配置。对于本地策略，您可以通过一下示例：

```typescript
constructor(private authService: AuthService) {
  super({
    usernameField: 'email',
    passwordField: 'password',
  });
}
```

查看官方 [<font color=red>Passport网站</font>](http://www.passportjs.org/docs/oauth/)上的属性名称。



## 命名策略

实施策略时，可以通过将第二个参数传递给 `PassportStrategy` 函数来为其提供名称。如果您不这样做，则每个策略都会有一个默认名称(例如，`jwt-strategy` 的名称为 `"jwt"`)：

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'myjwt')
```

然后，您通过 `@UseGuards(AuthGuard('myjwt'))` 之类的装饰器来引用它。



## `GraphQL`

为了将 `AuthGuard` 与 [`GraphQL`](https://docs.nestjs.com/graphql/quick-start) 一起使用，请扩展内置的 `AuthGuard` 类并重写 `getRequest()` 方法。

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

要使用上述构造，请确保将请求 (`req`) 对象作为 `GraphQL Module` 设置中上下文值的一部分传递：

```typescript
GraphQLModule.forRoot({
  context: ({ req }) => ({ req }),
});
```

要在您的 `graphql` 解析器中获取当前经过身份验证的用户，可以定义一个 `@CurrentUser()` 装饰器：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
```

要在解析器中使用上述装饰器，请确保将其作为查询或变异的参数：

```typescript
@Query(returns => User)
@UseGuards(GqlAuthGuard)
whoAmI(@CurrentUser() user: User) {
  return this.usersService.findById(user.id);
}
```

