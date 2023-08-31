import { map, Observable, of } from 'rxjs';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  FieldType,
  LoadingState,
  PanelData,
  toDataFrame,
} from '@grafana/data';

import { SceneTimeRange } from '../core/SceneTimeRange';

import { SceneQueryRunner } from './SceneQueryRunner';
import { SceneFlexItem, SceneFlexLayout } from '../components/layout/SceneFlexLayout';
import { SceneVariableSet } from '../variables/sets/SceneVariableSet';
import { TestVariable } from '../variables/variants/TestVariable';
import { TestScene } from '../variables/TestScene';
import { RuntimeDataSource, registerRuntimeDataSource } from './RuntimeDataSource';
import { DataQuery } from '@grafana/schema';
import { EmbeddedScene } from '../components/EmbeddedScene';
import { SceneCanvasText } from '../components/SceneCanvasText';
import { SceneTimeRangeCompare } from '../components/SceneTimeRangeCompare';
import { SceneObjectBase } from '../core/SceneObjectBase';
import { DataRequestEnricher, SceneObject, SceneObjectState } from '../core/types';

const getDataSourceMock = jest.fn().mockReturnValue({
  getRef: () => ({ uid: 'test' }),
  query: () =>
    of({
      data: [
        toDataFrame({
          refId: 'A',
          datapoints: [
            [100, 1],
            [200, 2],
            [300, 3],
          ],
        }),
      ],
    }),
});

const runRequestMock = jest.fn().mockImplementation((ds: DataSourceApi, request: DataQueryRequest) => {
  const result: PanelData = {
    state: LoadingState.Loading,
    series: [],
    timeRange: request.range,
  };

  return (ds.query(request) as Observable<DataQueryResponse>).pipe(
    map((packet) => {
      result.state = LoadingState.Done;
      result.series = packet.data;

      return result;
    })
  );
});

let sentRequest: DataQueryRequest | undefined;

jest.mock('@grafana/runtime', () => ({
  getRunRequest: () => (ds: DataSourceApi, request: DataQueryRequest) => {
    sentRequest = request;
    return runRequestMock(ds, request);
  },
  getDataSourceSrv: () => {
    return { get: getDataSourceMock };
  },
  config: {
    theme: {
      palette: {
        gray60: '#666666',
      },
    },
  },
}));

