---
title: 任务调度
lang: zh-CN
---

## 任务调度介绍

通过任务计划，您可以计划任意代码(方法/功能)以固定的日期/时间，重复间隔或在指定间隔后执行一次。在 `Linux` 世界中，这通常由 `OS` 级别的 [<font color=red>cron</font>](https://en.wikipedia.org/wiki/Cron)之类的软件包处理。对于 `Node.js` 应用程序，有几个程序包可模拟 `cron` 类功能。`Nest` 提供了 `@nestjs/schedule` 软件包，该软件包与流行的 `Node.js` [<font color=red>node-cron</font>](https://github.com/kelektiv/node-cron) 软件包集成在一起。我们将在本章中介绍该软件包。


## 安装

安装所需依赖项

```bash
$ npm install --save @nestjs/schedule
```

要激活作业调度，请将 `ScheduleModule` 导入到根 `AppModule` 并运行 `forRoot()` 静态方法，如下所示：

::: tip  官方示例
    app.module.ts
:::

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}
```

`.forRoot()` 调用将初始化调度程序，并注册应用程序内存在的所有声明性[<font color=red>cron jobs</font>](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs),[<font color=red>timeouts</font>](https://docs.nestjs.com/techniques/task-scheduling#declarative-timeouts)和[<font color=red>intervals</font>](https://docs.nestjs.com/techniques/task-scheduling#declarative-intervals)。当发生 `onApplicationBootstrap` 生命周期挂钩时，将进行注册，以确保所有模块均已加载并声明了任何计划的作业。



## 声明式 `Cron` 作业(计时任务)

`cron` 作业可调度任意功能(方法调用)以自动运行。`Cron` 作业可以运行：
  - 在指定的日期/时间一次。
  - 定期进行；周期性作业可以在指定的时间间隔内(例如每小时一次，每周一次，每5分钟一次)在指定的时刻运行

在方法定义包含要执行的代码之前，使用 `@Cron()` 装饰器声明 `cron` 作业，如下所示：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
```

在此示例中，每次当前秒是45时，都会调用 `handleCron()` 方法。换句话说，该方法每分钟运行一次，时间为45秒。

`@Cron()` 装饰器支持所有标准 `cron` 模式：
  - 星号(例如*)
  - 范围(例如1-3,5)
  - 步骤(例如 * / 2)

在上面的示例中，我们将 `45 * * * * *` 传递给了装饰器。以下密钥显示了 `cron` 模式字符串中每个位置的解释方式：

```bash
* * * * * *
| | | | | |
| | | | | day of week
| | | | month
| | | day of month
| | hour
| minute
second (optional)
```

一些模板 `cron` 模式：

| 模式 | 描述 |
|:---------:|:---------:|
| `* * * * * *` | 每一秒 |
| `45 * * * * *` | 每45分钟 |
| `* 10 * * * *` | 每小时，在第10分钟开始时 |
| `0 */30 9-17 * * *` | 上午9点至下午5点之间每30分钟一班 |
| `0 30 11 * * 1-5` | 周一至周五上午11:30 |

`@nestjs/schedule` 包提供了常用 `cron` 模式的便利枚举。

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_45_SECONDS)
  handleCron() {
    this.logger.debug('Called every 45 seconds');
  }
}
```

在此示例中，将每45秒调用一次 `handleCron()` 方法。

另外，您可以向 `@Cron()` 装饰器提供一个 `JavaScript Date` 对象。这样会使作业在指定的日期准确执行一次。

::: tip
使用 `JavaScript` 日期算术来计划相对于当前日期的作业。例如，使用 `@Cron(new Date(Date.now() + 10 * 1000))` 安排作业在应用程序启动后运行10秒钟。
:::

您可以在声明 `cron` 作业后访问和控制它，也可以使用 [<font color=red>Dynamic API</font>](https://docs.nestjs.com/techniques/task-scheduling#dynamic-schedule-module-api) 动态创建 `cron` 作业(在运行时定义 `cron` 模式)。要通过 `API` 访问声明性 `cron` 作业，您必须通过在可选的 `options` 对象中将 `name` 属性作为装饰器的第二个参数传递来将作业与名称相关联，如下所示：

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}
```


## 声明间隔

