// A big, situation-aware bank of witty lines for the rivalry page. Selection is
// deterministic but seeded by how many matches have been played, so the copy
// rotates after every match / matchday and never feels stale on repeat visits.

export interface QuipCtx {
  leader: 'a' | 'b' | 'tie'
  leaderName: string
  trailerName: string
  aName: string
  bName: string
  gap: number
  leaderRank: number
  trailerRank: number
  bestRank: number
  worstRank: number
  totalPlayers: number
  identicalPct: number
  bothPredicted: number
  leadChanges: number
  topStreak: number
  topName: string
  championSame: boolean | null
  aChampionHe: string
  bChampionHe: string
  aChampionOut: boolean
  bChampionOut: boolean
  goldenBootSame: boolean
  goldenBootPick: string
  aGoldenBootPick: string
  bGoldenBootPick: string
  aGoldenBootGoals: number
  bGoldenBootGoals: number
  blowoutWinnerName: string
  blowoutMatchHe: string
  blowoutMargin: number
  aTzelifa: number
  bTzelifa: number
  playedCount: number
  seed: number
}

type Quip = (c: QuipCtx) => string

function pick(arr: Quip[], seed: number, c: QuipCtx): string {
  if (arr.length === 0) return ''
  const idx = ((seed % arr.length) + arr.length) % arr.length
  return arr[idx](c)
}

// More tzelifot (exact scores) belongs to whoever has more; ties go to a.
function sharperName(c: QuipCtx): string {
  return c.aTzelifa >= c.bTzelifa ? c.aName : c.bName
}

// A continuation that fits where *both* of them sit in the table — and how far
// apart they are — rotated by seed so the same situation reads fresh later.
function positionTail(c: QuipCtx): string {
  const rankGap = Math.abs(c.worstRank - c.bestRank)
  const closeness =
    rankGap === 0 ? 'צמודים בדיוק על אותו מקום' : rankGap <= 2 ? `צמודים, ${rankGap} מקומות בלבד מפרידים ביניהם` : `${rankGap} מקומות מפרידים ביניהם`
  const tails =
    c.bestRank <= 3
      ? [
          `שניהם מרחרחים את הפודיום — וזה כבר על כסף אמיתי, לא רק על האגו.`,
          `שניהם בצמרת, ${closeness}. מי שיחליק עכשיו יפספס פרס.`,
          `הפודיום ממש כאן, והשני נושף בעורף.`,
        ]
      : c.bestRank <= 8
        ? [
            `שניהם ברדיפה אחרי הצמרת — ובעיקר אחד אחרי השני.`,
            `קרובים לפרס מספיק כדי שזה יכאב, ${closeness}.`,
            `הצמרת באופק, אם רק יפסיקו להעיף מבטים אחד על השני.`,
          ]
        : c.worstRank > (c.totalPlayers * 2) / 3
          ? [
              `שניהם בתחתית — קרב על מי יהיה פחות אחרון.`,
              `עמוק למטה, ${closeness}. לפחות הנפילה רכה כששניכם שם.`,
              `הפרס רחוק; הגאווה היחידה שנשארה היא זה מול זה.`,
            ]
          : [
              `שניהם תקועים באמצע, נאבקים על כלום בכל הכוח.`,
              `אי שם באמצע, ${closeness} — איפה שהגאווה שווה יותר מהפרס.`,
              `לא צמרת ולא תחתית — בדיוק הגובה המושלם לריב.`,
            ]
  return tails[((c.seed % tails.length) + tails.length) % tails.length]
}

// --- Verdict banks (the headline line) --------------------------------------

