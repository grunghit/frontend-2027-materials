# תמליל — "שלוש תשובות, פרומפט אחד": הצבע שגר בקובץ שהעמוד לא קורא

model: claude-opus-5-5 · captured: 2026-09-23 · how: סשן הכתיבה של הקורס ב-Claude Code — אותו מודל כתב את שלוש התשובות ל-P1 (שלוש שיחות, כל אחת בלי הקודמות) ואת התשובה ל-P2, כפי שצ'אט היה עונה. **זה אינו צילום מהצ'אט בדפדפן, ואינו "שלוש הרצות עיוורות":** המודל שכתב את השבוע כתב כאן שלוש תשובות מייצגות לבקשה כפי שהיא מנוסחת — בקשה שאומרת "מ-CDN" מקבלת את הניבים של ה-CDN — והמרצה בחר אותן. לפני השיעור: שלח את P1 שלוש פעמים בצ'אט, בשלוש שיחות חדשות, והדבק את מה שחזר במקום, עם התאריך. המדידות שבסוף כל תשובה נעשו ב-Chromium דרך Playwright על הקבצים ב-`artifact/`, **בלי רשת**, כששורת ה-CDN של כל תשובה הוחלפה ב-`vendor/tailwind.js` — כמו שהקורס מריץ כל עמוד (נמדד ב-Chromium).

> **למה הקובץ הזה קיים.** פלט של מודל אינו דטרמיניסטי, ומודלים מתחלפים. המחזור רץ חי: הכיתה
> שולחת את P1 בשלוש שיחות ומפעילה את מה שחזר. אם אף אחת מהתשובות של החדר לא הגיעה עם
> `tailwind.config` — פותחים את התשובה A כאן ומשווים. **ההשוואה בין מה שהחדר קיבל למה שכתוב כאן
> היא בעצמה השיעור:** אותה בקשה, שלוש תשובות, ורק הרצה בתנאים של הפרויקט אומרת איזו מהן עובדת.
> מה שהתכנית של הקורס צפתה — שיחזרו מחלקות של ספרייה אחרת — לא קרה כאן: הבקשה אמרה Tailwind,
> והתשובות ענו ב-Tailwind. מה שהשתבש הוא **איזה** Tailwind. התשובות למטה הן של המודל, כלשונן;
> ההערות המסומנות `> **מכשול**` הן של המרצה.

## You — שיחה 1

תבנה לי שורה של שלושה כרטיסים לדף של מועדון קולנוע, ב-Tailwind CSS שנטען מ-CDN.
בטלפון עמודה אחת, ובמסך רחב שלושה בשורה. בכל כרטיס כותרת, משפט אחד, וכפתור-קישור.
הכותרת הראשית והכפתורים בצבע המותג שלי: hsl(234 89% 52%). ושיהיה נגיש.
הכרטיסים: "Twelve films" · "Introduced by students" · "84 seats".

## Claude — שיחה 1

הנה עמוד שלם עם Tailwind מה-CDN. הגדרתי את צבע המותג פעם אחת ב-`tailwind.config`, כך שאפשר
להשתמש בו בכל מקום בשם — `text-brand-600`, `bg-brand-600`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Film club — highlights</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              brand: {
                500: 'hsl(234 89% 52%)',
                600: 'hsl(234 80% 45%)',
              },
            },
          },
        },
      };
    </script>
  </head>
  <body class="bg-white text-slate-900">
    <header class="mx-auto max-w-6xl px-4 pt-6">
      <p class="text-lg font-bold">Film club</p>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-12">
      <h1 class="text-3xl font-bold tracking-tight text-brand-600">This term at the film club</h1>
      <section aria-labelledby="highlights-heading" class="mt-8">
        <h2 id="highlights-heading" class="sr-only">Highlights</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article class="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-brand-600">Twelve films</h3>
            <p class="mt-2 text-slate-600">One a week, Thursdays at eight, in Hall B.</p>
            <a href="#programme" class="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">See the programme</a>
          </article>
          <!-- … the same article twice more: "Introduced by students", "84 seats" … -->
        </div>
      </section>
    </main>
  </body>
