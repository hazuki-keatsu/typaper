---
title: "Introduction to AI - 13 - Non-classical Reasoning: Reliability Method"
author: Hazuki Keatsu
pubDatetime: 2026-05-30T06:14:38Z
protocol: CC BY-NC
featured: false
draft: false
tags:
  - Introduction to AI
  - Note
description: 人工智能导论课程学习记录
---

## 概述

**可信度方法**是肖特里菲（Shortliffe）等人在确定性理论基础上结合概率论提出的一种不精确推理模型，在专家系统（如MYCIN）中广泛应用。

> 可信度是指人们根据以往经验对某个事物或现象为真的程度的判断，由专家给出规则的可信度，避免对先验概率、条件概率的要求。

---

## 知识的不确定性表示

知识用产生式规则表示：**IF E THEN H (CF(H, E))**

- **CF(H, E)**：可信度因子（Certainty Factor），取值范围 [-1, 1]
  - CF(H,E) > 0：证据为真时对结论H的支持，值越大支持越强
  - CF(H,E) = 0：证据与结论无关
  - CF(H,E) < 0：证据为真时对结论H的反对

### CF的定义

**CF(H,E) = MB(H,E) - MD(H,E)**

- **MB**（信任增长度）：证据对结论有利的程度，MB ∈ [0, 1]
- **MD**（不信任增长度）：证据对结论不利的程度，MD ∈ [0, 1]

### 可信度的性质

1. **互斥性**：MB与MD互斥，当MB>0时MD=0，反之亦然
2. 当且仅当 P(H|E)=1 时，CF(H,E)=1；当且仅当 P(H|E)=0 时，CF(H,E)=-1
3. CF(H,E) + CF(¬H,E) = 0
4. 对于n个互不相容的假设Hi，Σ CF(Hi,E) ≤ 1

---

## 证据不确定性的表示

证据E的不确定性也用可信度因子**CF(E)**表示，取值范围 [-1, 1]：
- CF(E) = 1：证据肯定为真
- CF(E) = -1：证据肯定为假
- CF(E) = 0：对证据一无所知

---

## 组合证据的不确定性

- **合取**（E1 AND E2 AND … AND En）：CF(E) = min{CF(E1), …, CF(En)}
- **析取**（E1 OR E2 OR … OR En）：CF(E) = max{CF(E1), …, CF(En)}

---

## 不确定性的更新

### 传递算法

对于规则 IF E THEN H (CF(H,E))：
**CF(H) = CF(H,E) × max{0, CF(E)}**

> 当CF(E) < 0时，规则不能使用，CF(H) = 0。该模型未考虑E为假时对H的影响。

### 结论不确定性的合成

若多条规则支持同一结论H：

1. 分别计算每条规则的CFi(H) = CF(H,Ei) × max{0, CF(Ei)}
2. 合成公式：
   - 若CF1和CF2同号（均≥0或均<0）：
     CF1,2(H) = CF1(H) + CF2(H) - CF1(H) × CF2(H)
   - 若CF1和CF2异号：
     CF1,2(H) = CF1(H) + CF2(H) + CF1(H) × CF2(H)
     （或直接相加）
