---
title: 动态模块
lang: zh-CN
---

## 动态模块

"[<font color=red>模塊</font>](https://docs.nestjs.com/modules)"一章介紹了 `Nest` 模塊的基礎知識，並簡要介紹了[<font color=red>動態模塊</font>](https://docs.nestjs.com/modules#dynamic-modules)。本章擴展了動態模塊的主題。完成後，您應該對它們是什麼以及如何以及何時使用它們有很好的了解。


## 介绍

文档"概述"部分中的大多数应用程序代码示例都使用常规或静态模块。模块定义了组件组，例如提供者和控制器，它们作为整体应用程序的模块化部分组合在一起。它们为这些组件提供了执行上下文或作用域。例如，模塊中定義的提供者對模塊的其他成員可見，而無需導出它們。當提供者需要在模塊外部可見時，它首先從其主機模塊中導出，然後導入到其使用模塊中。

讓我們來看一個熟悉的例子。

首先，我們將定義一個 `UsersModule` 以提供和導出 `UsersService`。`UsersModule` 是 `UsersService` 的宿主模塊。

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

接下來，我們將定義一個 `AuthModule`，它導入 `UsersModule`，從而使 `AuthModule` 中可以使用 `UsersModule` 的導出提供程序：

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

這些構造使我們可以將 `UsersService` 注入到例如 `AuthModule` 中託管的 `AuthService中`：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}
```

我们将其称为静态模块绑定。`Nest` 已在主机和使用模块中声明了将模块连接在一起所需的所有信息。让我们解压缩此过程中发生的事情。`Nest` 通过以下方式使 `AuthModule` 中的 `UsersService` 可用：
  1、实例化 `UsersModule`，包括可转换地导入 `UsersModule` 本身使用的其他模块，以及可转换地解决任何依赖关系(请参阅自定义提供者)
  2、實例化 `AuthModule`，並使 `UsersModule` 的導出提供者可用於 `AuthModule` 中的組件(就像它們已在 `AuthModule` 中聲明一樣)。
  3、在 `AuthService` 中註入 `UsersService` 的實例。


## 动态模块用例








