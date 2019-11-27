import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {Effect, EffectScope} from '../../../shared/vst/model/effect';
import {distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {LoadParamMappingPageFromEffectAction} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import {PatchVstAction, SaveEffectParamMappingPageAction} from '../../../shared/vst/state/vst.actions';
import {ParamMappingPageState} from '../../../shared/paramMapping/state/paramMappingPage.state';
import {SetEffectDispositionAction, SetKeyboardRouteAction} from '../../../shared/session/state/session.actions';
import {KeyboardRoutes} from '../../../backend/keyboard/router/keyboardRoutes';
import {EffectDetailControllerParams} from '../../../backend/keyboard/controller/global/display/effectDetailController';
import {EffectDisposition} from '../../../shared/session/model/effectDisposition';

@Component({
	selector: 'app-effect-param-mapping',
	templateUrl: './effect-param-mapping-page.component.html',
	styleUrls: ['./effect-param-mapping-page.component.scss'],
})
export class EffectParamMappingPageComponent implements OnInit, OnDestroy {

	effect$: Observable<Effect>;

	protected _subscriptions: Subscription[] = [];

	protected _effect: Effect|null;

	defaultMappingId$: Observable<string> = null;

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
				effect => this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EFFECT_DETAIL, <EffectDetailControllerParams>{ effectId: effect.id }))
			)
		);

		// this._subscriptions.push(
		// 	this.effect$.subscribe(
		// 		effect => this.store.dispatch(new LoadParamMappingPageFromEffectAction(effect.id))
		// 	)
		// );

		this.defaultMappingId$ = this.route.paramMap
			.pipe(map((params: ParamMap) => params.get('effectId')))
			.pipe(distinctUntilChanged())
			.pipe(switchMap(effectId => this.store.select(VSTState.getVstById).pipe(map(cb => cb(effectId)))))
			.pipe(map(e => (<Effect>e).mainParamMappingId))
			.pipe(distinctUntilChanged());
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
		const currentParamMappingPage = this.store.selectSnapshot(ParamMappingPageState.getPage);
		if (!currentParamMappingPage) {
			return;
		}
		this.store.dispatch(new SaveEffectParamMappingPageAction(this._effect.id, currentParamMappingPage));
	}

	changeDefault($event: string) {
		if (!this._effect) {
			return;
		}
		this.store.dispatch(new PatchVstAction(
			{
				id: this._effect.id,
				mainParamMappingId: $event
			}
		));
	}
}