import type { Metadata } from "next";

const BASE: Metadata = {
  metadataBase: new URL("https://argus-labs.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Boîte à Outils PDF & Documents",
  },
  robots: { index: true, follow: true },
};

function makeMeta(title: string, description: string, keywords: string[]): Metadata {
  return {
    ...BASE,
    title,
    description,
    keywords: [...keywords, "PDF", "100% local", "offline", "navigateur", "Argus Labs"],
  };
}

export const toolMetadata = {
  "merge-pdf": makeMeta(
    "Fusionner PDF — Combiner plusieurs fichiers PDF",
    "Fusionnez plusieurs fichiers PDF en un seul document. 100% local, aucune donnée envoyée sur Internet.",
    ["fusionner PDF", "combiner PDF", "assembler PDF", "union PDF"]
  ),
  "split-pdf": makeMeta(
    "Diviser PDF — Séparer un PDF en plusieurs fichiers",
    "Divisez un fichier PDF en plusieurs documents. Extraction par page, intervalle ou plage. 100% local.",
    ["diviser PDF", "séparer PDF", "extraire pages PDF", "découper PDF"]
  ),
  "compress-pdf": makeMeta(
    "Compresser PDF — Réduire la taille d'un PDF",
    "Réduisez la taille de vos fichiers PDF sans perte de qualité. Compression locale dans le navigateur.",
    ["compresser PDF", "réduire taille PDF", "optimiser PDF", "PDF léger"]
  ),
  "watermark-pdf": makeMeta(
    "Filigrane PDF — Ajouter un filigrane texte",
    "Ajoutez un filigrane style document d'identité à vos PDF. Motif ondulé résistant aux modifications IA.",
    ["filigrane PDF", "watermark PDF", "marquer PDF", "protection PDF"]
  ),
  "rotate-pdf": makeMeta(
    "Rotation PDF — Pivoter les pages d'un PDF",
    "Faites pivoter toutes les pages d'un PDF de 90°, 180° ou 270°. Traitement 100% local.",
    ["rotation PDF", "pivoter PDF", "tourner PDF", "orientation PDF"]
  ),
  "delete-pages": makeMeta(
    "Supprimer des pages d'un PDF",
    "Supprimez des pages spécifiques d'un fichier PDF. Visualisez et sélectionnez les pages à supprimer.",
    ["supprimer pages PDF", "retirer pages PDF", "enlever pages PDF"]
  ),
  "reorder-pages": makeMeta(
    "Réorganiser les pages d'un PDF",
    "Changez l'ordre des pages d'un PDF par glisser-déposer. Réorganisation visuelle 100% locale.",
    ["réorganiser PDF", "réordonner pages PDF", "trier pages PDF", "ordre pages PDF"]
  ),
  "extract-pages": makeMeta(
    "Extraire des pages d'un PDF",
    "Extrayez des pages spécifiques d'un PDF pour créer un nouveau document. Sélection visuelle des pages.",
    ["extraire pages PDF", "isoler pages PDF", "pages spécifiques PDF"]
  ),
  "pdf-to-images": makeMeta(
    "PDF vers Images — Convertir un PDF en images",
    "Convertissez chaque page d'un PDF en image PNG ou JPEG. Export local sans serveur.",
    ["PDF vers images", "convertir PDF image", "PDF en PNG", "PDF en JPEG"]
  ),
  "images-to-pdf": makeMeta(
    "Images vers PDF — Convertir des images en PDF",
    "Combinez plusieurs images (JPG, PNG, WebP) en un seul fichier PDF. Réordonnez par glisser-déposer.",
    ["images vers PDF", "JPG en PDF", "PNG en PDF", "convertir images PDF"]
  ),
  "watermark-image": makeMeta(
    "Filigrane Image — Ajouter un filigrane à une image",
    "Ajoutez un filigrane texte à vos images. Protection visuelle 100% locale.",
    ["filigrane image", "watermark photo", "marquer image", "protection image"]
  ),
  "compress-image": makeMeta(
    "Compresser Image — Réduire la taille d'une image",
    "Réduisez la taille de vos images JPG, PNG, WebP sans perte visible. Compression locale.",
    ["compresser image", "réduire taille image", "optimiser image", "image légère"]
  ),
  "convert-image": makeMeta(
    "Convertir Image — Changer le format d'une image",
    "Convertissez vos images entre JPG, PNG et WebP. Conversion locale dans le navigateur.",
    ["convertir image", "JPG en PNG", "PNG en WebP", "changer format image"]
  ),
  "resize-image": makeMeta(
    "Redimensionner Image — Modifier les dimensions",
    "Changez la largeur et la hauteur de vos images. Redimensionnement 100% local.",
    ["redimensionner image", "taille image", "dimensions image", "resize photo"]
  ),
  "protect-pdf": makeMeta(
    "Marquer PDF — Filigrane visuel de protection",
    "Ajoutez un filigrane visuel de protection à vos documents PDF. Traitement 100% local.",
    ["marquer PDF", "filigrane protection PDF", "watermark PDF", "protection document"]
  ),
  "unlock-pdf": makeMeta(
    "Déverrouiller PDF — Retirer le mot de passe",
    "Retirez le mot de passe d'un PDF protégé. Déchiffrement local avec votre mot de passe.",
    ["déverrouiller PDF", "enlever mot de passe PDF", "déchiffrer PDF", "PDF protégé"]
  ),
  "remove-metadata": makeMeta(
    "Supprimer les métadonnées d'un PDF",
    "Effacez toutes les métadonnées (auteur, titre, dates) d'un PDF en un clic. Nettoyage complet.",
    ["supprimer métadonnées PDF", "effacer métadonnées PDF", "anonymiser PDF"]
  ),
  "metadata-manager": makeMeta(
    "Gérer les métadonnées d'un PDF",
    "Lisez, modifiez ou supprimez les métadonnées d'un PDF. Éditeur de métadonnées 100% local.",
    ["métadonnées PDF", "éditer métadonnées PDF", "modifier PDF", "infos PDF"]
  ),
  hash: makeMeta(
    "Hash — Calculer l'empreinte numérique",
    "Calculez le hash MD5, SHA-1, SHA-256, SHA-384, SHA-512 d'un texte ou fichier. Vérification d'intégrité.",
    ["hash", "SHA-256", "MD5", "empreinte numérique", "checksum", "intégrité fichier"]
  ),
  secrets: makeMeta(
    "Générateur de Secrets — UUID, clés API, tokens",
    "Générez des UUID v4, clés API, tokens sécurisés et mots de passe forts. 100% local.",
    ["générateur UUID", "clé API", "token sécurisé", "mot de passe fort", "générateur secrets"]
  ),
  "json-formatter": makeMeta(
    "JSON Formatter — Formater et valider du JSON",
    "Formatez, validez et embellissez votre JSON. Indentation automatique et détection d'erreurs.",
    ["JSON formatter", "valider JSON", "formater JSON", "JSON beautifier"]
  ),
};
