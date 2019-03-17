import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pop-up-content',
  templateUrl: './pop-up-content.component.html',
  styleUrls: ['./pop-up-content.component.css']
})
export class PopUpContentComponent implements OnInit {

  constructor() { }
  @Input() data;

  ngOnInit() {
    console.warn(this.data);
  }

}
