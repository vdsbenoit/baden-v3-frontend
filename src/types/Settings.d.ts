import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

// App settings

export type AppSettings = {
  maxGameLeaders: number; // max allowed leaders per game
  canSetScores: boolean;
  canSetAnyScores: boolean;
  isLeaderRegistrationOpen: boolean; // true when the leader can register to games
  isRankingPublic: boolean;
  showGameAvailabilities: boolean;
}
export type RefAppSettings = Ref<VueFirestoreDocumentData<AppSettings> | undefined>

