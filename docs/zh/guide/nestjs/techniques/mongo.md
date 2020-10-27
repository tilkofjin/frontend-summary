---
title: Mongo
lang: zh-CN
---

## `Mongo` 介绍

`Nest` 支持两种与 [<font color=red>MongoDB</font>](https://www.mongodb.com/) 数据库集成的方法。您可以使用[此处](https://docs.nestjs.com/techniques/database)描述的内置[<font color=red>TypeORM</font>](https://docs.nestjs.com/techniques/database)模块，它具有用于 `MongoDB` 的连接器，或使用 `Mongoose`(最受欢迎的 `MongoDB` 对象建模工具)。在本章中，我们将使用专用的 `@nestjs/mongoose` 包来描述后者。

首先安装所需的依赖项：
```bash
$ npm install --save @nestjs/mongoose mongoose
$ npm install --save-dev @types/mongoose
```

安装过程完成后，我们可以将 `MongooseModule` 导入到根 `AppModule` 中。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}
```

`forRoot()` 方法从 `Mongoose` 包接受与 `mongoose.connect()` 相同的配置对象，如此处所述。



## 模型注入

对于 `Mongoose`，一切都源自 [<font color=red>Schema</font>](https://mongoosejs.com/docs/guide.html)。每个模式都映射到 `MongoDB` 集合，并定义该集合中文档的结构。`Schemas` 用于定义[<font color=red>模型</font>](https://mongoosejs.com/docs/models.html)。模型负责从底层 `MongoDB` 数据库创建和读取x文档。

可以使用 `NestJS` 装饰器创建模式，也可以手动使用 `Mongoose` 自身创建模式。使用装饰器创建模式可以大大减少样板并提高整体代码的可读性。

让我们定义一下 `CatSchema`：

::: tip 官方示例
    schemas/cat.schema.ts
:::

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CatDocument = Cat & Document;

@Schema()
export class Cat {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```

::: tip
请注意，您还可以使用 `DefinitionsFactory` 类(来自 `nestjs/mongoose`)生成原始模式定义。这使您可以手动修改根据您提供的元数据生成的 `schema` 定义。这对于某些边缘情况很有用，这些情况可能很难用装饰器来表示所有内容。
:::

`@Schema()` 装饰器将类标记为架构定义。它将我们的 `Cat` 类映射到同名的 `MongoDB` 集合，但末尾有一个额外的 "`s`" --因此最终的 `mongo` 集合名称将为 `cats`。此装饰器接受一个可选参数，该参数是 `schema` 选项对象。将其视为通常作为 `mongoose.Schema` 类的构造函数的第二个参数传递的对象(例如，新的 `mongoose.Schema(_，options))`。要了解有关可用模式选项的更多信息，请[参阅本章](https://mongoosejs.com/docs/guide.html#options)。

`@Prop()` 装饰器在文档中定义一个属性。例如，在上面的架构定义中，我们定义了三个属性：名称，年龄和品种。借助 `TypeScript` 元数据(和反射)功能，可以自动推断这些属性的模式类型。但是，在无法隐式反映类型的更复杂的方案中(例如，数组或嵌套的对象结构)，必须显式指示类型，如下所示：

```typescript
@Prop([String])
tags: string[];
```

另外，`@Prop()` 装饰器接受 `options` 对象参数(有关可用选项的[更多信息](https://mongoosejs.com/docs/schematypes.html#schematype-options))。这样，您可以指示是否需要属性，指定默认值或将其标记为不可变。例如：

```typescript
@Prop({ required: true })
name: string;
```

最后，原始模式定义也可以传递给装饰器。例如，当属性表示未定义为类的嵌套对象时，此功能很有用。为此，请使用 `@nestjs/mongoose` 包中的 `raw()` 函数，如下所示：

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;
```

另外，如果您不喜欢使用装饰器，则可以手动定义 `schema(模式)`。例如：

```typescript
export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`cat.schema` 文件位于 `cats` 目录中的文件夹中，在此目录中还定义了 `CatsModule`。尽管可以将模式文件存储在任意位置，但我们建议将它们存储在适当的模块目录中与它们相关的域对象附近。

让我们看一下 `CatsModule`：

::: tip 官方示例
    cats.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat, CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

`MongooseModule` 提供了 `forFeature()` 方法来配置模块，包括定义哪些模型应在当前作用域中注册。如果您还想在另一个模块中使用模型，请将 `MongooseModule` 添加到 `CatsModule` 的 `exports` 部分，然后在另一个模块中导入 `CatsModule`。

注册架构后，您可以使用 `@InjectModel()` 装饰器将 `Cat` 模型注入 `CatsService` 中：

::: tip 官方示例
    cats.service.ts
:::

```typescript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat, CatDocument } from './schemas/cat.schema';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private catModel: Model<CatDocument>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
```


## 连接

有时您可能需要访问本地 [<font color=red>Mongoose Connection</font>](https://mongoosejs.com/docs/api.html#Connection) 对象。例如，您可能想在连接对象上进行本机 `API` 调用。您可以使用 `@InjectConnection()` 装饰器来注入 `Mongoose` 连接，如下所示：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private connection: Connection) {}
}
```


## 多个数据库

一些项目需要多个数据库连接。这也可以通过该模块来实现。要使用多个连接，请首先创建连接。在这种情况下，连接命名成为强制性的。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test', {
      connectionName: 'cats',
    }),
    MongooseModule.forRoot('mongodb://localhost/users', {
      connectionName: 'users',
    }),
  ],
})
export class AppModule {}
```

::: warning
请注意，您不应有多个没有名称或具有相同名称的连接，否则它们将被覆盖。
:::

使用此设置，您必须告诉 `MongooseModule.forFeature()` 函数应使用哪个连接。

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }], 'cats'),
  ],
})
export class AppModule {}
```

您还可以为给定的连接注入 `Connection`：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection('cats') private connection: Connection) {}
}
```



