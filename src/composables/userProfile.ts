import { DEFAULT_GROUP_ID, DEFAULT_USER_ID, USER_PROFILES_COLLECTION_REF } from "@/constants"
import { UserProfile } from "@/types"
import { getRoleByValue } from "@/utils/userProfile"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useCurrentUser, useDocument } from "vuefire"
import { useAcceptApplicantRights } from "./rights"

export function useUserProfile(rUid: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const uid = toValue(rUid)
    if (uid === DEFAULT_USER_ID) {
      console.log(`User profile not fetched because the provided uid is the default one`)
      return null
    } else console.log(`Fetching user profile ${uid}`)
    return doc(USER_PROFILES_COLLECTION_REF, uid)
  })
  return useDocument<UserProfile>(dbRef)
}

export function useCurrentUserProfile() {
  const currentUser = useCurrentUser()
  const uid = computed(() => {
    if (currentUser.value === undefined) {
      console.log(`Cannot fetch current user profile because the Auth module is still loading`)
      return DEFAULT_USER_ID
    }
    if (currentUser.value === null) {
      console.error(`Cannot fetch current user profile because it does not exist in the Auth db`)
      return DEFAULT_USER_ID
    }
    return currentUser.value.uid
  })
  return useUserProfile(uid)
}

export function useMembersOfGroup(rGroupId: MaybeRefOrGetter<string>, rShouldLoad: MaybeRefOrGetter<boolean> = true) {
  const dbRef = computed(() => {
    const groupId = toValue(rGroupId)
    if (!toValue(rShouldLoad)) return null
    if (groupId === DEFAULT_GROUP_ID) return null
    console.log(`Fetching users from group ${groupId}`)
    // prettier-ignore
    return query(
      USER_PROFILES_COLLECTION_REF, 
      where("groupId", "==", groupId)
    )
  })
  return useCollection<UserProfile>(dbRef)
}

/**
 * List the applicants for a specific group
 * Note: this function might return applicants that the current user cannot accept
 * @param rLimit The maximum number of applicants to fetch
 * @param rGroupId The group id to fetch applicants from. If the default group id is provided, no applicants will be fetched
 * @returns The list of applicants
 */
export function useGroupApplicants(rLimit: MaybeRefOrGetter<number>, rGroupId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const groupId = toValue(rGroupId)
    if (groupId === DEFAULT_GROUP_ID) return null
    const limit = toValue(rLimit)
    console.log(`Fetching pending applicants for group ${groupId}`)
    const queryParams = []
    queryParams.push(where("requestedGroupId", "==", toValue(rGroupId)))
    queryParams.push(orderBy("requestedRole", "asc"))
    queryParams.push(fbLimit(limit))
    return query(USER_PROFILES_COLLECTION_REF, ...queryParams)
  })
  return useCollection<UserProfile>(dbRef)
}

/**
 * List the applicants that the current user can accept
 * @param rLimit The maximum number of applicants to fetch
 * @returns The list of applicants
 */
export function useApplicants(rLimit: MaybeRefOrGetter<number>) {
  const { canAcceptApplicants, maxApplicantRole, applicantGroupIdFilter } = useAcceptApplicantRights()
  const dbRef = computed(() => {
    if (!canAcceptApplicants.value) return null
    const limit = toValue(rLimit)
    console.log(`Fetching pending applicants for a ${getRoleByValue(maxApplicantRole.value)}`)
    const queryParams = []
    queryParams.push(orderBy("requestedGroupId", "asc"))
    if (applicantGroupIdFilter.value != DEFAULT_GROUP_ID) {
      queryParams.push(where("requestedGroupId", "==", applicantGroupIdFilter.value))
    }
    queryParams.push(orderBy("requestedRole", "asc"))
    queryParams.push(where("requestedRole", "<=", maxApplicantRole.value))
    queryParams.push(fbLimit(limit))
    return query(USER_PROFILES_COLLECTION_REF, ...queryParams)
  })
  return useCollection<UserProfile>(dbRef)
}

export function useLatestUsers(rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const limit = toValue(rLimit)
    console.log(`Fetching latest registered users`)
    // prettier-ignore
    return query(
      USER_PROFILES_COLLECTION_REF, 
      orderBy("creationDate", "desc"),
      fbLimit(limit)
    )
  })
  return useCollection<UserProfile>(dbRef)
}
