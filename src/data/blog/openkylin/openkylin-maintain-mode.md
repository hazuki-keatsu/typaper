---
title: 开启 openKylin 的维护模式
author: Hazuki Keatsu
pubDatetime: 2026-04-21T02:36:48.969Z
protocol: CC BY
featured: false
draft: false
tags:
  - openKylin
description: 介绍了开启 openKylin 系统的维护模式的两种方法。
---

## 前言

在 openKylin 2.0 SP2 中，**维护模式**是一项重要功能，他的目的是在解决不可变系统带来的灵活性限制问题。默认情况下，openKylin 采用不可变系统设计，核心系统为只读状态，无法随意修改或安装软件。这种设计提升了系统的安全性和稳定性，但也限制了用户在需要临时安装软件或修改配置时的操作自由。

维护模式允许用户临时将系统切换为可写状态，从而像传统操作系统一样安装软件或修改配置文件。启用维护模式后，用户可以自由操作。

## 如何启用维护模式

### 1. 临时启用

临时启用很简单，在设置界面连续点击 Logo 5 下就可以进入维护模式，期间会让你输入一次用户密码和登出一次，再次进入就能看到桌面的右下角有着维护模式的 4 个红色的文字了。

![开启维护模式](/images/openkylin-vmware/openkylin-maintain-mode.png)

### 2. 永久开启

如果需要永久开启维护模式，按照以下步骤操作：

```bash
# 开启维护模式
sudo mm-cli -o

# 关闭维护模式
sudo mm-cli -c

# 执行完上面的命令后需要重启系统
sudo reboot

# 补充：可以通过以下命令判断系统是否开启维护模式
mm-cli -s
```

完成上面的步骤后，系统将默认以维护模式启动，允许用户自由修改配置或安装软件。

---

开启维护模式后就能自由安装软件，例如安装 `qemu` 什么的。
```bash
sudo apt install qemu-system
```
