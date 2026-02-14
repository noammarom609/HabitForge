# ניתוח ליקויים בהתחברות Clerk – HabitForge

מבוסס על Clerk MCP, תיעוד רשמי, וניתוח הקוד.

---

## 1. בעיית Google OAuth (COOP)

### מה קורה
- `useSSO()` + `startSSOFlow()` משתמשים ב־`WebBrowser.openAuthSessionAsync` – פותח **חלון קופץ**
- בדפדפן, מדיניות **Cross-Origin-Opener-Policy (COOP)** חוסמת תקשורת בין החלון הקופץ לחלון הראשי
- התוצאה: שגיאות "Cross-Origin-Opener-Policy policy would block the window.closed call"

### מה Clerk ממליץ (מתוך MCP / custom-flows)
```typescript
// OAuth Sign-In – זרימת REDIRECT, לא popup
signIn.authenticateWithRedirect({
  strategy: 'oauth_google',
  redirectUrl: '/sso-callback',
  redirectUrlComplete: '/dashboard',
});
```

### הבעיה אצלנו
- `authenticateWithRedirect` עובד ב־web
- נדרש `<AuthenticateWithRedirectCallback />` על דף ה־callback
- `AuthenticateWithRedirectCallback` מ־`@clerk/clerk-react` לא מזהה את ה־context של `ClerkProvider` מ־`@clerk/clerk-expo` (כנראה שני instances שונים של החבילה)
- לכן נכשל עם: "can only be used within ClerkProvider"

### כיווני פתרון
1. **Clerk Expo** – לבדוק אם יש export של `AuthenticateWithRedirectCallback` מתוך `@clerk/clerk-expo` או `@clerk/clerk-expo/web`
2. **handleRedirectCallback ידני** – להשתמש ב־`useClerk()` ולקרוא ל־`handleRedirectCallback()` כשחוזרים מ־OAuth
3. **המתנה לעדכון** – לראות אם Clerk מוסיף תמיכה מלאה ב־Expo Web

---

## 2. בעיית CAPTCHA (clerk-captcha)

### מה קורה
- Clerk מפעיל הגנת בוט (Bot sign-up protection) כברירת מחדל
- נדרש אלמנט DOM עם `id="clerk-captcha"` לפני קריאה ל־`signUp.create()`
- בהיעדר האלמנט: "Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found"

### מה Clerk ממליץ (מתוך bot-sign-up-protection)
```html
<!-- Clerk's CAPTCHA widget -->
<div id="clerk-captcha"></div>
```

### מיקום בתוך AuthScreen
- להוסיף את האלמנט **בטופס ההרשמה**, **לפני** כפתור "Create Account"
- רק ב־web (ב־React Native אין DOM)
- רק במצב sign-up

### יישום ב־React Native Web
```jsx
{Platform.OS === 'web' && isSignUp && (
  <View nativeID="clerk-captcha" style={{ minHeight: 78, marginVertical: 12 }} />
)}
```

---

## 3. WebBrowser.warmUpAsync (תוקן)

### מה היה
- `warmUpAsync` זמין רק ב־iOS/Android
- ב־web זרק: "WebBrowser.warmUpAsync is not available on web"

### מה תוקן
- קריאה ל־`warmUpAsync` / `coolDownAsync` רק כש־`Platform.OS !== 'web'`

---

## סיכום

| בעיה | סטטוס | פעולה |
|------|--------|--------|
| WebBrowser.warmUpAsync | ✅ תוקן | – |
| CAPTCHA (clerk-captcha) | ⚠️ ניתן לתיקון | הוספת `<View nativeID="clerk-captcha" />` בטופס הרשמה (web) |
| Google OAuth (COOP) | ❌ חסום | תלות ב־Clerk Expo / פתרון context |
