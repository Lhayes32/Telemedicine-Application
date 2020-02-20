import { Component, OnInit } from '@angular/core';


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

  userdoc: userdoc[] = [
    {doctor: 'Ronak', value: 'Ronak-1' },
    {doctor: 'Rohan', value: 'Rohan-2' },
    {doctor: 'Tyler', value: 'Tyler-3'}
  ];

  time: time[] = [
    {value: '8 AM'}, {value: '9 AM'}, {value: '10 AM'}, {value: '11 AM'}, {value: '12 PM'}, {value: '1 PM'}, {value: '2 PM'}, {value: '3 PM'}, {value: '4 PM'}, {value: '5 PM'}, {value: '6 PM'},
  ];

  constructor() { }

  ngOnInit() {
  }

}
