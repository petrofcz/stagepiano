import {Select, Store} from '@ngxs/store';
import {ParamMappingPageState} from '../../../../shared/paramMapping/state/paramMappingPage.state';
import {debounceTime, filter, map, mergeMap, switchMap, take, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {OscService} from '../../../osc/osc.service';
import {OscMessage} from '../../../osc/osc.message';
import {SetEndpointLearningAction, UpdateParamMappingAction} from '../../../../shared/paramMapping/state/paramMappingPage.actions';
import {ParamMappingItem} from '../../../../shared/paramMapping/model/model';
import {Injectable} from '@angular/core';
import {BiduleOscHelper} from '../../../../shared/bidule/osc/bidule-osc-helper';

@Injectable({
	providedIn: 'root'
})
export class ParamMappingOscService {

	public constructor(store: Store, osc: OscService) {
		const isEndpointLearning$ = store.select(ParamMappingPageState.isEndpointLearning);

		isEndpointLearning$.pipe(tap((learning) => console.log('IS LEARNING ' + learning)));

		// Endpoint learn
		const oscMessages$ = isEndpointLearning$.pipe(
			switchMap((isLearning: boolean): Observable<string> => {
				if (isLearning) {
					return store.select(ParamMappingPageState.getVstPathPrefix);
				} else {
					return of('');
				}
			})
		)
			.pipe(filter((pathPrefix: string) => pathPrefix.length > 0))
			.pipe(tap(prefixString => console.log('LEARNING FOR ' + prefixString)))
			.pipe(switchMap(
				(pathPrefix: string) => osc.observe(pathPrefix + '*')
					// filter only effect's own params
					.pipe(filter(message => !BiduleOscHelper.isNativeBiduleEndpoint(message.path.split('/').pop(), false)))
					// when UI is fresh (recently opened), when any value is changed, bidule emits all param values. Need to take all changes for some time
					.pipe(debounceTime(BiduleOscHelper.TIMEOUT_OSC_PARAM_UPDATE))
					// take only one and unsubscribe
					.pipe(take(1))
			));

		oscMessages$.subscribe((oscMessage: OscMessage) => {
			console.log('LEARNING OSC IN');
			console.log(oscMessage);
			const endpoint = oscMessage.path.split('/').pop();
			store.dispatch(new SetEndpointLearningAction(false));
			store.dispatch(new UpdateParamMappingAction({
				id: store.selectSnapshot(ParamMappingPageState.getSelectedMapping).id,
				mainItemId: 0,
				items: [<ParamMappingItem>{
					endpoint: endpoint,
					mappingStrategy: null
				}]
			}));
		});
	}

}