const VERDICT_TIE: Quip[] = [
  c => `${c.aName} ו${c.bName} תקועים באותו ניקוד בדיוק. אפילו המחשב מתבייש להכריע.`,
  () => `תיקו מוחלט. שני האלים יושבים על אותו ענן ומסרבים לזוז.`,
  c => `${c.aName} = ${c.bName}. מתמטית מביך, רגשית הרסני.`,
  () => `צמודים כמו השמות שלהם — אפילו הטבלה לא מצליחה להבדיל ביניכם.`,
  c => `אף אחד לא מוביל. ${c.aName} ו${c.bName} ינשמו עמוק עד המשחק הבא.`,
  () => `תיקו. כרגע ההבדל היחיד ביניכם הוא האות באמצע השם.`,
  c => `שוויון מוחלט בין ${c.aName} ל${c.bName}. הדרמה רק מתחילה.`,
  () => `אותו ניקוד, אותה גאווה פצועה. תיקו של אלופים (בדמיון).`,
  c => `${c.aName} ו${c.bName} צמודים. מי שינוע ראשון — מנצח או קורס.`,
  () => `תיקו ברזל. גם צילום סיום לא היה מפריד ביניהם.`,
]

const VERDICT_RAZOR: Quip[] = [
  c => `${c.leaderName} מוביל על ${c.trailerName} ב-${c.gap} בלבד. רוחב של שערה, עומק של תהום.`,
  c => `${c.gap} נקודות מפרידות ביניכם. ${c.trailerName}, זה מרחק נשיפה — תתחיל לנשוף.`,
  c => `${c.leaderName} בקושי מקדים. ${c.trailerName} מריח לו את העורף, וזה לא ריח טוב.`,
  c => `פער של ${c.gap}? זה לא יתרון, זה אזהרה. ${c.leaderName}, אל תתרגל.`,
  c => `${c.leaderName} במקום ${c.leaderRank}, ${c.trailerName} ${c.trailerRank} מתוך ${c.totalPlayers} — ${positionTail(c)}`,
  c => `${c.gap} נקודות. ${c.trailerName} צריך משחק אחד טוב כדי להפוך את כל הסיפור.`,
  c => `${c.leaderName} מוביל, אבל ב-${c.gap} בלבד. עוד מוקדם מדי לחגוג.`,
  c => `הקרב צמוד: ${c.leaderName} מקדים את ${c.trailerName} ב-${c.gap}. תיקו רגשי, ניצחון טכני.`,
  c => `${c.gap} נקודות הן ההבדל בין חיוך מרוצה לבין לילה בלי שינה.`,
  c => `${c.leaderName} ראשון, ${c.trailerName} שני, ${c.gap} ביניהם. רוב הזוגות נשואים על פחות מזה.`,
  c => `כל כך צמוד ש-${c.trailerName} כבר מתאמן על נאום הניצחון. ${c.gap} נקודות, יאללה.`,
  c => `${c.leaderName} למעלה בנשימה. עוד פדיחה אחת והכתר עובר ל${c.trailerName}.`,
]

const VERDICT_SMALL: Quip[] = [
  c => `${c.leaderName} מקדים את ${c.trailerName} ב-${c.gap} נקודות. כלומר, שניכם בינוניים — אבל אחד מכם פחות.`,
  c => `פער של ${c.gap}. ${c.trailerName} עוד יכול, אבל כדאי שיתחיל לנחש כאילו אכפת לו.`,
  c => `${c.leaderName} מוביל ב-${c.gap}. נוח, אבל לא נוח מספיק כדי לזרוק רגליים על השולחן.`,
  c => `${c.gap} נקודות יתרון ל${c.leaderName}. שניכם במקום ${c.bestRank} בערך — אלופי ה"כמעט".`,
  c => `${c.leaderName} מוביל ב-${c.gap}. ${c.trailerName}, יש עוד הרבה משחקים, אבל פחות ממה שנדמה לך.`,
  c => `הפער: ${c.gap}. מספיק כדי להתרברב, לא מספיק כדי לישון בשקט.`,
  c => `${c.leaderName} מנצח את הקרב הזה — בינתיים. ${c.trailerName} שומר את הסיבוב הבא.`,
  c => `${c.gap} נקודות. הבדל קטן, אבל בדיוק מספיק כדי שאחד מהם ירגיש אותו.`,
  c => `${c.leaderName} מקדים בנוחות זהירה. ${c.trailerName} עדיין במרחק רדיפה.`,
  c => `פער ${c.gap} ל${c.leaderName}. במקום ${c.leaderRank} מתוך ${c.totalPlayers} — לא בדיוק קרב על הזהב, אבל מי סופר.`,
]

