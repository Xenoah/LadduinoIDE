import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class ArduinoCliAdapter {
  constructor(binary = 'arduino-cli') {
    this.binary = binary;
  }

  async isAvailable() {
    try {
      await execFileAsync(this.binary, ['version']);
      return true;
    } catch {
      return false;
    }
  }

  async compile({ fqbn, projectDir }) {
    const { stdout } = await execFileAsync(this.binary, ['compile', '--fqbn', fqbn, projectDir]);
    return { ok: true, stdout };
  }

  async upload({ fqbn, projectDir, port }) {
    const { stdout } = await execFileAsync(this.binary, ['upload', '-p', port, '--fqbn', fqbn, projectDir]);
    return { ok: true, stdout };
  }
}
