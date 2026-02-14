# יציבות מערך אימות — HabitForge

## סקירה

מסמך זה מתעד את זרימת ההרשמה/התחברות/התנתקות, הבעיות שזוהו, והפתרונות.

---

## 1. זרימת האימות — מפה

### הרשמה (Sign Up)
1. **אימייל + סיסמא**: טופס → `signUp.create()` → `prepareEmailAddressVerification()` → מסך קוד → `attemptEmailAddressVerification()` → `setActive()` → ניווט ל־AppTabs
2. **Google (Web)**: `signIn.authenticateWithRedirect()` → redirect ל־Google → חזרה ל־`/` עם params → `handleRedirectCallback()` (ב־WebOAuthCallbackHandler) → סשן נוצר
3. **Google (Native)**: `startSSOFlow()` → popup → `setActive()` → ניווט ל־AppTabs

### התחברות (Sign In)
1. **אימייל + סיסמא**: `signIn.create()` → `setActive()` → ניווט
2. **Google**: כמו הרשמה (אותו flow)

### התנתקות (Sign Out)
- `signOut()` מ־Clerk → סשן נמחק → UI מציג "התחבר"

---

## 2. דרישות Clerk Dashboard (חובה!)

### JWT Template עבור Convex
Convex מקבל token דרך `getToken({ template: "convex" })`. **חובה** שיהיה ב־Clerk:
1. מעבר ל־Clerk Dashboard → JWT Templates
2. יצירת template חדש עם preset **"Convex"**
3. **שם ה־template חייב להיות בדיוק `convex`** (לא לשנות)
4. העתקת ה־Issuer URL

### משתני סביבה ב־Convex
- `CLERK_JWT_ISSUER_DOMAIN` = ה־Issuer מ־Clerk (למשל `https://enabling-crawdad-39.clerk.accounts.dev`)

### Redirect URLs ב־Clerk
- Sign-in redirect: `http://localhost:8081/` (פיתוח)
- Sign-up redirect: `http://localhost:8081/`
- עבור פרודקשן: להגדיר את ה־URL של האתר

---

## 3. בעיות שטופלו בקוד

| בעיה | תיקון |
|------|--------|
| `Alert.alert` לא עובד ב־web | שימוש ב־`window.confirm` עבור web |
| כפתורי ארכוב/מחק לא עובדים ב־web | `window.confirm` במקום `Alert.alert` |
| Google OAuth (COOP) ב־web | `authenticateWithRedirect` במקום popup |
| `AuthenticateWithRedirectCallback` context error | טיפול ידני ב־`handleRedirectCallback` בתוך `WebOAuthCallbackHandler` |
| לולאת redirect אינסופית | קריאה ל־`handleRedirectCallback` רק כשיש params ב־URL + `useRef` למניעת קריאות כפולות |
| "יש להתחבר כדי..." אחרי התחברות | שימוש ב־`useAuth().isSignedIn` במקום `useConvexAuth().isAuthenticated` ל־UI |
| כפתור התנתקות לא נראה | סעיף חשבון תמיד מוצג; מחובר = התנתק, לא מחובר = התחבר |
| CAPTCHA (clerk-captcha) | `<View nativeID="clerk-captcha" />` בטופס הרשמה (web) |
| WebBrowser.warmUpAsync ב־web | קריאה רק ב־`Platform.OS !== 'web'` |

---

## 4. בעיות שעשויות להישאר (ולוודא)

### Convex UNAUTHORIZED
אם mutations נכשלות ב־`UNAUTHORIZED: User is not authenticated`:
- **סיבה**: JWT template "convex" חסר או לא מוגדר נכון ב־Clerk
- **פתרון**: לוודא ב־Clerk Dashboard שיש template בשם "convex" עם Convex preset

### Session לא מתעדכן אחרי Google redirect
- לוודא ש־`handleRedirectCallback` רץ כשחוזרים (params: `__clerk`, `code=`, `state=`)
- אם Clerk משתמש ב־hash במקום query, ה־regex כבר בודק גם `hash`

---

## 5. קובצי מפתח

- `src/providers/ConvexClerkProvider.tsx` — Clerk + Convex + WebOAuthCallbackHandler
- `src/screens/AuthScreen.tsx` — הרשמה/התחברות
- `src/screens/SettingsScreen.tsx` — התנתקות
- `convex/auth.config.ts` — הגדרת Convex ל־Clerk
- `.env.local` — משתנים (CLERK_JWT_ISSUER_DOMAIN וכו')
