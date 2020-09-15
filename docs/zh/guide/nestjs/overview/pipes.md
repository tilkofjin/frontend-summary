---
title: 管道
lang: zh-CN
---

## 管道介绍

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

## 内置管道

`Nest` 自带了六个可用的现成管道：
  - ValidationPipe
  - ParseIntPipe
  - ParseBoolPipe
  - ParseArrayPipe
  - ParseUUIDPipe
  - DefaultValuePipe

它们是从 `@nestjs/common` 包导出的。

让我们快速看一下使用 `ParseIntPipe` 的方法。这是转换用例的示例，其中管道确保将方法处理程序参数转换为 `JavaScript` 整数(若转换失败则抛出异常)。在本章的后面，我们将展示一个 `ParseIntPipe` 的自定义简单实现。以下示例技术也适用于其他内置的转换管道 (`ParseBoolPipe`，`ParseArrayPipe` 和 `ParseUUIDPipe`，本章中将其称为 `Parse*` 管道)。

## 绑定管道

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

## 定制管道

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

## 基于架构的验证

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


## 对象架构验证

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

## 绑定验证管道

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

## 类验证器

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


## 全局作用域管道

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


## 转换用例

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

## 提供默认值

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

## 内置的校验管道

提醒一句，您不需要自己构建通用的验证管道，因为 `ValidationPipe` 是由 `Nest` 即时提供的。内置的 `ValidationPipe` 提供的选项比我们在本章中构建的示例更多，为说明自定义管道的机制而保留了基本选项。您可以[在此](https://docs.nestjs.com/techniques/validation)处找到完整的详细信息以及许多示例。
