[Setup]
AppName=ECAC Bot Installer
AppVersion=0.1.0
; Install per-user to avoid requiring Administrator privileges
PrivilegesRequired=lowest
DefaultDirName={userappdata}\ECAC-Bot
DisableProgramGroupPage=yes
OutputBaseFilename=ecac-bot-installer-setup
Compression=lzma
SolidCompression=yes
SourceDir=..\..

[Files]
; Copia todo o diretório ecac-bot para o diretório de instalação
Source: "ecac-bot\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Run]
; Executa o script PowerShell de pós-instalação para instalar dependências
; Run the helper as the original (non-elevated) user so %APPDATA% and env vars point to the launcher
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\win_installer_helper.ps1"""; WorkingDir: "{app}"; Flags: runasoriginaluser
