# הפרומפטים — מחזור AI 4 · ביקורת נגישות על טופס

שני פרומפטים, ממוספרים. P1 היא הבקשה התמימה — שאלה מובילה, כמו שסטודנט שקרא משהו על
`aria-label` שואל. P2 היא אותה בקשה עם אילוץ אחד שאפשר לבדוק בדפדפן. את שניהם מדביקים
**יחד עם `artifact/start/index.html`** — הביקורת היא על הטופס הזה, לא על טפסים באופן כללי.

## P1 — הבקשה התמימה

**עברית (התמליל נכתב עם הנוסח הזה):**

```
הנה טופס ההצטרפות של החוג לדיבייט. הרצתי עליו Lighthouse וקיבלתי שורה אדומה על שדה
בלי תווית. קראתי ש-aria-label נותן לשדה שם לקורא מסך. אם אוסיף aria-label לכל שדה — זה
מספיק כדי שקורא מסך יוכל למלא את הטופס, ושהוא יעבור axe ו-Lighthouse? הייתי מעדיף לא
לשנות את המבנה: המילים מעל השדה נשארות טקסט רגיל, והרמז נשאר בתוך השדה.
```

**English:**

```
Here is the sign-up form of the debate society. I ran Lighthouse on it and got one red
row about a field without a label. I read that aria-label gives a field a name for
screen readers. If I add aria-label to every field, is that enough for a screen-reader
user to fill the form in, and for it to pass axe and Lighthouse? I would rather not
change the structure: the words above each field stay plain text, and the hint stays
inside the field.
```

## P2 — הבקשה המסויגת

**עברית:**

```
אותו טופס, עם אילוץ: לכל שדה תהיה תווית גלויה — label עם for שמצביע על ה-id של השדה —
כך שלחיצה על המילים שמעל השדה תזיז את הסמן לתוכו. בלי aria-label על שדות, ובלי
placeholder כתחליף לתווית (מותר placeholder רק כדוגמה לפורמט). אחרי הקוד, כתוב לי איך
לבדוק בדפדפן שהאילוץ מתקיים — בלי כלי אוטומטי.
```

**English:**

```
Same form, with one constraint: every field gets a visible label — a label element whose
for points at the field's id — so that clicking the words above the field moves the
cursor into it. No aria-label on fields, and no placeholder standing in for a label (a
placeholder is allowed only as a format example). After the code, tell me how to verify
in the browser that the constraint holds, without an automated tool.
```

## מה מחפשים בכל תשובה

| | P1 | P2 |
|---|---|---|
| מה חוזר | `aria-label` על כל שדה, `name`, `type`, `required` — והבטחה שהכלי יעבור | `label for` גלוי לכל שדה, ו-`aria-label` נעלם |
| מה נכון | הכול, מבחינת הכלי: axe ו-Lighthouse באמת עוברים | הכול, וגם הלחיצה |
| מה בודקים | Lighthouse (100), ואז **לחיצה על המילים** ולשונית Accessibility | שהאילוץ מתקיים: לחיצה על כל מילה, השם בעץ הוא המילים על המסך |

הסימן המסגיר אינו שהתשובה ל-P1 *שגויה* — היא מדויקת לגבי הכלי שהיא מצטטת. הסימן הוא
**שהשאלה ביקשה אישור, והתשובה נתנה אותו, במקום להגיד מה הכלי לא בודק.** זו כל הנקודה
של המחזור: אילוץ שאפשר לבדוק במקום שאלה שאפשר להסכים לה.