describe('SceneQueryRunner', () => {
  afterEach(() => {
    runRequestMock.mockClear();
    getDataSourceMock.mockClear();
  });

  describe('when running query', () => {
    it('should build DataQueryRequest object', async () => {
      Date.now = jest.fn(() => 1689063488000);
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A' }],
        $timeRange: new SceneTimeRange(),
      });

      queryRunner.activate();

      await new Promise((r) => setTimeout(r, 1));

      expect(sentRequest).toBeDefined();
      const { scopedVars, ...request } = sentRequest!;

      expect(Object.keys(scopedVars)).toMatchInlineSnapshot(`
        [
          "__sceneObject",
          "__interval",
          "__interval_ms",
        ]
      `);
      expect(request).toMatchInlineSnapshot(`
        {
          "app": "dashboard",
          "interval": "30s",
          "intervalMs": 30000,
          "liveStreaming": undefined,
          "maxDataPoints": 500,
          "panelId": 1,
          "range": {
            "from": "2023-07-11T02:18:08.000Z",
            "raw": {
              "from": "now-6h",
              "to": "now",
            },
            "to": "2023-07-11T08:18:08.000Z",
          },
          "rangeRaw": {
            "from": "now-6h",
            "to": "now",
          },
          "requestId": "SQR100",
          "startTime": 1689063488000,
          "targets": [
            {
              "datasource": {
                "uid": "test",
              },
              "refId": "A",
            },
          ],
          "timezone": "browser",
        }
      `);
    });
  });

  describe('when activated and got no data', () => {
    it('should run queries', async () => {
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A' }],
        $timeRange: new SceneTimeRange(),
      });

      expect(queryRunner.state.data).toBeUndefined();

      queryRunner.activate();

      await new Promise((r) => setTimeout(r, 1));

      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);
      // Default max data points
      expect(sentRequest?.maxDataPoints).toBe(500);
    });

    it('should not use containerWidth by default', async () => {
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A' }],
        $timeRange: new SceneTimeRange(),
      });

      queryRunner.setContainerWidth(100);
      queryRunner.activate();

      await new Promise((r) => setTimeout(r, 1));

      // Should not use container width
      expect(sentRequest?.maxDataPoints).toBe(500);
    });

    it('should pass scene object via scoped vars when resolving datasource and running request', async () => {
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A' }],
        $timeRange: new SceneTimeRange(),
      });

      expect(queryRunner.state.data).toBeUndefined();

      queryRunner.activate();

      await new Promise((r) => setTimeout(r, 1));

      const getDataSourceCall = getDataSourceMock.mock.calls[0];
      const runRequestCall = runRequestMock.mock.calls[0];

      expect(runRequestCall[1].scopedVars.__sceneObject).toEqual({ value: queryRunner, text: '__sceneObject' });
      expect(getDataSourceCall[1].__sceneObject).toEqual({ value: queryRunner, text: '__sceneObject' });
    });
  });

  describe('when container width changed during deactivation', () => {
    it('and container width is 0 but previously was rendered', async () => {
      const timeRange = new SceneTimeRange();
      const queryRunner = new SceneQueryRunner({
        maxDataPointsFromWidth: true,
        queries: [{ refId: 'A' }],
        $timeRange: timeRange,
      });

      expect(queryRunner.state.data).toBeUndefined();

      const deactivateQueryRunner = queryRunner.activate();
      queryRunner.setContainerWidth(1000);

      // When consumer viz is rendered with width 1000
      await new Promise((r) => setTimeout(r, 1));

      const runRequestCall1 = runRequestMock.mock.calls[0];
      // should be run with default maxDataPoints
      expect(runRequestCall1[1].maxDataPoints).toEqual(1000);
      deactivateQueryRunner();

      // When width is externally set to 0 before the consumer container has not yet rendered with expected width
      queryRunner.setContainerWidth(0);
      queryRunner.activate();

      timeRange.setState({ from: 'now-10m' });
      await new Promise((r) => setTimeout(r, 1));

      const runRequestCall2 = runRequestMock.mock.calls[1];
      expect(runRequestCall2[1].maxDataPoints).toEqual(1000);
      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);
    });
  });

  describe('when activated and maxDataPointsFromWidth set to true', () => {
    it('should run queries', async () => {
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A' }],
        $timeRange: new SceneTimeRange(),
        maxDataPointsFromWidth: true,
      });

      expect(queryRunner.state.data).toBeUndefined();

      queryRunner.activate();

      await new Promise((r) => setTimeout(r, 1));

      expect(queryRunner.state.data?.state).toBeUndefined();

      queryRunner.setContainerWidth(1000);

      expect(queryRunner.state.data?.state).toBeUndefined();

      await new Promise((r) => setTimeout(r, 1));

      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);
    });
  });

  describe('When query is using variable that is still loading', () => {
    it('Should not executed query on activate', async () => {
      const variable = new TestVariable({ name: 'A', value: '1' });
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', query: '$A' }],
      });

      const scene = new SceneFlexLayout({
        $variables: new SceneVariableSet({ variables: [variable] }),
        $timeRange: new SceneTimeRange(),
        $data: queryRunner,
        children: [],
      });

      scene.activate();

      await new Promise((r) => setTimeout(r, 1));

      expect(variable.state.loading).toBe(true);
      expect(queryRunner.state.data?.state).toBe(undefined);
    });

    it('Should not executed query on activate even when maxDataPointsFromWidth is true', async () => {
      const variable = new TestVariable({ name: 'A', value: '1' });
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', query: '$A' }],
        maxDataPointsFromWidth: true,
      });

      const scene = new SceneFlexLayout({
        $variables: new SceneVariableSet({ variables: [variable] }),
        $timeRange: new SceneTimeRange(),
        $data: queryRunner,
        children: [],
      });

      scene.activate();

      queryRunner.setContainerWidth(1000);

      await new Promise((r) => setTimeout(r, 1));

      expect(queryRunner.state.data?.state).toBe(undefined);
    });

    it('Should not executed query when time range change', async () => {
      const variable = new TestVariable({ name: 'A', value: '', query: 'A.*' });
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', query: '$A' }],
      });

      const timeRange = new SceneTimeRange();

      const scene = new SceneFlexLayout({
        $variables: new SceneVariableSet({ variables: [variable] }),
        $timeRange: timeRange,
        $data: queryRunner,
        children: [],
      });

      scene.activate();

      await new Promise((r) => setTimeout(r, 1));

      timeRange.onRefresh();

      await new Promise((r) => setTimeout(r, 1));

      expect(queryRunner.state.data?.state).toBe(undefined);
    });

    it('Should execute query when variable updates', async () => {
      const variable = new TestVariable({ name: 'A', value: '', query: 'A.*' });
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', query: '$A' }],
      });

      const timeRange = new SceneTimeRange();

      const scene = new SceneFlexLayout({
        $variables: new SceneVariableSet({ variables: [variable] }),
        $timeRange: timeRange,
        $data: queryRunner,
        children: [],
      });

      scene.activate();
      // should execute query when variable completes update
      variable.signalUpdateCompleted();
      await new Promise((r) => setTimeout(r, 1));
      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);

      variable.changeValueTo('AB');

      await new Promise((r) => setTimeout(r, 1));

      expect(runRequestMock.mock.calls.length).toBe(2);
    });

    it('Should execute query again after variable changed while inactive', async () => {
      const variable = new TestVariable({ name: 'A', value: 'AA', query: 'A.*' });
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', query: '$A' }],
      });

      const innerScene = new TestScene({
        $data: queryRunner,
      });

      const scene = new TestScene({
        $variables: new SceneVariableSet({ variables: [variable] }),
        $timeRange: new SceneTimeRange(),
        nested: innerScene,
      });

      scene.activate();
      const deactivateInnerScene = innerScene.activate();

      // should execute query when variable completes update
      variable.signalUpdateCompleted();
      await new Promise((r) => setTimeout(r, 1));
      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);

      // simulate we collapse a part of the scene where this query runner is
      deactivateInnerScene();

      variable.changeValueTo('AB');

      await new Promise((r) => setTimeout(r, 1));
      // Should not execute query
      expect(runRequestMock.mock.calls.length).toBe(1);
      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);

      // now activate again it should detect value change and issue new query
      queryRunner.activate();

      await new Promise((r) => setTimeout(r, 1));

      // Should execute query a second time
      expect(runRequestMock.mock.calls.length).toBe(2);
    });

    it('Should execute query again after variable changed while whole scene was inactive', async () => {
      const variable = new TestVariable({ name: 'A', value: 'AA', query: 'A.*' });
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', query: '$A' }],
      });

      const scene = new TestScene({
        $variables: new SceneVariableSet({ variables: [variable] }),
        $timeRange: new SceneTimeRange(),
        $data: queryRunner,
      });

      const deactivateScene = scene.activate();

      // should execute query when variable completes update
      variable.signalUpdateCompleted();
      await new Promise((r) => setTimeout(r, 1));
      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);

      // Deactivate scene which deactivates SceneVariableSet
      deactivateScene();

      // Now change value
      variable.changeValueTo('AB');
      // Allow rxjs logic time run
      await new Promise((r) => setTimeout(r, 1));
      // Should not execute query
      expect(runRequestMock.mock.calls.length).toBe(1);
      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);

      // now activate again it should detect value change and issue new query
      scene.activate();

      await new Promise((r) => setTimeout(r, 1));

      // Should execute query a second time
      expect(runRequestMock.mock.calls.length).toBe(2);
    });

    it('Should set data and loadingState to Done when there are no queries', async () => {
      const queryRunner = new SceneQueryRunner({
        queries: [],
      });

      const scene = new SceneFlexLayout({
        $timeRange: new SceneTimeRange(),
        $data: queryRunner,
        children: [],
      });

      scene.activate();

      await new Promise((r) => setTimeout(r, 1));
      expect(queryRunner.state.data?.state).toBe(LoadingState.Done);
      expect(runRequestMock.mock.calls.length).toBe(0);
    });

    it('if datasource not set check queries for datasource', async () => {
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', datasource: { uid: 'Muuu' } }],
      });

      const scene = new SceneFlexLayout({
        $timeRange: new SceneTimeRange(),
        $data: queryRunner,
        children: [],
      });

      scene.activate();

      const getDataSourceCall = getDataSourceMock.mock.calls[0];
      expect(getDataSourceCall[0]).toEqual({ uid: 'Muuu' });
    });
  });

  describe('Supporting custom runtime data source', () => {
    it('Should find and use runtime registered data source', async () => {
      const uid = 'my-custom-datasource-uid';

      registerRuntimeDataSource({ dataSource: new CustomDataSource(uid) });

      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A', datasource: { uid } }],
      });

      queryRunner.activate();
      await new Promise((r) => setTimeout(r, 1));

      expect(queryRunner.state.data?.series[0].fields[0].values.get(0)).toBe(123);
    });
  });

  describe('when time range changed while in-active', () => {
    it('It should re-issue new query', async () => {
      const timeRange = new SceneTimeRange();
      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A' }],
        $timeRange: timeRange,
      });

      expect(queryRunner.state.data).toBeUndefined();

      const deactivateQueryRunner = queryRunner.activate();

      // When consumer viz is rendered with width 1000
      await new Promise((r) => setTimeout(r, 1));
      // Should query
      expect(runRequestMock.mock.calls.length).toEqual(1);

      deactivateQueryRunner();

      timeRange.onRefresh();

      queryRunner.activate();

      await new Promise((r) => setTimeout(r, 1));

      // Should run new query
      expect(runRequestMock.mock.calls.length).toEqual(2);
    });
  });

  describe('time frame comparison', () => {
    test('should run query with time range comparison', async () => {
      const timeRange = new SceneTimeRange({
        from: '2023-08-24T05:00:00.000Z',
        to: '2023-08-24T07:00:00.000Z',
      });

      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'A' }],
      });

      const comparer = new SceneTimeRangeCompare({
        compareWith: '7d',
      });

      const scene = new EmbeddedScene({
        $timeRange: timeRange,
        $data: queryRunner,
        controls: [comparer],
        body: new SceneFlexLayout({
          children: [new SceneFlexItem({ body: new SceneCanvasText({ text: 'A' }) })],
        }),
      });

      scene.activate();
      comparer.activate();
      await new Promise((r) => setTimeout(r, 1));

      const runRequestCall = runRequestMock.mock.calls[0];
      const comaprisonRunRequestCall = runRequestMock.mock.calls[1];

      expect(runRequestMock.mock.calls.length).toEqual(2);
      expect(runRequestCall[1].range).toMatchInlineSnapshot(`
        {
          "from": "2023-08-24T05:00:00.000Z",
          "raw": {
            "from": "2023-08-24T05:00:00.000Z",
            "to": "2023-08-24T07:00:00.000Z",
          },
          "to": "2023-08-24T07:00:00.000Z",
        }
      `);

      expect(comaprisonRunRequestCall[1].range).toMatchInlineSnapshot(`
        {
          "from": "2023-08-17T05:00:00.000Z",
          "raw": {
            "from": "2023-08-17T05:00:00.000Z",
            "to": "2023-08-17T07:00:00.000Z",
          },
          "to": "2023-08-17T07:00:00.000Z",
        }
      `);
    });

    test('should perform shift query transformation', async () => {
      const timeRange = new SceneTimeRange({
        from: '2023-08-24T05:00:00.000Z',
        to: '2023-08-24T07:00:00.000Z',
      });

      const queryRunner = new SceneQueryRunner({
        queries: [{ refId: 'ComparisonQuery' }],
      });

      const comparer = new SceneTimeRangeCompare({
        compareWith: '1h',
      });

      const scene = new EmbeddedScene({
        $timeRange: timeRange,
        $data: queryRunner,
        controls: [comparer],
        body: new SceneFlexLayout({
          children: [new SceneFlexItem({ body: new SceneCanvasText({ text: 'A' }) })],
        }),
      });

      scene.activate();
      comparer.activate();
      await new Promise((r) => setTimeout(r, 1));

      expect(queryRunner.state.data?.series).toHaveLength(2);
      expect(queryRunner.state.data?.series[0].refId).toBe('A');
      expect(queryRunner.state.data?.series[1].refId).toBe('A-compare');
      expect(queryRunner.state.data?.series[0].meta).toBeUndefined();
      expect(queryRunner.state.data?.series[1].meta).toMatchInlineSnapshot(`
        {
          "timeCompare": {
            "diffMs": -3600000,
            "isTimeShiftQuery": true,
          },
        }
      `);
    });
  });

  test('enriching query request', async () => {
    const queryRunner = new SceneQueryRunner({
      queries: [{ refId: 'A' }],
      $timeRange: new SceneTimeRange(),
    });

    const outerEnricherSpy = jest.fn();
    const innerEnricherSpy = jest.fn();

    const scene = new TestSceneWithRequestEnricher({
      enricher: (s: SceneObject) => {
        outerEnricherSpy(s);
        return {
          app: 'enriched-with-app',
        };
      },
      nested: new TestSceneWithRequestEnricher({
        enricher: (s: SceneObject) => {
          innerEnricherSpy(s);
          return {
            panelId: 123,
          };
        },
        nested: new TestScene({
          $data: queryRunner,
        }),
      }),
    });
    scene.activate();
    queryRunner.activate();
    await new Promise((r) => setTimeout(r, 1));

    expect(outerEnricherSpy).toHaveBeenCalledTimes(1);
    expect(outerEnricherSpy).toHaveBeenCalledWith(queryRunner);
    expect(innerEnricherSpy).toHaveBeenCalledTimes(1);
    expect(innerEnricherSpy).toHaveBeenCalledWith(queryRunner);
    expect(sentRequest?.panelId).toBe(123);
    expect(sentRequest?.app).toBe('enriched-with-app');
  });
});

class CustomDataSource extends RuntimeDataSource {
  public constructor(uid: string) {
    super('my-custom-datasource-plugin-id', uid);
  }

  public query(options: DataQueryRequest<DataQuery>): Observable<DataQueryResponse> {
    return of({ data: [{ refId: 'A', fields: [{ name: 'time', type: FieldType.time, values: [123] }] }] });
  }
}

class TestSceneWithRequestEnricher
  extends SceneObjectBase<
    {
      nested?: SceneObject;
      enricher: (source: SceneObject) => Partial<DataQueryRequest>;
    } & SceneObjectState
  >
  implements DataRequestEnricher
{
  public enrichDataRequest(source: SceneObject) {
    return this.state.enricher(source);
  }
}
