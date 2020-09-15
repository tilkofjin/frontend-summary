---
title: 异常过滤器
lang: zh-CN
---

## 异常过滤器介绍

`Nest` 带有内置的异常层，该层负责处理应用程序中所有未处理的异常。当应用程序代码未处理异常时，此层将捕获该异常，然后对用户自动发送适当的友好响应。

![img](https://docs.nestjs.com/assets/Filter_1.png "异常过滤器")

开箱即用，此操作由内置的全局异常过滤器执行，该过滤器处理 `HttpException` 类型的异常(及其子类)。如果无法识别异常(既不是 `HttpException` 也不是从 `HttpException` 继承的类)，则内置异常过滤器将生成以下默认JSON响应：

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## 基本异常

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

## 自定义异常

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

## 内置HTTP异常

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

## 异常过滤器

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

## 参数主机

我们来看一下 `catch()` 方法的参数，`exception` 参数是当前正在处理的异常对象，`host` 参数是 `ArgumentsHost` 对象。ArgumentsHost是一个功能强大的实用程序对象，我们将在 [执行上下文章节](https://docs.nestjs.com/fundamentals/execution-context) 中进一步进行研究。在次代码示例中，我们使用它来获取对 `Request` 和 `Response` 对象的引用(在异常发生的控制器中)。此示例中，我们在 `ArgumentsHost` 上使用了一些辅助方法来获取所需的 `Request` 和 `Response` 对象。更多关于 `ArgumentsHost` 的介绍请看 [:books:](https://docs.nestjs.com/fundamentals/execution-context)。

达到此抽象级别的原因是 `ArgumentsHost` 在所有上下文 (例如，我们现在正在使用的 `HTTP` 服务器上下文，以及微服务和 `WebSocket`) 中均起作用。在执行上下文一章中，我们将看到如何利用 `ArgumentsHost` 及其帮助函数的强大功能来执行任何上下文。这将使我们能够编写可在所有上下文中运行的通用异常过滤器。

## 绑定过滤器

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


## 异常捕获

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

## 继承

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