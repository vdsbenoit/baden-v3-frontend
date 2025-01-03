import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

// App settings

export type AppSettings = {
  canSetAnyScores: boolean; // emergency switch to allow any attendant to set scores (bypassing the attendant registration)
  canSetScores: boolean; // switch to enable/disable the score registration
  isAttendantRegistrationOpen: boolean; // true when the attendant can register to games
  isGameAvailabilitiesDisplayed: boolean; // show the game availabilities for attendant registration in the game list
  isRankingPublic: boolean; // make the ranking visible to all
  maxGameAttendants: number; // max allowed attendants per game
}
export type RefAppSettings = Ref<VueFirestoreDocumentData<AppSettings> | undefined>

