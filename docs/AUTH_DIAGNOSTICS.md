# אבחון מערך משתמשים — Clerk + Convex

## סיכום הבעיה

**"החיבור כאילו עובר אבל בסופו של דבר שום חיבור לא נוצר ב-Clerk"**

המשתמש עובר את תהליך ההתחברות (למשל עם Google), אך בסיום אין סשן ב-Clerk והאפליקציה לא מזהה אותו כמחובר.

---

## שרשרת האימות — איפה זה יכול להישבר

```
[משתמש] → [לחיצה על "התחבר עם Google"]
    → [authenticateWithRedirect] → redirect ל-Clerk
    → [Clerk] → redirect ל-Google
    → [Google] → משתמש מתחבר
    → [Google] → redirect חזרה ל-Clerk
    → [Clerk] → יוצר סשן
    → [Clerk] → redirect ל-URL שלנו (redirectUrl) עם params ב-URL
    → [האפליקציה שלנו נטענת מחדש]
    → [WebOAuthCallbackHandler] בודק אם יש params ב-URL
    → [אם כן] → handleRedirectCallback() → יוצר סשן ב-Clerk client
    → [ConvexProviderWithClerk] מקבל token מ-Clerk via getToken({ template: "convex" })
    → [Convex] מאמת את ה-JWT
```

**נקודות כשל אפשריות:**

| # | שלב | סיבה אפשרית | איך לבדוק |
|---|-----|-------------|------------|
| 1 | Clerk Dashboard | Redirect URLs לא כוללים את ה-URL שלנו | בדוק ב-Clerk Dashboard → Paths / Redirect URLs |
| 2 | redirectUrl בקוד | URL לא תואם ל-Dashboard | AuthScreen משתמש ב-`${origin}/` |
| 3 | זיהוי params | Regex לא תואם את מה ש-Clerk שולח | פתח Console, בדוק אם מופיע "[WebOAuthCallback] Detected OAuth params" |
| 4 | handleRedirectCallback | נכשל או לא רץ | בדוק Console לשגיאות "[WebOAuthCallbackHandler] handleRedirectCallback failed" |
| 5 | JWT template | אין template "convex" ב-Clerk | Clerk Dashboard → JWT Templates |
| 6 | Convex env | CLERK_JWT_ISSUER_DOMAIN לא מוגדר | Convex Dashboard → Settings → Environment Variables |
| 7 | **שדות חובה** | username/שדות אחרים חובה — משתמשים חדשים לא נוצרים | Clerk Dashboard → User & Authentication → הפוך username לאופציונלי |

---

## צעדי תיקון חובה

### 0. Clerk Dashboard — שדות חובה (גורם #1 למשתמשים חדשים שלא נוצרים!)

**באג ידוע ב-Clerk**: כשהשדה `username` (או שדות אחרים) מוגדרים כ-**חובה** ב-Clerk, משתמשים חדשים דרך Google לא נוצרים — גם ב-Web וגם ב-Native.

1. היכנס ל-[Clerk Dashboard](https://dashboard.clerk.com) → האפליקציה שלך
2. עבור ל-**User & Authentication** → **Email, Phone, Username**
3. **הפוך את `username` לאופציונלי** (Optional) — או וודא שהאפליקציה מספקת אותו
4. אם יש שדות חובה נוספים (טלפון וכו') — הפוך לאופציונלי לבדיקה

**פתרון בקוד**:
- **Native**: fallback ב-`AuthScreen` — כשמשתמש חדש חוזר מ-Google בלי `createdSessionId`, הקוד מנסה להשלים עם `signUp.update({ username })`. אם זה נכשל, יוצגת הודעה להפוך את username לאופציונלי.
- **Web**: שימוש ב-`signUp.authenticateWithRedirect` when on sign-up screen — כך Clerk מטפל נכון ב-flow של משתמשים חדשים. אם `handleRedirectCallback` נכשל — השגיאה מוצגת על מסך Auth.

---

### 0. Clerk Dashboard — Paths (Sign-in/Sign-up URL)

אם ההתחברות מפנה לדף Clerk (Account Portal) במקום לממשק שלנו:
1. Clerk Dashboard → **Configure** → **Paths**
2. הגדר **Sign-in URL** ו-**Sign-up URL** ל־URL של האפליקציה (למשל `http://localhost:8084/`)
3. או הוסף ל־`.env.local`: `EXPO_PUBLIC_CLERK_SIGN_IN_URL=/` ו־`EXPO_PUBLIC_CLERK_SIGN_UP_URL=/`

### 1. Clerk Dashboard — Redirect URLs

1. היכנס ל-[Clerk Dashboard](https://dashboard.clerk.com)
2. בחר את האפליקציה (enabling-crawdad-39)
3. עבור ל-**Paths** או **Redirect URLs** (תלוי בגרסה)
4. הוסף בדיוק (כולל הפורט שבו אתה מריץ):
   - `http://localhost:8081/`
   - `http://localhost:8085/`
   - `http://localhost:8081`
   - `http://localhost:8085`
5. עבור **פרודקשן** — הוסף את ה-URL המלא של האתר

### 2. Clerk Dashboard — JWT Template "convex"

1. Clerk Dashboard → **JWT Templates**
2. וודא שיש template בשם **בדיוק** `convex` (לא לשנות)
3. אם אין — צור חדש עם preset **Convex**
4. העתק את ה-**Issuer** (למשל `https://enabling-crawdad-39.clerk.accounts.dev`)

### 3. Convex Dashboard — Environment Variables

1. Convex Dashboard → הפרויקט → **Settings** → **Environment Variables**
2. וודא: `CLERK_JWT_ISSUER_DOMAIN` = ה-Issuer מ-Clerk (ללא slash בסוף)

### 4. בדיקה ידנית

1. הרץ את האפליקציה: `npx expo start --web --port 8083`
2. פתח Console בדפדפן (F12)
3. לחץ "התחבר עם Google"
4. התחבר ב-Google
5. כשאתה חוזר לאפליקציה:
   - **אם מופיע** `[WebOAuthCallback] Detected OAuth params` — הזיהוי עובד
   - **אם מופיע** `handleRedirectCallback failed` — יש שגיאה (העתק את השגיאה)
   - **אם לא מופיע כלום** — ייתכן ש-Clerk מפנה ל-URL אחר או ללא params

---

## שינויים שבוצעו בקוד

1. **הרחבת זיהוי params** — Regex מזהה כעת: `__clerk`, `rotating_token_nonce`, `code=`, `state=`
2. **לוג דיבוג** — ב-__DEV__ מודפס כשמזוהה callback
3. **שגיאות לא נבלעות** — handleRedirectCallback failures נשלחות ל-console.error
4. **טיפול בחזרה מ-Google (Web)** — RootNavigator מזהה OAuth return, מציג "מסיים התחברות..." עד שהסשן מוכן, ואז מעביר ישירות ל-AppTabs. אם אחרי 8 שניות אין סשן — מעביר ל-Auth לניסיון חוזר.

---

## קישורים שימושיים

- [Clerk Redirect URLs](https://clerk.com/docs/guides/development/customize-redirect-urls)
- [Convex + Clerk](https://docs.convex.dev/auth/clerk)
- [Clerk OAuth Custom Flow](https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections)
