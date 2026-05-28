---
title: Operating System - 10 - Linux Case Study
author: Hazuki Keatsu
pubDatetime: 2026-05-28T08:20:21Z
protocol: CC BY-NC
featured: false
draft: false
tags:
  - OS
description: 操作系统课程学习记录
---

## 一、UNIX 与 Linux 历史

**UNICS** → **PDP-11 UNIX** → **Portable UNIX** → **Berkeley UNIX** → **Standard UNIX** → **MINIX** → **Linux**

Linux 受 MINIX 启发，由 Linus Torvalds 开发

---

## 二、UNIX/Linux 设计目标

由程序员设计，为程序员服务

**设计原则**：

- 简单（Simple）
- 精练（Elegant）
- 一致（Consistent）
- 强大（Powerful）
- 灵活（Flexible）

**最小惊讶原则**（principle of least surprise）：如 `ls A*` 和 `rm A*` 行为一致

---

## 三、Linux 系统层次结构

![image-20260528144422455](/images/operating-system/image-20260528144422455.png)

---

## 四、Shell 与实用工具

### Shell
命令行接口，bash 为默认 shell。

### 实用工具分类
- 文件和目录操作命令
- 过滤器（Filters）
- 程序开发工具（编辑器、编译器）
- 文本处理
- 系统管理
- 等等...

> 由POSIX标准要求的实用程序：
> | 程序  | 使用场景                               |
> | ----- | -------------------------------------- |
> | cat   | 将文件中的内容读取到标准输出           |
> | chmod | 改变文件保护模式                       |
> | cp    | 复制文件                               |
> | cut   | 从文件中提取特殊行输出到标准输出中     |
> | grep  | 在一个文件中搜索模式匹配               |
> | head  | 提取一个文件的前几行                   |
> | ls    | 列出一个文件目录                       |
> | make  | 构建工具                               |
> | mkdir | 创建文件目录                           |
> | od    | 将文件内容以不同进制的形式输出         |
> | paste | 将指定的文本行粘贴进文件中             |
> | pr    | 格式文件内容用于输出                   |
> | ps    | 列出正在运行的进程                     |
> | rm    | 删除文件                               |
> | rmdir | 删除文件目录                           |
> | sort  | 将一个文件内的每一行依据字母表顺序整理 |
> | tail  | 提取文件的最后几行                     |
> | tr    | 在不同的字符集中转换                   |

---

## 五、内核结构

![image-20260528145520670](/images/operating-system/image-20260528145520670.png)

---

## 六、Linux 中的进程

### 进程创建
- Linux 是多道程序系统，多个独立进程同时运行

- **`fork()`** 系统调用创建新进程：复制父进程地址空间

- 进程可使用**管道（pipe）** 进行消息传递通信，如 `sort < f | head`

- 进程可使用**信号（signal）** 进行软件中断通信

  ![image-20260528145737072](/images/operating-system/image-20260528145737072.png)

### 主要进程管理系统调用

![image-20260528145824085](/images/operating-system/image-20260528145824085.png)

---

## 七、Linux 调度

Linux 线程是**内核线程**，调度基于线程而非进程。内核线程是Linux的调度的最小单位。

### 三类调度策略
1. **实时 FIFO**：先入先出，不可抢占
2. **实时轮转（Round Robin）**：时间片轮转
3. **分时调度（Timesharing）**：普通进程调度

### 调度数据结构
- **运行队列（runqueue）**：调度器的核心数据结构
- 包含活跃（active）和过期（expired）两个优先级数组
- 时间片用完后从 active 移至 expired，全部完成后交换

![image-20260528150000463](/images/operating-system/image-20260528150000463.png)

---

## 八、Linux 启动过程

1. **BIOS** 执行加电自检（Power-On-Self-TesPOST）和初始设备发现与初始化
2. **MBR** 被读入固定内存位置并执行，加载引导程序
3. **引导程序**（GRUB/LILO）读取引导设备的根目录
4. **引导程序** 读入操作系统内核并跳转到内核入口

---

## 九、Linux 内存管理

### 虚拟地址空间
每个 Linux 进程的地址空间由三个逻辑段组成：

- **正文段（text）**：机器指令，只读
- **数据段（data）**：全局变量、字符串、数组等，分已初始化（.data）和未初始化（.bss）
- **栈段（stack）**：起始于虚拟地址空间顶部附近，向下增长

![image-20260528150409694](/images/operating-system/image-20260528150409694.png)

### 物理内存管理
- **32位系统**：每个进程获得 3GB 虚拟地址空间，剩余 1GB 用于页表和内核数据
- 内核内存驻留在低物理内存中，但映射在每个进程虚拟地址空间的高 1GB

### 内存区域（Memory Zones）
- **ZONE DMA / ZONE DMA32**：可用于 DMA 的页面
- **ZONE NORMAL**：正常映射页面
- **ZONE HIGHMEM**：高内存地址页面，不被永久映射

### 物理内存组成
1. **内核**：固定在内存中，不可换出
2. **内存映射（memory map）**：固定，不可换出
3. **页框池**：分为正文页、数据页、栈页、页表页或位于空闲链表

### 四级分页机制
为使分页在 32 位和 64 位架构上高效运行，Linux 使用**四级分页方案**：
- 页全局目录（Page Global Directory）
- 页上级目录（Page Upper Directory）
- 页中间目录（Page Middle Directory）
- 页表（Page Table）

