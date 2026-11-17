(() => {
  const SUPABASE_URL = 'https://snwthyespgghvvlktyyu.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_lok_cbkXwfsPKEpOTTCl4Q_6aqpNf0v';
  const CA_TABLE = 'pindeck_site_config';
  let liveCa = 'tba';
  let liveCaStarted = false;
  let liveCaClient = null;

  const replacements = [
    ['HOMEMADE BADGE', 'PINDECK'],
    ['Homemade Badge', 'Pindeck'],
    ['HOMEBADGE', 'PINDECK'],
    ['BdgruXDnBP4v7MQ7t5475vy9n9FSQyWWMFMz6QZxpump', 'TBA'],
    ['BdgruX..Zxpump', 'TBA'],
    ['Bdgr..pump', 'TBA'],
    ['kairayden', 'pindeckinc'],
    ['homemadebadge.com', 'dellmodrun.github.io/Pindeck'],
    ['pump.fun ↗', 'CA · TBA'],
    ['COPY CA', 'TBA'],
    ['THIS BROWSER', 'DEMO WALLET'],
  ];

  function replaceText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement?.closest('script, style, textarea')) continue;
      let value = node.nodeValue;
      for (const [from, to] of replacements) value = value.replaceAll(from, to);
      if (value !== node.nodeValue) node.nodeValue = value;
    }
  }

  function isSolanaAddress(value) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value || '');
  }

  function normalizeCa(value) {
    value = String(value || '').trim();
    if (isSolanaAddress(value)) return value;
    return value.toLowerCase() === 'tba' ? 'tba' : '';
  }

  function shortCa(value, width) {
    return value.slice(0, width) + '..' + value.slice(-width);
  }

  function renderLiveCa(value) {
    liveCa = normalizeCa(value) || 'tba';
    const copyable = isSolanaAddress(liveCa);
    document.querySelectorAll('a.link[href="#token"]').forEach(link => {
      link.textContent = copyable ? `CA · ${shortCa(liveCa, 4)}` : 'CA · TBA';
    });
    document.querySelectorAll('button[aria-label*="contract address" i], button[data-pindeck-ca]').forEach(button => {
      button.dataset.pindeckCa = 'true';
      button.disabled = !copyable;
      button.title = copyable ? 'Copy the official Pindeck contract address' : 'Contract address to be announced';
      button.setAttribute('aria-label', copyable ? `Pindeck contract address: ${liveCa}` : 'Pindeck contract address is to be announced');

      for (const span of button.querySelectorAll('span')) {
        if (span.classList.contains('label')) {
          span.textContent = 'CA';
        } else if (span.classList.contains('cta-ar')) {
          span.textContent = copyable ? 'COPY CA' : 'TBA';
        } else if (!span.children.length && span.textContent.trim()) {
          if (!copyable) span.textContent = 'TBA';
          else if (span.className.includes('sm:inline')) span.textContent = liveCa;
          else if (span.className.includes('sm:hidden')) span.textContent = shortCa(liveCa, 6);
          else span.textContent = shortCa(liveCa, 4);
        }
      }

      if (button.dataset.pindeckCopyInstalled !== 'true') {
        button.dataset.pindeckCopyInstalled = 'true';
        button.addEventListener('click', async event => {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (!isSolanaAddress(liveCa) || !navigator.clipboard) return;
          try {
            await navigator.clipboard.writeText(liveCa);
            const label = button.querySelector('.label');
            if (label) {
              label.textContent = 'COPIED';
              window.setTimeout(() => { label.textContent = 'CA'; }, 1200);
            }
          } catch {}
        }, true);
      }
    });
  }

  async function fetchLiveCa() {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${CA_TABLE}?id=eq.main&select=contract_address,updated_at`,
        {
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            accept: 'application/json',
            'cache-control': 'no-cache'
          },
          cache: 'no-store'
        }
      );
      if (!response.ok) throw new Error(`CA request returned ${response.status}`);
      const rows = await response.json();
      if (rows && rows[0]) renderLiveCa(rows[0].contract_address);
    } catch (error) {
      console.warn('Pindeck CA could not be refreshed.', error);
    }
  }

  function loadSupabase() {
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-pindeck-supabase]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.supabase), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = '/assets/supabase-js.min.js';
      script.async = true;
      script.dataset.pindeckSupabase = 'true';
      script.onload = () => resolve(window.supabase);
      script.onerror = reject;
      document.head.append(script);
    });
  }

  async function installLiveCa() {
    if (liveCaStarted) return;
    liveCaStarted = true;
    renderLiveCa('tba');
    await fetchLiveCa();
    window.addEventListener('focus', fetchLiveCa);
    window.setInterval(fetchLiveCa, 1000);

    try {
      const library = await loadSupabase();
      liveCaClient = library.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
      liveCaClient
        .channel('pindeck-ca-live')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: CA_TABLE,
          filter: 'id=eq.main'
        }, payload => renderLiveCa(payload.new?.contract_address))
        .subscribe();
    } catch (error) {
      console.warn('Pindeck realtime CA is temporarily unavailable.', error);
    }
  }

  function setGlitchText(element, value) {
    if (!element) return;
    element.textContent = value;
    element.dataset.text = value;
    element.dataset.final = value;
  }

  function applyNarrative() {
    const hero = document.querySelector('.beat-home');
    if (hero) {
      const label = hero.querySelector('.label');
      if (label) label.textContent = "The on-chain handheld terminal from Vice City.";
      const lines = hero.querySelectorAll('h1 .glitch');
      setGlitchText(lines[0], 'Carry the whole city');
      setGlitchText(lines[1], 'in your pocket.');
      const summary = hero.querySelector('p.max-w-\\[46ch\\]');
      if (summary) {
        summary.innerHTML = '<span class="font-bold text-fg">One terminal. <span class="bg-acc px-1 text-black">The whole city.</span></span> Pindeck carries your identity, wallet, missions, markets and city intelligence through Vice City—on Solana.';
      }
    }

    const footer = document.querySelector('footer');
    if (footer) {
      const intro = footer.querySelector('p.text-dim');
      if (intro) intro.textContent = 'One terminal. One wallet. A city in motion.';
      setGlitchText(footer.querySelector('p.glitch'), 'The city, in your pocket.');
      const disclaimer = footer.querySelector('p.max-w-2xl');
      if (disclaimer) {
        disclaimer.textContent = 'Pindeck is an independent, fan-made project and is not affiliated with Rockstar Games, Take-Two Interactive, the Solana Foundation or pump.fun. $PINDECK is a meme coin made for fun; nothing here is financial advice.';
      }
    }
  }

  function applyBrand() {
    document.title = "Pindeck · Vice City's on-chain handheld terminal.";
    replaceText(document.body);
    applyNarrative();

    if (!document.querySelector('#pindeck-brand-style')) {
      const style = document.createElement('style');
      style.id = 'pindeck-brand-style';
      style.textContent = 'header a[href="#top"]>svg{display:none}header a[href="#top"]::before{content:"";display:block;width:28px;height:28px;flex:none;border-radius:5px;background:url("/pindeck-logo.png") center/cover no-repeat}.pindeck-x-link{display:grid;width:28px;height:28px;flex:none;place-items:center;border:1px solid #2a2a2a;color:#f5f5f5;transition:border-color .2s,color .2s}.pindeck-x-link:hover{border-color:#f5f5f5;color:#ffe500}.pindeck-x-link svg{display:block;width:16px;height:16px}';
      document.head.append(style);
    }

    const nav = document.querySelector('header nav');
    if (nav && !nav.querySelector('#pindeck-x-link')) {
      const xLink = document.createElement('a');
      xLink.id = 'pindeck-x-link';
      xLink.className = 'pindeck-x-link';
      xLink.href = 'https://x.com/pindeckinc';
      xLink.target = '_blank';
      xLink.rel = 'noreferrer';
      xLink.title = 'Pindeck on X';
      xLink.setAttribute('aria-label', 'Pindeck on X');
      xLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
      nav.insertBefore(xLink, nav.querySelector('button'));
    }

    for (const link of document.querySelectorAll('a')) {
      if (link.href.includes('x.com/kairayden')) link.href = 'https://x.com/pindeckinc';
      if (link.href.includes('pump.fun/coin/')) {
        link.href = '#token';
        link.removeAttribute('target');
        link.removeAttribute('rel');
      }
    }

    renderLiveCa(liveCa);

    const metadata = {
      'meta[name="application-name"]': ['content', 'Pindeck'],
      'meta[name="description"]': ['content', 'Carry the whole city in your pocket. Pindeck is an on-chain handheld terminal from Vice City, built on Solana.'],
      'meta[property="og:site_name"]': ['content', 'Pindeck'],
      'meta[property="og:title"]': ['content', "Pindeck · Vice City's on-chain handheld terminal."],
      'meta[property="og:description"]': ['content', 'Carry the whole city in your pocket. Built on Solana.'],
      'meta[property="og:url"]': ['content', 'https://dellmodrun.github.io/Pindeck/'],
      'meta[name="twitter:title"]': ['content', "Pindeck · Vice City's on-chain handheld terminal."],
      'meta[name="twitter:description"]': ['content', 'Carry the whole city in your pocket. Built on Solana.'],
      'meta[name="twitter:creator"]': ['content', '@pindeckinc'],
      'meta[property="og:image"]': ['content', 'https://dellmodrun.github.io/Pindeck/pindeck-logo.png'],
      'meta[name="twitter:image"]': ['content', 'https://dellmodrun.github.io/Pindeck/pindeck-logo.png'],
    };
    for (const [selector, [attribute, value]] of Object.entries(metadata)) {
      document.querySelector(selector)?.setAttribute(attribute, value);
    }

    for (const icon of document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')) {
      icon.href = '/pindeck-logo.png';
      icon.type = 'image/png';
    }

    installLiveCa();
    document.documentElement.setAttribute('data-pindeck-ready', '');
  }

  window.addEventListener('load', () => {
    setTimeout(applyBrand, 1800);
    setTimeout(applyBrand, 3200);
  }, { once: true });
})();
