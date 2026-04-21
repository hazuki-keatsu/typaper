---
title: 交叉编译
author: Hazuki Keatsu
pubDatetime: 2026-04-21T13:25:42.510Z
protocol: CC BY-NC-ND
featured: false
draft: false
tags: 
  - openKylin
description: 如何在交叉编译不同内核的 Linux 内核模块代码。
---

## 前言

交叉编译是一种在一个平台上生成另一个平台可执行代码的技术，广泛应用于嵌入式开发和多平台软件开发中。例如最常见的，在 Windows 平台上开发 Android 平台的应用，就是一种十分典型的交叉编译场景。

本文中的交叉编译场景是，在 Linux 主机上开发一个内核模块，并编译到一个由 QEMU 运行的由 Buildroot 构建的极简 Linux 操作系统。

## 环境介绍

主机是一个运行在 VMware Workstation 中的 openKylin 虚拟机：
```plaintext
        #####           hazuki@hazuki-pc 
       #######          ---------------- 
       ##O#O##          OS: openKylin 2.0 SP2 x86_64 
       #######          Host: VMware20,1 None 
     ###########        Kernel: 6.6.0-19-generic 
    #############       Uptime: 5 hours, 36 mins 
   ###############      Packages: 1805 (dpkg) 
   ################     Shell: bash 5.2.21 
  #################     Resolution: 1280x800 
#####################   Terminal: node 
#####################   CPU: Intel i7-14650HX (4) @ 2.419GHz 
  #################     GPU: 00:0f.0 VMware SVGA II Adapter 
                        Memory: 2991MiB / 7886MiB 
```

目标平台是一个运行在 QEMU 中的极简 Linux 系统，由于这个系统没有包管理，就能给大家展示 `uname -a` 的结果了：
```bash
Linux buildroot 6.6.48 #2 SMP PREEMPT_DYNAMIC Sat Sep 13 17:42:28 CST 2025 x86_64 GNU/Linux
```

明显的，两个操作系统的内核版本不同，使用 openKylin 编译出来的代码是无法直接安装在这个精简系统中的。这时候就需要交叉编译了。

## 交叉编译

### 工具准备

首先你需要得到你要编译到的 Linux 系统的内核代码，因为我的场景是编译内核模块，所以通常会需要使用到相应内核提供的工具，我这里直接下载了 `linux-kernel-6.6.48` 的源码的压缩包。

1. 将 linux 内核源码解压出来
```bash
# 进入存放源码压缩包的目录
cd /mnt/hgfs/openkylin_shared/3-stu-ne
# 解压内核代码
# 注意：解压目录不要是 Windows 与 Linux 的共享目录，因为两种目录使用的文件系统不同，会有文件链接问题
mkdir -p ~/tools/linux-kernel-6.6.48
tar -xzvf vm/linux.tar.gz -C ~/tools/linux-kernel-6.6.48
```

2. 准备内核编译环境
```bash
# 进入内核代码目录
cd ~/tools/linux-kernel-6.6.48/linux
# 安装 libelf 开发包 (因为 openKylin 默认没有安装这个工具包)
sudo apt install libelf-dev
# 进行内核编译准备
make modules_prepare
```

3. 编写构建 Makefile
```makefile
# 放在你的内核模块所在的目录
CC=gcc
CFLAGS=-std=c11

ifneq ($(KERNELRELEASE),)
obj-m:=module.o
else
KDIR := ~/tools/linux-kernel-6.6.48/linux/
PWD:=$(shell pwd)

all:
  make -C $(KDIR) M=$(PWD) modules

clean:
	rm -f *.ko *.o *.symvers *.cmd *.cmd.o .*.cmd *.mod *.mod.c *.order

endif
```

4. 编译模块
```bash
# 进入你的模块代码所在的目录
cd /mnt/hgfs/openkylin_shared/3-stu-ne/code
# 编译模块
make all
```

这样你就可以得到目标文件。

### 挂载共享目录

由于这个精简的系统里面什么都没有，所以大家习以为常的各种网络文件传输的方案肯定是不行的。不过，我们可以将整个外部系统的根目录挂载到内部系统的某个目录下实现对文件的读写。

1. 在 QEMU 中挂载当前的系统
```bash
# 启动 QEMU
qemu-system-x86_64 \ <各种你需要的参数>

# 输入 root 用来登录系统
# Welcome to Buildroot
# buildroot login: root

# 创建挂载点
mkdir /mnt/host
# 挂载 Host
mount -t 9p -o trans=virtio host0 /mnt/host
```

2. 进入工作目录并安装内核模块
```bash
# 进入工作目录
cd /mnt/host/mnt/hgfs/openkylin_shared/3-stu-ne/code/
# 安装模块，由于我需要使用 edu 的硬件，所以我还要创建对应的设备节点
insmod edu_dev.ko && mknod /dev/edu c 200 200
```
命令执行的结果：
```bash
[ 2344.720613] edu_dev: loading out-of-tree module taints kernel.
[ 2344.726290] HELLO PCI
[ 2344.726532] chrdev edu dev is insmod, major_dev is 200
[ 2344.727472] executing edu driver probe function!
[ 2344.800838] ACPI: \_SB_.LNKA: Enabled at IRQ 10
[ 2344.801276] Probe succeeds.PCIE ioport addr start at 200000000F, edu_info->ioaddr is 0x0000000014dfb86d.
```

这样外部编译的内核模块就在内部精简系统中安装完成了。

### 额外的内容

顺带讲一下如何卸载模块，对于我的模块而言，我不仅需要卸载模块，还需要删除对应的设备节点：
```bash
rmmod edu_dev
rm -rf /dev/edu
```

如果你完成了你的操作，想退出 QEMU，可以试试下面的快捷键：`Ctrl + a + x`，这组快捷键就是用来退出 QEMU 的。

## 尾声

通过本文的介绍，我们了解了如何在 openKylin 环境下进行交叉编译，并成功将外部编译的内核模块安装到目标系统中。交叉编译不仅是一项重要的开发技能，更是嵌入式开发中不可或缺的工具。

## 附件

以下是本文中使用到的内核模块源文件、测试代码和构建脚本：

1. <a href="/images/cross-compilation/edu_dev.c" download>edu_dev.c</a>
2. <a href="/images/cross-compilation/user_space.c" download>user_space.c</a>
3. <a href="/images/cross-compilation/Makefile" download>Makefile</a>
