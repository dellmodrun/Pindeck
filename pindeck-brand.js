(() => {
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

  function applyBrand() {
    document.title = 'Pindeck · A Breakpoint badge, made at home.';
    replaceText(document.body);

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

    for (const button of document.querySelectorAll('button[aria-label*="contract address" i]')) {
      button.disabled = true;
      button.title = 'Contract address to be announced';
      button.setAttribute('aria-label', 'Contract address to be announced');
    }

    const metadata = {
      'meta[name="application-name"]': ['content', 'Pindeck'],
      'meta[property="og:site_name"]': ['content', 'Pindeck'],
      'meta[property="og:title"]': ['content', 'Pindeck · A Breakpoint badge, made at home.'],
      'meta[name="twitter:title"]': ['content', 'Pindeck · A Breakpoint badge, made at home.'],
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
  }

  window.addEventListener('load', () => {
    setTimeout(applyBrand, 1800);
    setTimeout(applyBrand, 3200);
  }, { once: true });
})();
