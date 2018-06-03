import "@ionic/core";
import { Component, Prop, State, Event, EventEmitter, Listen } from '@stencil/core';
import DatabaseHandler from '../../services/databaseHandler';
import NavigationHandler from '../../services/navigationHandler';

@Component({
  tag: 'app-encyclopedia',
  styleUrl: 'app-encyclopedia.scss'
})

export class AppEncyclopedia {

  private ionNav: HTMLIonNavElement;
  private pharmaceuticFormsSelected: Array<any> = [];

  @Prop({ connect: 'ion-popover-controller' })
  popoverCtrl: HTMLIonPopoverControllerElement;
  @Prop({ connect: 'ion-toast-controller' })
  toastCtrl: HTMLIonToastControllerElement;

  @State()
  pharmaceuticForms: Array<any> = [];
  @State()
  categories: Array<any> = [];
  @State()
  medicaments: Array<any> = [];
  @State()
  selectedCategory: any;
  @State()
  searchText: string;
  @State()
  step: number = 1;

  @Event()
  pharmaceuticFormsSelectionChanged: EventEmitter;

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');
    this.getData();
  }

  @Listen('window:swUpdate')
  async onSWUpdate() {
    let toast = await this.showFixedToast("Nova versão disponível", "Atualizar");
    await toast.present();
    await toast.onWillDismiss();
    window.location.reload();
  }

  @Listen("pharmaceuticFormsSelectionChanged")
  pharmaceuticFormsSelectionChangedHandler(pharmaceuticFormsSelectionChangedEvent: CustomEvent) {
    this.pharmaceuticForms = pharmaceuticFormsSelectionChangedEvent.detail;
    this.pharmaceuticFormsSelected = this.defineSelectedPharmaceuticForms();
    this.applyFilter();
  }

  goesTo(page: string, dataState: any = null) {
    NavigationHandler.getInstance().PushPage(this.ionNav, page, true, dataState);
  }

  comeBack() {
    NavigationHandler.getInstance().PopPage(this.ionNav, true);
  }

  getData() {
    let db = DatabaseHandler.getInstance()

    db.getPharmaceuticForms()
      .subscribe(data => {
        this.pharmaceuticForms = data.map(item => {
          return {
            name: item.name,
            index: item.index,
            selected: false
          }
        });
      });

    db.getCategories()
      .subscribe(data => {
        this.categories = [...data];
      });
  }

  selectMedicament(selectedMedicament: any) {
    this.goesTo("app-medicament", { medicament: selectedMedicament });
  }

  selectSuggestion() {
    this.goesTo("app-suggestion", { searchText: this.searchText, category: this.selectedCategory, pharmaceuticForms: this.pharmaceuticFormsSelected });
  }

  inputSearchText(searchEvent: any) {
    this.searchText = searchEvent.target.value;
    this.applyFilter();
  }

  selectCategory(selectedCategory?: any) {
    this.selectedCategory = selectedCategory;
    this.applyFilter();
  }

  applyFilter() {
    this.medicaments.splice(0);

    let categoriesToConsider = this.defineSelectedCategory();

    categoriesToConsider.forEach(category => {
      let medicamentsToConsider = category.medicaments;

      medicamentsToConsider = medicamentsToConsider.map(medicament => {
        return {
          category: {
            name: category.name,
            color: category.color,
            image: category.image
          },
          ...medicament
        }
      })

      this.medicaments = this.medicaments.concat(...medicamentsToConsider);
    });

    this.medicaments = this.medicaments.filter(medicament => {
      var consider = true;

      if (this.pharmaceuticFormsSelected.length > 0)
        consider = this.pharmaceuticFormsSelected.findIndex(pharmaceuticForm => pharmaceuticForm.index == medicament.pharmaceuticForm.index) !== -1;

      if (consider && this.searchText)
        consider = medicament.name.toLowerCase().indexOf(this.searchText.toLowerCase()) !== -1;

      return consider;
    })

    if (this.searchText || this.selectedCategory || this.pharmaceuticFormsSelected.length > 0) {
      this.step = 2;
    } else {
      this.step = 1;
    }
  }

  defineSelectedCategory(): Array<any> {
    return this.selectedCategory ? [this.selectedCategory] : this.categories
  }

  defineSelectedPharmaceuticForms(): Array<any> {
    return this.pharmaceuticForms.filter(pharmaceuticForm => {
      return pharmaceuticForm.selected;
    })
  }

  async showPopover(filterEvent: any) {
    let ionPopover = await this.popoverCtrl.create({
      component: 'of-pharmaceutic-forms-popover',
      componentProps: {
        pharmaceuticForms: this.pharmaceuticForms,
        pharmaceuticFormsEmitter: this.pharmaceuticFormsSelectionChanged
      },
      ev: filterEvent,
      translucent: true
    });

    await ionPopover.present();
  }

  showTimedToast(message: string, duration: number = 3000): Promise<HTMLIonToastElement> {
    return this.showToast({
      message: message,
      duration: duration
    });
  }

  showFixedToast(message: string, closeButtonText: string = "Fechar"): Promise<HTMLIonToastElement> {
    return this.showToast({
      message: message,
      showCloseButton: true,
      closeButtonText: closeButtonText
    });
  }

  showToast(options: any): Promise<HTMLIonToastElement> {
    options.cssClass = "toast";

    return this.toastCtrl.create(options);
  }



  render() {
    let tplListContent = [];

    if (this.step == 2) {

      let tplSelectedCategory =
        this.selectedCategory
          ? <ion-item>
            {/* <ion-thumbnail slot="start"> */}
            <div class="thumbnail-temp">
              <of-lazy-img slot="start" src={this.selectedCategory.image}></of-lazy-img>
            </div>
            {/* </ion-thumbnail> */}
            <ion-label style={{ "color": this.selectedCategory.color, "font-size": "large" }}>{this.selectedCategory.name}</ion-label>
            <ion-icon style={{ "color": "#dedede", "cursor": "pointer" }} slot="end" name="close" onClick={() => this.selectCategory()}></ion-icon>
          </ion-item>
          : "";

      let tplMedicaments =
        this.medicaments.length > 0
          ? this.medicaments.map(medicament =>
            <ion-item button={true} onClick={() => this.selectMedicament(medicament)}>
              <ion-avatar slot="start">
                <of-lazy-img src={medicament.category.image}></of-lazy-img>
              </ion-avatar>
              <ion-label style={{ "color": medicament.category.color, "font-size": "large", "padding-top": "2px" }}>{medicament.name}
                <p style={{ "color": "silver", "padding-top": "4px" }}>{medicament.pharmaceuticForm.name}</p>
              </ion-label>
            </ion-item>)
          : <ion-item button={true} onClick={() => this.selectSuggestion()}>
            <ion-icon size="large" class="suggestion-item" slot="start" name="chatbubbles"></ion-icon>
            <ion-label color="primary">{"Não encontrou o que procurava?"}
              <p style={{ "color": "silver" }}>{"Conte-nos sobre isso"}</p>
            </ion-label>
          </ion-item>;

      tplListContent.push(tplSelectedCategory);
      tplListContent.push(tplMedicaments);

    } else {

      let tplcategories =
        this.categories.length > 0
          ? this.categories.map(category =>
            <ion-item button={true} onClick={() => this.selectCategory(category)}>
              {/* <ion-thumbnail slot="start"> */}
              <div class="thumbnail-temp">
                <of-lazy-img slot="start" src={category.image}></of-lazy-img>
              </div>
              {/* </ion-thumbnail> */}
              <ion-label style={{ "color": category.color, "font-size": "large" }}>{category.name}</ion-label>
            </ion-item>)
          : "";

      tplListContent.push(tplcategories);

    }

    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Enciclopédia</ion-title>
          <ion-buttons slot="end">
            <ion-menu-toggle menu="menu" color="primary">
              <ion-icon class="menu-button" name="menu"></ion-icon>
            </ion-menu-toggle>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      ,
      <ion-content>
        <ion-list>
          <ion-list-header>
            <ion-searchbar type="search" placeholder="Nome do medicamento" onIonChange={event => this.inputSearchText(event)}></ion-searchbar>
            <ion-button class="filter-button" slot="end" fill="outline" onClick={event => this.showPopover(event)}>
              <ion-icon name="funnel">
                {this.pharmaceuticFormsSelected.length > 0
                  ? <ion-badge color="primary">{this.pharmaceuticFormsSelected.length}</ion-badge>
                  : ""}
              </ion-icon>
            </ion-button>
          </ion-list-header>
          {tplListContent}
        </ion-list>
      </ion-content>
      ,
      <ion-footer style={{ "background-color": "#17ab93", height: "4%" }}>
        <of-footer></of-footer>
      </ion-footer>
    ];
  }
}
