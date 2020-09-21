---
title: 测试
lang: zh-CN
---

## 测试介绍

自動化測試被認為是任何認真的軟件開發工作的重要組成部分。自動化使得在開發過程中輕鬆快速地重複單個測試或測試套件變得容易。這有助於確保發行版達到質量和性能目標。自動化有助於擴大覆蓋範圍，並為開發人員提供更快的反饋循環。自動化既可以提高單個開發人員的生產率，又可以確保測試在關鍵的開發生命週期關頭運行，例如源代碼控制簽到，功能集成和版本發布。

此類測試通常涵蓋多種類型，包括單元測試，端到端(`e2e`)測試，集成測試等等。雖然好處是毋庸置疑的，但設置這些好處可能很繁瑣。`Nest` 致力於促進開發最佳實踐，包括有效的測試，因此它包含以下功能，以幫助開發人員和團隊構建和自動化測試。`Nest`：
  - 自動為組件提供默認的單元測試和為應用程序提供端到端測試
  - 提供默認工具(例如構建獨立模塊/應用程序加載器的測試運行器)
  - 開箱即用地提供與 `Jest` 和 `Supertest` 的集成，同時與測試工具無關
  - 使 `Nest` 依賴項注入系統可在測試環境中使用，以輕鬆模擬組件

如上所述，您可以使用自己喜歡的任何測試框架，因為 `Nest` 不會強制使用任何特定工具。只需替換所需的元素(例如測試運行程序)，您仍將享受 `Nest` 的現成測試設施的好處。

## 安装

安装软件包：

```bash
$ npm i --save-dev @nestjs/testing
```

## 單元測試

在以下示例中，我們測試兩個類：`CatsController` 和 `CatsService`。如前所述，`Jest` 被提供為默認測試框架。它充當測試運行器，還提供斷言函數和雙重測試實用程序，以幫助進行模擬，監視等。在下面的基本測試中，我們手動實例化這些類，並確保控制器和服務履行其 `API` 的約定。

::: tip 官方示例
    cats.controller.spec.ts
:::

```typescript
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```

::: tip
將您的測試文件放在他們測試的類附近。測試文件應帶有 `.spec` 或 `.test` 後綴。
:::

上面的示例只是小例子，因此我們並未真正測試任何與 `Nest` 相關的內容。確實，我們甚至沒有使用依賴注入(注意，我們將 `CatsService` 的實例傳遞給我們的 `catsController`)。這種測試形式-我們手動實例化要測試的類-通常被稱為隔離測試，因為它獨立於框架。讓我們介紹一些更高級的功能，這些功能可以幫助您測試更廣泛使用 `Nest` 功能的應用程序。


## 测试工具

`@nestjs/testing` 軟件包提供了一組實用程序，這些實用程序可實現更強大的測試過程。讓我們使用內置的 `Test` 類重寫前面的示例：

::: tip 官方示例
    cats.controller.spec.ts
:::

```typescript
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = moduleRef.get<CatsService>(CatsService);
    catsController = moduleRef.get<CatsController>(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```

`Test` 類對於提供實質上模擬整個 `Nest` 運行時的應用程序執行上下文很有用，但是為您提供了易於管理類實例的鉤子，包括模仿和覆蓋。`Test` 類具有 `createTestingModule()` 方法，該方法將模塊元數據對像作為其參數(與傳遞給 `@Module()` 裝飾器的對象相同)。此方法返回 `TestingModule` 實例，該實例又提供了一些方法。對於單元測試，重要的是 `compile()` 方法。此方法使用其依賴項引導模塊(類似於使用 `NestFactory.create()` 在傳統的 `main.ts` 文件中引導應用程序的方式)，然後返回準備進行測試的模塊。

::: tip
`compile()` 方法是異步的，因此必須等待。編譯模塊後，您可以使用 `get()` 方法檢索它聲明的任何靜態實例(控制器和提供程序)。
:::

`TestingModule` 繼承自模塊參考類，因此，它具有動態解析作用域提供者的能力(瞬態或請求域)。使用 `resolve()` 方法執行此操作( `get()` 方法只能檢索靜態實例)。

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);
```

::: warning
`resolve()` 方法從其自己的**DI容器子樹**中返回提供者的唯一實例。每個子樹都有一個唯一的上下文標識符。因此，如果多次調用此方法並比較實例引用，則會發現它們不相等。
:::

::: tip
[此處](https://docs.nestjs.com/fundamentals/module-ref)了解有關模塊參考功能的更多信息。
:::

除了使用任何提供者的生產版本之外，您還可以使用自定義提供者覆蓋它以進行測試。例如，您可以模擬數據庫服務而不是連接到實時數據庫。我們將在下一部分中介紹替代，但是它們也可用於單元測試。


## 端到端測試

與單元測試不同，單元測試側重於單個模塊和類，端到端(`e2e`)測試涵蓋了更匯總級別的類和模塊的交互-更接近最終用戶與生產系統的交互類型。隨著應用程序的增長，很難手動測試每個 `API` 端點的端到端行為。自動化的端到端測試可幫助我們確保系統的整體行為正確並符合項目要求。為了執行端到端測試，我們使用與剛剛在單元測試中介紹的配置類似的配置。此外，`Nest` 可以輕鬆使用 [<font color=red>Supertest</font>](https://github.com/visionmedia/supertest)庫來模擬 `HTTP` 請求。

::: tip 官方示例
    cats.e2e-spec.ts
:::

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
})
```

