// prettier-ignore
import { MATCHES_COLLECTION_REF } from '@/constants';
import { initializeApp } from "firebase/app"
import "firebase/auth"
import {
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  User
} from "firebase/auth"
import "firebase/firestore"
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  getFirestore,
  increment,
  query,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore"
import { firebaseConfig } from "./firebaseConfig"

export const app = initializeApp(firebaseConfig)
const dbId = process.env.NODE_ENV === "production" ? "(default)" : "development"
export const db = getFirestore(app, dbId)
const auth = getAuth(app)

export const getAuthInstance = () => {
  return auth
}

/**
 * A helper function that generates a random Firestore ID
 * This function is used when you execute `insert` without specifying an ID
 */
export function generateRandomId() {
  return doc(collection(db, "random")).id
}

/**
 *
 * @param email
 * @returns
 */
export const fbSendSignInEmail = async (email: string, redirectUrl: string) => {
  return sendSignInLinkToEmail(auth, email, { url: redirectUrl, handleCodeInApp: true })
}

/**
 *
 * @param email
 * @param href
 * @returns
 */
export const fbSignInWithEmailLink = async (email: string, href: string) => {
  if (isSignInWithEmailLink(auth, href)) {
    const response = signInWithEmailLink(auth, email, href)
    return response
  } else {
    throw new Error("Incorrect validation url")
  }
}

/**
 *
 * @returns
 */
export const fbSignOut = async () => {
  return await signOut(auth)
}

/**
 *
 * @param callback
 */
export const fbAuthStateListener = (callback: any) => {
  onAuthStateChanged(auth, user => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      callback(user)
    } else {
      // User is signed out
      callback(null)
    }
  })
}

export const isNewUser = (user: User) => {
  return user.metadata.creationTime === user.metadata.lastSignInTime
}

export const addToDocArray = async (collection: string, docId: string, key: string, arrayValue: any) => {
  const docRef = doc(db, collection, docId)
  return updateDoc(docRef, { [key]: arrayUnion(arrayValue) })
}
export const removeFromDocArray = async (collection: string, docId: string, key: string, arrayValue: any) => {
  const docRef = doc(db, collection, docId)
  return updateDoc(docRef, { [key]: arrayRemove(arrayValue) })
}
export const incrementDocField = async (collection: string, docId: string, key: string, value: number) => {
  const docRef = doc(db, collection, docId)
  return updateDoc(docRef, { [key]: increment(value) })
}
export const updateFieldInCollection = async (collectionName: string, fieldKey: string, replacementValue: any) => {
  const collectionRef = collection(db, collectionName)
  const snapshot = await getDocs(collectionRef)

  const batch = writeBatch(db)

  snapshot.forEach(document => {
    batch.update(document.ref, { [fieldKey]: replacementValue })
  })

  return batch.commit()
}
export const updateGameNameInMatches = async (gameId: string, newName: string) => {
  const matchesQuery = query(MATCHES_COLLECTION_REF, where("gameId", "==", gameId))
  const matchesSnapshot = await getDocs(matchesQuery)

  const batch = writeBatch(db)

  matchesSnapshot.forEach(match => {
    batch.update(match.ref, { gameName: newName })
  })

  return batch.commit()
}
