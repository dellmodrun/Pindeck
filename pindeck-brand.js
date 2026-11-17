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
      style.textContent = 'header a[href="#top"]>svg{display:none}header a[href="#top"]::before{content:"";display:block;width:28px;height:28px;flex:none;border-radius:5px;background:url("/pindeck-logo.png") center/cover no-repeat}';
      document.head.append(style);
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
