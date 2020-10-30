---
title: 压缩
lang: zh-CN
---

## 压缩介绍

压缩可以大大减小响应主体的大小，从而提高 `Web` 应用程序的速度。

对于生产中的高流量网站，强烈建议从应用程序服务器上卸载压缩功能-通常是在反向代理(例如Nginx)中。在这种情况下，您不应使用压缩中间件。


## 与 `Express` 一起使用(默认)

使用[<font color=red>压缩</font>](https://github.com/expressjs/compression)中间件软件包启用 `gzip` 压缩。

首先安装所需的软件包：

```bash
$ npm i --save compression
```

安装完成后，将压缩中间件用作全局中间件。

```typescript
import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());
```



## 与 `Fastify` 一起使用

如果使用 `FastifyAdapter`，则需要使用 [<font color=red>fastify-compress</font>](https://github.com/fastify/fastify-compress)：

```bash
$ npm i --save fastify-compress
```

安装完成后，将 `fastify-compress` 中间件用作全局中间件。

```typescript
import compression from 'fastify-compress';
// somewhere in your initialization file
app.register(compression);
```

默认情况下，当浏览器指示支持编码时，`fastify-compress` 将使用 `Brotli` 压缩(在 `Node> = 11.7.0上`)。尽管 `Brotli` 在压缩率方面非常有效，但它也相当慢。因此，您可能要告诉 `fastify-compress` 仅使用 `deflate` 和 `gzip` 来压缩响应。您最终会得到更大的响应，但也会更快地收到它们。

要指定编码，请为 `app.register` 提供第二个参数：

```typescript
app.register(compression, { encodings: ['gzip', 'deflate'] });
```

上面的内容告诉 `fastify-compress` 仅使用 `gzip` 和 `deflate` 编码，如果客户端同时支持 `gzip` 和 `deflate` 编码，则首选 `gzip`。