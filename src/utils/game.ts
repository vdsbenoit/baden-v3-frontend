import { DEFAULT_GAME_ID, GAMES_COLLECTION_NAME, GAMES_COLLECTION_REF, USER_PROFILES_COLLECTION_REF } from "@/constants"
import { addToDocArray, removeFromDocArray } from "@/services/firebase"
import { updateUserProfile } from "@/utils/userProfile"
import { doc, getDoc, updateDoc } from "firebase/firestore"

// Getters

export async function getGame(gameId: string) {
  if (gameId === DEFAULT_GAME_ID) throw Error("Game id is the default value")
  const docSnap = await getDoc(doc(GAMES_COLLECTION_REF, gameId))
  if (docSnap.exists()) return docSnap.data()
  else throw Error(`Game not found with id ${gameId}`)
}

// Setters

export const setGameName = (gameId: string, name: string) => {
  console.log(`Changing the name of game ${gameId} to ${name}`)
  const dbRef = doc(GAMES_COLLECTION_REF, gameId)
  return updateDoc(dbRef, { name })
}

/**
 * Add the attendant to the game document, and the game to the attendant profile
 */
export const addAttendant = async (gameId: string, uid: string, timeSlotId: string) => {
  const userDocRef = doc(USER_PROFILES_COLLECTION_REF, uid)
  const gameDocRef = doc(GAMES_COLLECTION_REF, gameId)
  console.log(`Adding user ${uid} to game ${gameId} at timing id ${timeSlotId}`)
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId, `attendants.${timeSlotId}`, userDocRef)
  console.log(`Adding game ${gameId} to user ${uid}`)
  const userMergePromise = updateUserProfile(uid, { [`games.${timeSlotId}`]: gameDocRef })
  return Promise.all([gameMergePromise, userMergePromise])
}

/**
 * Remove attendant from the game, and the game from the attendant profile
 */
export const removeAttendant = async (gameId: string, uid: string, timeSlotId: string) => {
  const userDocRef = doc(USER_PROFILES_COLLECTION_REF, uid)
  // remove from game
  console.log(`Removing user ${uid} from game ${gameId} at timing id ${timeSlotId}`)
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId, `attendants.${timeSlotId}`, userDocRef)

  // remove from user profile
  console.log(`Removing game ${gameId} from user profile ${uid} at timing id ${timeSlotId}`)
  const userMergePromise = updateUserProfile(uid, { [`games.${timeSlotId}`]: DEFAULT_GAME_ID })

  return Promise.all([gameMergePromise, userMergePromise])
}

export const setGameNoScores = async (gameId: string, noScores: boolean) => {
  const dbRef = doc(GAMES_COLLECTION_REF, gameId)
  return updateDoc(dbRef, { noScores })
}
