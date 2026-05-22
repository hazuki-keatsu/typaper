---
title: Operating System - 08 - Multiple Processor Systems
author: Hazuki Keatsu
pubDatetime: 2026-05-21T11:08:21.353Z
protocol: CC BY-NC
featured: false
draft: false
tags:
  - OS
description: 操作系统课程学习记录
---

## Multiprocessor Systems

计算机行业一直受无尽的计算能力需求驱动。

提高速度的一种途径是使用大规模并行计算机，常用于重数值计算。另一个相关发展是互联网的惊人快速增长，持续需要更快的计算机。

三种模型：
- 共享内存模型（share memory model）
- 消息传递多计算机（紧耦合，message passing multi computer, tight-coupled）
- 广域分布式系统（松耦合，wide area distributed system, loose-coupled）

![image-20260521130344084](/images/operating-system/image-20260521130344084.png)

---

## 8.1 Multiprocessors

### 共享内存多处理器定义

- 两个或更多CPU共享对公共RAM的完全访问。
- 每个CPU平等访问整个物理内存，可使用LOAD和STORE指令读写单个字。
- 数据速度：10-50纳秒（nsec）。

### 多处理器分类

- **UMA（Uniform Memory Access，统一内存访问）**：每个存储器字的读出速度一样快。

  - UMA Multiprocessors with Bus-Based Architectures（总线架构）

    (a)无缓存 (b)有缓存 (c)有缓存和私有主存

    ![image-20260521135439753](/images/operating-system/image-20260521135439753.png)

  - UMA Multiprocessor Using Crossbar Switches（交叉开关）

    - 优点：非阻塞网络（nonblocking network）。
    - 缺点：交叉点数量按n²增长。

    ![image-20260521135743917](/images/operating-system/image-20260521135743917.png)

  - UMA Multiprocessor Using Multistage Switching Networks（多级交换网络）

    可用2×2开关构建。2×2开关图示，消息格式包含：

    | 内容    | 意义           |
    | ------- | -------------- |
    | Module  | 使用哪个存储器 |
    | Address | 在模块中的地址 |
    | Opcode  | 操作           |
    | Value   | 操作数         |

    ![image-20260521140025145](/images/operating-system/image-20260521140025145.png)

- **NUMA（Nonuniform Memory Access，非统一内存访问）**：远程内存访问比本地慢。

  - 所有CPU可见单一地址空间。
  - 通过LOAD和STORE指令访问远程内存。
  - 远程内存访问比本地内存慢。


### 多处理器操作系统类型（Multiprocessor OS Types）

#### (1) 每个CPU有自己的操作系统

- 静态将内存分为n部分。
- 每个CPU拥有自己的私有内存和私有操作系统副本。
- 每个OS有自己的表，无进程共享，无页面共享，缓冲区缓存不一致。

![image-20260521140610661](/images/operating-system/image-20260521140610661.png)

#### (2) 主从式多处理器（Master-Slave）

- 一份OS及其表位于CPU1上。
- 所有系统调用重定向到CPU1处理。
- 缺点：当CPU很多时，主CPU成为瓶颈。

![image-20260521140624986](/images/operating-system/image-20260521140624986.png)

#### (3) 对称多处理器（Symmetric Multiprocessors）

- 内存中只有一份OS，但任何CPU都可以运行它。
- 为OS关联一个互斥量（锁），使整个系统成为一个大的临界区。

![image-20260521140643034](/images/operating-system/image-20260521140643034.png)

### 多处理器同步（Multiprocessor Synchronization）

- TSL指令若无法锁定总线则会失败。
- 为防止此问题，TSL指令必须首先锁定总线，阻止其他CPU访问，然后完成两次内存访问，最后解锁总线。

![image-20260521140742206](/images/operating-system/image-20260521140742206.png)

### 多处理器调度（Multiprocessor Scheduling）

#### (1) 分时（Timesharing）

- 使用单一数据结构进行多处理器的调度。

#### (2) 空间共享（Space sharing）

- 多个线程同时在多个CPU上运行。

#### (3) 群调度（Gang Scheduling）

- 相关线程组作为一个单元（一个“帮”）调度。
- 所有成员同时运行在不同的分时CPU上。
- 所有组成员同时开始和结束时间片。

---

## 8.2 Multicomputers

### 多计算机定义

- 消息传递多计算机：紧耦合但不共享内存的CPU。
- 也称为集群计算机（cluster computers）、工作站集群（COWs，clusters of workstations）。
- 通过某种高速互连连接。
- 每个内存本地于单个CPU，只能由该CPU访问。
- 数据速度：10-50微秒（μsec）。

### 多计算机硬件（Multicomputer Hardware）

#### 互连拓扑（Interconnection topologies）

![image-20260521141410842](/images/operating-system/image-20260521141410842.png)

- (a) 单开关（single switch）
- (b) 环形（ring）
- (c) 网格（grid）
- (d) 双环面（double torus）
- (e) 立方体（cube）
- (f) 超立方体（hypercube）

#### 交换机制（Switching scheme）

