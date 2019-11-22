import {Input, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

export class AbstractParamMappingComponent implements OnDestroy {

	private _currentItemId: number;

	protected subscriptions: Subscription[] = [];

	get currentItemId(): number {
		return this._currentItemId;
	}

	@Input()
	set currentItemId(value: number) {
		this._currentItemId = value;
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
	}
}