---
title: Nestjs
lang: zh-CN
---

# Nestjs 开发指南

* 框架介绍

> Nest是目前为止个人认为最优秀的渐进式<a href="http://nodejs.org" target="_blank">Node.js</a> 企业级框架，使用 <a href="http://www.typescriptlang.org" target="_blank">TypeScript</a>构建并保证了与原生JS的兼容性，并结合了 OOP（面向对象编程），FP（函数式编程）和 FRP（函数式响应编程）的元素，有点类似 JAVA 的 sprinboot 框架的核型思想。是目前前端工程师构建大型全栈项目的最好选择。

> 环境要求--确保本地<a href="http://nodejs.org" target="_blank">Node.js</a>(>= 10.13.0)

* 这里只做常用功能模块的基础介绍，详细信息[请查看中文指南](https://docs.nestjs.cn). :books: 

* 全局安装
``` bash
  $ npm i -g @nestjs/cli
  $ nest new project-name
```

## 控制器
![img](https://docs.nestjs.com/assets/Controllers_1.png "控制器")
> 负责处理传入的 **请求** 和向客户端返回 **响应** ，通熟点我理解为，全局请求、响应路由控制，通过TS的装饰器可以很方便的将类与数据进行关联，并使nest创建路由映射将数据绑定到相应的控制器。
### 路由
  ::: tip 官方示例:
    cats.controller.ts
  :::
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```
通过例子可以看出，使用Controller装饰器，可以很方便的写一个cats的控制器模块，一个简单的Get请求也可以通过装饰器轻松实现。全局安装过 `nest cli` 后，创建一个控制器也变得非常容易
::: tip 创建cats控制器
    $ nest g controller cats
:::
使用时请按照官方推荐的方式，这样能避免走很多弯路。
### 请求对象（request）
程序的许多请求需要访问客户端的详情信息，Nest提供对基础平台的请求对象的访问，我們可以通過在處理程序的簽名中添加 `@Req()` 裝飾器來指示Nest注入請求對象，從而訪問該請求對象。
::: tip  Request请求
    cats.controller.ts
:::
```typescript
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```
::: tip 安装类型支持
  上面的` Request `也可以获取到参数提示，只需安装 `@types/express` 包即可。
:::
`Request` 对象表示 HTTP 请求，并具有 `Request` 查询字符串参数，HTTP 标头 和 正文的属性，但在大多数情况下, 不必手动获取它们。 我们可以使用专用的装饰器，比如 `@Body()` 或 `@Query()`。具体详情不做细说，装饰器和普通表达对象的比较请看 [官方文档](https://docs.nestjs.com/controllers#request-object)。装饰器的写法更优雅，也更符合TS的书写规范。

---

为了与底层 `HTTP`平台(如 `Express`和 `Fastify`)之间的类型兼容，`Nest` 提供了 `@Res()`和 `@Response()` 装饰器。`@Res()`只是 `@Response()`的别名。两者都直接公开底层响应对象接口。在使用它们时您还应该导入底层库的类型(例如：`@types/express`)以充分利用它们。注意，在方法处理程序中注入 `@Res()`或 `@Response()` 时，将 `Nest`置于该处理程序的特定于库的模式中，并负责管理响应。这样做时，必须通过调用响应对象(例如，`res.json(…)`或 `res.send(…)`)发出某种响应，否则HTTP服务器将挂起。

### 资源
::: tip 官方示例
    cats.controller.ts
:::
  ```typescript
  import { Controller, Get, Post } from '@nestjs/common';

  @Controller('cats')
  export class CatsController {
    @Post()
    create(): string {
      return 'This action adds a new cat';
    }

    @Get()
    findAll(): string {
      return 'This action returns all cats';
    }
  }
```
Nest以相同的方式提供其餘的標準HTTP請求端點裝飾器 `@Put()，@ Delete()，@Patch()，@Options()，@Head(), @All()`。每個代表各自的HTTP請求方法。

### 路由通配符
路由还支持模式匹配。类似 `*` 被用作通配符，将匹配任何字符组合, 例如：
```typescript
@Get('ab*cd')
findAll() {
  return 'This route uses a wildcard';
}
```
  `ab * cd` 路由路径将匹配 ab 开头 cd 结尾的字符, `?, +, *, ()` 也可以使用作为其正則表達式對应项的子集。连字符 `-` 和点 `.` 按字符串路径解析。

### 状态码
POST请求默认为 `201` ，其他请求默认返回 `200` 作为状态码，我们主要通过 `@HttpCode` 装饰器来处理我们的需求所应该返回的状态码。

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```
状态码是可以根据业务需求的需要自由定义，通过 `@Res()` 注入，并在程序错误时抛出异常。

### 响应头
要指定自定义的响应头，可以通过装饰器 `@Header()` 来实现。它会直接调用 `res.header()`。
```typescript
@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new cat';
}
```

### 重定向
使用 `@Redirect()` 装饰器，`@Redirect()`的带参为一个必传的 `URL` ，和一个可选的 `statusCode` ，若 `statusCode` 省略则默认为 `302`
```typescript
@Get()
@Redirect('https://nestjs.com', 301)
```
有时因业务需要动态的 `statusCode` 和 `URL` ，通过从路由处理程序方法，返回一个形状为以下形式的对象：
```json
{
  "url": string,
  "statusCode": number
}
```
返回的值將覆蓋传递給 `@Redirect()` 裝飾器的所有參數，例：
```typescript
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}

```
### 路由参数
当需要接受動態數據作為請求的一部分時，帶有靜態路徑的路由將不起作用（例：使用`GET`请求 `/cats/1` 来获取 id为 1的 `cat`），为了定义带参数的路由，我们可以在路由中添加路由参数**标记**,来获取请求URL中该位置的动态值。`@Get` 下面的装饰器示例中的路由参数标记演示了此方法。可以使用 `@Param()` 裝飾器訪問以這種方式声明的路由参数，该装饰器应添加到函数签名中。
```typescript
@Get(':id')
findOne(@Param() params): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```
上例中的 `@Param()` 用来装饰方法的参数，并使路由参数可用作该修饰的方法参数在方法体内的属性。可以通過引用 `params.id` 來訪問 `id` 參數, 还可以將特定的參數標記傳遞給裝飾器，然後在方法主體中按名稱直接引用路由參數。
```typescript
@Get(':id')
findOne(@Param('id') id): string {
  return `This action returns a #${id} cat`;
}
```

### 子域路由
`@Controller` 裝飾器可以採用 `host` 選項，以要求传入请求的 HTTP 主机匹配某个特定值。
```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```
::: danger
由於 `Fastify` 缺乏對嵌套路由器的支持，因此在使用子路由時，應使用（默認）Express適配器
:::
与路由类似，`hosts` 选项可以使用令牌来捕获主机名中该位置的动态值,下面的 `@Controller()` 装饰器示例中的主机参数令牌演示了此用法,可以使用 `@HostParam()` 裝飾器訪問以這種方式聲明的主機參數,该装饰器应添加到方法签名中。
```typescript
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
```

### 作用域
`Node.js` 不遵循请求/响应多线程无状态模型，每个请求都由主线程处理。因此，使用单例对我们的应用程序来说是完全安全的。具体使用请看官方 [文档](https://docs.nestjs.com/fundamentals/injection-scopes):books: 

### 异步（async / await）
由于请求大多都是异步的，异步编程带来的好处不必多说
::: tip 官方示例
    cats.controller.ts
:::
```typescript
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```
除上面的演示外，通过返回 RxJS [observable流](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) 使nest路由处理更强大。在流完成后，nest将自动订阅下面的源并获取最后发出的值。
::: tip 官方示例
    cats.controller.ts
:::
```typescript
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
``` 
  上面的两种方法都可以使用, 选择你喜欢的方式即可。

### 请求负载
之前的 `POST` 路由处理程序不接受任何客户端参数。在这里添加 `@Body()` 参数来解决这个问题。
首先要确定 `DTO(数据传输对象)` 模式。`DTO` 是一个对象，它定义了如何通过网络发送数据。我们可以通过使用 `TypeScript` 接口或简单的类来完成。由于 `TypeScript` 接口在转换过程中被删除，所以 `Nest` 不能在运行时引用它们。因為管道等功能在運行時可以訪問變量的元類型時,提供了更多的可能性。
> 我们来创建一个 `CreateCatDto` 类
::: tip 官方示例
    create-cat.dto.ts
:::
```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```
上例中的类只有三个属性，此後，我們可以在 `CatsController` 中使用新創建的 `DTO`：
::: tip 官方示例
    cats.controller.ts
:::
```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```
### 错误处理
具体的错误处理，请看[官方文档](https://docs.nestjs.com/exception-filters) :books: 有单独的相关介绍。

### 完整示例
下面是使用几个装饰器创建的控制器的示例，该示例展示了控制器提供的几种访问和操作内部数据的方法。
::: tip 官方示例
    cats.controller.ts
:::
```typescript
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```
可以看出通过装饰器很容易就完成了一个基础的 CRUD 接口。

### 开始运行
完成上述控制器的定义后，`Nest` 仍然不知道 `CatsController` 存在。
因此不會創建此類的實例,控制器始終屬於模塊，这就是为什么将 `controllers` 数组保存在 `@module()` 装饰器中, 由于除了根 `ApplicationModule`，我们没有其他模块，所以将使用它来介绍 `CatsController`:
::: tip 官方示例
    app.module.ts
:::
```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```
使用 `@Module()` 裝飾器將元數據附加到项目的模塊類中，`Nest` 现在可以輕鬆反映必須安裝哪些控制器。

---
### 附录：类库的特有方式
以上主要讲述是nest标准的方法处理的响应方式，这里简单讲述，还以上述的 `CatsController` 为例重寫為以下內容：
```typescript
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
     res.status(HttpStatus.OK).json([]);
  }
}
```
* 这里只做简单官方引述，类库的特有方式从官方的示例可已看出，逻辑并不清晰，因此建议在任何时候都采用nest的标准模式。
以上是 `nest` 关于控制器的基础介绍。 

## 提供者
![img](https://docs.nestjs.com/assets/Components_1.png "提供者")
控制器应处理 `HTTP` 请求并将更复杂的任务委托给 `Providers`。`Providers` 只是一个用 `@Injectable()` 装饰器注释的类，是纯粹的 `JavaScript` 类。
::: tip 强烈建议
  由于 `Nest` 可以以更多的面向对象方式设计和组织依赖性,因此请按照官方建议，强烈推荐按照[SOLID(单一功能、开闭原则、里氏替换、接口隔离以及依赖反转)](https://zh.wikipedia.org/wiki/SOLID_(%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E8%AE%BE%E8%AE%A1))原则。
:::

### 服务
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

### 依赖注入

`Nest` 围绕着**依赖注入**构建，这是一种非常优秀的设计模式，关于**依赖注入**的相关文档官方建议参考
[Aunglar](https://angular.io/guide/dependency-injection)
借助 `typescript` 的一些优秀的能力，管理依赖项变得很容易，因为它们按类型解析，以下示例 `nest` 将展示通过创建并返回 `CatsService` 的实例来解析 `catsService`(在单例模式下，如果现有实例在其他地方被请求，则返回该实例)。解析此依赖关系并将其传递给控制器的构造函数(或分配给指定的属性)。
  
```typescript
constructor(private catsService: CatsService) {}
```

### 作用域
`Providers` 通常具有与应用程序同步的生命周期(`作用域`)，程序启动时，每个依赖都必须被解析，因此，所有 `Provider` 都要实例化，同样，当程序关闭时，每个 `Provider` 都要销毁掉，但是有些方法可以改变 `provider` 生命周期的请求范围，这里有相关详细[文档 :books:](https://docs.nestjs.com/fundamentals/injection-scopes)

### 自定义的 Providers

`Nest` 有一个内置的反转控制容器( `IoC` ),可以解决 `Providers` 之间的关系，此功能是上述**依赖项注**入功能的基础，但实际远比上述强大得多，`@Injectable()` 装饰器仅仅是冰山一角，并不是定义 `Providers` 的唯一方法，你可以使用普通的值、类、异步或同步工厂。更多的示例[文档 :books:](https://docs.nestjs.com/fundamentals/dependency-injection)

### 可选 Providers

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

### 基于属性的注入
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

### 注册 Provider
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

### 手动实例化
迄今，已近讨论了 `Nest` 是如何自动处理并解析依赖项的大部分细节。在某些情况下，可能需要跳出内置的依赖注入系统，并手动检索或实例化提供程序，我们在下面简要讨论两个这样的主题。

要获取现有实例或动态的实例提供程序，可以使用 [`Module reference`](https://docs.nestjs.com/fundamentals/module-ref)。

在 `bootstrap()` 函数中获取提供程序(例如，对于没有控制器的独立应用程序,或在引导过程中使用配置服务),请查看[`Standalone applications`](https://docs.nestjs.com/standalone-applications)。


## 模块

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

### 功能模块
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

### 共享模块

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

### 模块重新导出

如上所示，模块可以导出其内部的提供者。此外，他们可以重新导出自己导入的模块。示例如下，`CommonModule` 既可以从 `CoreModule` 导入，也可以从 `CoreModule` 导出，使其可用于导入此模块的其他模块。

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

### 依赖注入

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

### 全局模块

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

### 动态模块

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


## 中间件

中间件是在路由处理程序之前调用的函数。中间件功能可以访问[请求](http://expressjs.com/en/4x/api.html#req)和[响应](http://expressjs.com/en/4x/api.html#res)对象，以及应用程序的请求-响应周期中的 `next()` 中间件功能。下一个中间件功能通常由名为 `next` 的变量表示。

![img](https://docs.nestjs.com/assets/Middlewares_1.png "中间件")

默认情况下，`Nest` 中间件等效于 `Express`中间件。官方文档中的以下描述描述了中间件的功能：

::: tip 中间件的功能：
中间件功能可以执行以下任务：
  - 执行任何代码。
  - 更改请求和响应对象。
  - 结束请求-响应周期。
  - 调用堆栈中的下一个中间件函数。
  - 如果当前的中间件功能没有结束请求-响应周期，它必须调用 `next()` 才能将控制权传递给下一个中间件函数，否则，请求将被挂起。
:::

您可以在任一函数中实现自定义 `Nest` 中间件，或在具有 `@Injectable()` 装饰器的类中。该类应实现 `NestMiddleware` 接口，而该功能没有任何特殊要求，让我们从使用类方法实现一个简单的中间件功能开始。

::: tip 官方示例
    logger.middleware.ts
:::

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('Request...');
    next();
  }
}
```

