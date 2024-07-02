import { Profile } from "./profile.interface";

export interface User{
    uid: string,
    email: string;
    accountStatus: string;
    profiles: Profile[]
}