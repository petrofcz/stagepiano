import {VST} from './vst';
import {ParamMappingGroup} from '../../paramMapping/model/model';

export interface Instrument extends VST {
	paramMappingGroups: ParamMappingGroup[];
	defaultParamMappingGroupId: number;
	type: 'instrument';
}