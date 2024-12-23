import { fbSendSignInEmail, fbSignInWithEmailLink, isNewUser } from "@/services/firebase"
import { choicePopup, errorPopup, loadingPopup } from "@/utils/popup"
import { createUserProfile } from "./userProfile"

export async function sendSignInEmail(email: string) {
  email = email.trim()
  try {
    await fbSendSignInEmail(email)
    window.localStorage.setItem("emailForSignIn", email)
  } catch (e: any) {
    console.error(e)
    throw e
  }
}

export async function processSignInLink(href: string) {
  let email = window.localStorage.getItem("emailForSignIn")
  let displayEmailError = true
  if (!email) {
    const choiceHandler = (choice: string) => {
      switch (choice) {
        case "D'accord":
          displayEmailError = false
          break
        case "Je veux quand même essayer ici":
          email = window.prompt("Quel email as-tu utilisé pour te connecter ?") ?? ""
          email = email.trim()
          break
      }
    }
    const message = `On dirait que tu n'as pas ouvert le lien depuis le même navigateur que là où tu as essayé.e de te connecter.\n\n
    Il devrait y avoir une option dans pour ouvrir le lien dans ton navigateur internet plutôt que ton app de mail. 
    Si pas, essaie de copier/coller le lien dans ton navigateur.`
    await choicePopup("Oops", ["Je veux quand même essayer ici", "D'accord"], choiceHandler, "", message)
  }
  if (!email) {
    if (displayEmailError) throw new Error("Impossible de récupérer l'email d'authentification")
    else return
  }
  const loading = await loadingPopup()
  try {
    const response = await fbSignInWithEmailLink(email, href)
    if (response.user) {
      if (isNewUser(response.user)) createUserProfile(response.user.uid as string, response.user.email as string)
      window.localStorage.removeItem("emailForSignIn")
      loading.dismiss()
      return true
    } else {
      loading.dismiss()
      return false
    }
  } catch (e: any) {
    if (e.code === "auth/invalid-action-code")
      errorPopup(`Le lien que tu viens d'utiliser n'est plus valide. 
        Clique sur le lien du dernier email que tu as reçu ou réessaie la procédure d'inscription depuis le début.`)
    else errorPopup(e.message)
    loading.dismiss()
    return false
  }
}
