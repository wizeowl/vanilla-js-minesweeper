# Accessibility Roadmap

## Contexte et objectif

Ce document definit un plan par phases pour rendre le jeu conforme a **WCAG 2.2 AA** avec une UX compatible avec les outils d'accessibilite traditionnels (clavier seul, lecteurs d'ecran, navigation tactile).

## Perimetre

- Interface de jeu (`index.html`, `style.css`)
- Logique d'interaction (`script.js`, `controls.js`, `highlighter.js`)
- Dialogs et raccourcis clavier
- Resultats, timer, compteur de mines, feedback d'etat

## Definition of Done (globale)

- Parcours complet jouable au clavier seul
- Parcours complet jouable avec lecteur d'ecran
- Dialogs conformes (focus, fermeture, annonces)
- Informations critiques non dependantes de la couleur/icone seule
- Validation WCAG 2.2 AA sur les ecrans et flux principaux

---

## Phase 0 - Baseline et audit (Semaine 1)

### Objectifs

- Etablir un etat de reference mesurable
- Lister les ecarts critiques AA

### Taches cles

- Audit rapide automatique (axe, Lighthouse)
- Audit manuel clavier (ordre tab, focus visible, pieges focus)
- Audit lecteur d'ecran (VoiceOver macOS + iOS)
- Cartographie des composants interactifs non natifs

### Livrables

- Rapport baseline (issues + severite)
- Backlog priorise P0/P1/P2
- Grille de tests d'acceptation

### Risques

- Sous-estimation des cas non visuels
- Regressions clavier pendant les refactors UI

### Criteres d'acceptation

- 100% des ecrans/flux critiques couverts par la baseline
- Liste des ecarts critiques validee produit/dev

---

## Phase 1 - Fondations semantiques et focus (Semaines 1-2)

### Objectifs

- Donner des roles/noms/etats robustes
- Rendre le focus previsible et visible

### Taches cles

- Verifier que toutes les actions sont de vrais `button` ou equivalent ARIA correct
- Ajouter/normaliser `aria-label` et noms accessibles
- Uniformiser les styles `:focus-visible` (contraste, offset, cohérence)
- Clarifier landmarks (`main`, sections, titres)

### Livrables

- Composants interactifs semantiques
- Guide interne "naming/labels ARIA"

### Risques

- Sur-annotation ARIA inutile ou contradictoire

### Criteres d'acceptation

- Chaque controle expose un nom accessible pertinent
- Focus visible sur tous les composants navigables

---

## Phase 2 - Grille jouable au clavier (Semaines 2-3)

### Objectifs

- Permettre une partie complete au clavier
- Eviter les conflits de raccourcis (dialogs, mode jeu)

### Taches cles

- Definir un modele clavier canonique pour la grille
- Assurer deplacement + action reveal/flag/reveal-around sans souris
- Bloquer les raccourcis globaux quand un dialog est ouvert
- Garantir retour focus apres fermeture de dialog

### Livrables

- Spec d'interaction clavier (table de touches)
- Scenarios E2E clavier (new game -> win/lose)

### Risques

- Collisions de raccourcis avec lecteurs d'ecran

### Criteres d'acceptation

- Partie complete possible clavier seul
- Aucun piege focus dans les dialogs

---

## Phase 3 - Lecteurs d'ecran et etats dynamiques (Semaines 3-4)

### Objectifs

- Rendre les changements d'etat audibles sans surcharge

### Taches cles

- Definir annonce des cellules (masquee, revelee, mine, drapeau, mines adjacentes)
- Ajouter regions `aria-live` pour evenements critiques:
  - debut de partie
  - victoire/defaite
  - compteur de mines / timer (annonces non intrusives)
- Assurer annonces explicites dans les dialogs et resultats

### Livrables

- Matrice "etat UI -> message vocal"
- Script de test VoiceOver/NVDA

### Risques

- Trop d'annonces (fatigue cognitive)
- Annonces en retard ou non deterministes

### Criteres d'acceptation

- Evenements critiques annonces exactement une fois
- Messages courts, coherents, comprehensibles

---

## Phase 4 - Mobile/tactile et alternatives (Semaines 4-5)

### Objectifs

- Assurer equivalence fonctionnelle tactile/clavier
- Fiabiliser l'ergonomie mobile accessible

### Taches cles

- Verifier tailles de cibles tactiles (>= 44x44)
- Proposer alternatives explicites aux gestes caches (double tap/long press)
- Tester orientation, zoom, reflow a 200%
- Verifier TalkBack/VoiceOver mobile

### Livrables

- Guide UX tactile accessible
- Checklist mobile a11y

### Risques

- Gestes complexes difficiles a discover
- Regressions desktop apres ajustements mobile

### Criteres d'acceptation

- Toutes actions tactiles ont une alternative visible et clavier
- Parcours mobile complet sans blocage d'accessibilite

---

## Phase 5 - Robustesse, prefs utilisateur, et documentation (Semaines 5-6)

### Objectifs

- Stabiliser l'experience et la maintenir dans le temps

### Taches cles

- Ajouter preferences utilisateur (haptics, niveau d'annonces)
- Documenter les conventions a11y dans `README.md`
- Ajouter controles anti-regression (lint/accessibility checks)
- Mettre en place une checklist PR accessibilite

### Livrables

- Playbook a11y equipe
- Checklist PR + template de tests manuels

### Risques

- Dette reintroduite sans garde-fous

### Criteres d'acceptation

- Toute PR UI passe la checklist a11y
- Documentation d'exploitation a11y a jour

---

## Strategie de validation

## Outils automatiques

- axe DevTools
- Lighthouse Accessibility

## Tests manuels obligatoires

- Clavier seul: partie complete (gagner/perdre)
- Lecteur d'ecran desktop: VoiceOver (macOS), NVDA (Windows)
- Lecteur d'ecran mobile: VoiceOver (iOS), TalkBack (Android)
- Zoom 200% et reflow
- Contraste et etat focus

## KPI de suivi

- Nombre d'issues a11y critiques ouvertes/fermees
- Taux de parcours clavier sans blocage
- Taux de scenarios lecteur d'ecran valides
- Nombre de regressions a11y par release

---

## Planning propose

- S1: Phase 0 + debut Phase 1
- S2: fin Phase 1 + Phase 2
- S3: Phase 3
- S4: Phase 4
- S5-S6: Phase 5 + durcissement

## Priorisation

1. P0: clavier + dialogs + focus
2. P0: annonces critiques lecteur d'ecran
3. P1: mobile/tactile equivalence
4. P1: gouvernance et anti-regression

