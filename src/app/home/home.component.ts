import {Component, OnInit} from '@angular/core';
import {EndpointServices} from '../_services/endpoint_services';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  message = '';
  error = '';

  constructor(public endpointServices: EndpointServices) {
  }

  endpointsForm = new FormGroup({
    url: new FormControl(''),
    data_length: new FormControl(''),
    expected_output: new FormControl('')
  });


  onSubmit() {
    // this.message = this.createEndpointService.createEndpoint(this.endpointsForm.value);
    this.endpointServices.createEndpoint(this.endpointsForm.value).subscribe(
      (data) => {
        this.message = data.message;
        this.endpointsForm.reset();
      },
      (err) => {
        this.error = err;
        this.endpointsForm.reset();
      }
    );
  }

  clearMessage() {
    this.message = '';
    this.error = '';
  }

}
