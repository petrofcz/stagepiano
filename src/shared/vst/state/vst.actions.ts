import {AddEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {VST} from '../model/vst';
import {ParamMappingGroup, ParamMappingPage} from '../../paramMapping/model/model';
import {Effect} from '../model/effect';
import {Instrument} from '../model/instrument';

export class AddVSTAction implements AddEntityActionDecl<VST> {
	static readonly type = '[VST] Add';
	public constructor(public readonly entity: VST) { }
}

export interface SaveEffectParamMappingPageActionDecl {
	readonly effectId: string;
	paramMappingPage: ParamMappingPage;
}

export class PatchVstAction implements UpdateEntityActionDecl<Effect|Instrument> {
	static readonly type = '[VST] Patch vst';
	constructor(public entity: Partial<Effect|Instrument>) { }
}

export class SaveEffectParamMappingPageAction implements SaveEffectParamMappingPageActionDecl {
	static readonly type = '[VST] Save effect param mapping';
	constructor(public readonly effectId: string, public readonly paramMappingPage: ParamMappingPage) { }
}

export interface RemoveMappingGroupActionDecl {
	instrumentId: string;
	groupId: string;
}

export class RemoveMappingGroupAction implements RemoveMappingGroupActionDecl {
	static readonly type = '[VST] Remove param mapping group';
	constructor(public readonly instrumentId: string, public readonly groupId: string) { }
}

export interface PatchMappingGroupActionDecl {
	instrumentId: string;
	paramMappingGroup: Partial<ParamMappingGroup>;
}

export class PatchMappingGroupAction implements PatchMappingGroupActionDecl {
	static readonly type = '[VST] Patch param mapping group';
	constructor(public readonly instrumentId: string, public readonly paramMappingGroup: Partial<ParamMappingGroup>) { }
}
