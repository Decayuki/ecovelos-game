'use client';

interface TimeTransitionProps {
  fromPhase: number;
  toPhase: number;
  budgetChange: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  months: number;
  onContinue: () => void;
}

export default function TimeTransition({ 
  fromPhase, 
  toPhase, 
  budgetChange, 
  monthlyRevenue,
  monthlyCosts,
  months,
  onContinue 
}: TimeTransitionProps) {
  const cashFlow = monthlyRevenue - monthlyCosts;
  const isPositive = cashFlow >= 0;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="card p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⏱️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {months} mois plus tard...
          </h2>
          <p className="text-sm text-gray-600">
            Transition de la Phase {fromPhase} vers la Phase {toPhase}
          </p>
          {toPhase === 3 && (
            <p className="text-xs text-amber-600 mt-2 font-medium">
              🚀 Time skip : Votre entreprise a considérablement grandi !
            </p>
          )}
        </div>

        <div className="stat-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Bilan de la période</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CA mensuel moyen</span>
              <span className="text-sm font-semibold text-gray-900">{monthlyRevenue.toLocaleString()}€</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Coûts mensuels moyens</span>
              <span className="text-sm font-semibold text-gray-900">{monthlyCosts.toLocaleString()}€</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Cash-flow mensuel</span>
                <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{cashFlow.toLocaleString()}€
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Période ({months} mois)</span>
              <span className={`text-sm font-semibold ${budgetChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {budgetChange >= 0 ? '+' : ''}{budgetChange.toLocaleString()}€
              </span>
            </div>
          </div>
        </div>

        <div className={`stat-card p-4 mb-6 border-l-4 ${budgetChange >= 0 ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
          <p className="text-sm font-medium text-gray-800">
            {budgetChange >= 0 ? '📈 Période bénéficiaire' : '📉 Période déficitaire'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {budgetChange >= 0 
              ? 'Votre trésorerie a augmenté. Continuez sur cette lancée !'
              : 'Attention : vous perdez de l\'argent. Il faut inverser la tendance.'}
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={onContinue}
            className="btn-primary"
          >
            CONTINUER VERS LA PHASE {toPhase}
          </button>
        </div>
      </div>
    </div>
  );
}
