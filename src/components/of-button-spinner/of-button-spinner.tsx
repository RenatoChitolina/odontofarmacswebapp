import { Component, Prop, State } from '@stencil/core';
import { Observable } from 'rxjs';

@Component({
  tag: 'of-button-spinner',
  styleUrl: 'of-button-spinner.scss'
})

export class ButtonSpinner {

  @Prop()
  expand: "full" | "block" = "block";
  @Prop()
  fill: "clear" | "outline" | "solid" = "clear";
  @Prop()
  onClick: any;

  @State()
  loading: boolean = false;

  internalClick(clickEvent: any) {
    this.loading = true;

    let awaiter = new Observable(observer => {
      this.onClick(observer, clickEvent);
    });

    awaiter.subscribe(
      () => { },
      () => { },
      () => this.loading = false
    )
  }

  render() {
    return (
      <ion-button fill={this.fill} expand={this.expand} disabled={this.loading} onClick={event => this.internalClick(event)}>
        <slot></slot>
        {this.loading
          ? <div style={{ "padding-left": "5px" }}>
            <ion-spinner name="lines" color="light"></ion-spinner>
          </div>
          : ""}
      </ion-button>
    );
  }
}

{/* <ion-spinner name="dots"></ion-spinner>
          <ion-spinner name="circles"></ion-spinner>
          <ion-spinner name="crescent"></ion-spinner> */}
