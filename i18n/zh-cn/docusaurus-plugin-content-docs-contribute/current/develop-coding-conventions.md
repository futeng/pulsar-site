---
id: develop-coding-conventions
title: Coding conventions
---

这些指南有助于鼓励在 Apache Pulsar 代码库工作的人员之间的一致性和最佳实践。您应该遵守这些指南，除非有令人信服的理由忽略它们。Pulsar 使用 checkstyle 来强制执行编码风格，请参考我们的 [checkstyle 规则](https://github.com/apache/pulsar/blob/master/buildtools/src/main/resources/pulsar/checkstyle.xml) 了解所有强制执行的 checkstyle 规则。

## Java 代码风格

Apache Pulsar 代码遵循 [Sun Java 编码约定](http://www.oracle.com/technetwork/java/javase/documentation/codeconvtoc-136057.html)，并做以下补充。

* 缩进应该是 **4 个空格**。永远不要使用制表符。
* 即使是单行的 if 和 else 语句也要使用大括号。
* 任何 javadoc 中都不要使用 @author 标签。
* 尽可能使用 try-with-resources 代码块。
* **TODO** 应该与至少一个 issue 关联。

## 依赖项

Apache Pulsar 大量使用以下库：

* [Guava](https://github.com/google/guava) 作为基础核心库
* [Netty](http://netty.io/) 用于网络通信和内存缓冲区管理。

尽可能使用这些库，而不是引入更多依赖项。

依赖项随我们的二进制发行版一起捆绑，因此在添加新依赖项时，您需要附加相关许可证。

## Future

Java 8 中引入的 `CompletableFuture` 比 Guava 的 `ListenableFuture` 更受欢迎。尽可能使用 `CompletableFuture`。

## 内存

对于内部使用，使用 netty `ByteBuf` 而不是 `java.nio.ByteBuffer`。因为 Pulsar 使用 Netty Buffer 进行内存管理。

## 日志记录

* 应该认真对待日志记录。在进行更改时，请花时间访问日志，确保重要的事情得到记录，并且没有垃圾信息。
* 日志语句应该是完整的句子，具有适当的大小写，是为不一定熟悉源代码的人编写的。
* 所有日志都应该使用 **SLF4j** 完成，永远不要使用 `System.out` 或 `System.err`。

### 日志级别

* **INFO** 是您应该假设软件运行时所处的级别。INFO 消息是不坏的但用户肯定希望每次发生时都知道的事情。
* **TRACE** 和 **DEBUG** 都是当出现问题时您打开的，想要找出发生了什么。**DEBUG** 不应该过于细粒度，以至于会严重影响程序的性能。**TRACE** 可以是任何东西。您应该将 DEBUG 和 TRACE 语句包装在 `if (logger.isDebugEnabled())` 或 `if (logger.isTraceEnabled())` 检查中以避免性能下降。
* **WARN** 和 **ERROR** 表示*不好*的事情。如果您不确定是否是坏的，使用 WARN；如果确定，使用 ERROR。

在 **ERROR** 级别记录堆栈跟踪，但永远不要在 **INFO** 级别或更低级别记录。如果您对调试感兴趣，可以在 **WARN** 级别记录。

## 监控

* 任何新功能都应该带有适当的指标，以便监控功能是否正常工作。
* 这些指标应该认真对待，只导出有用的指标，这些指标将在生产环境上用于监控/警报系统健康状况，或排查问题。

## 单元测试

* 新的更改应该带有验证正在添加功能的单元测试。
* 单元测试应该测试尽可能少的代码。除非没有其他方法可以单独测试单个类或小组类，否则不要启动整个服务器。
* 测试不应该依赖于任何外部资源。它们需要设置和拆除自己的东西。
* 在测试中使用文件系统和网络是可以的，因为这是我们的业务，但您需要在测试后清理它们。
* 不要在测试中使用 sleep 或其他时间假设。这是错误的，在任何有其他事情导致延迟的测试服务器上都会间歇性失败。
* 您最好为所有测试用例添加超时值，以防止构建无限期完成。例如，`@Test(timeout=60000)`。

## 配置

* 当您使用配置文件时，从一开始就要考虑名称。
* 如果您在不调整参数的情况下运行程序，使用默认值。
* 所有配置设置都应该相应地添加到[默认配置文件](https://github.com/apache/pulsar/tree/master/conf)目录中并进行相应记录。

## 并发

Apache Pulsar 是一个低延迟系统，它实现为纯粹异步服务，如下所示：

* 所有公共类都应该是**线程安全的**。
* 优先使用 [OrderedExecutor](https://github.com/apache/bookkeeper/blob/master/bookkeeper-common/src/main/java/org/apache/bookkeeper/common/util/OrderedExecutor.java) 执行任何异步操作。对同一实例的变更应该提交到同一线程执行。
* 如果需要同步和锁定，应该以细粒度方式进行。
* 所有线程都应该有适当的、有意义的名称。
* 如果类不是线程安全的，应该注解 [@NotThreadSafe](https://github.com/misberner/jsr-305/blob/master/ri/src/main/java/javax/annotation/concurrent/NotThreadSafe.java)。使用此类的实例负责其同步。

## 向后兼容性

* 线路协议应该支持向后兼容性，以实现无停机升级。这意味着服务器**必须**能够同时支持来自旧客户端和新客户端的请求。
* 元数据格式和数据格式应该支持向后兼容性。