---
title: 数据库
lang: zh-CN
---

## 数据库介绍

`Nest` 与数据库无关，可让您轻松地与任何 `SQL` 或 `NoSQL` 数据库集成。根据您的喜好，您可以使用多种选择。在最一般的级别上，将 `Nest` 连接到数据库仅是为数据库加载适当的 `Node.js` 驱动程序，就像使用 [`Express`](https://expressjs.com/en/guide/database-integration.html) 或 `Fastify` 一样。

您也可以直接使用任何通用的 `Node.js` 数据库集成库或 `ORM`，例如 `Sequelize`(导航到 `Sequelize` 集成部分)，`Knex.js`(教程) `TypeORM` 和 `Prisma`(配方)，以在更高级别上进行操作、抽象。

为了方便起见，`Nest` 提供了与 `TypeORM` 的紧密集成，并分别使用 `@nestjs/typeorm` 和 `@nestjs/sequelize` 软件包开箱即用地对 `Sequelize` 进行了集成，我们将在本章中介绍，而 `Mongoose` 将使用 `@nestjs/mongoose`，这将在[本章](https://docs.nestjs.com/techniques/mongodb)中介绍。这些集成提供了特定于 `NestJS` 的其他功能，例如模型/存储库注入，可测试性和异步配置，以使访问所选数据库更加容易。


## `TypeORM` 集成

为了与 `SQL` 和 `NoSQL` 数据库集成，`Nest` 提供了 `@nestjs/typeorm` 软件包。`Nest` 使用 [<font color=red>TypeORM</font>](https://github.com/typeorm/typeorm)，因为它是可用于 `TypeScript` 的最成熟的对象关系映射器( `ORM` )。由于它是用 `TypeScript` 编写的，因此可以与 `Nest` 框架很好地集成。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示如何使用流行的 `MySQL Relational DBMS`，但是 `TypeORM` 提供了对许多关系数据库的支持，例如 `PostgreSQL，Oracle，Microsoft SQL Server，SQLite`，甚至是 `NoSQL` 数据库，例如 `MongoDB`。对于 `TypeORM` 支持的任何数据库，本章介绍的过程将相同。您只需要为所选数据库安装关联的客户端 `API` 库。

```bash
$ npm install --save @nestjs/typeorm typeorm mysql
```

安装过程完成后，我们可以将 `TypeOrmModule` 导入到根 `AppModule` 中。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

`forRoot()` 方法支持 [<font color=red>TypeORM</font>](https://typeorm.io/#/connection-options) 包中 `createConnection()` 函数公开的所有配置属性。此外，下面还介绍了几个额外的配置属性。

|  属性 | 说明 |
|:---------:|:---------:|
| `retryAttempts` | 尝试连接数据库的次数(默认值：10) |
| `retryDelay` | 重试连接之间的延迟时间(毫秒)(默认值：3000) |
| `autoLoadEntities` | 如果为 `true`，则将自动加载实体(默认值：`false`) |
| `keepConnectionAlive` | 如果为 `true`，则在应用程序关闭时不会关闭连接(默认值：`false`)


::: tip
在[此处](https://typeorm.io/#/connection-options)了解有关连接选项的更多信息。
:::

另外，我们可以在项目根目录中创建 `ormconfig.json` 文件，而不是将配置对象传递给 `forRoot()`。

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "test",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "synchronize": true
}
```

然后，我们可以不带任何选择地调用 `forRoot()`：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()],
})
export class AppModule {}
```

::: warning
静态全局路径 (例如 `dist / ** / *。entity {.ts，.js}` ) 不适用于 `webpack`。
:::

::: warning
请注意，`ormconfig.json` 文件由 `typeorm` 库加载。因此，将不会应用上述任何其他属性(通过 `forRoot()` 方法在内部得到支持，例如 `autoLoadEntities` 和 `retryDelay`)。
:::

完成此操作后，`TypeORM Connection` 和 `EntityManager` 对象将可用于在整个项目中注入(而无需导入任何模块)，例如：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Connection } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
```

## 储存库模式

[<font color=red>TypeORM</font>](https://github.com/typeorm/typeorm) 支持存储库设计模式，因此每个实体都有自己的存储库。这些存储库可以从数据库连接中获取。

要继续该示例，我们至少需要一个实体。让我们定义用户实体。

::: tip 官方示例
    user.entity.ts
:::

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}
```

::: tip
在[TypeORM文档](https://typeorm.io/#/entities)中了解有关实体的更多信息。
:::

用户实体文件位于用户目录中。该目录包含与 `UsersModule` 相关的所有文件。您可以决定将模型文件保存在何处，但是，我们建议在其域附近的相应模块目录中创建它们。

要开始使用 `User` 实体，我们需要通过将 `TypeORM` 插入到 `forRoot()` 方法选项的模块中的实体数组中来让 `TypeORM` 知道(除非使用静态 `glob` 路径)：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

接下来，让我们看一下 `UsersModule`：

::: tip 官方示例
    users.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

该模块使用 `forFeature()` 方法来定义在当前作用域中注册了哪些存储库。设置好之后，我们可以使用 `@InjectRepository()` 装饰器将 `UsersRepository` 注入 `UsersService` 中：

::: tip 官方示例
    users.service.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

::: tip
不要忘记将 `UsersModule` 导入到根 `AppModule` 中。
:::

如果要在导入 `TypeOrmModule.forFeature` 的模块之外使用存储库，则需要重新导出由其生成的提供程序。您可以通过导出整个模块来做到这一点，如下所示：

::: tip 官方示例
    users.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule]
})
export class UsersModule {}
```

现在，如果我们在 `UserHttpModule` 中导入 `UsersModule`，则可以在后一个模块的提供程序中使用 `@InjectRepository(User)`。

::: tip 官方示例
    users-http.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './user.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
```


## 关系

关系是在两个或多个表之间建立的关联。关系基于每个表的公共字段，通常涉及主键和外键。

关系分为三种：

| 关系名称 | 描述 |
|:---------:|:---------:|
| `One-to-one` | 主表中的每一行在外部表中只有一个且只有一个关联行。使用 `@OneToOne()` 装饰器可以定义这种类型的关系。 |
| `One-to-many / Many-to-one` | 主表中的每一行在外部表中都有一个或多个相关行。使用 `@OneToMany()` 和 `@ManyToOne()` 装饰器定义这种类型的关系。 | 
| `Many-to-many` | 主表中的每一行在外部表中都有许多相关行，并且外部表中的每条记录在主表中都有许多相关行。	使用 `@ManyToMany()` 装饰器可以定义这种类型的关系。 |

要定义实体中的关系，请使用相应的装饰器。例如，要定义每个用户可以拥有多张照片，请使用 `@OneToMany()` 装饰器。

::: tip 官方示例
    user.entity.ts
:::

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}
```

::: tip
要了解有关 `TypeORM` 中关系的更多信息，请访问[TypeORM文档](https://typeorm.io/#/relations)。
:::


## 自动加载实体

手动将实体添加到连接选项的实体数组可能很繁琐。另外，从根模块引用实体会破坏应用程序域的边界，并使实现细节泄漏到应用程序的其他部分。要解决此问题，可以使用静态全局路径(例如 `dist / ** / *。entity {.ts，.js}` )。

但是请注意，`webpack` 不支持全局路径，因此，如果要在 `monorepo` 中构建应用程序，则将无法使用它们。为了解决此问题，提供了一种替代解决方案。要自动加载实体，请将配置对象(传递到 `forRoot()` 方法中)的 `autoLoadEntities` 属性设置为 `true`，如下所示：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
```

