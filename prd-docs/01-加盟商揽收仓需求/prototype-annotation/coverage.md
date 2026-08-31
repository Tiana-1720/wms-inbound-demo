# 页面标注需求覆盖矩阵

| 模块 | 来源需求 | 来源位置 | 页面 | 标注Key | 状态 |
| --- | --- | --- | --- | --- | --- |
| inbound-order | `REQ-INBOUND-PUSH-001` | ../03-加盟商揽收仓管理后台主PRD.md#§5.1 收货订单状态机 | /order/Inbound | `inbound-order:1` | 已挂载 |
| inbound-order | `REQ-INBOUND-PUSH-002` | ../03-加盟商揽收仓管理后台主PRD.md#§6.2 收货订单接收与取消（R05/R06/R11） | /order/Inbound | `inbound-order:1` | 已挂载 |
| inbound-order | `REQ-INBOUND-PUSH-003` | ../02-字段清单/收货订单-入库单字段清单.md#§5.1 状态与动作 | /order/Inbound | `inbound-order:1` | 已挂载 |
| inbound-order | `REQ-INBOUND-PUSH-005` | ../收货订单_Demo_列表页.md#§1.4 工具条 | /order/Inbound | `inbound-order:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-001` | ../03-加盟商揽收仓管理后台主PRD.md#§3.2 调拨计划单（空单调拨增量） | /order/TransferPlan | `transfer-plan:1`, `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-002` | ../03-加盟商揽收仓管理后台主PRD.md#§5.2 空单调拨（沿用现网三态 + 预留已取消） | /order/TransferPlan | `transfer-plan:2` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-003` | ../03-加盟商揽收仓管理后台主PRD.md#§七 权限设计 | /order/TransferPlan | `transfer-plan:1`, `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-004` | ../02-字段清单/调拨计划单字段清单.md#§5.5 列表与权限 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-005` | ../调拨计划_Demo_列表页.md#§1.2 状态 Tab 栏 | /order/TransferPlan | `transfer-plan:2` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-006` | ../调拨计划_Demo_列表页.md#§1.3 查询区 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-007` | ../调拨计划_Demo_列表页.md#§1.4 工具条 | /order/TransferPlan | `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-008` | ../调拨计划_Demo_列表页.md#§1.5 表格 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-009` | ../调拨计划_Demo_列表页.md#§1.6 页面状态与反馈 | /order/TransferPlan | `transfer-plan:1` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-010` | ../03-加盟商揽收仓管理后台主PRD.md#§6.4 空单调拨与集货仓对接（R16） | /order/TransferPlan | `transfer-plan:3` | 已挂载 |
| transfer-plan | `REQ-TP-LIST-011` | ../03-加盟商揽收仓管理后台主PRD.md#§3.4.3 空单调拨下推细则 | /order/TransferPlan | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-001` | ../03-加盟商揽收仓管理后台主PRD.md#§5.2 动作「新增」 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-002` | ../03-加盟商揽收仓管理后台主PRD.md#§3.2 / §6.1 / §6.4（R02/R03/R16） | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-003` | ../02-字段清单/调拨计划单字段清单.md#§一 头部字段 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-004` | ../04-03-调拨计划_Demo_新增页.md#§2.2 弹窗底部操作栏 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-005` | ../04-03-调拨计划_Demo_新增页.md#§2.3 弹窗表单区 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-006` | ../04-03-调拨计划_Demo_新增页.md#§2.4 校验与反馈 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-CREATE-007` | ../03-加盟商揽收仓管理后台主PRD.md#R29 | /order/TransferPlan | `transfer-plan:4` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-001` | ../03-加盟商揽收仓管理后台主PRD.md#§5.2 空单调拨状态机 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-002` | ../03-加盟商揽收仓管理后台主PRD.md#R22 字段锁定 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-003` | ../02-字段清单/调拨计划单字段清单.md#§一～§四 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-004` | ../调拨计划_Demo_详情页.md#§3.2～§3.6 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-005` | ../调拨计划_Demo_详情页.md#§3.7 操作按钮区 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-006` | ../调拨计划_Demo_详情页.md#§3.8 操作日志 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-007` | ../03-加盟商揽收仓管理后台主PRD.md#§二 In Scope 调拨计划详情日志 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
| transfer-plan | `REQ-TP-DETAIL-008` | ../调拨计划_Demo_详情页.md#§3.1 页面概述 | /order/TransferPlan/:id | `transfer-plan:5` | 已挂载 |
