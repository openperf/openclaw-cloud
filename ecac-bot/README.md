# ecac-bot

Pequeno scaffold para automação do e-CAC — apenas um ponto de partida. **Atenção:** use apenas em contas que você tem autorização para acessar.

## 🚀 Instalador Windows (Recomendado para Usuários)

Para usuários finais no **Windows 10/11**, recomenda-se usar o instalador executável que inclui tudo pré-configurado:

1. Baixe [**ecac-windows-installer.exe**](https://github.com/confisped-hub/openclaw-cloud/releases/download/v0.2.0/ecac-windows-installer.exe) da seção [Releases](https://github.com/confisped-hub/openclaw-cloud/releases)
2. Execute o arquivo `.exe` e siga as instruções
   - Ele instalará automaticamente Node.js, Python, e todas as dependências
   - Configurará o diretório de instalação em `C:\Program Files\ECAC-Bot`
3. Após a instalação:
   - Navegue até `C:\Program Files\ECAC-Bot\ecac-bot`
   - Copie `.env.example` para `.env`
   - Preencha `ECAC_USERNAME`, `ECAC_PASSWORD` e `API_BASE_URL` (se usar modo worker)
   - Execute `npm start` ou use o worker conforme descrito abaixo

## Manual de Instalação (Desenvolvedores / Linux/macOS)

Passos rápidos:

1. Copie `.env.example` para `.env` e preencha `ECAC_USERNAME` e `ECAC_PASSWORD`.
2. Instale dependências:

```bash
cd ecac-bot
npm install
npm run install-playwright
```

3. Rodar (recomendado com headful para tratar MFA manualmente):

```bash
# headful (padrão no .env.example)
npm start

# ou em headless
HEADLESS=true npm start
```

Notas importantes:
- Os seletores de login e de alteração de perfil em `src/bot.js` são exemplos. O e-CAC frequentemente muda a interface — ajuste os seletores conforme necessário.
- Não armazene credenciais em repositórios. Use variáveis de ambiente seguras.
- Se houver autenticação multifator (MFA), rode em modo não-headless, autentique manualmente no navegador quando solicitado e pressione Enter no terminal para continuar.

- O bot gera artefatos de depuração na raiz do projeto quando executado: `ecac-login-after-submit.png`, `ecac-login-after-submit.html`, `ecac-after-auth.png`, `ecac-after-profile-click.png`, `ecac-after-confirm.png`. Use estes arquivos para inspecionar elementos e ajustar seletores.
- Para inspecionar a UI e gerar seletores, considere usar o Playwright Codegen:

```bash
npx playwright codegen https://cav.receita.fazenda.gov.br/autenticacao/login
```

Isto abre um navegador interativo e escreve os comandos Playwright conforme você navega — muito útil para extrair seletores reais do e-CAC.

**Helper Windows para certificado**

Há um helper opcional para Windows que tenta importar um PFX e selecionar o certificado no diálogo de autenticação do Windows usando `pywinauto`.

- Arquivo: `win_cert_helper.py`
- Requer Python no Windows e dependência `pywinauto`.
- Uso recomendado: o `worker` (em Windows) inicia automaticamente o helper quando baixa um PFX; o helper aguarda o popup e tenta selecionar o certificado correspondente.

Instalação mínima no Windows:

```powershell
python -m pip install pywinauto
```

Observações:
- Este helper só funciona no Windows e deve ser executado no mesmo host onde o navegador será aberto.
- Se falhar, o `worker` tenta importar o PFX via `certutil` como fallback; em outros sistemas você precisará importar o PFX manualmente.

Import automático (Windows)

1. O `worker` agora tenta executar `win_import_pfx.ps1` para importar o PFX via `certutil` no usuário atual. Em seguida inicia `win_cert_helper.py` para aguardar e selecionar o certificado no diálogo.
2. Requisitos no Windows:

```powershell
# Powershell script usa certutil (builtin) e o helper usa pywinauto
python -m pip install pywinauto
```

3. Se preferir usar um perfil de navegador persistente (útil para evitar diálogos com certificados ou reutilizar sessão), defina `BROWSER_USER_DATA_DIR` no `.env` apontando para uma pasta (ex.: `C:\Users\SeuUsuario\AppData\Local\Google\Chrome\User Data\PlaywrightProfile`). O `bot` abrirá o contexto persistente usando esse diretório.

Exemplo `.env` parcial:

```
API_BASE_URL=https://sua.api
BOT_TOKEN=token
BROWSER_USER_DATA_DIR=C:\Users\SeuUsuario\AppData\Local\Google\Chrome\User Data\PlaywrightProfile
```
