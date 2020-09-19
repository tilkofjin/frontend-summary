---
title: 循环依赖
lang: zh-CN
---

## 循环依赖介绍

當兩個類相互依賴時，就會發生循環依賴。例如，A類需要B類，而B類也需要A類。在模塊之間以及提供程序之間的Nest中可能會產生循環依賴關係。儘管應盡可能避免循環依賴，但您不一定總是這樣做。在這種情況下，`Nest` 可以通過兩種方式解決提供者之間的循環依賴關係。本章中，我們描述了使用作為一種技術的**前向引用**，並使用 `ModuleRef` 類從 `DI` 容器中檢索提供者實例。

我們還描述了解決模塊之間循環依賴的問題。


## 前向參考(前向引用)

前向引用使 `Nest` 可以引用尚未使用 `forwardRef()` 實用程序函數定義的類。例如，如果 `CatsService` 和 `CommonService` 相互依賴，則關係的兩端都可以使用 `@Inject()` 和 `forwardRef()` 實用程序來解決循環依賴關係。否則，`Nest` 將不會實例化它們，因為所有基本元數據將不可用。示例：

::: tip 官方示例
    cats.service.ts
:::

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
```

::: tip
`forwardRef()` 函數是從 `@nestjs/common` 包導入的。
:::

这只是关系的一方面。現在讓我們對 `CommonService` 做同樣的事情：

::: tip 官方示例
    common.service.ts
:::

```typescript
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
```

::: warning
實例化的順序是不確定的。哪個構造函數首先調用也是不确定的。
:::


## `ModuleRef` 類的替代方法

使用 `forwardRef()` 的另一種方法是重構代碼，並使用 `ModuleRef` 類在(否則)循環關係的一側檢索提供者。[这里](https://docs.nestjs.com/fundamentals/module-ref)有關 `ModuleRef` 實用程序類的更多信息。


