# 创建 GitHub 仓库并推送（需先完成 gh auth login）
param(
    [string]$RepoName = "wms-inbound-demo",
    [ValidateSet("public", "private")]
    [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"
$gh = "$env:LOCALAPPDATA\GitHubCLI\bin\gh.exe"

if (-not (Test-Path $gh)) {
    Write-Error "未找到 GitHub CLI。请先安装 gh，或重新打开终端后再试。"
}

& $gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "请先登录 GitHub：" -ForegroundColor Yellow
    Write-Host "  & `"$gh`" auth login -h github.com -p https -w" -ForegroundColor Cyan
    exit 1
}

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "创建仓库: $RepoName ($Visibility) ..." -ForegroundColor Green
& $gh repo create $RepoName --$Visibility --source=. --remote=origin --push --description "WMS 加盟商揽收仓需求文档与收货订单原型"

if ($LASTEXITCODE -eq 0) {
    $url = & $gh repo view --json url -q .url
    Write-Host ""
    Write-Host "仓库已创建: $url" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步（启用 GitHub Pages）：" -ForegroundColor Yellow
    Write-Host "  1. 打开 $url/settings/pages"
    Write-Host "  2. Source 选择 GitHub Actions"
    Write-Host "  3. 等待 Actions 部署完成后访问："
    Write-Host "     https://$(& $gh api user -q .login).github.io/$RepoName/order/Inbound" -ForegroundColor Cyan
}
