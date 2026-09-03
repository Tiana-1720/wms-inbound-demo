# 前端页面骨架生成（PDA 移动端）

> **适用场景**：基于加盟揽收仓 **PDA Demo PRD**（`04-05`～`04-07`），在 `front-prototype/` 中生成或**增量更新**移动端扫描作业页原型（分货、上架、装车）。  
> **不要使用** `prompts/前端页面骨架生成.md`（那是管理后台 B 端列表 / 新增 / 详情）。  
> **前置准备**：`03-02` PDA 主 PRD（当前 **V1.4.1**）、对应字段清单、PDA Demo PRD 已与走查报告对齐。

---

## 喂入文件

请让 AI **仅**读取以下文件（防污染）：

| 类别 | 文件 |
| :--- | :--- |
| 项目规范 | `AGENTS.md`、`.cursor/rules/coding-discipline.mdc`（编码任务时） |
| 主 PRD | `prd-docs/01-加盟商揽收仓需求/03-02-加盟商揽收仓PDA主PRD.md` |
| 字段清单 | `02-00`（索引）、`02-01`、`02-02`、`02-03` |
| Demo PRD | `04-05-分货_Demo.md`（**V1.6**）、`04-06-上架_Demo.md`、`04-07-装车_Demo.md`（**V1.2**） |
| 走查/交接（口径核对） | `05-PRD套件交叉走查报告.md`、`06-研发测试交接说明.md` |
| 现有工程 | `front-prototype/` 全目录（**优先复用**，不另起仓库） |

> **禁止读取**：`prd-docs/销售管理/`、`prd-docs/采购管理/`、管理后台 Demo（`04-01`～`04-04`）、`prd-docs/99-历史需求/`（除非主 PRD 已显式引用且仅作现网对照）、`prompts/前端页面骨架生成.md`。

---

## 与后台提示词的差异

| 后台 `前端页面骨架生成.md` | 本 PDA 提示词 |
| :--- | :--- |
| 销售订单列表 / 新增 / 详情 | 分货作业页、上架（入口+作业+明细）、装车（计划列表+作业页） |
| ProLayout 内容区宽表 | **375px** 竖屏作业流；`PdaDeviceFrame` 包裹路由 |
| ProTable / ProForm 为主 | 作业页**禁止** ProTable；卡片 + `ScanInput` + 底部固定栏 |
| shadcn 后台页 | PDA 页用 **antd v5** + 已有 `@/components/pda/*` |
| 菜单：订单管理 | `PDA → 入库管理 → 分货/上架`；`PDA → 出库管理 → 装车` |

---

## 现有工程约定（须复用）

生成或修改代码时**优先扩展**下列结构，不要平行再造一套：

```
front-prototype/src/
├── components/pda/
│   ├── PdaDeviceFrame.tsx    # 375px 预览外框（路由 Outlet）
│   ├── PdaNavBar.tsx         # 顶栏返回+标题
│   ├── PdaBottomBar.tsx      # 底部双按钮区（主按钮 ≥44px）
│   ├── ScanInput.tsx         # 扫枪回车 + 软键盘
│   └── LocationPicker.tsx    # 备货库位 Drawer（上架）
├── domain/
│   ├── pda-sorting/          # 分货规则：logic.ts / types.ts / constants.ts
│   ├── putaway/              # 上架规则
│   └── pda-transfer-load/    # 装车类型
├── mocks/
│   ├── pda-sorting.ts
│   ├── sorting-config.ts     # M/P 分货参数（localStorage）
│   ├── putaway.ts
│   └── pda-transfer-load.ts
├── pages/pda/
│   ├── sorting/SortingPage.tsx
│   ├── putaway/PutawayPage.tsx
│   └── load/LoadPlanListPage.tsx、LoadWorkPage.tsx
├── pages/settings/SortingConfigPage.tsx  # 后台 M/P 维护（非 PDA，但分货依赖）
├── config/routes.ts、menu.ts
└── router/index.tsx          # PDA 路由挂在 <PdaDeviceFrame /> 下
```

**路由常量**（`config/routes.ts`，勿自创路径）：

| 页面 | 路径 |
| :--- | :--- |
| 分货 | `/pda/inbound/sorting` |
| 上架 | `/pda/inbound/putaway` |
| 装车列表 | `/pda/transfer/load` |
| 装车作业 | `/pda/transfer/load/{调拨计划单号}` |
| 分货参数（后台） | `/settings/sorting-config` |

