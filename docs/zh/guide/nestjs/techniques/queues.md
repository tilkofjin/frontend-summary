---
title: 队列
lang: zh-CN
---

## 队列介绍

队列是一种强大的设计模式，可以帮助您应对常见的应用程序扩展和性能挑战。队列可以帮助您解决的一些问题示例如下：
  - 消除处理高峰。例如，如果用户可以在任意时间启动资源密集型任务，则可以将这些任务添加到队列中，而不是同步执行它们。然后，您可以使工作进程以受控方式从队列中提取任务。您可以轻松添加新的 `Queue` 使用者，以在应用程序扩展时扩展后端任务处理。
  - 分解可能会阻塞 `Node.js` 事件循环的整体任务。例如，如果用户请求需要诸如音频代码转换之类的 `CPU` 密集型工作，则可以将此任务委派给其他进程，从而释放面向用户的进程以保持响应速度。
  - 提供跨各种服务的可靠通信渠道。例如，您可以在一个流程或服务中将任务(作业)排队，而在另一流程或服务中使用它们。可以通过任何进程或服务在作业生命周期中完成，错误或其他状态更改时(通过侦听状态事件)通知您。当队列生产者或使用者失败时，它们的状态将保留，并且在重新启动节点时任务处理可以自动重新启动。

`Nest` 提供了 `@nestjs/bull` 软件包，作为 `Bull` 之上的抽象/包装器，[<font color=red>Bull</font>](https://github.com/OptimalBits/bull) 是流行的，受到良好支持的高性能基于 `Node.js` 的 `Queue` 系统实现。该软件包使以嵌套友好的方式轻松将 `Bull Queue` 集成到您的应用程序中。

`Bull` 使用[<font color=red>Redis</font>](https://redis.io/) 来保留作业数据，因此您需要在系统上安装 `Redis`。因为它是 `Redis` 支持的，所以您的 `Queue` 体系结构可以是完全分布式的且与平台无关。例如，您可以在一个(或几个)节点上的 `Nest` 中运行一些 `Queue` [<font color=red>producers(生产者)</font>](https://docs.nestjs.com/techniques/queues#producers)，[<font color=red>consumers(消费者)</font>](https://docs.nestjs.com/techniques/queues#consumers)和[<font color=red>listeners(侦听器)</font>]()，并在其他网络节点上的其他 `Node.js` 平台上运行其他生产者，消费者和侦听器。

本章介绍 `@nestjs/bull` 软件包。我们还建议阅读[<font color=red>Bull文档</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md)以获取更多背景信息和特定的实现细节。



## 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm install --save @nestjs/bull bull
$ npm install --save-dev @types/bull
```

安装过程完成后，我们可以将 `BullModule` 导入到根 `AppModule` 中。

::: tip 官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

`registerQueue()` 方法用于实例化、注册队列。队列在使用相同凭据连接到相同基础 `Redis` 数据库的模块和进程之间共享。每个队列通过其 `name` 属性都是唯一的(请参见下文)。当共享队列(跨模块/进程)时，要运行的第一个 `registerQueue()` 方法实例化队列并为该模块注册队列。其他模块(在相同或单独的进程中)只需注册队列。队列注册会创建一个注入令牌，该令牌可用于访问给定 `Nest` 模块中的队列。

对于每个队列，传递一个包含以下属性的配置对象：
  - `name：string` - 队列名称，将用作注入令牌(用于将队列注入到控制器/提供程序中)，以及用作装饰器的参数，以将使用者类和侦听器与队列相关联。
  - `limiter: RateLimiter` - 用于控制队列作业的处理速率的选项。有关更多信息，请参见[<font color=red>RateLimiter</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选。
  - `redis: RedisOpts` - 用于配置 `Redis` 连接的选项。有关更多信息，请参见[<font color=red>RedisOpts</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选。
  - `prefix: string` - 所有队列键的前缀。可选。
  - `defaultJobOptions: JobOpts` - 用于控制新作业的默认设置的选项。有关更多信息，请参见[<font color=red>JobOpts</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。可选。
  - `settings: AdvancedSettings` - 高级队列配置设置。这些通常不应更改。有关更多信息，请参见[<font color=red>AdvancedSettings</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选。

如前所述，`name` 属性是必需的。其余选项是可选的，可提供对队列行为的详细控制。这些直接传递给 `Bull Queue` 构造函数。[<font color=red>在此</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)处详细了解这些选项。在第二个或后续模块中注册队列时，最佳做法是从配置对象中忽略除 `name` 属性之外的所有选项。仅应在实例化队列的模块中指定这些选项。

::: tip
通过将多个逗号分隔的配置对象传递给 `registerQueue()` 方法来创建多个队列。
:::

由于作业保留在 `Redis` 中，因此每次实例化特定的命名队列时(例如，启动/重新启动应用程序时)，它都会尝试处理以前未完成的会话中可能存在的所有旧作业。

每个队列可以有一个或多个 `producers(生产者)`，`consumers(消费者)`和`listeners(侦听器)`。使用者以特定顺序从队列中检索作业：FIFO（默认），LIFO或根据优先级。[<font color=red>这里</font>](https://docs.nestjs.com/techniques/queues#consumers)讨论控制队列处理顺序。



## `Producers` -- 生产者

作业生产者将作业添加到队列中。生产者通常是应用程序服务([<font color=red>Nest providers</font>](https://docs.nestjs.com/providers))。要将作业添加到队列，请首先将队列注入服务中，如下所示：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

::: tip
`@InjectQueue()` 装饰器通过其名称来标识队列，如 `registerQueue()` 方法调用中所提供的那样(例如'`audio`')。
:::

现在，通过调用队列的 `add()` 方法并传递用户定义的作业对象来添加作业。作业表示为可序列化的 `JavaScript` 对象(因为这是它们在 `Redis` 数据库中的存储方式)。您通过的工作形状是任意的；用它来表示作业对象的含义。

```typescript
const job = await this.audioQueue.add({
  foo: 'bar',
});
```



## 命名任务

任务可能具有唯一的名称。这使您可以创建专门的[<font color=red>consumers(消费者)</font>](https://docs.nestjs.com/techniques/queues#consumers)，该使用者将仅处理具有给定名称的任务。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
```

::: warning
使用命名任务时，必须为添加到队列中的每个唯一名称创建处理器，否则队列将抱怨您缺少给定任务的处理器。有关使用命名作业的更多信息，请参见[<font color=red>此处</font>](https://docs.nestjs.com/techniques/queues#consumers)。
:::


## 任务选项

任务可以具有与之关联的其他选项。在 `Queue.add()` 方法中的 `job` 参数之后传递选项对象。作业选项属性为：
  - `priority: number` - 可选的优先级值。范围从1(最高优先级)到 `MAX_INT` (最低优先级)。请注意，使用优先级会对性能产生轻微影响，因此请谨慎使用它们。
  - `delay: number` - 等待直到可以处理此任务的时间(毫秒)。请注意，为了获得准确的延迟，服务器和客户端都应使其时钟同步。
  - `attempts: number` - 尝试完成该任务之前的总尝试次数。
  - `repeat: RepeatOpts` - 根据 `cron` 规范重复任务。请参见[<font color=red>RepeatOpts</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
  - `backoff: number | BackoffOpts` - 如果任务失败，自动重试的退出设置。请参阅[<font color=red>BackoffOpts</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
  - `lifo: boolean` - 如果为 `true`，则将任务添加到队列的右端而不是左侧(默认为 `false`)。
  - `timeout: number` - 任务因超时错误而失败的毫秒数。
  - `jobId: number | string` - 覆盖任务 `ID` - 默认情况下，任务 `ID` 是唯一的整数，但是您可以使用此设置覆盖它。如果使用此选项，则由您来确保 `jobId` 是唯一的。如果尝试添加 `ID` 已经存在的任务，则不会添加该任务。
  - `removeOnComplete: boolean | number` - 如果为 `true`，则在任务成功完成时将其删除。一个数字指定要保留的任务数量。默认行为是将任务保留在完整集中。
  - `removeOnFail: boolean | number` - 如果为 `true`，则在所有尝试失败后将其删除。 一个数字指定要保留的任务数量。 默认行为是将任务保留在失败集中。
  - `stackTraceLimit: number` - 限制将在堆栈跟踪中记录的堆栈跟踪行的数量。

以下是一些使用任务选项自定义任务的示例。

要延迟任务的开始，请使用 `delay` 配置属性。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);
```

要将任务添加到队列的右端(将作业作为 `LIFO` (后进先出)进行处理)，请将配置对象的 `lifo` 属性设置为 `true`。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { lifo: true },
);
```

要确定作业的优先级，请使用 `priority` 属性。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { priority: 2 },
);
```



## `Consumers` -- 消费者

`consumer` 是一个类，定义用于处理添加到队列中的任务或侦听队列中的事件或两者的方法。使用 `@Processor()` 装饰器声明使用者类，如下所示：

```typescript
import { Processor } from '@nestjs/bull';

@Processor('audio')
export class AudioConsumer {}
```

装饰器的字符串参数(例如 "`audio`")是要与类方法关联的队列的名称。

在消费者类中，通过使用 `@Process()` 装饰器装饰处理程序方法来声明任务处理程序。

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    let progress = 0;
    for (i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 10;
      job.progress(progress);
    }
    return {};
  }
}
```

每当消费者空闲并且队列中有要处理的任务时，就会调用修饰的方法(例如 `transcode()`)。此处理程序方法将任务对象作为其唯一参数。由处理程序方法返回的值存储在任务对象中，以后可以访问它，例如在完成事件的侦听器中访问。

任务对象具有多种方法，可让您与其状态进行交互。例如，以上代码使用 `progress()` 方法更新任务的进度。有关完整的 `Job` 对象 `API` 参考，请参见[<font color=red>此处</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#job)。

您可以通过将名称传递给 `@Process()` 装饰器，来指定任务处理程序方法仅处理特定类型的任务(具有特定名称的任务)，如下所示。在给定的消费者类中，可以与每个作业类型(名称)相对应的有多个 `@Process()` 处理程序。使用命名任务时，请确保具有与每个名称相对应的处理程序。

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }
```


## 事件监听器

当队列任务状态发生更改时，`Bull` 会生成一组有用的事件。`Nest` 提供了一组装饰器，允许订阅一组核心的标准事件。这些是从 `@nestjs/bull` 包导出的。

必须在消费者类中(即，在用 `@Processor()` 装饰器修饰的类中)声明事件侦听器。要监听事件，请使用下表中的装饰器之一声明该事件的处理程序。例如，要侦听任务在音频队列中进入活动状态时发出的事件，请使用以下构造：

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
  ...
  ```

  由于 `Bull` 在分布式(多节点)环境中运行，因此它定义了事件局部性的概念。这个概念认识到事件可以完全在单个进程内触发，也可以在不同进程的共享队列上触发。本地事件是在本地进程中的队列上触发操作或状态更改时产生的事件。换句话说，当事件生产者和消费者是单个流程的本地事件时，队列中发生的所有事件都是本地事件。

  当跨多个进程共享队列时，我们会遇到全局事件的可能性。为了使一个进程中的侦听器接收到另一个进程触发的事件通知，它必须注册一个全局事件。

  每当发出相应的事件时，就会调用事件处理程序。使用下表中显示的签名调用处理程序，从而提供对与事件相关的信息的访问。我们在下面讨论本地和全局事件处理程序签名之间的一个关键区别。

  | 本地事件监听器 | 全局事件监听器 | 处理程序方法签名/触发时 |
  |:---------:|:---------:|:---------:|
  | `@OnQueueError()` | `@OnGlobalQueueError()` | `handler(error: Error)`- 发生错误。|
  | `@OnQueueWaiting()` | `@OnGlobalQueueWaiting()` | `handler(jobId: number | string)` - 进程闲置后，任务正在等待处理。`jobId` 包含已进入此状态的作业的 `ID`。 |
  | `@OnQueueActive()` | `@OnGlobalQueueActive()` | `handler(job: Job)`- 任务已经开始 |
  | `@OnQueueStalled()` | `@OnGlobalQueueStalled()` | `handler(job: Job)` - 任务被标记为已停止。这对于调试崩溃或暂停事件循环的任务进程很有用。 |
  | `@OnQueueProgress()` | `@OnGlobalQueueProgress()` | `handler(job: Job, progress: number)` - 任务的进度已更新，以评估进度 `progress`。 |
  | `@OnQueueCompleted()` | `@OnGlobalQueueCompleted()` | `handler(job: Job, result: any)` - 任务成功完成，结果是 `result`。 |
  | `@OnQueueFailed()` | `@OnGlobalQueueFailed()` | `handler(job: Job, err: Error)` - 任务失败，原因是 `Error`。 |
  | `@OnQueuePaused()` | `@OnGlobalQueuePaused()` | `handler()` - 队列已暂停。 |
  | `@OnQueueResumed()` | `@OnGlobalQueueResumed()` | `handler(job: Job)` - 队列已恢复。 |
  | `@OnQueueCleaned()` | `@OnGlobalQueueCleaned()` | `handler(jobs: Job[], type: string)` - 旧任务已从队列中清除。`jobs` 是一组已清除任务，而 `type` 是已清除作业的类型。 |
  | `@OnQueueDrained()` | `@OnGlobalQueueDrained()` | `handler()` - 每当队列处理完所有等待的任务时发出(即使可能存在一些尚未处理的延迟任务)。 |
  | `@OnQueueRemoved()` | `@OnGlobalQueueRemoved()` | `handler(job: Job)` - 任务已成功删除。 |

侦听全局事件时，方法签名可能与本地签名略有不同。具体来说，任何在本地版本中接收任务对象，而在全局版本中接收 `JobId`(数字)的方法签名。在这种情况下，要获取对实际任务对象的引用，请使用 `Queue＃getJob` 方法。应等待此调用，因此应将处理程序声明为异步。例如：

```typescript
@OnGlobalQueueCompleted()
async onGlobalCompleted(jobId: number, result: any) {
  const job = await this.immediateQueue.getJob(jobId);
  console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
}
```

::: tip
要访问 `Queue` 对象(进行 `getJob()` 调用)，您当然必须注入它。另外，队列必须在要注入队列的模块中注册。
:::

除了特定的事件侦听器装饰器之外，您还可以将泛型 `@OnQueueEvent()` 装饰器与 `BullQueueEvents` 或 `BullQueueGlobalEvents` 枚举结合使用。在[<font color=red>此处</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#events)阅读有关事件的更多信息。



## 队列管理

队列具有一个 `API`，可让您执行管理功能，例如暂停和继续，检索各种状态下的作业计数等。您可以在[<font color=red>此处</font>](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)找到完整队列 `API`。直接在 `Queue` 对象上调用这些方法中的任何一个，如下面的 暂停/恢复 示例所示。

通过 `pause()` 方法调用暂停队列。暂停的队列在恢复之前不会处理新的任务，但是当前正在处理的任务将继续直到完成。

```typescript
await audioQueue.pause();
```

要恢复已暂停的队列，请使用 `resume()` 方法，如下所示：

```typescript
await audioQueue.resume();
```



## 异步配置

您可能希望异步而不是静态地传递队列选项。在这种情况下，请使用 `registerQueueAsync()` 方法，该方法提供了几种处理异步配置的方法。

一种方法是使用工厂函数：

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

我们的工厂的行为类似于任何其他[<font color=red>异步提供程序</font>](https://docs.nestjs.com/fundamentals/async-providers)(例如，它可以是异步的，并且能够通过注入来注入依赖项)。

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get('QUEUE_HOST'),
      port: +configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
```

另外，您可以使用 `useClass` 语法：

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useClass: BullConfigService,
});
```
上面的构造将实例化 `BullModule` 中的 `BullConfigService`，并通过调用 `createBullOptions()` 使用它来提供一个 `options` 对象。请注意，这意味着 `BullConfigService` 必须实现 `BullOptionsFactory` 接口，如下所示：

```typescript
@Injectable()
class BullConfigService implements BullOptionsFactory {
  createBullOptions(): BullModuleOptions {
    return {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
```

为了防止在 `BullModule` 内部创建 `BullConfigService` 并使用从其他模块导入的提供程序，可以使用 `useExisting` 语法。

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

此构造与 `useClass` 相同，但有一个重要区别 - `BullModule` 将查找导入的模块以重用现有的 `ConfigService` 而不是实例化新的 `ConfigService`。


## 示例

[<font color=red>这里</font>](https://github.com/nestjs/nest/tree/master/sample/26-queues)有一个工作示例。