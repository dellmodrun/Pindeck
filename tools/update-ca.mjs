import { execFileSync, spawnSync } from 'node:child_process';

const PROJECT_REF = 'snwthyespgghvvlktyyu';
const TABLE = 'pindeck_site_config';
const input = String(process.argv[2] || '').trim();
const isAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input);
const value = input.toLowerCase() === 'tba' ? 'tba' : isAddress ? input : '';

if (!value) {
  console.error('Usage: npm run update:ca -- <Solana address|tba>');
  process.exit(1);
}

const credentialReader = String.raw`
$type=[Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]
$vault=[Windows.Security.Credentials.PasswordVault]::new()
$credential=$vault.Retrieve('Pindeck CA updater vault','pindeck')
$credential.RetrievePassword()
[Console]::Out.Write($credential.Password)`;

let serviceKey = '';
if (process.platform === 'win32') {
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', '-'], {
    input: credentialReader,
    encoding: 'utf8',
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  if (result.status === 0) serviceKey = result.stdout.trim();
}

if (!serviceKey) {
  const args = ['--yes', 'supabase@latest', 'projects', 'api-keys', '--project-ref', PROJECT_REF, '--output', 'json'];
  const options = { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] };
  const raw = process.platform === 'win32'
    ? execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', `npx ${args.join(' ')}`], options)
    : execFileSync('npx', args, options);
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  const keys = JSON.parse(raw.slice(start, end + 1));
  serviceKey = keys.find(key => key.id === 'service_role')?.api_key || '';
}

if (!serviceKey) throw new Error('Supabase service role key is unavailable.');

const response = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/${TABLE}?id=eq.main`, {
  method: 'PATCH',
  headers: {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    'content-type': 'application/json',
    prefer: 'return=minimal'
  },
  body: JSON.stringify({ contract_address: value, updated_at: new Date().toISOString() })
});

if (!response.ok) throw new Error(`Supabase update failed: ${response.status} ${await response.text()}`);
console.log(`Pindeck CA updated: ${value}`);
