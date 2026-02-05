import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1),
  scanCycleMs: z.number().int().positive().default(10),
  serialBaudrate: z.number().int().positive().default(921600),
  deviceProfile: z.enum(['generic', 'kv-like']).default('generic'),
  bitContactNotation: z.enum(['kv-decimal-2', 'mitsubishi-hex-1']).default('kv-decimal-2'),
  numericLiteralFormat: z.enum(['decimal', 'hex-with-prefix']).default('decimal'),
  languages: z.object({
    ladder: z.boolean().default(true),
    st: z.boolean().default(false),
    customArduinoCpp: z.boolean().default(false)
  })
});

export type ProjectConfig = z.infer<typeof projectSchema>;

export function parseProjectConfig(data: unknown): ProjectConfig {
  return projectSchema.parse(data);
}
