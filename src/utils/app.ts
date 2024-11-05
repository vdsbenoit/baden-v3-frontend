// prettier-ignore
import { APP_COLLECTION_NAME, APP_CONFIG_DOC_NAME, APP_CONFIG_DOC_REF, APP_SETTINGS_DOC_REF, ATTENDANT_SCHEDULE_KEY, GAMES_COLLECTION_NAME, USER_PROFILES_COLLECTION_NAME, USER_PROFILES_GAMES_KEY } from "@/constants";
import { addToDocArray, generateRandomId, updateFieldInCollection } from "@/services/firebase";
import { AttendantTimeSlot } from "@/types";
import { getDoc, updateDoc } from "firebase/firestore";

// Getters

export async function isRankingPublic(): Promise<boolean> {
  const docSnap = await getDoc(APP_SETTINGS_DOC_REF)
  if (docSnap.exists()) return docSnap.data().isRankingPublic
  return false
}

// Setters

export const updateAppSettings = async (settingsData: any) => {
  return updateDoc(APP_SETTINGS_DOC_REF, settingsData)
}

export const addAttendantTiming = async (attendantTimeSlot: AttendantTimeSlot) => {
  attendantTimeSlot.id = generateRandomId()
  return addToDocArray(APP_COLLECTION_NAME, APP_CONFIG_DOC_NAME, ATTENDANT_SCHEDULE_KEY, attendantTimeSlot)
}

/**
 * @deprecated One should not remove the attendantTiming separately. Instead, reset all of them.
 * Removing a attendantTiming value expose the app to attendants registered to unknownn timing ids.
 */
export const removeAttendantTiming = (): never => {
  throw Error("One should not remove the attendantTiming one by one")
}

/**
 * Reset attendants timings
 * Do not use if attendant have already registered to games as it would reset the id of the timings
 * @param attendantTimings new attendant timings 
 * @returns 
 */
export const resetAttendantTimings = async (attendantTimings: AttendantTimeSlot[]) => {
  for (let i=0; i< attendantTimings.length; i++){
    if (!attendantTimings[i].name) attendantTimings[i].name = String(i+1)
    attendantTimings[i].id = generateRandomId()
  }
  // remove all attendant registrations in games and users collections
  const gamesCleaningPromise = updateFieldInCollection(GAMES_COLLECTION_NAME, ATTENDANT_SCHEDULE_KEY, {})
  const usersCleaningPromise = updateFieldInCollection(USER_PROFILES_COLLECTION_NAME, USER_PROFILES_GAMES_KEY, {})
  await Promise.all([gamesCleaningPromise, usersCleaningPromise])
  // apply new attendant timings
  return updateDoc(APP_CONFIG_DOC_REF, { attendantTimings })
} 

// fixme
export const hardcodeTimings = async () => {
  const playerTimings = [
    {start: "10h09", stop: "10h24" },
    {start: "10h27", stop: "10h42" },
    {start: "10h45", stop: "11h00" },
    {start: "11h03", stop: "11h18" },
    {start: "11h23", stop: "11h36" },
    {start: "11h39", stop: "11h54" },
    {start: "11h57", stop: "12h12" },
    {start: "13h15", stop: "13h30" },
    {start: "13h33", stop: "13h48" },
    {start: "13h51", stop: "14h06" },
    {start: "14h09", stop: "14h24" },
    {start: "14h27", stop: "14h42" },
    {start: "14h45", stop: "15h00" },
    {start: "15h15", stop: "15h30" },
    {start: "15h33", stop: "15h48" },
    {start: "15h51", stop: "16h06" },
    {start: "16h09", stop: "16h24" },
  ]
  const attendantTimings :AttendantTimeSlot[] = [
    {start: "08h30", stop: "12h00", id: "", name: "Matin"},
    {start: "13h00", stop: "17h00", id: "", name: "Après-midi"}
  ]
  // resetPlayerTimings(playerTimings)
  resetAttendantTimings(attendantTimings)
}
