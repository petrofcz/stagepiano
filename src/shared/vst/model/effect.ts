import {VST} from './vst';
import {ParamMapping, ParamMappingPage} from '../../paramMapping/model/model';

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
	paramMappingPage: ParamMappingPage;  // Mappings associated to the effect
	mainParamMappingId: string;	 // This will be the main parameter mapping (usually on / off switch or wet)
	placement: EffectPlacement;
	type: 'effect';
}