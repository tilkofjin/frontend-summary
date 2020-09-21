---
title: 執行上下文
lang: zh-CN
---

## 執行上下文介绍

`Nest` 提供了幾個實用程序類，可幫助您輕鬆編寫可在多個應用程序上下文中運行的應用程序(例如，基於 `Nest HTTP Server`，微服務和 `WebSockets` 應用程序上下文)。這些實用程序提供有關當前執行上下文的信息，這些信息可用於構建可在廣泛的控制器，方法和執行上下文中工作的通用[守卫](https://docs.nestjs.com/guards)，[過濾器](https://docs.nestjs.com/interceptors)和[攔截器](https://docs.nestjs.com/exception-filters)。

在本章中，我們將介紹兩個此類：`ArgumentsHost` 和 `ExecutionContext`。

## 宿主類

`ArgumentsHost` 類提供用於檢索傳遞給處理程序的參數的方法。它允許選擇適當的上下文(例如 `HTTP，RPC(微服務)` 或 `WebSockets`)以從中檢索參數。該框架在您可能要訪問它的地方提供了 `ArgumentsHost` 的實例，通常稱為主機參數。例如，使用 `ArgumentsHostinstance` 調用異常過濾器的 `catch()` 方法。

`ArgumentsHost` 只是充當處理程序參數的抽象。例如，對於 `HTTP` 服務器應用程序(使用 `@nestjs/platform-express` 時)，宿主對象封裝了 `Express` 的 `[request，response，next]` 數組，其中 `request` 是請求對象，`response` 是響應對象，`next` 是控制應用程序請求-響應週期的函數。另一方面，對於 <font color=red GraphQL></font>` 應用程序，主機對象包含 `[root，args，context，info]` 數組。


## 當前應用程序上下文

在構建旨在跨多個應用程序上下文運行的通用防護，過濾器和攔截器時，我們需要一種方法來確定當前在其中運行方法的應用程序類型。使用 `ArgumentsHost` 的 `getType()` 方法執行此操作：

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}
```

::: tip
`GqlContextType` 是從 `@nestjs/graphql` 包導入的。
:::

使用可用的應用程序類型，我們可以編寫更多通用組件，如下所示。

## 主機處理程序參數

要檢索傳遞給處理程序的參數數組，一種方法是使用宿主對象的 `getArgs()` 方法。

```typescript
const [req, res, next] = host.getArgs();
```

您可以使用 `getArgByIndex()` 方法按索引選擇特定的參數：

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);
```

在這些示例中，我們按索引檢索了請求和響應對象，通常不建議這樣做，因為它會將應用程序耦合到特定的執行上下文。相反，通過使用宿主對象的一種實用程序方法切換到適合您的應用程序的適當應用程序上下文，可以使代碼更健壯和可重用。上下文切換實用程序方法如下所示。

```typescript
/**
 * Switch context to RPC.
 */
switchToRpc(): RpcArgumentsHost;
/**
 * Switch context to HTTP.
 */
switchToHttp(): HttpArgumentsHost;
/**
 * Switch context to WebSockets.
 */
switchToWs(): WsArgumentsHost;
```

讓我們使用 `switchToHttp()` 方法重寫前面的示例。`host.switchToHttp()` 幫助程序調用返回適合於 `HTTP` 應用程序上下文的 `HttpArgumentsHost` 對象。`HttpArgumentsHost` 對象具有兩個有用的方法，我們可以使用這些方法來提取所需的對象。在這種情況下，我們還使用 `Express` 類型斷言來返回本機 `Express` 類型的對象：

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();
```

同樣，`WsArgumentsHost` 和 `RpcArgumentsHost` 具有在微服務和 `WebSockets` 上下文中返回適當對象的方法。這是 `WsArgumentsHost` 的方法:

```typescript
export interface WsArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;
  /**
   * Returns the client object.
   */
  getClient<T>(): T;
}
```

以下是 `RpcArgumentsHost` 的方法：

```typescript
export interface RpcArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;

  /**
   * Returns the context object.
   */
  getContext<T>(): T;
}
```


## `ExecutionContext` 類

`ExecutionContext` 擴展了 `ArgumentsHost`，提供了有關當前執行過程的更多詳細信息。與 `ArgumentsHost` 一樣，`Nest` 在您可能需要的地方提供 `ExecutionContext` 的實例，例如在守卫的 `canActivate()` 方法和攔截器的 `intercept()` 方法中。

```typescript
export interface ExecutionContext extends ArgumentsHost {
  /**
   * Returns the type of the controller class which the current handler belongs to.
   */
  getClass<T>(): Type<T>;
  /**
   * Returns a reference to the handler (method) that will be invoked next in the
   * request pipeline.
   */
  getHandler(): Function;
}
```

