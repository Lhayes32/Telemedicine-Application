import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.css']
})
export class MyaccountComponent implements OnInit {
  displayemail: string;
  firstName: string;

  constructor(
    private authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
  ) {
  }

  ngOnInit() {
    try {
      this.displayemail = this.afAuth.auth.currentUser.email
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
  addData(firstName, lastName, dateofbirth, address, insurancecompany, insuranceid) {
    this.afs.collection('users').doc(this.afAuth.auth.currentUser.uid).set({
      uid: this.afAuth.auth.currentUser.uid,
      email: this.afAuth.auth.currentUser.email,
      displayName: this.afAuth.auth.currentUser.displayName,
      photoURL: this.afAuth.auth.currentUser.photoURL,
      emailVerified: this.afAuth.auth.currentUser.emailVerified,
      firstName: firstName,
      lastName: lastName,
      dateofbirth: dateofbirth,
      address: address,
      insurancecompany: insurancecompany,
      insuranceid: insuranceid
    })
    .then(function() {
      console.log("Data Written")
    });

  }

  // This function doesn't work
  firstname()
  {
    return this.afAuth.auth.currentUser.uid
  }
}


