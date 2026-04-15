---
title: 如何在Vmware中使用openKylin操作系统
author: Hazuki Keatsu
pubDatetime: 2026-04-15T09:25:34.685Z
protocol: CC BY-NC-ND
featured: false
draft: false
tags:
  - OS
description: 介绍了在试用openKylin操作系统时的各种问题的解决方法，引导大家安装并使用openKylin。
---

## 前言

首先，你有可能觉得 openKylin 很难用，甚至比一些常见的 Linux，例如 Ubuntu，都更难用。这很正常，因为这个系统就不是给大家日常使用，它主要面向的还是信创市场，和满足各种机构的对系统安全的需求。本身的目标就不是好用。

所以，不要怀疑自己，也没有必要非要把这个万一弄得透彻，因为这个东西本身就对你的作用不大，真的想学习操作系统，可以尝试自己修改和编译 Linux 内核，而不是折腾这个玩意。

## 下载并安装 VMware Workstation

VMware Workstation 是一款功能强大的桌面虚拟化软件，它的优势在于对各种硬件和系统架构的兼容性，这也就是比较推荐 VM 而不是 Virtual Box 的原因。以下是下载和安装的步骤：

### 1. 官网下载

这个下载方式极其麻烦。别问，问就是：

1. 官网找不到下载按钮
2. 下载要注册
3. 下载前要看极其长的协议
4. 免费产品和付费产品在不同的地方下载
5. 在眼花缭乱的免费产品中找到 VM

有决心的同学，可以试试在官网下载。

### 2. 网盘下载

随便找个知乎的帖子，你就能找到网盘链接，下就完事。但是主要防范恶意软件。

> VMware Workstation 从 17 开始就是转为免费软件了，目前能下载到的是 25H2 和 17 两个版本。我下载的是 25H2，但是我比较推荐 17，因为它有汉化。

## 虚拟机配置和引导安装

这块没什么特别要说的，正常安装系统的流程，配置完虚拟机，从 ISO 镜像启动安装即可。

配置的时候注意：
1. 内存最好分 8GB 及以上，核心数量最好 4 核及以上，硬盘空间最好 70GB 及以上，其中系统文件要划出 60GB 
2. 开启 3D 图形加速会相对流畅点，显存默认 8GB

## 安装 vm-tools 相关工具

这块应该是最复杂的地方，不过我选了一个简单的路径给大家操作。

### 1. 进入维护模式

默认状态下，openKylin 是禁用了 dpkg 这样的软件包安装工具的，也就是不允许安装第三方应用，所以你需要进入维护模式，这样你才能使用 apt 来安装各种常见的软件包。

![开启维护模式](/images/openkylin-vmware/openkylin-maintain-mode.png)

然后输入以下命令安装所需软件。

```bash
# 更新软件源和软件包
sudo apt update && sudo apt upgrade -y

# 安装相应的虚拟机工具
sudo apt install open-vm-tools open-vm-tools-desktop fuse3
```

### 2. 开启共享文件夹

由于 openKylin 本身的 DNS 解析有问题，这会导致用户根本无法使用这个操作系统上网，所以我推荐使用共享文件的方式来解决这个问题。

> 不是不可以通过修复 openKylin 的 DNS 解析来实现上网，太麻烦了，不建议大家这样做。想做的可以看看以下思路：
> 修复 DNS 解析错误，可先通过 `ping` 公网 IP、`nslookup` 测试网络与 DNS 连通性，再检查并修改 `/etc/resolv.conf` 添加可用公共 DNS，确认 `/etc/nsswitch.conf` 中 hosts 配置为 files dns 保证解析顺序，排查防火墙是否放行 UDP 53 端口，最后清理 DNS 缓存、重启网络或解析服务，完成后验证域名解析是否恢复正常即可。
> 其中，由于系统为**不可更改系统**，所以每次开机，上面的配置可能会重置，所以你还需要，在 `/etc/NetworkManager/conf.d/90-dns-none.conf` 中添加 `[main] dns=none`，然后 `sudo systemctl reload NetworkManager`。

先在虚拟机管理中开启文件夹共享。

![开启共享文件夹](/images/openkylin-vmware/enable-shared-folders.png)

然后在 openKylin 这边手动挂载目录就行。

```bash
# 创建目标目录
sudo mkdir -p /mnt/hgfs

# 手动挂载目录
sudo vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other
```

完成这些步骤之后，你就可以在 `/mnt/hgfs` 中找到你挂载到 openKylin 的文件夹了。

现在还有一个问题，每次重启之后，系统并不会自动帮你挂载共享文件夹，所以你可能需要每次都手动挂载一遍。这是因为，openKylin 是不可变 Linux 系统（即 Linux LIVE-CD 是不可变的），你没办法通过修改启动设置，让操作系统自动帮你挂载共享文件夹，想解决这个问题，有以下几种思路：

#### 使用脚本快速挂载

既然无法自动挂载，那我们可以写一个快捷脚本，每次开机后一键执行：

```bash
# 创建挂载脚本
sudo tee ~/mount-shared.sh > /dev/null << 'EOF'
#!/bin/bash
sudo vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other -o uid=1000 -o gid=1000
EOF

# 赋予执行权限
sudo chmod +x ~/mount-shared.sh
```

之后每次开机只需在终端运行：
```bash
~/mount-shared.sh
```

#### 使用 systemd 用户服务（进阶）

可以尝试创建一个 systemd 用户级服务来自动挂载：

```bash
# 创建用户服务目录
mkdir -p ~/.config/systemd/user

# 创建服务文件
tee ~/.config/systemd/user/mount-hgfs.service > /dev/null << 'EOF'
[Unit]
Description=VMware Shared Folders
After=graphical-session.target

[Service]
Type=oneshot
ExecStart=~/mount-shared.sh
RemainAfterExit=yes

[Install]
WantedBy=default.target
EOF

# 启用服务
systemctl --user daemon-reload
systemctl --user enable mount-hgfs.service
```

#### 使用别名简化操作

还有一种简单的方式是设置一个命令别名：

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
echo 'alias share="sudo mkdir -p /mnt/hgfs && sudo vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other"' >> ~/.bashrc
source ~/.bashrc
```

之后每次开机只需输入 `share` 即可快速挂载。

---

由于 openKylin 的不可变特性，自动挂载确实比较麻烦。最实用的方案是第一个，创建一个一键挂载脚本，配合桌面快捷方式或终端别名，可以最大程度简化操作流程。

> 如何确认系统是否是不可变的：
> 输入 `sudo ostree admin status` 来确认，有返回就说明系统为不可变系统。
> ![OSTree](/images/openkylin-vmware/ostree.png)

## 尾声

写到这里，相信你已经对如何在 VMware 中安装和使用 openKylin 有了一个基本的了解。

回顾整个过程，你会发现 openKylin 确实不是一个“开箱即用”的系统。从下载 VMware 的繁琐步骤，到安装后的共享文件夹挂载问题，再到系统本身的不可变性带来的各种限制。这些都印证了我们开头说的那句话：**这个系统就不是给大家日常使用的**。

如果你想找一个好用的 Linux 发行版，我的建议是：**试试 Ubuntu 或者 Fedora**，这两个操作系统是亲测好用的，它们会更让你省心。

只是为了做一下课程的实验的话，那没办法，使用 openKylin 是硬性要求，毕竟你的实验内容可能会依赖于部分 openKylin 魔改的系统调用。

**感谢你的阅读。**
