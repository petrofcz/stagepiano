import {VST} from './vst';
import {ParamMapping} from '../../paramMapping/model/model';

export enum EffectPlacement {
	Pre,
	Post
}
export enum EffectScope {
	Local,
	Global
}

export interface Effect extends VST {
	// this is wrong!? only one param mapping should be used?
	paramMappings: ParamMapping[];  // Mappings associated to the effect
	mainParamMappingId: number;	 // This will be the main parameter mapping (usually on / off switch or wet)
	placement: EffectPlacement;
	type: 'effect';
}