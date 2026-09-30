# הפרומפטים — מחזור AI 4 · "תן לי כלל אצבע"

שני פרומפטים, ממוספרים. P1 היא הבקשה לכלל אצבע; P2 היא ההמשך באותה שיחה, עם המספרים שמדדת
בעצמך כתובים בפנים. את P1 מדביקים **יחד עם `artifact/start/index.html` ו-`artifact/start/styles.css`**.
P2 באה אחרי המדידה — לא לפניה.

## P1 — הבקשה לכלל אצבע

**עברית (התמליל נכתב עם הנוסח הזה):**

```
הנה העמוד שלי ושני הקבצים. אני לא מבקש קוד — אני מבקש כלל אצבע: יש לי 5 אירועים בשורת ה-.events,
ובחלק מהרוחבים בשורה האחרונה נשארים שני כרטיסים עם חור בצד. מה הכלל הקצר שאפשר לזכור כדי
ששורת כרטיסים תמלא את הרוחב שלה בלי חורים?
```

**English:**

```
Here is my page and its two files. I'm not asking for code — I'm asking for a rule of thumb:
I have 5 events in the .events row, and at some widths the last row has two cards left with a gap
beside them. What short rule can I remember so that a row of cards fills its width with no gaps?
```

## P2 — ההמשך, עם המדידה

**עברית (התמליל נכתב עם הנוסח הזה; המספרים הם מהמדידה על `artifact/`, ושלך יהיו של העמוד שלך):**

```
החלפתי ב-.events את auto-fill ב-auto-fit ומדדתי את רוחב הכרטיסים בקונסול, לפני ואחרי. ב-700 (שתי עמודות)
חמשת הכרטיסים 326px לפני ואחרי. ב-1100 (שלוש עמודות) 254.7px לפני ואחרי. ב-1440 (שלוש עמודות) 272px
לפני ואחרי. שני הכרטיסים האחרונים לא נמתחו והחור נשאר. גם ב-.shelf, שכבר auto-fit, ב-1300 השורה השנייה
היא שני ספרים של 160px עם חור. הכלל שלך לא נכון בעמוד שלי. מה הכלל המתוקן, ובאיזה תנאי auto-fit כן מותח?
```

**English:**

```
I replaced auto-fill with auto-fit in .events and measured the card widths in the console, before and
after. At 700 (two columns) all five cards are 326px before and after. At 1100 (three columns) 254.7px
before and after. At 1440 (three columns) 272px before and after. The last two cards did not stretch and
the gap is still there. In .shelf, which already uses auto-fit, the second row at 1300 is two books of
160px with a gap. Your rule is not true on my page. What is the corrected rule, and under what condition
does auto-fit do stretch?
```

## מה מחפשים בכל תשובה

| | P1 | P2 |
|---|---|---|
| הצורה של התשובה | כלל אחד קצר, בלי קובץ | הכלל המקורי מתוקן, ותנאי |
| מה הכלל אומר על `auto-fit` | שהוא ממלא את השורה האחרונה | שהוא שונה מ-`auto-fill` רק כשיש פחות פריטים מעמודות |
| ב-700, ב-1100, ב-1440 (5 אירועים) | החור נשאר — 326 / 254.7 / 272px | אותו דבר; התשובה מסבירה למה |
| ב-1440 עם שני אירועים | `auto-fit`: 416px, `auto-fill`: 272px | הכלל המתוקן נכון כאן |

הסימן המסגיר אינו ש-P1 *שגויה* בכל מקום — אלא שהיא נכונה בקצה אחד ושגויה **בעמוד שלך, ברוחבים
שבהם אתה מסתכל.**
