---
title: 配置
lang: zh-CN
---

## 配置介绍

应用程序通常在不同的环境中运行。根据环境，应使用不同的配置设置。例如，通常本地环境依赖于特定的数据库凭据，仅对本地数据库实例有效。生产环境将使用一组单独的数据库凭据。由于配置变量会更改，因此最佳实践是将[<font color=red>配置变量存储</font>](https://12factor.net/config)在环境中。

通过 `process.env` 全局，可以在 `Node.js` 内部看到外部定义的环境变量。我们可以尝试通过在每个环境中分别设置环境变量来解决多个环境的问题。这会很快变得难以处理，特别是在需要轻松模拟 且/或 更改这些值的开发和测试环境中。

在 `Node.js` 应用程序中，通常使用 `.env` 文件，其中包含每个键代表一个特定值的键值对，以代表每个环境。在不同的环境中运行应用程序仅是交换正确的 `.env` 文件的问题。

在 `Nest` 中使用此技术的一种好方法是创建一个 `ConfigModule`，该 `ConfigModule` 公开一个 `ConfigService`，该 `ConfigService` 加载适当的 `.env` 文件。尽管您可以选择自己编写这样的模块，但为方便起见，`Nest` 提供了 `@nestjs/config` 开箱即用的软件包。我们将在本章中介绍该软件包。



## 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm i --save @nestjs/config
```

::: tip
`@nestjs/config` 软件包内部使用 `dotenv`。
:::



## 开始

安装过程完成后，我们可以导入 `ConfigModule`。通常，我们将其导入到根 `AppModule` 中，并使用 `.forRoot()` 静态方法控制其行为。在此步骤中，将解析环境变量键/值对。稍后，我们将在其他功能模块中看到几个用于访问 `ConfigModule` 的 `ConfigService` 类的选项。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
```

上面的代码将从默认位置(项目根目录)加载并解析 `.env` 文件，将 `.env` 文件中的键/值对与分配给 `process.env` 的环境变量合并，并将结果存储在一个私有结构中，该私有结构您可以通过 `ConfigService` 访问。`forRoot()` 方法注册了 `ConfigService` 提供程序，该提供程序提供了一个 `get()` 方法来读取这些已 解析/合并 的配置变量。由于 `@nestjs/config` 依赖于 `dotenv`，因此它使用该程序包的规则来解决环境变量名称中的冲突。当密钥在运行时环境中作为环境变量存在时(例如，通过 `OS shell` 导出，例如 `export DATABASE_USER = test`)，并且在 `.env` 文件中时，运行时环境变量具有优先权。

`.env` 示例文件看起来像这样：

```env
DATABASE_USER=test
DATABASE_PASSWORD=test
```


## 自定义环境文件路径

默认情况下，程序包在应用程序的根目录中查找 `.env` 文件。要为 `.env` 文件指定另一个路径，请设置传递给 `forRoot()` 的(可选)选项对象的 `envFilePath` 属性，如下所示：

```typescript
ConfigModule.forRoot({
  envFilePath: '.development.env',
});
```

您还可以为 `.env` 文件指定多个路径，如下所示：

```typescript
ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});
```

如果在多个文件中找到一个变量，则第一个优先。




## 禁用环境变量加载

如果您不想加载 `.env` 文件，而是想简单地从运行时环境中访问环境变量(例如 `OS shell` 导出，例如 `export DATABASE_USER = test`)，则将 `options` 对象的 `ignoreEnvFile` 属性设置为 `true`，如下所示：

```typescript
ConfigModule.forRoot({
  ignoreEnvFile: true,
});
```



## 全局使用模块

当您想在其他模块中使用 `ConfigModule` 时，需要将其导入(这是任何 `Nest` 模块的标准配置)。或者，通过将 `options` 对象的 `isGlobal` 属性设置为 `true`，将其声明为全局模块，如下所示。

```typescript
ConfigModule.forRoot({
  isGlobal: true,
});
```


## 自定义配置文件

对于更复杂的项目，您可以利用自定义配置文件返回嵌套的配置对象。这使您可以按功能对相关的配置设置进行分组(例如，与数据库相关的设置)，并将相关设置存储在单个文件中，以帮助独立管理它们。

定制配置文件导出工厂函数，该函数返回配置对象。配置对象可以是任意嵌套的纯 `JavaScript` 对象。`process.env` 对象将包含完全解析的环境变量 键/值 对(具有[<font color=red>如上所述</font>](https://docs.nestjs.com/techniques/configuration#getting-started)解析和合并的 `.env` 文件和外部定义的变量)。由于可以控制返回的配置对象，因此可以添加任何逻辑以将值转换为适当的类型，设置默认值等。示例：

::: tip 官方示例
    config/configuration.ts
:::

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432
  }
});
```

我们使用传递给 `ConfigModule.forRoot()` 方法的 `options` 对象的 `load` 属性加载此文件：

```typescript
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
})
export class AppModule {}
```

::: tip
分配给 `load` 属性的值是一个数组，允许您加载多个配置文件(例如 `load：[databaseConfig，authConfig]`)
:::




## 使用 `ConfigService`

要从 `ConfigService` 访问配置值，我们首先需要注入 `ConfigService`。与其他程序一样，我们需要将其包含模块 `ConfigModule` 导入到将使用它的模块中(除非您将传递给 `ConfigModule.forRoot()` 方法的 `options` 对象中的 `isGlobal` 属性设置为 `true`)。如下所示将其导入功能模块。

::: tip 官方示例
    feature.module.ts
:::

```typescript
@Module({
  imports: [ConfigModule],
  // ...
})
```

然后我们可以使用标准构造函数注入来注入它：

```typescript
constructor(private configService: ConfigService) {}
```

在我们的课程中使用它：

```typescript
// get an environment variable
const dbUser = this.configService.get<string>('DATABASE_USER');

