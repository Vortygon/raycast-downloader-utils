import { showHUD, Clipboard, LaunchProps, showToast, Toast } from "@raycast/api"
import { showFailureToast } from "@raycast/utils"
import { tmpdir } from "os"
import { createWriteStream } from "fs"
import { basename, join } from "path"
import { Readable, Transform } from "stream"
import { finished } from "stream/promises"
import { formatByteSize, formatString } from "./utils/formatting"

export default async function downloadFromURLAndCopy(props: LaunchProps) {
   
   const { url } = props.arguments

   const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Downloading file...",
      message: "0%"
   })

   await fetch(url)
      .then(response => {
         if (!response.ok) 
            throw new Error(`Response error. Status: ${response.status}`)
         return response
      })
      .then(async (response) => {
         const fileDir = join(tmpdir(), basename(url))
         const fileStream = createWriteStream(fileDir)
         
         const totalBytes = parseInt(response.headers.get('content-length') ?? "0")
         let downloadedBytes = 0
         let lastUpdate = Date.now()

         const progressStream = new Transform({
            transform(chunk, encoding, callback) {
               downloadedBytes += chunk.length;
      
               const now = Date.now()
               if (now - lastUpdate > 500) {
                  if (totalBytes > 0) {
                     const percentage = Math.round((downloadedBytes / totalBytes) * 100)
                     toast.message = formatString(
                        "{0}% ({1} / {2})", 
                        percentage,
                        formatByteSize(downloadedBytes),
                        formatByteSize(totalBytes)
                     )
                  } else {
                     toast.message = `${formatByteSize(downloadedBytes)}`
                  }
                  lastUpdate = now
               }
      
               callback(null, chunk)
            }
         })
         await finished(Readable.fromWeb(response.body!).pipe(progressStream).pipe(fileStream))
      
         toast.style = Toast.Style.Success
         toast.title = "Downloaded."
         toast.message = formatByteSize(downloadedBytes)
         
         return fileDir
      })
      .then(dir => {
         Clipboard.copy(dir)
         showHUD(`Copied the path!`)
      })
      .catch(e => showFailureToast(`Error: ${e}`))
}