- **存储转发分组交换（store-and-forward packet switching）**
- **电路交换（circuit switching）**：
  - 第一个交换机先建立通过所有交换机到目标交换机的路径。
  - 路径建立后，比特从源到目标连续泵送，中间开关无缓冲。
- **虫孔路由（wormhole routing）**：
  - 将每个数据包分成子包，允许第一个子包甚至在完整路径建立之前就开始流动。

### 低层通信软件（Low-Level Communication Software）

#### (1) 多计算机中的网络接口板

![image-20260521142145085](/images/operating-system/image-20260521142145085.png)

#### (2) 如果节点上多个进程需要网络访问发送数据包…

- 将接口板映射到所有需要它的进程。
- 如果内核需要访问网络，使用两块网络板：一块给用户空间，一块给内核。

#### (3) 节点到网络接口的通信

![image-20260521142504726](/images/operating-system/image-20260521142504726.png)

- 使用发送和接收环（send & receive rings）协调主CPU与板载CPU。

### 用户级通信软件（User Level Communication Software）

#### Send 和 Receive

- 提供的通信服务可简化为两个调用：发送消息和接收消息。
- `Send(dest, &mptr);`
- `Receiver(addr, &mptr)`

#### 阻塞（同步）调用

![image-20260521142547840](/images/operating-system/image-20260521142547840.png)

- (a) 阻塞发送调用（Blocking send call）
- (b) 非阻塞发送调用（Nonblocking send call）

### 远程过程调用（Remote Procedure Call, RPC）

![image-20260521142653869](/images/operating-system/image-20260521142653869.png)

- 远程过程调用的步骤图示，存根（stubs）为灰色阴影。
- 根据计算能力需要，可能在多台边缘服务器（Edge Servers）上部署应用，即分布式应用部署。
- 为了给用户集成的开发环境，让用户感觉在一台计算机上编程，底层多台边缘服务器（Edge Servers）之间需要使用RPC。

#### RPC 选型

三个关键方面：
- 传输协议与数据类型（JSON、XML等）
- 数据的存储、传输效率
- 服务器端对数据的请求方式

常见RPC方案：
- SOAP（基于XML，传输数据过多）
- CORBA（过度设计，过于重量级）
- DCOM（只能用于Windows客户端）

轻量级RPC方案：
- Google开源的Protocol Buffers

  > 题外话：
  >
  > Protocol Buffers更多时候作为一种接口声明语言或者是协议声明语言，常用于服务器和客户端之间约定接口，可被转换为各种技术栈的通信规则，例如Web网页常用的Json格式，gRPC常见的二进制流。

- Facebook开源的Apache Thrift

- Apache Avro

共同特点：有接口描述（IDL）、性能较高、版本控制、基于二进制的数据传输，支持包括C++在内的多种主流语言，可部署在Linux上，定义接口后预编译生成stub函数以供调用。

### 多计算机调度（Multicomputer Scheduling）

#### 负载均衡（Load Balancing）

##### (1) 图论确定性算法（Graph-theoretic deterministic algorithm）

通过优化节点分配逻辑，来降低节点之间的交换数据的负载。

![image-20260521144326711](/images/operating-system/image-20260521144326711.png)

图中，（a）的网络交通是30单位，（b）的网络交通是28单位。

##### (2) 发送者启动的分布式启发算法（Sender-initiated distributed heuristic algorithm）

- 过载的发送者（overloaded sender）

##### (3) 接收者启动的分布式启发算法（Receiver-initiated distributed heuristic algorithm）

- 欠载的接收者（underloaded receiver）

---

## 8.3 Virtualization

### 虚拟化定义

- 虚拟机技术，通常称为虚拟化（virtualization）。
- 允许单台计算机托管多个虚拟机，每个虚拟机可能运行不同的操作系统。

### 虚拟化优势

- 一个虚拟机中的故障不会自动拖垮其他虚拟机。
- 减少物理机数量，节省硬件成本并占用更少空间。
- 检查点和迁移虚拟机比普通机器容易得多。
- 在不再支持或无法在当前硬件上运行的操作系统上运行遗留应用程序。
- 软件开发：确保软件在不同操作系统上正常工作。

### Hypervisor（虚拟机监视器，VMM）

- 在硬件层之上、独立于操作系统的一层软件。
- 创建虚拟化平台，OS实例运行在这个平台上，使硬件可以被多个OS和应用共享。

### Type 1 Hypervisor

虚拟机运行客户操作系统，客户操作系统认为自己处于内核模式（实际上处于用户模式）。这称为**虚拟内核模式（virtual kernel mode）**。

![image-20260521145943383](/images/operating-system/image-20260521145943383.png)

这种虚拟化有两种形式：

#### 真虚拟化

CPU 指令必须执行在Ring 0 底下， VMware 使用Binary Translation方式让虚拟化能够执行在X86的系统上。将原本要执行不能虚拟化的指令，转换语法，然后再交由VMM去执行。例如：Vmware vSphere, Microsoft virtual server

#### 半虚拟化

修改虚拟化作业系统的核心，让虚拟的作业系统可以直接将不能虚拟化的指令自动转换成 VMM可以执行的指令（hypercall），再由VMM去向硬件提出请求（Windows平台不能用）。例如：Xen, KVM, HyperV