指定该选项后，通过 `forFeature()` 方法注册的每个实体都将自动添加到配置对象的实体数组中。

::: warning
请注意，不是通过 `forFeature()` 方法注册的实体，而是仅通过实体(通过关系)引用的实体，不会通过 `autoLoadEntities` 设置。
:::



## 分隔实体定义

您可以使用装饰器在模型中直接定义实体及其列。但是有些人更喜欢使用 "[<font color=red>实体模式</font>](https://typeorm.io/#/separating-entity-definition)" 在单独的文件中定义实体及其列。

```typescript
import { EntitySchema } from 'typeorm';
import { User } from './user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  relations: {
    photos: {
      type: 'one-to-many',
      target: 'Photo', // the name of the PhotoSchema
    },
  },
});
```

::: warning
如果提供目标选项，则名称选项值必须与目标类的名称相同。如果不提供目标，则可以使用任何名称。
:::

`Nest` 使您可以在需要实体的任何地方使用 `EntitySchema` 实例，例如：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from './user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```



## 事物

数据库事务表示在数据库管理系统内针对数据库执行的工作单元，并且以与其他事务无关的一致可靠的方式进行处理。事务通常表示数据库中的任何更改([了解更多信息](https://en.wikipedia.org/wiki/Database_transaction))。

有许多不同的策略来处理 [<font color=red>TypeORM</font>](https://typeorm.io/#/transactions)事务。我们建议使用 `QueryRunner` 类，因为它可以完全控制事务。首先，我们需要以常规方式将 `Connection` 对象注入到一个类中：

```typescript
@Injectable()
export class UsersService {
  constructor(private connection: Connection) {}
}
```

::: tip
`Connection` 类是从 `typeorm` 包中导入的。
:::

现在，我们可以使用该对象创建事务。

```typescript
async createMany(users: User[]) {
  const queryRunner = this.connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.manager.save(users[0]);
    await queryRunner.manager.save(users[1]);

    await queryRunner.commitTransaction();
  } catch (err) {
    // since we have errors lets rollback the changes we made
    await queryRunner.rollbackTransaction();
  } finally {
    // you need to release a queryRunner which was manually instantiated
    await queryRunner.release();
  }
}
```

::: tip
请注意，该连接仅用于创建 `QueryRunner`。但是，要测试此类，将需要模拟整个 `Connection` 对象(公开了几种方法)。因此，建议您使用辅助工厂类(例如`QueryRunnerFactory`)，并使用维护事务所需的一组有限方法来定义接口。这种技术使模拟这些方法变得非常简单。
:::

另外，您可以将回调样式方法与 `Connection` 对象的 `transaction` 方法一起使用([了解更多信息](https://typeorm.io/#/transactions/creating-and-using-transactions))。

```typescript
async createMany(users: User[]) {
  await this.connection.transaction(async manager => {
    await manager.save(users[0]);
    await manager.save(users[1]);
  });
}
```

不建议使用装饰器来控制事务( `@Transaction()` 和 `@TransactionManager()`)。


## 订阅

使用 `TypeORM` [<font color=red>订阅</font>](https://typeorm.io/#/listeners-and-subscribers/what-is-a-subscriber)服务器，您可以侦听特定的实体事件。

```typescript
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(connection: Connection) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
```

::: warning
无法订阅[事件范围](https://docs.nestjs.com/fundamentals/injection-scopes)的事件订阅者。
:::

现在，将 `UserSubscriber` 类添加到 `providers` 数组：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
})
export class UsersModule {}
```

::: tip
在此处了解有关实体订户的[更多信息](https://typeorm.io/#/listeners-and-subscribers/what-is-a-subscriber)。
:::



## 迁移

[迁移](https://typeorm.io/#/migrations)提供了一种增量更新数据库模式的方法，以使其与应用程序的数据模型保持同步，同时保留数据库中的现有数据。为了生成，运行和还原迁移，`TypeORM` 提供了专用的 `CLI`。

迁移类与 `Nest` 应用程序源代码是分开的。它们的生命周期由 `TypeORM CLI` 维护。因此，您无法在迁移中利用依赖项注入和其他 `Nest` 特定功能。要了解有关迁移的更多信息，请遵循 `TypeORM` 文档中的指南。



## 多个数据库

一些项目需要多个数据库连接。这也可以通过该模块来实现。要使用多个连接，请首先创建连接。在这种情况下，连接命名成为强制性的。

假设您有一个 `Album` 实体存储在其自己的数据库中。

```typescript
const defaultOptions = {
  type: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      entities: [User],
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      entities: [Album],
    }),
  ],
})
export class AppModule {}
```

::: tip
如果未设置连接名称，则其名称将设置为默认名称。请注意，您不应有多个没有名称或具有相同名称的连接，否则它们将被覆盖。
:::

此时，您已将 `User` 和 `Album` 实体注册为各自的连接。使用此设置，您必须告诉 `TypeOrmModule.forFeature()` 方法和 `@InjectRepository()` 装饰器应使用哪个连接。如果不传递任何连接名称，则使用默认连接。

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

您还可以为给定的连接注入 `Connection` 或 `EntityManager`：

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectConnection('albumsConnection')
    private connection: Connection,
    @InjectEntityManager('albumsConnection')
    private entityManager: EntityManager,
  ) {}
}
```


## 测试

在对应用程序进行单元测试时，我们通常希望避免建立数据库连接，使我们的测试套件保持独立，并尽可能快地执行它们。但是我们的类可能取决于从连接实例中提取的存储库。我们该如何处理？解决方案是创建模拟存储库。为了实现这一点，我们设置了[<font color=red>自定义提供程序</font>](https://docs.nestjs.com/fundamentals/custom-providers)。每个注册的存储库都由 `<EntityName> Repository` 标记自动表示，其中 `EntityName` 是您的实体类的名称。

`@nestjs/typeorm` 包公开了 `getRepositoryToken()` 函数，该函数根据给定的实体返回准备好的令牌。

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: mockRepository,
    },
  ],
})
export class UsersModule {}
```

现在，替代模拟存储库将用作 `UsersRepository`。每当任何类使用 `@InjectRepository()` 装饰器要求提供 `UsersRepository` 时，`Nest` 都将使用已注册的 `mockRepository` 对象。



## 自定义存储库

`TypeORM` 提供了一个称为自定义存储库的功能。自定义存储库允许您扩展基本存储库类，并使用几种特殊方法来丰富它。要了解有关此功能的更多信息，请访问[<font color=red>此页面</font>](https://typeorm.io/#/custom-repository)。

为了创建您的自定义存储库，请使用 `@EntityRepository()` 装饰器并扩展 `Repository` 类。

```typescript
@EntityRepository(Author)
export class AuthorRepository extends Repository<Author> {}
```

::: tip
`@EntityRepository()` 和 `Repository` 都是从 `typeorm` 包中导入的。
:::

创建类后，下一步就是将实例化责任委托给 `Nest`。创建类后，下一步就是将实例化责任委托给 `Nest`。

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([AuthorRepository])],
  controller: [AuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
```

