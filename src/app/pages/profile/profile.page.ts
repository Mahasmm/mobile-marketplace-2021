import { Router } from '@angular/router';
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
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user;
  data = {
    image: '',
    firstName: '',
    lastName: '',
    phone: ''
  }
  constructor(
    private dataSvc: DataAccessService,
    private authSvc: AuthenticationService,
    public actionSheetController: ActionSheetController,
    public camera: Camera,
    private storage: AngularFireStorage,
    private util: UtilService,
    private loadingCntrl: LoadingController,
    private formBuilder: FormBuilder,
    public router:Router
  ) { 
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

  showUpdateProfilePage() {
    this.router.navigate(['update-profile']);
  }

  signOut() {
    this.authSvc.SignOut();
  }

}
