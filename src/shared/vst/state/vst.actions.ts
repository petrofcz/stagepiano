import {AddEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {VST} from '../model/vst';
import {ParamMappingPage} from '../../paramMapping/model/model';
import {Effect} from '../model/effect';

export class AddVSTAction implements AddEntityActionDecl<VST> {
	static readonly type = '[VST] Add';
	public constructor(public readonly entity: VST) { }
}

export interface SaveEffectParamMappingPageActionDecl {
	readonly effectId: string;
	paramMappingPage: ParamMappingPage;
}

export class PatchVstAction implements UpdateEntityActionDecl<Effect> {
	static readonly type = '[VST] Patch vst';
	constructor(public entity: Partial<Effect>) { }
}

export class SaveEffectParamMappingPageAction implements SaveEffectParamMappingPageActionDecl {
	static readonly type = '[VST] Save effect param mapping';
	constructor(public readonly effectId: string, public readonly paramMappingPage: ParamMappingPage) { }
}