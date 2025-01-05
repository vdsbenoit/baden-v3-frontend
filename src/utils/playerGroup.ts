import { GROUPS_COLLECTION_NAME, GROUPS_COLLECTION_REF, TEAMS_COLLECTION_REF, USER_PROFILES_COLLECTION_REF } from "@/constants"
import { incrementDocField } from "@/services/firebase"
import { PlayerGroup, PlayerTeam, UserProfile } from "@/types"
import { doc, getDocs, query, updateDoc, where } from "firebase/firestore"

// Getters

/**
 * Get the group data of a given player group id
 * @param playerGroupId a player group id
 * @returns the group data (without the id)
 */
export const getPlayerGroup = async (playerGroupId: string): Promise<PlayerGroup> => {
  const dbRef = query(GROUPS_COLLECTION_REF, where("groupId", "==", playerGroupId))
  const querySnapshot = await getDocs(dbRef)
  if (querySnapshot.empty) throw Error("Player group not found in DB")
  if (querySnapshot.size > 1) throw Error(`There is more than one player group with id ${playerGroupId} in the database`)
  return querySnapshot.docs[0].data() as PlayerGroup
}

// Setters

export const setGroupName = async (groupId: string, newGroupName: string) => {
  const promises = []
  const dbRefGroup = doc(GROUPS_COLLECTION_REF, groupId)
  promises.push(updateDoc(dbRefGroup, { name: newGroupName } as Partial<PlayerGroup>))
  const dbRefUsers = query(USER_PROFILES_COLLECTION_REF, where("groupId", "==", groupId))
  const querySnapshotUsers = await getDocs(dbRefUsers)
  querySnapshotUsers.forEach((doc) => {
    promises.push(updateDoc(doc.ref, { groupName: newGroupName } as Partial<UserProfile>))
  })
  const dbRefPlayerTeams = query(TEAMS_COLLECTION_REF, where("groupId", "==", groupId))
  const querySnapshotTeams = await getDocs(dbRefPlayerTeams)
  querySnapshotTeams.forEach((doc) => {
    promises.push(updateDoc(doc.ref, { groupName: newGroupName } as Partial<PlayerTeam>))
  })
  return Promise.all(promises).then(() => console.log(`${groupId} group name has been set to ${newGroupName}`))
}

// fixme: move this to cloud function
export const updateGroupMeanScore = async (playerGroupId: string) => {
  const playerGroup = await getPlayerGroup(playerGroupId)
  const meanScore = +(playerGroup.score / playerGroup.nbTeams || 0).toFixed(2)
  const dbRef = doc(GROUPS_COLLECTION_REF, playerGroupId)
  return updateDoc(dbRef, { meanScore }).then(() =>
    console.log(`The mean score of player group ${playerGroupId} has been set to ${meanScore}`)
  )
}
export const addGroupWin = async (playerGroupId: string) => {
  if (playerGroupId) throw Error("Cannot update score : group is undefined")
  console.log(`Adding 2 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, "score", 2)
  await updateGroupMeanScore(playerGroupId)
}
export const removeGroupWin = async (playerGroupId: string) => {
  if (playerGroupId) throw Error("Cannot update score : group is undefined")
  console.log(`Removing 2 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, "score", -2)
  await updateGroupMeanScore(playerGroupId)
}
export const addGroupDraw = async (playerGroupId: string) => {
  if (playerGroupId) throw Error("Cannot update score : group is undefined")
  console.log(`Adding 1 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, "score", 1)
  await updateGroupMeanScore(playerGroupId)
}
export const removeGroupDraw = async (playerGroupId: string) => {
  if (playerGroupId) throw Error("Cannot update score : group is undefined")
  console.log(`Removing 1 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, "score", -1)
  await updateGroupMeanScore(playerGroupId)
}