## 钩子(中间件)

中间件(也称为前挂钩和后挂钩)是在异步功能执行期间通过控制传递的功能。中间件在架构级别上指定，可用于编写插件(源)。编译模型后调用 `pre()` 或 `post()` 在 `Mongoose` 中不起作用。要在模型注册之前注册钩子，请使用 `MongooseModule` 的 `forFeatureAsync()` 方法以及工厂提供程序(即 `useFactory`)。使用这种技术，您可以访问模式( `schema` )对象，然后使用 `pre()` 或 `post()` 方法在该模式上注册一个钩子。看下面的例子：

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        useFactory: () => {
          const schema = CatsSchema;
          schema.pre('save', () => console.log('Hello from pre save'));
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```

像其他[<font color=red>工厂提供程序</font>](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)一样，我们的工厂功能可以是异步的，并且可以通过注入来注入依赖项。

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const schema = CatsSchema;
          schema.pre('save', () =>
            console.log(
              `${configService.get('APP_NAME')}: Hello from pre save`,
            ),
          );
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class AppModule {}
```


## 插件

要注册给定 `schema` 的插件，请使用 `forFeatureAsync()` 方法。

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        useFactory: () => {
          const schema = CatsSchema;
          schema.plugin(require('mongoose-autopopulate'));
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```

要一次为所有 `schema` 注册插件，请调用 `Connection` 对象的 `.plugin()` 方法。在创建模型之前，您应该访问连接；为此，请使用 `connectionFactory`：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test', {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      }
    }),
  ],
})
export class AppModule {}
```



## 测试

在对应用程序进行单元测试时，我们通常希望避免任何数据库连接，从而使我们的测试套件更易于设置和执行。但是我们的类可能取决于从连接实例中提取的模型。我们如何解决这些问题？解决方案是创建模拟模型。为了简化此过程，`@nestjs/mongoose` 包公开了一个 `getModelToken()` 函数，该函数根据令牌名称返回准备好的[<font color=red>注入令牌</font>](https://docs.nestjs.com/fundamentals/custom-providers#di-fundamentals)。使用此令牌，您可以使用任何标准的自定义提供程序技术(包括 `useClass，useValue` 和 `useFactory`)轻松提供模拟实现。

```typescript
@Module({
  providers: [
    CatsService,
    {
      provide: getModelToken(Cat.name),
      useValue: catModel,
    },
  ],
})
export class CatsModule {}
```

在此示例中，每当任何消费者使用 `@InjectModel()` 装饰器注入 `Model <Cat>` 时，都将提供硬编码的 `catModel`(对象实例)。



## 异步配置

当需要异步而不是静态传递模块选项时，请使用 `forRootAsync()` 方法。与大多数动态模块一样，`Nest` 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```typescript
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/nest',
  }),
});
```

像其他工厂提供程序一样，我们的工厂功能可以是异步的，并且可以通过注入来注入依赖项。

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
});
```

另外，您可以使用类而不是工厂来配置 `MongooseModule`，如下所示：

```typescript
MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});
```

上面的构造实例化了 `MongooseModule` 中的 `MongooseConfigService`，并使用它来创建所需的 `options` 对象。请注意，在此示例中，`MongooseConfigService` 必须实现 `MongooseOptionsFactory` 接口，如下所示。`MongooseModule` 将在提供的类的实例化对象上调用 `createMongooseOptions()` 方法。

```typescript
@Injectable()
class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: 'mongodb://localhost/nest',
    };
  }
}
```

如果要重用现有的选项提供程序，而不是在 `MongooseModule` 中创建私有副本，请使用 `useExisting` 语法。

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```


## 示例

这里有一个[<font color=red>工作示例</font>](https://github.com/nestjs/nest/tree/master/sample/06-mongoose)。