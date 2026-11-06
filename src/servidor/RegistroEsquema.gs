// Contrato de captura. Sin datos personales ni configuración de cuentas.
// Mantener sincronizado con docs/esquema-sheets.json.
var ESQUEMA_REGISTRO = {
  "version": 3,
  "captura": [
    {
      "hoja": "R - Reg. Investigador",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Reg. Investigador",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "Código RENACYT",
        "DNI",
        "Apellidos",
        "Nombres",
        "Celular",
        "Correo",
        "Disponibilidad lunes",
        "Disponibilidad martes",
        "Disponibilidad miércoles",
        "Disponibilidad jueves",
        "Disponibilidad viernes",
        "Tipo de dedicación",
        "Categoría",
        "Carrera profesional",
        "Línea de investigación 1",
        "Línea de investigación 2",
        "Línea de investigación 3",
        "Grupo y nivel RENACYT",
        "Nivel clasificación RENACYT",
        "CTIVITAE",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Eventos académicos",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Eventos académicos",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "NOMBRE DEL EVENTO",
        "TIPO DE EVENTO",
        "MODALIDAD",
        "ESTADO",
        "PAÍS",
        "CIUDAD",
        "FECHA",
        "ROL",
        "LINK EVENTO",
        "LINK EVIDENCIA IMAGEN",
        "LINK EVIDENCIA DOCUMENTO",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Conferencia",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Conferencia",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "TÍTULO DEL ARTÍCULO",
        "NOMBRE DEL EVENTO",
        "LINEA DE INVESTIGACIÓN",
        "INDEXACIÓN",
        "H-INDEX",
        "RANKING",
        "PAÍS",
        "CIUDAD",
        "FECHA DE PUBLICACIÓN",
        "LINK EVENTO",
        "ESTADO",
        "LINK EVIDENCIA IMAGEN",
        "LINK EVIDENCIA DOCUMENTO",
        "LINK VIDEO (enlace original en encabezado)",
        "CONTACTOS (NOMBRE, INSTITUCIÓN, CORREO)",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Journal",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Journal",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "TÍTULO DEL ARTÍCULO",
        "NOMBRE DEL JOURNAL/REVISTAS",
        "LINEA DE INVESTIGACIÓN",
        "INDEXACIÓN",
        "H-INDEX",
        "CUARTIL",
        "JIF - Journal Impact Factor",
        "JCI - Journla Citation Indicator",
        "PAÍS",
        "CIUDAD",
        "FECHA DE PUBLICACIÓN",
        "LINK JOURNAL/REVISTA",
        "ESTADO",
        "LINK EVIDENCIA IMAGEN",
        "LINK EVIDENCIA DOCUMENTO",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Revistas (editor)",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Revistas (editor)",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "NOMBRE DE LA REVISTA",
        "INDEXACIÓN",
        "H-INDEX",
        "CUARTIL",
        "JIF - Journal Impact Factor",
        "JCI - Journla Citation Indicator",
        "PAÍS",
        "CIUDAD",
        "ESTADO",
        "LINK JOURNAL/REVISTA",
        "LINK EVIDENCIA IMAGEN",
        "LINK EVIDENCIA DOCUMENTO",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Proyectos externos",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Proyectos externos",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "N° proyecto",
        "Tipo de Proyecto",
        "Título del proyecto",
        "Objetivo General",
        "Objetivos específicos",
        "Fecha de postulaciòn",
        "Fecha inicio",
        "Fecha fin",
        "Línea de investigación",
        "Área Temática ODCE",
        "Programa",
        "Facultad",
        "Nombre investigador principal",
        "Docente responsable ULASALLE",
        "Recursos humanos",
        "Estado del proyecto",
        "Presupuesto total",
        "Presupuesto ejecutado",
        "Aportación monetaria ULASALLE",
        "Entidad que financia",
        "Aportación no monetaria ULASALLE",
        "link del proyecto",
        "Resultados",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Control Proyectos externos",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Control Proyectos externos",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "Nº Proyecto",
        "Título del Proyecto",
        "Tipo documento",
        "Título documento",
        "Descripción",
        "Enlace",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Proyectos internos",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Proyectos internos",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "N° proyecto",
        "Tipo de Proyecto",
        "Título del proyecto",
        "Objetivo General",
        "Objetivos específicos",
        "Fecha inicio",
        "Fecha fin",
        "Línea de investigación",
        "Área Temática ODCE",
        "Programa",
        "Facultad",
        "Nombre investigador principal",
        "Recursos humanos",
        "Estado del proyecto",
        "Presupuesto total",
        "Presupuesto ejecutado",
        "link del proyecto",
        "Resultados",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Semilleros",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Semilleros",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "Nombre del semillero",
        "Fecha de creación",
        "Línea de investigación 1",
        "Línea de investigación 2",
        "Investigador responsable",
        "Integrantes docentes",
        "Integrantes alumnos",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Grupo Investigación",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Grupo Investigación",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "Nombre del grupo de investigación",
        "Línea de investigación 1",
        "Línea de investigación 2",
        "Investigador responsable",
        "Integrantes docentes",
        "Integrantes alumnos",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Otras publicaciones",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Otras publicaciones",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "Título publicación",
        "Tipo",
        "Link de evidencia",
        "Estado",
        "Rol",
        "Editorial",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    },
    {
      "hoja": "R - Base",
      "filaEncabezado": 1,
      "primeraFilaDatos": 2,
      "destino": "DB - Base",
      "columnas": [
        "ID registro origen",
        "ID contribución canónica",
        "ID registro padre origen",
        "Tipo de catálogo",
        "Valor",
        "Fecha académica adicional",
        "Ciclo de contribución",
        "Moneda"
      ],
      "columnasTecnicasOcultas": [
        1,
        2,
        3
      ]
    }
  ],
  "auxiliares": [
    {
      "title": "SYS - Contexto",
      "sheetId": 200100001,
      "columns": [
        "Campo",
        "Valor",
        "Responsable"
      ],
      "rows": [
        [
          "Versión de esquema",
          "3",
          "Sistema"
        ],
        [
          "ID clase Classroom",
          "",
          "Sistema"
        ],
        [
          "ID tarea Classroom",
          "",
          "Sistema"
        ],
        [
          "ID entrega Classroom",
          "",
          "Sistema"
        ],
        [
          "ID archivo copia",
          "",
          "Sistema"
        ],
        [
          "ID usuario Classroom",
          "",
          "Sistema"
        ],
        [
          "ID investigador Empiria",
          "",
          "Sistema"
        ],
        [
          "Ciclo de asignación",
          "",
          "Sistema"
        ],
        [
          "Estado de entrega",
          "",
          "Sistema"
        ],
        [
          "Fecha de asignación",
          "",
          "Sistema"
        ],
        [
          "Fecha de entrega",
          "",
          "Sistema"
        ],
        [
          "Última recolección",
          "",
          "Sistema"
        ]
      ],
      "oculta": true
    },
    {
      "title": "R - Participantes",
      "sheetId": 200100002,
      "columns": [
        "ID vínculo origen",
        "Sección origen",
        "ID registro origen",
        "ID investigador Empiria",
        "Rol",
        "Tipo de vínculo",
        "Vigencia desde",
        "Vigencia hasta"
      ],
      "enums": {
        "Tipo de vínculo": [
          "Autoría",
          "Participación",
          "Membresía",
          "Responsabilidad"
        ]
      }
    },
    {
      "title": "R - Actividades",
      "sheetId": 200100003,
      "columns": [
        "ID actividad origen",
        "Sección padre",
        "ID registro padre origen",
        "Actividad",
        "Fecha inicio actividad",
        "Fecha fin actividad",
        "Estado actividad",
        "Link evidencia imagen",
        "Link evidencia documento"
      ]
    }
  ],
  "tablasSistema": [
    {
      "title": "SYS - Personas",
      "sheetId": 200200001,
      "columns": [
        "ID investigador Empiria",
        "ID usuario Classroom",
        "Nombre de presentación",
        "Correo institucional",
        "Estado identidad",
        "Fecha verificación"
      ],
      "enums": {
        "Estado identidad": [
          "Pendiente",
          "Verificada",
          "Inactiva"
        ]
      }
    },
    {
      "title": "SYS - Asignaciones",
      "sheetId": 200200002,
      "columns": [
        "ID asignación",
        "ID clase Classroom",
        "ID tarea Classroom",
        "ID usuario Classroom",
        "ID investigador Empiria",
        "Ciclo de asignación",
        "ID plantilla",
        "Versión esquema",
        "Fecha asignación",
        "Fecha límite",
        "Estado asignación"
      ],
      "enums": {
        "Estado asignación": [
          "Asignada",
          "Cancelada",
          "Cerrada"
        ]
      }
    },
    {
      "title": "SYS - Entregas",
      "sheetId": 200200003,
      "columns": [
        "ID clase Classroom",
        "ID tarea Classroom",
        "ID entrega Classroom",
        "ID usuario Classroom",
        "ID investigador Empiria",
        "ID archivo copia",
        "Estado Classroom",
        "Fecha entrega",
        "Fecha actualización origen",
        "Última recolección"
      ]
    },
    {
      "title": "SYS - Orígenes",
      "sheetId": 200200004,
      "columns": [
        "ID origen",
        "ID clase Classroom",
        "ID tarea Classroom",
        "ID entrega Classroom",
        "ID archivo copia",
        "Sección origen",
        "ID registro origen",
        "Tabla destino",
        "ID registro destino",
        "ID registro padre origen",
        "ID contribución canónica",
        "ID investigador Empiria",
        "Ciclo de asignación",
        "Fecha académica",
        "Ciclo de contribución",
        "Moneda",
        "Fecha primera recolección",
        "Fecha última recolección",
        "Huella contenido",
        "Estado sincronización"
      ],
      "enums": {
        "Estado sincronización": [
          "Pendiente",
          "Sincronizado",
          "Error",
          "Requiere revisión"
        ]
      }
    },
    {
      "title": "SYS - Contribuciones",
      "sheetId": 200200005,
      "columns": [
        "ID contribución canónica",
        "Tipo de contribución",
        "Título de referencia",
        "Identificador externo",
        "Estado identidad",
        "Fecha revisión"
      ],
      "enums": {
        "Estado identidad": [
          "Pendiente",
          "Verificada",
          "Descartada"
        ]
      }
    },
    {
      "title": "SYS - Participantes",
      "sheetId": 200200006,
      "columns": [
        "ID vínculo",
        "ID contribución canónica",
        "ID investigador Empiria",
        "Rol",
        "Tipo de vínculo",
        "Vigencia desde",
        "Vigencia hasta",
        "ID origen",
        "Estado validación"
      ],
      "enums": {
        "Tipo de vínculo": [
          "Autoría",
          "Participación",
          "Membresía",
          "Responsabilidad"
        ],
        "Estado validación": [
          "Pendiente",
          "Revisado",
          "Validado",
          "Rechazado"
        ]
      }
    },
    {
      "title": "SYS - Recolecciones",
      "sheetId": 200200007,
      "columns": [
        "ID ejecución",
        "Inicio",
        "Fin",
        "Estado",
        "ID clase Classroom",
        "ID tarea Classroom",
        "Copias leídas",
        "Registros creados",
        "Registros actualizados",
        "Registros sin cambios",
        "Registros con error",
        "Versión recolector"
      ],
      "enums": {
        "Estado": [
          "En proceso",
          "Completada",
          "Parcial",
          "Fallida",
          "Cancelada"
        ]
      }
    },
    {
      "title": "SYS - Errores",
      "sheetId": 200200008,
      "columns": [
        "ID error",
        "ID ejecución",
        "Fecha",
        "ID archivo copia",
        "Sección origen",
        "ID registro origen",
        "Código",
        "Mensaje sin datos personales",
        "Estado resolución",
        "Fecha resolución"
      ],
      "enums": {
        "Estado resolución": [
          "Pendiente",
          "Resuelto",
          "Descartado"
        ]
      }
    },
    {
      "title": "SYS - Esquema",
      "sheetId": 200200009,
      "columns": [
        "Versión",
        "Sección captura",
        "Fila encabezado",
        "Primera fila datos",
        "Tabla destino",
        "Clave registro origen",
        "Tipo"
      ],
      "rows": [
        [
          "3",
          "R - Reg. Investigador",
          "1",
          "2",
          "DB - Reg. Investigador",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Eventos académicos",
          "1",
          "2",
          "DB - Eventos académicos",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Conferencia",
          "1",
          "2",
          "DB - Conferencia",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Journal",
          "1",
          "2",
          "DB - Journal",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Revistas (editor)",
          "1",
          "2",
          "DB - Revistas (editor)",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Proyectos externos",
          "1",
          "2",
          "DB - Proyectos externos",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Control Proyectos externos",
          "1",
          "2",
          "DB - Control Proyectos externos",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Proyectos internos",
          "1",
          "2",
          "DB - Proyectos internos",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Semilleros",
          "1",
          "2",
          "DB - Semilleros",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Grupo Investigación",
          "1",
          "2",
          "DB - Grupo Investigación",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Otras publicaciones",
          "1",
          "2",
          "DB - Otras publicaciones",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Base",
          "1",
          "2",
          "DB - Base",
          "ID registro origen",
          "Principal"
        ],
        [
          "3",
          "R - Participantes",
          "1",
          "2",
          "SYS - Participantes",
          "ID vínculo origen",
          "Relación"
        ],
        [
          "3",
          "R - Actividades",
          "1",
          "2",
          "Según sección padre",
          "ID actividad origen",
          "Actividad"
        ]
      ]
    },
    {
      "title": "SYS - Secciones asignadas",
      "sheetId": 200200010,
      "columns": [
        "ID clase Classroom",
        "ID tarea Classroom",
        "ID plantilla de tarea",
        "Versión esquema",
        "Sección captura",
        "Tipo de sección"
      ],
      "enums": {
        "Tipo de sección": [
          "Principal",
          "Auxiliar"
        ]
      }
    },
    {
      "title": "SYS - Bajas",
      "sheetId": 200200011,
      "columns": [
        "ID solicitud",
        "ID origen",
        "ID investigador solicitante",
        "Motivo",
        "Estado",
        "Fecha solicitud",
        "Operador resolución",
        "Fecha resolución",
        "Resolución"
      ],
      "enums": {
        "Estado": [
          "Pendiente",
          "Aprobada",
          "Rechazada"
        ]
      }
    }
  ]
};
