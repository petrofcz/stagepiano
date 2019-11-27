import {MortalInterface} from '../../../model/mortalInterface';
import {LoadParamMappingPageFromEffectAction} from '../../../../../shared/paramMapping/state/paramMappingPage.actions';
import {Store} from '@ngxs/store';
import {SessionState} from '../../../../../shared/session/state/session.state';
import {Observable, of, Subscription} from 'rxjs';
import {EffectSwitchController} from './effectSwitchController.service';
import {ParamMappingController} from './paramMappingController';
import {SetKeyboardRouteAction} from '../../../../../shared/session/state/session.actions';
import {KeyboardRoutes} from '../../../router/keyboardRoutes';
import {Injectable} from '@angular/core';
import {filter, map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class EffectDetailController implements MortalInterface {

	_subscriptions: Subscription[] = [];

	constructor(protected store: Store, protected effectSwitchController: EffectSwitchController, protected paramMappingController: ParamMappingController) { }

	onInit(): void {
		this.effectSwitchController.onInit();

		const routerParams$ = <Observable<EffectDetailControllerParams>>
			this.store.select(SessionState.getKeyboardRoute)
				.pipe(filter(val => val !== null))
				.pipe(filter(val => val.params && 'effectId' in val.params))
				.pipe(map(val => val.params));

		// this._subscriptions.push(routerParams$.subscribe(params => {
		// 	this.store.dispatch(new LoadParamMappingPageFromEffectAction(
		// 		params.effectId
		// 	));
		// }));

		const paramsForLayer$ = routerParams$.pipe(
			switchMap(params => this.store.select(SessionState.getActiveLayerId).pipe(tap(
				(layerId) => console.log('[EDC] NEW EFFECT ID FOR LAYER ID ' + layerId)
				))
					.pipe(withLatestFrom(of(params)))
			)
		);
		this._subscriptions.push(
			paramsForLayer$.subscribe(([layerId, params]) => this.store.dispatch(new LoadParamMappingPageFromEffectAction(params.effectId)))
		);

		// set active effect for effect switcher
		this._subscriptions.push(
			routerParams$.subscribe((params) => {
				this.effectSwitchController.setActiveEffectId(params.effectId);
			})
		);

		// redirect to overview if effect is not available for current layer
		this._subscriptions.push(
			this.effectSwitchController.availableEffects$
				.pipe(withLatestFrom(routerParams$))
				.subscribe(([effects, params]) => {
					if (!effects.filter(effect => effect.id === params.effectId).length) {
						this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EFFECT_OVERVIEW));
					}
				})
		);

		this._subscriptions.push(
			this.effectSwitchController.onSwitch
				.pipe(withLatestFrom(routerParams$))
				.subscribe(([effect, params]) => {
					if (effect.id === params.effectId) { // go back to effect overview
						this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EFFECT_OVERVIEW));
					} else {
						this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EFFECT_DETAIL, <EffectDetailControllerParams>{ effectId: effect.id }));
					}
			})
		);
		this.paramMappingController.onInit();
	}

	onDestroy(): void {
		this._subscriptions.forEach(sub => sub.unsubscribe());
		this._subscriptions = [];
		this.effectSwitchController.onDestroy();
		this.paramMappingController.onDestroy();
	}

}

export interface EffectDetailControllerParams {
	effectId: string;
}