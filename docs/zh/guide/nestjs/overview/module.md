---
title: 模块
lang: zh-CN
---

## 模块介绍

模块是用 `@Module()` 装饰器注释的类，`@Module()` 装饰器提供了元数据， `Nest` 可以用它来组织应用程序的结构。
![img](https://docs.nestjs.com/assets/Modules_1.png "模块")

每个应用程序都有至少一个模块即**根模块**，根模块是 Nest 开始安排应用程序树的地方,Nest 会用来解析模块和提供者关系以及依赖关系的内部数据结构。一般情况下，当应用程序很小时，可能只有根模块。我们要强调，强烈建议将模块作为组织组件的有效方法。因此，对于大多数应用，最终的架构将采用多个模块，每个模块封装一组紧密相关的功能。

`@module()` 装饰器接受一个描述模块属性的对象：

|    对象   |    描述    |
|---------- |:----------:|
| `providers` | Nest注入器将实例化的提供者，并且至少可以在此模块之间共享这些提供者 |
| `controllers` | 此模块中定义的必须实例化的一组控制器 |
| `imports` | 导入模块的列表,该模块导出所需提供程序的导入模块列表 |
| `exports` | 由本模块提供并应在其他模块中可用的提供者的子集 |

默认情况下，该模块封装提供程序，这意味着无法注入既不是当前模块的直接组成部分，也不是从导入的模块导出的提供程序，因此，可以将从模块导出的提供程序视为模块的公共接口或API。

## 功能模块
`CatsController` 和 `CatsService` 属于同一应用程序域。由于它们密切相关，应该考虑将它们移动到一个功能模块下，即 CatsModule。功能模块仅组织与特定功能相关的代码，这样组织后代码更清晰，随着应用程序或团队规模的增长，有助于我们管理复杂性并利用[SOLID](https://en.wikipedia.org/wiki/SOLID)原理进行开发。

为了实现上述功能，演示创建 `CatsModule`
::: tip 官方示例
    cats/cats.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

::: tip
可以使用CLI创建模块，执行命令 `$ nest g module cats`
:::

以上，我们在 `cats.module.ts` 文件中定义了 `CatsModul`，并将与此模块相关的所有内容移至 `cats` 目录。最后将该模块导入到根模块中(即在 `app.module.ts` 文件中定义的 `AppModule` 内)。

```typescript
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

这是现在的目录结构样式：
```
    src
    ├──cats
    │    ├──dto
    │    │   └──create-cat.dto.ts
    │    ├──interfaces
    │    │     └──cat.interface.ts
    │    ├─cats.service.ts
    │    ├─cats.controller.ts
    │    └──cats.module.ts
    ├──app.module.ts
    └──main.ts
```

## 共享模块

在Nest中，默认情况下模块是**单例**，因此可以在多个模块之间共享任何提供程序的相同实例。

![img](https://docs.nestjs.com/assets/Shared_Module_1.png "共享模块")

每个模块自动是一个共享模块，创建后，任何模块均可重用。假设要在其他模块之间共享 `CatsService`，首先需要通过将 `CatsService` 提供程序添加到模块的导出数组中来导出，示例如下:
::: tip 官方示例
    cats.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
```

现在，任何导入 `CatsModule` 的模块都可以访问 `CatsService`，并将与导入该模块的所有其他模块共享。

## 模块重新导出

如上所示，模块可以导出其内部的提供者。此外，他们可以重新导出自己导入的模块。示例如下，`CommonModule` 既可以从 `CoreModule` 导入，也可以从 `CoreModule` 导出，使其可用于导入此模块的其他模块。

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

## 依赖注入

模块类也可以注入提供者(例如，出于配置目的)

::: tip 官方示例
    cats.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {
  constructor(private catsService: CatsService) {}
}
```

然而，由于[循环依赖](https://docs.nestjs.com/fundamentals/circular-dependency)，模块类不能注入到提供者中。

## 全局模块

如果在各处导入同一组模块,显得特别繁琐，与 `Angular` 的全局注册不同，Nest将提供程序封装在模块范围内，如果不先导入封装模块，就无法在其他地方使用模块的提供者，但有时这些提供者要求开箱即用(例如 helper，数据库连接等)，可以 `使用@Global()` 装饰器将模块设置为全局。

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

`@Global()` 装饰器使模块成为全局作用域，全局模块只注册一次，通常由根或核心模块组成。上面的示例， `CatsService` 提供商将处于全局模式，希望注入服务的模块将不需要在其导入数组中导入 `CatsModule`。

::: tip
全局模块可用于减少必要的样板数量，但大量使用并不是一个好的设计决策，导入数组通常是使消费者可以使用模块 API 的首选方法。
:::

## 动态模块

动态模块是Nest模块系统中的一个强大功能，它可以轻松创建可自定义的模块，这些模块可以动态注册和配置提供程序。这里有相关[详细介绍](https://docs.nestjs.com/fundamentals/dynamic-modules)，这里只做简要概叙。

以下是 `DatabaseModule` 的动态模块定义的示例：

```typescript
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
```

::: tip
  `forRoot()` 方法可以同步或异步( `Promise` )返回动态模块
:::

模块默认定义了 `Connection` 提供程序(在 `@Module()` 装饰器元数据中)，此外-根据传递给方法的 `entities` 和 `options` 对象 `forRoot()` -公开提供程序的集合，例如存储库。请注意，动态模块返回的是属性扩展而不是覆盖，`@Module()` 装饰器中定义的基本模块元数据。这就是从模块中导出静态声明的 `Connection` 提供程序和动态生成的存储库提供程序的方式。

如果要在全局范围内注册动态模块，将 `global` 属性设置为 `true`即可，例：

```typescript
{
  global: true,
  module: DatabaseModule,
  providers: providers,
  exports: providers,
}
```

::: warning
    正如上所述，大量使用全局注册并不是一个好的设计方式。
:::

可以按以下方式导入和配置 `DatabaseModule`：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class AppModule {}
```

如果您想反过来重新导出动态模块，您可以在 `exports` 数组中省略 `forRoot()` 方法调用：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
  exports: [DatabaseModule],
})
export class AppModule {}
```

[动态模块](https://docs.nestjs.com/fundamentals/dynamic-modules)一章有更详细的介绍。并包含一个工作[示例](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)。