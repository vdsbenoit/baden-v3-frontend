import { DEFAULT_GROUP_CATEGORY_ID, DEFAULT_TEAM_ID, TEAMS_COLLECTION_REF } from "@/constants"
import { PlayerTeam } from "@/types"
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
  return useDocument<PlayerTeam>(dbRef)
}

export function useTopTeams(rGroupCategoryId: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const groupCategory = toValue(rGroupCategoryId)
    const limit = toValue(rLimit)
    if (groupCategory === DEFAULT_GROUP_CATEGORY_ID) return null
    console.log(`Fetching the ${limit} top teams from groupCategory ${groupCategory}`)
    // prettier-ignore
    return query(
      TEAMS_COLLECTION_REF, 
      where("groupCategory", "==", groupCategory),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<PlayerTeam>(dbRef)
}
