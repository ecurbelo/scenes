import { SceneObjectBase } from '../core/SceneObjectBase';
import { SceneObjectRef } from '../core/SceneObjectRef';
import { SceneDataProvider, SceneDataProviderResult, SceneDataState } from '../core/types';
import { Observable } from 'rxjs';

export interface DataProxyProviderState extends SceneDataState {
  source: SceneObjectRef<SceneDataProvider>;
}

export class DataProxyProvider extends SceneObjectBase<DataProxyProviderState> implements SceneDataProvider {
  public constructor(state: DataProxyProviderState) {
    super(state);

    this.addActivationHandler(() => {
      this._subs.add(
        this.state.source.resolve().subscribeToState((newState, oldState) => {
          if (newState.data !== oldState.data) {
            this.setState({ data: newState.data });
          }
        })
      );
    });
  }

  public setContainerWidth(width: number) {
    this.state.source.resolve().setContainerWidth?.(width);
  }

  public isDataReadyToDisplay() {
    return this.state.source.resolve().isDataReadyToDisplay?.();
  }

  public cancelQuery() {
    this.state.source.resolve().cancelQuery();
  }

  public getResultsStream(): Observable<SceneDataProviderResult> {
    return this.state.source.resolve().getResultsStream();
  }
}
