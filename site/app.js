(function () {
  const input = document.getElementById('qr-input');
  const output = document.getElementById('qr-output');
  const empty = document.getElementById('qr-empty');
  const downloadBtn = document.getElementById('download-btn');
  const eclRadios = document.querySelectorAll('input[name="ecl"]');

  const ECL_MAP = { L: QRCode.CorrectLevel.L, M: QRCode.CorrectLevel.M, Q: QRCode.CorrectLevel.Q, H: QRCode.CorrectLevel.H };
  const SIZE = 280;

  let qr = null;
  let debounce = null;

  function getECL() {
    return ECL_MAP[document.querySelector('input[name="ecl"]:checked').value];
  }

  function getCanvas() {
    return output.querySelector('canvas') || output.querySelector('img');
  }

  function generate(text) {
    output.innerHTML = '';
    if (!text) {
      output.style.display = 'none';
      empty.style.display = '';
      downloadBtn.disabled = true;
      qr = null;
      return;
    }
    output.style.display = 'block';
    empty.style.display = 'none';
    qr = new QRCode(output, { text, width: SIZE, height: SIZE, correctLevel: getECL() });
    downloadBtn.disabled = false;
  }

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => generate(input.value.trim()), 300);
  });

  eclRadios.forEach(r => r.addEventListener('change', () => {
    const text = input.value.trim();
    if (text) generate(text);
  }));

  downloadBtn.addEventListener('click', () => {
    const el = getCanvas();
    if (!el) return;
    let url;
    if (el.tagName === 'CANVAS') {
      url = el.toDataURL('image/png');
    } else {
      const c = document.createElement('canvas');
      c.width = SIZE;
      c.height = SIZE;
      c.getContext('2d').drawImage(el, 0, 0, SIZE, SIZE);
      url = c.toDataURL('image/png');
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    a.click();
  });
}());

// PWA install
(function () {
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  const btn = document.getElementById('install-btn');
  let prompt;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    btn.textContent = '⊕ Install';
    btn.hidden = false;
    btn.addEventListener('click', () => alert('Tap the Share icon ⎋, then "Add to Home Screen".'));
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    prompt = e;
    btn.hidden = false;
  });

  window.addEventListener('appinstalled', () => { btn.hidden = true; prompt = null; });

  btn.addEventListener('click', async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') btn.hidden = true;
    prompt = null;
  });
}());
