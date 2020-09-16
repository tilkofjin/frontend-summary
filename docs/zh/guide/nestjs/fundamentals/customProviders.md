---
title: 自定义提供者
lang: zh-CN
---

## 自定义提供者介绍

在前面的章节中，我们介绍了**依赖注入(DI)**的各个方面以及如何在 `Nest` 中使用它。其中也给例子是基于构造函数的依赖项注入，用于将实例(通常是服务提供者)注入类。当您了解到依赖注入是以一种基本的方式构建到 `Nest` 内核中时，您不会感到惊讶。到目前为止，我们仅探讨了一种主要模式。随着应用程序变得越来越复杂，您可能需要利用 `DI` 系统的全部功能，因此让我们对其进行更详细的研究。

## DI基础知识

依赖注入是一种控制反转( [<font color=red>IoC</font> ](https://en.wikipedia.org/wiki/Inversion_of_control))技术，您可以将依赖的实例化委派给 `IoC容器`(在我们的示例中为 `NestJS` 运行时系统)，而不是强制性地在自己的代码中完成。让我们从 "[<font color=red>提供者</font>](https://docs.nestjs.com/providers)"一章中检查此示例中发生的情况。

首先，我们定义一个提供者。`@Injectable()` 装饰器将 `CatsService` 类标记为提供者。

::: tip 官方示例
    cats.service.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }
}
```

然后，我们要求 `Nest` 将提供者注入到我们的控制器类中：

::: tip 官方示例
    cats.controller.ts
:::

```typescript
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

最后，我们在 `Nest IoC` 容器中注册提供者：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

为了使这项工作在幕后到底发生了什么？此过程包含三个关键步骤：
  1、在 `cats.service.ts` 中，`@Injectable()` 装饰器将 `CatsService` 类声明为可以由 `Nest IoC` 容器管理的类。
  2、在 `cats.controller.ts` 中，`CatsController` 通过构造函数注入声明对 `CatsService` 令牌的依赖关系：
  ```typescript
  constructor(private catsService: CatsService)
  ```
  3、在 `app.module.ts` 中，我们将令牌 `CatsService` 与 `cats.service.ts` 文件中的 `CatsService` 类关联。我们将在下面确切地看到这种关联(也称为注册)的发生方式。

当 `Nest IoC` 容器实例化 `CatsController` 时，它首先查找所有依赖项*。当找到 `CatsService` 依赖项时，它将对 `CatsService` 令牌(`token`)执行查找，并根据注册步骤(上面的＃3)返回 `CatsService` 类。假设单例范围(默认行为)，`Nest` 随后将创建 `CatsService` 实例，对其进行缓存并返回，或者如果已经缓存，则返回现有实例。

*此说明有点简化以说明这一点。我们忽略的一个重要方面是，分析代码的依赖关系的过程非常复杂，并且发生在应用程序引导期间。一个关键特征是依赖性分析(或"创建依赖关系图")是可传递的。依赖关系图可确保以正确的顺序解决依赖关系-本质上是"自下而上"。这种机制使开发人员不必管理此类复杂的依赖关系图。


## 标准提供者

让我们仔细看看 `@Module()` 装饰器。在 `app.module` 中，我们声明：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
```

`providers` 属性采用一系列提供程序。到目前为止，我们已经通过类名列表提供了这些提供程序。实际上，该语法providers：[CatsService]是更完整语法的简写：

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];
```

现在，我们看到了这种显式构造，我们可以了解注册过程。在这里，我们显然将令牌(token) `CatsService` 与 `CatsService` 类相关联。简写只是为了方便简化最常见的用例，其中令牌用于请求具有相同名称的类的实例。


## 定制提供者

当您的要求超出标准提供商所提供的要求时，会发生什么？这里有一些例子：
  - 您要创建自定义实例，而不是让 `Nest` 实例化(或返回其缓存实例)类。
  - 您想在第二个依赖关系中重用现有的类
  - 您想使用模拟版本覆盖类进行测试

`Nest` 可让您定义自定义提供者来处理这些情况。它提供了几种定义自定义提供者的方法。让我们来看看它们。


## 值提供者：useValue

`useValue` 语法对于注入常量值，将外部库放入 `Nest` 容器或用模拟对象替换实际实现很有用。假设您要强制 `Nest` 为测试目的使用模拟的 `CatsService`。

```typescript
import { CatsService } from './cats.service';

const mockCatsService = {
  /* mock implementation
  ...
  */
};

@Module({
  imports: [CatsModule],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class AppModule {}
```

在此示例中，`CatsService` 令牌将解析为 `mockCatsService` 模拟对象。`useValue` 需要一个值-在这种情况下，它是一个与要替换的 `CatsService` 类具有相同接口的文字对象。由于 `TypeScript` 的[<font color=red>结构化类型</font>](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)，您可以使用具有兼容接口的任何对象，包括文字对象或用 `new` 实例化的类实例。


