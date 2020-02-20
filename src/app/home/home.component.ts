import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { templateJitUrl } from '@angular/compiler';
import { async } from '@angular/core/testing';

export interface userapp {
  doctor: string;
  date: string;
  appointment: string;
}

const ELEMENT_DATA: userapp[] = [
  { doctor: 'Ronak Desai', date: '12.08.2019', appointment: 'Walk-In' },
  { doctor: 'Rohan Desai', date: '13.08.2019', appointment: 'Video' },
  { doctor: 'Leo Hayes', date: '14.08.2019', appointment: 'Walk-In' },
  { doctor: 'Tyler Odom', date: '15.08.2019', appointment: 'Video' },
  { doctor: 'Juan Huaca', date: '16.08.2019', appointment: 'Walk-In' },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  displayuid: string;
  firstNameDisplay: string;
  lastNameDisplay: string;
  displayemail: string;
  isDoctorDisplay:string;
  displayedColumns: string[] = ['doctor', 'date', 'appointment'];
  dataSource = ELEMENT_DATA;

  constructor(
    private authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
    private dialog: MatDialog,
  ) {
  }

  openDialog() {
    // Open our Dialog Component
  }

  ngOnInit() {

    try {
      this.displayuid = this.afAuth.auth.currentUser.uid
      localStorage.setItem("displayuid", this.displayuid);
      console.log(this.displayuid);
    } catch (error) {
      this.displayuid = localStorage.getItem("displayuid");
      console.log(this.displayuid);
    }

    var docRef = this.afs.collection('users').doc(this.displayuid);
    var colRef = this.afs.collection('users')

    docRef.get().toPromise().then((doc) => {
      if (doc.exists) {
          this.firstNameDisplay = doc.data().firstName;
          this.lastNameDisplay = doc.data().lastName;
          if (doc.data().isDoctor) {
            this.isDoctorDisplay = "Doctor";
          } else {
            this.isDoctorDisplay = "Patient";
          }
      } else {
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });

    try {
      this.displayemail = this.afAuth.auth.currentUser.email;
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }

  }

  isMenuOpen = true;
  contentMargin = 240;

  onToolbarMenuToggle() {
    console.log('On toolbar toggled', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;

    if (!this.isMenuOpen) {
      this.contentMargin = 70;
    } else {
      this.contentMargin = 240;
    }
  }

  // This is the function to display the first names of users.
  retrievedata() {
    this.afs.collection('users').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        // If you are a doctor
        if (this.isDoctorDisplay == "Doctor") {
          // and they are not a doctor
          if (doc.data().isDoctor == false) {
            // and they are not you
            if (doc.data().firstName != this.firstNameDisplay) {
              // then print their name
              console.log(doc.data().firstName + " " + doc.data().lastName);
              } 
            }
          }
        // If you are a patient
        if (this.isDoctorDisplay == "Patient") {
          // and they are a doctor
          if (doc.data().isDoctor == true) {
            // and they are not you
            if (doc.data().firstName != this.firstNameDisplay) {
              // then print their name
              console.log("Dr. " + doc.data().firstName + " " + doc.data().lastName);
            }
            }
          } 
          // If you are not a doctor
      });
    });
  }
}

//<div *ngIf="authService.userData as user"> <h1>Hello: {{(user.displayName) ? user.displayName : 'User'}}