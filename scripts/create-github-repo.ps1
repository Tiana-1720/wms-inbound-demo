param([string]$RepoName = "wms-inbound-demo", [string]$Visibility = "public")

$ErrorActionPreference = "Stop"
$gh = Join-Path $env:LOCALAPPDATA "GitHubCLI\bin\gh.exe"

if ($Visibility -ne "public" -and $Visibility -ne "private") {
    Write-Error "Visibility must be public or private"
}

if (-not (Test-Path $gh)) {
    Write-Error "GitHub CLI not found"
}

& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Login first with token:" -ForegroundColor Yellow
    Write-Host '  "YOUR_TOKEN" | & "$env:LOCALAPPDATA\GitHubCLI\bin\gh.exe" auth login --with-token' -ForegroundColor Cyan
    exit 1
}

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "Creating repo: $RepoName ($Visibility) ..." -ForegroundColor Green

if ($Visibility -eq "public") {
    & $gh repo create $RepoName --public --source=. --remote=origin --push --description "WMS inbound prototype and PRD docs"
} else {
    & $gh repo create $RepoName --private --source=. --remote=origin --push --description "WMS inbound prototype and PRD docs"
}

if ($LASTEXITCODE -eq 0) {
    $url = & $gh repo view --json url -q .url
    $login = & $gh api user -q .login
    Write-Host ""
    Write-Host "Repo created: $url" -ForegroundColor Green
    Write-Host ""
    Write-Host "Enable GitHub Pages:" -ForegroundColor Yellow
    Write-Host "  1. Open $url/settings/pages"
    Write-Host "  2. Source -> GitHub Actions"
    Write-Host "  3. After deploy, visit:"
    Write-Host "     https://$login.github.io/$RepoName/order/Inbound" -ForegroundColor Cyan
}
