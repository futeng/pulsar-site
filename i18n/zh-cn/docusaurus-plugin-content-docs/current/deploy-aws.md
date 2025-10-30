---
id: deploy-aws
title: 使用 Terraform 和 Ansible 在 AWS 上部署 Pulsar 集群
sidebar_label: "Terraform (AWS)"
description: 学习如何使用 Terraform 和 Ansible 在 AWS 上部署 Pulsar 集群。
---

> 有关手动部署单个 Pulsar 集群而不使用 Terraform 和 Ansible 的说明，请参阅[在裸机上部署 Pulsar 集群](deploy-bare-metal.md)。有关手动部署多集群 Pulsar 实例的说明，请参阅[在裸机上部署 Pulsar 实例](deploy-bare-metal-multi-cluster.md)。

在 [Amazon Web Services](https://aws.amazon.com/) (AWS) 上运行 Pulsar [集群](reference-terminology.md#cluster) 的最简单方法之一是使用 [Terraform](https://terraform.io) 基础设施配置工具和 [Ansible](https://www.ansible.com) 服务器自动化工具。Terraform 可以创建运行 Pulsar 集群所需的资源——[EC2](https://aws.amazon.com/ec2/) 实例、网络和安全基础设施等——而 Ansible 可以在配置的资源上安装和运行 Pulsar。

要在 AWS 上部署 Pulsar 集群，请完成以下步骤。

## 要求和设置

要使用 Terraform 和 Ansible 在 AWS 上安装 Pulsar 集群，您需要准备以下事项：

* 一个 [AWS 账户](https://aws.amazon.com/account/) 和 [`aws`](https://aws.amazon.com/cli/) 命令行工具
* Python 和 [pip](https://pip.pypa.io/en/stable/)
* [`terraform-inventory`](https://github.com/adammck/terraform-inventory) 工具，它使 Ansible 能够使用 Terraform 工件

您还需要确保当前已通过 `aws` 工具登录到您的 AWS 账户：

```bash
aws configure
```

## 步骤 1：安装

您可以在 Linux 或 macOS 上使用 pip 安装 Ansible。

```bash
pip install ansible
```

您可以使用[这里的说明](https://learn.hashicorp.com/tutorials/terraform/install-cli)安装 Terraform。

您还需要在本地机器上拥有 Pulsar 的 Terraform 和 Ansible 配置。您可以在 Pulsar 的 [GitHub 仓库](https://github.com/apache/pulsar) 中找到它们，可以使用 Git 命令获取：

```bash
git clone https://github.com/apache/pulsar
cd pulsar/deployment/terraform-ansible/aws
```

## 步骤 2：SSH 设置

> 如果您已经有 SSH 密钥并希望使用它，可以跳过生成 SSH 密钥的步骤，并更新 `ansible.cfg` 文件中的 `private_key_file` 设置和 `terraform.tfvars` 文件中的 `public_key_path` 设置。
>
> 例如，如果您在 `~/.ssh/pulsar_aws` 中已有私有 SSH 密钥，在 `~/.ssh/pulsar_aws.pub` 中有公钥，请按照以下步骤操作：
>
> 1. 使用以下值更新 `ansible.cfg`：

> ```shell
> private_key_file=~/.ssh/pulsar_aws
> ```

>
> 2. 使用以下值更新 `terraform.tfvars`：

> ```shell
> public_key_path=~/.ssh/pulsar_aws.pub
> ```


要使用 Terraform 创建必要的 AWS 资源，您需要创建一个 SSH 密钥。输入以下命令在 `~/.ssh/id_rsa` 中创建私有 SSH 密钥，在 `~/.ssh/id_rsa.pub` 中创建公钥：

```bash
ssh-keygen -t rsa
```

请*不要*输入密码（当提示出现时，改为按 **Enter**）。输入以下命令验证密钥是否已创建：

```bash
ls ~/.ssh
id_rsa               id_rsa.pub
```

## 步骤 3：使用 Terraform 创建 AWS 资源

要开始使用 Terraform 构建 AWS 资源，您需要安装所有 Terraform 依赖项。输入以下命令：

```bash
terraform init
# 这将创建一个 .terraform 文件夹
```

之后，您可以通过输入以下命令应用默认的 Terraform 配置：

```bash
terraform apply
```

然后您会看到下面的提示：

```bash
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value:
```

输入 `yes` 并按 **Enter**。应用配置可能需要几分钟。当配置应用完成时，您可以看到 `Apply complete!` 以及一些其他信息，包括创建的资源数量。

### 应用非默认配置

您可以通过更改 `terraform.tfvars` 文件中的值来应用非默认的 Terraform 配置。以下变量可用：

变量名 | 描述 | 默认值
:-------------|:------------|:-------
`public_key_path` | 您生成的公钥的路径 | `~/.ssh/id_rsa.pub`
`region` | Pulsar 集群运行的 AWS 区域 | `us-west-2`
`availability_zone` | Pulsar 集群运行的 AWS 可用区 | `us-west-2a`
`aws_ami` | 集群使用的 [Amazon Machine Image](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html) (AMI) | `ami-9fa343e7`
`num_zookeeper_nodes` | ZooKeeper 集群中的 [ZooKeeper](https://zookeeper.apache.org) 节点数 | 3
`num_bookie_nodes` | 集群中运行的 Bookie 数量 | 3
`num_broker_nodes` | 集群中运行的 Pulsar broker 数量 | 2
`num_proxy_nodes` | 集群中运行的 Pulsar proxy 数量 | 1
`base_cidr_block` | 网络资产用于集群的根 [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) | `10.0.0.0/16`
`instance_types` | 要使用的 EC2 实例类型。此变量是一个映射，包含两个键：`zookeeper` 用于 ZooKeeper 实例，`bookie` 用于 BookKeeper bookies，`broker` 和 `proxy` 用于 Pulsar brokers 和 bookies | `t2.small` (ZooKeeper)、`i3.xlarge` (BookKeeper) 和 `c5.2xlarge` (Brokers/Proxies)

### 安装了什么

当您运行 Ansible playbook 时，会使用以下 AWS 资源：

* 总共 9 个运行 [ami-9fa343e7](https://access.redhat.com/articles/3135091) Amazon Machine Image (AMI) 的 [Elastic Compute Cloud](https://aws.amazon.com/ec2) (EC2) 实例，该 AMI 运行 [Red Hat Enterprise Linux (RHEL) 7.4](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html-single/7.4_release_notes/index)。默认情况下，这包括：
  * 3 个用于 ZooKeeper 的小型虚拟机 ([t3.small](https://www.ec2instances.info/?selected=t3.small) 实例)
  * 3 个用于 BookKeeper [bookies](reference-terminology.md#bookie) 的大型虚拟机 ([i3.xlarge](https://www.ec2instances.info/?selected=i3.xlarge) 实例)
  * 2 个用于 Pulsar [brokers](reference-terminology.md#broker) 的大型虚拟机 ([c5.2xlarge](https://www.ec2instances.info/?selected=c5.2xlarge) 实例)
  * 1 个用于 Pulsar [proxy](reference-terminology.md) 的大型虚拟机 ([c5.2xlarge](https://www.ec2instances.info/?selected=c5.2xlarge) 实例)
* 一个 EC2 [安全组](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html)
* 一个用于安全的 [虚拟私有云](https://aws.amazon.com/vpc/) (VPC)
* 一个用于从外部世界连接的 [API 网关](https://aws.amazon.com/api-gateway/)
* 一个用于 Pulsar 集群 VPC 的 [路由表](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Route_Tables.html)
* 一个用于 VPC 的 [子网](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Subnets.html)

集群的所有 EC2 实例都在 [us-west-2](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) 区域中运行。

### 获取您的 Pulsar 连接 URL

当您通过输入命令 `terraform apply` 应用 Terraform 配置时，Terraform 会输出 `pulsar_service_url` 的值。该值应该看起来像这样：

```
pulsar://pulsar-elb-1800761694.us-west-2.elb.amazonaws.com:6650
```

您可以随时通过输入命令 `terraform output pulsar_service_url` 或解析 `terraform.tstate` 文件（它是 JSON 格式，尽管文件名没有反映这一点）来获取该值：

```bash
cat terraform.tfstate | jq .modules[0].outputs.pulsar_service_url.value
```

### 销毁您的集群

在任何时候，您都可以使用 Terraform 的 `destroy` 命令销毁与集群关联的所有 AWS 资源：

```bash
terraform destroy
```

## 步骤 4：设置磁盘

在运行 Pulsar playbook 之前，您需要将磁盘挂载到那些 Bookie 节点上的正确目录。由于不同类型的机器具有不同的磁盘布局，在更改 terraform 配置中的 `instance_types` 后，您需要更新 `setup-disk.yaml` 文件中定义的任务。

要在 Bookie 节点上设置磁盘，输入此命令：

```bash
ansible-playbook \
--user='ec2-user' \
--inventory=`which terraform-inventory` \
setup-disk.yaml
```

当使用 Terraform 版本 >= 0.12，并且 `terraform-inventory` 抛出错误："Error reading tfstate file" 时，在 `ansible-playbook` 命令之前添加 `TF_STATE=./`。

```bash
TF_STATE=./ \
ansible-playbook \
--user='ec2-user' \
--inventory=`which terraform-inventory` \
setup-disk.yaml
```

之后，磁盘将作为 journal 磁盘挂载在 `/mnt/journal` 下，作为 ledger 磁盘挂载在 `/mnt/storage` 下。
记住只输入此命令一次。如果您在运行 Pulsar playbook 后再次尝试输入此命令，您的磁盘可能会被再次擦除，导致 bookies 无法启动。

## 步骤 5：运行 Pulsar playbook

一旦您使用 Terraform 创建了必要的 AWS 资源，就可以使用 Ansible 在 Terraform 创建的 EC2 实例上安装和运行 Pulsar。

（可选）如果您想使用任何[内置 IO 连接器](io-connectors.md)，请编辑 `deploy-pulsar.yaml` 文件中的 `Download Pulsar IO packages` 任务，并取消注释您想要使用的连接器。

要运行 playbook，输入此命令：

```bash
ansible-playbook \
--user='ec2-user' \
--inventory=`which terraform-inventory` \
../deploy-pulsar.yaml
```

如果您在除 `~/.ssh/id_rsa` 之外的位置创建了私有 SSH 密钥，可以在以下命令中使用 `--private-key` 标志指定不同的位置：

```bash
ansible-playbook \
--user='ec2-user' \
--inventory=`which terraform-inventory` \
--private-key="~/.ssh/some-non-default-key" \
../deploy-pulsar.yaml
```

## 步骤 6：访问集群

您现在可以使用集群的唯一 Pulsar 连接 URL 访问正在运行的 Pulsar，您可以按照[上面](#fetch-your-pulsar-connection-url)的说明获取该 URL。

有关访问集群的快速演示，我们可以使用 Pulsar 的 Python 客户端和 Python shell。首先，使用 pip 安装 Pulsar Python 模块：

```bash
pip install pulsar-client
```

现在，使用 `python` 命令打开 Python shell：

```bash
python
```

进入 shell 后，输入以下命令：

```python
>>> import pulsar
>>> client = pulsar.Client('pulsar://pulsar-elb-1800761694.us-west-2.elb.amazonaws.com:6650')
# 确保使用您的连接 URL
>>> producer = client.create_producer('persistent://public/default/test-topic')
>>> producer.send('Hello world')
>>> client.close()
```

如果所有这些命令都成功，Pulsar 客户端现在可以使用您的集群！