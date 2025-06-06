# To do

## En cours

- [x] Use VueFire instead of Magnetar
- [x] Define isStaff to the Team BB leaderSection
- [x] use isStaff to define Team bb team
- [x] Mettre tous les checks de rôles au même endroit (dans un service dédidé). C'est parfois fait au niveau service (setMorningLeaders) et parfois pas (setGameScore).
  - [ ] Essayer de centraliser tout ce qui est lié aux rôles (`App.vue` vs `router/index.ts`, plein de `showRanking` dans différents components)
- [x] Remove totem from UserProfile type
- [x] use useRouteParams from vueUse
- [x] Refactor morningGame & afternonGame into something generic : attendantTimings (similar to playerTimings)
- [x] Remove id from documents and custom types : use the built-in id from vuefire
- [x] Merge section & leaderSection collections

## User feedback

- [x] indiquer lorsqu'un timing a complétement été encodé
- [x] ajouter un attribut sur les épreuves sans score (e.g. pause)
- [x] ajouter un attribut aux matches du type "noScores"
  - [x] créer un bouton pour configurer ceci sur GamePage
- [x] ne pas mettre libre sur les épreuves où il y a déjà 1 personne. Avoir un 3e state
- [x] Faire en sorte que les sections ne tombent pas contre elles-mêmes (sinon ça fait tjrs une défaite et une victoire dans la même section)
- [ ] Mettre le plan en dessous de chaque épreuve
- [ ] Système pour générer un version imprimable des classements
- [ ] Bouton pour demander de l'aide -> notif aux organisateurs

## Notes 2025

- [ ] Enregistrer qui accepte un applicant
- [ ] Badges blancs sur blancs
- [ ] Revoir les roles : Erreur, anonyme, nouveau compte, en attente de validation, player, etc
- [ ] Revoir les groupe roles. Pq pas une liste de user rôles acceptés par le groupe ?
- [ ] Trouver une manière de donner un rôle d'organisateur aux chefs pios sans pour autant faire de tous les pios des organisateurs
      Idéalement, les chefs pios n'ont pas accès aux scores en live. Que les 'vrais' organisateurs (staff bb)
      Peut-être créer un nouveau role?
      Ou bien créer 2 groups : un animateur (4) et un organisateur (6)
- [ ] Page pour créer sections animateurs

## Pages

- [ ] Paramètres généraux de l'app

  - [ ] set schedule
  - [ ] set leaderTimings

- [ ] ignore_score

  - [ ] réduire nbTeams de la section (pour le score)
  - [ ] afficher l'équipe d'une certaine manière aux animateurs

- [ ] Tableau de gestion équipes (voir app précédente)
- [x] Inscription :
  - [x] choisir sa section et son rôle
  - [x] Compléter son profil
- [x] Animateurs : liste des animateurs avec filtre par section
- [x] Notifications : demande d'accès
- [ ] Système de recherche par numéro d’une team. Dire où elle joue en ce moment

## Modification DB

- [ ]

## Keep in mind

