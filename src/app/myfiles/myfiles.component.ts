import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import {MatTableDataSource} from '@angular/material';
import { MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';

export interface FileList {
  name: string;
  download: string;
  user: string;
  fileid: string;
  action: string;
}



export interface PickToSend {
  _uid: string;
  _name: string;
  _lastName: string;
  _email: string;
}

var FILE_DATA: FileList[] = [
  
];



@Component({
  selector: 'app-myfiles',
  templateUrl: './myfiles.component.html',
  styleUrls: ['./myfiles.component.css']
})


export class MyfilesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'action','download','delete'];
  PickToSend:PickToSend[] = [];
  dataSource = new MatTableDataSource(FILE_DATA);
  displayemail: string;
  selectedFile: File;
  isDoctorDisplay:string;
  firstNameDisplay: string;
  lastNameDisplay: string;
  displayuid: string;
  filename: string;
  FileID: string;
  _file: string;
  _download: string;
  _user: string;
  _fileid: string;
  _action: string;
  test: any;
  surname: string;
  isDoctor: boolean;

	filenameSend: string;
  
  selectedValue: string;

  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
  ) { }

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
      this.displayemail = this.afAuth.auth.currentUser.email;
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }

    // Fetch user's data
    this.fetchuserdata();

    // Show all current files for the user.
    this.listFiles();

    // Fetch all Doctors
    this.fetchUsers();

    var docRef = this.afs.collection('users').doc(this.displayuid);
      docRef.get().toPromise().then((doc) => {
        if (doc.exists) {
            if (doc.data().isDoctor) {
              document.getElementById("docsf").style.display = "block";
            }
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });


  }

  fetchuserdata() {
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

  onFileChanged(event) {
    this.selectedFile = event.target.files[0]
  }


  fetchUsers() {
    this.afs.collection('users').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if(this.isDoctorDisplay == "Doctor"){
          if(doc.exists){
            var test = {_uid: doc.data().uid, _name: doc.data().firstName, _lastName: doc.data().lastName, _email: doc.data().email}
            this.PickToSend.push(test);
          }
        }
      });
    });
  }

  onUpload() {
    this.filename = this.selectedFile.name;
    var storageRef = firebase.storage().ref(this.afAuth.auth.currentUser.uid + '/' + this.filename);
    var uploadTask = storageRef.put(this.selectedFile);
    uploadTask.then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        let id = this.afs.createId()
        this.afs.collection('files').doc(id).set({
          Name: this.filename,
          Download: url,
          User: this.displayuid,
          Action: this.displayemail,
          FileID: id,
        });
        
      });
  });
  }

  onSend() {
    this.filenameSend = this.selectedFile.name;
    var storageRef = firebase.storage().ref(this.selectedValue + '/' + this.filenameSend);
    var uploadTask = storageRef.put(this.selectedFile);
    uploadTask.then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        let id = this.afs.createId()
        this.afs.collection('files').doc(id).set({
          Name: this.filenameSend,
          Download: url,
          User: this.selectedValue,
          Action: this.displayemail,
          FileID: id,
        });
        
      });
  });
  }

  onDelete(name, user, download, fileid) {

        for (var i = 0; i < FILE_DATA.length; i++) {
          if(FILE_DATA[i].name == name && FILE_DATA[i].download == download && FILE_DATA[i].user == user && FILE_DATA[i].fileid == fileid){
            this.afs.collection('files').doc(FILE_DATA[i].fileid).delete().then(function() {
              console.log("File found and delete in database");
            }).catch(function(error) {
              console.error("Error removing document: ", error);
            });
            firebase.storage().ref(FILE_DATA[i].user + '/' + FILE_DATA[i].name).delete().then(function() {
              console.log("File found and deleted in Storage");
            }).catch(function(error) {
              console.error("Error removing document: ", error);
            });
          }
        }
  }

  listFiles()
  {
    FILE_DATA = [];
    this.dataSource = new MatTableDataSource(FILE_DATA);    
    this.afs.collection('files').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        this.afs.collection('files').doc(doc.data().FileID).get().toPromise().then((doc) => {
          if(this.isDoctorDisplay == "Doctor"){
            if(doc.exists) {
              this._file = doc.data().Name;
              this._action = doc.data().Action;
              this._download = doc.data().Download;
              this._fileid = doc.data().FileID;
              this._user = doc.data().User;
              this.test = {name: this._file, action: this._action, download: this._download, user:this._user, fileid:this._fileid}
              FILE_DATA.push(this.test);
              this.dataSource = new MatTableDataSource(FILE_DATA);
            }
          }
          else if(doc.exists && doc.data().User == this.displayuid){
            this._file = doc.data().Name;
            this._action = doc.data().Action;
            this._download = doc.data().Download;
            this._fileid = doc.data().FileID;
            this._user = doc.data().User;
            this.test = {name: this._file, action: this._action, download: this._download, user:this._user, fileid:this._fileid}
            FILE_DATA.push(this.test);
            this.dataSource = new MatTableDataSource(FILE_DATA);
          }
          
        }
      );
    });
  });
}



refresh() { 
  setTimeout(() => {
    this.listFiles();
  }, 2000); 
}

downloadFiles() {
  // Create a reference to the file we want to download
var storageRef = firebase.storage().ref(this.afAuth.auth.currentUser.uid + '/' + "3d-Wallpapers.jpg");
//var starsRef = storageRef.child('images/stars.jpg');

// Get the download URL
storageRef.getDownloadURL().then(function(url) {
  // Insert url into an <img> tag to "download"
  console.log(url);
  window.open(url,'_blank');

}).catch(function(error) {

  // A full list of error codes is available at
  // https://firebase.google.com/docs/storage/web/handle-errors
  switch (error.code) {
    case 'storage/object-not-found':
      // File doesn't exist
      break;
    case 'storage/unauthorized':
      // User doesn't have permission to access the object
      break;
    case 'storage/canceled':
      // User canceled the upload
      break;
    case 'storage/unknown':
      // Unknown error occurred, inspect the server response
      break;
  }
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

}