const VERDICT_BIG: Quip[] = [
  c => `${c.leaderName} מוביל בפער של ${c.gap}. ${c.trailerName}, אולי תנחש את התוצאה אחרי שהמשחק נגמר?`,
  c => `${c.gap} נקודות פער. זה כבר לא קרב צמוד, זה שיעור פרטי ש${c.trailerName} מקבל.`,
  c => `${c.leaderName} ברח קדימה ב-${c.gap}. ${c.trailerName} עדיין מחפש את הטופס.`,
  c => `פער ${c.gap}. ${c.trailerName} צריך נס, או ש${c.leaderName} יתחיל לנחש בעיניים עצומות.`,
  c => `${c.leaderName} שולט ב-${c.gap} נקודות. שניהם במקום ${c.bestRank} בערך — אז גם השליטה הזו יחסית.`,
  c => `${c.gap} פער. ${c.trailerName}, זה הרגע להזכיר שהעיקר זה ההשתתפות.`,
  c => `${c.leaderName} מוביל בגדול. ${c.trailerName} כבר מתכנן את הקאמבק לעונה הבאה.`,
  c => `פער של ${c.gap} ל${c.leaderName}. ${c.trailerName} כבר מסביר לכולם שזה "עדיין פתוח".`,
  c => `${c.leaderName} פתח פער ${c.gap}. עכשיו זה רשמית מביך ל${c.trailerName}.`,
  c => `${c.gap} נקודות. ${c.trailerName}, גוגל "איך עוקפים חבר בהימור" — בהצלחה.`,
]

const VERDICT_HUGE: Quip[] = [
  c => `${c.gap} נקודות פער?! ${c.leaderName} כבר לא מתחרה ב${c.trailerName}, הוא מתחרה בעצמו.`,
  c => `${c.leaderName} מוביל ב-${c.gap}. ${c.trailerName} משחק כבר טורניר אחר, בליגה אחרת, אולי בספורט אחר.`,
  c => `פער ${c.gap}. זה כבר לא קרב בין שווים — צד אחד פשוט רחוק קדימה.`,
  c => `${c.gap} נקודות. ${c.trailerName}, השאלה כבר לא אם תעקוף — אלא אם תסיים את הטורניר.`,
  c => `${c.leaderName} מחק את ${c.trailerName} מהמפה. פער ${c.gap} שמדבר בעד עצמו.`,
  c => `${c.gap} פער. ${c.trailerName} כבר ביקש שיורידו את הקרב הזה מהאתר.`,
  c => `${c.leaderName} מוביל ב-${c.gap}. אפילו הכתר השתעמם.`,
  c => `פער של ${c.gap}. ${c.trailerName}, יש מקום נחמד בתחתית הטבלה, חם ונעים.`,
]

function gapVerdict(c: QuipCtx): Quip[] {
  if (c.leader === 'tie') return VERDICT_TIE
  if (c.gap <= 3) return VERDICT_RAZOR
  if (c.gap <= 8) return VERDICT_SMALL
  if (c.gap <= 20) return VERDICT_BIG
  return VERDICT_HUGE
}

// --- Position-in-the-table banks --------------------------------------------

