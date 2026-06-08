import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Server, Eye, FileCheck, Lock, Mail, Code } from "lucide-react";

export const metadata = {
  title: "Mentions légales & Confidentialité",
  description: "Mentions légales, politique de confidentialité et conditions d'utilisation de Boîte à Outils PDF & Documents.",
};

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
          <ShieldCheck className="h-4 w-4" />
          Zéro donnée collectée
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Mentions légales & Confidentialité
        </h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>Éditeur du site</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>Boîte à Outils PDF & Documents</strong> est un service web gratuit proposé
            sous forme d'application web progressive (PWA).
          </p>
          <p>
            Ce service est hébergé de maniere entierement statique. Aucune donnée personnelle
            n'est collectée, stockee ou traitée sur un serveur.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Politique de confidentialité</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p className="font-semibold text-base">
            Engagement fondamental
          </p>
          <p>
            <strong>Aucun fichier n'est jamais envoyé sur un serveur.</strong> Tout le traitement
            s'effectué localement dans votre navigateur web. Vos documents ne quittent jamais
            votre appareil.
          </p>

          <h3 className="font-semibold text-base">Données traitées</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Documents PDF et images</strong> : charges temporairement en mémoire vive
              (RAM) de votre appareil pour être traites par les bibliothèques JavaScript côté client.
            </li>
            <li>
              <strong>Aucune persistance</strong> : les fichiers sont automatiquement supprimes
              de la mémoire lorsque vous fermez l'onglet, rechargez la page ou cliquez sur "Fermer"
              dans l'aperçu.
            </li>
            <li>
              <strong>Aucune collecte</strong> : nous ne collectons, ne stockons et ne transmettons
              aucun fichier, métadonnée ou contenu de document.
            </li>
          </ul>

          <h3 className="font-semibold text-base">Cookies & traceurs</h3>
          <p>
            Ce site n'utilise <strong>aucun cookie</strong> de tracage, aucun pixel espion et aucun
            service d'analyse tierce (Google Analytics, etc.). Seuls des cookies techniques de session
            peuvent être utilisés par le framework Next.js pour le fonctionnement de l'application.
          </p>

          <h3 className="font-semibold text-base">Hébergement</h3>
          <p>
            Le site est servi sous forme de fichiers statiques. Aucun traitement serveur n'est
            effectué sur vos documents. Les bibliothèques de traitement (pdf-lib, pdfjs-dist,
            jspdf) s'exécutent entièrement dans votre navigateur.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Conditions d'utilisation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <h3 className="font-semibold text-base">Objet du service</h3>
          <p>
            Boîte à Outils PDF & Documents fournit des utilitaires de manipulation de documents
            PDF et d'images, executes exclusivement côté client dans le navigateur de l'utilisateur.
          </p>

          <h3 className="font-semibold text-base">Responsabilités de l'utilisateur</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Vous etes seul responsable des documents que vous traitez avec cet outil.
            </li>
            <li>
              Ce service est fourni a titre indicatif. Nous recommandons de conserver une copie
              de sauvegarde de vos documents originaux avant toute modification.
            </li>
            <li>
              L'utilisateur s'engage a ne pas utiliser le service pour des activités illégales
              (contrefacon, fraude, violation de droits d'auteur, etc.).
            </li>
          </ul>

          <h3 className="font-semibold text-base">Limitation de responsabilite</h3>
          <p>
            Le service est fourni "en l'état", sans garantie d'aucune sorte. L'éditeur ne peut
            être tenu responsable d'éventuelles pertes de données, altérations de documents ou
            erreurs de traitement. L'utilisateur est invité a verifier ses documents avant utilisation.
          </p>

          <h3 className="font-semibold text-base">Propriete intellectuelle</h3>
          <p>
            Le code source, le design et l'identite visuelle de ce site sont la propriete de
            l'éditeur. Les bibliothèques tierces utilisées (pdf-lib, pdfjs-dist,
            jspdf, shadcn/ui, etc.) sont soumises a leurs propres licences open-source respectives.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Crédits & Bibliothèques</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            Ce site est construit grace aux technologies et bibliothèques open-source suivantes :
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            <li className="p-2 rounded-md bg-muted/50">
              <strong>Next.js 15</strong> — Framework React
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>TypeScript</strong> — Langage type
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>Tailwind CSS</strong> — Framework CSS
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>shadcn/ui</strong> — Composants UI
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>pdf-lib</strong> — Manipulation PDF
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>pdfjs-dist</strong> — Rendu PDF
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>jspdf</strong> — Generation PDF
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>browser-image-compression</strong> — Compression images
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>JSZip</strong> — Compression ZIP
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>Lucide React</strong> — Icones
            </li>
            <li className="p-2 rounded-md bg-muted/50">
              <strong>Radix UI</strong> — Primitives accessibles
            </li>
          </ul>
          <p className="text-muted-foreground">
            Aucune métadonnée de ces bibliothèques n'est insérée dans les documents que vous générez.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Droit à l'oubli & suppression</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            Conformement au RGPD, vous disposez d'un droit d'acces, de rectification et de
            suppression de vos données personnelles. Comme <strong>aucune donnée n'est collectée</strong>,
            aucune action n'est necessaire de votre part : vos documents existent uniquement dans
            votre navigateur et disparaissent automatiquement.
          </p>
          <p>
            Pour toute question relative à la confidentialité, vous pouvez nous contacter
            (voir ci-dessous).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Contact</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          <p>
            Pour toute question concernant les mentions légales, la confidentialité ou le
            fonctionnement du service :
          </p>
          <p className="mt-2 font-mono text-muted-foreground">
            contact@argus-labs.fr
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center text-sm text-muted-foreground pb-8">
        <p>
          &copy; {new Date().getFullYear()} Boîte à Outils PDF & Documents —
          <Link href="/" className="underline hover:text-foreground ml-1">
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
