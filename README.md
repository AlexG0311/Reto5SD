# ConsultaConMCP

Aplicación full-stack para consultar bases de datos mediante lenguaje natural usando un LLM (Google Gemini / OpenAI) y el protocolo MCP (Model Context Protocol).

El proyecto está dividido en tres módulos independientes:

| Módulo | Descripción |
|---|---|
| `backend` | API REST en Express + TypeScript que intermedia entre el frontend y el servidor MCP |
| `frontend` | Interfaz web construida con React + Vite + TypeScript |
| `mcp-server` | Servidor MCP que expone herramientas para consultar la base de datos (MySQL / SQLite) |

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior
- Una base de datos MySQL activa **o** un archivo SQLite (según la configuración que uses)
- Credenciales válidas de [OpenAI](https://platform.openai.com/) y/o [Google Gemini](https://aistudio.google.com/)

---

## Configuración de variables de entorno

Antes de ejecutar el proyecto, crea los archivos `.env` necesarios en cada módulo.

**`backend/.env`**
```env
OPENAI_API_KEY=tu_clave_de_openai
GOOGLE_API_KEY=tu_clave_de_google_gemini
PORT=3000
```

**`mcp-server/.env`**
```env
DB_TYPE=mysql        # o sqlite
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_de_datos
# Si usas SQLite:
# DB_PATH=./tu_archivo.db
```

---

## Instalación

> Ejecuta `npm install` dentro de cada uno de los tres módulos del proyecto.

### 1. Backend
```bash
cd backend
npm install
```

### 2. Frontend
```bash
cd frontend
npm install
```

### 3. MCP Server
```bash
cd mcp-server
npm install
```

---

## Build (compilación)

> El frontend **no** requiere un paso de build previo para desarrollo. Solo compila `backend` y `mcp-server`.

### 1. Backend
```bash
cd backend
npm run build
```

### 2. MCP Server
```bash
cd mcp-server
npm run build
```

Esto compila TypeScript y genera los archivos de salida en la carpeta `dist/` de cada módulo.

---

## Ejecución en modo desarrollo

> Levanta los tres módulos en terminales separadas, en el orden indicado.

### Terminal 1 — MCP Server
```bash
cd mcp-server
npm run dev
```

### Terminal 2 — Backend
```bash
cd backend
npm run dev
```

### Terminal 3 — Frontend
```bash
cd frontend
npm run dev
```

Una vez los tres estén corriendo, abre tu navegador en la dirección que muestre Vite (por defecto `http://localhost:5173`).

---

## Estructura del proyecto

```
ConsultaConMCP/
├── backend/          # API REST (Express + TypeScript)
│   └── src/
│       ├── index.ts
│       ├── llmService.ts
│       ├── mcpClient.ts
│       ├── llm/      # Proveedores: OpenAI, Google Gemini
│       └── routes/
├── frontend/         # Interfaz web (React + Vite)
│   └── src/
│       ├── App.tsx
│       ├── types.ts
│       └── components/
├── mcp-server/       # Servidor MCP (herramientas de base de datos)
│   └── src/
│       ├── index.ts
│       ├── database.ts
│       ├── db/       # Proveedores: MySQL, SQLite
│       └── tools/    # listTables, getSchema, executeQuery
└── Chinook_MySql.sql # Script de ejemplo de base de datos
```
