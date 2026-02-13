[Setup]
AppName=ECAC Bot Installer
AppVersion=0.1.0
DefaultDirName={pf}\ECAC-Bot
DisableProgramGroupPage=yes
OutputBaseFilename=ecac-bot-installer-setup
Compression=lzma
SolidCompression=yes

[Files]
; Copia todo o diretório ecac-bot para o diretório de instalação
Source: "{#SourcePath}\..\ecac-bot\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Run]
; Executa o script PowerShell de pós-instalação como administrador para baixar dependências
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\win_installer_helper.ps1"""; WorkingDir: "{app}"; Flags: runascurrentuser

[Code]
function SourcePath(Param: string): string;
begin
  Result := ExpandConstant('{srcexe}');
end;
