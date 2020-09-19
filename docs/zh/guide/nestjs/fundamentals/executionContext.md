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








