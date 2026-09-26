# הפרומפטים — מחזור AI 4 · "למה הכלל שלי לא חל?"

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה — "כתבתי אחרון, אז זה אמור לנצח; מה התיקון הכי
מהיר?" — כמו שסטודנט ששיניתי-ולא-קרה-כלום שואל. P2 היא אותה בקשה עם אילוץ שאפשר לבדוק
ב-DevTools. את שניהם מדביקים **יחד עם `artifact/start/index.html` ו-`artifact/start/styles.css`** —
השאלה היא על הקובץ הזה, לא על ספציפיות באופן כללי.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
הנה העמוד של חוג הדיבייט וה-styles.css שלו. החצי העליון של הקובץ הגיע ממדריך; שני
הכללים בסוף שלי. הוספתי בסוף הקובץ .title { color: hsl(170 70% 28%); } כדי שהכותרת
תהיה בצבע של הקישורים — והיא עדיין אפורה. הכלל שלי הוא האחרון בקובץ, אז הוא אמור
לנצח. למה הכלל שלי לא חל, ומה התיקון הכי מהיר?
```

**English:**

```
Here is the debate society's page and its styles.css. The top half of the file came
from a tutorial; the two rules at the bottom are mine. I added
.title { color: hsl(170 70% 28%); } at the very end so the heading gets the same colour
as the links — and it is still grey. My rule is the last one in the file, so it should
win. Why doesn't my rule apply, and what is the quickest fix?
```

## P2 — הבקשה המסויגת

**עברית:**

```
אותו קובץ. קודם כתוב לי את שלשת הספציפיות של שני הכללים שמתחרים על color של הכותרת,
ואיזה שלב במפל הכריע ביניהם. ואז תקן כך שהבורר המנצח יורד — לא שהמפסיד עולה: בלי
!important, בלי לשלב id עם מחלקה באותו בורר, ובלי לגעת ב-HTML (ה-id נשאר, הוא עוגן
של קישור). אחרי הקוד, כתוב איך אני בודק בפאנל Styles של DevTools שהכלל שלי חל — וגם
בערכה הכהה.
```

**English:**

```
Same file. First write the specificity triple of each of the two rules competing for
the heading's color, and which step of the cascade decided between them. Then fix it
by LOWERING the winning selector — not raising the losing one: no !important, no id
combined with a class in one selector, and no change to the HTML (the id stays; a link
points at it). After the code, tell me how to check in the DevTools Styles pane that
my rule applies — in the dark scheme too.
```

## מה מחפשים בכל תשובה

| | P1 | P2 |
|---|---|---|
| מה חוזר | ההסבר נכון: `(1,0,0)` מול `(0,1,0)`, הסדר מכריע רק בתיקו — ואז **"התיקון הכי מהיר": `#page-title.title`** `(1,1,0)`, ואחריו `!important`; הורדת ה-id מוזכרת בסוף, כ"לטווח ארוך" | השלשות, שלב 3 במפל, וה-`#page-title` הופך ל-`h1` `(0,0,1)`; ה-`.title` שלך מנצח, וגם זה של הערכה הכהה |
| מה נכון | ההסבר. והתיקון **עובד** בערכה הבהירה: הכותרת בצבע המותג | הכול — ואפשר לדרוס שוב, בכל מחלקה שתכתוב מתחת |
| מה בודקים | פאנל Styles: מי מחוק בקו. ואז **Rendering, `prefers-color-scheme: dark`**: הכותרת נשארה בצבע הבהיר, הקישורים לא — הכלל של הערכה הכהה, `.title` `(0,1,0)`, הפסיד לתיקון `(1,1,0)` | שהאילוץ מתקיים: `h1` מחוק בקו מתחת ל-`.title`, בשתי הערכות |

הסימן המסגיר אינו שהתשובה ל-P1 *שגויה* — ההסבר מדויק והתיקון עובד ברגע שמריצים אותו. הסימן
הוא **שהתיקון מעלה את המפסיד במקום להוריד את המנצח**, ושכל כלל מחלקה שתכתוב אחר כך על
הכותרת — כולל זה שכבר יש לך בבלוק הכהה — יפסיד באותה דרך בדיוק. זו כל הנקודה של המחזור:
החשבון של הספציפיות, ואז לשאול על הכיוון של התיקון.
