# easy-kuai使用指南

## 一、简介

	Helps you write code more easily in kuai-shou
	
	开发本插件最初是为了在编码过程中更快捷的按需引入@ks/kwai-ui组件
	
	在开发过程中，经个人经验判断，增加了非常实用的翻译功能 ，以提升开发的效率，同时，为了保证项目中更合理的使用css常量，增加了css常量提示-替换功能，后续也会逐渐的新增一些比较实用（自认为）的功能
	
	大家在使用插件过程中遇到什么问题，可以随时向我反馈~
	
	也欢迎大家向我提出自己的一些需求，我会不定时的更新插件，有可能在某一天就能带上你所需要的功能，不过最终的效果么，不在于你想要什么，而在于我能做什么

## 二、功能

	下载插件后，开启新的vscode窗口时会自动启用插件，当然你也可以通过触发easy-kuai.switch命令（快捷键：cmd+k「alt+k」）来关闭或者重新开启，插件成功开启和关闭都会在vscode右下角进行弹窗提示。

<img src="http://img.liuzhenpeng.cn/typora/image-20220223163023525.png" alt="image-20220223163023525" style="zoom: 33%;" />

	打开插件后，工作区右键菜单中会出现easy-kuai菜单，里面包含着目前该插件所包含的功能，同时会自动的开启kwai-ui自动引入功能。

<img src="http://img.liuzhenpeng.cn/typora/image-20220223163329343.png" alt="image-20220223163329343" style="zoom:33%;" />

### 2.1 自动引入kwai-ui组件

- 命令：无

- 快捷键：无

- 生效条件：插件开启、vue文件

- 用途：项目中如果使用了@ks/kwai-ui组件库，可快速在文件中按需引入kwai-ui组件

  插件会遍历根目录，按照相对路径找到./node_modules/@ks/kwai-ui/src/index.js 文件，自动的提取该文件中导出的组件，用于后续的提示与引入。

  该功能开启后，在.vue文件中，vscode会模糊查询键入的值，代码提示框中会提示匹配到的kwai-ui组件，选择所需引入组件后，插件会分析当前编辑器的代码情况：

- 是否已经import了该组件

- 是否import了kwai-ui中其它组件

- import方式是单行引入还是多行引入

- 代码是否采用的是composition API 风格

- component声明中是否有改组件

- 是否有component声明

根据页面分析的情况，插件会选择合适方式插入import语句并注册component组件

![import_kwai-ui](http://img.liuzhenpeng.cn/typora/import_kwai-ui.gif)



### 2.2 翻译

	插件目前无奈的采用百度通用开放平台提供的通用翻译API（谷歌翻译要考虑翻墙的问题，DeepL API不支持国内使用，网易有道智云·AI开放平台注册失败），由于只有企业用户能使用词典功能，所以插件中只能提供最基础的翻译，没办法提供更全面的信息以帮助你更好的命名，这个后期会进行调整。同时，目前插件使用的是高级版，QPS更大一些，但是当使用人数较多时，很容易超过免费的翻译字符，到时候我就会手动的切换成标椎版，还望谅解。

<img src="http://img.liuzhenpeng.cn/typora/image-20220223184425864.png" alt="image-20220223184425864" style="zoom: 33%;" />

#### 2.2.1 翻译-汉译英

- 命令：easy-kuai.CN2EN
- 快捷键：cmd+; 「alt+;」
- 生效条件：插件开启、所有文件
- 用途：编写代码中，将选中文本翻译成英文

选取一段文本后，触发命令，插件会调用百度翻译API对选中文字进行翻译，并将翻译的结果插入到下一行中

![translate_CN2ENgif](http://img.liuzhenpeng.cn/typora/translate_CN2ENgif.gif)

#### 2.2.2 翻译-英译汉

- 命令：easy-kuai.EN2CN

- 快捷键：shift+cmd+; 「shift+alt+;」

- 生效条件：插件开启、所有文件

- 用途：在阅读代码中，翻译出鼠标所在位置单词或者所选文本的中文给予提示

  考虑到阅读代码中需要将英文翻译成中文的情况，大多数是在阅读api文档或者是对页面中的某些英文注释不理解时，需要看一下意思，而并不需要将中文给输出到代码中，因此采用了和上面汉译英不同的处理方式。触发命令打开英译汉功能后，鼠标悬浮到单词上，或者选中一串文本后悬浮，此时会出现浮动文本的中文翻译，再次触发命令会关闭英译汉功能（在不使用该功能时，建议主动将其关闭，避免浮动的时候都要去进行翻译操作，浪费资源和时间）

![translate_EN2CN](http://img.liuzhenpeng.cn/typora/translate_EN2CN.gif)

### 2.3 css常量提示

- 命令：easy-kuai.css-var

- 快捷键：无（必须通过鼠标右键菜单调用）

- 生效条件：插件开启、所有文件

- 用途：添加css颜色变量 在项目中使用到时会进行提示

  本人在开发过程中会遇到这样一个问题，项目中会在一些公共文件中定义一些公用的css颜色常量，但是在业务开发的过程中，往往是直接使用设计稿中定义好的颜色，这些颜色很可能就是css常量中进行了定义，但是开发过程中并没有用到，这就失去了定义css颜色常量的意义。

  在定义css颜色变量的文件中，通过鼠标右键菜单，选择添加css常量，此时，插件会将该文件中定义的所有css颜色变量给存储起来，当在.vue文件中使用到其中的颜色时，该颜色上方会有其常量名字的提示，点击该提示，会自动的用常量名替换该颜色。

（注：可以多次添加css颜色常量，对于重复的值，后添加的会覆盖之前添加的，当关闭整个插件的时候，存储的css颜色常量会清空）

![css_var](http://img.liuzhenpeng.cn/typora/css_var.gif)

