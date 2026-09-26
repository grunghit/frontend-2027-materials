/*
 * ============================================================================
 * theme.js — the token layer, in ONE file, for all three pages.
 *
 * GIVEN TO YOU, AND IT WORKS AS IT IS. Change `--hue-brand` to make the application
 * yours; change a lightness only if you re-measure the contrast afterwards. Every
 * pair below passes WCAG AA in both colour schemes, and requirement 31 is graded on
 * the rendered pixels rather than on your intentions.
 *
 * ── WHY THIS IS A SCRIPT AND NOT A STYLESHEET
 *
 * The `@theme` block has to reach the compiler, and with no build step the
 * compiler is the browser build in vendor/tailwind.js. Two obvious ways to share
 * one block across three pages were tried and MEASURED. Both fail:
 *
 *   <link rel="stylesheet" href="theme.css" type="text/tailwindcss" />
 *       Silently ignored. The page renders, every utility that needs no custom
 *       token still works, and every token-backed one falls back to a default —
 *       so `text-brand` comes out black and nothing anywhere says why. This is
 *       the worst of the outcomes, because it looks like a page nobody styled.
 *
 *   <style type="text/tailwindcss">@import "theme.css";</style>
 *       Refused out loud: "The browser build does not support @import". At least
 *       it tells you.
 *
 * What works is putting the block in the DOM before the compiler runs. Both
 * scripts in the page head are classic and synchronous, so by the time
 * vendor/tailwind.js executes, the <style> below is already there and gets
 * compiled exactly as if it had been typed into the page.
 *
 * The cost is two lines per page, in a fixed order:
 *
 *   <script src="js/theme.js"></script>        <!-- must come FIRST -->
 *   <script src="vendor/tailwind.js"></script>
 *
 * Get the order wrong and the page renders unstyled, which is silent — so the
 * guard at the bottom of this file says so instead.
 *
 * ── THE PALETTE IS DERIVED FROM ONE NUMBER
 * `--hue-brand` is the same convention weeks 3 and 4 used in their stylesheets.
 * Change 268 to 190 and the whole application re-colours coherently, because no
 * colour here is an independent decision — every one is that hue at a chosen
 * saturation and lightness. Lightness carries the contrast, which is why the dark
 * ramp moves lightness and leaves the hue alone.
 *
 * ── HOW DARK MODE WORKS HERE, AND WHY THERE IS NOT ONE `dark:` IN THE MARKUP
 *
 * Week 6's decision was that an `@theme` entry IS a real CSS custom property. That
 * is not a slogan, and this is where it pays: the compiler emits
 *
 *     .text-ink { color: var(--color-ink); }
 *
 * — a REFERENCE, not the value. So redefining `--color-ink` on `:root` inside a
 * media query re-points every utility that uses it, everywhere, at once. The whole
 * dark ramp below is one media query and no prefixes.
 *
 * Two things this had to learn the hard way, both measured:
 *
 *   · `@theme` inside `@media (prefers-color-scheme: dark)` DOES NOT WORK. The
 *     compiler hoists the block out of the query, so the dark values win in both
 *     schemes and the page is permanently dark with no error anywhere. That was
 *     the first version of this file.
 *   · `var()` inside a token value DOES work, which is what makes one `--hue-brand`
 *     possible at all.
 *
 * `dark:bg-…` in the markup is equally correct and is what week 6 taught; this
 * route is the one week 6's token argument unlocks, and the project accepts either.
 *
 * Every foreground/background pair below passes WCAG AA in BOTH ramps, measured off
 * rendered pixels by the project's grading spec — not eyeballed. Do not hand-edit a
 * lightness without re-running it.
 * ============================================================================
 */
