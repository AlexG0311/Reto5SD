# Sistema de Consultas en Lenguaje Natural basado en MCP

## 📌 Descripción del Proyecto

Desarrollar un sistema de consultas en lenguaje natural basado en **Model Context Protocol (MCP)**.  

El sistema permitirá a los usuarios formular preguntas en lenguaje natural para consultar información almacenada en una base de datos relacional.

---

## 🎯 Objetivos

### 1️⃣ Aplicación Web

- Implementar una aplicación web que permita al usuario formular preguntas en lenguaje natural.
- Las preguntas deben consultar información almacenada en una base de datos relacional.

---

### 2️⃣ Integración con Modelo de Lenguaje

- Integrar un modelo de lenguaje.
- El modelo solo podrá interactuar con la base de datos mediante herramientas expuestas vía MCP.

---

### 3️⃣ Separación de Responsabilidades

Separar estrictamente:

- Generación de consultas SQL.
- Validación de consultas.
- Ejecución de consultas.

#### 🔒 Reglas de Seguridad

- ✅ Validar que únicamente se ejecuten consultas `SELECT`.
- ❌ Bloquear cualquier sentencia que intente modificar la base de datos (`INSERT`, `UPDATE`, `DELETE`, `DROP`, etc.).
- 📝 Registrar cada invocación de herramienta.
- 📝 Registrar cada consulta ejecutada.

---

### 4️⃣ Respuesta al Usuario

El sistema debe mostrar:

- 📌 La pregunta original del usuario.
- 📌 La consulta SQL generada.
- 📌 El resultado obtenido de la base de datos.
- 📌 Una respuesta final en lenguaje natural basada en el resultado anterior.

---

### 5️Modelo de Datos

El sistema debe utilizar la base de datos **Chinook**.

---

## Consideraciones Técnicas

- Uso de Model Context Protocol (MCP).
- Arquitectura modular con separación clara de responsabilidades.
- Validación estricta de consultas SQL.
- Registro (logging) de todas las operaciones realizadas por el modelo.
