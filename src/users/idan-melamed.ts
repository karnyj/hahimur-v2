import type { PredictionsState } from '../shared/types'

export const predictions: PredictionsState = {
  // Group A – Mexico, South Africa, South Korea, Czech Republic
  A1: { home: 1, away: 0 }, // Mexico vs South Africa
  A2: { home: 2, away: 1 }, // South Korea vs Czech Republic
  A3: { home: 1, away: 1 }, // Czech Republic vs South Africa
  A4: { home: 2, away: 0 }, // Mexico vs South Korea
  A5: { home: 0, away: 2 }, // Czech Republic vs Mexico
  A6: { home: 1, away: 2 }, // South Africa vs South Korea

  // Group B – Canada, Bosnia, Qatar, Switzerland
  B1: { home: 1, away: 1 }, // Canada vs Bosnia
  B2: { home: 0, away: 3 }, // Qatar vs Switzerland
  B3: { home: 2, away: 0 }, // Switzerland vs Bosnia
  B4: { home: 2, away: 0 }, // Canada vs Qatar
  B5: { home: 0, away: 1 }, // Switzerland vs Canada
  B6: { home: 2, away: 1 }, // Bosnia vs Qatar

  // Group C – Brazil, Morocco, Haiti, Scotland
  C1: { home: 2, away: 0 }, // Brazil vs Morocco
  C2: { home: 1, away: 2 }, // Haiti vs Scotland
  C3: { home: 1, away: 0 }, // Scotland vs Morocco
  C4: { home: 5, away: 0 }, // Brazil vs Haiti
  C5: { home: 1, away: 2 }, // Scotland vs Brazil
  C6: { home: 3, away: 0 }, // Morocco vs Haiti

  // Group D – United States, Paraguay, Australia, Turkey
  D1: { home: 1, away: 1 }, // United States vs Paraguay
  D2: { home: 2, away: 2 }, // Australia vs Turkey
  D3: { home: 2, away: 0 }, // United States vs Australia
  D4: { home: 1, away: 0 }, // Turkey vs Paraguay
  D5: { home: 0, away: 2 }, // Turkey vs United States
  D6: { home: 1, away: 1 }, // Paraguay vs Australia

  // Group E – Germany, Curaçao, Ivory Coast, Ecuador
  E1: { home: 3, away: 0 }, // Germany vs Curaçao
  E2: { home: 2, away: 1 }, // Ivory Coast vs Ecuador
  E3: { home: 1, away: 1 }, // Germany vs Ivory Coast
  E4: { home: 1, away: 0 }, // Ecuador vs Curaçao
  E5: { home: 0, away: 2 }, // Curaçao vs Ivory Coast
  E6: { home: 2, away: 2 }, // Ecuador vs Germany

  // Group F – Netherlands, Japan, Sweden, Tunisia
  F1: { home: 1, away: 1 }, // Netherlands vs Japan
  F2: { home: 1, away: 0 }, // Sweden vs Tunisia
  F3: { home: 2, away: 1 }, // Netherlands vs Sweden
  F4: { home: 0, away: 1 }, // Tunisia vs Japan
  F5: { home: 2, away: 1 }, // Japan vs Sweden
  F6: { home: 0, away: 3 }, // Tunisia vs Netherlands

  // Group G – Belgium, Egypt, Iran, New Zealand
  G1: { home: 2, away: 1 }, // Belgium vs Egypt
  G2: { home: 2, away: 0 }, // Iran vs New Zealand
  G3: { home: 3, away: 1 }, // Belgium vs Iran
  G4: { home: 0, away: 1 }, // New Zealand vs Egypt
  G5: { home: 1, away: 1 }, // Egypt vs Iran
  G6: { home: 0, away: 1 }, // New Zealand vs Belgium

  // Group H – Spain, Cape Verde, Saudi Arabia, Uruguay
  H1: { home: 2, away: 0 }, // Spain vs Cape Verde
  H2: { home: 1, away: 2 }, // Saudi Arabia vs Uruguay
  H3: { home: 3, away: 1 }, // Spain vs Saudi Arabia
  H4: { home: 2, away: 0 }, // Uruguay vs Cape Verde
  H5: { home: 0, away: 1 }, // Cape Verde vs Saudi Arabia
  H6: { home: 0, away: 2 }, // Uruguay vs Spain

  // Group I – France, Senegal, Iraq, Norway
  I1: { home: 3, away: 0 }, // France vs Senegal
  I2: { home: 1, away: 2 }, // Iraq vs Norway
  I3: { home: 4, away: 0 }, // France vs Iraq
  I4: { home: 1, away: 1 }, // Norway vs Senegal
  I5: { home: 1, away: 3 }, // Norway vs France
  I6: { home: 2, away: 0 }, // Senegal vs Iraq

  // Group J – Argentina, Algeria, Austria, Jordan
  J1: { home: 2, away: 0 }, // Argentina vs Algeria
  J2: { home: 2, away: 1 }, // Austria vs Jordan
  J3: { home: 3, away: 1 }, // Argentina vs Austria
  J4: { home: 1, away: 1 }, // Jordan vs Algeria
  J5: { home: 0, away: 1 }, // Algeria vs Austria
  J6: { home: 0, away: 2 }, // Jordan vs Argentina

  // Group K – Portugal, DR Congo, Uzbekistan, Colombia
  K1: { home: 2, away: 0 }, // Portugal vs DR Congo
  K2: { home: 1, away: 2 }, // Uzbekistan vs Colombia
  K3: { home: 3, away: 0 }, // Portugal vs Uzbekistan
  K4: { home: 2, away: 0 }, // Colombia vs DR Congo
  K5: { home: 0, away: 2 }, // Colombia vs Portugal
  K6: { home: 1, away: 0 }, // DR Congo vs Uzbekistan

  // Group L – England, Croatia, Ghana, Panama
  L1: { home: 3, away: 0 }, // England vs Croatia
  L2: { home: 1, away: 0 }, // Ghana vs Panama
  L3: { home: 2, away: 0 }, // England vs Ghana
  L4: { home: 1, away: 2 }, // Panama vs Croatia
  L5: { home: 0, away: 2 }, // Panama vs England
  L6: { home: 0, away: 1 }, // Croatia vs Ghana

  // Round of 32 (IDs 73–88)
  '73':  { home: 1, away: 0 },
  '74':  { home: 2, away: 1 },
  '75':  { home: 0, away: 1 },
  '76':  { home: 2, away: 0 },
  '77':  { home: 1, away: 0 },
  '78':  { home: 0, away: 2 },
  '79':  { home: 1, away: 1, drawWinner: 'home' },
  '80':  { home: 2, away: 1 },
  '81':  { home: 1, away: 0 },
  '82':  { home: 0, away: 1 },
  '83':  { home: 2, away: 0 },
  '84':  { home: 1, away: 2 },
  '85':  { home: 1, away: 0 },
  '86':  { home: 0, away: 1 },
  '87':  { home: 3, away: 1 },
  '88':  { home: 1, away: 0 },

  // Round of 16 (IDs 89–96)
  '89':  { home: 1, away: 0 },
  '90':  { home: 2, away: 1 },
  '91':  { home: 0, away: 1 },
  '92':  { home: 1, away: 0 },
  '93':  { home: 2, away: 0 },
  '94':  { home: 1, away: 2 },
  '95':  { home: 0, away: 1 },
  '96':  { home: 1, away: 0 },

  // Quarter-finals (IDs 97–100)
  '97':  { home: 1, away: 0 },
  '98':  { home: 2, away: 1 },
  '99':  { home: 0, away: 1 },
  '100': { home: 1, away: 0 },

  // Semi-finals (IDs 101–102)
  '101': { home: 1, away: 0 },
  '102': { home: 2, away: 1 },

  // Third place (ID 103)
  '103': { home: 1, away: 0 },

  // Final (ID 104)
  '104': { home: 1, away: 0 },
}

export const topGoalscorer = 'ליאונל מסי'
