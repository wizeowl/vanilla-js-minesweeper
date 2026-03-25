# Accessibility Audit - Phase 0 (Etat post-implementation)

Date: 2026-03-25
Perimetre: `index.html`, `style.css`, `script.js`, `controls.js`, `counters.js`
Reference: `accessibility-roadmap.md` (Phase 0)

## Methodologie

Checks executes:
- Analyse statique des fichiers HTML/CSS/JS
- Verification IDE (`get_errors`) sur les fichiers du perimetre
- Verification syntaxique JS (`node --check`)
- Releves structurels (`aria-live`, `role="grid"`, landmarks, media queries a11y)

Checks non executes dans cette passe:
- Lighthouse Accessibility
- axe DevTools / axe CLI
- Tests lecteurs d'ecran en execution reelle (VoiceOver/NVDA/TalkBack)

## Synthese du statut

- **Ecarts majeurs: traites** (landmarks, grille exposee, annonces live, dialogs nommes, boutons natifs, prefs CSS systeme).
- **P0: traites au niveau code** (modele de grille, `aria-live`, nommage dialogs).
- **Phase suivante (clavier grille): majoritairement implementee** (cellule active, `tabindex` roving, fleches sans scroll).
- **Risque residuel principal**: validation terrain avec lecteurs d'ecran reellement actifs.

## Statut des ecarts majeurs

1. Landmarks (`main`, `header`, `section`) -> **Fait** (`index.html`)
2. Modele accessible grille (`role="grid"`, cellules nommees) -> **Fait** (`index.html`, `script.js`)
3. Regions `aria-live` pour statut critique -> **Fait** (`index.html`, `script.js`, `counters.js`)
4. Elements non natifs `div[role="button"]` -> **Fait** (conversion en `button`)
5. Dialogs nommes explicitement -> **Fait** (`aria-labelledby`, `aria-describedby`)
6. Preferences a11y systeme (`prefers-reduced-motion`, `prefers-contrast`) -> **Fait** (`style.css`)

## Backlog priorise (mis a jour)

## P0

1. Modele accessible de grille (role/etats/cellules) -> **Fait (code)**
2. Annonces `aria-live` evenements critiques -> **Fait (code)**
3. Nommage des dialogs (titre + description) -> **Fait (code)**

## P1

4. Landmarks semantiques -> **Fait (code)**
5. Migration vers controles natifs `button` -> **Fait (code)**
6. Preferences CSS systeme -> **Fait (code)**

## P2 (reste a faire)

7. Standardiser les libelles accessibles (naming guide) -> **Restant**
8. Ajouter checklist PR accessibilite -> **Restant**

## Grille de tests d'acceptation (Phase 0)

| Scenario | Attendu | Statut actuel |
|---|---|---|
| Navigation clavier globale | Tous les controles principaux atteignables + focus visible | OK |
| Navigation clavier dans la grille | Cellule active synchronisee + deplacement fleches sans scroll page | OK |
| Raccourcis pendant dialog ouvert | Aucun conflit avec gameplay | OK |
| Ouverture/fermeture dialogs | Focus et fermeture clavier coherents | OK |
| Lecture non visuelle de la grille | Cellules nommees + etats annonces | Partiel* |
| Annonces victoire/defaite | Message vocal automatique | Partiel* |
| Annonces compteur/timer | Feedback non visuel disponible | Partiel* |
| Navigation par landmarks | Regions principales identifiables | OK |

\* Partiel = present au niveau code, non valide en test lecteur d'ecran reel dans cette passe.

## Prochaines actions recommandees

1. Executer un run VoiceOver (macOS) sur un parcours complet (start -> reveal/flag -> win/lose).
2. Lancer un audit axe/Lighthouse et corriger les ecarts restants.
3. Produire la checklist PR a11y et un guide de libelles (P2).

## Trace des preuves (cette passe)

- `get_errors` sur `index.html`, `style.css`, `script.js`, `controls.js`, `counters.js`: aucune erreur.
- `node --check` sur `script.js`, `controls.js`, `counters.js`: OK.
- Recherche structurelle positive:
  - `aria-live`, `role="grid"`, `aria-labelledby` dans `index.html`
  - `header` / `main` dans `index.html`
  - `prefers-reduced-motion` / `prefers-contrast` dans `style.css`

