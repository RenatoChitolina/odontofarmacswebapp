import { Observable, Subscriber } from 'rxjs';
import { uuIDv4 } from '../helpers/utils';
import env from '../.env';

//TODO: (R) Quando houver uma versão estável, remover essa tipagem forçada e fazer o import corretamente
declare const PouchDB: any;

export default class DatabaseHandler {
  private _db: any;
  private _pharmaceuticForms: Array<any> = [];
  private _categories: Array<any> = [];
  private _profiles: Array<any> = [];

  private pull = {
    categorySelector: { "_id": { "$gt": "category:", "$lt": "category:\uffff" } },
    pharmaceuticFormSelector: { "_id": { "$gt": "pharmaceuticForm:", "$lt": "pharmaceuticForm:\uffff" } }
  };
  private push = {
    profileSelector: { "_id": { "$gt": "profile:", "$lt": "profile:\uffff" } },
    suggestionSelector: { "_id": { "$gt": "suggestion:", "$lt": "suggestion:\uffff" } }
  };

  constructor() {
    if (DatabaseHandler._instance)
      throw new Error("Instantiation failed: Use DatabaseHandler.getInstance() instead of new keyword.");

    this._db = new PouchDB(`${env.DB_NAME}`, { adapter: 'websql' });

    this._db.sync(`${env.COUCHDB_URI}/${env.DB_NAME}`, {
      live: true,
      retry: true,
      continuous: true,
      pull: {
        selector: {
          "$or": [
            this.pull.categorySelector,
            this.pull.pharmaceuticFormSelector
          ]
        }
      },
      push: {
        selector: {
          "$or": [
            this.push.profileSelector,
            this.push.suggestionSelector
          ]
        }
      }
    })

    DatabaseHandler._instance = this;
  }

  syncProfile(id: string): void {
    this._db.sync(`${env.COUCHDB_URI}/${env.DB_NAME}`, {
      live: true,
      retry: true,
      continuous: true,
      pull: {
        selector: {
          "$or": [
            this.pull.categorySelector,
            this.pull.pharmaceuticFormSelector,
            { "_id": id }
          ]
        }
      },
      push: {
        selector: {
          "$or": [
            this.push.profileSelector,
            this.push.suggestionSelector
          ]
        }
      }
    })
  }

  getPharmaceuticForms(): Observable<any> {
    return new Observable(observer => {
      if (this._pharmaceuticForms.length > 0)
        observer.next(this._pharmaceuticForms);

      this._db.allDocs({ include_docs: true, startkey: "pharmaceuticForm:", endkey: "pharmaceuticForm:\uffff" })
        .then((result) => {
          this._pharmaceuticForms = [];

          result.rows.map((row) => {
            this._pharmaceuticForms.push(row.doc);
          });

          observer.next(this._pharmaceuticForms);

          this._db.changes({ live: true, since: 'now', include_docs: true })
            .on('change', (change) => {
              if (change.id.indexOf("pharmaceuticForm:") < 0)
                return;

              this.handleChange(this._pharmaceuticForms, change, observer);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  getCategories(): Observable<any> {
    return new Observable(observer => {
      if (this._categories.length > 0)
        observer.next(this._categories);

      this._db.allDocs({ include_docs: true, startkey: "category:", endkey: "category:\uffff" })
        .then((result) => {

          this._categories = [];

          result.rows.map((row) => {
            this._categories.push(row.doc);
          });

          observer.next(this._categories);

          this._db.changes({ live: true, since: 'now', include_docs: true })
            .on('change', (change) => {
              if (change.id.indexOf("category:") < 0)
                return;

              this.handleChange(this._categories, change, observer);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  private getProfiles(): Observable<any> {
    return new Observable(observer => {
      if (this._profiles.length > 0)
        observer.next(this._profiles);

      this._db.allDocs({ include_docs: true, startkey: "profile:", endkey: "profile:\uffff" })
        .then((result) => {

          this._profiles = [];

          result.rows.map((row) => {
            this._profiles.push(row.doc);
          });

          observer.next(this._profiles);

          this._db.changes({ live: true, since: 'now', include_docs: true })
            .on('change', (change) => {
              if (change.id.indexOf("profile:") < 0)
                return;

              this.handleChange(this._profiles, change, observer);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  getProfile(id: string): Observable<any> {
    return new Observable(observer => {
      this.getProfiles()
        .subscribe(data => {
          let index = data.findIndex(profile => profile._id == id);

          let profile = { ...data[index] };

          profile.birth = new Date(+profile.birth).toISOString().split('T')[0];

          observer.next(profile);
        });
    });
  }

  updateProfile(profile: any): Observable<string> {
    return new Observable(observer => {

      profile.type = profile.type.index;

      this._db.put(profile)
        .then((result) => {
          observer.next(result.id);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  addSuggestion(category: string, searchText: string, pharmaceuticForms: string, additionalInfo: string): Observable<string> {
    return new Observable(observer => {
      let newSuggestion: any = new Object();

      newSuggestion._id = "suggestion:" + uuIDv4(true);
      newSuggestion.date = new Date().valueOf().toString();

      if (category)
        newSuggestion.category = category;

      if (searchText)
        newSuggestion.search = searchText;

      if (pharmaceuticForms)
        newSuggestion.pharmaceuticForms = pharmaceuticForms;

      if (additionalInfo)
        newSuggestion.AdditionalInfo = additionalInfo;

      this._db.put(newSuggestion)
        .then((result) => {
          observer.next(result.id);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  private handleChange(source: Array<any>, change: any, observer: Subscriber<any>) {
    let trackedIndex = source.findIndex(item => item._id == change.id);

    if (change.deleted) {
      if (trackedIndex >= 0)
        source.splice(trackedIndex, 1);
    }
    else
      if (trackedIndex >= 0)
        source[trackedIndex] = change.doc;
      else
        source.push(change.doc);

    observer.next(source);
  }

  /* Singleton features */
  private static _instance: DatabaseHandler = new DatabaseHandler();
  public static getInstance(): DatabaseHandler { return DatabaseHandler._instance; }
}
