---
title: 介绍
lang: zh-CN
---

## 介绍
在这一组文章中, 您将了解 `Nest` 的核心基础知识。为了了解基本的 `nest` 应用程序构建模块，我们将构建一个基本的 `CRUD` 应用程序, 其中的涵盖了大量的基础功能。


## 语言

我们爱上了 <font color=red> TypeScript </font>，但最重要的是，我们喜欢 <font color=red>Node.js</font>。 这就是为什么 `Nest` 兼容 `TypeScript` 和原生 `JavaScript`。`Nest` 正利用最新的语言功能，所以要使用原生的 `JavaScript` 框架，我们需要一个 <font color=red>Babel</font> 编译器。

在文章中，我们主要使用 `TypeScript` ，但是当它包含一些 `Typescript` 特定的表达式时，总是可以将代码片段切换到 `JavaScript` 版本。

## 先决条件

::: tip
请确保您的操作系统上已安装 [Node.js](https://nodejs.org/en/)（> = 10.13.0）。
:::

## 创建

安装 `npm` 后，您可以在OS终端中使用以下命令创建新的 `Nest` 项目：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

将创建项目目录，安装节点模块和其他一些样板文件，并创建 `src`/目录，并填充几个核心文件。

```
src
├── app.controller.ts
├── app.module.ts
└── main.ts
```
以下是这些核心文件的简要概述：

| 文件名 | 概述 |
|:------:|:------:|
| `app.controller.ts` | 单一路径的基本控制器样本。|
| `app.module.ts` | 应用程序根模块。|
| `main.ts` | 使用核心功能 `NestFactory` 创建 `Nest` 应用程序实例的应用程序的入口文件。|

`main.ts` 包含一个异步函数，它将引导我们的应用程序：

::: tip 官方示例
    main.ts
:::

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

要创建一个 `Nest` 应用程序实例，我们使用核心的 `NestFactory` 类。`NestFactory` 公开了一些允许创建应用程序实例的静态方法。`create()` 方法返回一个应用程序对象，该对象满足 `INestApplication` 接口。该对象提供了一组方法，这些方法将在接下来的章节中进行介绍。在上面的 `main.ts` 示例中，我们只需启动 `HTTP` 侦听器，即可让应用程序等待入站 `HTTP` 请求。

请注意，使用 `Nest CLI` 搭建的项目会创建一个初始项目结构，鼓励开发人员遵循将每个模块保留在其专用目录中的约定。



## 平台

`Nest` 的目标是成为一个与平台无关的框架。平台独立性使创建可重用的逻辑部分成为可能，开发人员可以在多种不同类型的应用程序中利用这些逻辑部分。从技术上讲，一旦创建了适配器，`Nest` 便可以使用任何 `Node HTTP` 框架。现成支持两种HTTP平台：[Express](https://expressjs.com/) 和 [Fastify](https://www.fastify.io/)。您可以选择最适合您需求的。

| 平台 | 描述 |
|:------:|:------:|
| `platform-express` | [<font color=red>Express</font>](https://expressjs.com/)是众所周知的 `nodejs`的 `Web` 框架。这是一个经过测试的，可投入生产的框架，拥有大量社区资源。默认情况下使用 `@nestjs/platform-express` 软件包。 |
| `platform-fastify` | [<font color=red>Fastify</font>](https://www.fastify.io/)是一个高性能，低开销的框架，高度专注于提供最大的效率和速度。 |

无论使用哪种平台，它都会暴露自己的程序接口。这些分别被视为 `NestExpressApplication` 和 `NestFastifyApplication`。

当您将类型传递给 `NestFactory.create()` 方法时。如下例所示，`app` 对象将具有专门用于该特定平台的方法。但请注意，除非您确实要访问基础平台 `API`，否则无需指定类型。

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

## 运行应用程序

安装过程完成后，您可以在OS命令提示符下运行以下命令，以启动应用程序以侦听入站 `HTTP` 请求：

```bash
$ npm run start
```

此命令使用 `HTTP` 服务器启动应用程序，以侦听 `src/main.ts` 文件中定义的端口。应用程序运行后，打开浏览器并导航到 `http://localhost:3000/`。您应该已近看到 `Hello World！` 信息了。