**技术栈**：React 19 + TypeScript + Vite + **Ant Design v5** + `@ant-design/pro-components`（**仅** `ProAppLayout` 外框）。作业页内部不用 ProTable / ProForm 宽表骨架。

---

## 权威源优先级

1. **字段清单** = 字段名、枚举、必填性的唯一来源（Demo 不得新增持久化字段）
2. **03-02 主 PRD** = 状态机、动作矩阵、业务规则（§十二分货、§十一上架、§十三装车）
3. **04-0x Demo PRD** = 页面结构、控件语义、Toast/弹窗文案、显隐（生成物，不得反向改规则）
4. **现有 `domain/*` + `mocks/*`** = 已实现规则优先复用，改规则须同步 domain 与 Demo 口径

冲突时：**主 PRD > Demo PRD > antd 默认范式**。典型：Demo 曾写「状态≠待收货拦截」→ 以主 PRD §12.3/R02 **不校验状态** 为准（04-05 V1.6 已修）。

---

## 提示词

```text
你现在是一个熟悉仓储 PDA 作业、React、TypeScript、Ant Design v5 的前端产品设计助手。

我要在已有 `front-prototype/` 工程中，基于《加盟揽收仓 PDA 主 PRD》、字段清单和 PDA Demo PRD，生成或更新 **移动端** 作业页面原型：分货、上架、装车。

## 总原则

1. **增量更新优先**：先读 `front-prototype/src` 现有实现；能改的不重写；不「顺手」重构无关文件。
2. **规则进 domain，页面做呈现**：大小票/M/P/N、落托分配、绑托校验、装车状态机写在 `domain/` + `mocks/`；页面组件只调 domain 并渲染 Demo 规定的 UI。
3. **Mock 不接真实接口**：数据来自 `mocks/*`；箱号/运单号用 Demo §Mock 规格中的虚构数据。
4. **状态变更只通过动作按钮**（托满、装车、确认上架等），禁止表单直改状态字段。
5. 完成后执行 `npm run build`，修复 TypeScript 错误后再交付。

## 实现要求

### A. 外壳与布局

- 桌面预览：PDA 路由包在 `PdaDeviceFrame`（375px 高容器）内；作业页 `height: 100%` + 纵向 flex（顶栏固定 → 内容滚动 → 底栏固定）。
- 复用 `PdaNavBar`、`PdaBottomBar`（或同等 44px 主按钮样式）。
- **不渲染 disabled 按钮**：不可用时不展示（Demo 规范）。
- 三页视觉对齐：顶栏、白底信息区、灰底卡片列表、底部操作栏。

### B. 控件映射（Demo → 实现）

| Demo 控件 | 实现 |
| :--- | :--- |
| `ScanInput` | `@/components/pda/ScanInput`；扫码后自动校验，无搜索按钮 |
| `ReadonlyText` | 只读文本 / `Typography.Text` |
| `MobileListCard` | antd `Card` 列表卡片 |
| `FixedBottomBar` | `PdaBottomBar` |
| `BottomSheet` + `SelectWithSearch` | `LocationPicker`（Drawer + 可搜列表） |
| 作业托数弹窗 | antd `Modal` + `InputNumber` 1–10 |
| 落托确认弹窗 | antd `Modal`；扫描键等同确认（R46） |

### C. 分货页（`04-05` V1.6 → `SortingPage.tsx`）

权威：主 PRD §十二、§5.1.4；字段来自 `02-01`。

必须实现：

1. **进入**：作业托数 N 弹窗（默认 1，1–10，sessionStorage）；**M/P 未配置**时 Toast「请先配置分货参数」并阻断（读 `mocks/sorting-config.ts`）。
2. **扫描**：不校验收货订单**状态**与仓库（R02/§12.3）；校验箱号存在、未绑托、§12.2 大小票/混托规则。
3. **落托确认**：每次扫码成功后弹窗（格序号、托号、运单号）→ 确认后继续。
4. **作业格**：N 个格子；格内「**托满**」= 确认绑托；**无**底部全局确认绑托栏。
5. **托满校验**：小票混托须每票扫齐全部箱；混托 ≤ P 票；大票不可混托。
6. **不纳入**现网绑托：长按剔除、暂存、剩余≤5 确认、过机顺序带出（§12.5）。
7. **运单信息区**：状态**仅展示**，不用于扫描拦截（S-08）。

Domain：`domain/pda-sorting/logic.ts`（`resolveTargetPalletIndex`、`validatePalletBind`、`SortingParams` 含 M/P）。

### D. 上架页（`04-06` → `PutawayPage.tsx`）

权威：主 PRD §11、§5.3.4；字段来自 `02-03`。

必须实现：

1. 子页 A：扫描进入 **或** 待上架任务卡片（作业单号、运单号、托号、件数、初始库位列保留但值为空）。
2. 子页 B：头信息；**不展示初始库位**；按托卡片 + `LocationPicker`（**仅备货库位**）；未选库位不展示「确认上架」。
3. 子页 C：TAB 全部/已上架/未上架；托号、箱号、库位。
4. 跨库位不一致提醒：按 Demo B.6 / §11.3 #5。

**待确认（F-02，本期待定）**：托级 vs 头部「目标库位」落库口径未定；当前原型可按 Demo **托级选库位**实现，须在代码注释或交付说明中标注「字段落库待产品定稿」，不得当作已定业务规则。

### E. 装车页（`04-07` V1.2 → `LoadPlanListPage` + `LoadWorkPage`）

权威：主 PRD §十三、§5.2.4；字段来自 `02-02`。

必须实现：

1. **列表**：待出库空单调拨卡片；可展示「出库单已复核」标签（调拨仍待出库，可追加装车）。
2. **作业页**：头信息（单号、调出/调入、状态、出库单状态）→ 司机/车牌/电话 → 扫描装车 → 已扫运单行（可左滑删除整票）→ 汇总 → 底部重置 + **装车**。
3. **装车二次确认**：文案含「出库单（已复核），待 PC 确认出库后扣减库存」；成功 Toast「装车成功，待 PC 确认出库」。
4. **状态机**：PDA 装车后调拨仍**待出库**；`confirmDispatch` 不得把调拨改为已出库。
5. **只读**：调拨已出库 / 出库单已出库 → 无扫描区、无底部栏。
6. **不展示**：打印、取消、改仓库、调拨类型。

### F. 菜单与路由

更新 `config/menu.ts`、`config/routes.ts`、`router/index.tsx`（若新增页面）；PDA 菜单挂在 `PDA` 分组下，**不要**与「订单管理」后台列表混用同一页面组件。

### G. 分货参数（后台，分货依赖）

`pages/settings/SortingConfigPage.tsx` 维护 M/P（`03-01` §3.5）；分货页启动前须可读。若尚未实现，须一并补齐。

## 输出要求

完成后输出：

1. **变更文件清单**（路径 + 一句话说明）
2. **路由与菜单**如何注册
3. **每个页面对应的 Demo 章节**与 domain/mock 文件
4. **Demo PRD 优先于 antd 的取舍**（若有）
5. **待产品确认项**（至少 F-02 托级库位、F-08 头部托号；其余见 `02-03` §六）
6. `npm run build` 结果

## 禁止事项

- 不要生成销售订单或后台 `04-01`～`04-04` 页面
- 不要在 PDA 作业页使用 ProTable 宽表
- 不要新增字段清单外的持久化字段
- 不要实现现网绑托页已排除的能力（§12.5）
- 不要把 PDA 装车做成「发车即已出库/扣库存/生调拨入库」旧口径
- 不要读取或套用其他业务线 PRD 案例
```

---

## 页面清单速查（与 Demo 版本对齐）

| 页面 | Demo | 关键增量（相对旧提示词） |
| :--- | :--- | :--- |
| 分货 | `04-05` **V1.6** | 作业托数 N；M/P 配置；N 格+「托满」；落托确认弹窗；**不校验状态**；无底部全局绑托 |
| 上架 | `04-06` V1.1 | 三子页；仅备货库位；F-02 托级库位**待定** |
| 装车 | `04-07` **V1.2** | 术语「装车」；出库单**已复核**+调拨**待出库**；司机信息；可追加装车 |
| 分货参数 | `03-01` §3.5 | 后台 `/settings/sorting-config`，非 PDA 菜单 |

---

## 自检（生成完成后）

| # | 检查项 |
| :--- | :--- |
| 1 | 字段名是否与字段清单一致？ |
| 2 | 按钮是否来自主 PRD 动作矩阵？ |
| 3 | 是否复用了 `components/pda` 与 `domain/*`？ |
| 4 | 分货是否读 M/P、是否去掉状态扫描门禁？ |
| 5 | 装车是否保持「已复核 / 待出库」两步口径？ |
| 6 | `npm run build` 是否通过？ |
| 7 | 是否列出 F-02 等待确认项？ |
