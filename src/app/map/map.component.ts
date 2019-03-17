import { Component, OnInit, Input, HostListener, ComponentFactoryResolver, Injector } from '@angular/core';
import { PopUpContentComponent} from '../pop-up-content/pop-up-content.component';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw-drag';
import * as $ from 'jquery' ;

// node_mdules/leaflet-draw-drag/src/EditToolbar.Edit.js -> L.EditToolbar.Edit.MOVE_MARKERS = true;
// node_mdules/leaflet-draw-drag/index.js -> 
//if (global === undefined) {
// var global = window;
// }

 
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  constructor(private resolver: ComponentFactoryResolver, private injector: Injector) {  }

  
  map;
  drawnItems;
  // polygonDrawer;
  circleMarkerDrawer;
  rightClickContext="1";
  imageOverlay;
  
  localkey="k";

  ngOnInit() {
    (L as any).drawLocal.edit.toolbar.buttons.remove = "Clear Positions";
    (L as any).drawLocal.edit.toolbar.buttons.edit = "Edit All Positions";
    (L as any).drawLocal.edit.toolbar.buttons.editDisabled = "No Positions to edit";
    (L as any).drawLocal.edit.toolbar.buttons.removeDisabled = "No Positions to delete";
    (L as any).drawLocal.edit.handlers.remove.tooltip.text = "Click on a Position to remove";
    (L as any).drawLocal.edit.handlers.edit.tooltip.text = "Drag handles or markers to edit Positions.";


    this.map= L.map('map', {
      zoom: 0,
      maxZoom: 4,
      minZoom: -4,
      center: L.latLng(0, 0),
      crs: L.CRS.Simple,
      attributionControl: false
    });

    var imgUrl = 'assets/SR_20JN_GR.jpg';
    var img = new Image();
    img.src = imgUrl;
    img.onload= ()=>{

      this.imageOverlay = L.imageOverlay(
        imgUrl,
        [[-img.width / 2, -img.height / 2], [img.width / 2, img.height / 2]]) // [-w/2,-h/2] , [w/2,h/2]
      this.imageOverlay.addTo(this.map);
    }
    

    // this.map.outerScope = this;

    // FeatureGroup is to store editable layers
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);
    L.Icon.Default.imagePath ="assets/"


    var drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
      },
      draw: {  
        circlemarker: false,
        marker: false,
        polyline:false,
        circle:false,
        rectangle:false,
        polygon:false
      }
    });
    
    
    
    
    
    
    
    // L.drawLocal.draw
    this.map.addControl(drawControl);
    // this.polygonDrawer = new L.Draw.Polygon(this.map);
    this.circleMarkerDrawer = new L.Draw.CircleMarker(this.map);
   
    // restore from DBs
    var savedDrawing = localStorage.getItem(this.localkey);
    if (savedDrawing!=null){
      var l=JSON.parse(savedDrawing);
      L.geoJSON(l).eachLayer(layer=>{
        
        var t = L.circleMarker(layer['_latlng'])
        t.on('contextmenu', e => this.rightClickHandler(e));
        t.addTo(this.drawnItems);

      })

    }
    this.map.on('draw:created', e1=> {
      e1.layer.on('contextmenu', e2 =>this.rightClickHandler(e2));
      this.drawnItems.addLayer(e1.layer);
      this.openAfterCreate(e1.layer._latlng);
      // console.warn(e1);
      // console.warn(e1.target.options);
      // Save to DB
      localStorage.setItem(this.localkey, JSON.stringify(this.drawnItems.toGeoJSON()));
    });
    // Save to DB
    this.map.on('draw:edited draw:deleted',(e) => {
      
      localStorage.setItem(this.localkey,JSON.stringify(this.drawnItems.toGeoJSON())); 
    })

  }
  rightClickHandler(e){
    if (this.rightClickContext=="1"){
      this.rightClickHandler2(e);
    }else{
      this.editAndMoveShapes(e);

    }
  }
  openAfterCreate(e) {
    // console.warn(e)
    // Allows for menu to select other items within.
    const factory = this.resolver.resolveComponentFactory(PopUpContentComponent);
    const component = factory.create(this.injector);
    component.instance.data = { 'Hello': 'OH HEY !' };
    component.changeDetectorRef.detectChanges();
    const popupContent = component.location.nativeElement;
    var popup = L.popup({ minWidth: 300, maxHeight: 500 })
      .setLatLng(e)
      .setContent(popupContent)
      .openOn(this.map);
  }
  rightClickHandler2(e) {
    // console.warn(e)
    // Allows for menu to select other items within.
    const factory = this.resolver.resolveComponentFactory(PopUpContentComponent);
    const component = factory.create(this.injector);
    component.instance.data = {'Hello':'OH HEY !'};
    component.changeDetectorRef.detectChanges();
    const popupContent = component.location.nativeElement;
    var popup = L.popup({minWidth:300,maxHeight:500})
      .setLatLng(e.latlng)
      .setContent(popupContent)
      .openOn(this.map);
  }
  editAndMoveShapes(e) {
    // console.warn(e.target);
    //Allows editing and moving of clicked shape 
    if (e.target.editing._enabled){
      e.target.editing.disable();
      // this.drawnItems.remove(e.target);
      // console.warn(this.drawnItems)
      // Save to DB
      
      // var s = JSON.parse(this.beforeEdit.pop());
      // L.geoJSON(s).eachLayer(layer => {
      //   layer.addTo(this.drawnItems)
      // })

      localStorage.setItem(this.localkey, JSON.stringify(this.drawnItems.toGeoJSON()));
      $('.leaflet-draw-section').show()
    }else{
      e.target.editing.enable();
      // console.warn(e);
      //  this.beforeEdit.push(JSON.stringify(e.target.toGeoJSON()))
      $('.leaflet-draw-section').hide()
    }
  }
  draw(){
    // this.polygonDrawer.enable();
    // { dashArray:'4 8' ,weight:2, color: '#ac00ca'}
    // this.circleMarkerDrawer.setOptions({radius:});
    this.circleMarkerDrawer.enable();

  }
  changeImage(e) {
    var reader = new FileReader();
    reader.onload = (ee) => {
      var path = ee.target['result'];
      this.setImageOverlay(path);
    }
    reader.readAsDataURL(e.target.files[0]);

  }
  setImageOverlay(path) {
    var img = new Image();
    img.src = path;
    img.onload = () => {
      this.imageOverlay.setUrl(path);
      this.imageOverlay.setBounds([[-img.height / 2, -img.width / 2], [img.height / 2, img.width / 2]])
      this.imageOverlay.addTo(this.map);
    }

  }
  i=0;
  quickChange(){
    if (this.i==0){
      this.setImageOverlay("https://www.star-m.jp/wp-content/blogs.dir/3/files/la39_img_02.jpg");

    }
    if (this.i==1){
      this.setImageOverlay("https://www.star-m.jp/eng/files/la38_img_02.jpg");

    }
    if(this.i==2){
      this.setImageOverlay("http://img.directindustry.com/images_di/photo-g/26544-4669119.jpg");
    }
    if(this.i==3){
      this.setImageOverlay('assets/SR_20JN_GR.jpg');
    }

    this.i = this.i+1;
    if (this.i>3){
      this.i=0;
    }
  }
}