const POS_TOP3: Quip[] = [
  c => `שניהם בצמרת! מקום ${c.bestRank} מתוך ${c.totalPlayers}. מי היה מאמין ששני אלה יאיימו על הפודיום.`,
  c => `${c.leaderName} ו${c.trailerName} ריחרחו את הפרס. מקום ${c.bestRank} — הקרב הקטן הפך לעניין רציני.`,
  c => `רגע, הם בטופ 3?! ${c.leaderName} מוביל את המהפכה, ${c.trailerName} נצמד אליה בציפורניים.`,
  c => `הקרב על המקום ${c.leaderRank} עכשיו גם קרב על כסף אמיתי. מסוכן.`,
  c => `מהמאבק הפנימי לפודיום הכללי. ${c.leaderName} ו${c.trailerName} פתאום שחקנים.`,
  () => `שניהם בין שלושת הראשונים. אחד מכם עומד להרוס לשני חגיגה גדולה.`,
]

const POS_CHASE: Quip[] = [
  c => `מקום ${c.bestRank} מתוך ${c.totalPlayers} — הפודיום נראה באופק, אם רק יפסיקו להילחם זה בזה.`,
  c => `${c.leaderName} ו${c.trailerName} במרדף אחרי הצמרת. בעיקר אחרי זה של השני.`,
  c => `מקום ${c.leaderRank} בערך. קרובים מספיק לפרס כדי לכאוב, רחוקים מספיק כדי להאשים אחד את השני.`,
  () => `עוד דחיפה קטנה ואחד מכם בפודיום. השני יזכיר לו את זה לנצח.`,
  c => `מרכז-עליון של הטבלה. ${c.leaderName} מוביל את הזוג, אבל הזוג עוד רחוק מהזהב.`,
]

const POS_MID: Quip[] = [
  c => `אי שם באמצע הטבלה (מקום ${c.bestRank} מתוך ${c.totalPlayers}), ${c.leaderName} ו${c.trailerName} נלחמים על כלום.`,
  c => `מקום ${c.leaderRank}. לא צמרת, לא תחתית, בדיוק המקום המושלם למאבק יוקרה חסר תוחלת.`,
  () => `שניהם בליבת הטבלה. הפרס רחוק, אבל הגאווה כאן ועכשיו.`,
  c => `מקום ${c.bestRank} מתוך ${c.totalPlayers} — בינוניות מכובדת. ${c.leaderName} מלך הבינוניים, ${c.trailerName} סגנו.`,
  () => `אמצע הטבלה הוא ביתם הטבעי. לפחות יש להם זה את זה לריב איתו.`,
  () => `לא קרובים לפודיום ולא לתחתית. הקרב היחיד שנשאר להם הוא זה — וטוב שכך.`,
]

const POS_BOTTOM: Quip[] = [
  c => `מקום ${c.bestRank} מתוך ${c.totalPlayers}. כן, הם נלחמים על מי יהיה פחות אחרון.`,
  c => `${c.leaderName} ו${c.trailerName} מתחרים בתחתית. זה לא קרב על מדליה, זה קרב על כבוד שכבר אבד.`,
  () => `עמוק בתחתית הטבלה. אבל היי — לפחות אחד מכם מנצח את השני, וזה כל מה שחשוב, נכון?`,
  c => `מקום ${c.worstRank} בערך. הפודיום? באותה מידה אפשר לנחש את הלוטו.`,
  c => `שניהם למטה. ${c.leaderName} מוביל את מירוץ הנחמה, ${c.trailerName} מסרב לוותר עליו.`,
  c => `התחתית מאוחדת: ${c.leaderName} ו${c.trailerName}. לפחות הנפילה רכה כששניכם שם.`,
]

function positionBank(c: QuipCtx): Quip[] {
  if (c.bestRank <= 3) return POS_TOP3
  if (c.bestRank <= 8) return POS_CHASE
  if (c.worstRank > (c.totalPlayers * 2) / 3) return POS_BOTTOM
  return POS_MID
}

// --- Other situational banks ------------------------------------------------

