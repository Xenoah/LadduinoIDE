export function createProgram() {
  return { rungs: [], stBlocks: [], userHooks: [] };
}

export function addRung(program, rung) {
  program.rungs.push(rung);
  return program;
}
