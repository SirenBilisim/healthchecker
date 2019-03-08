import {Component, OnInit} from '@angular/core';
import {EndpointServices} from '../_services/endpoint_services';

@Component({
  selector: 'app-list-logs',
  templateUrl: './list-logs.component.html',
  styleUrls: ['./list-logs.component.css']
})
export class ListLogsComponent implements OnInit {

  logData;

  constructor(public endpointServices: EndpointServices
  ) {
  }

  ngOnInit(): void {
    this.endpointServices.getLogs().subscribe(
      (data) => {
        this.logData = data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  checkLogs() {
    this.endpointServices.checkLogs().subscribe(
      (result) => {
        debugger;
        if (result.status === 'ok') {
          this.endpointServices.getLogs().subscribe(
            (data) => {
              this.logData = data;
            },
            (err) => {
              console.log(err);
            }
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
