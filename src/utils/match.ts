import { MATCHES_COLLECTION_REF } from "@/constants"
import { doc, updateDoc } from "firebase/firestore"

// Setters

export const setMatchScore = async (matchId: string, winnerTeamId: string, loserTeamId: string, reporterUid: string) => {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winnerTeamId, loserTeamId, draw: false, reporter: reporterUid, lastModified }).then(() =>
    console.log(`User ${winnerTeamId} was set as winner and ${loserTeamId} as loser of match ${matchId}`)
  )
}

export const setMatchDraw = async (matchId: string, reporterUid: string) => {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winnerTeamId: "", loserTeamId: "", draw: true, reporter: reporterUid, lastModified }).then(() =>
    console.log(`A draw has been set on match ${matchId}`)
  )
}

export const resetMatchScore = async (matchId: string, reporterUid: string) => {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winnerTeamId: "", loserTeamId: "", draw: false, reporter: reporterUid, lastModified }).then(() =>
    console.log(`Scores have been reset on match ${matchId}`)
  )
}

export const setMatchNoScores = async (matchId: string, noScores: boolean) => {
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { noScores })
}
