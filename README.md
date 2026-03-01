Desarrollar un Sistema de consultas en lenguaje natural basado en Model Context Protocol (MCP). El sistema debe:

	Implementar una aplicación web que permita al usuario final formular preguntas en lenguaje natural para consultar información almacenada en una base de datos relacional.
	Integrar un modelo de lenguaje que solo pueda interactuar con la base de datos mediante herramientas expuestas vía MCP
	Separar estrictamente la generación de consultas, la validación y la ejecución.
o	Validar que únicamente se ejecuten consultas SELECT.
o	Bloquear cualquier sentencia que intente modificar la base de datos.
o	Registrar cada invocación de herramienta y cada consulta ejecutada.
	Responder al usuario  mostrando la pregunta original, la consulta generada, el resultado obtenido de la base de datos y respuesta en lenguaje natural del resultado anterior


	El modelo de datos que debe utilizar para el reto es la base de datos de Chinook
