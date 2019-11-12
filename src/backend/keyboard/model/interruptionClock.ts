import {EventEmitter, Injectable} from '@angular/core';
import {interval, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class InterruptionClock {

	protected static readonly SLOW_FREQ = 2;
	protected static readonly SLOWMED_FREQ = 3;
	protected static readonly FASTMED_FREQ = 4;
	protected static readonly FAST_FREQ = 6;

	private _slow: EventEmitter<boolean> = new EventEmitter<boolean>();
	private _slowMed: EventEmitter<boolean> = new EventEmitter<boolean>();
	private _fastMed: EventEmitter<boolean> = new EventEmitter<boolean>();
	private _fast: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor() {
		this._slow = new EventEmitter();

		interval(1000 / InterruptionClock.SLOW_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		})).subscribe((val) => {
			this._slow.emit(val);
		});

		interval(1000 / InterruptionClock.SLOWMED_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		})).subscribe(val => {
			this._slowMed.emit(val);
		});
		interval(1000 / InterruptionClock.FASTMED_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		})).subscribe(val => {
			this._fastMed.emit(val);
		});
		interval(1000 / InterruptionClock.FAST_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		})).subscribe(val => {
			this._fast.emit(val);
		});
	}

	// 0-based, max 3!
	public getByIndex(index: number): Observable<boolean> {
		switch (index) {
			case 0:
				return this._slow;
			case 1:
				return this._slowMed;
			case 2:
				return this._fastMed;
			case 3:
				return this._fast;
			default:
				return this._slow;
		}
	}

	get slow(): EventEmitter<boolean> {
		return this._slow;
	}

	get slowMed(): EventEmitter<boolean> {
		return this._slowMed;
	}

	get fastMed(): EventEmitter<boolean> {
		return this._fastMed;
	}

	get fast(): EventEmitter<boolean> {
		return this._fast;
	}
}