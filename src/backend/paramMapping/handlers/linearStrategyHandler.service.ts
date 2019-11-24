import {ParamMappingStrategyHandler} from '../model/model';
import {Store} from '@ngxs/store';
import {PatchParamMappingStrategyAction} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import {ParamMappingPageState} from '../../../shared/paramMapping/state/paramMappingPage.state';
import {LinearParamMappingStrategy} from '../../../shared/paramMapping/model/model';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class LinearStrategyHandlerService implements ParamMappingStrategyHandler {

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

}