- Keep match times starting at 1 instead of 0 (even though [it might sound retarded](https://preview.redd.it/iwnqgrrbls5z.png?auto=webp&s=746c0b97fbb5ba8effbe596ad9f2e5c38832bea2)). That's useful in some checks like in the `CheckScoresPage`. Same same for game numbers
- [x] Try to change the first index of the timings to 0. It's annoying with all the arrays

## Parking

- [ ] Use Firestore References between Game & Match instead of id.
  - [ ] Profile morningGame should be a Reference too
  - [ ] Limit VueFire nesting to 1
- [ ] Rewrite loadLeaderInfo into something reactive
- [ ] Remove `next()` from guards (see [this post](https://router.vuejs.org/guide/advanced/navigation-guards.html#Optional-third-argument-next))
- [ ] Sanitize user inputs
- [ ] Add [recaptcha](https://firebase.google.com/docs/app-check/web/recaptcha-provider?authuser=1&hl=fr)
- [ ] Push notification (par ex pour rappeler d'enregistrer un score manquant)
- [ ] Retirer matches des collection games & teams (utiliser des queries à la place). Vérifier tout de même si ce n'est pas utile pour la validation de la db à la fin de l'initialisation.
- [ ] Faire des méthodes genre "getLeaderInfo" dans des cloud functions pour n'exposer qu'une partie des données.
- [ ] Get rid of snake case in the DB (e.g. matches collection)
- [ ] Trouver un moyen efficace de calculer le classement en temps réel et l'afficher dans les équipes & sections
  - [ ] Cloud functions qui aggregate le score moyen de chaque section
- [ ] Modifier détails section depuis SectionsPage
- [ ] Remove weights
- [ ] ? Optimize index (game_id>time and time>game_id)
- [ ] Intégrer la couleur d'équipe dans l'app et la DB
- [x] Fix Nprogress -> removed atm as not necessary
- [ ] Faire la distribution + générer les roadmaps/badges dans l'app
  - Créer des utilisateurs
  - Créer les équipes (cf distribution équipe ci dessous)
    - Séparer la création de chaque type de sections. Par ex, la création des équipes louveteaux ont leur propre paramètre MIN et MAX
    - Faire en sorte que l'on puisse refaire la distributions de équipes une fois que les pios ont déjà commencé à s'inscrire. En gros, ne pas toucher à la db de jeux, uniquement aux équipes.
  - Créer des jeux
  - Renommer jeux depuis l'app (attention: appliquer la modification à tous les matchs)
  - Editer les sections depuis l'app
- [ ] Change `isNewUser` with a check if profile exists. Because, as is, the app bugs when we wipe the users collection in firestore
- [ ] Rewrite Profile page code
- [ ] Refactor leaderSections into attendantGroups and sections into playerGroups and sectionTypes into playerCategories
- [ ] Refactor roles (cf users.ts)
- [ ] Update docs/
- [ ] Ensure users cannot exists without required UserProfile properties (redirect to onboarding if needed)
- [ ] Create AppSettings & AppConfig in the init process
- [ ] Remove id from the backend classes (python)
- [ ] Retirer groupName des profiels (créer une function getGroupName(groupId: string))

## Nice to have

- [ ] Description de jeu
- [ ] séparation visuelle pour midi dans l'horaire
- [ ] Fix bug uncaught promise après déconnexion
- [ ] OSS License
- [ ] Regular CI/CD pour check qu'un npm i fonctionne à travers le temps
- [ ] Avoid undefined values.
      For instance, set default game (e.g. afternoonGame) value to 0. Where 0 means no game is set yet.
- [ ] QR codes pour vérifier la présence des animateurs
  - [ ] Les organisateurs scan le QR code des animateurs
  - [ ] Le QR code contient l'ID de l'animateur + un timestamp pour éviter les screenshots
- [ ] Get rid of `?` and handle undefined data.
- [ ] Change gameId & sectionId & leaderSectionId type to string, for the sake of consistency
- [ ] Essayer la connexion avec numéro de téléphone (0.1€/sms)
- [ ] refactor matches to duels
- [ ] S'assurer que la souris semble clickable sur tous les éléments clickables (css `cursor: pointer;`)

## 2024

- [x] Update logo & couleurs
- [x] Update favicon
- [x] empêcher les navigateurs de traduire l’app
- [x] afficher les numéros de sections dans la liste des sections pour pouvoir les retrouver par numéros (comme dans RankingPage)
- [x] Lien vers section sur la TeamPage
- [ ] Update Magnetar & try to replace some .stream() with .fetch() (the bug may be fixed)
- [x] Renommer page « duel » en quelque chose comme « check scores »
- [x] Parfois les numéros d’équipe dans les cercles sont sur deux lignes (cf screenshot)
- [x] Donner acces au classement aux chefs
- [x] Refresh page instead of quit page when update is available
- [ ] Build new DB
  - [ ] Donner le rôle d'organisateur aux chefs pios lors de la config
  - [ ] wipe auth user db firebase
  - [x] Replace "match vs match" with game name in Check Scores page
  - [ ] Fix `game_names.yml` (add 5th circuit)
  - [x] Generate badges
  - [x] Generate roadmaps

## 2023

- [x] Backup DB 2022
- [x] fix infinite spinner on empty ranking page
- [x] Inscription aux épreuves
- [x] Refactor `categories` into `sectionType`
- [x] Split SectionsPage in two -> LeadersPage
- [x] Fix SectionsPage
- [x] Ajouter fields membres & chefs dans LeaderSection -> non, le faire via une query
- [x] Dans MatchPage, créer un boutton "Reset scores"
- [x] Add info ribbon homePage when pending request
- [x] Add info ribbon when request is rejected
- [x] Fix Profile
- [x] update DB rules
