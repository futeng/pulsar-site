---
id: functions-develop-admin-api
title: 调用 Pulsar admin API
sidebar_label: "调用 Pulsar admin API"
description: 学习如何调用 Pulsar admin API。
---

使用 Java SDK 的 Pulsar Functions 可以访问 Pulsar admin 客户端，该客户端允许 Pulsar admin 客户端管理对 Pulsar 集群的 API 调用。

以下是如何使用从函数 `context` 暴露的 Pulsar admin 客户端的示例。

```java
import org.apache.pulsar.client.admin.PulsarAdmin;
import org.apache.pulsar.functions.api.Context;
import org.apache.pulsar.functions.api.Function;

/**
 * 在这个特定示例中，对于每条输入消息，
 * 函数将当前函数订阅的游标重置为
 * 指定的时间戳。
 */
public class CursorManagementFunction implements Function<String, String> {

    @Override
    public String process(String input, Context context) throws Exception {
        PulsarAdmin adminClient = context.getPulsarAdmin();
        if (adminClient != null) {
            String topic = context.getCurrentRecord().getTopicName().isPresent() ?
                    context.getCurrentRecord().getTopicName().get() : null;
            String subName = context.getTenant() + "/" + context.getNamespace() + "/" + context.getFunctionName();
            if (topic != null) {
                // 下面的 1578188166 是一个随机选择的时间戳
                adminClient.topics().resetCursor(topic, subName, 1578188166);
                return "游标重置成功";
            }
        }
        return null;
    }
}
```

要使您的函数能够访问 Pulsar admin 客户端，您需要在 `conf/functions_worker.yml` 文件中设置 `exposeAdminClientEnabled=true`。要测试是否已启用，您可以使用带有 `--web-service-url` 标志的 `pulsar-admin functions localrun` 命令，如下所示。

```bash
bin/pulsar-admin functions localrun \
 --jar $PWD/my-functions.jar \
 --classname my.package.CursorManagementFunction \
 --web-service-url http://pulsar-web-service:8080 \
 # 其他函数配置
```