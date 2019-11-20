import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {Effect} from '../../../shared/vst/model/effect';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {LoadParamMappingPageFromEffectAction} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import {SaveEffectParamMappingPageAction} from '../../../shared/vst/state/vst.actions';

@Component({
	selector: 'app-effect-param-mapping',
	templateUrl: './effect-param-mapping-page.component.html',
	styleUrls: ['./effect-param-mapping-page.component.scss'],
})
export class EffectParamMappingPageComponent implements OnInit, OnDestroy {

	effect$: Observable<Effect>;

	protected _subscriptions: Subscription[] = [];

	protected _effect: Effect|null;

	constructor(private route: ActivatedRoute, private router: Router, private store: Store) {

	}

	ngOnInit(): void {
		this.effect$ = <Observable<Effect>> this.route.paramMap
			.pipe(map((params: ParamMap) => params.get('effectId')))
			.pipe(distinctUntilChanged())
			.pipe(map(effectId => <Effect>this.store.selectSnapshot(VSTState.getVstById)(effectId)))
			.pipe(tap(effect => this._effect = effect));

		this._subscriptions.push(
			this.effect$.subscribe(
				effect => this.store.dispatch(new LoadParamMappingPageFromEffectAction(effect.id))
			)
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(sub => sub.unsubscribe());
		this._subscriptions = [];
	}

	onCancelClick() {
		this.router.navigate(['/effects']);
	}

	onSaveClick() {
		if (!this._effect) {
			return;
		}
		this.store.dispatch(new SaveEffectParamMappingPageAction(this._effect.id));
	}
}