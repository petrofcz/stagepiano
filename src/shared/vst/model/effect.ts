import {VST} from './vst';
import {ParamMapping} from '../../paramMapping/model/model';

export enum EffectPlacement {
	Pre,
	Post
}

export interface Effect extends VST {
	paramMappings: ParamMapping[];  // Mappings associated to the effect
	mainParamMappingId: number;	 // This will be the main parameter mapping (usually on / off switch or wet)
	placement: EffectPlacement;
	type: 'effect';
}