</html>
```

מה כאן:

- **רספונסיבי:** `grid-cols-1` בבסיס — עמודה אחת בטלפון — ו-`md:grid-cols-3` מ-768 פיקסלים.
- **צבע המותג:** מוגדר ב-`tailwind.config` כסולם קטן (500 ו-600). השתמשתי ב-600 לכפתורים
  כדי שהטקסט הלבן יעבור ניגודיות בנוחות.
- **נגישות:** `section` עם `aria-labelledby` וכותרת מוסתרת, קישורים עם טקסט שאומר לאן, וטבעת
  פוקוס (`focus:ring-2`) במקום קו המתאר של הדפדפן.

> **מכשול.** הכול כאן נכון — ב-v3, מה-CDN, עם רשת. `tailwind.config` הוא הדרך של Tailwind 3
> להגדיר צבע; הקובץ של הקורס, `vendor/tailwind.js`, הוא Tailwind 4, וגרסה 4 **לא קוראת את
> ההגדרה הזאת בכלל** — אצלה הצבע הוא טוקן ב-`@theme`. מריצים כמו בקורס (שורת ה-CDN מוחלפת
> ב-`vendor/tailwind.js`, `artifact/answer-a/`): הפריסה עובדת — עמודה אחת ב-375, שלושה ב-1280 —
> **והמותג לא קיים.** הכפתורים הם טקסט לבן על כלום: רקע `rgba(0, 0, 0, 0)` על דף לבן, **1.00 : 1**.
> הכותרת לא בצבע המותג. טבעת הפוקוס, שצבעה היה אמור לבוא מאותו config, יוצאת לבנה על לבן — ב-Tab
> לא רואים איפה אתה. ובקונסול, שגיאה אדומה: `tailwind is not defined` (השורה `tailwind.config = …`
> רצה על אובייקט שגרסה 4 לא מייצרת). ובלי רשת בכלל, עם ה-CDN כמו שהוא — שבוע 13 — אין שום עיצוב:
> שלושת הכרטיסים זה מתחת לזה גם ב-1280, `Failed to load resource`, ואותה שגיאה.

## You — שיחה 2

*(אותו P1, מילה במילה, בשיחה חדשה)*

## Claude — שיחה 2

הנה גרסה עם Tailwind 4 מה-CDN הרשמי של הדפדפן. ב-v4 הערכים של העיצוב מוגדרים ב-CSS עצמו,
בבלוק `@theme` — כל `--color-*` שם הופך למחלקות צבע:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Film club — highlights</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
      @theme {
        --color-brand-500: hsl(234 89% 52%);
        --color-brand-700: hsl(234 78% 38%);
      }
    </style>
  </head>
  <body class="bg-white text-slate-900">
    <header class="mx-auto max-w-6xl px-4 pt-6">
      <p class="text-lg font-bold">Film club</p>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-12">
      <h1 class="text-3xl font-bold text-brand-500">This term at the film club</h1>
      <section aria-labelledby="highlights" class="mt-8">
        <h2 id="highlights" class="sr-only">Highlights</h2>
        <div class="flex flex-col gap-6 md:flex-row">
          <article class="rounded-xl border border-slate-300 p-6 md:flex-1">
            <h3 class="text-lg font-semibold">Twelve films</h3>
            <p class="mt-2 text-slate-600">One a week, Thursdays at eight, in Hall B.</p>
            <a href="#programme" class="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">See the programme</a>
          </article>
          <!-- … two more articles, the same classes … -->
        </div>
      </section>
    </main>
  </body>
</html>
```

- **פריסה:** `flex-col` בטלפון, `md:flex-row` מ-768; `md:flex-1` על כל כרטיס מחלק את הרוחב שווה.
- **המותג:** טוקן ב-`@theme`, ומשם `text-brand-500`, `bg-brand-500`, `hover:bg-brand-700`.
- **פוקוס:** `focus-visible:` — הטבעת מופיעה בניווט מקלדת ולא בלחיצת עכבר.

*(מדידה, `artifact/answer-b/`, עם `vendor/tailwind.js` במקום ה-CDN: עמודה ב-375, שלושה שווים
ב-1280 — 357, 357, 357; הכפתור לבן על `rgb(24, 45, 242)`, 7.79 : 1; Tab — טבעת `solid 2px`
בצבע המותג, ובלחיצת עכבר אין טבעת. הקונסול נקי. אין כאן מכשול.)*

## You — שיחה 3

*(אותו P1, מילה במילה, בשיחה חדשה)*

## Claude — שיחה 3

