---
title: Operating System - 03 - Process and Thread
author: Hazuki Keatsu
pubDatetime: 2026-05-18T14:32:21.353Z
protocol: CC BY-NC
featured: false
draft: false
tags:
  - OS
description: 操作系统课程学习记录
---

## 一、为什么需要 IPC？
- 进程之间需要进行数据交换、协调活动、避免冲突。
- 三个关键问题：
  - 如何传递信息？
  - 如何避免进程在关键活动中互相干扰？
  - 如何保证正确的执行顺序？

## 二、竞态条件（Race Condition）
- 多个进程同时读写共享数据，最终结果取决于谁在什么时候运行。

---

## 三、临界区与互斥

### 1. 临界区（Critical Region）
- 程序中访问共享内存的那部分代码。

### 2. 互斥的四个条件
1. 不允许两个进程同时进入临界区。
2. 不假定 CPU 数量和速度。
3. 临界区外的进程不应阻塞其他进程。
4. 任何进程不应无限等待进入临界区。

![image-20260517194912609](/images/operating-system/image-20260517194912609.png)

---

## 四、忙等待的互斥实现方案

### 1. 禁止中断 （Disable Interrupts）
- 进入临界区前关中断，离开时开中断。
- 缺点：用户进程不应有开关中断的权限；多 CPU 下无效。
- 适用：内核更新少量变量时临时关中断。

### 2. 锁变量 （Lock Variables）
- 共享一个锁变量（0 表示可进入，1 表示锁定）。
- 问题：与假脱机目录问题类似，仍可能产生竞态。

### 3. 严格轮换法（Strict Alternation）
- 进程交替进入临界区。
- 缺点：一个快速进程必须等待另一个慢速进程。
- 忙等待（busy waiting） → 这种锁称为**自旋锁（spin lock）**。

### 4. Peterson 解法（Peterson's Solution）
- 软件实现互斥，无需硬件支持。

```c
#define FALSE 0
#define TRUE  1
#define N     2  					// number of process

int turn;							// Whose turn is it?
int interested[N];					// All values initially 0 (FALSE)

void enter_region(int process) {	// Process is 0 or 1?
    int other;						// Number of the other process
    
    other = 1 - process;			// The opposite of process
    interested[process] = TRUE;		// Show that you are interested
    turn = process;					// set flag
    while (turn == process && interested[other] == TRUE);
}

void leave_region(int process) {
    interested[process] = FALSE;
}
```

### 5. TSL 指令（Test and Set Lock）
- 硬件支持的原子操作：读取锁变量并设置为非零值。
- 解决忙等待的互斥问题。

```assembly
enter_region:
	TSL REGISTER, LOCK
	CMP REGISTER, #0
	JNE enter_region
	RET
leave_region:
	MOVE LOCK, #0
	RET
```

---

## 五、睡眠与唤醒（避免忙等待）

### 1. 问题背景
- 忙等待浪费 CPU 时间，可能造成**优先级反转**（低优先级进程无法退出临界区）。

### 2. sleep / wakeup 原语
- 进程阻塞（sleep）直到被唤醒（wakeup）。
- **生产者-消费者问题**中的竞态：唤醒信号可能丢失。
- 解决方案：增加“唤醒等待位”。

---

## 六、信号量（Semaphore）

### 1. 定义
- 整数变量 S，用于记录可用的唤醒次数。
- 只能通过两个原子操作访问：
  - **P(S)**（down）：若 S ≤ 0 则阻塞，否则 S--。
  - **V(S)**（up）：S++，并唤醒等待进程。

### 2. PV 操作的含义
- **P(S)**：S = S - 1；若 S ≥ 0 继续，否则进入等待队列。
- **V(S)**：S = S + 1；若 S > 0 继续，否则唤醒一个等待进程。

### 3. 信号量的值
- S > 0：可用资源数量。
- S < 0：绝对值表示等待进程个数。
- 初始值 = 1 → 互斥锁（Mutex）。

### 5. Linux 中的信号量
- 支持内核信号量、POSIX 信号量、System V 信号量。
- 不同实现中信号量计数是否允许低于 0 是细节差异。
- 多数实际使用中，信号量初始化为 1 作为互斥锁（mutex）。

---

## 七、互斥锁（Mutex）

- 信号量的简化版，只有两种状态：**锁定** 和 **解锁**。
- 适用于用户空间线程包。
- `mutex_lock` 失败时调用 `thread_yield` 让出 CPU，**不忙等待**。

---

## 八、管程（Monitor）

- 一种高级同步构造，将共享变量、过程和数据结构封装在一起。
- **特性**：同一时刻只有一个进程能处于管程中。
- **缺点**：C/Pascal 等语言不支持；不适用于分布式或多 CPU 私有内存系统。

---

## 九、消息传递（Message Passing）

- 通过 `send` 和 `receive` 原语通信。
- 设计问题：确认消息、序列号、命名、身份验证等。

---

## 十、屏障（Barrier）

- 用于**进程组**同步：所有进程到达屏障后才能继续。
