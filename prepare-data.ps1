$ErrorActionPreference = "Stop"

param(
  [string]$SourceDataRoot = $env:SATELLITE_PROJECT_DATA_ROOT
)

if (-not $SourceDataRoot) {
  throw "Set SATELLITE_PROJECT_DATA_ROOT or pass -SourceDataRoot with the local folder that contains the GeDaBa Excel exports."
}

$root = $SourceDataRoot
$outDir = Join-Path (Resolve-Path ".") "data"
$outFile = Join-Path $outDir "dashboard-data.json"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem

$metricMapById = @{
  "5" = "farms"
  "9" = "organicFarms"
  "16" = "agriculturalLand"
  "18" = "arableLand"
  "30" = "vineyards"
  "31" = "orchards"
  "45" = "vineyardsByLocation"
  "50" = "organicLand"
  "110" = "erosionFunding"
  "549" = "climateMobilityFunding"
  "550" = "climateFund"
  "700" = "floodProtection"
  "1074" = "vineyards"
  "4110" = "vineyardErosionFunding"
  "4111" = "herbicideAvoidanceFunding"
  "4112" = "insecticideAvoidanceFunding"
  "4308" = "erosionProtection"
  "4316" = "groundwaterProtection"
  "4317" = "soilProtection"
  "4318" = "natureConservation"
  "4319" = "resultsBasedManagement"
  "4323" = "natura2000"
  "4325" = "organicPractice"
  "5212" = "naturalDamageCompensation"
}

