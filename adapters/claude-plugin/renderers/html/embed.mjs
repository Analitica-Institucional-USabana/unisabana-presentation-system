// Re-exporta la utilidad de embebido compartida (scripts/lib/embed.mjs) para no
// romper los imports relativos "./embed.mjs" ya usados por los layouts.
export { fileToDataUri, brandAssetDataUri } from "../../scripts/lib/embed.mjs";
