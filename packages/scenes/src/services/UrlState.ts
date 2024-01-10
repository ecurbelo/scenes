import { Location, UnregisterCallback } from 'history';
import { isEqual } from 'lodash';

import { locationService } from '@grafana/runtime';

import { SceneObjectStateChangedEvent } from '../core/events';
import { SceneObject, SceneObjectUrlValue, SceneObjectUrlValues } from '../core/types';
import { writeSceneLog } from '../utils/writeSceneLog';
import { Unsubscribable } from 'rxjs';

// private _onStateChanged = ({ payload }: SceneObjectStateChangedEvent) => {
//   const changedObject = payload.changedObject;

//   if (changedObject.urlSync) {
//     const newUrlState = changedObject.urlSync.getUrlState();

//     const searchParams = locationService.getSearch();
//     const mappedUpdated: SceneObjectUrlValues = {};

//     this.urlKeyMapper.rebuildIndex(this._sceneRoot);

//     for (const [key, newUrlValue] of Object.entries(newUrlState)) {
//       const uniqueKey = this.urlKeyMapper.getUniqueKey(key, changedObject);
//       const currentUrlValue = searchParams.getAll(uniqueKey);

//       if (!isUrlValueEqual(currentUrlValue, newUrlValue)) {
//         mappedUpdated[uniqueKey] = newUrlValue;
//       }
//     }

//     if (Object.keys(mappedUpdated).length > 0) {
//       locationService.partial(mappedUpdated, true);
//     }
//   }
// };

// private _syncSceneStateFromUrl(sceneObject: SceneObject, urlParams: URLSearchParams) {
//   if (sceneObject.urlSync) {
//     const urlState: SceneObjectUrlValues = {};
//     const currentState = sceneObject.urlSync.getUrlState();

//     for (const key of sceneObject.urlSync.getKeys()) {
//       const uniqueKey = this.urlKeyMapper.getUniqueKey(key, sceneObject);
//       const newValue = urlParams.getAll(uniqueKey);
//       const currentValue = currentState[key];

//       if (isUrlValueEqual(newValue, currentValue)) {
//         continue;
//       }

//       if (newValue.length > 0) {
//         if (Array.isArray(currentValue)) {
//           urlState[key] = newValue;
//         } else {
//           urlState[key] = newValue[0];
//         }
//       } else {
//         // mark this key as having no url state
//         urlState[key] = null;
//       }
//     }

//     if (Object.keys(urlState).length > 0) {
//       sceneObject.urlSync.updateFromUrl(urlState);
//     }
//   }

//   sceneObject.forEachChild((child) => this._syncSceneStateFromUrl(child, urlParams));
// }

function syncSceneStateFromUrlParams(scene: SceneObject, urlParams: URLSearchParams) {}

function getUrlState(root: SceneObject): SceneObjectUrlValues {
  const urlKeyMapper = new UniqueUrlKeyMapper();
  urlKeyMapper.rebuildIndex(root);

  const result: SceneObjectUrlValues = {};

  const visitNode = (obj: SceneObject) => {
    if (obj.urlSync) {
      const newUrlState = obj.urlSync.getUrlState();

      for (const [key, value] of Object.entries(newUrlState)) {
        if (value != null) {
          const uniqueKey = urlKeyMapper.getUniqueKey(key, obj);
          result[uniqueKey] = value;
        }
      }
    }

    obj.forEachChild(visitNode);
  };

  visitNode(root);
  return result;
}

interface SceneObjectWithDepth {
  sceneObject: SceneObject;
  depth: number;
}

class UniqueUrlKeyMapper {
  private index = new Map<string, SceneObjectWithDepth[]>();

  public getUniqueKey(key: string, obj: SceneObject) {
    const objectsWithKey = this.index.get(key);
    if (!objectsWithKey) {
      throw new Error("Cannot find any scene object that uses the key '" + key + "'");
    }

    const address = objectsWithKey.findIndex((o) => o.sceneObject === obj);
    if (address > 0) {
      return `${key}-${address + 1}`;
    }

    return key;
  }

  public rebuildIndex(root: SceneObject) {
    this.index.clear();
    this.buildIndex(root, 0);
  }

  private buildIndex(sceneObject: SceneObject, depth: number) {
    if (sceneObject.urlSync) {
      for (const key of sceneObject.urlSync.getKeys()) {
        const hit = this.index.get(key);
        if (hit) {
          hit.push({ sceneObject, depth });
          hit.sort((a, b) => a.depth - b.depth);
        } else {
          this.index.set(key, [{ sceneObject, depth }]);
        }
      }
    }

    sceneObject.forEachChild((child) => this.buildIndex(child, depth + 1));
  }
}

export function isUrlValueEqual(currentUrlValue: string[], newUrlValue: SceneObjectUrlValue): boolean {
  if (currentUrlValue.length === 0 && newUrlValue == null) {
    return true;
  }

  if (!Array.isArray(newUrlValue) && currentUrlValue?.length === 1) {
    return newUrlValue === currentUrlValue[0];
  }

  if (newUrlValue?.length === 0 && currentUrlValue === null) {
    return true;
  }

  // We have two arrays, lets compare them
  return isEqual(currentUrlValue, newUrlValue);
}
