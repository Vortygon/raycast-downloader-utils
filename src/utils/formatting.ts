export function formatString(template: string, ...args) {
   return template.replace(
      /{(\d+)}/g,
      (match, index) => {
         return typeof args[index] !== 'undefined' ? args[index] : match
      }
   )
}

export function formatByteSize(bytes: number): string {
   if (bytes === 0) return '0 Bytes';
   const k = 1024;
   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}