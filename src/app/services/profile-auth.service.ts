import { Injectable } from "@angular/core";
import { Profile } from "../models/profile.interface";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProfileAuthService {
    private activeProfile = new Subject<Profile>;

    getActiveProfile(){
        return this.activeProfile;
    }

    setActiveProfile(profile: Profile){
        this.activeProfile.next(profile)
    }
}