import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Endpoint} from '../_models/endpoint';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EndpointServices {

  constructor(private http: HttpClient) {
  }

  createEndpoint(endpoint: Endpoint) {
    return this.http.post(`${environment.endpointUrl}/create`, endpoint)
      .pipe(map((response: any) => response));
  }

  getLogs() {
    return this.http.get<any>(`${environment.endpointUrl}/getLogs`);
  }

  checkLogs() {
    return this.http.get<any>(`${environment.endpointUrl}/checkLogs`);
  }
}
