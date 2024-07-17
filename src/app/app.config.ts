import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth'
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../environments/environment.development';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideMessaging(() => getMessaging()),
    { 
      provide: FIREBASE_OPTIONS,
      useValue: environment.firebaseConfig
    }
  ]
};