之后，只需使用以下结构注入存储库：

```typescript
@Injectable()
export class AuthorService {
  constructor(private authorRepository: AuthorRepository) {}
}
```


## 异步配置

您可能需要异步而不是静态传递存储库模块选项。在这种情况下，请使用 `forRootAsync()` 方法，该方法提供了几种处理异步配置的方法。一种方法是使用工厂功能：

```typescript
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
});
```

我们的工厂的行为类似于任何其他异步提供程序(例如，它可以是异步的，并且能够通过注入来注入依赖项)。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get<number>('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
  inject: [ConfigService],
});
```

另外，您可以使用 `useClass` 语法：

```typescript
TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
});
```

上面的构造将实例化 `TypeOrmModule` 中的 `TypeOrmConfigService`，并通过调用 `createTypeOrmOptions()` 使用它来提供选项对象。请注意，这意味着 `TypeOrmConfigService` 必须实现 `TypeOrmOptionsFactory` 接口，如下所示：

```typescript
@Injectable()
class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }
}
```

为了防止在 `TypeOrmModule` 内部创建 `TypeOrmConfigService` 并使用从其他模块导入的提供程序，可以使用 `useExisting` 语法。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

此构造与 `useClass` 相同，但有一个重要区别-- `TypeOrmModule` 将查找导入的模块以重用现有的 `ConfigService` 而不是实例化新的 `ConfigService`。



## 示例

[<font color=red>这里</font>](https://github.com/nestjs/nest/tree/master/sample/05-sql-typeorm)有一个工作示例。



## 序列化整合
使用 `TypeORM` 的替代方法是将 [<font color=red>Sequelize</font>](https://sequelize.org/) `ORM` 与 `@nestjs/sequelize` 包一起使用。此外，我们利用 [<font color=red>sequelize-typescript</font>](https://github.com/RobinBuschmann/sequelize-typescript) 包，该包提供了一组其他修饰符，以声明方式定义实体。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示如何使用流行的 `MySQL Relational DBMS`，但是 `Sequelize` 为许多关系数据库提供了支持，例如 `PostgreSQL，MySQL，Microsoft SQL Server，SQLite` 和 `MariaDB`。对于 `Sequelize` 支持的任何数据库，本章介绍的过程将相同。您只需要为所选数据库安装关联的客户端 `API` 库。

```bash
$ npm install --save @nestjs/sequelize sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

