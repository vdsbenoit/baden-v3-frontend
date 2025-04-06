import { DEFAULT_GROUP_ID, DEFAULT_GROUP_CATEGORY_ID, GROUPS_COLLECTION_REF } from "@/constants"
import { PlayerGroup } from "@/types"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

export function usePlayerGroup(rGroupId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const groupId = toValue(rGroupId)
    if (groupId === DEFAULT_GROUP_ID) return null
    console.log(`Fetching player group ${groupId}`)
    return doc(GROUPS_COLLECTION_REF, groupId)
  })
  return useDocument<PlayerGroup>(dbRef)
}

export function usePlayerGroups(rGroupCategoryId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const groupCategoryId = toValue(rGroupCategoryId)
    if (groupCategoryId === DEFAULT_GROUP_CATEGORY_ID) return null
    console.log(`Fetching player player groups from category ${groupCategoryId}`)
    // prettier-ignore
    return query(
      GROUPS_COLLECTION_REF, 
      where("groupCategoryId", "==", groupCategoryId), 
      orderBy("number")
    )
  })
  return useCollection<PlayerGroup>(dbRef)
}

export function useTopPlayerGroups(rGroupCategoryId: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const groupCategoryId = toValue(rGroupCategoryId)
    const limit = toValue(rLimit)
    if (groupCategoryId === DEFAULT_GROUP_CATEGORY_ID) return null
    console.log(`Fetching the ${limit} top player groups from category ${groupCategoryId}`)
    // prettier-ignore
    return query(
      GROUPS_COLLECTION_REF, 
      where("groupCategoryId", "==", groupCategoryId),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<PlayerGroup>(dbRef)
}
