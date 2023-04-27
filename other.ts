import { setData } from './dataStore';
import { Data } from './interface';

/**
 * Resets the internal data of the application to its
 * inital state.
 *
 * @param {{}}
 *
 * @returns {{}}
 */
function clearV1() {
  const newData: Data = {
    globalOwnersId: [],
    users: [],
    channels: [],
    messages: [],
    dms: [],
  };
  setData(newData);
  return {};
}

export { clearV1 };
