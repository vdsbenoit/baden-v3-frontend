import { DEFAULT_CIRCUIT_VALUE, DEFAULT_GAME_ID, GAMES_COLLECTION_REF } from "@/constants"
import { Game } from "@/types"
import { doc, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

export function useGame(rGameId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rGameId)
    if (id === DEFAULT_GAME_ID) return null
    console.log(`Fetching game ${id}`)
    return doc(GAMES_COLLECTION_REF, id)
  })
  return useDocument<Game>(dbRef)
}

export function useGames(rShouldLoad: MaybeRefOrGetter<boolean> = true) {
  console.log(`Fetching all games`)
  const dbRef = computed(() => toValue(rShouldLoad) ? query(GAMES_COLLECTION_REF, orderBy("id")) : null)
  return useCollection<Game>(dbRef)
}

export function useCircuitGames(rCircuit: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const circuit = toValue(rCircuit)
    if (circuit === DEFAULT_CIRCUIT_VALUE) return null
    console.log(`Fetching games from circuit ${circuit}`)
    // prettier-ignore
    return query(
      GAMES_COLLECTION_REF, 
      where("circuit", "==", circuit),
      orderBy("number")
    )
  })
  return useCollection<Game>(dbRef)
}
