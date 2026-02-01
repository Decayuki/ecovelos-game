// Mapping entre thèmes et leurs phases
// Tous les thèmes ont maintenant leurs propres phases complètes

import ecoVelosData from './game-data.json';
import luxeGlowData from './game-data-luxeglow.json';
import ironFistData from './game-data-ironfist.json';
import canvasCoData from './game-data-canvasco.json';
import fcAmbitionData from './game-data-fcambition.json';
import urbanThreadData from './game-data-urbanthread.json';
import leComptoirData from './game-data-lecomptoir.json';
import greenBoxData from './game-data-greenbox.json';
import streamLabData from './game-data-streamlab.json';
import petCareData from './game-data-petcare.json';

export const getThemePhases = (themeId: string) => {
  switch (themeId) {
    case 'ecovelos':
      return ecoVelosData.phases;
    
    case 'cosmetique':
      return luxeGlowData.phases;
    
    case 'boxe':
      return ironFistData.phases;
    
    case 'art':
      return canvasCoData.phases;
    
    case 'foot':
      return fcAmbitionData.phases;
    
    case 'mode':
      return urbanThreadData.phases;
    
    case 'resto':
      return leComptoirData.phases;
    
    case 'greenbox':
      return greenBoxData.phases;
    
    case 'streamlab':
      return streamLabData.phases;
    
    case 'petcare':
      return petCareData.phases;
    
    default:
      return ecoVelosData.phases;
  }
};

export const getThemeInitialState = (themeId: string) => {
  switch (themeId) {
    case 'ecovelos':
      return ecoVelosData.initial;
    
    case 'cosmetique':
      return luxeGlowData.initial;
    
    case 'boxe':
      return ironFistData.initial;
    
    case 'art':
      return canvasCoData.initial;
    
    case 'foot':
      return fcAmbitionData.initial;
    
    case 'mode':
      return urbanThreadData.initial;
    
    case 'resto':
      return leComptoirData.initial;
    
    case 'greenbox':
      return greenBoxData.initial;
    
    case 'streamlab':
      return streamLabData.initial;
    
    case 'petcare':
      return petCareData.initial;
    
    default:
      return ecoVelosData.initial;
  }
};

export const hasCustomPhases = (themeId: string): boolean => {
  return [
    'ecovelos',
    'cosmetique',
    'boxe',
    'art',
    'foot',
    'mode',
    'resto',
    'greenbox',
    'streamlab',
    'petcare'
  ].includes(themeId);
};
