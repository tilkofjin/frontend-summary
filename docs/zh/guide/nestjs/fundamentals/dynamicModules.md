---
title: 动态模块
lang: zh-CN
---

## 动态模块

"[<font color=red>模塊</font>](https://docs.nestjs.com/modules)"一章介紹了 `Nest` 模塊的基礎知識，並簡要介紹了[<font color=red>動態模塊</font>](https://docs.nestjs.com/modules#dynamic-modules)。本章擴展了動態模塊的主題。完成後，您應該對它們是什麼以及如何以及何時使用它們有很好的了解。


## 介绍

文档"概述"部分中的大多数应用程序代码示例都使用常规或静态模块。模块定义了组件组，例如提供者和控制器，它们作为整体应用程序的模块化部分组合在一起。它们为这些组件提供了执行上下文或作用域。例如，模塊中定義的提供者對模塊的其他成員可見，而無需導出它們。當提供者需要在模塊外部可見時，它首先從其主機模塊中導出，然後導入到其使用模塊中。

讓我們來看一個熟悉的例子。

首先，我們將定義一個 `UsersModule` 以提供和導出 `UsersService`。`UsersModule` 是 `UsersService` 的宿主模塊。

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

接下來，我們將定義一個 `AuthModule`，它導入 `UsersModule`，從而使 `AuthModule` 中可以使用 `UsersModule` 的導出提供程序：

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

這些構造使我們可以將 `UsersService` 注入到例如 `AuthModule` 中託管的 `AuthService中`：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}
```

我们将其称为静态模块绑定。`Nest` 已在主机和使用模块中声明了将模块连接在一起所需的所有信息。让我们解压缩此过程中发生的事情。`Nest` 通过以下方式使 `AuthModule` 中的 `UsersService` 可用：
  1、实例化 `UsersModule`，包括可转换地导入 `UsersModule` 本身使用的其他模块，以及可转换地解决任何依赖关系(请参阅自定义提供者)
  2、實例化 `AuthModule`，並使 `UsersModule` 的導出提供者可用於 `AuthModule` 中的組件(就像它們已在 `AuthModule` 中聲明一樣)。
  3、在 `AuthService` 中註入 `UsersService` 的實例。


## 动态模块用例

使用靜態模塊綁定，使用模塊將沒有機會**影響**主機模塊中提供者的配置方式。為什麼這麼重要？考慮以下情況：我們有一個通用模塊，該模塊在不同用例中需要表現不同。這類似於許多系統中的 "插件" 的概念，在該系統中，通用設施需要一些配置才能被消費者使用。

`Nest` 的一個很好的例子是**配置模塊**。許多應用程序發現使用配置模塊來外部化配置詳細信息很有用。這樣可以輕鬆地動態更改不同部署中的應用程序設置：例如，用於開發人員的開發數據庫，用於登录/測試環境的登录數據庫等。通過將配置參數的管理委派給配置模塊，應用程序源代碼將保持獨立於配置參數的狀態。

挑戰在於，配置模塊本身是通用的(類似於 "插件")，因此需要由其使用模塊自定義。這是動態模塊發揮作用的地方。使用動態模塊功能，我們可以使配置模塊動態化，以便使模塊可以使用 `API​​` 來控製配置模塊在導入時的自定義方式。

換一種說法，動態模塊提供了用於將一個模塊導入另一個模塊的 `API`，並自定義該模塊在導入時的屬性和行為，這與使用到目前為止我們看到的靜態綁定相反。


## 配置模塊示例

在本节中，我们将使用[<font color=red>配置章节</font>](https://docs.nestjs.com/techniques/configuration#service)中示例代码的基本版本。截至本章末尾的完整版本在此处可用作工作[示例](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)。

我们的要求是使 `ConfigModule` 接受选项对象以对其进行自定义。这是我们将要支持的功能。基本示例将 `.env` 文件的位置硬编码为项目根文件夹。假设我们要使它可配置，以便您可以在您选择的任何文件夹中管理 `.env` 文件。例如，假设您想将各种 `.env` 文件存储在项目根目录下名为 `config` 的文件夹中(即src的同级文件夹)。在不同项目中使用 `ConfigModule` 时，您希望能够选择其他文件夹。

动态模块使我们能够将参数传递到要导入的模块中，因此我们可以更改其行为。让我们看看它是如何工作的。如果我们从最终目标开始，从使用模块的角度看，然后向后工作，这将很有帮助。首先，让我们快速回顾一下静态导入 `ConfigModule` 的示例(即，一种无法影响导入模块行为的方法)。请密切注意 `@Module()` 装饰器中的 `imports数组`：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

让我们考虑一下动态模块导入(我们在其中传递配置对象的地方)可能看起来像什么。比较这两个示例在 `imports` 数组中的区别：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

让我们看看上面的动态示例中发生了什么。有哪些变化的地方？
  1、`ConfigModule` 是一个普通的类，因此我们可以推断出它必须具有一个称为 `register()` 的静态方法。我们知道它是静态的，因为我们在 `ConfigModule` 类上而不是在该类的实例上调用它。注意：我们即将创建的此方法可以具有任意名称，但是按照约定，我们应该将其命名为 `forRoot()` 或 `register()`。
  2、`register()` 方法由我们定义，因此我们可以输入我们喜欢的任何参数。在这种情况下，我们将接受具有适当属性的简单选项对象，这是典型的情况。
  3、我们可以推断 `register()` 方法必须返回类似于模块的内容，因为其返回值出现在熟悉的导入列表中，目前为止，我们已经看到该列表包括模块列表。

实际上，我们的 `register()` 方法将返回的是 `DynamicModule`。动态模块无非就是在运行时创建的模块，它具有与静态模块相同的确切属性，外加一个称为模块的附加属性。让我们快速回顾一下示例静态模块声明，并密切注意传递给装饰器的模块选项：

```typescript
@Module({
  imports: [DogsService],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
```

动态模块必须返回具有完全相同接口的对象，外加一个称为模块的附加属性。模块属性用作模块的名称，并且应与模块的类名相同，如下例所示。

::: tip
对于动态模块，模块选项对象的所有属性都是可选的，模块除外。
:::

静态 `register()` 方法呢？现在我们可以看到它的工作是返回一个具有 `DynamicModule` 接口的对象。当我们调用它时，我们实际上是在导入列表中提供一个模块，类似于在静态情况下通过列出模块类名的方式。换句话说，动态模块 `API` 只是返回一个模块，而不是固定 `@Modules` 装饰器中的属性，而是通过编程方式指定它们。

仍然需要涵盖一些细节以帮助使图片完整：
  1、现在我们可以声明 `@Module()` 装饰器的 `imports` 属性不仅可以采用模块类名称(例如，`imports：[UsersModule]`)，还可以采用返回动态模块的函数(例如，`imports：[ConfigModule.register(...)]`。
  2、动态模块本身可以导入其他模块。在此示例中，我们不会这样做，但是如果动态模块依赖于其他模块的提供程序，则可以使用可选的 `imports` 属性导入它们。同样，这与使用 `@Module()` 装饰器为静态模块声明元数据的方式完全相似。

有了这种理解，我们现在可以看看动态 `ConfigModule` 声明必须是什么样子。让我们来解决一下。

```typescript

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
```

现在应该清楚各部分如何结合在一起。调用 `ConfigModule.register(...)` 将返回一个 `DynamicModule` 对象，该对象的属性与到现在为止通过 `@Module()` 装饰器作为元数据提供的属性基本上相同。

::: tip
从 `@nestjs/common` 导入 `DynamicModule`。
:::

但是，我们的动态模块还不是很有趣，因为我们没有像我们所说的那样引入任何配置它的功能。接下来解决这个问题。


## 模塊配置

定制 `ConfigModule` 行为的明显解决方案是在静态 `register()` 方法中向其传递一个 `options` 对象，正如我们在上面猜测的那样。让我们再次看一下消费模块的 `imports` 属性：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

这很好地处理了将选项对象传递到动态模块的问题。然后我们如何在 `ConfigModule` 中使用该选项对象。让我们考虑一下。我们知道 `ConfigModule` 基本上是一个主机，用于提供和导出可注入服务 `-ConfigService-` 供其他提供程序使用。实际上，我们的 `ConfigService` 需要读取 `options` 对象以自定义其行为。现在假设我们知道如何以某种方式将 `register()` 方法中的选项获取到 `ConfigService` 中。基于此假设，我们可以对服务进行一些更改，以基于 `options` 对象的属性来自定义其行为(注意：目前，由于我们实际上尚未确定如何传递它，因此我们仅对选项进行硬编码。我们待会儿解决)。

```typescript
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const options = { folder: './config' };

    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

现在，我们的 `ConfigService` 知道了如何在选项中指定的文件夹中找到 `.env` 文件。

我们剩下的任务是以某种方式将 `register()` 步骤中的 `options` 对象注入到 `ConfigService` 中。当然，我们将使用依赖注入来实现。这是关键点，因此请确保您理解它。我们的 `ConfigModule` 提供 `ConfigService`。`ConfigService` 依次取决于仅在运行时提供的 `options` 对象。因此，在运行时，我们需要先将 `options` 对象绑定到 `Nest IoC` 容器，然后将 `Nest` 注入到 `ConfigService` 中。请记住，在 **"自定义提供程序"** 一章中，提供程序不仅可以包含服务，还可以包含[任何值](https://docs.nestjs.com/fundamentals/custom-providers#non-service-based-providers)，因此可以很好地使用依赖项注入来处理简单的 `options` 对象。

让我们首先解决将选项对象绑定到 `IoC` 容器的问题。我们在静态 `register()` 方法中执行此操作。请记住，我们是在动态构造模块，模块的属性之一是其提供程序列表。因此，我们需要做的是将 `options` 对象定义为提供者。这将使其可注入到 `ConfigService` 中，我们将在下一步中利用它。在下面的代码中，请注意 `provider` 数组：

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(options): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
```

现在，我们可以通过将 `"CONFIG_OPTIONS"` 提供程序注入到 `ConfigService` 中来完成该过程。回想一下，当我们使用非类标记定义提供者时，我们需要使用 `@Inject()` 装饰器，[<font color=red>如此处所述</font>](https://docs.nestjs.com/fundamentals/custom-providers#non-class-based-provider-tokens)。

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable, Inject } from '@nestjs/common';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(@Inject('CONFIG_OPTIONS') private options) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

最后一点：为简单起见，我们在上面使用了基于字符串的注入令牌 `('CONFIG_OPTIONS')`，但最佳实践是在单独的文件中将其定义为常量(或 `Symbol`)，然后导入该文件。

```typescript
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
```

## 示例

可在此處找到本章代碼的[<font color=red>完整示例</font>](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)。

















