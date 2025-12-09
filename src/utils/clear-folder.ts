import { readdir, rm, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const whitelist: string[] = [
   tmpdir()
]

export interface CleanUpStats {
   deletedSize: number
   deletedCount: number
}

export default async function clearFolder(path: string, recursive = false): Promise<CleanUpStats> {
   if (!whitelist.find(el => el === path))
      throw new Error(`Clearing this folder is prohibited.`)
   return await deleteFiles(path, recursive)
}

async function deleteFiles(path: string, recursive = false): Promise<CleanUpStats> {
   let totalDeletedSize: number = 0 
   let deletedCount: number = 0

   await readdir(path)
      .then(async function(files) {
         for (const file of files) {
            const filePath = join(path, file)
            const fileStats = await stat(filePath)

            if (fileStats.isDirectory()) {
               if (recursive === false) continue
               else {
                  await deleteFiles(filePath, recursive)
                     .then(stats => {
                        totalDeletedSize += stats.deletedSize
                        deletedCount += stats.deletedCount
                     })

                  if ((await readdir(filePath)).length === 0) {
                     await rm(filePath, { recursive: true, force: true })
                        .catch(() => {})
                  }

                  continue
               }
            }

            await unlink(filePath)
               .then(() => {
                  totalDeletedSize += fileStats.size
                  deletedCount++
               })
               .catch(() => {})
         }

      })
      .catch(e => { throw e })

   return {
      deletedSize: totalDeletedSize,
      deletedCount: deletedCount
   }
}