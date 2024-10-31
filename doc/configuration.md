# Configuration

This document describe the step to reset the app a configure a new game.  

⚠️ WIP ⚠️ This is a draft. I currently use this document as a specification to define how I am going to implement the setup of the app.

## Create sections

First, the user needs to create a section type. For instance `Lutins`.  Inform the user that the players will only play against people from the same sections type. 

The user can either <u>create new section type</u> or <u>load the data from an existing section type</u>.

A sections type comes with some dedicated parameters : 

| Parameter           | Description                                                  | Example  |
| ------------------- | ------------------------------------------------------------ | -------- |
| `name`              | Name of the section type                                     | `Lutins` |
| `minPlayersPerTeam` | Minimum number of players per team                           | 3        |
| `maxPlayersPerTeam` | Maximum number of players per team                           | 12       |
| `nbGamesPerCircuit` | Number of games a player plays during the day (pauses excluded). Must be odd! | 17       |

`nbGamesPerCircuit` defines multiple things : 

- The number of games a team plays during the day
- The number of games per circuit
- The number of teams per circuit (2 x `nb_games`)



Then, the user can either add sections one by one or load a batch through a a csv file.

Each section must have these fields: 

| Field     | Description         | Example          |
| --------- | ------------------- | ---------------- |
| City      | Ville de la section | Soignies         |
| Unit      | Unité de la section | BR015            |
| Name      | Nom de la section   | Louveteaux Férao |
| nbPlayers | Nombre d'animés     | 30               |
| nbLeaders | Nombre de chefs     | 6                |

Once all the sections have been defined, the user can click a button `Create teams, games & circuits`

If there is an error : explain what parameters need to be fixed and <u>re-run</u>.

If everything went through : ask if the user wants to <u>create/edit another section type</u> -> refresh the page

Button to validate the DB.

If all the section have been created, <u>link to schedule setup</u>

## Players schedule

Select a section type. Then list all the time slots from `sectionType.schedule`. 

The user can edit the `start `and the `stop` value of each time slot, but cannot change the order of the time slots.

The user can add breaks and move them across the time slots. There cannot be 2 consecutive breaks.

The user can edit the name of the breaks.

The user can load the values from another sectionType that has the same amount of time slots.

## Attendants schedule

Button to add time slot

Each time slot has these fields:

| Field | Description                  | Example |
| ----- | ---------------------------- | ------- |
| name  | What the attendant will see. | Matin   |
| start | Begining of the time slot    | 8h00    |
| stop  | End of the time slot         | 12h00   |

By default, two time slots are set : matin and après-midi

## Game names

Select circuit. Then list all game (id + name)

The user can edit game names or import from another circuit.

Plus : create a parser to parse from a list (e.g. an excell sheet or a text document)

## Documents

### Badges

Upload base image. 

Button to generate the team badges

Button to generate the staff badges

### Team roadmaps

#### 1. Prepare the templates

The user needs to create a roadmap template per circuit (A, B, C, etc)

Every template must have as many time slots as configured for the circuit. 

Breaks are not supported and must be hardcoded in the template.

#### 2. Upload the templates

Upload the roadmap template for every circuit. 

#### 3. Generate the roadmaps

Click button to generate the team roadmaps.

#### 4. Verify the roadmaps

Verify the roadmaps have been parsed properly (e.g. the map matches with the data, the amount of games)

### Attendant roadmaps

#### 1. Prepare the templates

The user needs to create as many roadmaps as there are variants of schedule. 

Every template must have as many time slots as configured for the circuit. 

Breaks are not supported and must be hardcoded in the template.

#### 2. Upload the templates

Upload the roadmap template for every circuit (according to how many time slots there is in the circuit)

#### 3. Generate the roadmaps

Click button to generate the game roadmaps.

#### 4. Verify the roadmaps

Verify the roadmaps have been parse properly (e.g. amount of time slots matches with the circuit, the part of the day matches)