安装过程完成后，我们可以将 `SequelizeModule` 导入到根 `AppModule` 中。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    }),
  ],
})
export class AppModule {}
```

`forRoot()` 方法支持 `Sequelize` 构造函数公开的所有配置属性([更多信息](https://sequelize.org/v5/manual/getting-started.html#setting-up-a-connection))。此外，下面还介绍了几个额外的配置属性。

| 属性名 | 描述 |
|:---------:|:---------:|
| `retryAttempts` | 尝试连接数据库的次数(默认值：10) |
| `retryDelay` | 重试连接之间的延迟(毫秒)(默认值：3000) |
| `autoLoadModels` | 如果为 `true`，将自动加载模型(默认值：`false`) |
| `keepConnectionAlive` | 如果为 `true`，则在应用程序关闭时不会关闭连接(默认值：`false`) |
| `synchronize` | 如果为 `true`，则将自动加载自动加载的模型(默认值：`false`) |


完成此操作后，`Sequelize` 对象将可用于在整个项目中注入(而无需导入任何模块)，例如：

::: tip 官方示例
    app.service.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {}
}
```



## 模型

`Sequelize` 实现了 `Active Record` 模式。通过这种模式，您可以直接使用模型类与数据库进行交互。要继续该示例，我们至少需要一个模型。让我们先定义用户模型。

