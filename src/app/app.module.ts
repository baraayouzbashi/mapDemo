import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { PopUpContentComponent } from './pop-up-content/pop-up-content.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    PopUpContentComponent
  ],
  imports: [
    FormsModule,      
    BrowserModule,
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot()
  ],
  entryComponents: [PopUpContentComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
