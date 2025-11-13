@echo off
mkdir assets 2>nul & mkdir assets\css 2>nul & mkdir assets\js 2>nul & mkdir assets\js\core 2>nul & mkdir assets\js\pages 2>nul & mkdir assets\js\services 2>nul & mkdir assets\mock 2>nul
type nul > assets\css\global.css & type nul > assets\css\layout.css & type nul > assets\css\components.css & type nul > assets\css\pages.css & type nul > assets\css\light.css
for %%F in (i18n.js nav.js theme.js mock-actions.js) do ( if not exist assets\js\core\%%F type nul > assets\js\core\%%F )
echo Done. Minimal skeleton recreated.