### 依赖注入

Nest中间件全面支持依赖注入，就像 `providers` 和 `controllers` 一样，他们能够注入同一模块中可用的依赖项，和平常一样，这是通过构造函数完成的。

### 应用中间件

`@Module()` 装饰器中不可放入中间件, 相反，我们使用模块类的 `configure()` 方法来设置它们。包含中间件的模块必须实现 `NestModule` 接口，我们在  `AppModule` 级别上设置 `LoggerMiddleware`。
::: tip 官方示例
    app.module.ts
:::
```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```
在上面的示例中，我们为先前在 `CatsController` 内部定义的 `/ cats` 路由处理程序设置了 `LoggerMiddleware`，在配置中间件时，我们还可以通过将包含路由路径和请求方法的对象，传递给 `forRoutes()` 方法，进一步将中间件限制为特定的请求方法。在下面的示例中，请注意，我们导入了 `RequestMethod` 枚举以引用所需的请求方法类型。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

::: tip
  可以使用 `async / await` 使 `configure()` 方法异步化（例，可以在 `configure()` 方法主体中，等待异步操作的完成）。
:::

### 路由通配符

路由同样支持模式匹配，例如，可以使用 * 通配符，匹配任何字符组合。

```typescript
  forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
```

路由路径为`'ab * cd'`，将匹配abcd，ab_cd，abecd等等，字符 `?，+，* 及 ()` 是它们的正则表达式对应项的子集。连字符 (`-`) 和点 (`.`) 按字符串路径解析。

