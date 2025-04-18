import { APP_CONFIG_DOC_REF, APP_SETTINGS_DOC_REF } from "@/constants"
import { AppSettings, AppConfig } from "@/types"
import { useDocument } from "vuefire"

export function useAppSettings() {
  return useDocument<AppSettings>(APP_SETTINGS_DOC_REF)
}
export function useAppConfig() {
  return useDocument<AppConfig>(APP_CONFIG_DOC_REF)
}
