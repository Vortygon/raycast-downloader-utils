/**
 * 
 * Dictionary:
 * UIN - Unique Item Name
 * 
*/

export declare namespace UIN {
   export interface Options {
      type: UINType 
   }

   export enum UINType {
      Downloaded = "DN",
      Created = "CR"
   }
}