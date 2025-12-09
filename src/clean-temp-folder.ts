import os from "node:os";
import { showFailureToast } from "@raycast/utils";
import clearFolder from "./utils/clear-folder";
import { showToast, Toast } from "@raycast/api";
import { formatByteSize } from "./utils/formatting";

export default async function cleanTempFolder() {
   const tempPath = os.tmpdir();

   const toast = await showToast({
      style: Toast.Style.Animated,
      title: `Cleaning Temp folder...`,
      message: ``
   })

   await clearFolder(tempPath, true)
      .then(stats => {
         const { deletedSize, deletedCount } = stats

         toast.style = Toast.Style.Success
         toast.title = `Deleted ${deletedCount} files!`
         toast.message = `Freed up ${formatByteSize(deletedSize)} of space.`
      })
      .catch(e => showFailureToast(`Error: ${e}`))
}