(() => {
  const style = document.createElement('style');
  style.setAttribute('type', 'text/tailwindcss');

  /*
   * Note what is NOT customised: the spacing multiplier and the type scale.
   * Tailwind's defaults are already a scale, and inventing a second one is how a
   * page ends up with two rhythms. `--spacing` stays at its default 0.25rem, so
   * `p-4` is 16px here exactly as it was in week 6.
   */
  style.textContent = `
    @theme static {
      --hue-brand: 268; /* CODE HERE - one number, and the whole app re-colours */

      /* Ground and surfaces */
      --color-paper: hsl(var(--hue-brand) 30% 99%);
      --color-surface: hsl(var(--hue-brand) 28% 96%);
      --color-surface-2: hsl(var(--hue-brand) 24% 91%);

      /*
         TWO BORDER TOKENS, AND THE DIFFERENCE IS A WCAG RULE RATHER THAN TASTE.

         1.4.11 Non-text Contrast requires 3:1 for "visual information required to
         identify user interface components and their states" — the edge of a text
         field, the outline of a button. It does NOT require it of a decorative
         hairline between two rows, because nothing is identified by that line.

         So \`--color-control\` is the border of anything you can type in or click,
         and it is measured at 3:1 against both grounds. \`--color-line\` is the
         decorative rule, and it is deliberately lighter — a 3:1 divider under
         every card reads as a table from the 1990s.

         Getting this backwards is the most common way a "we passed the contrast
         checker" page still fails: the checker looked at text.
      */
      --color-line: hsl(var(--hue-brand) 16% 78%);
      --color-control: hsl(var(--hue-brand) 20% 44%);

      /* Text */
      --color-ink: hsl(var(--hue-brand) 30% 12%);
      --color-ink-muted: hsl(var(--hue-brand) 14% 33%);

      /* The brand, and the ink that goes ON the brand */
      --color-brand: hsl(var(--hue-brand) 68% 38%);
      --color-brand-strong: hsl(var(--hue-brand) 72% 28%);
      --color-brand-ink: hsl(0 0% 100%);
      --color-brand-soft: hsl(var(--hue-brand) 88% 96%);

      /* Status. Three roles, each a hue AWAY from the brand on purpose — a
         status that shares the brand hue reads as branding. */
      --color-danger: hsl(352 72% 38%);
      --color-danger-ink: hsl(0 0% 100%);
      --color-danger-soft: hsl(352 90% 97%);

      --color-ok: hsl(162 72% 25%);
      --color-ok-ink: hsl(0 0% 100%);
      --color-ok-soft: hsl(162 56% 94%);

      --color-warn: hsl(30 86% 29%);
      --color-warn-soft: hsl(36 94% 93%);

      /* Shape. The card corner is generous, as in the legacy decks. */
      --radius-card: 16px;
      --radius-pill: 999px;

      /* Measure. 62ch is the top of the 40-75 character band week 7 argues for, and
         prose is the only thing that should get it. */
      --container-measure: 62ch;
    }

    /*
       The dark ramp — ordinary CSS redefining the properties @theme already
       emitted. See the header comment for why it cannot be a second @theme.
    */
    @media (prefers-color-scheme: dark) {
      :root {
        --color-paper: hsl(var(--hue-brand) 24% 9%);
        --color-surface: hsl(var(--hue-brand) 20% 14%);
        --color-surface-2: hsl(var(--hue-brand) 18% 19%);
        --color-line: hsl(var(--hue-brand) 14% 34%);
        --color-control: hsl(var(--hue-brand) 18% 64%);

        --color-ink: hsl(var(--hue-brand) 24% 96%);
        --color-ink-muted: hsl(var(--hue-brand) 12% 76%);

        --color-brand: hsl(var(--hue-brand) 90% 82%);
        --color-brand-strong: hsl(var(--hue-brand) 92% 90%);
        --color-brand-ink: hsl(var(--hue-brand) 40% 10%);
        --color-brand-soft: hsl(var(--hue-brand) 30% 22%);

        --color-danger: hsl(352 92% 78%);
        --color-danger-ink: hsl(352 40% 10%);
        --color-danger-soft: hsl(352 26% 20%);

        --color-ok: hsl(162 64% 64%);
        --color-ok-ink: hsl(162 40% 8%);
        --color-ok-soft: hsl(162 26% 17%);

        --color-warn: hsl(38 92% 68%);
        --color-warn-soft: hsl(38 26% 19%);
      }
    }

    /*
       Two rules that are not utilities and should not be.

       \`color-scheme\` tells the browser to render its OWN widgets — the scrollbar,
       the select popup, the text caret — to match. Without it a dark page keeps a
       white scrollbar, which is the most obvious sign that dark mode was bolted on.

       \`scroll-behavior\` sits inside a motion query so the skip link does not
       animate for a reader who asked for stillness. Same reasoning as the
       \`motion-safe:\` prefix on every transition in the markup (week 6), applied to
       the one piece of motion that has no utility to hang it on.
    */
    :root {
      color-scheme: light dark;
    }
    @media (prefers-reduced-motion: no-preference) {
      :root {
        scroll-behavior: smooth;
      }
    }
  `;

  document.head.append(style);

  /*
   * THE ORDER GUARD.
   *
   * If this file ran after vendor/tailwind.js — because somebody added `defer`,
   * moved a line, or copied only one of the two script tags into a new page — the
   * block above arrives too late, every token-backed utility falls back to a
   * default, and the result looks like a page where nobody wrote any classes. That
   * is a bad thing to debug, so it gets said out loud, once, with the fix in it.
   *
   * The probe is the token itself: if Tailwind compiled the block, `--color-ink`
   * resolves on :root. Checked on `load`, i.e. after the compiler has had its turn.
   */
  addEventListener('load', () => {
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-ink')
      .trim();
    if (resolved) return;
    console.error(
      'theme.js ran but no token resolved. js/theme.js must be the FIRST of the two ' +
        'scripts in <head>, before vendor/tailwind.js, and neither may carry defer or async.',
    );
  });
})();