::: warning
  fastify软件包使用最新版本的path-to-regexp软件包，该软件包不再支持通配符星号*。 相反，您必须使用参数 (例如 (`.*`)、`:splat*`)。
:::

### 中间件消费者

`MiddlewareConsumer` 是个帮助类。它提供了几种内置方法来管理中间件，他们都可以被简单地链接起来。`forRoutes()` 方法可以使用单个字符串，多个字符串，`RouteInfo` 对象，一个控制器类甚至多个控制器类。在大多数情况下，您可能只需要传递以逗号分隔的控制器列表。以下是单个控制器的示例：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller.ts';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```
::: tip
  `apply()` 方法可以采用单个中间件，也可以使用多个参数来指定多个中间件。
:::

### 排除路由

有时我们想从应用中间件中排除某些路由，我们可以使用 `exclude()` 方法轻松排除某些路由，此方法可以采用一个字符串，多个字符串或一个 `RouteInfo` 对象，以标识要排除的路由，如下所示：

```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/(.*)',
  )
  .forRoutes(CatsController);
```
::: tip
  `exclude()` 方法使用 `path-to-regexp` 包支持通配符参数。
:::

在上面的示例中，`LoggerMiddleware` 将绑定到 `CatsController` 内部定义的所有路由，但传递给 `exclude()` 方法的三个路由除外。

