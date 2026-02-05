const $ = (id) => document.getElementById(id);

const ladderDiagram = {
  rungs: [
    { contacts: [{ device: 'R10015', type: 'NO' }], coil: { op: 'OUT', device: 'MR28009' } },
    { contacts: [{ device: 'R10015', type: 'NC' }], coil: { op: 'OUT', device: 'MR28010' } }
  ]
};

async function api(path, payload) {
  const response = await fetch(path, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? 'APIエラー');
  return data;
}

function config() {
  return {
    profile: $('profile').value,
    bitContactNotation: $('notation').value,
    allowContactOmission: true,
    bitDeviceUpperBound: 50000,
    wordDeviceUpperBound: 4096
  };
}

function renderRungSelector() {
  $('selectedRung').innerHTML = ladderDiagram.rungs
    .map((_, i) => `<option value="${i}">行 ${String(i + 1).padStart(4, '0')}</option>`)
    .join('');
}

function rungToText(rung) {
  const lines = [];
  if (rung.contacts.length === 0) return lines;
  lines.push(`${rung.contacts[0].type === 'NC' ? 'LDN' : 'LD'} ${rung.contacts[0].device}`);
  for (let i = 1; i < rung.contacts.length; i += 1) {
    const c = rung.contacts[i];
    lines.push(`${c.type === 'NC' ? 'LDN' : 'LD'} ${c.device}`);
  }
  if (rung.coil) {
    const coil = rung.coil;
    if (coil.op === 'TON' || coil.op === 'CTU') {
      lines.push(`${coil.op} ${coil.device} ${coil.preset ?? 0}`);
    } else {
      lines.push(`${coil.op} ${coil.device}`);
    }
  }
  return lines;
}

function renderToText() {
  const lines = ladderDiagram.rungs.flatMap(rungToText);
  $('ladderSource').value = lines.join('\n');
  refreshLadderPreview();
}

function renderLadderCanvas() {
  const html = ladderDiagram.rungs
    .map((rung, i) => {
      const contacts = rung.contacts
        .map((c) => `<div class="contact ${c.type === 'NC' ? 'nc' : ''}"><span class="contact-label">${c.device}</span></div>`)
        .join('');
      const coilText = rung.coil ? `${rung.coil.op} ${rung.coil.device}` : '---';
      return `<div class="rung-row"><div class="rung-no">${String(i + 1).padStart(4, '0')}</div><div class="rung-line">${contacts}</div><div class="coil">${coilText}</div></div>`;
    })
    .join('');
  $('ladderCanvas').innerHTML = html;
}

function refreshLadderPreview() {
  const html = $('ladderSource').value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [op, ...rest] = line.split(/\s+/);
      return `<div class="rung"><span class="idx">${String(i + 1).padStart(2, '0')}</span><span class="op">${op ?? ''}</span><span class="arg">${rest.join(' ')}</span></div>`;
    })
    .join('');
  $('ladderPreview').innerHTML = html || '<div class="rung"><span class="idx">--</span><span class="op">EMPTY</span><span class="arg">命令を追加してください</span></div>';
}

function syncCoilPresetVisibility() {
  const op = $('coilOp').value;
  $('coilPresetWrap').style.display = op === 'TON' || op === 'CTU' ? 'grid' : 'none';
}

async function loadMeta() {
  const meta = await api('/api/meta');
  $('category').innerHTML = meta.categories.map((c) => `<option>${c}</option>`).join('');
  $('board').innerHTML = meta.boards.map((b) => `<option value="${b.id}">${b.id} (${b.category})</option>`).join('');
}

$('addRung').addEventListener('click', () => {
  ladderDiagram.rungs.push({ contacts: [], coil: { op: 'OUT', device: 'Y00000' } });
  renderRungSelector();
  $('selectedRung').value = String(ladderDiagram.rungs.length - 1);
  renderLadderCanvas();
});

$('addContact').addEventListener('click', () => {
  const idx = Number($('selectedRung').value || 0);
  const rung = ladderDiagram.rungs[idx];
  if (!rung) return;
  rung.contacts.push({ device: $('contactDevice').value.trim(), type: $('contactType').value });
  renderLadderCanvas();
});

$('removeContact').addEventListener('click', () => {
  const idx = Number($('selectedRung').value || 0);
  const rung = ladderDiagram.rungs[idx];
  if (!rung || rung.contacts.length === 0) return;
  rung.contacts.pop();
  renderLadderCanvas();
});