![image-20260528150636840](/images/operating-system/image-20260528150636840.png)

### 内存分配——伙伴算法（Buddy Algorithm）
Linux 支持动态加载模块（如设备驱动），物理内存管理允许分配任意大小的内存块。

使用**伙伴算法**管理物理内存：将内存按 2 的幂次方大小划分为块，分裂和合并成对进行。

### 虚拟内存区域（VMA）
虚拟地址空间被划分为同质、连续、页对齐的**区域（areas）**，每个区域由具有相同保护和分页属性的连续页面组成。

区域之间可以有空洞（hole），任何对空洞的引用导致致命缺页故障。

页面大小固定（如 Pentium 4KB，Alpha 8KB）。

### 分页机制
进程不必全部在内存中即可运行，只需**用户结构**和**页表**。

- 正文、数据和栈段页面按需动态加载（demand paging）
- 分页由内核和**页守护进程**（page daemon）共同实现

### 页面管理
Linux 尽量保持一些空闲页面，以便按需分配，这一池必须持续补充。

### 四类页面
| 类型 | 说明 |
|------|------|
| **不可回收（Unreclaimable）** | 保留页、锁定页、内核栈等，不可换出 |
| **可交换（Swappable）** | 需写回交换区或分页磁盘分区后才能回收 |
| **可同步（Syncable）** | 标记为脏时需写回磁盘 |
| **可丢弃（Discardable）** | 可立即回收 |

![image-20260528151012312](/images/operating-system/image-20260528151012312.png)

---

## 十、Linux I/O 系统

### 设备即文件
- I/O 设备被抽象为**特殊文件**，使用相同的 `read`/`write` 系统调用访问
- 集成到文件系统中：
  - `/dev/hd1` — 磁盘
  - `/dev/lp` — 打印机（如 `cp file /dev/lp`）
  - `/dev/net` — 网络

### 网络——Socket
**Socket** 是网络通信的关键抽象，每个 socket 支持特定类型的网络通信：

| 类型 | 说明 |
|------|------|
| 可靠面向连接字节流 | TCP（Transmission Control Protocol） |
| 可靠面向连接包流 | — |
| 不可靠包传输 | UDP（User Datagram Protocol） |

TCP 和 UDP 均基于 **IP（Internet Protocol）** 层。

### 设备表与文件操作
主设备表（Major Device Table）管理字符设备。

![image-20260528151204878](/images/operating-system/image-20260528151204878.png)

Linux I/O 系统由文件系统层、通用块层和 I/O 调度层组成。

![image-20260528151242182](/images/operating-system/image-20260528151242182.png)

---

## 十一、Linux 文件系统

### 发展历史
| 文件系统 | 特点 |
|----------|------|
| **MINIX 1** | 文件名最长 14 字符，文件最大 64MB |
| **ext** | 文件名最长 255 字符，文件最大 2GB |
| **ext2** | 长文件名、大文件、更优性能 |
| **VFS** | 虚拟文件系统，支持数十种文件系统 |

### 虚拟文件系统（VFS）
使应用程序与不同文件系统交互，屏蔽本地/远程设备差异。提供四种抽象：超级块（superblock）、索引节点（inode）、目录项（dentry）、文件对象（file）

### 重要目录
常见于大多数 Linux 系统的目录：`/bin`、`/dev`、`/etc`、`/home`、`/lib`、`/proc`、`/tmp`、`/usr`、`/var` 等

### 链接（Linking）
Linux 支持硬链接，多个文件名指向同一 inode。

### 主要文件系统调用
**文件操作**：`open`、`creat`、`read`、`write`、`lseek`、`close`、`stat`、`chmod` 等

**目录操作**：`mkdir`、`rmdir`、`link`、`unlink`、`mount`、`umount`、`chdir` 等

### ext2 文件系统布局
磁盘按块组（block group）组织，每个块组包含：超级块、组描述符、块位图、索引节点位图、索引节点、数据块。

![image-20260528151458136](/images/operating-system/image-20260528151458136.png)

### 文件描述符、打开文件表和 i-node 的关系
**文件描述符表**（每个进程）→ **打开文件描述表**（内核级）→ **i-node 表**（每个文件唯一）

![image-20260528151550624](/images/operating-system/image-20260528151550624.png)

---

## 十二、/proc 文件系统

系统中每个进程都在 `/proc` 下有一个对应目录。

包含的信息：
- 命令行
- 环境变量字符串
- 信号掩码
- ...

---

## 十三、NFS（网络文件系统）

### 设计目标
- 将不同计算机上的文件系统联结为一个逻辑整体
- 允许任意客户端和服务器集合共享共同的文件系统

### NFS 协议
旨在支持**异构系统**，客户端-服务器接口必须明确定义。两个客户端-服务器协议：

1. **挂载协议**（Mounting handle）
2. **目录和文件访问协议**

### NFS 层次结构
![image-20260528151648967](/images/operating-system/image-20260528151648967.png)

---

## 十四、Linux 安全

### 权限模型
- 每个进程携带其所有者的 **UID**（用户ID）和 **GID**（组ID）
- 文件保护模式：`rwx`（读、写、执行）分别对应 owner / group / others

### 安全相关系统调用
![image-20260528151728639](/images/operating-system/image-20260528151728639.png)
