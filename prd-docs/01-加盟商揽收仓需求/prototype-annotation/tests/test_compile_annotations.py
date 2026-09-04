import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "compile_annotations.py"
SCHEMA = Path(__file__).parents[1] / "assets" / "annotation-kit" / "annotation.schema.json"
SPEC = importlib.util.spec_from_file_location("compile_annotations", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")


def config(scope: str = "") -> dict:
    return {
        "version": 1,
        "scope": scope,
        "sourceRequirements": [{"id": "REQ-1", "source": "prd.md#rule"}],
        "annotations": [{
            "id": "1",
            "moduleName": "商品列表",
            "target": {"selector": "[data-anno='product-list']"},
            "sourceRefs": ["REQ-1"],
            "markdown": "## 业务规则\n\n- 支持**查询**。",
        }],
    }


class CompilerTests(unittest.TestCase):
    def test_single_config_remains_supported(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "annotation.config.json"
            write_json(path, config("product"))
            bundle, errors, coverage = MODULE.compile_config(path)
            self.assertEqual(errors, [])
            self.assertEqual(bundle["annotations"][0]["key"], "product:1")
            self.assertEqual(coverage[0]["status"], "mapped")

    def test_workspace_allows_same_display_id_in_different_scopes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_json(root / "product.json", config())
            write_json(root / "purchase.json", config())
            workspace = root / "annotation.workspace.json"
            write_json(workspace, {
                "version": 1,
                "inputs": [
                    {"scope": "product", "config": "product.json"},
                    {"scope": "purchase", "config": "purchase.json"},
                ],
            })
            bundle, errors, _, _ = MODULE.compile_workspace(workspace)
            self.assertEqual(errors, [])
            self.assertEqual([item["id"] for item in bundle["annotations"]], ["1", "1"])
            self.assertEqual({item["key"] for item in bundle["annotations"]}, {"product:1", "purchase:1"})

    def test_duplicate_runtime_key_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "annotation.config.json"
            value = config("product")
            duplicate = dict(value["annotations"][0])
            duplicate.update({"id": "2", "key": "product:1"})
            value["annotations"].append(duplicate)
            write_json(path, value)
            _, errors, _ = MODULE.compile_config(path)
            self.assertIn("duplicate annotation key: product:1", "\n".join(errors))

    def test_html_output_renders_markdown(self):
        rendered = MODULE.html_document({
            "title": "标注",
            "annotations": [{
                "id": "1",
                "key": "product:1",
                "scope": "product",
                "moduleName": "商品列表",
                "markdown": "## 业务规则\n\n- 支持**查询**。",
            }],
        })
        self.assertIn("<h2>业务规则</h2>", rendered)
        self.assertIn("<li>支持<strong>查询</strong>。</li>", rendered)
        self.assertNotIn("## 业务规则", rendered)

    def test_runtime_initial_mode_is_preserved_and_declared(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "annotation.config.json"
            value = config("product")
            value["runtime"] = {"initialMode": "annotate"}
            write_json(path, value)
            bundle, errors, _ = MODULE.compile_config(path)
            self.assertEqual(errors, [])
            self.assertEqual(bundle["runtime"]["initialMode"], "annotate")
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        self.assertEqual(
            schema["properties"]["runtime"]["properties"]["initialMode"]["enum"],
            ["preview", "annotate"],
        )

    def test_display_markdown_keeps_entry_and_change_logic(self):
        markdown = """## 需求描述：【示例】

> 来源：prd.md

### 业务定义（本次增量）

- 仅由上游推送落单。

### 页面模式

- 列表只读。

### 交互规则

- 点击查看跳转详情。

### 字段与状态

| 字段 | 约束 |
| --- | --- |
| 运单号 | 只读 |

### 研发备注

- 挂载点：page-root。
"""
        rendered = MODULE.prepare_display_markdown(markdown, "- 管理后台 → **订单管理 → 收货订单**")
        self.assertIn("### 页面入口", rendered)
        self.assertIn("管理后台 → **订单管理 → 收货订单**", rendered)
        self.assertIn("### 改动逻辑", rendered)
        self.assertIn("仅由上游推送落单", rendered)
        self.assertIn("### 字段与状态", rendered)
        self.assertNotIn("### 业务定义", rendered)
        self.assertNotIn("### 页面模式", rendered)
        self.assertNotIn("### 交互规则", rendered)
        self.assertNotIn("### 研发备注", rendered)
        self.assertNotIn("列表只读", rendered)
        self.assertNotIn("点击查看跳转详情", rendered)
        self.assertNotIn("挂载点：page-root", rendered)
        self.assertEqual(rendered, MODULE.prepare_display_markdown(rendered, "- 管理后台 → **订单管理 → 收货订单**"))

    def test_display_markdown_falls_back_when_business_definition_missing(self):
        rendered = MODULE.prepare_display_markdown(
            "## 需求描述：【新增弹窗】\n\n### 页面模式\n\n- 仅新增，无编辑页。\n",
            "- 列表 → **新增**",
        )
        self.assertIn("### 页面入口", rendered)
        self.assertIn("### 改动逻辑", rendered)
        self.assertIn("仅新增，无编辑页。", rendered)
        self.assertNotIn("### 页面模式", rendered)

    def test_compile_injects_config_page_entry(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "annotation.config.json"
            value = config("product")
            value["pageEntry"] = "- 菜单 → **商品**"
            value["annotations"][0]["markdown"] = "## 需求描述\n\n### 业务定义\n\n- 可查询。\n\n### 研发备注\n\n- 内部实现。"
            write_json(path, value)
            bundle, errors, _ = MODULE.compile_config(path)
            self.assertEqual(errors, [])
            markdown = bundle["annotations"][0]["markdown"]
            self.assertEqual(bundle["annotations"][0]["pageEntry"], "- 菜单 → **商品**")
            self.assertIn("### 页面入口", markdown)
            self.assertIn("### 改动逻辑", markdown)
            self.assertNotIn("### 研发备注", markdown)


if __name__ == "__main__":
    unittest.main()