### 函数式中间件

我们一直在使用的 `LoggerMiddleware` 类非常简单，它没有成员，没有其他方法，也没有依赖项。为什么我们不能定义一个简单的函数，而要定义一个类。事实上，我们可以，这种类型的中间件称为 **函数中间件**，让我们将 `logger 中间件` 从基于 **类的中间件** 转变为 **函数式中间件**来说明他们的区别。

::: tip 官方示例
    logger.middleware.ts
:::

```typescript
import { Request, Response } from 'express';

export function logger(req: Request, res: Response, next: Function) {
  console.log(`Request...`);
  next();
};
```
并在 `AppModule` 中使用它

::: tip 官方示例
    app.module.ts
:::

```typescript
  consumer
  .apply(logger)
  .forRoutes(CatsController);
```

::: tip
    每当您的中间件不需要任何依赖关系时，请考虑使用功能更简单的中间件替代方案。
:::

### 多个中间件

如上所述，为了绑定顺序执行的多个中间件，只需在 `apply()` 方法内部使用**逗号**分隔的列表即可。

```typescript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

### 全局中间件

如果我们想一次性将中间件绑定到每个注册的路由，我们可以使用 `INestApplication` 实例提供的 `use()` 方法：

```typescript
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

## 异常过滤器

Nest带有内置的异常层，该层负责处理应用程序中所有未处理的异常。当应用程序代码未处理异常时，此层将捕获该异常，然后对用户自动发送适当的友好响应。

