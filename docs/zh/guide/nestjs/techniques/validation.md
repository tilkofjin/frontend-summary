---
title: 验证
lang: zh-CN
---

最佳实践是验证发送到 `Web` 应用程序中的任何数据的正确性。为了自动验证传入的请求，`Nest` 提供了一些开箱即用的管道：
  - ValidationPipe
  - ParseIntPipe
  - ParseBoolPipe
  - ParseArrayPipe
  - ParseUUIDPipe

`ValidationPipe` 利用功能强大的 [<font color=red>class-validator</font>](https://github.com/typestack/class-validator) 包及其声明性验证修饰符。`ValidationPipe` 提供了一种对所有传入的客户端有效负载强制执行验证规则的便捷方法，其中在每个模块的本地类 `/DTO` 声明中使用简单的注释声明特定的规则。


## 总览

在 "[<font color=red>管道</font>](https://docs.nestjs.com/pipes)" 一章中，我们经历了构建简单管道并将其绑定到控制器，方法或全局应用程序的过程，以演示该过程如何工作。请务必阅读该章以最好地理解本章的主题。在这里，我们将重点研究 `ValidationPipe` 在现实世界中的各种使用案例，并展示如何使用其一些高级自定义功能。


## 使用内置的验证管道

::: tip
`ValidationPipe` 是从 `@nestjs/common` 包导入的。
:::

由于此管道使用 `class-validator` 和 `class-transformer` 库，因此有许多可用选项。您可以通过传递给管道的配置对象来配置这些设置。以下是内置选项：

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
```

除了这些以外，还提供所有类验证器选项(从 `ValidatorOptions` 接口继承)：

| 选项 | 类型 | 描述 |
|:---------:|:---------:|:---------:|
| `skipMissingProperties` | `boolean` | 如果设置为 `true`，则验证器将跳过对验证对象中缺少的所有属性的验证。 |
| `whitelist` | `boolean` | 如果设置为 `true`，`validator` 将剥离不使用任何验证装饰器的任何属性的已验证(返回)的对象。 |
| `forbidNonWhitelisted` | `boolean` | 如果设置为 `true`，则验证器会剥离异常，而不是剥离非列入白名单的属性。 |
| `forbidUnknownValues` | `boolean` | 如果设置为 `true`，则尝试验证未知对象的尝试将立即失败。 |
| `disableErrorMessages` | `boolean` | 如果设置为 `true`，验证错误将不会返回给客户端。 |
| `errorHttpStatusCode` | `number` | 此设置使您可以指定发生错误时将使用的异常类型。默认情况下，它引发 `BadRequestException`。 |
| `exceptionFactory` | `Function` | 接受验证错误数组，并返回要抛出的异常对象。 |
| `groups` | `string[]` | 对象验证期间要使用的组。 |
| `dismissDefaultMessages` | `boolean` | 如果设置为 `true`，则验证将不使用默认消息。如果未明确设置错误消息，则始终是未定义的。 |
| `validationError.target` | `boolean` | 指示是否应在 `ValidationError` 中公开目标 |
| `validationError.value` | `boolean` | 指示是否应在 `ValidationError` 中公开经过验证的值。	|

::: tip
在其[存储库](https://github.com/typestack/class-validator)中找到有关 `class-validator` 包的更多信息。
:::



## 自动验证

我们将从在应用程序级别绑定 `ValidationPipe` 开始，从而保护所有端点免于接收不正确的数据。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

为了测试我们的管道，让我们创建一个基本端点。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}
```

::: tip
由于 `TypeScript` 不会存储有关泛型或接口的元数据，因此当您在 `DTO` 中使用它们时，`ValidationPipe` 可能无法正确地验证传入的数据。因此，请考虑在 `DTO` 中使用具体的类。
:::

现在，我们可以在 `CreateUserDto` 中添加一些验证规则。我们使用 `class-validator` 包提供的装饰器来完成此操作，[<font colro=red>此处</font>](https://github.com/typestack/class-validator#validation-decorators)有详细说明。以这种方式，任何使用 `CreateUserDto` 的路由都会自动执行这些验证规则。

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

有了这些规则，如果请求在请求正文中使用无效的电子邮件属性到达我们的端点，则应用程序将自动以 `400 Bad Request` 代码以及以下响应正文进行响应：

```JOSN
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}
```

除了验证请求主体之外，`ValidationPipe` 也可以与其他请求对象属性一起使用。想象一下，我们想在端点路径中接受 `:id`。为了确保此请求参数仅接受数字，我们可以使用以下构造：

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}
```

像 `DTO` 一样，`FindOneParams` 只是一个使用 `class-validator` 定义验证规则的类。它看起来像这样：

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: number;
}
```


## 禁用错误详情

错误消息有助于解释请求中的错误。但是，某些生产环境更喜欢禁用错误详情。通过将选项对象传递给 `ValidationPipe` 来执行此操作：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);
```

结果，详细的错误消息将不会显示在响应正文中。



## 属性剥离

我们的 `ValidationPipe` 还可以过滤掉方法处理程序不应该接收的属性。在这种情况下，我们可以将可接受的属性列入白名单，并且白名单中未包括的任何属性都会自动从结果对象中删除。例如，如果我们的处理程序需要电子邮件和密码属性，但请求还包含 `age` 属性，则可以从生成的 `DTO` 中自动删除此属性。要启用这种行为，请将白名单设置为 `true`。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);
```