::: tip 官方示例
    user.model.ts
:::

```typescript
import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model<User> {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;
}
```

::: tip
在[此处](https://github.com/RobinBuschmann/sequelize-typescript#column)了解有关可用装饰器的更多信息。
:::

用户模型文件位于用户目录中。该目录包含与 `UsersModule` 相关的所有文件。您可以决定将模型文件保存在何处，但是，我们建议在相应模块目录中的域附近创建它们。

要开始使用 `User` 模型，我们需要通过将 `Sequelize` 插入到 `forRoot()` 方法选项模块的 `models` 数组中来让 `Sequelize` 知道它：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [User],
    }),
  ],
})
export class AppModule {}
```

接下来，让我们看一下 `UsersModule`：

::: tip 官方示例
    users.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

该模块使用 `forFeature()` 方法来定义在当前范围内注册了哪些模型。设置好之后，我们可以使用 `@InjectModel()` 装饰器将 `UserModel` 注入到 `UsersService` 中：

::: tip 官方示例
    users.service.ts
:::

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
```

::: tip
不要忘记将 `UsersModule` 导入到根 `AppModule` 中。
:::

如果要在导入 `SequelizeModule.forFeature` 的模块之外使用存储库，则需要重新导出由其生成的提供程序。您可以通过导出整个模块来做到这一点，如下所示：

