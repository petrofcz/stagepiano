import {Injectable} from '@angular/core';
import {MortalInterface} from '../../../model/mortalInterface';
import {ParamMappingController} from './paramMappingController';
import {Subscription} from 'rxjs';
import {Store} from '@ngxs/store';
import {SetKeyboardRouteAction} from '../../../../../shared/session/state/session.actions';
import {KeyboardRoutes} from '../../../router/keyboardRoutes';
import {EffectSwitchController} from './effectSwitchController.service';
import {EffectDetailControllerParams} from './effectDetailController';
import {LoadParamMappingPageAction} from '../../../../../shared/paramMapping/state/paramMappingPage.actions';
import {ParamMappingPage} from '../../../../../shared/paramMapping/model/model';

@Injectable({
	providedIn: 'root'
})
export class EffectOverviewController implements MortalInterface {

	protected subscriptions: Subscription[] = [];

	constructor(protected effectSwitchController: EffectSwitchController, protected paramMappingController: ParamMappingController, protected store: Store) {

	}

	onDestroy(): void {
		this.effectSwitchController.onDestroy();
		this.paramMappingController.onDestroy();
		this.paramMappingController.alwaysShowValues = false;
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
	}

	onInit(): void {
		this.effectSwitchController.onInit();

		this.subscriptions.push(
			this.effectSwitchController.availableEffects$.pipe().subscribe((effects) => {
				const page: ParamMappingPage = {
					mappings: {},
					ids: []
				};
				const vstPrefixes = {};

				effects.map((effect) => {
					return effect.mainParamMappingId ? effect.paramMappingPage.mappings[effect.mainParamMappingId] : null;
				}).forEach(
					paramMapping => {
						if (paramMapping) {
							page.ids.push(paramMapping.id);
							page.mappings[paramMapping.id] = paramMapping;
						} else {
							page.ids.push(null);
						}
					}
				);

				effects.map((effect) => {
					if (effect.mainParamMappingId) {
						vstPrefixes[effect.mainParamMappingId] = effect.id + '/';
					}
				});

				this.store.dispatch(new LoadParamMappingPageAction(page, vstPrefixes));
			})
		);

		this.paramMappingController.alwaysShowValues = true;
		this.paramMappingController.onInit();
		this.subscriptions.push(
			this.effectSwitchController.onSwitch.subscribe(effect => {
				this.store.dispatch(
					new SetKeyboardRouteAction(KeyboardRoutes.EFFECT_DETAIL, <EffectDetailControllerParams>{ effectId: effect.id })
				);
			})
		);
	}

}