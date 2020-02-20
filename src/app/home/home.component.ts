import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ScheduleappointmentsComponent } from '../scheduleappointments/scheduleappointments.component';

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

  displayemail: string;

  fileNameDialogRef: MatDialogRef<ScheduleappointmentsComponent>;

  constructor(
    private authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {

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

  displayedColumns: string[] = ['doctor', 'date', 'appointment'];
  dataSource = ELEMENT_DATA;

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