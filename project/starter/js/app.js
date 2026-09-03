/*
 * ============================================================================
 * app.js — the entry point. It wires the three layers together and gets out of
 * the way. Eleven lines of actual work, and that is the point: if this file needs
 * to grow, something has leaked out of the layer it belonged in.
 *
 * The whole application, in order:
 *
 *   1. hydrate()            storage  → state
 *   2. subscribe(render)    state    → screen, on every change, forever
 *   3. wire()               screen   → state, via handlers that only setState
 *   4. render(getState())   draw once, because subscribing does not fire
 *
 * Step 4 is the one people forget. `subscribe` registers a listener for FUTURE
 * changes; nothing has changed yet, so without an explicit first call the page is
 * blank until the user happens to touch something. It is also the bug that looks
 * most like "my render function is broken" when it is not.
 *
 * ALL THREE PAGES LOAD THIS SAME FILE. There is no per-page entry point and no
 * switch on which page we are on: `render(state)` skips any region whose mount
 * element is absent, and `wire()` skips any control that is not there. index.html,
 * item.html and summary.html differ only in their markup.
 *
 * THIS FILE IS GIVEN TO YOU COMPLETE. There is nothing to fill in here, and if you
 * find yourself wanting to add to it, something has leaked out of the layer it
 * belonged in. It is worth reading once, in order, because the four lines below are
 * the entire architecture.
 * ============================================================================
 */
import { getState, hydrate, subscribe } from './state.js';
import { render } from './render.js';
import { wire, reportHydration } from './events.js';

/*
 * The module is loaded with `type="module"`, which is deferred by definition — so
 * the DOM is parsed by the time this runs and there is no `DOMContentLoaded`
 * listener anywhere in this application. That is the modern answer to the legacy
 * lesson worth keeping: "JavaScript should be loaded after HTML elements, or it
 * might fail to manipulate non-existent elements." The reasoning survives; the fix
 * is now `type="module"` rather than a script tag at the bottom of the body.
 */
const storageReport = hydrate();

subscribe(render);
wire();
render(getState());

/*
 * Last, deliberately: a warning about unreadable saved data is only worth showing
 * once the page it appears on has been drawn. Told after the first render, so the
 * user sees the shelf and the explanation together rather than a notice floating
 * above an empty document.
 */
reportHydration(storageReport);
