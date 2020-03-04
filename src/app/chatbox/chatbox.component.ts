import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface userdoc {
  doctor: string;
  email: string;
  uid: string;
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
  checkbool: boolean;
  flag: boolean;
  date = new Date();

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
    this.updateDoctors()

    // Update patientdoc
    this.updatePatients()

    // Update appointments
    this.updateappointments()

    console.log(this.appointmentdoc);
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

  updateDoctors() {
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
        }
        );
        });
    }

  updatePatients() {
    this.afs.collection('users').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        // If they are not a doctor
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
  sendMessagePatient(Appointment, message) {
    var testdoc = this.appointmentdoc;
    console.log(testdoc[0]);
    var personuid = Appointment;
    var message = message; 
    console.log(personuid);
    console.log(message);
    for (var i = 0; i < this.appointmentdoc.length; i++) {
      if (testdoc[i].uid == personuid)
        {
        var person = testdoc[i].doctor;
        }
    }
    /*for (var i = 0; i <= this.doctordoc.length; i++) {
      if (this.doctordoc[i].uid == personuid)
      {
        var person = this.doctordoc[i].doctor;
      }
    }
    for (var i = 0; i <= this.patientdoc.length; i++) {
      if (this.patientdoc[i].uid == personuid)
      {
        var person = this.patientdoc[i].doctor;
      }
    }*/
    let autoid = this.afs.createId()
    if (this.displayuid < personuid)
    {
      var id = this.displayuid + personuid;
    } else {
      var id = personuid + this.displayuid;
    }
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
        receiver: person,
        receiveruid: personuid
      })
      }
    })
  };

  sendMessageDoctor(Doctor, Patient, Appointment, message) {
    var data = [Doctor, Patient, Appointment, message];
    var appointmentdoc = this.appointmentdoc;
    var patientdoc = this.patientdoc;
    var doctordoc = this.doctordoc;
    var filtered = data.filter(x => x! !== undefined);
    var personuid = filtered[0];
    var message = filtered[1];
    console.log(personuid);
    console.log(message);
    if (Doctor == undefined && Patient == undefined) {
      for (var i = 0; i < this.appointmentdoc.length; i++) {
        if (appointmentdoc[i].uid == personuid)
          {
          var person = appointmentdoc[i].doctor;
          }
        }
    }
    if (Doctor == undefined && Appointment == undefined) {
      for (var i = 0; i < this.patientdoc.length; i++) {
        if (patientdoc[i].uid == personuid)
          {
          var person = patientdoc[i].doctor;
          }
        }
    }
    if (Patient == undefined && Appointment == undefined) {
      for (var i = 0; i < this.doctordoc.length; i++) {
        if (doctordoc[i].uid == personuid)
          {
          var person = doctordoc[i].doctor;
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
        receiver: person,
        receiveruid: personuid
      })
      }
    })
  };

  isMenuOpen = true;
  contentMargin = 240;

}
