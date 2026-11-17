# Uso de inteligencia artificial

**IA utilizada:** Claude (Anthropic), como asistente durante todo el proyecto.

## En qué nos ayudó

| Etapa | Uso de Claude |
| --- | --- |
| Idea de negocio | Lluvia de ideas para generar valor al spa LÚA y diferenciarlo (radar de tendencias por biotipo y fototipo). |
| Investigación | Revisión de apps similares, del actor de Apify para TikTok y de la Ley Orgánica de Protección de Datos Personales del Ecuador. |
| Diseño (Figma) | Línea gráfica a partir del logo de LÚA, atomic design y prototipo de pantallas en Figma. |
| Arquitectura | Modelado DDD: contextos delimitados, entidades, objetos de valor y casos de uso. |
| Código | Generación del proyecto React Native + Expo Go en TypeScript y pruebas unitarias del dominio. |
| Documentación | README, documento de arquitectura y reporte. |

## Cómo la usamos con criterio

- Las decisiones de negocio y el criterio dermatocosmiátrico son del equipo: la IA propuso y nosotras validamos.
- El contenido de las tendencias de ejemplo debe ser revisado por la especialista antes de publicarse.
- No se compartieron datos de pacientes con la IA.

## Dentro de la app (en desarrollo)

El módulo **Análisis facial** usará IA para leer los resultados del analizador del spa y **sugerir**
tratamientos y productos. La sugerencia siempre la aprueba la especialista (LOPDP, art. 20).
