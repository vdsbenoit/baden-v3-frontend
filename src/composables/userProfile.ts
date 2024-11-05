import { DEFAULT_SECTION_ID, DEFAULT_USER_ID, USER_PROFILES_COLLECTION_REF } from "@/constants"
import { UserProfile } from "@/types"
import { getRoleByValue } from "@/utils/userProfile"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useCurrentUser, useDocument } from "vuefire"
import { useCanAcceptApplicants } from "./rights"

export function useUserProfile(rUid: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const uid = toValue(rUid)
    if (uid === DEFAULT_USER_ID) {
      console.debug(`User profile not fetched because the provided uid is the default one (uid is ${uid})`)
      return null
    }
    console.debug(`Fetching user profile ${uid}`)
    return doc(USER_PROFILES_COLLECTION_REF, uid)
  })
  return useDocument<UserProfile>(dbRef)
}

export function useCurrentUserProfile() {
  const currentUser = useCurrentUser()
  const uid = computed(() => {
    if (currentUser.value === undefined) {
      console.debug(`Cannot fetch current user profile because the Auth module is still loading`)
      return DEFAULT_USER_ID
    }
    if (currentUser.value === null) {
      console.debug(`Cannot fetch current user profile because it does not exist in the Auth db`)
      return DEFAULT_USER_ID
    }
    return currentUser.value.uid
  })
  return useUserProfile(uid)
}

export function useMembersOfSection(rSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const sectionId = toValue(rSectionId)
    if (sectionId === DEFAULT_SECTION_ID) return null
    console.debug(`Fetching users from section ${sectionId}`)
    // prettier-ignore
    return query(
      USER_PROFILES_COLLECTION_REF, 
      where("sectionId", "==", sectionId)
    )
  })
  return useCollection<UserProfile>(dbRef)
}

/**
 * List the applicants for a specific section
 * This function might return applicants that the current user cannot accept
 * @param rLimit The maximum number of applicants to fetch
 * @param rSectionId The section id to fetch applicants from. If the default section id is provided, no applicants will be fetched
 * @returns The list of applicants
 */
export function useSectionApplicants(rLimit: MaybeRefOrGetter<number>, rSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const sectionId = toValue(rSectionId)
    if (sectionId === DEFAULT_SECTION_ID) return null
    const limit = toValue(rLimit)
    console.debug(`Fetching pending applicants for section ${sectionId}`)
    const queryParams = []
    queryParams.push(orderBy("requestedRole", "desc"))
    queryParams.push(where("requestedSectionId", "==", toValue(rSectionId)))
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
  const { canAcceptApplicants, maxApplicantRole, applicantSectionIdFilter } = useCanAcceptApplicants()
  const dbRef = computed(() => {
    if (!canAcceptApplicants.value) return null
    const limit = toValue(rLimit)
    console.debug(`Fetching pending applicants for a ${getRoleByValue(maxApplicantRole.value)}`)
    const queryParams = []
    queryParams.push(orderBy("requestedRole", "desc"))
    queryParams.push(where("requestedRole", "<=", maxApplicantRole.value))
    if (applicantSectionIdFilter.value) {
      queryParams.push(where("requestedSectionId", "==", applicantSectionIdFilter.value))
    }
    queryParams.push(fbLimit(limit))
    return query(USER_PROFILES_COLLECTION_REF, ...queryParams)
  })
  return useCollection<UserProfile>(dbRef)
}

export function useLatestUsers(rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const limit = toValue(rLimit)
    console.debug(`Fetching latest registered users`)
    // prettier-ignore
    return query(
      USER_PROFILES_COLLECTION_REF, 
      orderBy("creationDate", "desc"),
      fbLimit(limit)
    )
  })
  return useCollection<UserProfile>(dbRef)
}