![img](https://docs.nestjs.com/assets/Filter_1.png "异常过滤器")

开箱即用，此操作由内置的全局异常过滤器执行，该过滤器处理 `HttpException` 类型的异常(及其子类)。如果无法识别异常(既不是 `HttpException` 也不是从 `HttpException` 继承的类)，则内置异常过滤器将生成以下默认JSON响应：

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### 基本异常

`Nest` 提供了内置的 `HttpException` 类，该类从 `@nestjs/common` 包引入，对于典型的基于 `HTTP REST/GraphQL API`的应用程序，最佳实践是在发生某些错误情况时发送标准 `HTTP` 响应对象。

举个例子，在 `CatsController` 中，我们有一个 `findAll()` 方法 ( 获取路由)。假设此路由处理程序由于某种原因引发了异常，为了说明，我们对其做如下硬编码：

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```
::: tip
  我们在这里使用了 `HttpStatus`。 这是从 `@nestjs/common` 包导入的帮助枚举。
:::

当客户端调用此端点时，响应如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

`HttpException` 构造函数采用两个必需的参数来确定响应：
  - `response` 参数定义 `JSON` 响应主体。可以是 `string` 或 `object`, 如下所述。
  - `status` 参数定义 `HTTP` 状态代码。

默认情况下，JSON响应主体包含两个属性：
  - `statusCode`：默认为 `status`参数中提供的 `HTTP` 状态码。
  - `message`：基于状态的 `HTTP` 错误的简短描述。

要仅覆盖**JSON**响应体的消息部分，请在 `response` 参数中提供一个字符串。要覆盖整个 `JSON` 响应体，请在 `response` 参数中传递一个对象，`Nest` 将序列化该对象，并将其作为 `JSON` 响应正文返回。第二个构造函数参数-`status`-应该是有效的 `HTTP` 状态码。最佳实践是使用从 `@nestjs/common` 导入的 `HttpStatus` 枚举。

这是一个覆盖整个响应正文的示例：

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Get()
async findAll() {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'This is a custom message',
  }, HttpStatus.FORBIDDEN);
}
```
使用上面的代码，应该的响应是：

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

### 自定义异常

大多情况下，你不需要写自定义异常，可以使用内置的 `Nest HTTP` 异常，如下一节所述，如果你确实需要创建自定义异常，最好创建自己的异常层次结构，您的自定义异常继承自基本 `HttpException` 类。用这种方法，`Nest` 会识别您的异常，并自动处理错误响应，让我们实现一个这样的异常:

::: tip 官方示例
    forbidden.exception.ts
:::

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```
由于 `ForbiddenException` 扩展了基础 `HttpException`，它将与内置异常处理程序无缝协作，因此，我们可以在 `findAll()` 方法中使用它。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}
```

### 内置HTTP异常

`Nest` 提供了一组从基本 `HttpException` 继承的基本异常，这些是从 `@nestjs/common` 包公开的，它们代表许多最常见的 `HTTP` 异常：
  - `BadRequestException`
  - `UnauthorizedException`
  - `NotFoundException`
  - `ForbiddenException`
  - `NotAcceptableException`
  - `RequestTimeoutException`
  - `ConflictException`
  - `GoneException`
  - `HttpVersionNotSupportedException`
  - `PayloadTooLargeException`
  - `UnsupportedMediaTypeException`
  - `UnprocessableEntityException`
  - `InternalServerErrorException`
  - `NotImplementedException`
  - `ImATeapotException`
  - `MethodNotAllowedException`
  - `BadGatewayException`
  - `ServiceUnavailableException`
  - `GatewayTimeoutException`

### 异常过滤器

内置的基本异常过滤器可以为您自动处理许多情况，您可能希望完全控制异常层。举个例子，您可能需要基于一些动态因素添加日志记录，或使用其他 `JSON` 模式，**异常过滤器**正是为此目的而设计的。它们使您可以精确的控制流以及将响应的内容发送回客户端。我们来创建一个异常过滤器，该过滤器负责捕获作为 `HttpException` 类实例的异常。并为其实现自定义响应逻辑。因此，我们需要访问基础平台的 `Request` 和 `Response` 对象。我们将访问 `Request`对象，以便我们可以提取原始 `url` 并将其包含在日志记录信息中。我们将使用 `Response.json()` 方法，使用 `Response` 对象直接控制发送的响应。

::: tip 官方示例
    http-exception.filter.ts
:::

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```
::: tip
  所有异常过滤器都应实现通用的 `ExceptionFilter <T>` 接口。它需要你使用有效签名提供 `catch(exception: T, host: ArgumentsHost)` 方法。`T` 表示异常类型。
:::

`@Catch(HttpException)` 装饰器将所需的元数据绑定到异常过滤器，告诉 `Nest` 这个特定的过滤器正在寻找 `HttpException` 类型的异常，仅此而已。`@Catch()` 装饰器可以使用单个参数，或以逗号分隔的列表。这使您可以同时为几种类型的异常设置过滤器。

### 参数主机

我们来看一下 `catch()` 方法的参数，`exception` 参数是当前正在处理的异常对象，`host` 参数是 `ArgumentsHost` 对象。ArgumentsHost是一个功能强大的实用程序对象，我们将在 [执行上下文章节](https://docs.nestjs.com/fundamentals/execution-context) 中进一步进行研究。在次代码示例中，我们使用它来获取对 `Request` 和 `Response` 对象的引用(在异常发生的控制器中)。此示例中，我们在 `ArgumentsHost` 上使用了一些辅助方法来获取所需的 `Request` 和 `Response` 对象。更多关于 `ArgumentsHost` 的介绍请看 [:books:](https://docs.nestjs.com/fundamentals/execution-context)。

达到此抽象级别的原因是 `ArgumentsHost` 在所有上下文 (例如，我们现在正在使用的 `HTTP` 服务器上下文，以及微服务和 `WebSocket`) 中均起作用。在执行上下文一章中，我们将看到如何利用 `ArgumentsHost` 及其帮助函数的强大功能来执行任何上下文。这将使我们能够编写可在所有上下文中运行的通用异常过滤器。

### 绑定过滤器

我们将新的 `HttpExceptionFilter` 绑定到 `CatsController` 的 `create()` 方法上。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

::: tip
  `@UseFilters()` 装饰器从 `@nestjs/common` 包导入。
:::

我们在这里使用了 `@UseFilters()` 装饰器。与 `@Catch()` 装饰器类似，它可以使用一个过滤器实例，或以逗号分隔的过滤器实例列表。这里我们就地创建了`HttpExceptionFilter` 的实例。或者，您可以传递类(而不是实例)，将实例化责任留给框架。并启用依赖项注入。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

::: warning
  尽可能使用类而不是实例来应用过滤器，由于 `Nest` 可以轻松在整个模块中重复使用同一类的实例，因此可以减少内存使用。
:::

在上面的例子里，`HttpExceptionFilter` 仅应用于单个 `create()` 路由处理程序，使其成为方法范围。异常过滤器的作用范围可以不同，方法范围，控制器范围或全局范围。 例如，要将过滤器设置为控制器作用域，您可以执行以下操作：

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

此构造为 `CatsController` 内部定义的每个路由处理程序设置 `HttpExceptionFilter`。
要创建全局范围的过滤器，请执行以下操作：

::: tip 官方示例
    main.ts
:::

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

::: warning
  `useGlobalFilters()` 方法不会为网关或混合应用程序设置过滤器。
:::

对于每个控制器和每个路由处理程序，整个应用程序都使用全局范围的过滤器。在依赖注入方面，从任何模块外部注册的全局过滤器(如上例中使用 `useGlobalFilters()` )都不能注入依赖项，因为它们不属于任何模块。为了解决这个问题，您可以使用以下结构直接从任何模块注册全局范围的过滤器：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

::: tip
  使用此方法对过滤器执行依赖项注入时，请注意，无论采用哪种结构的模块，过滤器实际上都是全局的。应该在哪里做？选择定义了过滤器(以上示例中为 `HttpExceptionFilter` )的模块。另外，`useClass` 不是处理自定义 提供程序 注册的唯一方法。[了解更多](https://docs.nestjs.com/fundamentals/custom-providers)
:::

您可以根据需要使用此技术添加任意数量的过滤器，只需将每个过滤器添加到 `provider` 数组即可。


### 异常捕获

为了捕获所有未处理的异常(无论异常类型如何)，将 `@Catch()` 装饰器的参数列表保留为空，例如 `@Catch()`。

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```
在上面的示例中，过滤器将捕获引发的每个异常，无论其类型(类)如何。

### 继承

通常，您将创建完全定制的异常过滤器，以满足您的应用程序需求。如果您希望重用已经实现的核心异常过滤器，并基于某些因素重写行为，请看下面的例子。

为了将异常处理委托给基本过滤器，您需要扩展 `BaseExceptionFilter` 并调用继承的 `catch()` 方法。

::: tip 官方示例
    all-exceptions.filter.ts
:::

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

::: warning
  扩展 `BaseExceptionFilter` 的方法范围和控制器范围的筛选器不应使用 `new` 实例化。相反，因该让框架自动实例化它们。
:::

上面的实现只是一个展示方法的演示，对扩展异常过滤器的实现，包括量身定制的业务逻辑(例如，各种处理条件)。

全局过滤器可以扩展基本过滤器。 这可以通过两种方式之一来完成。

第一种方法是在实例化自定义全局过滤器时注入 `HttpServer` ，参考示例：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
```
第二种方法是使用 `APP_FILTER` 令牌，[查看详情](https://docs.nestjs.com/exception-filters#binding-filters)。


## 管道

管道是用 `@Injectable()` 装饰器注释的类。 管道应实现 `PipeTransform` 接口。

![img](https://docs.nestjs.com/assets/Pipe_1.png "管道")

管道有两个典型的用例：
  - 转换：将输入数据转换为所需的格式 (例如，从字符串转换为整数)
  - 验证：评估输入数据，如果有效，只需将其原样传递即可。否则，当数据不正确时抛出异常。

在这两种情况下，管道 `参数(arguments)` 对由[控制器路由处理程序](https://docs.nestjs.com/controllers#route-parameters)处理的参数进行操作。`Nest` 会在调用方法之前插入管道，然后管道接收指定给该方法的参数并对其进行操作。那时将进行任何转换或验证操作，然后使用转换后的参数调用路由处理程序。

Nest自带了许多内置管道，可以直接使用它们，您还可以构建自己的管道，本章将介绍内置管道，并展示如何将它们绑定到路由处理程序。之后，我们将研究几个定制管道，以显示如何从头开始构建。

::: tip
  管道在异常区域内运行。这意味着，当管道引发异常时，将由异常层处理(全局异常过滤器和应用于当前上下文的所有异常过滤器)。鉴于以上所述，应该清楚的是，当在 `Pipe` 中引发异常时，随后将不执行任何控制器方法。这为您提供了一种最佳实践方法，用于验证从系统边界处的外部源进入应用程序的数据。
:::

### 内置管道

`Nest` 自带了六个可用的现成管道：
  - ValidationPipe
  - ParseIntPipe
  - ParseBoolPipe
  - ParseArrayPipe
  - ParseUUIDPipe
  - DefaultValuePipe

它们是从 `@nestjs/common` 包导出的。

让我们快速看一下使用 `ParseIntPipe` 的方法。这是转换用例的示例，其中管道确保将方法处理程序参数转换为 `JavaScript` 整数(若转换失败则抛出异常)。在本章的后面，我们将展示一个 `ParseIntPipe` 的自定义简单实现。以下示例技术也适用于其他内置的转换管道 (`ParseBoolPipe`，`ParseArrayPipe` 和 `ParseUUIDPipe`，本章中将其称为 `Parse*` 管道)。

### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文。在我们的 `ParseIntPipe` 示例中，我们希望将管道与特定的路线处理程序方法相关联，并确保它在调用该方法之前运行。使用以下构造实现此目的，我们将其称为在方法参数级别绑定管道：

```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

这样可以确保满足以下两个条件之一：我们在 `findOne()` 方法中收到的参数是一个数字 (正如我们对 `this.catsService.findOne()` 的调用所期望的那样)，或者在调用路由处理程序之前引发了异常。

例如，假设路由的名称如下：

```
  GET localhost:3000/abc
```

Nest将引发如下异常：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

该异常将阻止 `findOne()` 方法的主体执行。在上面的示例中，我们传递了一个类 `(ParseIntPipe)`，而不是实例，将实例化责任留给了框架并启用了依赖注入。与管道和防护一样，我们可以传递内置实例。如果我们要通过传递选项来自定义内置管道的行为，则传递内置实例就非常有用：

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}
```

绑定其他转换管道(所有 `Parse*` 管道）的工作方式相似。这些管道都在验证路由参数，查询字符串参数和请求正文值的上下文中工作。

例如，带有查询字符串参数：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

这是一个使用 `ParseUUIDPipe` 解析字符串参数并验证其是否为 `UUID` 的示例。

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}
```
::: tip
使用 `ParseUUIDPipe()` 时，您正在解析版本3、4或5中的 `UUID`，如果仅需要特定版本的 `UUID`，则可以在管道选项中传递一个版本。
:::

