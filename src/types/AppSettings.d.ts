import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

// App settings

export type AppSettings = {
  maxGameAttendants: number; // max allowed attendants per game
  canSetScores: boolean; // switch to enable/disable the score registration
  canSetAnyScores: boolean; // emergency switch to allow any attendant to set scores (bypassing the attendant registration)
  isAttendantRegistrationOpen: boolean; // true when the attendant can register to games
  isRankingPublic: boolean; // make the ranking visible to all
  showGameAvailabilities: boolean; // show the game availabilities for attendant registration in the game list
}
export type RefAppSettings = Ref<VueFirestoreDocumentData<AppSettings> | undefined>

