import { Component, OnInit } from '@angular/core';
import { NgxAgoraService, Stream, AgoraClient, ClientEvent, StreamEvent } from 'ngx-agora';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../auth.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';

export interface userdoc {
  doctor: string;
  email: string;
  uid: string;
}

interface userGroup {
  _category: string;
  _allUsers: any;
}

@Component({
  selector: 'app-videocall',
  templateUrl: './videocall.component.html',
  styleUrls: ['./videocall.component.css']
})
export class VideocallComponent implements OnInit {

  displayuid: string;
  displayemail: string;
  firstNameDisplay: string;
  lastNameDisplay: string;
  isDoctorDisplay: string;
  surname: string;
  isDoctor: boolean;
  doctordoc: userdoc[] = [];
  patientdoc: userdoc[] = [];
  appointmentdoc: userdoc[] = [];
  checkbool: boolean;
  flag: boolean;
  selectedappointment: string;
  expenses: any;
  books: any;
  value: any;
  selecteduid: string;
  checkAstring: string;
  checkAnumD: number = 0;
  checkAnumP: number = 0;

  localCallId = 'agora_local';
  remoteCalls: string[] = [];

  private client: AgoraClient;
  private localStream: Stream;

  private uid: any;
  private gen_uid: any;

  audioEnabled: boolean = true;
  videoEnabled: boolean = true;

  userControl = new FormControl();
  userGroups: userGroup[] = [
    {
      _category: 'Appointments With',
      _allUsers: this.appointmentdoc,
    },
    {
      _category: 'Doctor',
      _allUsers: this.doctordoc,
    },
    {
      _category: 'Patient',
      _allUsers: this.patientdoc,
    },
  ];

  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
    private ngxAgoraService: NgxAgoraService,
  ) {

  }

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

    this.checkAppointmentString();

    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'h264' });
    this.assignClientHandlers();

    // Added in this step to initialize the local A/V stream
    // this.localStream = this.ngxAgoraService.createStream({ streamID: this.uid, audio: true, video: true, screen: false });
    // this.assignLocalStreamHandlers();
    // this.initLocalStream(() => this.join(uid => this.publish(), error => console.error(error)));
  }

  createVideoStream(vUid) {
    if (this.displayuid < vUid) {
      this.gen_uid = this.displayuid + vUid;
    } else {
      this.gen_uid = vUid + this.displayuid;
    }
    var finalUID = this.gen_uid;

    this.localStream = this.ngxAgoraService.createStream({ streamID: this.gen_uid, audio: true, video: true, screen: false });
    this.assignLocalStreamHandlers();
    this.initLocalStream(() => this.join(finalUID => this.publish(), error => console.error(error)));
  }

  /**
 * Attempts to connect to an online chat room where users can host and receive A/V streams.
 */
  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    this.client.join(null, this.gen_uid, this.uid, onSuccess, onFailure);
  }

  /**
   * Attempts to upload the created local A/V stream to a joined chat room.
   */
  publish(): void {
    this.client.publish(this.localStream, err => console.log('Publish local stream error: ' + err));
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, evt => {
      console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, error => {
      console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => console.log('Renewed the channel key successfully.'),
          renewError => console.error('Renew channel key failed: ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, err => {
        console.log('Subscribe stream failed', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        console.log(`${evt.uid} left from this channel`);
      }
    });
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }

  // Added in this step
  private assignLocalStreamHandlers(): void {
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log('accessAllowed');
    });

    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log('accessDenied');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      err => console.error('getUserMedia failed', err)
    );
  }

  leave() {
    this.client.leave(() => {
      this.localStream.stop();
      document.getElementById('agora_local').innerHTML = "";
      console.log("Leavel channel successfully");
    }, (err) => {
      console.log("Leave channel failed");
    });
  }

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    if (this.audioEnabled) this.localStream.enableAudio();
    else this.localStream.disableAudio();
  }

  toggleVideo() {
    this.videoEnabled = !this.videoEnabled;
    if (this.videoEnabled) this.localStream.enableVideo();
    else this.localStream.disableVideo();
  }

  checkAppointmentString() {
    setTimeout(() => {
      if (this.checkAnumD == 0 && this.checkAnumP == 0) {
        this.checkAstring = "Schedule Appointment to Video Chat";
      }
      else if (this.checkAnumD > 0 || this.checkAnumP > 0) {
        this.checkAstring = "";
      }
    }, 500);
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
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  }

  // This method updates the selection list on the chat page with doctors and patients.
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
                var test = { doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid }
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
                var test = { doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid }
                this.patientdoc.push(test);
              }
            }
          }
        }
        );
      });
  }

  // This method updates the selection list on the chat page with people who you have appointments.
  updateappointments() {
    this.afs.collection('appointments').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          this.checkbool = true;
          // If the current doc has the user's uid in it as the sender or receiver.
          if (this.displayuid == doc.data().senderuid) {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().receiveruid) {
                this.checkbool = false;
              }
            }
            if (this.checkbool == true) {
              var test = { doctor: doc.data().receiver, email: doc.data().receiveremail, uid: doc.data().receiveruid }
              this.appointmentdoc.push(test);
            }
          }
          if (this.displayuid == doc.data().receiveruid) {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().senderuid) {
                this.checkbool = false;
              }
            }
            if (this.checkbool == true) {
              var test = { doctor: doc.data().sender, email: doc.data().senderemail, uid: doc.data().senderuid }
              this.appointmentdoc.push(test);
            }
          }
        });
      })
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

  refresh() {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

}
