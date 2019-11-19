import {AddEntityActionDecl} from '../../ngxs/entity/actions';
import {VST} from '../model/vst';

export class AddVSTAction implements AddEntityActionDecl<VST> {
	static readonly type = '[VST] Add';
	public constructor(public readonly entity: VST) { }
}

export interface SaveEffectParamMappingPageActionDecl {
	readonly effectId: string;
}

export class SaveEffectParamMappingPageAction implements SaveEffectParamMappingPageActionDecl {
	static readonly type = '[VST] Save effect param mapping';
	constructor(public readonly effectId: string) { }
}