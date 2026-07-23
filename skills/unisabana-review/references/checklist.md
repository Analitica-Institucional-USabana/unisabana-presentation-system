# Checklist de revisión

> Adaptado de `claude-design-system/readme.md` §13 PRESENTATION VALIDATION CHECKLIST y §14 AUTOMATED QA CONTRACT. Cada ítem debe resolverse a `error`, `warning` o `pass`, citando el campo exacto de `core/brand/rules/*.json` que aplica.

## Logo (`core/brand/rules/logo.json`)
- [ ] Activo aprobado seleccionado (`approvedAssets`), no redibujado ni recoloreado fuera de lo permitido.
- [ ] Autoridad de marca correcta (`authority.types`) para el contexto (universidad/facultad/protocolario/gobierno).
- [ ] Altura de símbolo ≥ mínimo normativo (`sizing.minimumSymbolHeight`).
- [ ] Si está cerca del umbral, se usó la variante responsive (`sizing.responsiveSwitchThreshold`).
- [ ] Metadata de área de protección disponible — si `clearSpace.officialClearSpaceRatio` es `null`, el artefacto **no puede aprobarse como final**, solo como borrador (así lo exige el propio readme.md).
- [ ] Sin colisiones dentro del área protegida (`clearSpace.forbiddenInsideProtectionArea`).
- [ ] Versión positiva/negativa correcta según fondo (`contrastAndBackground`).
- [ ] Posición fija y consistente según la familia de slide (`placementBySlideFamily`).
- [ ] Sin sombra, filtro, animación o distorsión.

## Paleta (`core/brand/rules/palette.json`)
- [ ] Ninguna paleta de facultad mezclada con otra ni con la institucional (`rules[no-mixing]`).
- [ ] Si se usó `data-faculty`, toda la pieza pertenece a esa facultad (`rules[faculty-scope-whole-piece]`).
- [ ] Máximo 1-2 colores de fondo por deck.
- [ ] Ningún color fuera del sistema (`rules[no-invented-colors]`).

## Tipografía (`core/brand/rules/typography.json`)
- [ ] Solo Libre Franklin.
- [ ] Casing correcto (sentence case en títulos, UPPERCASE tracked en eyebrows).
- [ ] Cuerpo ≥20px (`rules[min-body-size]`) — nunca reducido para resolver overflow.
- [ ] Fuente/periodo citados en slides de datos.

## Densidad (`core/brand/rules/density.json`)
- [ ] `slideContentLimits` no excedidos (ideas principales, bloques de apoyo, columnas, tarjetas).
- [ ] Si excede, el contenido se dividió en vez de encogerse (`overflowResolutionOrder`).
- [ ] Máximo 2 elementos de diagramación decorativa por slide.

## Imágenes (`core/brand/rules/imagery.json`)
- [ ] Toda imagen referenciada está en `approvedCampusPhotography` o en `logo.json#/approvedAssets`.
- [ ] Ninguna imagen de persona/edificio/escena fabricada o generada.

## Atribución IA (`core/brand/rules/ai-disclosure.json`)
- [ ] Texto y logo presentes (`text`, `logoAsset`).
- [ ] Tamaño y posición correctos (`size`, `position`).
- [ ] Separación mínima del logo institucional respetada (`relationToInstitutionalLogo.minimumSeparation`).
- [ ] Jerarquía subordinada al logo institucional.

## Layout general
- [ ] Canvas 1280×720, contenido dentro del área segura (`core/brand/tokens.json#/spacing/canvas`).
- [ ] Sin texto cortado ni elementos fuera del lienzo.
- [ ] Sin superposiciones no intencionadas.

## Formato de salida sugerido

```
Diapositiva/artefacto: <id o descripción>
Estado: error | warning | pass
Hallazgos:
  - [error] logo.json#/sizing/minimumSymbolHeight.screenPx: logo mide ~16px, mínimo 22px.
  - [warning] density.json#/slideContentLimits/maxSupportingBlocks: 4 bloques, máximo recomendado 3.
Veredicto: bloqueado para exportación / apto solo como borrador / aprobado como borrador del sistema
```
