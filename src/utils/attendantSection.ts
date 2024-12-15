import { ATTENDANT_SECTIONS_COLLECTION_REF } from "@/constants"
import { AttendantSection } from "@/types"
import { getDocs, query, where } from "firebase/firestore"

// Getters

/**
 * Get the staff section data
 * @returns the section data and the id in an array
 */
export const getStaffSection = async (): Promise<[AttendantSection, string]> => {
  const dbRef = query(ATTENDANT_SECTIONS_COLLECTION_REF, where("isStaff", "==", true))
  const querySnapshot = await getDocs(dbRef)
  if (querySnapshot.empty) throw Error("Staff group not found in DB")
  if (querySnapshot.size > 1) throw Error("There is more than one staff group in the database")
  return [querySnapshot.docs[0].data() as AttendantSection, querySnapshot.docs[0].id]
}

/**
 * Get the section data of a given attendant section id
 * @param sectionId an attendant section id
 * @returns the section data (without the id)
 */ 
export const getAttendantSection = async (sectionId: string): Promise<AttendantSection> => {
  const dbRef = query(ATTENDANT_SECTIONS_COLLECTION_REF, where("sectionId", "==", sectionId))
  const querySnapshot = await getDocs(dbRef)
  if (querySnapshot.empty) throw Error("Attendant section not found in DB")
  if (querySnapshot.size > 1) throw Error(`There is more than one attendant section with id ${sectionId} in the database`)
  return querySnapshot.docs[0].data() as AttendantSection
}