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