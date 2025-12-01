# Inclusion Quest – Mission Galère Collective (Digital Local Edition)

Cette application web propose une **version 100 % numérique** du jeu de société coopératif  
**Inclusion Quest – Mission Galère Collective**.

- Tous les joueurs sont autour du **même écran**.
- Le plateau, les cartes, le sablier et les scores sont gérés **sur l’interface**.
- Aucun serveur, aucun compte, aucune connexion réseau.

---

## 🎯 Concept du jeu

Inclusion Quest est un jeu coopératif où les joueurs vivent une **journée du quotidien**  
(école, travail, vie sociale…) et doivent imaginer des solutions **inclusives** face à des situations de handicap.

Sur la version numérique :

- Un **pion commun** avance sur un plateau d’environ 40 cases.
- Chaque case correspond à un contexte :
  - Vie sociale / Événements (Social),
  - Campus / École (Campus),
  - Entreprise / Bureau (Entreprise),
  - Transports (Transport).
- À chaque tour :
  1. Le joueur actif lance un **dé virtuel**.
  2. Le pion avance sur le plateau.
  3. Une **carte Situation** numérique est tirée (image recto/verso).
  4. Les joueurs discutent (IRL) d’une solution inclusive.
  5. Le joueur actif attribue des **Points d’Inclusion** / **Points Chaos**.

Le jeu reste **coopératif** : tout le monde gagne ou perd ensemble,  
mais l’application suit également la **contribution de chaque joueur**.

---

## 🧮 Système de score

Après chaque situation :

**Points d’Inclusion (positif) :**

- **+2** : solution très inclusive et réaliste (tout le monde est pris en compte).
- **+1** : solution inclusive mais imparfaite ou difficile à appliquer.
- **0** : bonne intention, mais peu réaliste ou peu inclusive.

**Points Chaos (malus / indicateur de tension) :**

- **+1** : compromis gagnant-perdant, au moins une personne exclue.
- **+2** : solution très excluante, absurde ou problématique.

L’application gère :

- un score **global d’équipe** (Inclusion total, Chaos total),
- des scores **par joueur** (Inclusion_joueur, Chaos_joueur).

Un seuil de victoire conseillé (ex. 30 Points d’Inclusion) peut être affiché en repère.

---

## 🖼️ Ressources graphiques

Le projet suppose la présence d’images dans :

```text
assets/
  board.png                  → image du plateau
  tokens/
    pawn.png                 → icône du pion (optionnel)
  cards/
    social/
      social_01_front.png
      social_01_back.png
      ...
    campus/
      campus_01_front.png
      campus_01_back.png
      ...
    enterprise/
      enterprise_01_front.png
      enterprise_01_back.png
      ...
    transport/
      transport_01_front.png
      transport_01_back.png
      ...
