---
title: Nestjs
lang: en-US
---

# Nestjs Documention

## Introduction

Nest (NestJS) is a framework for building efficient, scalable [Node.js](https://nodejs.org/en/) server-side applications. It uses progressive JavaScript, is built with and fully supports [TypeScript](https://www.typescriptlang.org/) (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

Under the hood, Nest makes use of robust HTTP Server frameworks like [Express](https://expressjs.com/) (the default) and optionally can be configured to use [Fastify](https://github.com/fastify/fastify) as well!

Nest provides a level of abstraction above these common Node.js frameworks (Express/Fastify), but also exposes their APIs directly to the developer. This allows developers the freedom to use the myriad of third-party modules which are available for the underlying platform.

## Installation

To get started, you can either scaffold the project with the [Nest CLI](https://docs.nestjs.com/cli/overview), or clone a starter project (both will produce the same outcome).

To scaffold the project with the Nest CLI, run the following commands. This will create a new project directory, and populate the directory with the initial core Nest files and supporting modules, creating a conventional base structure for your project. Creating a new project with the Nest CLI is recommended for first-time users. We'll continue with this approach in [First Steps](https://docs.nestjs.com/first-steps).

```bash
  $ npm i -g @nestjs/cli
  $ nest new project-name
```
## First steps

Please make sure that [Node.js](https://nodejs.org/en/) (>= 10.13.0) is installed on your operating system.

### Setup

Setting up a new project is quite simple with the [Nest CLI](https://docs.nestjs.com/cli/overview). With [npm](https://www.npmjs.com/) installed, you can create a new Nest project with the following commands in your OS terminal:

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```
The `project` directory will be created, node modules and a few other boilerplate files will be installed, and a src/ directory will be created and populated with several core files.

### Running the application
Once the installation process is complete, you can run the following command at your OS command prompt to start the application listening for inbound HTTP requests:

```bash
npm run start
```
This command starts the app with the HTTP server listening on the port defined in the src/main.ts file. Once the application is running, open your browser and navigate to http://localhost:3000/. You should see the Hello World! message.

---
If you want to try it, please refer to the official documentation for more detailed [documentation](https://docs.nestjs.com/) :books:


