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
  userdoc:userdoc[] = [];
  count = 1;
  doctor_selected = '';

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
              var test = {doctor: doc.data().firstName + " " + doc.data().lastName, value: this.count.toString()}
              this.userdoc.push(test);
              this.count = this.count + 1;
            }
            }
          } 
      });
    });
  }

  // Button to update the time slots once a date and doctor have been picked.
  // Instructions --
  // Pass the date and doctor
  // Re-init time to its original values at the start of the function.
  // Loop through all of the documents, if it has the sender or the receivers full name and the date in it, the appointment time from the time list.

  testbutton2(date, doctor) {
    this.time = [
      {value: '8 AM'}, {value: '9 AM'}, {value: '10 AM'}, {value: '11 AM'}, {value: '12 PM'}, {value: '1 PM'}, {value: '2 PM'}, {value: '3 PM'}, {value: '4 PM'}, {value: '5 PM'}, {value: '6 PM'},
    ];
    console.log(this.time);
    this.afs.collection('appointments').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (doc.data().Date == date)
        {
          if (doc.data().sender == this.firstNameDisplay + " " + this.lastNameDisplay || doc.data().receiver == this.firstNameDisplay + " " + this.lastNameDisplay)
          {
            this.time = this.time.filter(order => order.value !== doc.data().Time);
            console.log(doc.data().Time);
          }
          if (doc.data().sender == doctor || doc.data().receiver == doctor)
          {
            this.time = this.time.filter(order => order.value !== doc.data().Time);
            console.log(doc.data().Time);
          }
        }
      });
    })
    }

  // Working save button
  testbutton(Date2, Time, Doctor) {
    let id = this.afs.createId()
    this.afs.collection('appointments').doc(id).set({
      appointment_id: id,
      sender: this.firstNameDisplay + " " + this.lastNameDisplay,
      status: "Pending",
      Date: Date2,
      Time: Time,
      receiver: Doctor
    });
  }
  returnuserdoc() {
    console.log(this.userdoc)
  }
}