上面我们看到了绑定各种 `Parse*` 系列内置管道的示例，绑定验证管道略有不同； 我们将在下一节中讨论。

::: tip
另外，请参阅[验证技术](https://docs.nestjs.com/techniques/validation)以获取验证管道的广泛示例。
:::

### 定制管道

如上所述，您可以构建自己的自定义管道，虽然 `Nest` 提供了强大的内置 `ParseIntPipe` 和 `ValidationPipe`，但让我们从头开始构建每个的简单自定义版本，以了解如何构造自定义管道。

我们从一个简单的 `ValidationPipe` 开始。最初，我们将让它简单地采用一个输入值，并立即返回相同的值，就像一个身份函数一样。

::: tip 官方示例
    validation.pipe.ts
:::

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```
::: tip
`PipeTransform <T，R>` 是一个通用接口，必须由任何管道实现，通用接口使用 `T` 指示输入值的类型，并使用 `R` 指示 `transform()` 方法的返回类型。
:::

每个管道都必须实现 `transform()` 方法以实现 `PipeTransform` 接口协定。此方法有两个参数：
  - value
  - metadata

`value` 参数是当前处理的方法参数(在通过路由处理方法接收之前)，`元数据` 是当前处理的方法参数的元数据。元数据对象具有以下属性：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```
这些属性描述了当前处理的参数。

|    属性   |    描述    |
|:----------:|:----------:|
|type| 指示参数是正文 `@Body()`，查询 `@Query()`，参数 `@Param()` 还是自定义参数([在此处了解更多](https://docs.nestjs.com/custom-decorators))。|
|metatype| 提供参数的元类型，例如 `String`。注意：如果您在路由处理程序方法签名中省略类型声明，或者使用原始 `JavaScript`，则该值是不确定的。|
|data| 传递给装饰器的字符串，例如，`@Body('string')`。如果将修饰符括号留空，则未定义。|

::: warning
`TypeScript` 接口在编译过程中消失。 因此，如果将方法参数的类型声明为接口而不是类，则该 `元类型`值将为 `Object`。
:::

### 基于架构的验证

让我们使验证管道更有用。仔细观察 `CatsController` 的 `create()` 方法，在尝试运行我们的服务方法之前，我们可能希望确保其中的 `post` 主体对象有效。

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

让我们专注于 `createCatDto` 主体参数。它的类型是 `CreateCatDto`：

::: tip 官方示例
    create-cat.dto.ts
:::

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```
我们要确保对 `create` 方法的任何传入请求均包含有效主体。因此，我们必须验证  `createCatDto` 对象的三个成员。我们可以在路由处理程序方法中执行此操作，但是这样做并不理想，因为它会破坏单一责任规则(SRP)。

另一种方法可能是创建一个验证器类并在那里委托任务。这样做的缺点是，我们必须记住在每个方法的开头都调用此验证器。如何创建验证中间件？这可能有效，但是，不可能创建可在整个应用程序的所有上下文中使用的**通用中间件**。这是因为中间件不知道执行上下文，包括将被调用的处理程序及其任何参数。

当然，这正是设计管道的用意。 因此，让我们继续完善验证管道。


### 对象架构验证

有几种方法可用于进行干净的对象验证，一种常见的方法是使用基于架构的验证。 让我们继续尝试这种方法。

通过  `Joi库`，您可以直接创建具有可读性的API。 让我们构建一个使用基于 `Joi` 的架构的验证管道。

首先安装所需的软件包：

```bash
$ npm install --save @hapi/joi
$ npm install --save-dev @types/hapi__joi
```

在下面的代码示例中，我们创建一个简单的类，该类将模式作为构造函数参数。然后，我们应用 `schema.validate()` 方法，该方法针对提供的模式验证传入的参数。

如上所述，验证管道要么返回值不变，要么抛出异常。

在下一节中，您将看到我们如何使用 `@UsePipes()` 装饰器为给定的控制器方法提供适当的架构。这样做使我们的验证管道可以跨上下文重用。

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from '@hapi/joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
```

### 绑定验证管道

之前，我们看到了如何绑定转换管道(例如 `ParseIntPipe` 和其余的 `Parse*` 管道)。

绑定验证管道也非常简单。

在这种情况下，我们要在方法调用级别绑定管道。在当前示例中，我们需要执行以下操作才能使用 `JoiValidationPipe`：
  1、创建 `JoiValidationPipe` 的实例。
  2、在管道的类构造函数中传递上下文特定的 `Joi` 模式。
  3、将管道绑定到方法。

我们使用 `@UsePipes()` 装饰器执行此操作，如下所示：

```typescript
@Post()
@UsePipes(new JoiValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```
::: tip
`@UsePipes()` 装饰器从 `@nestjs/common` 包导入。
:::

### 类验证器

::: warning
本节中的技术需要 `TypeScript`，如果您的应用是使用原始 `JavaScript` 编写的，则这些技术不可用。
:::

让我们看一下验证技术的另一种实现。

`Nest` 可与类验证器库一起很好地工作，这个强大的库使您可以使用基于装饰器的验证。基于装饰器的验证功能非常强大，尤其是与 `Nest` 的 `Pipe` 功能结合使用时，因为我们可以访问已处理属性的 `元类型`。在开始之前，我们需要安装所需的软件包：

```bash
$ npm i --save class-validator class-transformer
```

安装完这些后，我们可以向 `CreateCatDto` 类添加一些装饰器。在这里，我们看到了这项技术的显著优势：`CreateCatDto` 类仍然是 `Post` 正文对象的唯一事实来源(而不是必须创建单独的验证类)。

::: tip 官方示例
    create-cat.dto.ts
:::

```typescript
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

在[此处](https://github.com/typestack/class-validator#usage)阅读有关类验证器修饰符的更多信息。

现在，我们可以创建一个使用这些批注的 `ValidationPipe` 类。

::: tip 官方示例
    validation.pipe.ts
::: 

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

::: tip
上面，我们使用了 `class-transformer`库。 它是由与类验证器库相同的作者写的，因此，它们可以很好地协同工作。
:::

让我们看一下这段代码，首先，请注意，`transform()` 被标记为异步的方法，这是可以的，`Nest` 支持同步管道和异步管道。我们使此方法异步，因为某些类验证器验证可以是异步的(利用`Promises`)。接下来请注意，我们正在使用解构将元类型字段(仅从 `ArgumentMetadata` 中提取此成员)提取到我们的 `元类型` 参数中。这只是获得完整 `ArgumentMetadata` 的快捷方式，然后可以使用附加的语句来分配元类型变量。

接下来，注意 `Validate()` 的辅助函数。当正在处理的当前参数是 `JavaScript` 类型时，它负责绕过验证步骤(这些参数没有附加验证装饰器，因此没有理由在验证步骤中运行它们)。

接下来，我们使用 `class-transformer` 函数 `plainToClass()` 将普通的 `JavaScript` 参数对象转换为类型对象，以便我们可以应用验证。我们必须这样做的原因是，从网络请求反序列化时，传入的帖子主体对象没有任何类型信息(这就是基础平台，例如Express的工作方式)。类验证器需要使用之前为 `DTO` 定义的验证装饰器，因此我们需要执行此转换，以将传入的主体视为经过适当装饰的对象，而不仅仅是普通的对象。

最后，如上所述，由于这是一个验证管道，因此它要么返回值不变，要么抛出异常。

最后一步是绑定 `ValidationPipe`。管道可以是参数作用域，方法作用域，控制器作用域或全局作用域。之前，通过基于 `Joi` 的验证管道，我们看到了在方法级别绑定管道的示例。在下面的示例中，我们将管道实例绑定到路由处理程序 `@Body()` 装饰器，以便调用我们的管道以验证帖子主体。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Post()
async create(
  @Body(new ValidationPipe()) createCatDto: CreateCatDto,
) {
  this.catsService.create(createCatDto);
}
```

当验证逻辑仅涉及一个指定参数时，参数范围的管道很有用。


### 全局作用域管道

由于 `ValidationPipe` 被创建为尽可能通用，因此我们可以通过将其设置为全局范围的管道来实现它的完整功能，以便将其应用于整个应用程序中的每个路由处理程序。

::: tip 官方示例
    main.ts
:::

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

::: tip 
对于混合应用程序，`useGlobalPipes()` 方法未设置网关和微服务的管道。对于 "标准"(非混合) 微服务应用程序，`useGlobalPipes()` 确实在全局安装管道。
:::

全局管道在整个应用程序中用于每个控制器和每个路由处理程序。

请注意，在依赖关系注入方面，由于绑定是在任何模块上下文之外完成的，因此从任何模块外部注册的全局管道(如上例所示，使用`useGlobalPipes()`)，都不能注入依赖关系。为了解决此问题，您可以使用以下结构直接从任何模块设置全局管道：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```
使用此方法对管道执行依赖项注入时，请注意，实际上，无论采用哪种结构的模块，管道都是全局的。应该在哪里做？ 选择定义管道(在上面的示例中为 `ValidationPipe`)的模块。 同样，`useClass` 不是处理自定义提供程序注册的唯一方法。[在这里了解更多](https://docs.nestjs.com/fundamentals/custom-providers)。


### 转换用例

验证不是定制管道的唯一用例。在本章开始时，我们提到管道还可以将输入数据转换为所需的格式。这是可能的，因为从转换函数返回的值将完全覆盖参数的先前值。

什么时候有用？考虑到有时从客户端传递的数据需要进行一些更改，例如将字符串转换为整数，然后才能通过路由处理程序方法对其进行正确处理。此外，某些必填数据字段可能会丢失，我们希望应用默认值。**转换管道**可以通过在客户端请求和请求处理程序之间插入处理功能来执行这些功能。

这是一个简单的 `ParseIntPipe`，它负责将字符串解析为整数值。(如上所述，`Nest` 具有内置的 `ParseIntPipe`，它更加复杂。我们将其作为自定义转换管道的简单示例)。

::: tip 官方示例
    parse-int.pipe.ts
:::

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```
然后，我们可以将此管道绑定到选定的参数，如下所示：

```typescript
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return this.catsService.findOne(id);
}
```

另一个有用的转换案例是使用请求中提供的 `ID` 从数据库中选择一个现有的用户实体：

```typescript
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}
```

我们将这个管道的实现留给读者，但是请注意，像所有其他转换管道一样，它接收输入值 `(id)` 并返回输出值(`UserEntity` 对象)。通过将样板代码从处理程序中提取到公共管道中，可以使您的代码更具声明性并更整洁。

### 提供默认值

`Parse*` 管道期望定义参数的值。他们在收到 `null` 或 `undefined` 的值时引发异常。为了允许端点处理缺失的查询字符串参数值，我们必须提供一个默认值，以便在 `Parse*` 管道对这些值进行操作之前将其注入。`DefaultValuePipe` 用于此目的。只需在相关的 `Parse*` 管道之前在 `@Query()` 装饰器中实例化一个 `DefaultValuePipe`，如下所示：

```typescript
@Get()
async findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.catsService.findAll({ activeOnly, page });
}
```

### 内置的校验管道

提醒一句，您不需要自己构建通用的验证管道，因为 `ValidationPipe` 是由 `Nest` 即时提供的。内置的 `ValidationPipe` 提供的选项比我们在本章中构建的示例更多，为说明自定义管道的机制而保留了基本选项。您可以[在此](https://docs.nestjs.com/techniques/validation)处找到完整的详细信息以及许多示例。


## 守卫

守卫是用 `@Injectable()` 装饰器注释的类。 所有的守卫都应实现 `CanActivate` 接口。

![img](https://docs.nestjs.com/assets/Guards_1.png "守卫")

守卫负有单一责任。他们确定给定的请求是否将由路由处理程序处理，取决于运行时出现的某些条件(例如权限，角色，`ACL` 等)。这通常称为授权，授权(身份验证)通常由传统 `Express` 应用程序中的中间件处理。中间件是进行身份验证的不错选择，因为令牌验证和将属性附加到 `请求对象` 等与特定的路由上下文(及其元数据)之间没有牢固的联系。

但是中间件从本质上来说是错误的，调用 `next()` 函数后，它不知道将执行哪个处理程序。另一方面，**`Guards`** 可以访问 `ExecutionContext` 实例，因此确切知道下一步将要执行什么。它们的设计非常类似于异常过滤器，管道和拦截器，使您可以在**请求/响应**周期中的正确位置插入处理逻辑，并以声明的方式进行。这有助于使代码保持整洁性和声明性。

::: tip
在每个中间件之后但在任何拦截器或管道之前执行守护。
:::

### 守卫授权

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

### 执行上下文

`canActivate()` 函数采用一个参数，即 `ExecutionContext` 实例。`ExecutionContext` 继承自 `ArgumentsHost`。我们之前在异常过滤器一章中看到了  `ArgumentsHost`。在上面的示例中，我们只使用了与先前使用的 `ArgumentsHost` 上定义的相同的帮助程序方法，来获取对 `Request` 对象的引用。您可以参考[异常过滤器](https://docs.nestjs.com/exception-filters#arguments-host)一章的 `"Arguments host"` 部分，以获取有关此主题的更多信息。通过扩展`ArgumentsHost`，`ExecutionContext` 还添加了几个新的辅助方法，这些方法提供有关当前执行过程的更多详细信息。这些详细信息有助于构建可以在广泛的控制器，方法和执行上下文中使用的更多通用守护。 在[此处](https://docs.nestjs.com/fundamentals/execution-context)了解有关 `ExecutionContext` 的更多信息。


### 基于角色的身份验证

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

### 绑定守卫

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

### 设置每个处理程序的角色

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

### 全部放在一起

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

卫士抛出的任何异常将由异常层处理(全局异常过滤器和应用于当前上下文的所有异常过滤器)。