![image-20260521150508245](/images/operating-system/image-20260521150508245.png)

**半虚拟化的问题**：

- 如果敏感指令被替换为对hypervisor的调用，操作系统如何在原生硬件上运行？
- 如果市场上有多个hypervisor可用怎么办？

**解决方案**：

- 修改内核：每当需要执行敏感操作时，调用特殊过程。
- 这些过程合起来称为**VMI（Virtual Machine Interface，虚拟机接口）**，形成一个与硬件和hypervisor交互的低层层。

**VMI Linux**：

![image-20260521150957259](/images/operating-system/image-20260521150957259.png)

### Type 2 Hypervisor

- 作为普通用户程序运行在主机操作系统之上。
- 首次启动时，会将操作系统安装到其虚拟磁盘上。
- 示例：VMware Workstation, Parallels, VM VirtualBox
  <img src="/images/operating-system/image-20260521150031780.png" alt="image-20260521150031780" style="zoom: 33%;" />

---

## 8.4 Distributed Systems

### 分布式系统

共享内存多处理器、消息传递多计算机、分布式系统（松耦合）对比表格：

| 项目         | 多处理器   | 多计算机             | 分布式系统                     |
| ------------ | ---------- | -------------------- | ------------------------------ |
| 节点配置     | CPU        | CPU, RAM, 网络接口   | 计算机整机                     |
| 节点外围设备 | 完全共享   | 可能除了硬盘都会共享 | 每个节点都有一套完整的外围配置 |
| 位置         | 相同的机架 | 相同的房间           | 可能是全世界                   |
| 跨节点交流   | 共享内存   | 专用连接             | 传统网络                       |
| 操作系统     | 一个共享的 | 多个相同的           | 可能完全不同                   |
| 文件系统     | 一个共享的 | 一个共享的           | 每个节点有独立的               |
| 管理员       | 一个组织   | 一个组织             | 很多的组织                     |

分布式系统通过使用中间件（middleware）实现一致性。

![image-20260521152030378](/images/operating-system/image-20260521152030378.png)

### 网络硬件（Network Hardware）

#### 以太网（Ethernet）

- (a) 经典以太网（classic Ethernet）
- (b) 交换式以太网（switched Ethernet）

![image-20260521152108517](/images/operating-system/image-20260521152108517.png)

#### 互联网（The Internet）

![image-20260521152126396](/images/operating-system/image-20260521152126396.png)

### 网络服务与协议（Network Services and Protocols）

#### (1) 网络服务（Network Services）

- **面对连接的服务**：先建立通道再传输数据
- **无连接的服务**：每个数据包自己运行
- 两者都能实现可靠和不可靠的传输，只是实现方式不同。面向连接靠会话状态，无连接靠应用层补充机制。

#### (2) 网络协议

- **IP（Internet Protocol）**
- **TCP（Transmission Control Protocol）**
- 数据包头部累积（Accumulation of packet headers）

![image-20260521152622514](/images/operating-system/image-20260521152622514.png)

### 基于文档的中间件（Document-Based Middleware）

#### (1) Web

- 一个有向大图，节点为文档。
- URL：统一资源定位符。
- HTTP：超文本传输协议。

![image-20260521152746030](/images/operating-system/image-20260521152746030.png)

#### (2) 浏览器如何获取页面

- 向DNS请求网站IP地址
- DNS回复IP地址
- 浏览器建立连接
- 发送请求指定页面
- 服务器发送文件
- TCP连接释放
- 浏览器显示文本
- 浏览器获取并显示图像。

### RDMA（Remote Direct Memory Access，远程直接内存访问）

#### 背景

- 分布式计算环境下，多节点之间数据交换需要在应用缓冲、核心缓冲和网卡之间多次拷贝，这是导致传输效率低的主要原因。

#### RDMA定义

- 不需要CPU参与的机制，使本地应用能直接将数据放置到远程主机内存中的零拷贝通信能力，极大改善网络传输中服务器端数据处理的延迟。

#### RDMA工作过程

1. 当应用执行RDMA读或写请求时，不执行任何数据复制。不需要任何内核内存参与，RDMA请求从用户空间中的应用发送到本地网卡（NIC）。
2. NIC读取缓冲内容，通过网络传送到远程NIC。
3. 网络上传输的RDMA信息包含目标虚拟地址、内存钥匙和数据本身。请求完成可以在用户空间处理（轮询用户级完成队列）或通过内核内存处理（应用睡眠直到完成）。
4. 目标NIC确认内存钥匙，直接将数据写入应用缓存中。用于操作的远程虚拟内存地址包含在RDMA信息中。

#### RDMA实现

- 基于InfiniBand或10GbE/40GbE以太网的多处理器板间高速数据传输协议。
- 面向高实时性要求，采用**RDMA on InfiniBand**或**ROCE**（RDMA over Converged Ethernet)实现板间高速数据传输。
- 协议实现中不再调用低效的UDP等协议，而是直接调用符合开放网络联盟（OpenFabrics Alliance）的**Verbs API**接口。
