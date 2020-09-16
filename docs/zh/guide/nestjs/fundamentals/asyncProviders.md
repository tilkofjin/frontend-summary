---
title: 异步提供者
lang: zh-CN
---

## 異步提供者介绍

有时，应将应用程序启动延迟，直到完成一个或多个异步任务为止。例如，您可能不希望在建立与数据库的连接之前开始接受请求。您可以使用異步提供程序來實現。

他的語法是使用 `useFactory` 語法使用 `async/await`。工廠返回一個 `Promise`，並且工廠函數可以等待異步任務。在實例化任何依賴(注入)此類提供程序的類之前，`Nest` 將等待 `promise` 的解析。

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```

::: tip
在[此處](https://docs.nestjs.com/fundamentals/custom-providers)了解有關自定義提供者語法的更多信息。
:::


## 注入

像其他任何提供者一樣，異步提供者通過其令牌被注入到其他組件中。在上面的示例中，您將使用結構 `@Inject('ASYNC_CONNECTION')`。

## 例子

[<font color=red>TypeORM</font>](https://docs.nestjs.com/recipes/sql-typeorm)具有異步提供者的一個更重要的示例。





