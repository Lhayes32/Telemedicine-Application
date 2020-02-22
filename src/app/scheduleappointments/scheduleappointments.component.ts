import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { MatDialogModule, MatDialogRef } from '@angular/material';


export interface userdoc {
  value: string;
  doctor: string;
}

export interface time {
  value: string;
}


@Component({
  selector: 'app-scheduleappointments',
  templateUrl: './scheduleappointments.component.html',
  styleUrls: ['./scheduleappointments.component.css']
})
export class ScheduleappointmentsComponent implements OnInit {
  displayuid: string;
  isDoctorDisplay:string;
  doctors:string[] = [];
  firstNameDisplay: string;
  lastNameDisplay: string;
  patients:string[] = [];
  userdoc: userdoc[] = [
  ];
  count = 1;

  time: time[] = [
    {value: '8 AM'}, {value: '9 AM'}, {value: '10 AM'}, {value: '11 AM'}, {value: '12 PM'}, {value: '1 PM'}, {value: '2 PM'}, {value: '3 PM'}, {value: '4 PM'}, {value: '5 PM'}, {value: '6 PM'},
  ];

  constructor(public afs: AngularFirestore,
    public afAuth: AngularFireAuth,) { }

  ngOnInit() {

    try {
      this.displayuid = this.afAuth.auth.currentUser.uid
      localStorage.setItem("displayuid", this.displayuid);
    } catch (error) {
      this.displayuid = localStorage.getItem("displayuid");
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
              var test = {doctor: doc.data().firstName + " " + doc.data().lastName, value: this.count.toString()}
              this.userdoc.push(test);
              this.count = this.count + 1;
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
              var test = {doctor: "Dr. " + doc.data().firstName + " " + doc.data().lastName, value: this.count.toString()}
              this.userdoc.push(test);
              this.count = this.count + 1;
            }
            }
          } 
      });
    });
  }

  testbutton(Date2, Time, Doctor) {
    let id = this.afs.createId()
    this.afs.collection('appointments').doc(id).set({
      sender: this.firstNameDisplay + " " + this.lastNameDisplay,
      status: "Pending",
      Date: Date2,
      Time: Time,
      receiver: this.userdoc[Doctor - 1].doctor,
    });
  }
}
