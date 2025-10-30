---
id: client-libraries-dotnet-setup
title: 设置 C# 客户端
sidebar_label: "设置"
description: 了解如何在 Pulsar 中设置 C# 客户端库。
---

要在 Pulsar 中设置 C# 客户端库，请完成以下步骤。

## 步骤 1：安装 C# 客户端库

本节描述如何通过 dotnet CLI 安装 Pulsar C# 客户端库。

或者，你也可以通过 Visual Studio 安装 Pulsar C# 客户端库。请注意，从 Visual Studio 2017 开始，dotnet CLI 会自动随任何 .NET Core 相关工作负载安装。有关更多信息，请参阅 [Microsoft 文档](https://docs.microsoft.com/en-us/visualstudio/mac/nuget-walkthrough?view=vsmac-2019)。

要使用 dotnet CLI 安装 Pulsar C# 客户端库，请按照以下步骤操作：

1. 安装 [.NET Core SDK](https://dotnet.microsoft.com/download/)，它提供了 dotnet CLI。

2. 创建项目。

   1. 为项目创建一个文件夹。

   2. 打开终端窗口并切换到新文件夹。

   3. 使用以下命令创建项目。

       ```
       dotnet new console
       ```

   4. 使用 `dotnet run` 来测试应用程序是否已正确创建。

3. 添加 DotPulsar NuGet 包。

   1. 使用以下命令安装 `DotPulsar` 包。

       ```
       dotnet add package DotPulsar
       ```

   2. 命令完成后，打开 `.csproj` 文件以查看添加的引用。

       ```xml
       <ItemGroup>
         <PackageReference Include="DotPulsar" Version="2.0.1" />
       </ItemGroup>
       ```

## 步骤 2：连接到 Pulsar 集群

要使用客户端库连接到 Pulsar，你需要指定一个 [Pulsar 协议](developing-binary-protocol.md) URL。

你可以为特定的集群分配 Pulsar 协议 URL，并使用 `pulsar` 方案。以下是使用默认端口 `6650` 的 `localhost` 示例：

```http
pulsar://localhost:6650
```

如果你有多个 broker，用逗号分隔 `IP:port`：

```http
pulsar://localhost:6550,localhost:6651,localhost:6652
```

如果你使用 [mTLS](security-tls-authentication.md) 认证，在方案中添加 `+ssl`：

```http
pulsar+ssl://pulsar.us-west.example.com:6651
```