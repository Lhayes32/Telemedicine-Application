import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from "../user";

export interface userapp {
  doctor: string;
  date: string;
  appointment: string;
}

const ELEMENT_DATA: userapp[] = [
  {doctor: 'Ronak Desai', date: '12.08.2019', appointment: 'Walk-In'},
  {doctor: 'Rohan Desai', date: '13.08.2019', appointment: 'Video'},
  {doctor: 'Leo Hayes', date: '14.08.2019', appointment: 'Walk-in'},
  {doctor: 'Tyler Odom', date: '15.08.2019', appointment: 'Video'},
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  displayemail:string;

  constructor(
    private authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
      ) { 
      }

  ngOnInit() {

    try {
      this.displayemail = this.afAuth.auth.currentUser.email;
      localStorage.setItem("displayemail", this.displayemail);
       console.log(this.displayemail);
    } catch (error) {
      this.displayemail =  localStorage.getItem("displayemail");
       console.log(this.displayemail);
    }
 
  }

  isMenuOpen = true;
  contentMargin = 240;

  displayedColumns: string[] = ['doctor', 'date', 'appointment'];
  dataSource = ELEMENT_DATA;

  onToolbarMenuToggle() {
    console.log('On toolbar toggled', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;

    if(!this.isMenuOpen) {
      this.contentMargin = 70;
    } else {
      this.contentMargin = 240;
    }
  }

}
