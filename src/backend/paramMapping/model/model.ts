import {KnobMode} from '../../keyboard/hw/display/knobs';
import {ParamMappingStrategy} from '../../../shared/paramMapping/model/model';

export interface ParamMappingStrategyHandler {
	learnValue(value: string, paramMappingItemId: number);

	getKnobMode(strategy: ParamMappingStrategy): KnobMode;

	getDisplayValue(mappingStrategy: ParamMappingStrategy, args: any[]): string;

	getKnobValue(mappingStrategy: ParamMappingStrategy, args: any[]): number;
}