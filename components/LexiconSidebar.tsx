import { useState } from 'react';

interface LexiconEntry {
  term: string;
  definition: string;
  explanation: string;
  example?: string;
}

const LEXICON: LexiconEntry[] = [
  {
    term: "Budget",
    definition: "Votre trésorerie actuelle, l'argent disponible dans l'entreprise.",
    explanation: "Le budget représente l'argent que vous avez en caisse. Il évolue selon vos revenus (ventes) et vos dépenses (salaires, achats, etc.). Si votre budget devient négatif, vous êtes en déficit : vous devez de l'argent (dettes).",
    example: "Budget de 50 000€ = vous avez 50k€ disponibles pour investir ou payer vos charges."
  },
  {
    term: "Chiffre d'Affaires (CA)",
    definition: "Total des ventes réalisées sur une période.",
    explanation: "Le CA représente tout l'argent que vous encaissez grâce à vos ventes. Attention : ce n'est PAS votre profit ! Il faut enlever toutes les dépenses pour connaître ce qui vous reste vraiment.",
    example: "Si vous vendez 100 produits à 50€ = CA de 5 000€"
  },
  {
    term: "Valeur Ajoutée (VA)",
    definition: "La richesse créée par votre activité.",
    explanation: "Formule : VA = Chiffre d'Affaires - Consommations Intermédiaires. Les consommations intermédiaires sont les achats nécessaires à votre production (matières premières, fournitures, etc.). La VA mesure ce que vous créez réellement comme richesse, avant de la répartir entre salariés, État, actionnaires, etc.",
    example: "CA 10 000€ - Achats 4 000€ = VA de 6 000€"
  },
  {
    term: "Consommations Intermédiaires",
    definition: "Achats nécessaires pour produire (matières, fournitures, services).",
    explanation: "Ce sont tous les biens et services que vous achetez pour produire votre offre. Dans une entreprise de cosmétiques : ingrédients, flacons, étiquettes. Dans un resto : aliments, boissons. Ces achats ne créent pas de valeur, ils sont juste transformés.",
    example: "Acheter des ingrédients pour fabriquer une crème = consommation intermédiaire"
  },
  {
    term: "Valeur Actionnariale",
    definition: "Modèle de gestion centré sur le profit pour les actionnaires.",
    explanation: "Dans cette logique, l'objectif principal de l'entreprise est de maximiser les dividendes versés aux actionnaires (propriétaires). Cela peut conduire à privilégier les profits court-terme au détriment des salariés, de l'environnement ou de la pérennité.",
  },
  {
    term: "Valeur Partenariale",
    definition: "Modèle de gestion qui prend en compte toutes les parties prenantes.",
    explanation: "Approche plus équilibrée : l'entreprise cherche à satisfaire actionnaires, salariés, clients, fournisseurs, société et environnement. L'idée est qu'une entreprise pérenne doit créer de la valeur pour tous, pas seulement pour ses propriétaires.",
  },
  {
    term: "Répartition de la VA",
    definition: "Comment la richesse créée est distribuée entre les parties prenantes.",
    explanation: "La VA est répartie entre : 1) Salariés (salaires, charges sociales), 2) État (impôts, taxes), 3) Prêteurs (intérêts), 4) Actionnaires (dividendes), 5) Entreprise (investissements, réserves). Les choix de répartition révèlent les priorités de l'entreprise.",
  },
  {
    term: "Score Économique",
    definition: "Mesure de votre rentabilité et viabilité financière.",
    explanation: "Ce score évalue si votre entreprise est rentable. Il prend en compte votre budget, vos revenus, vos coûts, et votre VA. Un score faible signifie que vous perdez de l'argent ou que vous êtes trop juste financièrement.",
  },
  {
    term: "Score Social",
    definition: "Mesure de votre impact sur les employés et parties prenantes.",
    explanation: "Ce score évalue comment vous traitez vos salariés, partenaires et la société. Bien payer vos employés, offrir de bonnes conditions = score élevé. Licencier, réduire les salaires = score faible.",
  },
  {
    term: "Score Environnemental",
    definition: "Mesure de votre impact écologique.",
    explanation: "Ce score évalue vos choix en matière d'environnement. Utiliser des matériaux bio, circuits courts, énergies renouvelables = score élevé. Polluer, gaspiller = score faible.",
  }
];

export default function LexiconSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  return (
    <>
      {/* Bouton Toggle (style Notion) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-40 w-10 h-10 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center"
        aria-label="Lexique"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </button>

      {/* Sidebar (style Notion) */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white border-l-2 border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Lexique</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-65px)] p-4">
          <p className="text-xs text-gray-600 mb-4">
            Concepts clés pour comprendre le jeu
          </p>

          <div className="space-y-2">
            {LEXICON.map((entry) => (
              <div key={entry.term} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Term header (collapsible) */}
                <button
                  onClick={() => setExpandedTerm(expandedTerm === entry.term ? null : entry.term)}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-sm text-gray-900">{entry.term}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transform transition-transform ${
                      expandedTerm === entry.term ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {expandedTerm === entry.term && (
                  <div className="p-3 pt-0 space-y-2 bg-gray-50">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Définition :</p>
                      <p className="text-xs text-gray-600">{entry.definition}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Explication :</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{entry.explanation}</p>
                    </div>
                    {entry.example && (
                      <div className="stat-card p-2 bg-emerald-50 border border-emerald-200">
                        <p className="text-xs text-emerald-800">
                          <strong>Exemple :</strong> {entry.example}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
