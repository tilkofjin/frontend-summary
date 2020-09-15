---
title: 提供者
lang: zh-CN
---

## 提供者介绍

![img](https://docs.nestjs.com/assets/Components_1.png "提供者")
控制器应处理 `HTTP` 请求并将更复杂的任务委托给 `Providers`。`Providers` 只是一个用 `@Injectable()` 装饰器注释的类，是纯粹的 `JavaScript` 类。
::: tip 强烈建议
  由于 `Nest` 可以以更多的面向对象方式设计和组织依赖性,因此请按照官方建议，强烈推荐按照[SOLID(单一功能、开闭原则、里氏替换、接口隔离以及依赖反转)](https://zh.wikipedia.org/wiki/SOLID_(%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E8%AE%BE%E8%AE%A1))原则。
:::

## 服务

创建一个简单的服务示例，该服务将负责数据存储和检索，由其使用 `CatsController`，因此它被定义为 `Provider` ，我们用这个类来装饰 `@Injectable()`。
::: tip 官方示例
    cats.service.ts
:::
```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```
::: tip 提示
  若要使用 `CLI` 创建服务类，只需输入命令 `$ nest g service cats`。
:::
`CatsService` 是具有一个属性和两个方法的基本类。唯一的新特点是它使用 `@Injectable()` 装饰器。该 `@Injectable()` 附加有元数据，因此 Nest 知道这个类是一个 `Nest Provider`。
::: tip 提示
  示例中的 `Cat` 接口如下
:::
```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```
我们现在有了一个服务类来检索 `cats`,在 `CatsController` 里使用如下
::: tip 提示
    cats.controller.ts
:::
```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```
通过类构造函数注入 `CatsService`, 注意这里的 `private` 语法，意味着我们已经在同一位置创建并初始化了 `catsService` 成员。

## 依赖注入

`Nest` 围绕着**依赖注入**构建，这是一种非常优秀的设计模式，关于**依赖注入**的相关文档官方建议参考
[Aunglar](https://angular.io/guide/dependency-injection)
借助 `typescript` 的一些优秀的能力，管理依赖项变得很容易，因为它们按类型解析，以下示例 `nest` 将展示通过创建并返回 `CatsService` 的实例来解析 `catsService`(在单例模式下，如果现有实例在其他地方被请求，则返回该实例)。解析此依赖关系并将其传递给控制器的构造函数(或分配给指定的属性)。
  
```typescript
constructor(private catsService: CatsService) {}
```

## 作用域
`Providers` 通常具有与应用程序同步的生命周期(`作用域`)，程序启动时，每个依赖都必须被解析，因此，所有 `Provider` 都要实例化，同样，当程序关闭时，每个 `Provider` 都要销毁掉，但是有些方法可以改变 `provider` 生命周期的请求范围，这里有相关详细[文档 :books:](https://docs.nestjs.com/fundamentals/injection-scopes)

## 自定义的 Providers

`Nest` 有一个内置的反转控制容器( `IoC` ),可以解决 `Providers` 之间的关系，此功能是上述**依赖项注**入功能的基础，但实际远比上述强大得多，`@Injectable()` 装饰器仅仅是冰山一角，并不是定义 `Providers` 的唯一方法，你可以使用普通的值、类、异步或同步工厂。更多的示例[文档 :books:](https://docs.nestjs.com/fundamentals/dependency-injection)

## 可选 Providers

有时，可能需要解决一些依赖项，例如，你的类可能取决于配置对象，如果没有传递，应使用默认值，这种情况下，依赖关系为可选，`provider` 不会因为缺少配置导致错误。
要指示 `provider` 是可选的,在 `constructor` 中使用 `@Optional()` 装饰器。
```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}
```
上面的示例中我们使用了自定的 `provider` ,这是我们包含自定义 `HTTP_OPTIONS` **token**的原因，前面的示例显示了基于构造函数的注入，该注入通过依赖函数的类进行依赖，更多的自定义 `Providers` 和相关 **tokens**信息 [:books:](https://docs.nestjs.com/fundamentals/custom-providers)

## 基于属性的注入
`Nest` 到目前为止使用基于构造函数注入的技术，即通过构造函数的方法注入 `providers` ,在一些特殊的场景，基于属性的注入方式变得更好用。例如，如果顶级类依赖与一个或多个 `providers`,通过从构造函数中调用子类的 `super()` 来传递它们就显得非常繁琐，为了避免这种情况，可以在属性上使用 `@Inject()` 装饰器。示例如下：
```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```
::: warning 
如果你的类没有其他 `provider` 扩展，那你应该一直使用**基于构造函数**的注入方式。
:::

## 注册 Provider
现在我们已经有了一个自定义的提供者`(CatsService)`,同时我们有这个服务的使用者 `(CatsController)`,我们需要向 `Nest` 注册该服务，已便能执行注入，我们可以编辑模块文件 `(app.module.ts)` , 然后将服务添加至 `@Module()` 装饰器的 `providers` 数组中。

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

`Nest` 现在可以解析 `CatsController` 类的依赖关系了。以下是现在的目录结构:
```
    src
    ├── cats
    │    ├──dto
    │    │   └──create-cat.dto.ts
    │    ├── interfaces
    │    │       └──cat.interface.ts
    │    ├──cats.service.ts
    │    └──cats.controller.ts
    ├──app.module.ts
    └──main.ts
```

## 手动实例化
迄今，已近讨论了 `Nest` 是如何自动处理并解析依赖项的大部分细节。在某些情况下，可能需要跳出内置的依赖注入系统，并手动检索或实例化提供程序，我们在下面简要讨论两个这样的主题。

要获取现有实例或动态的实例提供程序，可以使用 [`Module reference`](https://docs.nestjs.com/fundamentals/module-ref)。

在 `bootstrap()` 函数中获取提供程序(例如，对于没有控制器的独立应用程序,或在引导过程中使用配置服务),请查看[`Standalone applications`](https://docs.nestjs.com/standalone-applications)。