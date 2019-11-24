import {Store} from '@ngxs/store';
import {ParamMappingStrategies} from '../../../shared/paramMapping/model/paramMappingStrategies';
import {ParamMappingStrategyHandler} from './model';
import {LinearStrategyHandlerService} from '../handlers/linearStrategyHandler.service';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class StrategyHandlerProviderService {

	constructor (protected store: Store, protected linearStrategyHandler: LinearStrategyHandlerService) {

	}

	public get(type: string): ParamMappingStrategyHandler|null {
		switch (type) {
			case ParamMappingStrategies.LINEAR:
				return this.linearStrategyHandler;
		}
		return null;
	}

}