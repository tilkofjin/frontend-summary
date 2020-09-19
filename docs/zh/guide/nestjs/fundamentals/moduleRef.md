---
title: 模塊參考
lang: zh-CN
---

## 模塊參考介绍

`Nest` 提供了 `ModuleRef` 類來導航提供程序的內部列表，並使用其註入令牌作為查找鍵來獲取對任何提供者的引用。`ModuleRef` 類還提供了一種動態實例化靜態提供者和範圍提供者的方法。可以按常規方式將 `ModuleRef` 注入到類中：

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
```

::: tip
從 `@nestjs/core` 包中導入 `ModuleRef` 類。
:::


## 檢索實例

`ModuleRef` 實例(以下將其稱為模塊引用)具有 `get()` 方法。此方法使用其註入 令牌/類名稱 檢索在當前模塊中存在(已實例化)的提供者，控制器或可注入對象(例如，防護，攔截器等)。

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
```

::: warning
您無法使用 `get()` 方法檢索作用域提供者(瞬態或請求作用域)。而是，使用下面描述的技術。在此處了解如何[控制範圍](https://docs.nestjs.com/fundamentals/injection-scopes)。
:::

要從全局上下文中檢索提供者(例如，如果提供者已註入其他模塊中)，請將{ `strict：false` }選項作為第二個參數傳遞給 `get()`。

```typescript
this.moduleRef.get(Service, { strict: false });
```

## 解析作用域提供者

若要動態解析作用域提供者(瞬態或請求作用域)，請使用 `resolve()` 方法，並將提供者的注入令牌作為參數傳遞。

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
```

`resolve()` 方法從其自己的**DI容器子樹**中返回提供者的唯一實例。每個子樹都有一個唯一的**上下文標識符**。因此，如果多次調用此方法並比較實例引用，則會發現它們不相等。

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}
```

要跨多個 `resolve()` 調用生成單個實例，並確保它們共享相同的生成的DI容器子樹，可以將上下文標識符傳遞給 `resolve()` 方法。使用 `ContextIdFactory` 類生成上下文標識符。此類提供一個 `create()` 方法，該方法返回適當的唯一標識符。

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}
```

::: tip
`ContextIdFactory` 類是從 `@nestjs/core` 包導入的。
:::



## 獲取當前的子樹

有時，您可能想在請求上下文中解析請求域的提供者的實例。假設 `CatsService` 是請求域的，並且您要解析 `CatsRepository` 實例，該實例也被標記為請求域的提供者。為了共享相同的DI容器子樹，您必須獲取當前的上下文標識符，而不是生成一個新的上下文標識符(例如，使用 `ContextIdFactory.create()` 函數，如上所示)。要獲取當前的上下文標識符，請先使用 `@Inject()` 裝飾器注入請求對象。

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}
```

::: tip
[此處了解](https://docs.nestjs.com/fundamentals/injection-scopes#request-provider)有關請求提供者的更多信息。
:::

現在，使用 `ContextIdFactory` 類的 `getByRequest()` 方法基於請求對象創建一個上下文ID，並將其傳遞給 `resolve()` 調用：

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);
```

## 動態實例化自定義類

要動態實例化前未註冊為提供程序的類，請使用模塊引用的 `create()` 方法。

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}
```

此技術使您可以在框架容器之外有條件地實例化不同的類。