`getHandler()` 方法返回對要調用的處理程序的引用。`getClass()` 方法返回此特定處理程序所屬的 `Controller` 類的類型。例如，在 `HTTP` 上下文中，如果當前處理的請求是 `POST` 請求，綁定到 `CatsController` 上的 `create()` 方法，`getHandler()` 返回對 `create()` 方法的引用，`getClass()` 返回 `CatsControllertype`(非實例)。

```typescript
const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "CatsController"
```

訪問對當前類和處理程序方法的引用的能力提供了極大的靈活性。最重要的是，它使我們有機會從守衛或攔截器中通過 `@SetMetadata()` 裝飾器訪問元數據集。我們在下面介紹此用例。


## 反射和元數據

`Nest` 提供了通過 `@SetMetadata()` 裝飾器將自定義元數據附加到路由處理程序的功能。然後，我們可以從班級內部訪問此元數據以做出某些決定。

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
`@SetMetadata()` 裝飾器是從 `@nestjs/common` 包導入的。
:::

通過上面的構造，我們將角色元數據(角色是元數據鍵，`['admin']` 是關聯的值)附加到 `create()` 方法。雖然這可行，但在路由中直接使用 `@SetMetadata()` 並不是一個好習慣。而是創建您自己的裝飾器，如下所示：

::: tip 官方示例
    roles.decorator.ts
:::

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

這種方法更簡潔，更易讀，並且使用強類型。現在我們有了一個自定義的 `@Roles()` 裝飾器，我們可以使用它來裝飾 `create()` 方法。

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

要訪問路由的角色(自定義元數據)，我們將使用 `Reflector` 幫助器類，該類由框架提供，並通過 `@nestjs/core` 包导入。`Reflector` 可以按常規方式註入到類中：

::: tip 官方示例
    roles.guard.ts
:::

```typescript
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
```

::: tip
`Reflector` 類是從 `@nestjs/core` 包導入的。
:::

現在，要讀取處理程序元數據，請使用 `get()` 方法。

```typescript
const roles = this.reflector.get<string[]>('roles', context.getHandler());
```

`Reflector＃get` 方法允許我們通過傳入兩個參數來輕鬆訪問元數據：元數據鍵和上下文(裝飾器目標)，以從中檢索元數據。在此示例中，指定的鍵為 "角色"(請參考上面的 `role.decorator.ts` 文件以及在此處進行的 `SetMetadata()` 調用)。上下文是由對 `context.getHandler()` 的調用提供的，這導致提取當前處理​​的路由處理程序的元數據。記住，`getHandler()` 為我們提供了對路由處理程序函數的引用。

或者，我們可以通過在控制器級別應用元數據，將其應用於控制器類中的所有路由來組織控制器。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Roles('admin')
@Controller('cats')
export class CatsController {}
```

在這種情況下，要提取控制器元數據，我們傳遞 `context.getClass()` 作為第二個參數(以提供控制器類作為元數據提取的上下文)，而不是 `context.getHandler()`：

::: tip 官方示例
    roles.guard.ts
:::

```typescript
const roles = this.reflector.get<string[]>('roles', context.getClass());
```

鑑於可以在多個級別提供元數據，您可能需要從多個上下文中提取和合併元數據。`Reflector` 類提供了兩個實用程序方法來幫助解決此問題。這些方法立即提取控制器和方法元數據，並以不同方式組合它們。

考慮以下情形，您在兩個級別都提供了 "角色" 元數據。

::: tip 官方示例
    cats.controller.ts
:::

```typescript
@Roles('user')
@Controller('cats')
export class CatsController {
  @Post()
  @Roles('admin')
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}
```

如果您打算將 `'user'` 指定為默認角色，並為某些方法選擇性地覆蓋它，則可能會使用 `getAllAndOverride()` 方法。

```typescript
const roles = this.reflector.getAllAndOverride<string[]>('roles', [
  context.getHandler(),
  context.getClass(),
]);
```

使用上述代碼的後衛，在帶有上述元數據的 `create()` 方法的上下文中運行，將導致角色包含 `['admin']`。

要獲取兩者的元數據並將其合併(此方法合併數組和對象)，請使用 `getAllAndMerge()` 方法：

```typescript
const roles = this.reflector.getAllAndMerge<string[]>('roles', [
  context.getHandler(),
  context.getClass(),
]);
```

這將導致角色包含 `['user'，'admin']`。

對於這兩種合併方法，都將元數據鍵作為第一個參數傳遞，並將元數據目標上下文數組(即，對 `getHandler()` 和/或 `getClass()` 方法的調用)作為第二個參數傳遞。














































