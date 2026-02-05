const $ = (id) => document.getElementById(id);

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

async function loadMeta() {
  const meta = await api('/api/meta');
  $('category').innerHTML = meta.categories.map((c) => `<option>${c}</option>`).join('');
  $('board').innerHTML = meta.boards.map((b) => `<option value="${b.id}">${b.id} (${b.category})</option>`).join('');
}

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

loadMeta();
