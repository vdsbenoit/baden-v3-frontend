import { DEFAULT_SECTION_TYPE_ID, DEFAULT_TEAM_ID, TEAMS_COLLECTION_REF } from "@/constants"
import { Team } from "@/types"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

// Composables

export function useTeam(rId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    if (id === DEFAULT_TEAM_ID) return null
    console.log(`Fetching team ${id}`)
    return doc(TEAMS_COLLECTION_REF, id)
  })
  return useDocument<Team>(dbRef)
}

export function useTopTeams(rSectionTypeId: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const sectionType = toValue(rSectionTypeId)
    const limit = toValue(rLimit)
    if (sectionType === DEFAULT_SECTION_TYPE_ID) return null
    console.log(`Fetching the ${limit} top teams from sectionType ${sectionType}`)
    // prettier-ignore
    return query(
      TEAMS_COLLECTION_REF, 
      where("sectionType", "==", sectionType),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<Team>(dbRef)
}