要声明某个方法应以(重复)指定的间隔运行，请在该方法定义的前面加上 `@Interval()` 装饰器。将间隔值(以毫秒为单位)传递给装饰器，如下所示：

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}
```

::: tip
此机制在后台使用 `JavaScript setInterval()` 函数。您还可以利用 `Cron` 作业安排重复作业。
:::

如果要通过[<font color=red>动态API</font>](https://docs.nestjs.com/techniques/task-scheduling#dynamic-schedule-module-api) 从声明类的外部控制声明间隔，请使用以下构造将间隔与名称关联：

```typescript
@Interval('notifications', 2500)
handleInterval() {}
```

[<font color=red>动态API</font>](https://docs.nestjs.com/techniques/task-scheduling#dynamic-intervals)还支持创建动态间隔(在运行时定义间隔的属性)，并列出和删除它们。



## 声明式延时任务

若要声明某个方法应在指定的延时时间后(一次)运行，请在该方法定义的前面加上 `@Timeout()` 装饰器。从应用程序启动传递相对时间偏移(以毫秒为单位)到装饰器，如下所示：

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}
```

::: tip
此机制在后台使用 `JavaScript setTimeout()` 函数。
:::

如果要通过[<font color=red>动态API</font>](https://docs.nestjs.com/techniques/task-scheduling#dynamic-schedule-module-api)从声明类的外部控制声明超时，请使用以下构造将超时与名称相关联：

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}
```

使用[<font color=red>动态API</font>](https://docs.nestjs.com/techniques/task-scheduling#dynamic-schedule-module-api)，还可以创建动态超时，并在运行时定义超时属性，并列出和删除它们。



## 动态计划模块 `API`
`@nestjs/schedule` 模块提供了动态 `API`，可用于管理声明性 [<font color=red>cron jobs</font>](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs),[<font color=red>timeouts</font>](https://docs.nestjs.com/techniques/task-scheduling#declarative-timeouts)和[<font color=red>intervals</font>](https://docs.nestjs.com/techniques/task-scheduling#declarative-intervals)。该 `API` 还支持创建和管理动态 `cron jobs, timeouts and intervals`，这些属性是在运行时定义的。



## 动态 `cron jobs`

使用 `SchedulerRegistry API` 从代码的任何位置按名称获取对 `CronJob` 实例的引用。首先，使用标准构造函数注入 `SchedulerRegistry`：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

::: tip
从 `@nestjs/schedule` 包导入 `SchedulerRegistry`。
:::

然后在类中使用它，如下所示。假设使用以下声明创建了 `cron` 作业：

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}
```

使用以下命令访问此作业：

```typescript
const job = this.schedulerRegistry.getCronJob('notifications');

job.stop();
console.log(job.lastDate());
```

`getCronJob()` 方法返回命名的 `cron` 作业。返回的 `CronJob` 对象具有以下方法：
  - `stop()` - 停止计划运行的作业。
  - `start()` - 重新启动已停止的作业。
  - `setTime(time：CronTime)` - 停止作业，为其设置新时间，然后启动它
  - `lastDate()` - 返回作业执行的最后日期的字符串表示形式
  - `nextDates(count：number)` - 返回表示即将执行的作业执行日期的矩对象的数组(大小计数)。

::: tip
在 `moment` 对象上使用 `toDate()` 使其以人类可读的形式呈现。
:::


使用 `SchedulerRegistry.addCronJob()` 方法动态创建一个新的 `cron` 作业，如下所示：

```typescript
addCronJob(name: string, seconds: string) {
  const job = new CronJob(`${seconds} * * * * *`, () => {
    this.logger.warn(`time (${seconds}) for job ${name} to run!`);
  });

  this.scheduler.addCronJob(name, job);
  job.start();

  this.logger.warn(
    `job ${name} added for each minute at ${seconds} seconds!`,
  );
}
```

在此代码中，我们使用 `cron` 包中的 `CronJob` 对象创建 `cron` 作业。`CronJob` 构造函数将 `cron` 模式(就像 `@Cron() decorator` 一样)作为其第一个参数，并将在 `cron` 计时器触发时执行的回调作为其第二个参数。`SchedulerRegistry.addCronJob()` 方法采用两个参数：`CronJob` 的名称和 `CronJob` 对象本身。

