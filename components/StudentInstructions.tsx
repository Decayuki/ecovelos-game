export default function StudentInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div className="card p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          📚 Travail à Rendre
        </h2>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          Fermer ×
        </button>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 mb-6">
          Maintenant que vous avez expérimenté la gestion d'une entreprise, vous allez structurer et rédiger un cours sur le chapitre 12.
        </p>

        <div className="card p-6 mb-6 bg-emerald-50 border border-emerald-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Étape 1 : Plan Détaillé</h3>
          <p className="text-sm text-gray-700 mb-3">
            D'après votre compréhension de la simulation, comment devrait être structuré le cours ?
          </p>
          <ul className="text-sm text-gray-700 space-y-2 ml-4">
            <li>• Introduction (contexte et enjeux)</li>
            <li>• Parties principales (2-3 grandes parties)</li>
            <li>• Sous-parties avec exemples concrets</li>
          </ul>
          <p className="text-xs text-amber-700 mt-3 font-medium">
            ⚠️ Cette étape doit être VALIDÉE par ton merveilleux professeur avant de continuer !
          </p>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Étape 2 : Rédaction du Cours</h3>
          <p className="text-sm text-gray-700 mb-3">
            Une fois votre plan validé, rédigez le cours complet (3-5 pages).
          </p>
          <div className="text-sm text-gray-700">
            <strong>Sources autorisées :</strong>
            <ul className="mt-2 space-y-1 ml-4">
              <li>✓ Vos notes de la simulation</li>
              <li>✓ Manuels de SGN</li>
              <li>✓ ChatGPT (mais reformuler avec vos mots !)</li>
            </ul>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Étape 3 : Exercices de Compréhension</h3>
          <p className="text-sm text-gray-700 mb-3">
            Créez 2 exercices pour vérifier la compréhension de la notion.
          </p>
          <div className="text-sm text-gray-700">
            <strong>Types possibles :</strong>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• QCM (10 questions)</li>
              <li>• Cas pratique (calcul VA)</li>
              <li>• Étude de cas courte</li>
              <li>• Questions argumentées</li>
            </ul>
          </div>
        </div>

        <div className="card p-6 bg-red-50 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            ⚠️ IMPORTANT - Détection IA
          </h3>
          <p className="text-sm text-red-800 mb-3 font-medium">
            "N'abusez pas de ChatGPT ou j'appelle les parents d'Ibrahim et de Fatih"
          </p>
          <div className="text-sm text-gray-700">
            <p className="mb-2"><strong>Autorisé :</strong></p>
            <ul className="space-y-1 ml-4 mb-3">
              <li>✓ Utiliser GPT pour des recherches</li>
              <li>✓ S'inspirer de contenus trouvés</li>
              <li>✓ Reformuler avec vos propres mots</li>
            </ul>
            <p className="mb-2"><strong>Interdit :</strong></p>
            <ul className="space-y-1 ml-4">
              <li>✗ Copier-coller brut de GPT</li>
              <li>✗ Ne pas comprendre ce que vous rendez</li>
              <li>✗ Générer sans réfléchir</li>
            </ul>
          </div>
        </div>

        <div className="stat-card p-6 mt-6 text-center">
          <p className="text-sm text-gray-700">
            💡 <strong>Conseil :</strong> Jouez plusieurs fois à la simulation pour bien comprendre les concepts avant de rédiger !
          </p>
        </div>
      </div>
    </div>
  );
}
