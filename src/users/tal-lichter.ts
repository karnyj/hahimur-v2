import type { PredictionsState } from '../shared/types'

export const predictions: PredictionsState = {
  // Group A – Mexico, South Africa, South Korea, Czech Republic
  A1: { home: 2, away: 0 }, // Mexico vs South Africa
  A2: { home: 1, away: 1 }, // South Korea vs Czech Republic
  A3: { home: 0, away: 1 }, // Czech Republic vs South Africa
  A4: { home: 2, away: 1 }, // Mexico vs South Korea
  A5: { home: 1, away: 2 }, // Czech Republic vs Mexico
  A6: { home: 0, away: 2 }, // South Africa vs South Korea

  // Group B – Canada, Bosnia, Qatar, Switzerland
  B1: { home: 2, away: 1 }, // Canada vs Bosnia
  B2: { home: 0, away: 2 }, // Qatar vs Switzerland
  B3: { home: 1, away: 0 }, // Switzerland vs Bosnia
  B4: { home: 3, away: 0 }, // Canada vs Qatar
  B5: { home: 1, away: 2 }, // Switzerland vs Canada
  B6: { home: 1, away: 0 }, // Bosnia vs Qatar

  // Group C – Brazil, Morocco, Haiti, Scotland
  C1: { home: 3, away: 1 }, // Brazil vs Morocco
  C2: { home: 0, away: 2 }, // Haiti vs Scotland
  C3: { home: 2, away: 0 }, // Scotland vs Morocco
  C4: { home: 4, away: 0 }, // Brazil vs Haiti
  C5: { home: 0, away: 3 }, // Scotland vs Brazil
  C6: { home: 2, away: 1 }, // Morocco vs Haiti

  // Group D – United States, Paraguay, Australia, Turkey
  D1: { home: 2, away: 0 }, // United States vs Paraguay
  D2: { home: 1, away: 1 }, // Australia vs Turkey
  D3: { home: 1, away: 0 }, // United States vs Australia
  D4: { home: 2, away: 1 }, // Turkey vs Paraguay
  D5: { home: 1, away: 2 }, // Turkey vs United States
  D6: { home: 0, away: 1 }, // Paraguay vs Australia

  // Group E – Germany, Curaçao, Ivory Coast, Ecuador
  E1: { home: 4, away: 0 }, // Germany vs Curaçao
  E2: { home: 1, away: 2 }, // Ivory Coast vs Ecuador
  E3: { home: 2, away: 1 }, // Germany vs Ivory Coast
  E4: { home: 2, away: 0 }, // Ecuador vs Curaçao
  E5: { home: 0, away: 3 }, // Curaçao vs Ivory Coast
  E6: { home: 1, away: 2 }, // Ecuador vs Germany

  // Group F – Netherlands, Japan, Sweden, Tunisia
  F1: { home: 2, away: 1 }, // Netherlands vs Japan
  F2: { home: 2, away: 0 }, // Sweden vs Tunisia
  F3: { home: 1, away: 1 }, // Netherlands vs Sweden
  F4: { home: 0, away: 2 }, // Tunisia vs Japan
  F5: { home: 1, away: 2 }, // Japan vs Sweden
  F6: { home: 0, away: 2 }, // Tunisia vs Netherlands

  // Group G – Belgium, Egypt, Iran, New Zealand
  G1: { home: 3, away: 0 }, // Belgium vs Egypt
  G2: { home: 1, away: 0 }, // Iran vs New Zealand
  G3: { home: 2, away: 0 }, // Belgium vs Iran
  G4: { home: 1, away: 1 }, // New Zealand vs Egypt
  G5: { home: 1, away: 2 }, // Egypt vs Iran
  G6: { home: 0, away: 2 }, // New Zealand vs Belgium

  // Group H – Spain, Cape Verde, Saudi Arabia, Uruguay
  H1: { home: 3, away: 0 }, // Spain vs Cape Verde
  H2: { home: 0, away: 2 }, // Saudi Arabia vs Uruguay
  H3: { home: 2, away: 0 }, // Spain vs Saudi Arabia
  H4: { home: 1, away: 0 }, // Uruguay vs Cape Verde
  H5: { home: 0, away: 1 }, // Cape Verde vs Saudi Arabia
  H6: { home: 1, away: 3 }, // Uruguay vs Spain

  // Group I – France, Senegal, Iraq, Norway
  I1: { home: 2, away: 1 }, // France vs Senegal
  I2: { home: 0, away: 2 }, // Iraq vs Norway
  I3: { home: 3, away: 0 }, // France vs Iraq
  I4: { home: 2, away: 1 }, // Norway vs Senegal
  I5: { home: 0, away: 2 }, // Norway vs France
  I6: { home: 1, away: 0 }, // Senegal vs Iraq

  // Group J – Argentina, Algeria, Austria, Jordan
  J1: { home: 3, away: 0 }, // Argentina vs Algeria
  J2: { home: 1, away: 0 }, // Austria vs Jordan
  J3: { home: 2, away: 0 }, // Argentina vs Austria
  J4: { home: 0, away: 1 }, // Jordan vs Algeria
  J5: { home: 1, away: 2 }, // Algeria vs Austria
  J6: { home: 0, away: 3 }, // Jordan vs Argentina

  // Group K – Portugal, DR Congo, Uzbekistan, Colombia
  K1: { home: 3, away: 0 }, // Portugal vs DR Congo
  K2: { home: 0, away: 2 }, // Uzbekistan vs Colombia
  K3: { home: 2, away: 0 }, // Portugal vs Uzbekistan
  K4: { home: 3, away: 1 }, // Colombia vs DR Congo
  K5: { home: 1, away: 2 }, // Colombia vs Portugal
  K6: { home: 0, away: 1 }, // DR Congo vs Uzbekistan

  // Group L – England, Croatia, Ghana, Panama
  L1: { home: 2, away: 1 }, // England vs Croatia
  L2: { home: 2, away: 0 }, // Ghana vs Panama
  L3: { home: 3, away: 0 }, // England vs Ghana
  L4: { home: 0, away: 2 }, // Panama vs Croatia
  L5: { home: 0, away: 3 }, // Panama vs England
  L6: { home: 1, away: 2 }, // Croatia vs Ghana

  // Round of 32 (IDs 73–88)
  '73':  { home: 2, away: 1 },
  '74':  { home: 1, away: 0 },
  '75':  { home: 2, away: 0 },
  '76':  { home: 3, away: 1 },
  '77':  { home: 1, away: 2 },
  '78':  { home: 0, away: 1 },
  '79':  { home: 2, away: 1 },
  '80':  { home: 1, away: 0 },
  '81':  { home: 3, away: 0 },
  '82':  { home: 2, away: 1 },
  '83':  { home: 1, away: 0 },
  '84':  { home: 2, away: 3 },
  '85':  { home: 0, away: 2 },
  '86':  { home: 1, away: 2 },
  '87':  { home: 2, away: 0 },
  '88':  { home: 1, away: 3 },

  // Round of 16 (IDs 89–96)
  '89':  { home: 2, away: 0 },
  '90':  { home: 1, away: 2 },
  '91':  { home: 3, away: 1 },
  '92':  { home: 0, away: 1 },
  '93':  { home: 2, away: 1 },
  '94':  { home: 1, away: 0 },
  '95':  { home: 0, away: 2 },
  '96':  { home: 3, away: 2 },

  // Quarter-finals (IDs 97–100)
  '97':  { home: 2, away: 1 },
  '98':  { home: 0, away: 1 },
  '99':  { home: 3, away: 0 },
  '100': { home: 1, away: 2 },

  // Semi-finals (IDs 101–102)
  '101': { home: 2, away: 1 },
  '102': { home: 0, away: 1 },

  // Third place (ID 103)
  '103': { home: 2, away: 1 },

  // Final (ID 104)
  '104': { home: 3, away: 1 },
}

export const topGoalscorer = 'קיליאן מבאפה'