const AGREE_HIGH: Quip[] = [
  c => `${c.identicalPct}% מהניחושים זהים. או שאחד מעתיק, או ששניכם טועים יחד בסנכרון מושלם.`,
  c => `${c.identicalPct}% ניחושים זהים — תאומים מנותקים בלידה, מאוחדים בטעויות.`,
  c => `${c.identicalPct}% חפיפה. ${c.aName} ו${c.bName}, פשוט תמלאו טופס אחד ותחסכו לעצמכם את הדרמה.`,
  c => `${c.identicalPct}% מהטפסים זהים. הקרב הזה הוא בעצם נגד מראה.`,
  c => `${c.identicalPct}% אותו דבר. מקוריות: אפס. נאמנות זה לזה: מרגשת.`,
]

const AGREE_LOW: Quip[] = [
  c => `רק ${c.identicalPct}% ניחושים זהים — נלחמים נואשות להיבדל אחד מהשני, בלי הצלחה מסחררת.`,
  c => `${c.identicalPct}% חפיפה בלבד. שני ראשים, שתי דעות, אותו מקום עלוב בטבלה.`,
  c => `${c.identicalPct}% זהים. כל אחד הולך בדרכו — ישר אל אותה תוצאה.`,
  c => `כמעט שום ניחוש משותף (${c.identicalPct}%). אגו בריא, תוצאות פחות.`,
]

const CHAMPION_DIFF: Quip[] = [
  c => `${c.leaderName} הימר על ${c.aChampionHe === '' ? 'מישהו' : ''}${c.aChampionHe} ו${c.trailerName} על ${c.bChampionHe}. לפחות אחד מכם יוכל לצחוק על השני בגמר.`,
  c => `אלופה שונה: ${c.aChampionHe} מול ${c.bChampionHe}. סוף סוף משהו שמבדיל ביניכם.`,
  c => `${c.aChampionHe} נגד ${c.bChampionHe} על מי צדק. בסוף רק אחד מהם יוכל להגיד "אמרתי לך".`,
  c => `כל אחד והאלופה שלו. ${c.aChampionHe} מול ${c.bChampionHe} — ההימור בתוך ההימור.`,
  () => `ניחוש אלופה שונה. כשהגמר יסתיים, אחד מכם יעשה ריקוד ניצחון מול השני.`,
]

const CHAMPION_SAME: Quip[] = [
  c => `אפילו על האלופה ניחשתם אותו דבר (${c.aChampionHe}). מקוריות שיא.`,
  c => `שניכם על ${c.aChampionHe} לזכייה. אם היא תיפול — תיפלו ביחד, יד ביד.`,
  c => `אותה אלופה (${c.aChampionHe}). אפילו את החלום אתם חולמים בצוותא.`,
]

const GOLDEN_BOOT_SAME: Quip[] = [
  c => `שניכם בחרתם ב${c.goldenBootPick} למלך השערים${c.aGoldenBootGoals > 0 ? ` (כבר ${c.aGoldenBootGoals} שערים)` : ''}. גם בנעל הזהב אתם מסכימים — תסכימו כבר על מי מוביל.`,
  c => `אותו מלך שערים (${c.goldenBootPick}). הדמיון ביניכם מתחיל להיות חשוד.`,
  c => `${c.goldenBootPick} זה הטיפ של שניכם לנעל הזהב. נחמד שיש על מה להתאחד מלבד השנאה.`,
]

