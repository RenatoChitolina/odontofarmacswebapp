import { Component } from '@stencil/core';
import AuthenticationHandler from '../../services/authenticationHandler';

@Component({
  tag: 'of-footer',
  styleUrl: 'of-footer.scss'
})

export class Footer {

  render() {
    return (
      <div style={{ "height": "100%" }}>
        {AuthenticationHandler.getInstance().userName
          ? <div style={{ "color": "white", "float": "left", "height": "100%", "display": "table" }}>
            <ion-icon size="small" style={{ "display": "table-cell", "vertical-align": "middle", "padding-left": "10px" }} name="contact"></ion-icon>
            <span style={{ "display": "table-cell", "vertical-align": "middle", "padding-left": "4px" }}>{AuthenticationHandler.getInstance().userName}</span>
          </div>
          : ""}
        <div style={{ "color": "white", "float": "right", "height": "100%", "display": "table" }}>
          <span style={{ "display": "table-cell", "vertical-align": "middle", "padding-right": "10px" }}>Odonto Farmacs © 2018</span>
        </div>
      </div>
    );
  }
}
