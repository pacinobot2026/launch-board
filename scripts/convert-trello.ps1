# Convert Trello data to Launch Board format
$cards = Get-Content "..\trello-aibot-cards-full.json" -Raw | ConvertFrom-Json
$lists = Get-Content ".\data\trello-lists.json" -Raw | ConvertFrom-Json

# Create list map
$listMap = @{}
$lists | ForEach-Object { $listMap[$_.id] = $_.name }

# Group cards by list
$sections = @{}
$cards | ForEach-Object {
    $listId = $_.idList
    $listName = $listMap[$listId]
    if (-not $listName) { $listName = "Unknown" }
    
    if (-not $sections[$listId]) {
        $sections[$listId] = @{
            id = $listId
            name = $listName
            tasks = @()
        }
    }
    
    # Extract checklists
    $checklists = @()
    if ($_.checklists) {
        $_.checklists | ForEach-Object {
            $items = @()
            if ($_.checkItems) {
                $_.checkItems | ForEach-Object {
                    $items += @{
                        name = $_.name
                        completed = ($_.state -eq "complete")
                    }
                }
            }
            $checklists += @{
                name = $_.name
                items = $items
            }
        }
    }
    
    $sections[$listId].tasks += @{
        id = $_.id
        name = $_.name
        description = if ($_.desc) { $_.desc } else { "" }
        url = $_.url
        status = "pending"
        checklists = $checklists
    }
}

# Build launch data
$launch = @{
    id = "aibot-studio"
    name = "AIBot Studio"
    launchDate = "2026-01-27"
    status = "active"
    sections = @($sections.Values)
}

$launchesData = @{ launches = @($launch) }

# Save
$launchesData | ConvertTo-Json -Depth 10 | Out-File -Encoding UTF8 ".\data\launches.json"

Write-Host "✓ Imported $($cards.Count) cards across $($lists.Count) sections" -ForegroundColor Green
Write-Host "✓ Saved to data/launches.json" -ForegroundColor Green
