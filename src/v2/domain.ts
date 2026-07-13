import type { Timestamp } from "firebase/firestore";
export type Role="owner"|"admin"|"member";
export interface CategoryDef{id:string;emoji:string;label:string;accent:string}
export interface ReactionDef{type:string;emoji:string;label:string}
export interface Space{id:string;name:string;emoji:string;type:string;ownerId:string;adminIds:string[];memberIds:string[];memberNames:Record<string,string>;categories:CategoryDef[];reactionDefs:ReactionDef[];deletedAt?:Timestamp|null;purgeAfter?:Timestamp|null;createdAt?:Timestamp;updatedAt?:Timestamp}
export interface Idea{id:string;spaceId:string;title:string;category:string;categoryEmoji:string;accent:string;description:string;location:string;placeId?:string;latitude?:number|null;longitude?:number|null;mapsUrl?:string;tags:string[];price:string;duration:string;photoUrl:string;createdBy:string;createdByName:string;completed:boolean;completionRequestedBy?:string[];completedAt?:Timestamp|null;createdAt?:Timestamp;updatedAt?:Timestamp}
export interface PlanStep{id:string;title:string;time:string}
export interface ChecklistItem{id:string;text:string;done:boolean;assigneeId:string;role:string}
export interface PlanRole{id:string;name:string;memberId:string}
export interface PlanVote{id:string;question:string;options:string[];votes:Record<string,string>}
export interface Plan{id:string;ideaId:string;spaceId:string;dateTime:string;budget:string;notes:string;links:string[];itinerary:PlanStep[];checklist:ChecklistItem[];roles:PlanRole[];votes:PlanVote[];updatedAt?:Timestamp}
export interface Reflection{id:string;userId:string;userName:string;rating:number;favoriteMoment:string;notes:string;wouldDoAgain:boolean;createdAt?:Timestamp;updatedAt?:Timestamp}
export interface Memory{id:string;ideaId:string;spaceId:string;actualCost:string;photoUrls:string[];completedBy:string;completedAt?:Timestamp;updatedAt?:Timestamp}
export interface Comment{id:string;authorId:string;authorName:string;text:string;createdAt?:Timestamp}
export interface Reaction{userId:string;userName:string;type:string;updatedAt?:Timestamp}
export interface ActivityItem{id:string;spaceId:string;actorId:string;actorName:string;action:string;targetId:string;targetTitle:string;createdAt?:Timestamp}

