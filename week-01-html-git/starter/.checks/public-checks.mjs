/**
 * Week 1 — the CORE-TIER public check set that runs in the student's own repo.
 *
 * The publisher copies this file to  starter/.checks/public-checks.mjs  and it is
 * executed by .checks/run-checks.mjs on every push (tools/ci-template/check.yml).
 *
 * RULES (tools/ci-template/checks/public-checks.mjs):
 *   · CORE TIER ONLY. Stretch and challenge checks stay private in grading/specs/.
 *   · No point values, no grading criteria — students learn "does it work", not
 *     "which string does the grader look for".
 *   · `run` returns a plain boolean. `expected` is a hint, never the answer.
 *
 * `page` is already loaded at the entry file, viewport 1280×900.
 */

export const publicChecks = [
  {
    title: 'שלד המסמך שלם, ול-`title` יש תוכן משלך',
    expected: '`<!doctype html>`, `lang` על `<html>`, `<meta charset>`, `<meta name="viewport">`, ו-`title` שאינו "CHANGE ME".',
    run: async (page) =>
      page.evaluate(() => {
        const title = (document.title || '').trim();
        return (
          document.doctype?.name === 'html' &&
          /^[a-z]{2}([-_][A-Za-z]+)?$/.test(document.documentElement.getAttribute('lang') || '') &&
          !!document.querySelector('meta[charset]') &&
          !!document.querySelector('meta[name="viewport"]') &&
          title.length >= 3 &&
          !/change me|untitled|your name here/i.test(title)
        );
      }),
  },
  {
    title: 'בעמוד כותרת ראשית אחת בדיוק (`<h1>`)',
    expected: 'לכל עמוד `<h1>` יחיד שמתאר על מה העמוד. `<h1>` הוא לא "טקסט גדול".',
    run: async (page) => (await page.locator('h1').count()) === 1,
  },
  {
    title: 'העמוד בנוי מ-`header`, `nav`, `main` ו-`footer`, ו-`main` מופיע פעם אחת',
    expected: '`<div class="header">` הוא לא `<header>`. `main` יחיד לכל מסמך.',
    run: async (page) =>
      page.evaluate(
        () =>
          !!document.querySelector('header') &&
          !!document.querySelector('nav') &&
          document.querySelectorAll('main').length === 1 &&
          !!document.querySelector('footer'),
      ),
  },
  {
    title: 'ה-`nav` מכיל רשימת קישורים אמיתית',
    expected: '`<nav>` ובתוכו `<ul>` עם `<li>` וקישורים — לפחות שניים.',
    run: async (page) => (await page.locator('nav ul li a').count()) >= 2,
  },
  {
    title: 'לכל תמונה יש `alt`, ולפחות אחת מתוארת באמת',
    expected: '`alt` חסר אינו החלטה. `alt=""` הוא החלטה: "התמונה לא נושאת מידע".',
    run: async (page) =>
      page.evaluate(() => {
        const images = [...document.querySelectorAll('img')];
        if (images.length === 0) return false;
        if (!images.every((el) => el.hasAttribute('alt'))) return false;
        return images.some((el) => (el.getAttribute('alt') || '').trim().length >= 8);
      }),
  },
  {
    title: 'הקישורים מתארים את היעד, ואין נתיב מקומי מוחלט',
    expected: '"לחץ כאן" חסר משמעות מחוץ להקשר. `file:///Users/…` ו-`C:\\Users\\…` עובדים רק על מחשב אחד.',
    run: async (page) =>
      page.evaluate(() => {
        const links = [...document.querySelectorAll('a[href]')];
        if (links.length < 3) return false;
        const vague = /^\s*(click here|here|link|read more|this|לחץ כאן|כאן|קישור|לחצו כאן)\s*$/i;
        if (links.some((a) => vague.test(a.textContent || ''))) return false;
        const refs = [...document.querySelectorAll('a[href], img[src]')].map(
          (el) => el.getAttribute('href') || el.getAttribute('src') || '',
        );
        return !refs.some((v) => /^file:/i.test(v) || /^[A-Za-z]:[\\/]/.test(v) || v.includes('\\'));
      }),
  },
  {
    title: 'הטופס נגיש: `fieldset` ו-`legend`, ארבעה שדות עם תווית מקושרת, שדה `required` וכפתור שליחה',
    expected: '`placeholder` הוא לא תווית. לכל שדה `<label for="…">` שמצביע על ה-`id` שלו.',
    run: async (page) =>
      page.evaluate(() => {
        if (!document.querySelector('form fieldset legend')) return false;
        const fields = [
          ...document.querySelectorAll(
            'form input:not([type="submit"]):not([type="button"]):not([type="hidden"]), form textarea, form select',
          ),
        ];
        if (fields.length < 4) return false;
        if (!fields.every((el) => el.id && document.querySelector(`label[for="${el.id}"]`))) return false;
        if (!document.querySelector('form [required]')) return false;
        return !!document.querySelector('form button[type="submit"], form input[type="submit"]');
      }),
  },
  {
    title: 'לא נשארו בקובץ סימוני `CODE HERE`',
    expected: 'כל מקום שסומן `CODE HERE` הוא מקום שבו אתה כותב. מחק את הסימון אחרי שכתבת.',
    run: async (page) =>
      page.evaluate(() => {
        const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_COMMENT);
        while (walker.nextNode()) {
          if (/CODE HERE/.test(walker.currentNode.nodeValue || '')) return false;
        }
        return true;
      }),
  },
];
