export class InMemorySerialTransport {
  constructor() {
    this.state = { run: false, force: {} };
  }

  async request(frame) {
    if (frame.cmd === 'RUN') this.state.run = true;
    if (frame.cmd === 'STOP') this.state.run = false;
    if (frame.cmd === 'FORCE_SET') this.state.force[frame.device] = true;
    if (frame.cmd === 'FORCE_CLR') this.state.force[frame.device] = false;
    if (frame.cmd === 'FORCE_CLEAR_ALL') this.state.force = {};
    return { ok: true, state: this.state, echo: frame };
  }
}
