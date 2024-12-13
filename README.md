# Baden score app

## v3

New UI from scratch, made with Vue & Ionic.  
Micro services backend replaced with Firebase (serverless hosting + cloud functions)

## Why this app

The goal of this app is to manage a kind of tournament played by a large number of players IRL. 
It was initially designed for a boyscout game I used to coordinate, called [Baden Battle](https://badenbattle.be/). At the first editions, there were only a few hundreds of people playing. Everything was done on paper (distributing the players across the games, recording the scores, etc). However, the game gained a lot of success and hosts now more than 1000 players. 

We faced two major scaling issues : 

### 1. Score registration

It became quickly impossible to record the scores on paper and compute them fast enough to share the name of the winner at the closing ceremony. We tried to use shared Excel sheets and online forms to record the scores but we faced the limit of this system too. 

### 2. Team distribution
Distributing the players into teams, and defining what team plays at what game at what time may seem simple. This is actually a complex combinatorics problem. See the 'Constraints' section below for more details about it.

Later on, I added a third use to this app :

### 3. Attendant registration
The game success grew to a point we had to hire some attendants from other boyscout units. 
In order to manage who is taking care of what game, I implemented a feature to facilitate attendant registration to games.

## Constrains

I searched the internet for any existing similar software first, unsuccessfully. 
What I found was mostly apps to manage tournaments. Our distribution differs from a tournament distribution. This is the main reason that motivated me to create this app.

Here are our constraints:

- Players register to the game in groups (called sections).
- Sections must be split in smaller groups (called teams) if needed. Teams count around 10 players (this is configurable).
- Teams must contain at least a leader (the players are children and cannot be left alone).
- Games are distributed in circuits. In one circuit, there are as many games as time slots during the day. The amount of circuit must be defined based on the amount of players and time slots. 
- A team only plays in one circuit. 
- Teams must play all the games of their circuit.
- A team cannot play against itself.
- A team cannot play a game twice.
- A team must play a few as possible against other teams from its section.
- There must be two teams at a game at a time.

I created a backend that uses a combinatorics solver ([PuLP](https://coin-or.github.io/pulp/)) to solve this problem.

## Main features

- Teams & games distribution (powered with [PuLP](https://coin-or.github.io/pulp/))
- Creation of paper roadmaps for team leaders (with docxcompose & docxtpl)
- Creation of paper roadmaps for game attendants
- Creation of badges for players
- Attendant registration (2 games / attendants, switch at noon)
- Score registration
- Live leaderboards
- Admin panels
  - User registration (admin & leaders have special rights)
  - Live score check (e.g. if some attendants forgot to register a score)

## Tech stack

- Vue 3 (Composition API)
- Ionic 6
- PWA
- Firebase (hosting & cloud functions)
- Python (backend, in a separate project)

## Note

This project is a side hustle. I had to write it fast, aside of my full-time job and the coordination of the Battle Battle itself (the event this project is made for). Therefore, there are a lot of imperfect / unfinished things.

Even though most of the code is in English, the app itself is in French, because it is targeting a French-speaking audience. I'd like to make it customizable (design and language) in the future. 

## Use

I initially created this project for the Baden Battle only. Due to time constraints, there is a lot of hardcoded stuff. However, I would like to make it available to anyone who would need such a tool. Making it open source is the first step, but I believe there is still a lot to do to deploy it for another event. My next step is to adapt the project and make the deploy instructions as simplistic as possible. If you are interested in using this project, feel free to mention it to me at benoit@frite.dev.

## Contributing

I am currently performing a huge refactoring of the project in the `feature/refactore_and_use_vuefire` branch. I am changing the way the project communicate with Firestore, transitioning from Magnetar (+ service functions) to VueFire (+ composables). Therefore, I wouldn't recommend anyone to onboard right now. Once this operation is done, I would be please to receive any contributions. In the meantime, the last stable version of the project is 0.3.10 (see git tags)
