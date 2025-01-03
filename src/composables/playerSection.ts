import { DEFAULT_PLAYER_SECTION_ID, DEFAULT_SECTION_TYPE_ID, PLAYER_SECTIONS_COLLECTION_REF } from "@/constants"
import { PlayerSection } from "@/types"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

export function usePlayerSection(rSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rSectionId)
    if (id === DEFAULT_PLAYER_SECTION_ID) return null
    console.debug(`Fetching section ${id}`)
    return doc(PLAYER_SECTIONS_COLLECTION_REF, id)
  })
  return useDocument<PlayerSection>(dbRef)
}

export function usePlayerSections(rSectionTypeId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const sectionTypeId = toValue(rSectionTypeId)
    if (sectionTypeId === DEFAULT_SECTION_TYPE_ID) return null
    console.debug(`Fetching sections from ${sectionTypeId}`)
    // prettier-ignore
    return query(
      PLAYER_SECTIONS_COLLECTION_REF, 
      where("sectionType", "==", sectionTypeId), 
      orderBy("number")
    )
  })
  return useCollection<PlayerSection>(dbRef)
}

export function useTopSections(rSectionType: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const sectionType = toValue(rSectionType)
    const limit = toValue(rLimit)
    if (!sectionType) return null
    console.debug(`Fetching the ${limit} top sections from sectionType ${sectionType}`)
    // prettier-ignore
    return query(
      PLAYER_SECTIONS_COLLECTION_REF, 
      where("sectionType", "==", sectionType),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<PlayerSection>(dbRef)
}
