import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilService } from 'src/app/services/util.service';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { tap, finalize } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DataAccessService } from 'src/app/services/data-access.service';
@Component({
  selector: 'app-my-listings-add',
  templateUrl: './my-listings-add.page.html',
  styleUrls: ['./my-listings-add.page.scss'],
})
export class MyListingsAddPage implements OnInit {
  locations;
  listing_form: FormGroup;
  user; 
  photo: SafeResourceUrl = "../../assets/image/user.png";
  profilePhoto: string;
  downloadUrl: string;
  uploading: boolean = false;
  
    
    task: AngularFireUploadTask;
    percentage: Observable<number>;
    snapshot: Observable<any>;
    UploadedFileURL: Observable<string>;
  

    fileName:string;
    fileSize:number;

    isUploading:boolean;
    isUploaded:boolean;
  
  constructor(
    private authSvc:AuthenticationService,
    private util:UtilService,
    private formBuilder:FormBuilder,
    public camera: Camera,
    private sanitizer: DomSanitizer,
    public alertCtrl: AlertController,
    public actionCtrl:ActionSheetController,
    private storage: AngularFireStorage, 
    private dataSvc:DataAccessService
  ) { 
    this.isUploading = false;
    this.isUploaded = false;

    this.listing_form = this.formBuilder.group({
      
      title: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      description: new FormControl('', Validators.compose([
        Validators.required
      ])),
      price: new FormControl('', Validators.compose([
        Validators.required
      ])),
    });

    this.authSvc.getUser().subscribe(user => {
     this.user = user; 
   
    });
  }

  ngOnInit() {
  }

  async openActionsheet() {
    const action = await this.actionCtrl.create({
      buttons: [{
        text: 'Take a picture',
        role: 'destructive',
        cssClass: 'buttonCss',
        handler: () => {
          this.takeProfilePic(this.camera.PictureSourceType.CAMERA);
          console.log('Take a picture clicked');
        }
      }, {
        text: 'Choose a picture',
        handler: () => {
          this.takeProfilePic(this.camera.PictureSourceType.PHOTOLIBRARY);
          console.log('Share clicked');
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'buttonCss_Cancel',

        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await action.present();
  }

  async takeProfilePic(sourceType) {
    const options: CameraOptions = {
      quality: 25,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: sourceType,
      correctOrientation: true
    }



    this.camera.getPicture(options).then((imageData) => {
      let base64Image = imageData;
      this.profilePhoto = base64Image;
      this.uploadFile(base64Image);
    }, (err) => {
      console.log(err)
    });


  }
 

  uploadFile(base64Image) {
    const file = this.getBlob(base64Image,"image/jpeg" );
    console.log('FILE', file)

    this.isUploading = true;
    this.isUploaded = false;


    this.fileName = 'ListItem';
   
    
    const path = `images/listings/${new Date().getTime()}_${this.fileName}.jpg`;

    const fileRef = this.storage.ref(path);
    this.task = this.storage.upload(path, file);
    console.log('After Upload')
    this.percentage = this.task.percentageChanges();

   this.task.snapshotChanges().pipe(
      
      finalize(() => {
        console.log('upload')
        this.UploadedFileURL = fileRef.getDownloadURL();
        
        this.UploadedFileURL.subscribe(resp=>{
          console.log(resp);
          this.downloadUrl = resp; 
          this.isUploading = false;
          this.isUploaded = true;
            this.uploading = false;
            this.util.toast('Picture has been successfully uploaded.', 'success', 'bottom');
              
      
        },error=>{
          console.error(error);
        })
      }),
      tap(snap => {
          this.fileSize = snap.totalBytes;
          console.log(snap)
      })
    ).subscribe();
  }

  private getBlob(b64Data:string, contentType:string, sliceSize:number= 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }
    return   new Blob(byteArrays, {type: contentType});
  }


  onClickSave(){
    console.log(this.downloadUrl)
    if(this.downloadUrl){
      let listing ={
        title:this.listing_form.value.title,
        description:this.listing_form.value.description,
        price :this.listing_form.value.price, 
        photoUrl: this.downloadUrl
      }
      console.log(this.user.uid, listing)
      this.dataSvc.addListing(this.user.uid, listing).then(()=>{
        this.util.toast('Listing has been successfully added!', 'success', 'bottom');
      })
      .catch(err => {
        this.util.errorToast('Error in adding listing. Please try again!');
      })
    
    }
    else{
      this.util.errorToast('Please upload image before saving!');

    }
  }


}