在此示例中，我們以前面描述的一些概念為基礎。除了我們之前使用的 `compile()` 方法之外，現在，我們使用 `createNestApplication()` 方法實例化完整的 `Nest` 運行時環境。我們在應用程序變量中保存了對正在運行的應用程序的引用，因此我們可以使用它來模擬 `HTTP` 請求。

我們使用 `Supertest` 的 `request()` 函數模擬 `HTTP` 測試。我們希望這些 `HTTP` 請求路由到我們正在運行的 `Nest` 應用程序，因此我們將 `request()` 函數傳遞給嵌套 `Nest` 的 `HTTP` 偵聽器的引用(而後者又可能由 `Express` 平台提供)。因此，構造請求( `app.getHttpServer()` )。對 `request()` 的調用將給我們一個包裝好的 `HTTP` 服務器，該服務器現在已連接到 `Nest` 應用，暴露了模擬實際 `HTTP` 請求的方法。例如，使用 `request(...)`。 `get('/cats')` 將向 `Nest` 應用發起一個與實際 `HTTP` 請求相同的請求，例如通過網絡進入的 `get('/cats')`。

在此示例中，我們還提供了 `CatsService` 的備用(測試兩倍)實現，該實現僅返回我們可以測試的硬編碼值。使用 `overrideProvider()` 提供此類替代實現。同樣， `Nest` 提供的方法分別使用 `overrideGuard()`，`overrideInterceptor()`，`overrideFilter()` 和 `overridePipe()` 方法來覆蓋守卫，攔截器，過濾器和管道。

每個重寫方法都將使用3種不同的方法返回一個對象，這些方法與針對自定義提供程序描述的方法類似：
  - `useClass`：您提供一個將實例化的類，以提供實例來覆蓋對象(提供者，保護者等)。
  - `useValue`：您提供一個將覆蓋該對象的實例。
  - `useFactory`：提供一個函數，該函數返回將覆蓋該對象的實例。

每個重寫方法類型依次返回 `TestingModule` 實例，因此可以與其他方法以[流暢的樣式](https://en.wikipedia.org/wiki/Fluent_interface)鏈接在一起。您應在此類鏈的末尾使用 `compile()`，以使 `Nest` 實例化並初始化模塊。

編譯的模塊具有幾種有用的方法，如下表所示：

|  方法  | 描述 |
|:------------:|:------------:|
| `createNestApplication()` | 根據給定的模塊創建並返回一個 `Nest` 應用程序( `INestApplication` 實例)。請注意，您必須使用 `init()` 方法手動初始化應用程序。|
| `createNestMicroservice()` | 根據給定的模塊創建並返回 `Nest` 微服務( `INestMicroservice` 實例)。|
| `get()` | 檢索應用程序上下文中可用的控制器或提供程序的靜態實例(包括守卫，過濾器等)。繼承自模塊引用類。|
| `resolve()` | 檢索在應用程序上下文中可用的控制器或提供程序(包括守卫，過濾器等)的動態創建的作用域實例(請求或臨時實例)。|
| `select()` | 瀏覽模塊的依賴關係圖；可用於從所選模塊中檢索特定實例(與 `get()` 方法中的 `strict` 模式(`strict：true`)一起使用)。|


::: tip
將您的 `e2e` 測試文件保留在 `e2e` 目錄中。測試文件應具有 `.e2e-spec` 或 `.e2e-test` 後綴。
:::


## 測試請求域的實例

為每個傳入請求創建唯一的[請求域](https://docs.nestjs.com/fundamentals/injection-scopes)提供者。請求完成處理後，實例將被垃圾回收。這帶來了一個問題，因為我們無法訪問專門為已測試請求生成的依賴項注入子樹。

我們(基於以上部分)知道，`resolve()` 方法可用於檢索動態實例化的類。另外，如此處所述，我們知道我們可以傳遞一個唯一的上下文標識符來控制DI容器子樹的生命週期。我們如何在測試環境中利用這一點？該策略是預先生成一個上下文標識符，並強制 `Nest` 使用此特定 `ID` 為所有傳入請求創建一個子樹。這樣，我們將能夠檢索為已測試請求創建的實例。

為此，請在 `ContextIdFactory` 上使用 `jest.spyOn()`：

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);
```

現在，我們可以使用 `contextId` 來訪問任何後續請求的單個生成的DI容器子樹。

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);
```

