# Why don’t I see my code changes?

Edits only show up if the app is loading the **latest** code. Use one of these workflows so changes are always visible.

---

## Recommended: development server (see changes immediately)

**Use this while you’re editing the app.**

1. From the project root (the folder with `package.json`), run:
   ```bash
   npm start
   ```
2. Open the URL shown (e.g. `http://localhost:3000`) in your browser.
3. Leave this terminal running. Every time you save a file, the app will reload with your changes. No manual build or refresh needed.

**Check:** Under the title you should see **“Development — changes reload live”**. That means you’re on the dev server and edits will show up on save.

---

## Alternative: production build (only when you need it)

Use this only when you want to test the **built** app (e.g. before deploy).

1. From the project root, run:
   ```bash
   npm run build:serve
   ```
   This builds the app and then serves the `build` folder. Open the URL it prints.

2. After you change code, you **must** run `npm run build:serve` again (or `npm run build` then refresh the served page). The browser is serving static files from `build`; they don’t update until you rebuild.

**Check:** Under the title you should see **“Built &lt;date/time&gt;”**. After you run `npm run build` again and **hard refresh** (Cmd+Shift+R or Ctrl+Shift+R), that time should update. If the time doesn’t change, the browser is still using a cached bundle.

---

## If you still don’t see changes

1. **Same project**  
   Make sure the terminal is in **this** project folder (the one that contains `package.json` and `src/illinois-tech-full-catalog-skill-tree.jsx`). If you have two copies of the repo, you might be editing one and running the other.

2. **Same URL**  
   Use the URL from the terminal where you ran `npm start` or `npm run build:serve`. Don’t use a different port, an old bookmark, or a deployed URL unless you’ve deployed the latest build.

3. **Cache**  
   - Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).  
   - Or open the app in an **incognito/private** window.  
   - Or in DevTools → Application (Chrome) / Storage (Firefox) → Clear site data for this origin.

4. **Build timestamp**  
   Under the title, the app shows either “Development — changes reload live” or “Built &lt;date/time&gt;”. After a rebuild + refresh, if the **Built** time doesn’t change, the new bundle isn’t loading; clear cache or use incognito and try again.
