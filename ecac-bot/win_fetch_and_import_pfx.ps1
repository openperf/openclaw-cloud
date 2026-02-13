param(
  [string]$ApiBase,
  [string]$BotToken,
  [Parameter(Mandatory=$true)][string]$StoragePath,
  [string]$Password
)

if (-not $ApiBase) { $ApiBase = $env:API_BASE_URL }
if (-not $BotToken) { $BotToken = $env:BOT_TOKEN }

if (-not $ApiBase) {
  Write-Error "API_BASE_URL não informada (param --ApiBase ou variável de ambiente API_BASE_URL)"
  exit 2
}
if (-not $BotToken) {
  Write-Error "BOT_TOKEN não informado (param --BotToken ou variável de ambiente BOT_TOKEN)"
  exit 2
}

try {
  $encPath = [System.Uri]::EscapeDataString($StoragePath)
  $url = "$ApiBase/certificate?path=$encPath&bucket=certificados"
  Write-Host "[FETCH] GET $url"
  $headers = @{ 'x-bot-token' = $BotToken }
  $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -UseBasicParsing -ErrorAction Stop

  if (-not $resp.certificate) {
    Write-Error "Resposta não contém 'certificate'"
    exit 3
  }

  $certBase64 = $resp.certificate
  $bytes = [System.Convert]::FromBase64String($certBase64)
  $tmp = Join-Path $env:TEMP ("ecac_cert_{0}.pfx" -f ([guid]::NewGuid().ToString()))
  [System.IO.File]::WriteAllBytes($tmp, $bytes)
  Write-Host "[FETCH] Salvo temporário: $tmp"

  # Chamar script de import local
  $importScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'win_import_pfx.ps1'
  if (-not (Test-Path $importScript)) {
    Write-Warning "Import script não encontrado: $importScript — abortando import automático"
    Write-Output $tmp
    exit 0
  }

  Write-Host "[FETCH] Chamando import: $importScript"
  $args = @('-NoProfile','-ExecutionPolicy','Bypass','-File',$importScript,'-PfxPath',$tmp)
  if ($Password) { $args += @('-Password',$Password) }

  $proc = Start-Process -FilePath powershell -ArgumentList $args -NoNewWindow -Wait -PassThru -ErrorAction SilentlyContinue
  Write-Host "[FETCH] import exit code: $($proc.ExitCode)"
  if ($proc.ExitCode -ne 0) {
    Write-Warning "Import script retornou código $($proc.ExitCode)"
  }

  Write-Output $tmp
  exit $proc.ExitCode

} catch {
  Write-Error "Erro ao buscar/importar certificado: $_"
  exit 4
}
