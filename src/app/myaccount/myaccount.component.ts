import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.css']
})
export class MyaccountComponent implements OnInit {
  displayemail: string;
  displayuid: string;
  firstNameDisplay: string;
  lastNameDisplay: string;
  dobDisplay: string;
  addressDisplay:string;
  insuranceCompanyDisplay: string;
  insuranceIdDisplay: string;

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
          this.dobDisplay = doc.data().dateofbirth;
          this.addressDisplay = doc.data().address;
          this.insuranceCompanyDisplay = doc.data().insurancecompany;
          this.insuranceIdDisplay = doc.data().insuranceid;
      } else {
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });

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
      .then(function () {
        console.log("Data Written")
      });

  }
  
}


