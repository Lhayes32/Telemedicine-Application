import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Timestamp } from 'rxjs';



export interface userdoc {
  doctor: string;
  email: string;
  uid: string;
}

export interface messagedoc {
  sender: any;
  receiver: any;
  message: any;
  time: any;
}

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {
  displayuid: string;
  displayemail: string;
  firstNameDisplay: string;
  lastNameDisplay: string;
  isDoctorDisplay: string;
  surname: string;
  isDoctor: boolean;
  doctordoc:userdoc[] = [];
  patientdoc:userdoc[] = [];
  appointmentdoc:userdoc[] = [];
  messagedoc:messagedoc[] = [];
  checkbool: boolean;
  flag: boolean;
  selectedappointment: string;
  date = new Date();

  usermessage: any[] = [
  ];
 

  constructor(
    private authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackbar: MatSnackBar,
  

  ) { }
  

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
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
    }
    // Fetch user's data
    this.fetchuserdata()

    // Update doctordoc
    this.updateDoctorsPatients()

    // Update appointments
    this.updateappointments()
  }

  fetchuserdata() {
    // Retrieve user data
    var docRef = this.afs.collection('users').doc(this.displayuid);
    docRef.get().toPromise().then((doc) => {
      if (doc.exists) {
          this.firstNameDisplay = doc.data().firstName;
          this.lastNameDisplay = doc.data().lastName;
          if (doc.data().isDoctor == true) {
            this.isDoctorDisplay = "Doctor";
            this.surname = "Dr. "
            this.isDoctor = true;
          } else {
            this.isDoctorDisplay = "Patient";
            this.isDoctor = false;
          }
      } else {
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
  }

  updateDoctorsPatients() {
    this.afs.collection('users').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
          // If they are a doctor
          if (doc.data().isDoctor == true) {
            // and they are not you
            if (doc.data().uid != this.displayuid) {
              // Remove all users without names
              if (!(doc.data().firstName == null || doc.data().firstName == null || doc.data().firstName == "" || doc.data().lastName == "")) {
                // then print their name
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid}
                this.doctordoc.push(test);
              }
            }
          }
          if (doc.data().isDoctor == false) {
            // and they are not you
            if (doc.data().uid != this.displayuid) {
              // Remove all users without names
              if (!(doc.data().firstName == null || doc.data().firstName == null || doc.data().firstName == "" || doc.data().lastName == "")) {
                // then print their name
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid}
                this.patientdoc.push(test);
                }
              }
            }
        }
        );
        });
    }

    updateappointments() {
      var appointmentlist = [];
      this.afs.collection('appointments').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          this.checkbool = true;
          // If the current doc has the user's uid in it as the sender or receiver.
          if (this.displayuid == doc.data().senderuid)
          {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().receiveruid)
                {
                  this.checkbool = false;
                }
              }
            if (this.checkbool == true)
              {
                var test = {doctor: doc.data().receiver, email: doc.data().receiveremail, uid: doc.data().receiveruid}
                this.appointmentdoc.push(test);
              }
              } 
          if (this.displayuid == doc.data().receiveruid)
          {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().senderuid)
                {
                  this.checkbool = false;
                }
              }
            if (this.checkbool == true)
              {
                var test = {doctor: doc.data().sender, email: doc.data().senderemail, uid: doc.data().senderuid}
                this.appointmentdoc.push(test);
              }
              } 
      });
    })
  }

  sendMessage(message) {
    var currenttime = this.datePipe.transform(new Date(), "h:mm a")
    var currentdate = this.datePipe.transform(new Date(), "M/dd/yyyy")
    var personuid = this.selectedappointment;
    var message = message; 
    for (var i = 0; i < this.appointmentdoc.length; i++) {
      if (this.appointmentdoc[i].uid == personuid)
        {
        var person = this.appointmentdoc[i].doctor;
        }
    }
    if (person == undefined) {
      for (var i = 0; i < this.doctordoc.length; i++) {
        if (this.doctordoc[i].uid == personuid)
          {
          var person = this.doctordoc[i].doctor;
          }
      }
    }
    if (person == undefined) {
      for (var i = 0; i < this.patientdoc.length; i++) {
        if (this.patientdoc[i].uid == personuid)
          {
          var person = this.patientdoc[i].doctor;
          }
      }
    }
    let autoid = this.afs.createId()
    if (this.displayuid < personuid)
    {
      var id = this.displayuid + personuid;
    } else {
      var id = personuid + this.displayuid;
    }
    console.log(id);
    console.log(person);
    var docRef = this.afs.collection('chats').doc(id);
    docRef.get().toPromise().then((doc) => {
    if (doc.exists)
      {
        docRef.collection('messages').doc(autoid).set({
          message: message,
          from: this.firstNameDisplay + " " + this.lastNameDisplay,
          timestamp: this.date
        })
      } else {
      var docRef2 = this.afs.collection('chats').doc(id).collection('messages').doc(autoid);
      docRef2.set({
        message: message,
        sender: this.firstNameDisplay + " " + this.lastNameDisplay,
        senderuid: this.displayuid,
        timestamp: this.date,
        date: currentdate,
        time: currenttime,
        receiver: person,
        receiveruid: personuid
      })
      }
    })
  };

  isMenuOpen = true;
  contentMargin = 240;

  showMessages(Doctor) {
    this.usermessage = [];
    var personuid = Doctor;
    if (this.displayuid < personuid)
    {
      var id = this.displayuid + personuid;
    } else {
      var id = personuid + this.displayuid;
    }
    this.afs.collection('chats').doc(id).collection('messages').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (doc.data().senderuid == this.displayuid)
        {
          var test = {sender: "Me", receiver: doc.data().receiver, message: doc.data().message, time: doc.data().time, date: doc.data().date, timestamp: doc.data().timestamp}
          this.usermessage.push(test);
        }
        if (doc.data().receiveruid == this.displayuid)
        {
          var test2 = {sender: doc.data().sender, receiver: "Me", message: doc.data().message, time: doc.data().time, date: doc.data().date, timestamp: doc.data().timestamp}
          this.usermessage.push(test2);
        }
      });
      this.usermessage = this.usermessage.sort((a, b) => a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0)
    });
    this.selectedappointment = Doctor;
  }

  refresh() {
    this.showMessages(this.selectedappointment);
  }
}
