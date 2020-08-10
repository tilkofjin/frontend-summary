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
