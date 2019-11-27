import {ParamMappingStrategyHandler} from '../model/model';
import {Store} from '@ngxs/store';
import {PatchParamMappingStrategyAction} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import {ParamMappingPageState} from '../../../shared/paramMapping/state/paramMappingPage.state';
import {LinearParamMappingStrategy, ParamMappingStrategy} from '../../../shared/paramMapping/model/model';
import {Injectable} from '@angular/core';
import {KnobMode} from '../../keyboard/hw/display/knobs';

@Injectable({
	providedIn: 'root'
})
export class LinearStrategyHandlerService implements ParamMappingStrategyHandler {

	_knobSpeed = 1;

	constructor(protected store: Store) { }

	learnValue(value: string, paramMappingItemId: number) {
		const valueLearningIndex = this.store.selectSnapshot(ParamMappingPageState.getValueLearningIndex);
		if (valueLearningIndex === null) {
			return;
		}
		if (value === null) {
			return;
		}
		let patch = null;
		if (valueLearningIndex === 0) { // osc from
			patch = <Partial<LinearParamMappingStrategy>>{
				oscFrom: parseFloat(value)
			};
		}
		if (valueLearningIndex === 1) {  // osc to
			patch = <Partial<LinearParamMappingStrategy>>{
				oscTo: parseFloat(value)
			};
		}
		if (patch) {
			this.store.dispatch(
				new PatchParamMappingStrategyAction(
					paramMappingItemId, patch
				)
			);
		}
	}

	private getMultiplier(mappingStrategy: LinearParamMappingStrategy, value: number): number {
		const boundedVal = Math.max(Math.min(mappingStrategy.oscTo, value), mappingStrategy.oscFrom);
		const multiplier = (boundedVal - mappingStrategy.oscFrom) / (mappingStrategy.oscTo - mappingStrategy.oscFrom);
		return mappingStrategy.oscInverse ? 1 - multiplier : multiplier;
	}

	getDisplayValue(mappingStrategy: LinearParamMappingStrategy, args: any[]): string {
		if (!args.length) {
			return '';
		}
		const value = parseFloat(args[0]);
		return (mappingStrategy.dispFrom +
			((mappingStrategy.dispTo - mappingStrategy.dispFrom) * this.getMultiplier(mappingStrategy, value)))
			.toFixed(mappingStrategy.dispDecimals).toString() + (mappingStrategy.dispSuffix ? mappingStrategy.dispSuffix : '');
	}

	getKnobMode(strategy: ParamMappingStrategy): KnobMode {
		return KnobMode.MODE_CONTINUOUS;
	}

	getKnobValue(mappingStrategy: ParamMappingStrategy, args: any[]): number {
		if (!args.length) {
			return 0;
		}
		return this.getMultiplier(<LinearParamMappingStrategy>mappingStrategy, parseFloat(args[0]));
	}

	handleMove(mappingStrategy: LinearParamMappingStrategy, args: any[], delta: number): number {
		return Math.min(Math.max(
			args[0] + ((mappingStrategy.oscTo - mappingStrategy.oscFrom) * (0.01 * this._knobSpeed * delta) * (mappingStrategy.oscInverse ? -1 : 1)),
			mappingStrategy.oscFrom
		), mappingStrategy.oscTo);
	}

}
