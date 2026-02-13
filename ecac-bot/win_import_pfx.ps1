param(
  [Parameter(Mandatory=$true)][string]$PfxPath,
  [Parameter(Mandatory=$true)][string]$Password,
  [string]$ChromeProfilePath
)

Write-Host "[PS] Importando PFX: $PfxPath"
if (-not (Test-Path $PfxPath)) {
  Write-Error "Arquivo PFX não encontrado: $PfxPath"
  exit 2
}

# Importa para loja do usuário
$cmd = "certutil -f -user -p `"$Password`" -importpfx `"$PfxPath`""
Write-Host "[PS] Executando: $cmd"
$proc = Start-Process -FilePath certutil -ArgumentList '-f','-user','-p',$Password,'-importpfx',$PfxPath -NoNewWindow -Wait -PassThru -ErrorAction SilentlyContinue
if ($proc.ExitCode -eq 0) {
  Write-Host "[PS] Import OK"
} else {
  Write-Warning "[PS] certutil retornou código: $($proc.ExitCode)"
}

if ($ChromeProfilePath) {
  Write-Host "[PS] Chrome profile path fornecido: $ChromeProfilePath"
  # Apenas informa; import já foi feito na loja do usuário. Dependendo do cenário, pode ser necessário copiar PFX
}

exit 0
