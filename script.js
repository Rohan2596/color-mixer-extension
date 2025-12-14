document.addEventListener('DOMContentLoaded', () => {
  const color1Input = document.getElementById('color1');
  const color2Input = document.getElementById('color2');
  const hex1Display = document.getElementById('hex1Display');
  const hex2Display = document.getElementById('hex2Display');
  const mixColorsButton = document.getElementById('mixColors');
  const mixedColorBox = document.getElementById('mixedColorBox');
  const mixedColorHex = document.getElementById('mixedColorHex');
  const copyColorBtn = document.getElementById('copyColorBtn'); // New
  const copyTooltip = document.getElementById('copyTooltip');   // New

  // Initial display of hex values
  hex1Display.textContent = color1Input.value.toUpperCase();
  hex2Display.textContent = color2Input.value.toUpperCase();

  // Event listeners for real-time hex display update and immediate mixing
  color1Input.addEventListener('input', () => {
    hex1Display.textContent = color1Input.value.toUpperCase();
    mixColors();
  });
  color2Input.addEventListener('input', () => {
    hex2Display.textContent = color2Input.value.toUpperCase();
    mixColors();
  });

  mixColorsButton.addEventListener('click', mixColors);
  copyColorBtn.addEventListener('click', copyToClipboard); // New event listener

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function mixColors() {
    const hex1 = color1Input.value;
    const hex2 = color2Input.value;

    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    const mixedR = Math.round((rgb1.r + rgb2.r) / 2);
    const mixedG = Math.round((rgb1.g + rgb2.g) / 2);
    const mixedB = Math.round((rgb1.b + rgb2.b) / 2);

    const mixedHex = rgbToHex(mixedR, mixedG, mixedB);

    mixedColorBox.style.backgroundColor = mixedHex;
    mixedColorHex.textContent = mixedHex;
    // Reset copy button state when color changes
    copyColorBtn.classList.remove('copied');
    copyTooltip.textContent = 'Copy to clipboard';
  }

  function copyToClipboard() {
    const textToCopy = mixedColorHex.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Visual feedback for successful copy
      copyColorBtn.classList.add('copied');
      copyTooltip.textContent = 'Copied!';
      setTimeout(() => {
        copyColorBtn.classList.remove('copied');
        copyTooltip.textContent = 'Copy to clipboard';
      }, 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers or if navigator.clipboard isn't available
      // Note: This is less user-friendly in a popup
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom
      textarea.style.left = '-9999px';    // Move off-screen
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'Copied (fallback)!' : 'Failed to copy (fallback).';
        console.log(msg);
        copyTooltip.textContent = msg;
        copyColorBtn.classList.add('copied');
        setTimeout(() => {
          copyColorBtn.classList.remove('copied');
          copyTooltip.textContent = 'Copy to clipboard';
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed: ', err);
        copyTooltip.textContent = 'Copy failed!';
      }
      document.body.removeChild(textarea);
    });
  }

  // Initialize with mixed colors on load
  mixColors();
});