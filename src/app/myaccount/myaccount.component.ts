import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatListModule } from '@angular/material/list'
import { MatInputModule, MatInput } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { NgModule } from '@angular/core'

@NgModule ({
  exports: [
    MatInputModule,
    MatListModule,
    MatMenuModule
  ]
})

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
  isDoctorDisplay:string;
  surname: string;
  isDoctor: boolean;

  constructor(
    public authService: AuthService,
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

    try {
      this.displayemail = this.afAuth.auth.currentUser.email
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }

    // fetch user's data
    this.fetchuserdata()

  }

  fetchuserdata() {
  var docRef = this.afs.collection('users').doc(this.displayuid);
  docRef.get().toPromise().then((doc) => {
    if (doc.exists) {
        this.firstNameDisplay = doc.data().firstName;
        this.lastNameDisplay = doc.data().lastName;
        this.dobDisplay = doc.data().dateofbirth;
        this.addressDisplay = doc.data().address;
        this.insuranceCompanyDisplay = doc.data().insurancecompany;
        this.insuranceIdDisplay = doc.data().insuranceid;
        if (doc.data().isDoctor == true) {
          this.isDoctorDisplay = "Doctor";
          this.surname = "Dr. "
          this.isDoctor = true;
        } else {
          this.isDoctor = false;
          this.isDoctorDisplay = "Patient";
        }
    } else {
        console.log("No such document!");
    }
    }).catch(function(error) {
      console.log("Error getting document:", error);
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
  addData(firstName, lastName, dateofbirth, address, insurancecompany, insuranceid) {
    this.afs.collection('users').doc(this.afAuth.auth.currentUser.uid).update({
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
      this.afs.collection('appointments').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          var updatedoc = doc.data().appointment_id;
          if (doc.data().senderuid == this.displayuid)
          {
            this.afs.collection('appointments').doc(updatedoc).update({
              sender: firstName + " " + lastName,
            })
            .then(function () {
              console.log("Data Written")
            });
          }
          if (doc.data().receiveruid == this.displayuid)
          {
            this.afs.collection('appointments').doc(updatedoc).update({
              receiver: firstName + " " + lastName,
            })
            .then(function () {
              console.log("Data Written")
            });
          }
        });
      })
      this.ngOnInit();
      // hi
  }
}