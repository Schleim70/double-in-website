# Double In Website

## Struktur

- `index.html` ist die Startseite.
- `pages/` enthält die Unterseiten. Desktop- und Mobil-Layout befinden sich jeweils in derselben HTML-Datei.
- `css/` enthält Desktop- und Mobil-CSS; Media Queries wählen anhand der Fensterbreite das Layout.
- `js/site.js` enthält gemeinsame Interaktionen und den Component-Loader.
- `components/` enthält wiederverwendbare Sidebar-, Zurück-Button-, Mobile-Navigations- und Footer-Fragmente.
- `assets/images/` und `assets/vectors/` enthalten Medien.

Die Seiten behalten beim Wechsel zwischen Desktop- und Mobilbreite ihre URL. Die Fragmente werden per `fetch` geladen; für lokale Vorschau die Projektwurzel mit einem statischen Webserver öffnen.
