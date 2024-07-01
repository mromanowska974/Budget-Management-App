import { ApplicationConfig, EnvironmentInjector, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth'

import { routes } from './app.routes';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../environments/environment.development';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    { 
      provide: FIREBASE_OPTIONS,
      useValue: environment.firebaseConfig
    }
  ]
};
