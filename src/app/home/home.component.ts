import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ScheduleappointmentsComponent } from '../scheduleappointments/scheduleappointments.component';
import {MatTableDataSource} from '@angular/material';


export interface userapp {
  whom: string;
  date: string;
  time: string;
}

var ELEMENT_DATA: userapp[] = [
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
  displayedColumns: string[] = ['whom', 'date', 'time', 'status','accept', 'decline'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  firstandlastname = this.lastNameDisplay + " " + this.firstNameDisplay;
  doctors:string[] = [];
  patients:string[] = [];

  fileNameDialogRef: MatDialogRef<ScheduleappointmentsComponent>;

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
      /* var test = {whom: doc.data().firstName + " " + doc.data().lastName, date: doc.data().firstName, time: doc.data().firstName}
      ELEMENT_DATA.push(test);
      this.dataSource = new MatTableDataSource(ELEMENT_DATA);
      console.log(this.dataSource);
      */
  }).catch(function(error) {
      console.log("Error getting document:", error);
      
  });

  // Clear the table when refreshing or going back to the page.
  ELEMENT_DATA = [];
  this.dataSource = new MatTableDataSource(ELEMENT_DATA);



  // Loop to find all appointments
  this.afs.collection('appointments').get().toPromise()
  .then(querySnapshot => {
    querySnapshot.docs.forEach(doc => {
        // If you are the sender
        if (doc.data().sender == this.firstNameDisplay + " " + this.lastNameDisplay) {
            var test = {whom: doc.data().receiver, date: doc.data().date, time: doc.data().time, status: doc.data().status};
            ELEMENT_DATA.push(test);
            this.dataSource = new MatTableDataSource(ELEMENT_DATA);
            }
        // If you are the receiver
        if (doc.data().receiver == this.firstNameDisplay + " " + this.lastNameDisplay) {
            var test = {whom: doc.data().sender, date: doc.data().date, time: doc.data().time, status: doc.data().status};
            ELEMENT_DATA.push(test);
            this.dataSource = new MatTableDataSource(ELEMENT_DATA);
            } 
        });
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

  openAddFileDialog() {
    this.fileNameDialogRef = this.dialog.open(ScheduleappointmentsComponent);
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
}

//<div *ngIf="authService.userData as user"> <h1>Hello: {{(user.displayName) ? user.displayName : 'User'}}