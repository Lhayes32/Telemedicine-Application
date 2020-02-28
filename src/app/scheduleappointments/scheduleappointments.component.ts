import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { MatDialogModule, MatDialogRef } from '@angular/material';
import { DatePipe } from '@angular/common';


export interface userdoc {
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
  currentdate = new Date();

  time: time[] = [
    {value: '8 AM'}, {value: '9 AM'}, {value: '10 AM'}, {value: '11 AM'}, {value: '12 PM'}, {value: '1 PM'}, {value: '2 PM'}, {value: '3 PM'}, {value: '4 PM'}, {value: '5 PM'}, {value: '6 PM'},
  ];

  constructor(public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<ScheduleappointmentsComponent>) { }

  ngOnInit() {

    try {
      this.displayuid = this.afAuth.auth.currentUser.uid
      localStorage.setItem("displayuid", this.displayuid);
    } catch (error) {
      this.displayuid = localStorage.getItem("displayuid");
    }
    // First we get the user's data. 
    this.fetchuserdata();

    // Secondly we update the appointment's list with available doctors.
    this.updateappointments();
  }

  fetchuserdata() {
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
  }

  updateappointments() {
    this.afs.collection('users').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        // If you are a doctor
        if (this.isDoctorDisplay == "Doctor") {
          // and they are not a doctor
          if (doc.data().isDoctor == false) {
            // and they are not you
            if (doc.data().firstName + doc.data().lastName != this.firstNameDisplay + " " + this.lastNameDisplay) {
              // Remove all users without names
              if (doc.data().firstName != null || doc.data().firstName != null) {
                // then print their name
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName}
                this.userdoc.push(test);
              }
              } 
            }
          }
        // If you are a patient
        if (this.isDoctorDisplay == "Patient") {
          // and they are a doctor
          if (doc.data().isDoctor == true) {
            // and they are not you
            if (doc.data().firstName + doc.data().lastName != this.firstNameDisplay + " " + this.lastNameDisplay) {
              // Remove all users without names
              if (doc.data().firstName != null || doc.data().firstName != null) {
                // then print their name
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName}
                this.userdoc.push(test);
              }
            }
            }
          } 
      });
    });
  }


  // Saves the selected appointment data as a document to firebase.
  // Note: The variable "Doctor" is just the person selected for the appointment, and can either be a patient or a doctor.
  saveAppointment(Date2, Time, Doctor) {
    let id = this.afs.createId()
    this.afs.collection('appointments').doc(id).set({
      appointment_id: id,
      sender: this.firstNameDisplay + " " + this.lastNameDisplay,
      isActive: true,
      Date: Date2,
      Time: Time,
      receiver: Doctor
    });
    this.dialogRef.close();
  }

  // This method makes sure that one person can only make only one appointment with another unique person.
  // This method also updates times based on availability of recipients.
  testfunction(date, doctor) {
    this.time = [
      {value: '8 AM'}, {value: '9 AM'}, {value: '10 AM'}, {value: '11 AM'}, {value: '12 PM'}, {value: '1 PM'}, {value: '2 PM'}, {value: '3 PM'}, {value: '4 PM'}, {value: '5 PM'}, {value: '6 PM'},
    ];
    this.afs.collection('appointments').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (doc.data().Date == date)
        {
          // If the current doc has the user's first or last name in it as the sender or receiver.
          if (this.firstNameDisplay + " " + this.lastNameDisplay == doc.data().sender || doc.data().receiver)
          {
            this.userdoc = this.userdoc.filter(order => order.doctor !== doc.data().receiver);
            console.log(this.userdoc);
          }
          for (var i = 0; i < this.userdoc.length; i++)
          {
            this.userdoc.filter(order => order.doctor !== doc.data().sender);
            console.log(this.userdoc);
          }
          // If the current doc has the user's first or last name in it as the sender or receiver.
          if (doc.data().sender == this.firstNameDisplay + " " + this.lastNameDisplay || doc.data().receiver == this.firstNameDisplay + " " + this.lastNameDisplay)
          {
            this.time = this.time.filter(order => order.value !== doc.data().Time);
            console.log(doc.data().Time);
          }
          // If the current doc has the currently selected doctor in it as the sender or receiver.
          if (doc.data().sender == doctor || doc.data().receiver == doctor)
          {
            this.time = this.time.filter(order => order.value !== doc.data().Time);
            console.log(doc.data().Time);
          }
        }
      });
    })
  }

  returnuserdoc() {
    console.log(this.userdoc)
  }
}
