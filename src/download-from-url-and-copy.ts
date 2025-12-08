import { showHUD, Clipboard, LaunchProps, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { tmpdir } from "os";
import { createWriteStream } from "fs";
import { basename, join } from "path";
import { Readable, Transform } from "stream";
import { finished } from "stream/promises";
import formatByteSize from "./utils/formatByteSize";

export default async function main(props: LaunchProps) {
   try {
      const { url } = props.arguments

      const toast = await showToast({
         style: Toast.Style.Animated,
         title: "Downloading file...",
         message: "0%"
      })

      const response = await fetch(url)
      if (!response.ok) {
         throw new Error(`Response error. Status: ${response.status}`)
      }

      const { body } = response
      const totalBytes = parseInt(response.headers.get('content-length') ?? "0", 10)

      const fileDir = join(tmpdir(), basename(url))
      const fileStream = createWriteStream(fileDir)

      let downloadedBytes = 0
      let lastUpdate = Date.now()

      const progressStream = new Transform({
         transform(chunk, encoding, callback) {
            downloadedBytes += chunk.length;

            const now = Date.now()
            if (now - lastUpdate > 200) {
               const downloadedFormated = formatByteSize(downloadedBytes)
               if (totalBytes > 0) {
                  const percent = Math.round((downloadedBytes / totalBytes) * 100)
                  const totalFormated = formatByteSize(totalBytes)
                  toast.message = `${percent}% (${downloadedFormated} / ${totalFormated})`
               } else {
                  toast.message = `${downloadedFormated}`
               }
               lastUpdate = now
            }

            callback(null, chunk)
         }
      });

      await finished(Readable.fromWeb(body!).pipe(progressStream).pipe(fileStream))

      toast.style = Toast.Style.Success;
      toast.title = "Downloaded."
      toast.message = formatByteSize(downloadedBytes)

      Clipboard.copy(fileDir)
      showHUD(`Copied the path!`)
   } catch (error) {
      showFailureToast(`Error: ${error}`)
   }
}
