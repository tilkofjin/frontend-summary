(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{377:function(s,t,a){"use strict";a.r(t);var e=a(42),n=Object(e.a)({},(function(){var s=this,t=s.$createElement,a=s._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("h2",{attrs:{id:"动态模块"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#动态模块"}},[s._v("#")]),s._v(" 动态模块")]),s._v(" "),a("p",[s._v('"'),a("a",{attrs:{href:"https://docs.nestjs.com/modules",target:"_blank",rel:"noopener noreferrer"}},[a("font",{attrs:{color:"red"}},[s._v("模塊")]),a("OutboundLink")],1),s._v('"一章介紹了 '),a("code",[s._v("Nest")]),s._v(" 模塊的基礎知識，並簡要介紹了"),a("a",{attrs:{href:"https://docs.nestjs.com/modules#dynamic-modules",target:"_blank",rel:"noopener noreferrer"}},[a("font",{attrs:{color:"red"}},[s._v("動態模塊")]),a("OutboundLink")],1),s._v("。本章擴展了動態模塊的主題。完成後，您應該對它們是什麼以及如何以及何時使用它們有很好的了解。")]),s._v(" "),a("h2",{attrs:{id:"介绍"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#介绍"}},[s._v("#")]),s._v(" 介绍")]),s._v(" "),a("p",[s._v('文档"概述"部分中的大多数应用程序代码示例都使用常规或静态模块。模块定义了组件组，例如提供者和控制器，它们作为整体应用程序的模块化部分组合在一起。它们为这些组件提供了执行上下文或作用域。例如，模塊中定義的提供者對模塊的其他成員可見，而無需導出它們。當提供者需要在模塊外部可見時，它首先從其主機模塊中導出，然後導入到其使用模塊中。')]),s._v(" "),a("p",[s._v("讓我們來看一個熟悉的例子。")]),s._v(" "),a("p",[s._v("首先，我們將定義一個 "),a("code",[s._v("UsersModule")]),s._v(" 以提供和導出 "),a("code",[s._v("UsersService")]),s._v("。"),a("code",[s._v("UsersModule")]),s._v(" 是 "),a("code",[s._v("UsersService")]),s._v(" 的宿主模塊。")]),s._v(" "),a("div",{staticClass:"language-typescript extra-class"},[a("pre",{pre:!0,attrs:{class:"language-typescript"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" Module "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'@nestjs/common'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" UsersService "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'./users.service'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n@"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("Module")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  providers"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("UsersService"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  exports"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("UsersService"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("export")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("UsersModule")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])])]),a("p",[s._v("接下來，我們將定義一個 "),a("code",[s._v("AuthModule")]),s._v("，它導入 "),a("code",[s._v("UsersModule")]),s._v("，從而使 "),a("code",[s._v("AuthModule")]),s._v(" 中可以使用 "),a("code",[s._v("UsersModule")]),s._v(" 的導出提供程序：")]),s._v(" "),a("div",{staticClass:"language-typescript extra-class"},[a("pre",{pre:!0,attrs:{class:"language-typescript"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" Module "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'@nestjs/common'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" AuthService "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'./auth.service'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" UsersModule "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'../users/users.module'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n@"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("Module")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  imports"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("UsersModule"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  providers"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("AuthService"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  exports"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("AuthService"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("export")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("AuthModule")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])])]),a("p",[s._v("這些構造使我們可以將 "),a("code",[s._v("UsersService")]),s._v(" 注入到例如 "),a("code",[s._v("AuthModule")]),s._v(" 中託管的 "),a("code",[s._v("AuthService中")]),s._v("：")]),s._v(" "),a("div",{staticClass:"language-typescript extra-class"},[a("pre",{pre:!0,attrs:{class:"language-typescript"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" Injectable "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'@nestjs/common'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" UsersService "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("from")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'../users/users.service'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n@"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("Injectable")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("export")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("AuthService")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("constructor")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("private")]),s._v(" usersService"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" UsersService")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("/*\n    Implementation that makes use of this.usersService\n  */")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])])]),a("p",[s._v("我们将其称为静态模块绑定。"),a("code",[s._v("Nest")]),s._v(" 已在主机和使用模块中声明了将模块连接在一起所需的所有信息。让我们解压缩此过程中发生的事情。"),a("code",[s._v("Nest")]),s._v(" 通过以下方式使 "),a("code",[s._v("AuthModule")]),s._v(" 中的 "),a("code",[s._v("UsersService")]),s._v(" 可用：\n1、实例化 "),a("code",[s._v("UsersModule")]),s._v("，包括可转换地导入 "),a("code",[s._v("UsersModule")]),s._v(" 本身使用的其他模块，以及可转换地解决任何依赖关系(请参阅自定义提供者)\n2、實例化 "),a("code",[s._v("AuthModule")]),s._v("，並使 "),a("code",[s._v("UsersModule")]),s._v(" 的導出提供者可用於 "),a("code",[s._v("AuthModule")]),s._v(" 中的組件(就像它們已在 "),a("code",[s._v("AuthModule")]),s._v(" 中聲明一樣)。\n3、在 "),a("code",[s._v("AuthService")]),s._v(" 中註入 "),a("code",[s._v("UsersService")]),s._v(" 的實例。")]),s._v(" "),a("h2",{attrs:{id:"动态模块用例"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#动态模块用例"}},[s._v("#")]),s._v(" 动态模块用例")])])}),[],!1,null,null,null);t.default=n.exports}}]);