// get a custom configuration value
const dbHost = this.configService.get<string>('database.host');
```

如上所示，使用 `configService.get()` 方法通过传递变量名称来获取简单的环境变量。您可以通过传递类型来进行 `TypeScript` 类型提示，例如上面所示(例如， `get <string>(...))`。`get()` 方法还可以遍历嵌套的自定义配置对象(通过创建[<font color=red>自定义配置文件</font>](https://docs.nestjs.com/techniques/configuration#custom-configuration-files))，如上面的第二个示例所示。

您还可以使用接口作为类型提示来获取整个嵌套的自定义配置对象：

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
}

const dbConfig = this.configService.get<DatabaseConfig>('database');

// you can now use `dbConfig.port` and `dbConfig.host`
const port = dbConfig.port;
```

`get()` 方法还带有一个可选的第二个参数，用于定义默认值，当键不存在时将返回该默认值，如下所示：

```typescript
// use "localhost" when "database.host" is not defined
const dbHost = this.configService.get<string>('database.host', 'localhost');
```

`ConfigService` 具有可选的泛型(类型参数)，以帮助防止访问不存在的 `config` 属性。如下所示：

```typescript
interface EnvironmentVariables {
  PORT: number;
  TIMEOUT: string;
}

// somewhere in the code
constructor(private configService: ConfigService<EnvironmentVariables>) {
  // this is valid
  const port = this.configService.get<number>('PORT');

  // this is invalid as URL is not a property on the EnvironmentVariables interface
  const url = this.configService.get<string>('URL');
}
```

::: tip
如果您在配置中具有嵌套属性，例如上面的 `database.host` 示例，则该接口必须具有匹配的 `'database.host'：string;` 属性。否则将引发 `TypeScript` 错误。



## 配置命名空间

`ConfigModule` 允许您定义和加载多个自定义配置文件，如上面的 "自定义配置文件" 中所示。您可以使用该部分中所示的嵌套配置对象来管理复杂的配置对象层次结构。另外，您可以使用 `registerAs()` 函数返回 "命名空间" 配置对象，如下所示：

::: tip 官方示例
    config/database.config.ts
:::

```typescript
export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 5432
}));
```

与自定义配置文件一样，在 `registerAs()` 工厂函数内部，`process.env` 对象将包含完全解析的环境变量 键/值 对(`.env` 文件和已解析且已合并的外部自定义变量)。

::: tip
`registerAs` 函数是从 `@nestjs/config` 包导出的。
:::

以与加载自定义配置文件相同的方式，使用 `forRoot()` 方法选项对象的 `load` 属性加载命名空间配置：

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
  ],
})
export class AppModule {}
```

现在，要从数据库命名空间获取主键值，请使用点表示法。使用 "数据库" 作为属性名称的前缀，与命名空间的名称相对应(作为 `registerAs()` 函数的第一个参数传递)：

```typescript
const dbHost = this.configService.get<string>('database.host');
```

合理的选择是直接注入数据库命名空间。这使我们可以从强类型中受益：

```typescript
constructor(
  @Inject(databaseConfig.KEY)
  private dbConfig: ConfigType<typeof databaseConfig>,
) {}
```

::: tip
`ConfigType` 是从 `@nestjs/config` 包导出的。
:::




## 部分注册

到目前为止，我们已经使用 `forRoot()` 方法在根模块(例如 `AppModule`)中处理了配置文件。也许您的项目结构更加复杂，特定功能的配置文件位于多个不同的目录中。与其将所有这些文件加载到根模块中，`@nestjs/config` 软件包提供了一个称为部分注册的功能，该功能仅引用与每个功能模块关联的配置文件。在功能模块中使用`forFeature()` 静态方法执行此部分注册，如下所示：

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
})
export class DatabaseModule {}
```

::: warning
在某些情况下，您可能需要使用 `onModuleInit()` 钩子而不是在构造函数中访问通过部分注册加载的属性。这是因为 `forFeature()` 方法在模块初始化期间运行，并且模块初始化的顺序不确定。如果访问由另一个模块以这种方式加载的值，则在构造函数中，配置所依赖的模块可能尚未初始化。`onModuleInit()` 方法仅在其依赖的所有模块都已初始化后才运行，因此是安全的。
:::



## 模式( `Schema` )验证

如果未提供所需的环境变量或它们不符合某些验证规则，则通常的做法是在应用程序启动期间引发异常。`@nestjs/config` 软件包允许使用 [<font color=red>Joi</font>](https://github.com/sideway/joi) `npm` 软件包来支持这种类型的验证。使用 `Joi`，您可以定义对象 `schema` 并验证 `JavaScript` 对象。

安装 `Joi` (及其类型，适用于 `TypeScript` 用户)：

```bash
$ npm install --save @hapi/joi
$ npm install --save-dev @types/hapi__joi
```

::: tip
最新版本的 `@hapi/joi` 要求您运行 `Node v12` 或更高版本。对于旧版本的节点，请安装v16.1.8。这主要是在v17.0.2版本发布之后，该版本在构建期间导致错误。有关更多信息，请参阅其[文档](https://hapi.dev/family/joi/?v=17.0.2#install)和此 [github issue](https://github.com/sideway/joi/issues/2266#issuecomment-571667769)。
:::

现在，我们可以定义一个 `Joi` 验证模式，并通过 `forRoot()` 方法的 `options` 对象的 `validationSchema` 属性传递它，如下所示：

::: tip 官方示例
    app.module.ts
:::

```typescript
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
export class AppModule {}
```

默认情况下，所有 `schema` 键均被视为可选键。在这里，我们为 `NODE_ENV` 和 `PORT` 设置了默认值，如果我们不在环境( `.env` 文件或进程环境)中提供这些变量，将使用这些默认值。另外，我们可以使用 `required()` 验证方法来要求必须在环境( `.env` 文件或进程环境)中定义一个值。在这种情况下，如果我们不在环境中提供变量，则验证步骤将引发异常。有关如何构造验证 `schema` 的更多信息，请参见 [<font color=red>Joi验证方法</font>](https://hapi.dev/family/joi/?v=17.0.2#example)。

默认情况下，允许使用未知的环境变量(其密钥在 `schema` 中不存在的环境变量)，并且不会触发验证异常。默认情况下，将提示所有验证错误。您可以通过 `forRoot()` 选项对象的 `validationOptions` 键传递一个选项对象来更改这些行为。该选项对象可以包含[<font color=red>Joi验证选项</font>](https://hapi.dev/family/joi/api/?v=17.0.2#anyvalidvalues---aliases-equal)提供的任何标准验证选项属性。例如，要反转上面的两个设置，请传递如下选项：


::: tip 官方示例
    app.module.ts
:::

```typescript
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
```

`@nestjs/config` 软件包使用以下默认设置：
  - `allowUnknown`：控制是否在环境变量中允许未知键。默认为 `true`
  - `abortEarly`：如果为 `true`，则对第一个错误停止验证；否则为 `false`。如果为 `false`，则返回所有错误。默认为 `false`。

请注意，一旦决定传递 `validationOptions` 对象，则未显式传递的任何设置都将默认为 `Joi` 标准默认值(而不是 `@nestjs/config` 默认值)。例如，如果您在自定义 `validateOptions` 对象中未指定 `allowUnknowns`，则其 `Joi` 默认值为 `false`。因此，在自定义对象中同时指定这两个设置可能是最安全的。



## 自定义 `getter` 函数

`ConfigService` 定义了通用 `get()` 方法，以通过键检索配置值。我们还可以添加 `getter` 函数以启用更优雅的编码样式：

```typescript
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}
```

现在，我们可以如下使用 `getter` 函数：

::: tip 官方示例
    app.service.ts
:::

```typescript
@Injectable()
export class AppService {
  constructor(apiConfigService: ApiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      // Authentication is enabled
    }
  }
}
```



## 可扩展变量

`@nestjs/config` 包支持环境变量扩展。使用这种技术，您可以创建嵌套的环境变量，其中一个变量在另一个定义中被引用。例如：

```bash
APP_URL=mywebsite.com
SUPPORT_EMAIL=support@${APP_URL}
```

通过这种构造，变量 `SUPPORT_EMAIL` 解析为 "`support@mywebsite.com`"。请注意，使用 `${...}` 语法触发解析 `SUPPORT_EMAIL` 定义内的 `APP_URL` 变量的值。

::: tip
对于此功能，`@nestjs/config` 软件包内部使用 `dotenv-expand`。
:::

使用传递给 `ConfigModule` 的 `forRoot()` 方法的 `options` 对象中的 `expandVariables` 属性启用环境变量扩展，如下所示：

::: tip 官方示例
    app.module.ts
:::

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      // ...
      expandVariables: true,
    }),
  ],
})
export class AppModule {}
```



## 在 `main.ts` 中使用

虽然我们的配置存储在服务中，但仍可以在 `main.ts` 文件中使用它。这样，您可以使用它来存储变量，例如应用程序端口或 `CORS` 主机。

要访问它，必须使用 `app.get()` 方法，后跟服务引用：

```typescript
const configService = app.get(ConfigService);
```

然后，可以通过使用配置密钥调用 `get` 方法来照常使用它：

```typescript
const port = configService.get('PORT');
```

