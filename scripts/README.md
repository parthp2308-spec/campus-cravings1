# Scripts

## Keeping Union Street Market menus updated

Menus for **Pompeii Oven**, **Tostada Grill**, and **Soup & Mac** come from [UConn Dining – Union Street Market](https://nutritionanalysis.dds.uconn.edu/shortmenu.aspx?sName=UCONN+Dining+Services&locationNum=43&locationName=Union+Street+Market&naFlag=1).

### Option 1: Live menu (always current)

- Open **union-live.html** in the site. It loads today’s menu from UConn’s site (in an iframe or via a direct link).
- No setup; the menu updates whenever UConn updates it.

### Option 2: Fetch script (for JSON / automation)

- Run: `node scripts/fetch-uconn-menu.js`
- This fetches today’s menu and writes **data/union-menu.json**.
- You can run it on a schedule (e.g. daily cron) so the JSON is always recent. The static menu pages (pompeii.html, tostada.html, etc.) are built from a snapshot; this script only updates the JSON file. To have the site use the JSON, you’d need to add JS that loads `data/union-menu.json` and renders the menu (and serve the site so the JSON is accessible).

Requirements: Node.js (no extra packages).
