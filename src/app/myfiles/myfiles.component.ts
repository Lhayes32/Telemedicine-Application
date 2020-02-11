import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

export interface FileList {
  name: string;
  date: string;
}

const FILE_DATA: FileList[] = [
  {name: 'FileUpload01.jpg', date: "01-01-2020"},
  {name: 'FileUpload02.jpg', date: "01-02-2020"},
  {name: 'FileUpload03.jpg', date: "01-03-2020"},
  {name: 'FileUpload04.jpg', date: "01-04-2020"},
  {name: 'FileUpload05.jpg', date: "01-05-2020"},
];

@Component({
  selector: 'app-myfiles',
  templateUrl: './myfiles.component.html',
  styleUrls: ['./myfiles.component.css']
})
export class MyfilesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'date'];
  dataSource = FILE_DATA;
  displayemail: string;
  selectedFile: File

  constructor(
    private authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
  ) { }

  ngOnInit() {
    
    try {
      this.displayemail = this.afAuth.auth.currentUser.email;
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }

  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0]
  }

  onUpload() {
    var filename = this.selectedFile.name;
    var storageRef = firebase.storage().ref('/fileuploads/' + filename)
    var uploadTask = storageRef.put(this.selectedFile);
    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      console.log('File available at', downloadURL);
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
