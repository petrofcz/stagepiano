import {Store} from '@ngxs/store';
import {combineLatest} from 'rxjs';
import {SessionState} from '../../session/state/session.state';
import {PresetSessionState} from '../state/presetSession.state';
import {distinctUntilChanged} from 'rxjs/operators';
import {LoadParamMappingPageFromInstrumentAction, ResetParamMappingPageAction} from '../../paramMapping/state/paramMappingPage.actions';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ParamMappingLoaderService {
	constructor(protected store: Store) {
		combineLatest(
			store.select(SessionState.getActiveLayerId),
			store.select(PresetSessionState.getCurrentPreset)
		).pipe(distinctUntilChanged()).subscribe(([activeLayerId, currentPreset]) => {
			if (!activeLayerId || !currentPreset) {
				store.dispatch(new ResetParamMappingPageAction());
			} else {
				store.dispatch(new LoadParamMappingPageFromInstrumentAction(
					currentPreset.vstId, currentPreset.parameterMappingGroupId
				));
			}
		});
	}
}