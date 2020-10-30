---
title: 安全
lang: zh-CN
---

## 安全介绍

在本章中，我们介绍了各种技术，可帮助您提高应用程序的安全性。



## `Helmet`

[<font color=red>Helmet</font>](https://github.com/helmetjs/helmet) 可以通过适当设置 `HTTP` 标头来帮助保护您的应用程序免受某些知名的网络漏洞的侵害。通常，`Helmet` 只是14个较小的中间件功能的集合，这些功能设置了与安全相关的 `HTTP` 标头([更多信息](https://github.com/helmetjs/helmet#how-it-works))。

首先安装所需的软件包。如果使用 [<font color=red>Express</font>](https://expressjs.com/) (`Nest` 中的默认设置)：

安装完成后，将其用作全局中间件。

```typescript
import * as helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

如果使用的是 `FastifyAdapter`，则需要使用[<font color=red>fastify-helmet</font>](https://github.com/fastify/fastify-helmet)：

```bash
$ npm i --save fastify-helmet
```

[<font color=red>fastify-helmet</font>](https://github.com/fastify/fastify-helmet)不应用作中间件，而应用作[<font color=red>Fastify插件</font>](https://www.fastify.io/docs/latest/Plugins/)，即通过使用 `app.register()`：

```typescript
import * as helmet from 'fastify-helmet';
// somewhere in your initialization file
app.register(helmet);
// or the following, but note that it's not type safe
// app.getHttpAdapter().register(helmet);
```

::: tip
请注意，将 `helmet` 应用为全局 `helmet` 或将其注册必须在对 `app.use()` 的其他调用或可能调用 `app.use()` 的设置函数之前进行。这是由于基础平台(即 `Express` 或 `Fastify` )的工作方式所决定的，其中定义了中间件/路由的顺序很重要。如果在定义路由后使用 `helmet` 或 `cors` 等中间件，则该中间件将不适用于该路由，而仅适用于在路由后定义的中间件。
:::




## `CORS`

跨域资源共享( `CORS` )是一种允许从另一个域请求资源的机制。`Nest` 在引擎盖下使用 `Express` [<font color=red>cors</font>](https://github.com/expressjs/cors) 软件包。该软件包提供了各种选项，您可以根据自己的需求进行自定义。要启用 `CORS`，请在 `Nest` 应用程序对象上调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(3000);
```

`enableCors()` 方法采用可选的配置对象参数。该对象的可用属性在官方[<font color=red>CORS</font>](https://github.com/expressjs/cors#configuration-options) 文档中进行了描述。

或者，通过 `create()` 方法的 `options` 对象启用 `CORS`。将 `cors` 属性设置为 `true` 以启用具有默认设置的 `CORS`。或者，将 `CORS` 配置对象作为 `cors` 属性值传递，以自定义其行为。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(3000);
```


## `CSRF`

跨站点请求伪造(也称为 `CSRF` 或 `XSRF` )是一种网站的恶意利用，其中从 `Web` 应用程序信任的用户发送未经授权的命令。为了减轻这种攻击，您可以使用[<font color=red>csurf</font>](https://github.com/expressjs/csurf) 软件包。

首先安装所需的软件包：

```bash
$ npm i --save csurf
```

::: warning
如[csurf中间件页面](https://github.com/expressjs/csurf#csurf)上所述，`csurf` 模块需要首先初始化会话中间件或 `cookie` 解析器。请参阅该文档以获取更多说明。
:::

安装完成后，将 `csurf` 中间件用作全局中间件。

```typescript
import * as csurf from 'csurf';
// somewhere in your initialization file
app.use(csurf());
```



## 限速

保护应用程序免受暴力攻击的常用技术是速率限制。存在许多 `Express` 软件包以提供速率限制功能。一种流行的是[<font color=red>Express速率限制</font>](https://github.com/nfriedly/express-rate-limit)。

首先安装所需的软件包：

```bash
$ npm i --save express-rate-limit
```

安装完成后，将速率限制器用作全局中间件。

```typescript
import * as rateLimit from 'express-rate-limit';
// somewhere in your initialization file
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
```

当服务器与 `Internet` 之间存在负载平衡器或反向代理时，可能需要将 `Express` 配置为信任代理设置的标头，以便为最终用户获取正确的 `IP`。为此，请在创建应用程序实例时首先使用 `NestExpressApplication` 平台[<font color=red>接口</font>](https://docs.nestjs.com/first-steps#platform)，然后启用[<font color=red>信任代理</font>](https://expressjs.com/en/guide/behind-proxies.html)设置：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);
```

::: tip
如果使用 `FastifyAdapter`，请考虑改用[fastify-rate-limit](https://github.com/fastify/fastify-rate-limit)。
:::
