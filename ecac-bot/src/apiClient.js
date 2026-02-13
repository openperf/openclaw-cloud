const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { URLSearchParams } = require('url');

class APIClient {
  constructor(baseUrl, botToken) {
    this.baseUrl = (baseUrl || '').replace(/\/+$/, '');
    this.botToken = botToken;
    this._cert_cache_dir = path.join(os.tmpdir(), 'ecac_bot_certs');
    if (!fs.existsSync(this._cert_cache_dir)) fs.mkdirSync(this._cert_cache_dir, { recursive: true });
  }

  async download_certificate(storage_path, empresa_id) {
    try {
      const url = `${this.baseUrl}/certificate?${new URLSearchParams({ path: storage_path, bucket: 'certificados' }).toString()}`;
      const resp = await fetch(url, { headers: { 'x-bot-token': this.botToken }, timeout: 60000 });
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      const data = await resp.json();
      const cert_base64 = data && data.certificate;
      if (!cert_base64) throw new Error('certificate not in response');
      const cert_bytes = Buffer.from(cert_base64, 'base64');
      const local_path = path.join(this._cert_cache_dir, `${empresa_id}.pfx`);
      fs.writeFileSync(local_path, cert_bytes);
      return local_path;
    } catch (e) {
      console.error('[API] download_certificate error', e);
      return null;
    }
  }

  async get_pending() {
    try {
      const url = `${this.baseUrl}/pending`;
      const resp = await fetch(url, { headers: { 'x-bot-token': this.botToken }, timeout: 60000 });
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      const data = await resp.json();
      return data.consultas || [];
    } catch (e) {
      console.error('[API] get_pending error', e);
      return [];
    }
  }

  async send_result(consulta_id, status, result) {
    try {
      const url = `${this.baseUrl}/result`;
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-bot-token': this.botToken }, body: JSON.stringify({ id: consulta_id, status, result }), timeout: 60000 });
      return true;
    } catch (e) {
      console.error('[API] send_result error', e);
      return false;
    }
  }
}

module.exports = APIClient;
