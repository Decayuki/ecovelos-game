'use client';

import { GameState } from '@/lib/types';

interface CompanyInfoProps {
  gameState: GameState;
}

export default function CompanyInfo({ gameState }: CompanyInfoProps) {
  // Effets informatifs accumulés (à stocker dans gameState si nécessaire)
  // Pour l'instant, affichage basé sur l'état actuel
  
  const infos = [];
  
  // Qualité des vélos (dérivé de maintenance) - ÉcoVélos only
  if (gameState.monthlyCosts.maintenance !== undefined) {
    if (gameState.monthlyCosts.maintenance <= 1800) {
      infos.push({ label: 'Qualité vélos', value: 'Excellente', color: 'text-emerald-600' });
    } else if (gameState.monthlyCosts.maintenance <= 2500) {
      infos.push({ label: 'Qualité vélos', value: 'Bonne', color: 'text-green-600' });
    } else {
      infos.push({ label: 'Qualité vélos', value: 'Moyenne', color: 'text-amber-600' });
    }
  }
  
  // Vandalisme (dérivé de coût) - ÉcoVélos only
  if (gameState.monthlyCosts.vandalism !== undefined) {
    if (gameState.monthlyCosts.vandalism <= 1000) {
      infos.push({ label: 'Protection', value: 'Excellente (géolocalisation)', color: 'text-emerald-600' });
    } else if (gameState.monthlyCosts.vandalism <= 2000) {
      infos.push({ label: 'Protection', value: 'Bonne (antivols)', color: 'text-green-600' });
    } else {
      infos.push({ label: 'Protection', value: 'Faible', color: 'text-red-600' });
    }
  }
  
  // Taux d'utilisation (ÉcoVélos)
  if (gameState.utilizationRate !== undefined) {
    const rate = (gameState.utilizationRate * 100).toFixed(0);
    let color = 'text-gray-700';
    if (gameState.utilizationRate > 0.4) color = 'text-emerald-600';
    else if (gameState.utilizationRate > 0.3) color = 'text-green-600';
    else if (gameState.utilizationRate < 0.25) color = 'text-amber-600';
    
    infos.push({ label: 'Taux d\'utilisation', value: `${rate}%`, color });
  }
  
  // Satisfaction client
  if (gameState.customerSatisfaction !== undefined) {
    let clientColor = 'text-gray-700';
    if (gameState.customerSatisfaction > 70) clientColor = 'text-emerald-600';
    else if (gameState.customerSatisfaction > 50) clientColor = 'text-green-600';
    else if (gameState.customerSatisfaction < 40) clientColor = 'text-red-600';
    infos.push({ label: 'Satisfaction clients', value: `${gameState.customerSatisfaction}/100`, color: clientColor });
  }
  
  // Satisfaction employés
  if (gameState.employeeSatisfaction !== undefined) {
    let empColor = 'text-gray-700';
    if (gameState.employeeSatisfaction > 70) empColor = 'text-emerald-600';
    else if (gameState.employeeSatisfaction > 50) empColor = 'text-green-600';
    else if (gameState.employeeSatisfaction < 40) empColor = 'text-red-600';
    infos.push({ label: 'Satisfaction employés', value: `${gameState.employeeSatisfaction}/100`, color: empColor });
  }
  
  // Réputation
  if (gameState.reputation !== undefined) {
    let repColor = 'text-gray-700';
    if (gameState.reputation > 70) repColor = 'text-emerald-600';
    else if (gameState.reputation > 50) repColor = 'text-green-600';
    else if (gameState.reputation < 40) repColor = 'text-red-600';
    infos.push({ label: 'Réputation', value: `${gameState.reputation}/100`, color: repColor });
  }
  
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-800">📊 Infos entreprise</h3>
      <div className="space-y-2">
        {infos.map((info, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs text-gray-600">{info.label}</span>
            <span className={`text-xs font-semibold ${info.color}`}>{info.value}</span>
          </div>
        ))}
      </div>
      
      {/* Alertes risques */}
      {((gameState.turnoverRisk || 0) > 50 || (gameState.strikeRisk || 0) > 50 || (gameState.badBuzzRisk || 0) > 50) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Alertes</p>
          <div className="space-y-1">
            {(gameState.turnoverRisk || 0) > 50 && (
              <p className="text-xs text-red-600">• Risque de turnover élevé</p>
            )}
            {(gameState.strikeRisk || 0) > 50 && (
              <p className="text-xs text-red-600">• Risque de grève</p>
            )}
            {(gameState.badBuzzRisk || 0) > 50 && (
              <p className="text-xs text-red-600">• Risque de bad buzz</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
