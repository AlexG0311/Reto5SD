import { ILlmProvider } from './ILlmProvider.js';
import { OpenAIProvider } from './openaiProvider.js';
import { GoogleProvider } from './googleProvider.js';

// Para agregar un nuevo proveedor:
// 1. Crea su clase implementando ILlmProvider en un archivo nuevo
// 2. Impórtala aquí y agrégala al mapa con su clave
const PROVIDERS: Record<string, () => ILlmProvider> = {
  openai: () => new OpenAIProvider(),
  google: () => new GoogleProvider(),
};

export function createLlmProvider(): ILlmProvider {
  const name = (process.env.LLM_PROVIDER ?? 'google').toLowerCase();
  const factory = PROVIDERS[name];

  if (!factory) {
    const valid = Object.keys(PROVIDERS).join(', ');
    throw new Error(`Proveedor LLM desconocido: "${name}". Opciones válidas: ${valid}`);
  }

  console.log(`[LLM] Usando proveedor: ${name}`);
  return factory();
}