function Get-EntryText($zip, [string]$name) {
  $entry = $zip.GetEntry($name)
  if (-not $entry) { return $null }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Get-CellValue($cell, $shared) {
  if (-not $cell) { return $null }
  if ($cell.t -eq "s") {
    $idx = [int]$cell.v
    if ($idx -ge 0 -and $idx -lt $shared.Count) { return $shared[$idx] }
    return $null
  }
  if ($cell.t -eq "inlineStr") { return [string]$cell.is.t }
  return [string]$cell.v
}

function Read-Workbook($path) {
  $leaf = Split-Path $path -Leaf
  if ($leaf -notmatch "^ID\s+(\d+)\s") { return $null }
  $fileId = $Matches[1]
  if (-not $metricMapById.ContainsKey($fileId)) { return $null }
  $key = $metricMapById[$fileId]
  $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
  try {
    [xml]$workbook = Get-EntryText $zip "xl/workbook.xml"
    [xml]$rels = Get-EntryText $zip "xl/_rels/workbook.xml.rels"
    $relMap = @{}
    foreach ($rel in $rels.Relationships.Relationship) { $relMap[$rel.Id] = $rel.Target }

    $shared = New-Object System.Collections.Generic.List[string]
    $sharedXmlText = Get-EntryText $zip "xl/sharedStrings.xml"
    if ($sharedXmlText) {
      [xml]$sharedXml = $sharedXmlText
      foreach ($si in $sharedXml.sst.si) {
        $text = ""
        if ($si.t) { $text += [string]$si.t }
        if ($si.r) { foreach ($run in $si.r) { $text += [string]$run.t } }
        $shared.Add($text)
      }
    }

    $firstSheetTarget = $relMap[$workbook.workbook.sheets.sheet[0].id]
    [xml]$firstSheet = Get-EntryText $zip ("xl/" + ($firstSheetTarget -replace "^/xl/",""))
    $metricCell = @($firstSheet.worksheet.sheetData.row | Where-Object { $_.r -eq "1" })[0].c[0]
    $metric = Get-CellValue $metricCell $shared
    $records = New-Object System.Collections.Generic.List[object]
    foreach ($sheet in $workbook.workbook.sheets.sheet) {
      $sheetName = [string]$sheet.name
      $target = $relMap[$sheet.id]
      [xml]$sheetXml = Get-EntryText $zip ("xl/" + ($target -replace "^/xl/",""))
      $rows = @($sheetXml.worksheet.sheetData.row)
      $yearRow = @($rows | Where-Object { $_.r -eq "2" })[0]
      $yearByColumn = @{}
      foreach ($cell in @($yearRow.c)) {
        $col = ([string]$cell.r) -replace "\d",""
        $year = Get-CellValue $cell $shared
        if ($year -match "^20\d\d$") { $yearByColumn[$col] = [int]$year }
      }
      foreach ($row in @($rows | Where-Object { [int]$_.r -ge 3 })) {
        $code = $null
        $name = $null
        $values = @{}
        foreach ($cell in @($row.c)) {
          $ref = [string]$cell.r
          $col = $ref -replace "\d",""
          $value = Get-CellValue $cell $shared
          if ($col -eq "A") { $code = $value }
          elseif ($col -eq "B") { $name = $value }
          elseif ($yearByColumn.ContainsKey($col)) {
            $number = 0
            if ([double]::TryParse($value, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$number)) {
              $values[[string]$yearByColumn[$col]] = $number
            }
          }
        }
        if ($code -and $name) {
          $records.Add([PSCustomObject]@{
            level = $sheetName
            code = [string]$code
            name = [string]$name
            metric = $key
            values = $values
          }) | Out-Null
        }
      }
    }
    return [PSCustomObject]@{ metric = $key; sourceMetric = $metric; records = $records }
  }
  finally {
    $zip.Dispose()
  }
}

$entities = @{}
$metrics = @{}
$files = Get-ChildItem -LiteralPath $root -Recurse -Filter "*.xlsx"
foreach ($file in $files) {
  $book = Read-Workbook $file.FullName
  if (-not $book) { continue }
  $metrics[$book.metric] = $book.sourceMetric
  foreach ($record in $book.records) {
    $entityKey = "$($record.level)|$($record.code)"
    if (-not $entities.ContainsKey($entityKey)) {
      $entities[$entityKey] = [ordered]@{
        id = $entityKey
        level = $record.level
        code = $record.code
        name = $record.name
        metrics = [ordered]@{}
        latest = [ordered]@{}
      }
    }
    $entities[$entityKey].metrics[$record.metric] = $record.values
    $years = @($record.values.Keys | ForEach-Object { [int]$_ } | Sort-Object)
    if ($years.Count -gt 0) {
      $latestYear = [string]$years[-1]
      $entities[$entityKey].latest[$record.metric] = [ordered]@{
        year = [int]$latestYear
        value = $record.values[$latestYear]
      }
    }
  }
}

function Safe-Divide($a, $b) {
  if (-not $a -or -not $b -or [double]$b -eq 0) { return 0 }
  return [math]::Round(([double]$a / [double]$b) * 100, 1)
}

$entityList = @($entities.Values)
foreach ($entity in $entityList) {
  $latest = $entity.latest
  $farms = if ($latest.farms) { $latest.farms.value } else { 0 }
  $organicFarms = if ($latest.organicFarms) { $latest.organicFarms.value } else { 0 }
  $land = if ($latest.agriculturalLand) { $latest.agriculturalLand.value } else { 0 }
  $organicLand = if ($latest.organicLand) { $latest.organicLand.value } else { 0 }
  $vineyards = if ($latest.vineyards) { $latest.vineyards.value } else { 0 }
  $erosion = if ($latest.erosionProtection) { $latest.erosionProtection.value } else { 0 }
  $nature = if ($latest.natureConservation) { $latest.natureConservation.value } else { 0 }
  $natura = if ($latest.natura2000) { $latest.natura2000.value } else { 0 }
  $soil = if ($latest.soilProtection) { $latest.soilProtection.value } else { 0 }
  $funding = 0
  foreach ($fundKey in @("erosionFunding","naturalDamageCompensation","climateMobilityFunding","climateFund","floodProtection","vineyardErosionFunding","herbicideAvoidanceFunding","insecticideAvoidanceFunding")) {
    if ($latest[$fundKey]) { $funding += [double]$latest[$fundKey].value }
  }
  $sustainabilityRaw = $erosion + $nature + $natura + $soil
  $organicFarmShare = Safe-Divide $organicFarms $farms
  $organicLandShare = Safe-Divide $organicLand $land
  $vineyardIntensity = Safe-Divide $vineyards $land
  $sustainabilityScore = [math]::Min(100, [math]::Round(($organicLandShare * 0.45) + (Safe-Divide $sustainabilityRaw $land * 0.55), 1))
  $fundingSignal = if ($land -gt 0) { [math]::Min(100, [math]::Round(($funding / $land) / 100, 1)) } else { 0 }
  $droughtExposure = [math]::Min(98, [math]::Round((42 + ($vineyardIntensity * 2.8) + ($fundingSignal * 0.35) - ($organicLandShare * 0.18)), 1))
  $waterStress = [math]::Min(98, [math]::Round((36 + ($vineyardIntensity * 2.1) + ($droughtExposure * 0.32)), 1))
  $climateRisk = [math]::Min(99, [math]::Round(($droughtExposure * 0.42) + ($waterStress * 0.28) + ($fundingSignal * 0.16) + ((100 - $sustainabilityScore) * 0.14), 1))
  $entity.derived = [ordered]@{
    organicFarmShare = $organicFarmShare
    organicLandShare = $organicLandShare
    vineyardIntensity = $vineyardIntensity
    sustainabilityScore = $sustainabilityScore
    climateRisk = $climateRisk
    droughtExposure = $droughtExposure
    waterStress = $waterStress
    rainfallDeficit = [math]::Round(18 + ($droughtExposure * 0.56), 1)
    biodiversityParticipation = Safe-Divide ($nature + $natura) $land
    erosionMitigationParticipation = Safe-Divide $erosion $land
    fundingSignal = $fundingSignal
  }
  $compactMetrics = [ordered]@{}
  foreach ($seriesKey in @("agriculturalLand","farms","organicFarms","organicLand","vineyards","erosionProtection")) {
    if ($entity.metrics[$seriesKey]) { $compactMetrics[$seriesKey] = $entity.metrics[$seriesKey] }
  }
  $entity.metrics = $compactMetrics
}

$bundesland = @($entityList | Where-Object { $_.level -eq "Bundesland" } | Sort-Object name)
$municipalities = @($entityList | Where-Object { $_.level -eq "Gemeinde" })
$topMunicipalities = @{
  organic = @($municipalities | Sort-Object { $_.derived.organicFarmShare } -Descending | Select-Object -First 18)
  risk = @($municipalities | Sort-Object { $_.derived.climateRisk } -Descending | Select-Object -First 18)
  vineyards = @($municipalities | Sort-Object { if ($_.latest.vineyards) { $_.latest.vineyards.value } else { 0 } } -Descending | Select-Object -First 18)
  sustainability = @($municipalities | Sort-Object { $_.derived.sustainabilityScore } -Descending | Select-Object -First 18)
}

$payload = [ordered]@{
  generatedAt = (Get-Date).ToString("s")
  source = "Local static GeDaBa export bundle"
  metrics = $metrics
  entities = $entityList
  bundesland = $bundesland
  topMunicipalities = $topMunicipalities
  mapImage = "provided-austrian-agriculture-map"
}

$json = $payload | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($outFile, $json, [System.Text.UTF8Encoding]::new($false))
Write-Host "Wrote $outFile with $($entityList.Count) entities."
