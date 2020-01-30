import { Component, OnInit } from '@angular/core';
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
  constructor() { }

  ngOnInit() {
  }

}
