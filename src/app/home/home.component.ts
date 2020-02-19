import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

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
  ) {
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

  openDialog(action,obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '250px',
      data:obj
    });
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