---
title: 拦截器
lang: zh-CN
---

## 拦截器介绍

拦截器是用 `@Injectable()` 装饰器注释的类，拦截器应实现 `NestInterceptor` 接口。

![img](https://docs.nestjs.com/assets/Interceptors_1.png "拦截器")

拦截器具有一组有用的功能，这些功能受面向方面编程( `AOP` )技术的启发。他们使得：

 - 在方法执行之前/之后绑定**额外的逻辑**
 - **转换**从函数返回的结果
 - **转换**从函数引发的异常
 - **扩展**基本功能行为
 - 根据特定条件**完全覆盖**功能(例如出于缓存目的)

## 基础

每个拦截器都实现带有两个参数的 `intercept()` 方法。第一个是 `ExecutionContext` 实例(与用于守卫的对象完全相同)。`ExecutionContext` 继承自 `ArgumentsHost`。我们之前在异常过滤器一章中看到过 `ArgumentsHost`。在那里，我们看到了它是传递给原始处理程序的参数的包装，并包含基于应用程序类型的不同参数数组。您可以参考[异常过滤器](https://docs.nestjs.com/exception-filters#arguments-host)以获取有关此主题的更多信息。

## 执行上下文

通过扩展 `ArgumentsHost`，`ExecutionContext` 还添加了几个新的辅助方法，这些方法提供有关当前执行过程的更多详细信息。这些详细信息有助于构建更通用的拦截器，这些拦截器可以在广泛的控制器，方法和执行上下文中使用。在[此处](https://docs.nestjs.com/fundamentals/execution-context)了解有关 `ExecutionContext` 的更多信息。

## 呼叫处理程序

第二个参数是 `CallHandler`。`CallHandler` 接口实现 `handle()` 方法，可在拦截器中的某个点使用该方法来调用路由处理程序方法。如果在实现 `intercept()` 方法的过程中未调用 `handle()` 方法，则根本不会执行路由处理程序方法。

这种方法意味着 `intercept()` 方法有效地**包装**了请求/响应流。结果，您可以在执行最终路由处理程序之前和之后都实现自定义逻辑。显然，您可以在调用 `handle()` 之前在执行的 `invoke()` 方法中编写代码，但是如何影响此后的情况？因为 `handle()` 方法返回一个 `Observable`，所以我们可以使用功能强大的 [<font color=red>RxJS</font>](https://github.com/ReactiveX/rxjs) 运算符来进一步处理响应。

例如，考虑传入的 `POST/cats` 请求。该请求发往 `CatsController` 内部定义的 `create()` 处理函数。如果在此过程中的任何地方调用了 `handle()` 方法的拦截器，则不会执行 `create()` 方法。一旦 `handle()` 被调用(并返回其 `Observable`)，将触发 `create()` 处理函数。并且一旦通过 `Observable` 接收到响应流，就可以对该流执行其他操作，并将最终结果返回给调用方。

## 方面拦截

我们将看到的第一个用例是使用拦截器记录用户交互(例如，存储用户调用，异步调度事件或计算时间戳)。我们在下面显示一个简单的 `LoggingInterceptor`：

::: tip 官方示例
    logging.interceptor.ts
:::

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
```

::: tip
`NestInterceptor <T，R>` 是一个通用接口，其中 `T` 表示 `Observable <T>` 的类型(支持响应流)，`R` 是 `Observable <R>` 包装的值的类型。
:::

::: warning
拦截器(如控制器，提供程序，防护程序等)可以通过其构造函数注入依赖项。
:::

由于 `handle()` 返回 `RxJS Observable`，因此我们可以选择多种运算符来处理流。在上面的示例中，我们使用了 `tap()` 运算符，该运算符在可观察到的流正常或异常终止时调用匿名日志记录功能，但不会干扰响应周期。

## 绑定拦截器

为了设置拦截器，我们使用从 `@nestjs/common` 包导入的 `@UseInterceptors()` 装饰器。像<font color=red>管道</font>和<font color=red>守卫</font>一样，拦截器可以是控制器范围，方法范围或全局范围的。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

::: tip
`@UseInterceptors()` 装饰器是从 `@nestjs/common` 包导入的。
:::

使用上述构造，`CatsController` 中定义的每个路由处理程序将使用 `LoggingInterceptor`。当有人调用 `GET/cats` 端点时，您将在标准输出中看到以下输出：

```log
Before...
After... 1ms
```

请注意，我们传递了 `LoggingInterceptor` 类型(而不是实例)，将实例化责任留给了框架并启用了依赖项注入。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}
```

如上所述，上面的构造将拦截器附加到此控制器声明的每个处理程序。如果我们想将拦截器的范围限制为单个方法，则只需在方法级别应用装饰器。

为了设置全局拦截器，我们使用 `Nest` 应用程序实例的 `useGlobalInterceptors()` 方法：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

全局拦截器在整个应用程序中用于每个控制器和每个路由处理程序。在依赖关系注入方面，从任何模块外部注册的全局拦截器(如上例所示，使用 `useGlobalInterceptors()`)都不能注入依赖关系，因为这是在任何模块的上下文之外完成的。为了解决此问题，您可以使用以下结构直接从任何模块设置拦截器：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```
::: tip
当使用此方法对拦截器执行依赖项注入时，请注意，无论采用哪种构造的模块，拦截器实际上都是全局的。应该在哪里做？选择定义了拦截器(以上示例中为 `LoggingInterceptor` )的模块。同样，`useClass` 不是处理自定义提供程序注册的唯一方法。[了解更多](https://docs.nestjs.com/fundamentals/custom-providers)。
:::

## 响应映射

我们已经知道 `handle()` 返回一个 `Observable`。流包含从路由处理程序返回的值，因此我们可以使用 `RxJS` 的 `map()` 运算符轻松对其进行突变。

::: warning
响应映射功能不适用于特定于库的响应策略(禁止直接使用 `@Res()` 对象)。
:::

让我们创建一个 `TransformInterceptor`，它将以简单的方式修改每个响应以演示该过程。它将使用 `RxJS` 的 `map()` 运算符将响应对象分配给新创建的对象的 `data` 属性，然后将新对象返回给客户端。

::: tip 官方示例
    transform.interceptor.ts
:::

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

::: tip
嵌套拦截器可与同步和异步 `intercept()` 方法一起使用。您可以根据需要将方法切换为异步。
:::

通过上述构造，当有人调用 `GET/cats` 端点时，响应如下所示(假定路由处理程序返回一个空数组[])：

```json
{
  "data": []
}
```

拦截器对于为整个应用程序中出现的需求创建可重用的解决方案具有巨大的价值。例如，假设我们需要将每次出现的空值转换为空字符串 `''`。我们可以使用一行代码来做到这一点，并全局绑定拦截器，以便每个注册的处理程序都可以自动使用它。

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map(value => value === null ? '' : value ));
  }
}
```

## 异常映射

另一个有趣的用例是利用 `RxJS` 的 `catchError()` 运算符来覆盖抛出的异常：

::: tip 官方示例
    errors.interceptor.ts
:::

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err => throwError(new BadGatewayException())),
      );
  }
}
```

## 流覆盖

我们有时可能想完全阻止调用处理程序并返回其他值的原因有几个。一个明显的例子是实现缓存以缩短响应时间。让我们看一个简单的缓存拦截器，该拦截器从缓存中返回其响应。在一个实际的示例中，我们希望考虑其他因素，例如 `TTL`，缓存失效，缓存大小等，但这超出了本讨论的范围。在这里，我们将提供一个基本示例来说明主要概念。

::: tip 官方示例
    cache.interceptor.ts
:::

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isCached = true;
    if (isCached) {
      return of([]);
    }
    return next.handle();
  }
}
```

我们的 `CacheInterceptor` 也有一个硬编码的 `isCached` 变量和一个硬编码的响应 `[]`。需要注意的关键点是，我们在此处返回由 `RxJS of()` 运算符创建的新流，因此根本不会调用路由处理程序。当有人调用使用 `CacheInterceptor` 的终结点时，响应(硬编码的空数组)将立即返回。为了创建通用解决方案，您可以利用 `Reflector` 并创建自定义装饰器。守卫一章对反射进行了详细说明。


## 更多操作符

使用 `RxJS` 运算符操作流的可能性为我们提供了许多功能。让我们考虑另一个常见的用例。想象一下您想处理路由请求超时。如果您的端点在一段时间后未返回任何内容，则您将以错误响应终止。以下构造可实现此目的：

::: tip 官方示例
    timeout.interceptor.ts
:::

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(new RequestTimeoutException());
        }
        return throwError(err);
      }),
    );
  };
};
```

5秒后，请求处理将被取消。您还可以在引发 `RequestTimeoutException` 之前添加自定义逻辑(例如，释放资源)。