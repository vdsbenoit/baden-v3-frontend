import { DEFAULT_ATTENDANT_SECTION_ID, ATTENDANT_SECTIONS_COLLECTION_REF, ROLES } from "@/constants"
import { LeaderSection } from "@/types"
import { doc, documentId, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"
import { useCurrentUserProfile } from "./userProfile"

export function useLeaderSection(rLeaderSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rLeaderSectionId)
    if (id === DEFAULT_ATTENDANT_SECTION_ID) return null
    console.debug(`Fetching leader section ${id}`)
    return doc(ATTENDANT_SECTIONS_COLLECTION_REF, id)
  })
  return useDocument<LeaderSection>(dbRef)
}

export function useLeaderSections(
  rExcludeStaff: MaybeRefOrGetter<boolean>,
  rShouldLoad: MaybeRefOrGetter<boolean> = true
) {
  console.debug(`Fetching leader sections`)
  const currentUser = useCurrentUserProfile()
  const dbRef = computed(() => {
    const queryParams = []
    if (!rShouldLoad) return null
    if (!currentUser.value) return null
    // Chefs can only see their own sections attendants
    if (currentUser.value.role <= ROLES.Chef) {
      console.debug(`Filtering to section ${currentUser.value.sectionId}`)
      queryParams.push(where(documentId(), "==", currentUser.value.sectionId))
    }
    if (toValue(rExcludeStaff)) {
      console.debug(`Excluding staff group in the query`)
      queryParams.push(where("isStaff", "!=", true))
    }
    queryParams.push(orderBy("name"))
    return query(ATTENDANT_SECTIONS_COLLECTION_REF, ...queryParams)
  })
  return useCollection<LeaderSection>(dbRef)
}