// Golden-boot context when they picked *different* scorers — leans on real goals.
const GOLDENBOOT_CTX: Quip[] = [
  c =>
    c.aGoldenBootGoals === c.bGoldenBootGoals
      ? `מלכי השערים שבחרתם תקועים על אותו מספר (${c.aGoldenBootGoals}). אפילו שם לא מצליחים להיבדל.`
      : c.aGoldenBootGoals > c.bGoldenBootGoals
        ? `הכובש של ${c.aName} (${c.aGoldenBootPick}) מקדים ${c.aGoldenBootGoals}-${c.bGoldenBootGoals} את זה של ${c.bName}. נקודה ל${c.aName}.`
        : `הכובש של ${c.bName} (${c.bGoldenBootPick}) מקדים ${c.bGoldenBootGoals}-${c.aGoldenBootGoals} את זה של ${c.aName}. נקודה ל${c.bName}.`,
  c => `נעל הזהב: ${c.aGoldenBootPick} (${c.aGoldenBootGoals}) מטעם ${c.aName}, ${c.bGoldenBootPick} (${c.bGoldenBootGoals}) מטעם ${c.bName}. המרדף נמשך.`,
]

// When a predicted champion has already crashed out — the juiciest "I told you so".
const CHAMPION_OUT: Quip[] = [
  c =>
    c.aChampionOut && c.bChampionOut
      ? `האלופות של שניכם (${c.aChampionHe} ו${c.bChampionHe}) כבר עפו מהטורניר. עכשיו זה קרב בין שני הימורים שבורים.`
      : c.aChampionOut
        ? `האלופה של ${c.aName} (${c.aChampionHe}) כבר בבית. חצי מההימור שלו התאדה — ${c.bName} בקושי מסתיר חיוך.`
        : `האלופה של ${c.bName} (${c.bChampionHe}) הודחה מהטורניר. ${c.aName} כבר מחדד את הבדיחות.`,
  c =>
    c.aChampionOut && c.bChampionOut
      ? `גם ${c.aChampionHe} וגם ${c.bChampionHe} בחוץ. שניכם הימרתם על סוס שכבר לא רץ.`
      : c.aChampionOut
        ? `${c.aChampionHe}, האלופה של ${c.aName}, נפלטה. אאוץ' בגודל של גמר.`
        : `${c.bChampionHe}, האלופה של ${c.bName}, נפלטה. אאוץ' בגודל של גמר.`,
]

const LEADCHANGES_MANY: Quip[] = [
  c => `ההובלה התחלפה כבר ${c.leadChanges} פעמים. רכבת הרים שאף אחד מכם לא ביקש לעלות עליה.`,
  c => `${c.leadChanges} חילופי הובלה. כל ערב משחקים מישהו אחר ישן רע.`,
  c => `${c.leadChanges} פעמים שינו תפקידים בין הצייד לנרדף. תמשיכו לרענן את העמוד.`,
  c => `הקרב הזה התהפך ${c.leadChanges} פעמים. דרמה שמגיעה לה אוסקר.`,
]

const LEADCHANGES_NONE: Quip[] = [
  c => `אפס חילופי הובלה. ${c.topName || c.leaderName} תפס את ההגה ולא מוותר.`,
  c => `מאז ההתחלה אותו אחד למעלה. ${c.trailerName}, נמאס כבר להסתכל בעורף?`,
  c => `שום חילופי הובלה. ${c.leaderName} מנהל את הקרב, ${c.trailerName} מנהל את התירוצים.`,
]

const STREAK_LONG: Quip[] = [
  c => `${c.topName} מחזיק בהובלה כבר ${c.topStreak} משחקים ברצף. שליטה, או סתם מזל עיקש?`,
  c => `${c.topStreak} משחקים ש${c.topName} למעלה. זה כבר לא קרב, זה מנוי.`,
  c => `${c.topName} דבוק לצמרת הפנימית ${c.topStreak} משחקים. היריב מתחיל לפתח טיק עצבני.`,
]

const BLOWOUT: Quip[] = [
  c => `הרגע הזכור לרעה: ב${c.blowoutMatchHe}, ${c.blowoutWinnerName} הביא ${c.blowoutMargin} נקודות יותר מהיריב במשחק אחד. אכזרי.`,
  c => `${c.blowoutWinnerName} ניצח בענק ב${c.blowoutMatchHe} — ${c.blowoutMargin} נקודות הפרש במשחק יחיד. עוד מדברים על זה.`,
  c => `הרגע ש${c.blowoutWinnerName} חייך הכי רחב: ${c.blowoutMargin} נקודות יתרון על היריב במשחק בודד, ב${c.blowoutMatchHe}.`,
]

