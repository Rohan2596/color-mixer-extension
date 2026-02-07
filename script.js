document.addEventListener('DOMContentLoaded', () => {
  const dom = {
    c1: document.getElementById('color1'),
    c2: document.getElementById('color2'),
    h1: document.getElementById('hex1Display'),
    h2: document.getElementById('hex2Display'),
    box: document.getElementById('mixedColorBox'),
    hex: document.getElementById('mixedColorHex'),
    copy: document.getElementById('copyColorBtn'),
    tip: document.getElementById('copyTooltip'),
    save: document.getElementById('savePalette'),
    grid: document.getElementById('paletteGrid')
  };

  const getRGB = (hex) => {
    const b = parseInt(hex.slice(1), 16);
    return [(b >> 16) & 255, (b >> 8) & 255, b & 255];
  };

  const toHex = (r, g, b) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

  const mix = () => {
    const [r1, g1, b1] = getRGB(dom.c1.value);
    const [r2, g2, b2] = getRGB(dom.c2.value);
    const res = toHex((r1 + r2) >> 1, (g1 + g2) >> 1, (b1 + b2) >> 1);

    dom.h1.textContent = dom.c1.value.toUpperCase();
    dom.h2.textContent = dom.c2.value.toUpperCase();
    dom.box.style.backgroundColor = res;
    dom.hex.textContent = res;
    dom.copy.classList.remove('copied');
    dom.tip.textContent = 'Copy';
  };

  const loadPalette = () => {
    chrome.storage.local.get(['savedColors'], ({ savedColors = [] }) => {
      const fragment = document.createDocumentFragment();
      dom.grid.innerHTML = '';

      savedColors.forEach(color => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.innerHTML = `
          <div class="remove-btn" data-color="${color}">✕</div>
          <div class="swatch" style="background-color: ${color}" data-color="${color}"></div>
          <span class="swatch-hex">${color}</span>
        `;
        fragment.appendChild(item);
      });
      dom.grid.appendChild(fragment);
    });
  };

  dom.c1.oninput = dom.c2.oninput = mix;

  dom.copy.onclick = async () => {
    await navigator.clipboard.writeText(dom.hex.textContent);
    dom.copy.classList.add('copied');
    dom.tip.textContent = 'Copied!';
    setTimeout(() => {
      dom.copy.classList.remove('copied');
      dom.tip.textContent = 'Copy';
    }, 1500);
  };

  dom.save.onclick = () => {
    const val = dom.hex.textContent;
    chrome.storage.local.get(['savedColors'], ({ savedColors = [] }) => {
      if (!savedColors.includes(val)) {
        chrome.storage.local.set({ savedColors: [val, ...savedColors].slice(0, 12) }, () => {
          loadPalette();
          dom.save.textContent = 'Saved!';
          setTimeout(() => dom.save.textContent = 'Add to Palette', 1000);
        });
      }
    });
  };

  // Fixed Event Delegation for Copy & Remove
  dom.grid.onclick = (e) => {
    // Check for Remove button click
    if (e.target.classList.contains('remove-btn')) {
      const colorToDel = e.target.dataset.color;
      chrome.storage.local.get(['savedColors'], ({ savedColors = [] }) => {
        const filtered = savedColors.filter(c => c !== colorToDel);
        chrome.storage.local.set({ savedColors: filtered }, loadPalette);
      });
      return;
    }

    // Check for Swatch click
    const swatch = e.target.closest('.swatch');
    if (swatch) {
      const color = swatch.dataset.color;
      const label = swatch.nextElementSibling;
      navigator.clipboard.writeText(color);
      
      const oldText = label.textContent;
      label.textContent = 'COPIED';
      label.style.color = 'var(--success-color)';
      setTimeout(() => {
        label.textContent = oldText;
        label.style.color = '';
      }, 800);
    }
  };

  mix();
  loadPalette();
});