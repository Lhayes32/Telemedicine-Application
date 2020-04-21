import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { MatDialogModule, MatDialogRef } from '@angular/material';
import { DatePipe } from '@angular/common';


export interface userdoc {
  doctor: string;
  email: string;
  uid: string;
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
  displayemail: string;
  isDoctorDisplay:string;
  isDoctor: boolean;
  doctors:string[] = [];
  firstNameDisplay: string;
  lastNameDisplay: string;
  patients:string[] = [];
  userdoc:userdoc[] = [];
  count = 1;
  currentdate = new Date();
  /*myFilter = (d: Date): boolean => {
    const day = d.getDay();
    // THIS FUNCTION CANNOT ACCESS THE VARIABLE 'someDateToBlock'
    return day !== 0 && day !== 6;
  }*/
  surname: string;

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

    try {
      this.displayemail = this.afAuth.auth.currentUser.email;
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }

    // First we get the user's data. 
    this.fetchuserdata();

    // Secondly we update the appointment's list with available doctors.
    this.updateappointments();
  }

  findMilitaryValue(value) {
    if (value == "8 AM") {
      return "8:00"
    }
    if (value == "9 AM") {
      return "9:00"
    }
    if (value == "10 AM") {
      return "10:00"
    }
    if (value == "11 AM") {
      return "11:00"
    }
    if (value == "12 PM") {
      return "12:00"
    }
    if (value == "1 PM") {
      return "13:00"
    }
    if (value == "2 PM") {
      return "14:00"
    }
    if (value == "3 PM") {
      return "15:00"
    }
    if (value == "4 PM") {
      return "16:00"
    }
    if (value == "5 PM") {
      return "17:00"
    }
    if (value == "6 PM") {
      return "18:00"
    }
  }

  fetchuserdata() {
    var docRef = this.afs.collection('users').doc(this.displayuid);
    docRef.get().toPromise().then((doc) => {
      if (doc.exists) {
          this.firstNameDisplay = doc.data().firstName;
          this.lastNameDisplay = doc.data().lastName;
          if (doc.data().isDoctor == true) {
            this.isDoctorDisplay = "Doctor";
            this.isDoctor = true;
            this.surname = "";
          } else {
            this.isDoctorDisplay = "Patient";
            this.isDoctor = false;
            this.surname = "Dr. ";
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
        if (this.isDoctor == true) {
          // and they are not a doctor
          if (doc.data().isDoctor == false) {
            // and they are not you
            if (doc.data().uid != this.displayuid) {
              // Remove all users without names
              if (!(doc.data().firstName == null || doc.data().firstName == null || doc.data().firstName == "" || doc.data().lastName == "")) {
                // then print their name
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid}
                this.userdoc.push(test);
              }
              } 
            }
          }
        // If you are a patient
        if (this.isDoctor == false) {
          // and they are a doctor
          if (doc.data().isDoctor == true) {
            // and they are not you
            if (doc.data().uid != this.displayuid) {
              // Remove all users without names
              if (!(doc.data().firstName == null || doc.data().firstName == null || doc.data().firstName == "" || doc.data().lastName == "")) {
                // then print their name
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid}
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
    var timestamp = new Date(Date2 + " " + this.findMilitaryValue(Time))
    let id = this.afs.createId()
    for (var i = 0; i < this.userdoc.length; i++) {
      if (this.userdoc[i].doctor == Doctor)
      {
        var receiverid = this.userdoc[i].uid;
        var receiveremail = this.userdoc[i].email;
      }
    }
    this.afs.collection('appointments').doc(id).set({
      appointment_id: id,
      sender: this.firstNameDisplay + " " + this.lastNameDisplay,
      senderuid: this.displayuid,
      receiveruid: receiverid,
      senderemail: this.displayemail,
      receiveremail: receiveremail,
      isActive: true,
      Date: Date2,
      Time: Time,
      receiver: Doctor,
      timestamp: timestamp
    });
    this.dialogRef.close();
  }

  refresh() {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }


  // This method makes sure that one person can only make only one appointment with another unique person.
  // This method also updates times based on availability of recipients.
  filterdoctor(date) {
    this.afs.collection('appointments').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (doc.data().Date == date)
        {
          // If the current doc has the user's uid in it as the sender or receiver.
          if (this.displayuid == doc.data().senderuid)
          {
            this.userdoc = this.userdoc.filter(order => order.doctor !== doc.data().receiver);
          }
          if (this.displayuid == doc.data().receiveruid)
          {
            this.userdoc = this.userdoc.filter(order => order.doctor !== doc.data().sender);
          }
        }
      });
    })
  }

  filtertimes(doctor, date){
    this.time = [
      {value: '8 AM'}, {value: '9 AM'}, {value: '10 AM'}, {value: '11 AM'}, {value: '12 PM'}, {value: '1 PM'}, {value: '2 PM'}, {value: '3 PM'}, {value: '4 PM'}, {value: '5 PM'}, {value: '6 PM'},
    ];
    this.afs.collection('appointments').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (doc.data().Date == date)
        {
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
