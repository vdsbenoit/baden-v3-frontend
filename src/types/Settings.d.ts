import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

// App settings

export type AppSettings = {
  maxGameAttendants: number; // max allowed attendants per game
  canSetScores: boolean;
  canSetAnyScores: boolean;
  isAttendantRegistrationOpen: boolean; // true when the attendant can register to games
  isRankingPublic: boolean;
  showGameAvailabilities: boolean;
}
export type RefAppSettings = Ref<VueFirestoreDocumentData<AppSettings> | undefined>