בטח. כדי שלא תצטרך קובץ הגדרות בכלל, השתמשתי בערכים שרירותיים של Tailwind לצבע המותג —
הערך נכתב ישר בתוך המחלקה, בסוגריים מרובעים, עם קו תחתון במקום רווח:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Film club — highlights</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white text-gray-900">
    <header class="mx-auto max-w-6xl px-4 pt-6">
      <p class="text-lg font-bold">Film club</p>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-12">
      <h1 class="text-3xl font-bold text-[hsl(234_89%_52%)]">This term at the film club</h1>
      <section aria-labelledby="highlights-title" class="mt-8">
        <h2 id="highlights-title" class="sr-only">Highlights</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article class="rounded-xl border border-gray-200 bg-white p-6">
            <h3 class="text-lg font-semibold">Twelve films</h3>
            <p class="mt-2 text-gray-600">One a week, Thursdays at eight, in Hall B.</p>
            <a href="#programme" class="mt-4 inline-block rounded-md bg-[hsl(234_89%_52%)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(234_89%_52%)] focus:ring-offset-2">See the programme</a>
          </article>
          <!-- … two more articles, the same classes … -->
        </div>
      </section>
    </main>
  </body>
</html>
```

- `grid-cols-1` בטלפון, `md:grid-cols-3` מ-768.
- הצבע בסוגריים עובד בכל גרסה, בלי config.
- טבעת פוקוס בצבע המותג עם מרווח לבן.

*(מדידה, `artifact/answer-c/`, עם `vendor/tailwind.js`: אותה פריסה בדיוק, הכפתור 7.79 : 1, הקונסול
נקי — **היא עובדת.** מה שנשאר לשאול עליה הוא שאלת השבוע על סוגריים מרובעים: הצבע כתוב בה
**שבע פעמים**, בלי שם, ושינוי שלו הוא שבע עריכות. ו-`focus:` נדלק גם בלחיצת עכבר — נמדד: טבעת
`rgb(24, 45, 242)` ב-4 פיקסלים גם אחרי קליק. זו לא שגיאה; זו סיבה לבחור.)*

## You — P2

אותה שורה, עם האילוצים של הפרויקט שלי:
1. Tailwind v4 מהקובץ vendor/tailwind.js שיושב ליד העמוד — בלי CDN. העמוד חייב לעבוד בלי רשת.
2. צבע המותג כטוקן ב-@theme, בתוך `<style type="text/tailwindcss">`. בלי tailwind.config, ובלי ערך צבע בסוגריים מרובעים.
3. mobile-first: בלי תחילית זה הטלפון, md: למסך רחב. בלי שום max-*.
4. טבעת פוקוס עם focus-visible: ו-outline-*, לא focus:, ולא outline-none.
5. כל מעבר רק תחת motion-safe:.
אחרי הקוד: מה יחס הניגודיות של טקסט הכפתור על הרקע שלו, ואיך אני בודק ב-375 וב-1280.

## Claude — P2

הנה, לפי חמשת האילוצים. ה-`script` טוען את הקובץ המקומי, והמותג הוא טוקן — כך שאותו שם עובד
גם כמחלקה וגם כ-`var(--color-brand-500)`:

```html
<script src="vendor/tailwind.js"></script>
<style type="text/tailwindcss">
  @theme {
    --color-brand-500: hsl(234 89% 52%);
    --color-brand-700: hsl(234 78% 38%);
  }
</style>
…
<section aria-labelledby="highlights" class="mt-8">
  <h2 id="highlights" class="sr-only">Highlights</h2>
  <ul class="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
    <li class="rounded-xl border border-slate-300 p-6">
      <h3 class="text-lg font-semibold">Twelve films</h3>
      <p class="mt-2 text-slate-600">One a week, Thursdays at eight, in Hall B.</p>
      <a href="#programme" class="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">See the programme</a>
    </li>
    <!-- … the other two cards, the same classes … -->
  </ul>
</section>
```

(העמוד השלם — עם `header`, `main` וה-`h1` בצבע המותג — ב-`artifact/answer-p2/index.html`.)

**הניגודיות:** טקסט לבן על `hsl(234 89% 52%)` הוא בערך **7.8 : 1** — עובר AA גם לטקסט קטן (4.5).

**איך בודקים:** בסרגל המכשירים של DevTools, ב-375 — שלושת הכרטיסים זה מתחת לזה, ואין גלילה
אופקית; ב-1280 — שלושה בשורה. בבורר הצבע ב-Styles, על הכפתור, מופיע היחס. ו-Tab בלי עכבר:
טבעת על כל כפתור; לחיצה בעכבר — בלי טבעת. כדי לוודא שאין רשת בדרך, Network, `Offline`, ורענון.

*(מדידה, `artifact/answer-p2/`, בלי רשת: עמודה ב-375, שלושה ב-1280 (357 × 3), 7.79 : 1, טבעת
`solid 2px` בצבע המותג ב-Tab בלבד, `transition-duration` שהוא `0s` תחת `prefers-reduced-motion:
reduce`, הקונסול נקי. כל חמשת האילוצים נבדקו ועומדים.)*
