import { PLAYER_SECTIONS_COLLECTION_NAME, PLAYER_SECTIONS_COLLECTION_REF } from "@/constants"
import { incrementDocField } from "@/services/firebase"
import { RefPlayerSection, PlayerSection } from "@/types"
import { Section } from "@/types/Section"
import { doc, getDocs, query, updateDoc, where } from "firebase/firestore"
import { toValue } from "vue"

// Getters

/**
 * Get the section data of a given player section id
 * @param sectionId a player section id
 * @returns the section data (without the id)
 */
export const getPlayerSection = async (sectionId: string): Promise<Section> => {
  const dbRef = query(PLAYER_SECTIONS_COLLECTION_REF, where("sectionId", "==", sectionId))
  const querySnapshot = await getDocs(dbRef)
  if (querySnapshot.empty) throw Error("Player section not found in DB")
  if (querySnapshot.size > 1) throw Error(`There is more than one player section with id ${sectionId} in the database`)
  return querySnapshot.docs[0].data() as Section
}

// Setters

// fixme: move this to cloud function
export const updateSectionMeanScore = async (sectionId: string, section: PlayerSection) => {
  const meanScore = +(section.score / section.nbTeams || 0).toFixed(2)
  const dbRef = doc(PLAYER_SECTIONS_COLLECTION_REF, sectionId)
  return updateDoc(dbRef, { meanScore }).then(() =>
    console.debug(`Updating the mean score of section ${sectionId} to ${meanScore}`)
  )
}
export const addSectionWin = async (rSection: RefPlayerSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Adding 2 points to section ${section.id}`)
  await incrementDocField(PLAYER_SECTIONS_COLLECTION_NAME, section.id, "score", 2)
  await updateSectionMeanScore(section.id, section)
}
export const removeSectionWin = async (rSection: RefPlayerSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Removing 2 points to section ${section.id}`)
  await incrementDocField(PLAYER_SECTIONS_COLLECTION_NAME, section.id, "score", -2)
  await updateSectionMeanScore(section.id, section)
}
export const addSectionDraw = async (rSection: RefPlayerSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Adding 1 points to section ${section.id}`)
  await incrementDocField(PLAYER_SECTIONS_COLLECTION_NAME, section.id, "score", 1)
  await updateSectionMeanScore(section.id, section)
}
export const removeSectionDraw = async (rSection: RefPlayerSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Removing 1 points to section ${section.id}`)
  await incrementDocField(PLAYER_SECTIONS_COLLECTION_NAME, section.id, "score", -1)
  await updateSectionMeanScore(section.id, section)
}
