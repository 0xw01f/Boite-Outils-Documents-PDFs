# Boîte à Outils PDF & Documents

> Suite d'outils PDF et Image 100 % locale. Aucune donnée ne quitte votre navigateur.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🚀 Fonctionnalités

**PDF**
- Fusionner, diviser, compresser, protéger par mot de passe
- Rotation, suppression et réorganisation de pages
- Extraction de pages et conversion PDF ↔ Images
- Filigrane texte, gestion des métadonnées

**Images**
- Compression, conversion de format, redimensionnement
- Filigrane texte

**Utilitaires**
- Générateur de secrets (UUID, clés API, tokens, mots de passe)
- Hash de texte et fichiers
- Formateur et validateur JSON

---

## 🔒 Confidentialité par design

Tous les traitements s'exécutent **exclusivement dans votre navigateur** via des Web Workers et des bibliothèques côté client :

- [`pdf-lib`](https://pdf-lib.js.org/) — manipulation PDF
- [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) — rendu et extraction PDF
- [`jspdf`](https://github.com/parallax/jsPDF) — génération PDF
- [`browser-image-compression`](https://github.com/Donaldcwl/browser-image-compression) — compression image
- [`jszip`](https://stuk.github.io/jszip/) — création d'archives ZIP

**Aucun serveur backend. Aucune donnée n'est envoyée, stockée ou traitée à l'extérieur.**

---

## 🛠 Stack technique

- [Next.js](https://nextjs.org/) 16 (App Router, export statique)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) + Radix UI primitives
- [Lucide React](https://lucide.dev/) — icônes

---

## 📦 Installation

```bash
# Cloner le repo
git clone https://github.com/0xw01f/Boite-Outils-Documents-PDFs.git
cd pdf-tools

# Installer les dépendances (le postinstall copie automatiquement le worker PDF.js)
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build
```

> **Note** : Le script `postinstall` copie `pdf.worker.min.mjs` depuis `node_modules/pdfjs-dist/build/` vers `public/`. Ce fichier binaire (~1,2 Mo) n'est pas versionné.

---

## 🏗 Architecture

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── tools/*/            # Une page par outil
│   ├── layout.tsx          # Layout racine + SEO
│   └── page.tsx            # Page d'accueil
├── components/             # Composants partagés
│   ├── ui/                 # shadcn/ui
│   ├── file-drop-zone.tsx
│   ├── preview-panel.tsx
│   ├── pdf-page-grid.tsx
│   └── tool-layout.tsx
├── features/               # Modules fonctionnels isolés
│   ├── merge-pdf/
│   ├── compress-pdf/
│   ├── watermark-pdf/
│   ├── secrets/
│   ├── hash/
│   └── ...
├── lib/                    # Utilitaires
│   ├── tools.ts            # Définition des outils
│   ├── seo.ts              # Métadonnées SEO
│   ├── sanitize.ts         # Sanitization des entrées
│   └── random.ts           # Générateur cryptographique
└── types/                  # Types TypeScript globaux
```

---

## 📝 Licence

Ce projet est sous licence [MIT](LICENSE).

Les bibliothèques tierces utilisées (pdf-lib, pdfjs-dist, jspdf, shadcn/ui, etc.) sont soumises à leurs propres licences open-source respectives.

---


