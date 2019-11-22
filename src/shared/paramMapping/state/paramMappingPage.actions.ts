import {AddEntityActionDecl, MoveEntityActionDecl, RemoveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {ParamMapping, ParamMappingStrategy} from '../model/model';

export class UpdateParamMappingAction implements UpdateEntityActionDecl<ParamMapping> {
	static readonly type = '[ParamMappingPage] Update param mapping';
	public constructor(public readonly entity: Partial<ParamMapping>) { }
}

export class AddParamMappingAction implements AddEntityActionDecl<ParamMapping> {
	static readonly type = '[ParamMappingPage] Add param mapping';
	public constructor(public readonly entity: ParamMapping) { }
}

export class MoveParamMappingAction implements MoveEntityActionDecl<ParamMapping> {
	static readonly type = '[ParamMappingPage] Move param mapping';
	public constructor(public readonly oldIndex: number, public readonly newIndex: number) { }
}

export class RemoveParamMappingAction implements RemoveEntityActionDecl {
	static readonly type = '[ParamMappingPage] Remove param mapping';
	public constructor(public readonly id: string) { }
}

export interface LoadParamMappingPageFromEffectActionDecl {
	effectId: string;
}

export class LoadParamMappingPageFromEffectAction implements LoadParamMappingPageFromEffectActionDecl {
	static readonly type = '[ParamMappingPage] Load from effect';
	constructor(public readonly effectId: string) { }
}

export interface SelectParamMappingActionDecl {
	paramMappingId: string|null;
}

export class SelectParamMappingAction implements SelectParamMappingActionDecl {
	static readonly type = '[ParamMappingPage] Select param mapping';
	constructor(public readonly paramMappingId: string|null) { }
}

export interface SetEndpointLearningActionDecl {
	isLearning: boolean;
}

export class SetEndpointLearningAction implements SetEndpointLearningActionDecl {
	static readonly type = '[ParamMappingPage] Set endpoint learning';
	constructor(public readonly isLearning: boolean) { }
}

export interface UpdateParamMappingStrategyActionDecl {
	itemId: number;
	strategy: ParamMappingStrategy;
}

export class UpdateParamMappingStrategyAction implements UpdateParamMappingStrategyActionDecl {
	static readonly type = '[ParamMappingPage] Update param mapping strategy';
	public constructor(public readonly itemId: number, public readonly strategy: ParamMappingStrategy) { }
}