const HITS: Quip[] = [
  c => `${sharperName(c)} מדייק יותר בצליפות (${Math.max(c.aTzelifa, c.bTzelifa)} תוצאות מדויקות). העין חדה, הטבלה פחות.`,
  c => `צליפות: ${c.aName} ${c.aTzelifa}, ${c.bName} ${c.bTzelifa}. דיוק זה דבר אחד, מזל זה כל השאר.`,
  c => `${sharperName(c)} פגע יותר בול. אבל בהימור הזה גם שעון מקולקל צודק פעמיים ביום.`,
]

const PRE_TOURNAMENT: Quip[] = [
  c => `הטורניר עוד לא התחיל וכבר מריח דם. ${c.aName} נגד ${c.bName} — שמרו תאריך.`,
  () => `אפס משחקים, מאה אחוז מתח. תכף מתחילים לספור נקודות וצלקות.`,
  c => `לפני שריקת הפתיחה כולם שווים. גם ${c.aName}, גם ${c.bName}. תיהנו מזה כל עוד אפשר.`,
  c => `עדיין 0-0 בקרב האלים. ${c.aName} ו${c.bName}, חדדו את העפרונות.`,
  () => `הניחושים ננעלו, הגורל פתוח. בקרוב נדע מי צוחק ומי מתקשר לתמיכה נפשית.`,
]

// --- Selectors --------------------------------------------------------------

export function pickVerdict(c: QuipCtx): string {
  if (c.playedCount === 0) return pick(PRE_TOURNAMENT, c.seed, c)
  return pick(gapVerdict(c), c.seed, c)
}

export function pickQuips(c: QuipCtx, count = 4): string[] {
  if (c.playedCount === 0) {
    const out: string[] = []
    for (let i = 1; out.length < Math.min(count, PRE_TOURNAMENT.length); i++) {
      const line = pick(PRE_TOURNAMENT, c.seed + i, c)
      if (!out.includes(line)) out.push(line)
    }
    return out
  }

  const banks: Quip[][] = [positionBank(c)]
  if (c.bothPredicted > 0) banks.push(c.identicalPct >= 35 ? AGREE_HIGH : AGREE_LOW)
  // A crashed-out champion pick trumps the neutral "who picked whom" line.
  if (c.aChampionOut || c.bChampionOut) banks.push(CHAMPION_OUT)
  else if (c.championSame === false) banks.push(CHAMPION_DIFF)
  else if (c.championSame === true) banks.push(CHAMPION_SAME)
  if (c.goldenBootSame) banks.push(GOLDEN_BOOT_SAME)
  else if (c.aGoldenBootGoals + c.bGoldenBootGoals > 0) banks.push(GOLDENBOOT_CTX)
  if (c.leadChanges >= 3) banks.push(LEADCHANGES_MANY)
  else if (c.leadChanges === 0 && c.playedCount > 1) banks.push(LEADCHANGES_NONE)
  if (c.topStreak >= 4) banks.push(STREAK_LONG)
  if (c.blowoutMargin > 0) banks.push(BLOWOUT)
  if (c.aTzelifa + c.bTzelifa > 0) banks.push(HITS)

  // Rotate which banks lead so the mix changes from matchday to matchday.
  const start = banks.length ? c.seed % banks.length : 0
  const ordered = [...banks.slice(start), ...banks.slice(0, start)]

  const out: string[] = []
  for (let i = 0; i < ordered.length && out.length < count; i++) {
    const line = pick(ordered[i], c.seed + i, c)
    if (line && !out.includes(line)) out.push(line)
  }
  return out
}

