Param(
    [string]$Root = "."
)

$ErrorActionPreference = "Stop"

# Các script core bắt buộc
$coreScripts = @(
    './assets/js/core/i18n.js',
    './assets/js/core/theme.js',
    './assets/js/core/nav.js',
    './assets/js/core/mock-actions.js'
)

# Tạo báo cáo
$report = @()

Get-ChildItem -Path $Root -Filter *.html -File | ForEach-Object {
    $file = $_.FullName
    $name = $_.Name
    $pageId = [System.IO.Path]::GetFileNameWithoutExtension($name).ToLower()
    if ($pageId -eq 'index') { $pageId = 'dashboard' }

    $raw = Get-Content -Raw -Path $file -Encoding UTF8

    $changed = $false

    # 1) Đảm bảo PAGE_ID có và đúng
    $desiredPageLine = "<script>window.__PAGE_ID__ = '$pageId';</script>"
    if ($raw -match 'window\.__PAGE_ID__\s*=\s*''([^'']+)'';') {
        # Thay bằng giá trị chuẩn
        $raw2 = [Regex]::Replace($raw, "window\.__PAGE_ID__\s*=\s*'[^']*';", "window.__PAGE_ID__ = '$pageId';")
        if ($raw2 -ne $raw) { $changed = $true; $raw = $raw2 }
    } else {
        # Chèn trước </body>
        if ($raw -match '</body>') {
            $raw = $raw -replace '</body>', "$desiredPageLine`n</body>"
            $changed = $true
        } else {
            $raw = "$raw`n$desiredPageLine`n"
            $changed = $true
        }
    }

    # 2) Đảm bảo đủ các core scripts (không chèn trùng)
    foreach ($src in $coreScripts) {
        $escaped = [Regex]::Escape($src)
        if ($raw -notmatch "<script\s+src\s*=\s*""$escaped""\s*>\s*</script>") {
            # Chèn SAU dòng PAGE_ID (nếu có), ngược lại chèn trước </body>
            if ($raw -match [Regex]::Escape($desiredPageLine)) {
                $raw = $raw -replace [Regex]::Escape($desiredPageLine), ($desiredPageLine + "`n<script src=""$src""></script>")
            } elseif ($raw -match '</body>') {
                $raw = $raw -replace '</body>', ("<script src=""$src""></script>`n</body>")
            } else {
                $raw = $raw + "`n<script src=""$src""></script>`n"
            }
            $changed = $true
        }
    }

    if ($changed) {
        Copy-Item -Path $file -Destination ($file + ".bak") -Force
        [System.IO.File]::WriteAllText($file, $raw, (New-Object System.Text.UTF8Encoding($false)))
        $report += "UPDATED: $name (PAGE_ID=$pageId)"
    } else {
        $report += "OK: $name (no change)"
    }
}

"==== PATCH REPORT ===="
$report | ForEach-Object { $_ }
"======================"
