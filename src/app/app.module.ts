import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';




import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { HomeComponent } from './home/home.component';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { MyfilesComponent } from './myfiles/myfiles.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    MyaccountComponent,
    MyfilesComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatCardModule,
    MatTableModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
  ],

  exports:[
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
  ],

  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
