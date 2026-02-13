#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Helper Windows para importar PFX e selecionar certificado no popup de autenticação.

Uso (ex.):
  python win_cert_helper.py --pfx C:\temp\123.pfx --pass senha --terms 'Empresa,CPF' --timeout 120

Observações:
- Requer Python + pywinauto instalados no Windows.
  pip install pywinauto python-dotenv
- Este script deve ser executado no host Windows onde o navegador será aberto.
"""

import argparse
import subprocess
import time
import logging
import sys
from pathlib import Path

try:
    from pywinauto import Desktop
    from pywinauto.findwindows import ElementNotFoundError
except Exception:
    print('pywinauto não encontrado. Instale: pip install pywinauto')
    sys.exit(2)

logging.basicConfig(level=logging.INFO, format='[WIN_HELPER] %(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

WINDOW_TITLES = [
    'Segurança do Windows',
    'Windows Security',
    'Autenticação do Cliente',
    'Client Authentication'
]


def import_pfx(pfx_path: Path, password: str) -> bool:
    try:
        if not pfx_path.exists():
            logger.error('PFX não encontrado: %s', pfx_path)
            return False
        cmd = ['certutil', '-f', '-user', '-p', password, '-importpfx', str(pfx_path)]
        logger.info('Executando certutil...')
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        logger.info('certutil stdout: %s', r.stdout)
        logger.info('certutil stderr: %s', r.stderr)
        return r.returncode == 0
    except Exception as e:
        logger.exception('import_pfx falhou: %s', e)
        return False


def aguardar_e_selecionar(match_terms, timeout_sec=120):
    logger.info('Aguardando popup de seleção de certificado por até %ss', timeout_sec)
    start = time.time()
    while (time.time() - start) < timeout_sec:
        try:
            desktop = Desktop(backend='uia')
            for title in WINDOW_TITLES:
                try:
                    dlg = desktop.window(title_re=f'.*{title}.*')
                    if dlg.exists(timeout=1):
                        logger.info('Encontrado diálogo: %s', title)
                        time.sleep(1)
                        try:
                            lists = dlg.descendants(control_type='List')
                            if lists:
                                items = lists[0].children()
                                logger.info('Certificados: %d', len(items))
                                if match_terms:
                                    for item in items:
                                        text = item.window_text()
                                        for term in match_terms:
                                            if term.strip().lower() in text.lower():
                                                logger.info('Match %s => %s', term, text)
                                                try:
                                                    item.click_input()
                                                    time.sleep(0.8)
                                                except Exception:
                                                    pass
                                # tentar clicar OK
                                for ok_text in ('OK', 'Ok', 'Selecionar', 'Selecionar certificado'):
                                    try:
                                        btn = dlg.child_window(title=ok_text, control_type='Button')
                                        if btn.exists():
                                            btn.click()
                                            logger.info('Clicou %s', ok_text)
                                            time.sleep(1)
                                            return True
                                    except Exception:
                                        continue
                                # fallback: ENTER
                                try:
                                    dlg.type_keys('{ENTER}')
                                    time.sleep(1)
                                    return True
                                except Exception:
                                    return False
                        except Exception:
                            logger.exception('Erro ao interagir com diálogo')
                except ElementNotFoundError:
                    continue
        except Exception:
            logger.exception('Erro enumerando desktop')
        time.sleep(1)
    logger.warning('Timeout esperando popup de certificado')
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pfx', help='Caminho para arquivo PFX', required=False)
    ap.add_argument('--pass', dest='pfx_pass', help='Senha do PFX', required=False)
    ap.add_argument('--terms', help='Termos separados por vírgula para localizar certificado', required=False)
    ap.add_argument('--timeout', type=int, default=120)
    args = ap.parse_args()

    terms = []
    if args.terms:
        terms = [t.strip() for t in args.terms.split(',') if t.strip()]

    if args.pfx and args.pfx_pass:
        p = Path(args.pfx)
        ok = import_pfx(p, args.pfx_pass)
        logger.info('Import PFX: %s', ok)
        # small pause
        time.sleep(2)

    ok = aguardar_e_selecionar(terms, timeout_sec=args.timeout)
    if ok:
        logger.info('Seleção concluída')
        sys.exit(0)
    else:
        logger.warning('Seleção falhou/timeout')
        sys.exit(3)


if __name__ == '__main__':
    main()