::: warning
记住在访问它之前要注入 `Scheduler` 注册表。从 `cron` 包中导入 `CronTab`。
:::

使用 `SchedulerRegistry.deleteCronJob()` 方法删除命名的 `cron` 作业，如下所示：

```typescript
deleteCron(name: string) {
  this.scheduler.deleteCronJob(name);
  this.logger.warn(`job ${name} deleted!`);
}
```

使用 `SchedulerRegistry.getCronJobs()` 方法列出所有 `cron` 作业，如下所示：

```typescript
getCrons() {
  const jobs = this.scheduler.getCronJobs();
  jobs.forEach((value, key, map) => {
    let next;
    try {
      next = value.nextDates().toDate();
    } catch (e) {
      next = 'error: next fire date is in the past!';
    }
    this.logger.log(`job: ${key} -> next: ${next}`);
  });
}
```

`getCronJobs()` 方法返回一个 `map`。在此代码中，我们遍历 `map` 并尝试访问每个 `CronJob` 的 `nextDates()` 方法。在 `CronJob API` 中，如果作业已经被触发且未指定下次的触发日期，它将引发异常。



## 动态定时器
使用 `SchedulerRegistry.getInterval()` 方法获取对定时器的引用。如上所述，使用标准构造函数注入注入 `SchedulerRegistry`：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

并按如下所示使用它：

```typescript
const interval = this.schedulerRegistry.getInterval('notifications');
clearInterval(interval);
```

使用 `SchedulerRegistry.addInterval()` 方法动态创建一个新的定时器，如下所示：

```typescript
addInterval(name: string, seconds: string) {
  const callback = () => {
    this.logger.warn(`Interval ${name} executing at time (${seconds})!`);
  };

  const interval = setInterval(callback, seconds);
  this.scheduler.addInterval(name, interval);
}
```

在这段代码中，我们创建一个标准的 `JavaScript` 定时器，然后将其传递给 `ScheduleRegistry.addInterval()` 方法。该方法有两个参数：定时器的名称和定时器本身。

使用 `SchedulerRegistry.deleteInterval()` 方法删除命名的定时器，如下所示：

```typescript
deleteInterval(name: string) {
  this.scheduler.deleteInterval(name);
  this.logger.warn(`Interval ${name} deleted!`);
}
```

使用 `SchedulerRegistry.getIntervals()` 方法列出所有定时器，如下所示：

```typescript
getIntervals() {
  const intervals = this.scheduler.getIntervals();
  intervals.forEach(key => this.logger.log(`Interval: ${key}`));
}
```



## 动态延时器

使用 `SchedulerRegistry.getTimeout()` 方法获取对延时器的引用。如上所述，使用标准构造函数注入注入 `SchedulerRegistry`：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

并按如下所示使用它：

```typescript
const timeout = this.schedulerRegistry.getTimeout('notifications');
clearTimeout(timeout);
```

使用 `SchedulerRegistry.addTimeout()` 方法动态创建一个新的延时器，如下所示：

```typescript
addTimeout(name: string, seconds: string) {
  const callback = () => {
    this.logger.warn(`Timeout ${name} executing after (${seconds})!`);
  };

  const timeout = setTimeout(callback, seconds);
  this.scheduler.addTimeout(name, timeout);
}
```

在这段代码中，我们创建一个标准的 `JavaScript` 延时器，然后将其传递给 `ScheduleRegistry.addTimeout()` 方法。该方法有两个参数：延时器的名称和延时器本身。

使用 `SchedulerRegistry.deleteTimeout()` 方法删除命名的延时器，如下所示：

```typescript
deleteTimeout(name: string) {
  this.scheduler.deleteTimeout(name);
  this.logger.warn(`Timeout ${name} deleted!`);
}
```

使用 `SchedulerRegistry.getTimeouts()` 方法列出所有延时器，如下所示：

```typescript
getTimeouts() {
  const timeouts = this.scheduler.getTimeouts();
  timeouts.forEach(key => this.logger.log(`Timeout: ${key}`));
}
```



## 示例

[<font color=red>这里</font>](https://github.com/nestjs/nest/tree/master/sample/27-scheduling)有一个工作示例。