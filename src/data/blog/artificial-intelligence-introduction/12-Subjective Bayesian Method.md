---
title: "Introduction to AI - 12 - Non-classical Reasoning: Subjective Bayesian Method"
author: Hazuki Keatsu
pubDatetime: 2026-05-30T06:14:37Z
protocol: CC BY-NC
featured: false
draft: false
tags:
  - Introduction to AI
  - Note
description: 人工智能导论课程学习记录
---

## 概述

使用概率推理方法求 P(Hi|E) 需要先验概率 P(Hi) 和条件概率 P(E|Hi)，实际应用中难以做到。Duda 和 Hart 于1976年提出**主观贝叶斯方法**，成功应用于PROSPECTOR专家系统。

---

## 知识不确定性的表示

知识用产生式表示：**IF E THEN (LS, LN) H**

- **LS**（充分性度量）：指出E对H的支持程度，取值范围 [0, +∞)
- **LN**（必要性度量）：指出¬E对H的支持程度，取值范围 [0, +∞)

### 几率函数

O(X) = P(X) / (1 - P(X))，将取值为[0,1]的P(X)放大为取值为[0,+∞)的O(X)。

> 核心公式：O(H|E) = LS × O(H)，O(H|¬E) = LN × O(H)

### LS和LN的含义

| LS值 | 含义 |
| --- | --- |
| LS > 1 | E支持H，LS越大支持越充分 |
| LS = 1 | E对H没有影响 |
| LS < 1 | E不支持H |
| LS = 0 | E的存在使H为假 |

| LN值 | 含义 |
| --- | --- |
| LN > 1 | ¬E支持H |
| LN = 1 | ¬E对H没有影响 |
| LN < 1 | ¬E不支持H，E不存在反对H |
| LN = 0 | E不存在导致H为假 |

### LS和LN的关系

由于E和¬E不会同时支持或同时排斥H，只有三种情况存在：
- LS > 1 且 LN < 1
- LS < 1 且 LN > 1
- LS = LN = 1

---

## 证据不确定性的表示

在主观Bayes方法中，证据E的不确定性用概率或几率表示。若E不可直接观测，用户根据观察S给出**P(E|S)**（动态强度）。

> PROSPECTOR中引入了可信度 C(E|S) 代替 P(E|S)，取整数{-5, …, 5}，通过分段线性插值转换。

---

## 组合证据不确定性的计算

- **合取**（E1 AND E2 AND … AND En）：P(E|S) = min{P(E1|S), …, P(En|S)}
- **析取**（E1 OR E2 OR … OR En）：P(E|S) = max{P(E1|S), …, P(En|S)}

---

## 不确定性的更新

更新过程：根据P(E|S)及LS、LN的值，将H的先验几率O(H)更新为后验几率O(H|S)。

### 核心公式（EH公式）

当证据不确定时：**P(H|S) = P(H|E) × P(E|S) + P(H|¬E) × P(¬E|S)**

分三种情况讨论：
1. **证据E肯定为真**：P(E|S) = 1，O(H|S) = LS × O(H)
2. **证据E肯定为假**：P(E|S) = 0，O(H|S) = LN × O(H)
3. **证据E不确定**：0 < P(E|S) < 1，使用分段线性插值函数

---

## 主观贝叶斯方法的推理过程

1. 初始证据推理时，用户提供C(E|S)，通过CP公式求出P(H|S)
2. 中间结论作为证据时，通过EH公式求出P(H|S)
3. 多条知识支持同一结论H时，合成后验几率：

   O(H|S1,S2,…,Sn) = [O(H|S1)/O(H)] × [O(H|S2)/O(H)] × … × [O(H|Sn)/O(H)] × O(H)

### 优缺点

**优点**：
- 具有坚实的概率论理论基础
- LS及LN由领域专家给出，避免大量数据统计
- 实现了不确定性的逐级传递

**缺点**：
- 要求专家给出H的先验概率P(H)，比较困难
- 贝叶斯定理要求事件间独立，应用受限制