$('setCoil').addEventListener('click', () => {
  const idx = Number($('selectedRung').value || 0);
  const rung = ladderDiagram.rungs[idx];
  if (!rung) return;
  rung.coil = {
    op: $('coilOp').value,
    device: $('coilDevice').value.trim(),
    preset: Number($('coilPreset').value || 0)
  };
  renderLadderCanvas();
});

$('renderToText').addEventListener('click', renderToText);
$('coilOp').addEventListener('change', syncCoilPresetVisibility);

$('createProject').addEventListener('click', async () => {
  try {
    const result = await api('/api/new-project', {
      name: $('projectName').value,
      category: $('category').value,
      boardId: $('board').value,
      languages: {
        ladder: $('langLadder').checked,
        st: $('langSt').checked,
        customArduinoCpp: $('langCpp').checked
      },
      settings: {
        scanCycleMs: Number($('scanCycle').value),
        serialBaudrate: Number($('baudrate').value),
        deviceProfile: $('profile').value,
        bitContactNotation: $('notation').value
      }
    });
    $('projectResult').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('projectResult').textContent = error.message;
  }
});


$('generateArduino').addEventListener('click', async () => {
  try {
    const result = await api('/api/arduino/generate', {
      source: $('ladderSource').value,
      config: config(),
      scanCycleMs: Number($('scanCycle').value)
    });
    $('arduinoResult').textContent = result.sketch;
  } catch (error) {
    $('arduinoResult').textContent = error.message;
  }
});

$('compileArduino').addEventListener('click', async () => {
  try {
    const result = await api('/api/arduino/compile', {
      source: $('ladderSource').value,
      config: config(),
      boardId: $('board').value,
      scanCycleMs: Number($('scanCycle').value)
    });
    $('arduinoResult').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('arduinoResult').textContent = error.message;
  }
});

$('parseDevice').addEventListener('click', async () => {
  try {
    const result = await api('/api/parse-device', { input: $('deviceInput').value, config: config() });
    $('deviceResult').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('deviceResult').textContent = error.message;
  }
});

$('convertDevice').addEventListener('click', async () => {
  try {
    const result = await api('/api/convert-device', {
      input: $('deviceInput').value,
      config: config(),
      toNotation: $('toNotation').value
    });
    $('deviceResult').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('deviceResult').textContent = error.message;
  }
});

document.querySelectorAll('[data-cmd]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      const cmd = button.dataset.cmd;
      const request = cmd?.startsWith('FORCE') ? { cmd, device: 'R10015' } : { cmd };
      const result = await api('/api/monitor', request);
      $('monitorResult').textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      $('monitorResult').textContent = error.message;
    }
  });
});

$('compileLadder').addEventListener('click', async () => {
  try {
    const initialBits = JSON.parse($('initialBits').value || '{}');
    const result = await api('/api/ladder/compile', {
      source: $('ladderSource').value,
      config: config(),
      initialBits
    });
    $('ladderResult').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('ladderResult').textContent = error.message;
  }
});

$('simulateLadder').addEventListener('click', async () => {
  try {
    const initialBits = JSON.parse($('initialBits').value || '{}');
    const inputSequence = JSON.parse($('inputSequence').value || '[]');
    const result = await api('/api/ladder/simulate', {
      source: $('ladderSource').value,
      config: config(),
      initialBits,
      inputSequence
    });
    $('ladderResult').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('ladderResult').textContent = error.message;
  }
});

$('loadSelfHold').addEventListener('click', () => {
  $('profile').value = 'generic';
  $('notation').value = 'kv-decimal-2';
  $('toNotation').value = 'mitsubishi-hex-1';
  ladderDiagram.rungs = [
    { contacts: [{ device: 'X00000', type: 'NO' }], coil: { op: 'SET', device: 'Y00000' } },
    { contacts: [{ device: 'X00001', type: 'NO' }], coil: { op: 'RST', device: 'Y00000' } }
  ];
  renderRungSelector();
  renderLadderCanvas();
  renderToText();
  $('initialBits').value = '{"Y:0":false}';
  $('inputSequence').value = '[{"X:0":true,"X:1":false},{"X:0":false,"X:1":false},{"X:0":false,"X:1":true}]';
});

$('ladderSource').addEventListener('input', refreshLadderPreview);

loadMeta();
syncCoilPresetVisibility();
renderRungSelector();
renderLadderCanvas();
refreshLadderPreview();
