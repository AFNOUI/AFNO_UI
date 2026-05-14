# Script to consolidate and clean up documentation files

# Remove old, scattered documentation files
$filesToRemove = @(
    "cli-command-analysis.md",
    "cli-improvements.md",
    "edge-cases-fixed.md",
    "build-registry-guide.md",
    "theme-registry-structure.md",
    "REGISTRY_SCRIPT_ANALYSIS.md"
)

$docsDir = "d:\CODING\PROJECTS\uilab\docs"

# Keep only essential documentation
# These are well-organized and comprehensive
$filesToKeep = @(
    "README.md",
    "CLI-USAGE.md",
    "CONFIGURATION.md",
    "TROUBLESHOOTING.md"
)

Write-Host "Removing old documentation files..."

foreach ($file in $filesToRemove) {
    $filePath = Join-Path $docsDir $file
    
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "  - Removed: $file"
    } else {
        Write-Host "  - Skipped (not found): $file"
    }
}

Write-Host ""
Write-Host "Kept essential documentation:"
foreach ($file in $filesToKeep) {
    Write-Host "  - $file"
}

Write-Host ""
Write-Host "Documentation consolidated!"
Write-Host ""
