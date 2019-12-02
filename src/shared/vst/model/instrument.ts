import {VST} from './vst';
import {ParamMappingGroup} from '../../paramMapping/model/model';

export interface Instrument extends VST {
	paramMappingGroupIds: string[];
	paramMappingGroups: { [key: string]: ParamMappingGroup };
	defaultParamMappingGroupId: string;
	type: 'instrument';
}