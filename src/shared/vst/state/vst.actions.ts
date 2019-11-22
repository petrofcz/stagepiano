import {AddEntityActionDecl} from '../../ngxs/entity/actions';
import {VST} from '../model/vst';
import {ParamMappingPage} from '../../paramMapping/model/model';

export class AddVSTAction implements AddEntityActionDecl<VST> {
	static readonly type = '[VST] Add';
	public constructor(public readonly entity: VST) { }
}

export interface SaveEffectParamMappingPageActionDecl {
	readonly effectId: string;
	paramMappingPage: ParamMappingPage;
}

export class SaveEffectParamMappingPageAction implements SaveEffectParamMappingPageActionDecl {
	static readonly type = '[VST] Save effect param mapping';
	constructor(public readonly effectId: string, public readonly paramMappingPage: ParamMappingPage) { }
}