---
title: Coq/Rocq Introduction - 1 - Installing
author: Hazuki Keatsu
pubDatetime: 2026-03-04T17:34:31Z
featured: true
draft: false
protocol: CC BY
tags:
  - Coq/Rocq
description:
  Brief introduction to the world of Coq/Rocq Prover.
---

> 本来想着，要不要这篇文章使用英文来书写，但是考虑到中文互联网上的关于 Coq 的资料实在是太少了，所以还是用中文写吧。

本系列的帖子主要是 Hazuki 自己学习和使用 Coq 证明器相关的经验，供大家参考。

本系列的内容依据书籍 [Software Foundations](https://softwarefoundations.cis.upenn.edu/) 编写。本书是免费图书，您可以直接观看电子版，或者花一点小钱购买它的纸质版。

## 动机

在软件开发和数学证明中，错误是不可避免的。传统的测试方法虽然能够发现许多问题，但无法保证程序或证明的绝对正确性。而 Coq 提供了一种形式化验证的工具，能够通过数学逻辑严格证明程序的正确性。

以下是使用 Coq 的几个主要理由：

1. **形式化验证**：Coq 使用强大的类型系统和逻辑推导规则，确保每一步推导都是正确的，从而保证最终结果的可靠性。
2. **高可靠性**：Coq 的形式化证明能够显著降低由于错误带来的风险。
3. **学习逻辑与数学**：通过使用 Coq，用户能够深入理解逻辑推导和数学证明的本质，这对学习者和研究者来说是非常宝贵的。
4. **支持交互式证明**：Coq 提供了交互式的证明环境，用户可以一步步构建和检查自己的证明过程。
5. **广泛的应用领域**：从编程语言理论到硬件验证，Coq 已经被广泛应用于多个领域，展示了其强大的通用性。

不过归根结底，我学习 Coq 并不是因为上面这些理由，而是学术界的一种趋势。随着 Coq 的逐渐发展成熟，慢慢地学术界更加相信这种通过计算机证明出来的命题。如果是传统的手工证明，审稿人是很难判断论文中的证明是否正确的，相比之下，使用计算机证明出来的命题，只要是代码能够正常运行，那结果一定就是正确的。这种证明形式极大地降低了论文审稿人的审稿压力，所以审稿人青睐这种证明是有道理的。

## 如何安装 Coq

因为我是 Windows用户，所以我主要介绍如何通过 WSL 安装 Coq，并将其集成到 VS Code 中。如果是 Linux 和 MacOS，那会更加简单。

### 1. 安装 WSL

1. 打开 PowerShell，输入以下命令以启用 WSL：
   ```powershell
   wsl --install
   ```
   这将安装默认的 Ubuntu 发行版。如果你已经安装了 WSL，可以通过以下命令更新到最新版本：
   ```powershell
   wsl --update
   ```
2. 安装完成后，重启计算机。
3. 打开 Ubuntu，完成初始设置。

### 2. 在 WSL 中安装 Coq

推荐使用 Opam 这个包管理器来安装 Coq，这个包管理器是 OCaml 语言的包管理，而且与系统隔离，所以十分推荐使用。

1. 安装 `opam`：
   ```bash
   sudo apt install opam
   ```

2. 初始化 `opam` 环境：
   ```bash
   opam init
   eval $(opam env)
   ```

3. 安装 Coq 并固定版本，以免误更新：
   ```bash
   opam pin add rocq-prover $VERSION
   ```

4. 验证安装是否成功：
   ```bash
   coqc --version
   ```
   如果输出了 Coq 的版本号，则说明安装成功。

通过 `opam`，你还可以轻松安装 Coq 的其他插件或特定版本。例如：
```bash
opam install coqide  # 安装 Coq 的图形界面
opam install coq-mathcomp-algebra  # 安装数学组件库
```

### 3. 使用 VsRocq 插件

`VsRocq` 是一个专为 Coq 和 Rocq 用户设计的 VS Code 插件，提供了更丰富的功能支持。以下是使用 `VsRocq` 的方法：

1. 安装 `VsRocq` 插件和 Coq 语法服务器：
   - 打开 VS Code，进入扩展市场，搜索并安装 **VsRocq** 插件。
   - 在终端中输入以下命令安装语法服务器。
      ```bash
      opam install vsrocq-language-server
      ```
   - 通过命令 `which vsrocqtop` 得到语法服务器的命令路径，然后复制这个路径填入 `VsRocq` 插件中的 `vsrocq.path` 配置项.

2. 使用 `VsRocq` 的功能：
   - **交互式证明**：在编辑器中打开 `.v` 文件，`VsRocq` 会自动加载交互式证明环境。
   - **语法高亮**：插件会为 Coq 和 Rocq 提供语法高亮功能，提升代码可读性。
   - **错误提示**：在编写代码时，`VsRocq` 会实时提示语法错误或证明问题。

3. 验证插件是否正常工作：
   - 创建一个简单的 Coq 文件（如 `example.v`）：
     ```coq
     Theorem add_0_r : forall n : nat, n + 0 = n.
     Proof.
       intros n. simpl. reflexivity.
     Qed.
     ```
   - 打开文件，确保 `VsRocq` 能正确加载并交互式运行证明。

这样你就完成了 Coq 的安装和配置，你已经完成了成功的一大半了，加油。

---

> 参考文档：
> 1. [Software Foundations](https://softwarefoundations.cis.upenn.edu/)
> 2. [Installing the Rocq Prover and its packages](https://rocq-prover.org/docs/using-opam)
> 3. [VsRocq Vscode Extension Market](https://marketplace.visualstudio.com/items?itemName=rocq-prover.vsrocq)
