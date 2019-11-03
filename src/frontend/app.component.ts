import {Component, OnDestroy} from '@angular/core';
import {ElectronService} from './core/services';
import {TranslateService} from '@ngx-translate/core';
import {AppConfig} from '../environments/environment';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {Observable, Subject} from 'rxjs';
import {Actions, ofActionSuccessful, Select, Store} from '@ngxs/store';
import {RouterDataResolved} from '@ngxs/router-plugin';
import {filter, map, mergeMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {FrontendState} from '../shared/frontend/state/frontend.state';
import {RequestGlobalStateAction} from '../shared/ngxs/request-global-state.action';
import {LayoutState} from '../shared/layout/state/layout.state';
import {Layout} from '../shared/layout/model/layout';
import {SelectLayoutAction} from '../shared/layout/state/layout.actions';
import {Layer} from '../shared/manual/model/layer';
import {ManualState} from '../shared/manual/state/manual.state';
import {Manual} from '../shared/manual/model/manual';
import {SessionState} from '../shared/session/state/session.state';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	pageTitle: Observable<string>;

	@Select(FrontendState.isInitialized)
	initialized$: Observable<boolean>;

	@Select(LayoutState.isLayoutLoaded)
	layoutLoaded$: Observable<boolean>;

	@Select(LayoutState.getActiveLayout)
	activeLayout$: Observable<Layout>;

	@Select(ManualState.getCurrentLayer)
	currentLayer$: Observable<Layer>;

	@Select(ManualState.getCurrentManual)
	currentManual$: Observable<Manual>;

	constructor(
		public electronService: ElectronService,
		private translate: TranslateService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private store: Store
	) {
		translate.setDefaultLang('en');
		console.log('AppConfig', AppConfig);

		if (electronService.isElectron) {
			console.log(process.env);
			console.log('Mode electron');
			console.log('Electron ipcRenderer', electronService.ipcRenderer);
			console.log('NodeJS childProcess', electronService.childProcess);
		} else {
			console.log('Mode web');
		}

		this.pageTitle = this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.pipe(map(() => this.activatedRoute))
			.pipe(map((route) => {
				while (route.firstChild) route = route.firstChild;
				return route;
			}))
			.pipe(filter((route) => route.outlet === 'primary'))
			.pipe(mergeMap((route) => route.data))
			.pipe(map(data => { return data.title ? data.title : ''; }));

		store.dispatch(new RequestGlobalStateAction());
	}

	closeLayout() {
		this.store.dispatch(new SelectLayoutAction(null));
	}
}
