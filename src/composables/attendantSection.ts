import { DEFAULT_ATTENDANT_SECTION_ID, ATTENDANT_SECTIONS_COLLECTION_REF } from "@/constants"
import { AttendantSection } from "@/types"
import { doc, documentId, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"
import { useCurrentUserProfile } from "./userProfile"

export function useAttendantSection(rAttendantSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rAttendantSectionId)
    if (id === DEFAULT_ATTENDANT_SECTION_ID) return null
    console.log(`Fetching attendant section ${id}`)
    return doc(ATTENDANT_SECTIONS_COLLECTION_REF, id)
  })
  return useDocument<AttendantSection>(dbRef)
}

/**
 * Fetch the list of attendant sections
 * @param rShouldLoad To be used to lazy load the collection
 * @param rStaffSections To define if the staff sections should be included in the query, excluded or only the staff sections should be returned
 * @param rShowAllSections If false, only the current user section will be returned
 * @returns 
 */
export function useAttendantSections(
  rShouldLoad: MaybeRefOrGetter<boolean> = true,
  rStaffSections: MaybeRefOrGetter<"include" | "exclude" | "only"> = "include",
  rShowAllSections: MaybeRefOrGetter<boolean> = true
) {
  const dbRef = computed(() => {
    const staffSections = toValue(rStaffSections)
    const queryParams = []
    if (!toValue(rShouldLoad)) return null
    console.log(`Fetching attendant sections`)
    // To be used to return only the current user section
    if (!toValue(rShowAllSections)) {
      const currentUser = useCurrentUserProfile()
      if (!currentUser.value) return null
      console.log(`Filtering to current user section : ${currentUser.value.sectionId}`)
      queryParams.push(where(documentId(), "==", currentUser.value.sectionId))
    }
    if (staffSections === "exclude") {
      console.log(`Excluding staff group in the query`)
      queryParams.push(where("isStaff", "==", false))
    }
    if (staffSections === "only") {
      console.log(`Returning only staff group in the query`)
      queryParams.push(where("isStaff", "==", true))
    }
    queryParams.push(orderBy("name"))
    return query(ATTENDANT_SECTIONS_COLLECTION_REF, ...queryParams)
  })
  return useCollection<AttendantSection>(dbRef)
}
