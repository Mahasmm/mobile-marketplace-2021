import { Component, OnInit } from '@angular/core';
import { DataAccessService } from 'src/app/services/data-access.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { tap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UtilService } from 'src/app/services/util.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  listings;
  searchText: string = '';

  user;
  data = {
    image: '',
    firstName: '',
    lastName: '',
    phone: ''
  }
  
  constructor(private dataSvc: DataAccessService,private authSvc: AuthenticationService,) {
    this.dataSvc.getAllListings().subscribe(data => {
      this.listings = data;
    })

    this.dataSvc.getUser(this.authSvc.getUserFromLocal().uid).subscribe(
      data => { 
        this.user = data;
        this.data.firstName = this.user.firstName;
        this.data.lastName = this.user.lastName;
        this.data.phone = this.user.phone;
        if(this.user.image) this.data.image = this.user.image;
      }
    ); 
  }

  ngOnInit() {
  }
  
  search() {
    return this.listings.filter(listing => {
      return listing.title.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1 || listing.description.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
    })
  }

}
