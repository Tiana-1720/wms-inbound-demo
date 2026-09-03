# 页面标注需求覆盖矩阵

| 模块 | 来源需求 | 来源位置 | 页面 | 标注Key | 状态 |
| --- | --- | --- | --- | --- | --- |
| inbound-order | `REQ-INBOUND-PUSH-001` | ../03-01-加盟商揽收仓管理后台主PRD.md#§5.1 收货订单状态机 | /order/Inbound | `inbound-order:1` | 已挂载 |
| inbound-order | `REQ-INBOUND-PUSH-002` | ../03-01-加盟商揽收仓管理后台主PRD.md#§6.2 收货订单接收与取消（R05/R06/R11） | /order/Inbound | `inbound-order:1` | 已挂载 |
| inbound-order | `REQ-INBOUND-PUSH-003` | ../02-01-收货订单-入库单字段清单.md#§5.1 状态与动作 | /order/Inbound | `inbound-order:1` | 已挂载 |
| inbound-order | `REQ-INBOUND-PUSH-005` | ../04-01-收货订单_Demo_列表页.md#§1.4 工具条 | /order/Inbound | `inbound-order:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-001` | ../03-01-加盟商揽收仓管理后台主PRD.md#§3.2 调拨计划单（空单调拨增量） | /order/TransferPlan | `transfer-plan:1`, `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-002` | ../03-01-加盟商揽收仓管理后台主PRD.md#§5.2 调拨计划（沿用现网六态） | /order/TransferPlan | `transfer-plan:2` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-003` | ../03-01-加盟商揽收仓管理后台主PRD.md#§七 权限设计 | /order/TransferPlan | `transfer-plan:1`, `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-004` | ../02-02-调拨计划单字段清单.md#§5.5 列表与权限 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-005` | ../04-02-调拨计划_Demo_列表页.md#§1.2 状态 Tab 栏 | /order/TransferPlan | `transfer-plan:2` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-006` | ../04-02-调拨计划_Demo_列表页.md#§1.3 查询区 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-007` | ../04-02-调拨计划_Demo_列表页.md#§1.4 工具条 | /order/TransferPlan | `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-008` | ../04-02-调拨计划_Demo_列表页.md#§1.5 表格 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-009` | ../04-02-调拨计划_Demo_列表页.md#§1.6 页面状态与反馈 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-010` | ../03-01-加盟商揽收仓管理后台主PRD.md#§6.4 空单调拨与集货仓对接（R16） | /order/TransferPlan | `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-011` | ../03-01-加盟商揽收仓管理后台主PRD.md#§3.4.3 空单调拨下推细则 | /order/TransferPlan | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-001` | ../03-01-加盟商揽收仓管理后台主PRD.md#§5.2 动作「新增」 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-002` | ../03-01-加盟商揽收仓管理后台主PRD.md#§3.2 / §6.1 / §6.4（R02/R03/R16） | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-003` | ../02-02-调拨计划单字段清单.md#§一 头部字段 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-004` | ../04-03-调拨计划_Demo_新增页.md#§2.2 弹窗底部操作栏 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-005` | ../04-03-调拨计划_Demo_新增页.md#§2.3 弹窗表单区 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-006` | ../04-03-调拨计划_Demo_新增页.md#§2.4 校验与反馈 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-007` | ../03-01-加盟商揽收仓管理后台主PRD.md#R29 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-PUSHDOWN-001` | ../03-01-加盟商揽收仓管理后台主PRD.md#§5.2 空单调拨状态机 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-PUSHDOWN-002` | ../03-01-加盟商揽收仓管理后台主PRD.md#R22 字段锁定 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-PUSHDOWN-003` | ../02-02-调拨计划单字段清单.md#§5.4.2 空单调拨 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-001` | ../04-05-分货_Demo.md#§3 进入弹窗（作业托数） | /pda/inbound/sorting | `pda-sorting:1` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-002` | ../04-05-分货_Demo.md#§4 扫描区 | /pda/inbound/sorting | `pda-sorting:2` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-003` | ../03-02-加盟商揽收仓PDA主PRD.md#§十二 分货绑托 | /pda/inbound/sorting | `pda-sorting:1`, `pda-sorting:2`, `pda-sorting:4` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-004` | ../04-05-分货_Demo.md#§6 运单信息区 | /pda/inbound/sorting | `pda-sorting:3` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-005` | ../04-05-分货_Demo.md#§7–§9 作业格与绑托 | /pda/inbound/sorting | `pda-sorting:4` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-006` | ../04-05-分货_Demo.md#§5 落托确认弹窗 | /pda/inbound/sorting | `pda-sorting:5` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-007` | ../02-01-收货订单-入库单字段清单.md#§一、§二 | /pda/inbound/sorting | `pda-sorting:3` | 已挂载 |
| pda-sorting | `REQ-PDA-SORT-MOCK` | ../04-05-分货_Demo.md#§12 Mock 数据规格 | /pda/inbound/sorting | `pda-sorting:A1` | 已挂载 |
| pda-putaway | `REQ-PDA-PUT-001` | ../04-06-上架_Demo.md#子页 A | /pda/inbound/putaway | `pda-putaway:1` | 已挂载 |
| pda-putaway | `REQ-PDA-PUT-002` | ../04-06-上架_Demo.md#子页 B | /pda/inbound/putaway | `pda-putaway:2`, `pda-putaway:3`, `pda-putaway:4` | 已挂载 |
| pda-putaway | `REQ-PDA-PUT-003` | ../04-06-上架_Demo.md#子页 C | /pda/inbound/putaway | `pda-putaway:5` | 已挂载 |
| pda-putaway | `REQ-PDA-PUT-004` | ../03-02-加盟商揽收仓PDA主PRD.md#§十一 上架 | /pda/inbound/putaway | `pda-putaway:1`, `pda-putaway:3`, `pda-putaway:4` | 已挂载 |
| pda-putaway | `REQ-PDA-PUT-005` | ../02-03-上架单字段清单.md | /pda/inbound/putaway | `pda-putaway:2`, `pda-putaway:3` | 已挂载 |
| pda-putaway | `REQ-PDA-PUT-A1` | ../04-06-上架_Demo.md#B.6 跨库位不一致提醒 | /pda/inbound/putaway | `pda-putaway:4` | 已挂载 |
| pda-putaway | `REQ-PDA-PUT-MOCK` | ../04-06-上架_Demo.md#Mock 数据规格 | /pda/inbound/putaway | `pda-putaway:A1` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-LIST-001` | ../04-07-装车_Demo.md#§2.2 装车计划列表卡片 | /pda/transfer/load | `pda-load:1` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-WORK-001` | ../04-07-装车_Demo.md#§2 调拨头信息区 | /pda/transfer/load/:planNo | `pda-load:2` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-WORK-002` | ../04-07-装车_Demo.md#§3 扫描区 | /pda/transfer/load/:planNo | `pda-load:3` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-WORK-003` | ../04-07-装车_Demo.md#§4–§5 明细与汇总 | /pda/transfer/load/:planNo | `pda-load:4` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-WORK-004` | ../04-07-装车_Demo.md#§6 底部固定操作栏 | /pda/transfer/load/:planNo | `pda-load:5`, `pda-load:6` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-WORK-005` | ../04-07-装车_Demo.md#§2.1 司机信息区 | /pda/transfer/load/:planNo | `pda-load:6` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-WORK-006` | ../03-02-加盟商揽收仓PDA主PRD.md#§十三 空单调拨装车 | /pda/transfer/load/:planNo | `pda-load:1`, `pda-load:3`, `pda-load:5` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-WORK-007` | ../02-02-调拨计划单字段清单.md | /pda/transfer/load/:planNo | `pda-load:2`, `pda-load:4` | 已挂载 |
| pda-load | `REQ-PDA-LOAD-MOCK` | ../04-07-装车_Demo.md#§8 Mock 数据规格 | /pda/transfer/load/:planNo | `pda-load:A1` | 已挂载 |
