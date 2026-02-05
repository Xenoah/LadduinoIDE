export function createNewProject({ name, category, board, languages, ioMap, settings }) {
  return {
    project: {
      name,
      category,
      board,
      languages,
      scanCycleMs: settings?.scanCycleMs ?? 10,
      serialBaudrate: settings?.serialBaudrate ?? 921600,
      deviceProfile: settings?.deviceProfile ?? 'generic',
      bitContactNotation: settings?.bitContactNotation ?? 'kv-decimal-2'
    },
    files: {
      'project.json': JSON.stringify({ name, languages, ...settings }, null, 2),
      'board_profile.json': JSON.stringify(board, null, 2),
      'io_map.json': JSON.stringify(ioMap ?? { pins: [] }, null, 2)
    }
  };
}

export async function buildProject({ arduinoCli, fqbn, projectDir }) {
  return arduinoCli.compile({ fqbn, projectDir });
}

export async function uploadProject({ arduinoCli, fqbn, projectDir, port }) {
  return arduinoCli.upload({ fqbn, projectDir, port });
}

export async function monitorPoll({ transport, request }) {
  return transport.request(request);
}