## 非基于类的 provider tokens

到目前为止，我们已经使用了类名作为提供者标记(`providers` 数组中列出的提供者中的 `Provide` 属性的值)。这与用于[基于构造函数的注入](https://docs.nestjs.com/providers#dependency-injection)所使用的标准模式相匹配，其中令牌也是类名。(如果此概念尚不完全清楚，请参阅[DI基础知识](https://docs.nestjs.com/fundamentals/custom-providers#di-fundamentals)以重新学习令牌)。有时，我们可能希望灵活使用字符串或符号作为DI令牌。例如：

```typescript
import { connection } from './connection';

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class AppModule {}
```

在此示例中，我们将字符串值令牌(`'CONNECTION'`)与从外部文件导入的预先存在的连接对象相关联。

::: tip
除了使用字符串作为标记值之外，您还可以使用 `JavaScript` 符号。
:::

前面我们已经看到了如何使用基于标准构造函数的注入模式来注入提供者。此模式要求使用类名声明依赖项。`"CONNECTION"` 自定义提供者使用字符串值令牌。让我们看看如何注入这样的提供者。为此，我们使用 `@Inject()` 装饰器。这个装饰器接受一个参数-`token`。

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```

::: tip
`@Inject()` 装饰器是从 `@nestjs/common` 包导入的。
:::

尽管在上面的示例中我们直接使用字符串 `"CONNECTION"` 来进行说明，但为了进行清晰的代码组织，最佳实践是在单独的文件中定义标记，例如 `constants.ts`。就像对待在自己的文件中定义，并在需要的地方导入的符号或枚举一样，对它们进行处理。


## 类提供者：useClass

`useClass` 语法允许您动态确定令牌应解析为的类。例如，假设我们有一个抽象(或默认)的 `ConfigService` 类。以下代码实现了这种策略。

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
};

@Module({
  providers: [configServiceProvider],
})
export class AppModule {}
```

讓我們來看一下此代碼示例中的一些細節。您會注意到，我們首先用文字對象定義 `configServiceProvider`，然後在模塊裝飾器的 `providers` 屬性中傳遞它。這只是一些代碼組織，但是在功能上等同於我們到目前為止在本章中使用的示例。

另外，我们使用 `ConfigService` 类名称作为令牌。对于任何依赖 `ConfigService` 的类，`Nest` 都会注入所提供类的实例(`DevelopmentConfigService` 或 `ProductionConfigService`)，该实例将覆盖在其他地方已声明的任何默认实现(例如，使用 `@Injectable()` 装饰器声明的 `ConfigService`)。


## 工厂提供者：useFactory

`useFactory` 语法允许动态创建提供者。实际提供者将由工厂函数返回的值提供。工厂功能可以根据需要简单或复杂。一个简单的工厂可能不依赖任何其他提供者。一家更复杂的工厂本身可以注入其他提供者，以计算其结果。对于后一种情况，工厂提供者语法具有一对相关的机制：
  1、工厂函数可以接受(可选)参数。
  2、(可選) `inject` 屬性接受一組提供者，在實例化過程中，`Nest` 將解析這些提供者並將其作為參數傳遞給工廠函數。這兩個列表應該相互關聯：`Nest` 將以相同的順序將注入列表中的實例作為參數傳遞給工廠函數。

下面的示例演示了這一點。

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
})
export class AppModule {}
```


## 别名提供者：useExisting

`useExisting` 语法允许您为现有提供者创建别名。这创建了两种访问同一提供程序的方式。在下面的示例中，(基于字符串的)令牌 `"AliasedLoggerService"` 是(基于类的)令牌 `LoggerService` 的别名。假设我们有两个不同的依赖项，一个依赖于 `"AliasedLoggerService"`，另一个依赖于 `LoggerService`。如果兩個依賴項都通過单例作用域指定，則它們都將解析為同一實例。

```typescript
@Injectable()
class LoggerService {
  /* implementation details */
}

const loggerAliasProvider = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService,
};

@Module({
  providers: [LoggerService, loggerAliasProvider],
})
export class AppModule {}
```


## 非基于服务的提供者

尽管提供者经常提供服务，但它们不限于这种用法。提供者可以提供任何价值。例如，提供者可以根據當前環境提供一系列配置對象，如下所示：

```typescript
const configFactory = {
  provide: 'CONFIG',
  useFactory: () => {
    return process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
  },
};

@Module({
  providers: [configFactory],
})
export class AppModule {}
```


## 导出自定义提供者

像任何提供者一样，自定义提供者的范围仅限于其声明模块。为了使其对其他模块可见，必须将其导出。要導出自定義提供者，我們可以使用其令牌或完整的提供者對象。

以下示例顯示了使用令牌進行導出：

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
})
export class AppModule {}
```

或者，使用完整的提供者對象導出：

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class AppModule {}
```








