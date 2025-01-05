import { DEFAULT_PLAYER_SECTION_ID, DEFAULT_SECTION_TYPE_ID, PLAYER_SECTIONS_COLLECTION_REF } from "@/constants"
import { PlayerSection } from "@/types"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

export function usePlayerSection(rSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rSectionId)
    if (id === DEFAULT_PLAYER_SECTION_ID) return null
    console.log(`Fetching section ${id}`)
    return doc(PLAYER_SECTIONS_COLLECTION_REF, id)
  })
  return useDocument<PlayerSection>(dbRef)
}

export function usePlayerSections(rgroupCategoryId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const groupCategoryId = toValue(rgroupCategoryId)
    if (groupCategoryId === DEFAULT_SECTION_TYPE_ID) return null
    console.log(`Fetching player sections from ${groupCategoryId}`)
    // prettier-ignore
    return query(
      PLAYER_SECTIONS_COLLECTION_REF, 
      where("groupCategoryId", "==", groupCategoryId), 
      orderBy("number")
    )
  })
  return useCollection<PlayerSection>(dbRef)
}

export function useTopSections(rgroupCategoryId: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const groupCategoryId = toValue(rgroupCategoryId)
    const limit = toValue(rLimit)
    if (groupCategoryId === DEFAULT_SECTION_TYPE_ID) return null
    console.log(`Fetching the ${limit} top sections from groupCategoryId ${groupCategoryId}`)
    // prettier-ignore
    return query(
      PLAYER_SECTIONS_COLLECTION_REF, 
      where("groupCategoryId", "==", groupCategoryId),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<PlayerSection>(dbRef)
}
