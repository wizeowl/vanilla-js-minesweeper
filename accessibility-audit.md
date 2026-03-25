# Accessibility Audit - Phase 0 (Etat des lieux)

Date: 2026-03-25
Perimetre: `index.html`, `style.css`, `script.js`, `controls.js`
Reference: `accessibility-roadmap.md` (Phase 0)

## Methodologie

Checks executes:
- Analyse statique des fichiers HTML/CSS/JS
- Verification IDE (`get_errors`) sur les fichiers du perimetre
- Releves structurels via recherche (`role`, `aria-*`, `tabindex`, gestion clavier/dialog)

Checks non executes dans cette passe:
- Lighthouse Accessibility
- axe DevTools / axe CLI
- Tests lecteurs d'ecran en execution reelle (VoiceOver/NVDA/TalkBack)

## Baseline actuelle (resume)

Points positifs observes:
- Attributs `alt` decoratifs presents pour les drapeaux du titre (`index.html`).
- Plusieurs controles interactifs exposes avec `role`, `tabindex` et `aria-label` (`index.html`).
- Focus visible defini sur les elements interactifs (`style.css`).
- Blocage des raccourcis globaux quand un dialog est ouvert (`script.js`, `isDialogOpen`).
- Dialogs ouverts/fermes avec API native `showModal()` / `close()` (`controls.js`).

Ecarts majeurs observes:
- Pas de structure landmarks (`main`, `header`, `section`) pour navigation rapide lecteur d'ecran (`index.html`).
- Pas de modele accessible explicite pour la grille de jeu (`role="grid"`, nommage des cellules, etats annonces) (`index.html` + `script.js`).
- Pas de regions `aria-live` pour evenements critiques (victoire/defaite, compteur, timer, statut d'action) (`index.html` + `script.js`).
- Plusieurs elements non natifs restent en `div` avec `role="button"` (fonctionnel mais moins robuste que `button` natif) (`index.html`).
- Dialogs sans nom accessible explicite (`aria-labelledby`/titre de dialog) (`index.html`).
- Absence de preferences a11y systeme (`prefers-reduced-motion`, `prefers-contrast`) (`style.css`).

## Backlog priorise (P0 / P1 / P2)

## P0 (bloquant accessibilite fonctionnelle)

1. Ajouter un modele accessible de grille (role/etats/cellules)
- Impact: un lecteur d'ecran ne peut pas comprendre/operer clairement la grille.
- Cible: `index.html`, `script.js`
- WCAG: 1.3.1, 4.1.2, 2.1.1

2. Ajouter annonces `aria-live` pour evenements critiques
- Impact: absence de feedback non visuel sur actions et statut de partie.
- Cible: `index.html`, `script.js`
- WCAG: 4.1.3, 3.2.2

3. Nommer correctement les dialogs (titre + description)
- Impact: contexte incomplet lors de l'ouverture des modales.
- Cible: `index.html`, `controls.js`
- WCAG: 1.3.1, 4.1.2

## P1 (important UX a11y)

4. Introduire landmarks semantiques (`main`, `header`, sections)
- Impact: navigation assistee plus lente.
- Cible: `index.html`
- WCAG: 1.3.1, 2.4.1

5. Remplacer progressivement les `div[role="button"]` par des `button` natifs
- Impact: fiabilite clavier/AT meilleure, moins de logique custom.
- Cible: `index.html`, `script.js`
- WCAG: 2.1.1, 4.1.2

6. Ajouter preferences CSS systeme (`prefers-reduced-motion`, `prefers-contrast`)
- Impact: inconfort potentiel pour certains utilisateurs.
- Cible: `style.css`
- WCAG: 1.4.3, 1.4.11, 2.3.x (bonnes pratiques)

## P2 (durcissement et maintenabilite)

7. Standardiser les libelles accessibles (naming guide)
- Impact: coherence de voix UX variable.
- Cible: docs + code

8. Ajouter checklist PR accessibilite
- Impact: risque de regression a11y dans les futures features.
- Cible: process repo

## Grille de tests d'acceptation (Phase 0)

| Scenario | Attendu | Statut actuel |
|---|---|---|
| Navigation clavier globale | Tous les controles principaux atteignables + focus visible | Partiel |
| Raccourcis pendant dialog ouvert | Aucun conflit avec gameplay | OK |
| Ouverture/fermeture dialogs | Focus et fermeture clavier coherents | Partiel |
| Lecture non visuelle de la grille | Cellules nommees + etats annonces | KO |
| Annonces victoire/defaite | Message vocal automatique | KO |
| Annonces compteur/timer | Feedback non visuel disponible | KO |
| Navigation par landmarks | Regions principales identifiables | KO |

## Recommandations immediates (ordre d'execution)

1. Ajouter semantique grille + etats cellules (P0)
2. Ajouter `aria-live` pour statut jeu, resultat, compteurs (P0)
3. Nommer explicitement les dialogs (P0)
4. Structurer la page avec landmarks (P1)

## Trace des preuves (cette passe)

- `get_errors` sur `index.html`, `style.css`, `script.js`, `controls.js`: aucune erreur remontee.
- Recherche `aria-live|role="grid"|role="status"|role="alert"` dans `index.html`: aucune occurrence.
- Recherche `<main|<header|<nav|<section` dans `index.html`: aucune occurrence.
- Recherche `prefers-reduced-motion|prefers-contrast` dans `style.css`: aucune occurrence.
- Verification de la garde clavier dialog dans `script.js`: presente (`isDialogOpen`).

