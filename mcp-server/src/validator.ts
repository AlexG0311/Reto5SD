const FORBIDDEN_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
  'TRUNCATE', 'REPLACE', 'MERGE', 'UPSERT', 'EXEC', 'EXECUTE',
  'GRANT', 'REVOKE', 'ATTACH', 'DETACH', 'PRAGMA',
];

export function validateSelectOnly(sql: string): void {
  const trimmed = sql.trim();

  if (!trimmed) {
    throw new Error('La consulta SQL no puede estar vacía.');
  }

  const normalized = trimmed.toUpperCase();

  // Debe comenzar con SELECT o WITH (para CTEs)
  if (!/^(SELECT|WITH)\s+/i.test(trimmed)) {
    throw new Error('Solo se permiten consultas SELECT. La consulta debe comenzar con SELECT o WITH.');
  }

  // Verificar palabras prohibidas
  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(normalized)) {
      throw new Error(`Consulta no permitida: contiene la sentencia "${keyword}" que puede modificar la base de datos.`);
    }
  }

  // Bloquear múltiples sentencias (punto y coma separando statements)
  const withoutStrings = trimmed.replace(/'[^']*'/g, "''");
  const semicolonCount = (withoutStrings.match(/;/g) || []).length;
  if (semicolonCount > 1 || (semicolonCount === 1 && !withoutStrings.trim().endsWith(';'))) {
    throw new Error('No se permiten múltiples sentencias SQL en una sola consulta.');
  }

  // Bloquear comentarios maliciosos
  if (/--/.test(trimmed) || /\/\*/.test(trimmed)) {
    throw new Error('No se permiten comentarios SQL en la consulta.');
  }
}
