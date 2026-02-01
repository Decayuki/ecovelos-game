'use client';

import { GameState } from '@/lib/types';
import { calculateVA } from '@/lib/calculations';
import InfoTooltip from './InfoTooltip';
import { getBudgetTooltip, getVATooltip, getCATooltip, getEmployeesTooltip } from '@/lib/tooltips';
import CompanyInfo from './CompanyInfo';

interface DashboardProps {
  state: GameState;
  showHelp?: boolean;
}

export default function Dashboard({ state, showHelp = false }: DashboardProps) {
  const va = calculateVA(state.monthlyRevenue, state.monthlyCosts);
  const totalCosts = Object.values(state.monthlyCosts).filter((v): v is number => v !== undefined).reduce((sum, cost) => sum + cost, 0);
  
  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Tableau de bord</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1 flex items-center">
            Budget
            {showHelp && <InfoTooltip {...getBudgetTooltip(state.budget)} />}
          </p>
          <p className="text-2xl font-semibold text-gray-900">{state.budget.toLocaleString()}€</p>
        </div>
        
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1 flex items-center">
            CA mensuel
            {showHelp && <InfoTooltip {...getCATooltip(state.monthlyRevenue)} />}
          </p>
          <p className="text-2xl font-semibold text-gray-900">{state.monthlyRevenue.toLocaleString()}€</p>
        </div>
        
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Coûts mensuels</p>
          <p className="text-2xl font-semibold text-gray-900">{totalCosts.toLocaleString()}€</p>
        </div>
        
        <div className={`stat-card ${va >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-gray-500 mb-1 flex items-center">
            Valeur Ajoutée
            {showHelp && <InfoTooltip {...getVATooltip(va)} />}
          </p>
          <p className={`text-2xl font-semibold ${va >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {va >= 0 ? '+' : ''}{va.toLocaleString()}€
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-5">
        {state.fleet !== undefined && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Flotte</p>
            <p className="text-xl font-semibold text-gray-900">{state.fleet}</p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1 flex items-center justify-center">
            Salariés
            {showHelp && <InfoTooltip {...getEmployeesTooltip(state.employees)} />}
          </p>
          <p className="text-xl font-semibold text-gray-900">{state.employees}</p>
        </div>
        
        {state.utilizationRate !== undefined && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Utilisation</p>
            <p className="text-xl font-semibold text-gray-900">{Math.round(state.utilizationRate * 100)}%</p>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Répartition des coûts</h3>
        <div className="space-y-2.5">
          {Object.entries(state.monthlyCosts).filter(([_, value]) => value !== undefined).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{translateCost(key)}</span>
              <span className="text-sm font-medium text-gray-900">{value!.toLocaleString()}€</span>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      <CompanyInfo gameState={state} />
    </div>
  );
}

function translateCost(key: string): string {
  const translations: Record<string, string> = {
    salaries: 'Salaires',
    materials: 'Matières premières',
    maintenance: 'Maintenance',
    rent: 'Loyer',
    insurance: 'Assurances',
    marketing: 'Marketing',
    vandalism: 'Vandalisme/Vols'
  };
  return translations[key] || key;
}
