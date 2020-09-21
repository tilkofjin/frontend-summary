---
title: 生命周期事件
lang: zh-CN
---

## 生命周期事件介绍

`Nest` 應用程序以及每個應用程序元素都有一個由 `Nest` 管理的生命週期。`Nest` 提供了生命週期鉤子，可提供對關鍵生命週期事件的可見性，以及在事件發生時採取行動(在模塊，可注入程序或控制器上運行已註冊代碼)的功能。

## 生命週期順序

下圖描述了從應用程序啟動到節點進程退出之間關鍵應用程序生命週期事件的順序。我們可以將整個生命週期分為三個階段：**初始化，運行和終止**。利用這個生命週期，
您可以計劃適當的模塊和服務初始化，管理活動連接，並在收到終止信號時正常關閉應用程序。

![img](https://docs.nestjs.com/assets/lifecycle-events.png "生命週期順序")


## 生命週期事件

生命週期事件在應用程序引導和關閉期間發生。 `Nest` 會在模塊上調用已註冊的生命週期鉤子的方法。下列每個生命週期事件中的可注射物和控制器(必須先啟用關機鉤子，如下所述)。如上圖所示，`Nest` 還調用適當的基礎方法來開始監聽連接，並停止監聽連接。

下表中的 `onModuleDestroy，beforeApplicationShutdown` 和 `onApplicationShutdown` 僅在您顯式調用 `app.close()` 或進程接收到特殊系統信號(例如`SIGTERM`)並且已在應用程序引導中正確調用 `enableShutdownHooks` 時觸發(請參閱下面的**應用程序關閉**)


| 生命週期鉤子方法 | 生命週期事件觸發鉤子方法調用 |
|:---------------:|:--------------------------:|
| `onModuleInit()`| 主機模塊的依賴關係解決後調用。|
| `onApplicationBootstrap()	` | 一旦所有模塊都已初始化，在偵聽連接之前調用。|
| `onModuleDestroy()`* | 在收到終止信號(例如 `SIGTERM` )之後調用。|
| `beforeApplicationShutdown()`* | 在所有 `onModuleDestroy()` 處理程序完成之後調用(Promises resolved 或 rejected)；完成(Promises resolved 或 rejected)後，所有現有連接都將關閉(調用 `app.close()`)。 |
| `onApplicationShutdown()`* | 在連接關閉後調用( `app.close() resolved `) |

*對於這些事件，如果您未明確調用 `app.close()`，則必須選擇加入以使它們與 `SIGTERM` 等系統信號一起使用。請參閱下面的[應用程序關閉](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown)。

::: warning
對於請求域的類，不會觸發上面列出的生命週期鉤子。請求域的類與應用程序生命週期無關，並且它們的壽命是不可預測的。它們是為每個請求專門創建的，並在發送響應後自動進行垃圾回收。
:::


## 用法

每個生命週期掛鉤都由一個接口表示。接口在技術上是可選的，因為在 `TypeScript` 編譯後它們不存在。儘管如此，最好還是使用它們，为了从强类型和编辑器工具中获益。要註冊生命週期鉤子，請實現適當的接口。例如，要在特定類(例如，`Controller，Provider` 或 `Module`)上註冊要在模塊初始化期間調用的方法，通過提供 `onModuleInit()` 方法來實現 `OnModuleInit` 接口，如下所示：

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
```


## 异步初始化

`OnModuleInit` 和 `OnApplicationBootstrap` 鉤子都允許您推遲應用程序初始化過程(返回 `Promise` 或將方法標記為異步並等待方法主體中的異步方法完成)。

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}
```


## 关闭应用程序

`onModuleDestroy()`，`beforeApplicationShutdown()` 和 `onApplicationShutdown()` 掛鉤在終止階段被調用(響應對 `app.close()` 的顯式調用，或者在接收到系統信號(如已選擇 `SIGTERM`)時)。[<font color=red>Heroku</font>](https://www.heroku.com/)經常將這個功能與[<font color=red>Kubernetes</font>](https://kubernetes.io/)一起使用來管理容器的生命週期，以用於dynos或類似服務。

關閉鉤子偵聽器消耗系統資源，因此默認情況下將其禁用。要使用關閉鉤子，必須通過調用 `enableShutdownHooks()` 啟用偵聽器：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
```

::: warning
由於固有的平台限制，`NestJS` 對 `Windows` 上的應用程序關閉鉤子的支持有限。为了让 `SIGINT` 可以正常工作，以及 `SIGBREAK` 和某種程度上的 `SIGHUP`-[看这里](https://nodejs.org/api/process.html#process_signal_events)。但是，`SIGTERM` 永遠無法在 `Windows` 上運行，因為在任務管理器中終止進程是無條件的，"即，應用程序無法檢測或阻止它"。這是 `libuv` 的一些相關文檔，以了解有關 `SIGINT` 的[更多信息](http://docs.libuv.org/en/v1.x/signal.html)，`SIGBREAK` 和其他在 `Windows` 上處理。另請參見 `Process Signal Events` 的 `Node.js` [文檔](https://nodejs.org/api/process.html#process_signal_events)。
:::

::: tip
`enableShutdownHooks` 通過啟動偵聽器消耗內存。如果您在單個 `Node` 進程中運行多個 `Nest` 應用(例如，使用 `Jest` 運行並行測試時)，節點可能會抱怨過多的偵聽器進程。為此原因，默認情況下，`enableShutdownHooks` 未啟用。在單個 `Node` 進程中運行多個實例時，請注意這種情況。
:::

當應用程序收到終止信號時，它將調用任何已註冊的 `onModuleDestroy()`，`beforeApplicationShutdown()`，然後使用對應的信號作為第一個參數的 `onApplicationShutdown()` 方法(按上述順序)。如果註冊的函數正在等待異步調用(返回promise)，直到promise被解決或被拒絕，`Nest` 才會繼續進行。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
```




















	







