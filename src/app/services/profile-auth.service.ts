import { Injectable } from "@angular/core";
import { Profile } from "../models/profile.interface";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProfileAuthService {
    private activeProfile = new BehaviorSubject<Profile | null>(null);

    getActiveProfile(){
        return this.activeProfile;
    }

    setActiveProfile(profile: Profile){
        this.activeProfile.next(profile)
    }
}