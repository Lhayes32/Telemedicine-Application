import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

export interface user {
  doctor: string;
  date: string;
  appointment: string;
}

const ELEMENT_DATA: user[] = [
  {doctor: 'Ronak Desai', date: '12.08.2019', appointment: 'Walk-In'},
  {doctor: 'Rohan Desai', date: '13.08.2019', appointment: 'Video'},
  {doctor: 'Leo Hayes', date: '14.08.2019', appointment: 'Walk-in'},
  {doctor: 'Tyler Odom', date: '15.08.2019', appointment: 'Video'},
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  displayedColumns: string[] = ['doctor', 'date', 'appointment'];
  dataSource = ELEMENT_DATA;

}
