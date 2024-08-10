import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ComponentService {
    private fetchSubject: Subject<any>;
    fetch$: Observable<any>;

    constructor() {
        this.fetchSubject = new Subject<any>();
        this.fetch$ = this.fetchSubject.asObservable();
        this.fetch$.subscribe();
    }

    sendComponent(component: string) {
        this.fetchSubject.next(component);
    }
}