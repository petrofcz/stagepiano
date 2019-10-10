import {AddEntityActionDecl} from '../../ngxs/entity/actions';
import {VST} from '../model/vst';

export class AddVSTAction implements AddEntityActionDecl<VST> {
	static readonly type = '[VST] Add';
	public constructor(public readonly entity: VST) { }
}