import { TEAMS_COLLECTION_NAME } from '@/constants'
import { incrementDocField } from '@/services/firebase'

// Setters

export async function addTeamWin(teamId: string) {
  console.debug(`Adding 2 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, 'score', 2)
}
export async function removeTeamWin(teamId: string) {
  console.debug(`Removing 2 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, 'score', -2)
}
export async function addTeamDraw(teamId: string) {
  console.debug(`Adding 1 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, 'score', 1)
}
export async function removeTeamDraw(teamId: string) {
  console.debug(`Removing 1 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, 'score', -1)
}
