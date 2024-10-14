import { Magnetar, PluginFirestore, PluginVue3, logger } from "magnetar";
import { db, generateRandomId } from './firebase';

// THIS LEGACY FILE IS DEPRECATED
// It is kept for reference only and will soon be deleted. 
// Use composables instead.

const remote = PluginFirestore.CreatePlugin({ db })
const local = PluginVue3.CreatePlugin({ generateRandomId })
const onValue = (process.env.NODE_ENV === "production") ? {} : { success: logger }

export const magnetar = Magnetar({
  stores: { local, remote },
  localStoreName: "local",
  executionOrder: {
    read: ["local", "remote"],
    write: ["local", "remote"],
    delete: ["local", "remote"],
  },
  on: onValue,
});

export const stopMagnetar = async () => {
  return magnetar.closeAllStreams();
}