设置为 `true` 时，这将自动删除未列入白名单的属性(那些在验证类中没有任何装饰器的属性)。

或者，您可以在存在非列入白名单的属性时停止处理请求，并将错误响应返回给用户。要启用此功能，请将 `forbidNonWhitelisted` 选项属性设置为 `true`，同时将白名单设置为 `true`。


## 转换加载对象

通过网络传入的有效负载是普通的 `JavaScript` 对象。`ValidationPipe` 可以将有效载荷自动转换为根据其 `DTO` 类输入的对象。要启用自动转换，请将 `transform` 设置为 `true`。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

若要全局启用此行为，请在全局管道上设置选项：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);
```

启用自动转换选项后，`ValidationPipe` 还将执行原始类型的转换。在下面的示例中，`findOne()` 方法采用一个参数，该参数表示提取的 `id` 路径参数：

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}
```

默认情况下，每个路径参数和查询参数都以字符串形式通过网络。在上面的示例中，我们将 `id` 类型指定为数字(在方法签名中)。因此，`ValidationPipe` 将尝试自动将字符串标识符转换为数字。



## 显式转换

在上一节中，我们展示了 `ValidationPipe` 如何根据预期的类型隐式转换查询和路径参数。但是，此功能需要启用自动转换。

或者(禁用自动转换)，您可以使用 `ParseIntPipe` 或 `ParseBoolPipe` 显式地转换值(请注意，不需要 `ParseStringPipe`，因为如前所述，默认情况下，每个路径参数和查询参数都以字符串形式通过网络出现)。

```typescript
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('sort', ParseBoolPipe) sort: boolean,
) {
  console.log(typeof id === 'number'); // true
  console.log(typeof sort === 'boolean'); // true
  return 'This action returns a user';
}
```

::: tip
从 `@nestjs/common` 包导出 `ParseIntPipe` 和 `ParseBoolPipe`。
:::



## 解析和验证数组

`TypeScript` 不存储有关泛型或接口的元数据，因此在 `DTO` 中使用它们时，`ValidationPipe` 可能无法正确地验证传入的数据。例如，在以下代码中，不会正确验证 `createUserDtos`：

```typescript
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}
```

若要验证数组，请创建一个专用类，其中包含包装该数组的属性，或者使用 `ParseArrayPipe`。

```typescript
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}
```

此外，在解析查询参数时，`ParseArrayPipe` 可能会派上用场。让我们考虑一个 `findByIds()` 方法，该方法基于作为查询参数传递的标识符返回用户。

```typescript
@Get()
findByIds(
  @Query('id', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}
```

此构造可验证来自 `HTTP GET` 请求的传入查询参数，如下所示：
    GET /?ids=1,2,3



## `WebSocket` 和微服务

尽管本章显示了使用 `HTTP` 样式的应用程序(例如 `Express` 或 `Fastify`)的示例，但 `ValidationPipe` 对于 `WebSocket` 和微服务的工作原理相同，而与使用的传输方法无关。


## 学习更多

在[<font color=red>此处</font>](https://github.com/typestack/class-validator)阅读有关类验证器包提供的有关自定义验证器，错误消息和可用装饰器的更多信息。