::: tip 官方示例
    users.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.entity';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [SequelizeModule]
})
export class UsersModule {}
```

现在，如果我们在 `UserHttpModule` 中导入 `UsersModule`，则可以在后一个模块的提供程序中使用 `@InjectModel(User)`。

::: tip 官方示例
    users-http.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './user.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
```


## 关系
关系是在两个或多个表之间建立的关联。关系基于每个表的公共字段，通常涉及主键和外键。

关系分为三种：

| 名称 | 描述 |
|:---------:|:---------:|
| `One-to-one` | 主表中的每一行在外部表中只有一个关联行 |
| `One-to-many / Many-to-one` | 主表中的每一行在外部表中都有一个或多个相关行 |
| `Many-to-many` | 主表中的每一行在外部表中都有许多相关行，并且外部表中的每条记录在主表中都有许多相关行 |

要定义实体中的关系，请使用相应的**装饰器**。例如，要定义每个用户可以拥有多张照片，请使用 `@HasMany()` 装饰器。

::: tip 官方示例
    user.entity.ts
:::

```typescript
import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Photo } from '../photos/photo.model';

@Table
export class User extends Model<User> {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => Photo)
  photos: Photo[];
}
```

::: tip
要了解有关 `Sequelize` 中关联的更多信息，请[阅读本章](https://github.com/RobinBuschmann/sequelize-typescript#model-association)。
:::



## 自动加载模型

将模型手动添加到连接选项的 `models` 数组中可能很麻烦。此外，从根模块引用模型会破坏应用程序域的边界，并使实现细节泄漏到应用程序的其他部分。要解决此问题，请同时设置 `autoLoadModels` 并将配置对象的属性(传递给 `forRoot()` 方法)同步为 `true`，以自动加载模型，如下所示：

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...
      autoLoadModels: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

指定该选项后，通过 `forFeature()` 方法注册的每个模型都将自动添加到配置对象的 `models` 数组中。

::: warning
请注意，不包括未通过 `forFeature()` 方法注册但仅从模型中引用(通过关联)的模型。
:::



## 事物

数据库事务表示在数据库管理系统内针对数据库执行的工作单元，并且以与其他事务无关的一致可靠的方式进行处理。事务通常表示数据库中的任何更改(了解[更多信息](https://en.wikipedia.org/wiki/Database_transaction))。

有许多不同的策略来处理 `Sequelize` 事务。 以下是托管事务(自动回调)的示例实现。

首先，我们需要以常规方式将 `Sequelize` 对象注入到一个类中：

```typescript
@Injectable()
export class UsersService {
  constructor(private sequelize: Sequelize) {}
}
```

::: tip
`Sequelize` 类是从 `sequelize-typescript` 包中导入的。
:::

现在，我们可以使用该对象创建事务。

```typescript
async createMany() {
  try {
    await this.sequelize.transaction(async t => {
      const transactionHost = { transaction: t };

      await this.userModel.create(
          { firstName: 'Abraham', lastName: 'Lincoln' },
          transactionHost,
      );
      await this.userModel.create(
          { firstName: 'John', lastName: 'Boothe' },
          transactionHost,
      );
    });
  } catch (err) {
    // Transaction has been rolled back
    // err is whatever rejected the promise chain returned to the transaction callback
  }
}
```

::: tip
请注意，`Sequelize` 实例仅用于启动事务。但是，要测试此类，将需要模拟整个 `Sequelize` 对象(公开了几种方法)。因此，建议您使用辅助工厂类(例如 `TransactionRunner`)，并使用维护事务所需的一组有限方法来定义接口。这种技术使模拟这些方法变得非常简单。
:::



## 迁移

迁移提供了一种增量更新数据库模式的方法，以使其与应用程序的数据模型保持同步，同时保留数据库中的现有数据。为了生成，运行和还原迁移，`Sequelize` 提供了专用的 `CLI`。

迁移类与 `Nest` 应用程序源代码是分开的。它们的生命周期由 `Sequelize CLI` 维护。因此，您无法在迁移中利用依赖项注入和其他 `Nest` 特定功能。要了解有关迁移的更多信息，请遵循 `Sequelize` [<font color=red>文档指南</font>](https://sequelize.org/v5/manual/migrations.html#the-cli)。


## 多个数据库

一些项目需要多个数据库连接。这也可以通过该模块来实现。要使用多个连接，请首先创建连接。在这种情况下，连接命名成为强制性的。

假设您有一个 `Album` 实体存储在其自己的数据库中。

```typescript
const defaultOptions = {
  dialect: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      models: [User],
    }),
    SequelizeModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      models: [Album],
    }),
  ],
})
export class AppModule {}
```

::: warning
如果未设置连接名称，则其名称将设置为默认名称。请注意，您不应有多个没有名称或具有相同名称的连接，否则它们将被覆盖。
:::

至此，您已经为用户和相册模型注册了自己的连接。使用此设置，您必须告诉 `SequelizeModule.forFeature()` 方法和 `@InjectModel()` 装饰器应使用哪个连接。如果未传递任何连接名称，则使用默认连接。

```typescript
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    SequelizeModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

您还可以为给定的连接注入 `Sequelize` 实例：

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectConnection('albumsConnection')
    private sequelize: Sequelize,
  ) {}
}
```


## 测试

在对应用程序进行单元测试时，我们通常希望避免建立数据库连接，使我们的测试套件保持独立，并尽可能快地执行它们。但是我们的类可能取决于从连接实例中提取的模型。我们该如何处理？解决方案是创建模拟模型。为了实现这一点，我们设置了[<font color=red>自定义提供程序</font>](https://docs.nestjs.com/fundamentals/custom-providers)。每个注册的模型都由 `<ModelName> Model` 标记自动表示，其中 `ModelName` 是模型类的名称。

`@nestjs/sequelize` 包公开了 `getModelToken()` 函数，该函数基于给定模型返回准备好的令牌。

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getModelToken(User),
      useValue: mockModel,
    },
  ],
})
export class UsersModule {}
```

现在，替代的模拟模型将用作 `UserModel`。每当任何类使用 `@InjectModel()` 装饰器要求 `UserModel` 时，`Nest` 都会使用注册的模拟模型对象。


## 异步配置
您可能想异步地而不是静态地传递 `SequelizeModule` 选项。在这种情况下，请使用 `forRootAsync()` 方法，该方法提供了几种处理异步配置的方法。

一种方法是使用工厂功能：

```typescript
SequelizeModule.forRootAsync({
  useFactory: () => ({
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    models: [],
  }),
});
```

我们的工厂行为类似于任何其他异步提供程序(例如，它可以是异步的，并且能够通过注入来注入依赖项)。

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    dialect: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    models: [],
  }),
  inject: [ConfigService],
});
```

另外，您可以使用 `useClass` 语法：

```typescript
SequelizeModule.forRootAsync({
  useClass: SequelizeConfigService,
});
```

上面的构造将在 `SequelizeModule` 中实例化 `SequelizeConfigService`，并通过调用 `createSequelizeOptions()` 将其用于提供 `options` 对象。请注意，这意味着 `SequelizeConfigService` 必须实现 `SequelizeOptionsFactory` 接口，如下所示：

```typescript
@Injectable()
class SequelizeConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    };
  }
}
```

为了防止在 `SequelizeModule` 内部创建 `SequelizeConfigService` 并使用从其他模块导入的提供程序，可以使用 `useExisting` 语法。

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这种构造与 `useClass` 相同，但有一个关键区别-- `SequelizeModule` 将查找导入的模块以重用现有的 `ConfigService` 而不是实例化一个新的 `ConfigService`。



## 示例
这里有一个[<font color=red>示例</font>](https://github.com/nestjs/nest/tree/master/sample/07-sequelize)