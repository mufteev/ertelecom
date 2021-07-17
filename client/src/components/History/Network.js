import { postJsonAsync } from '../../util/request';

export default class Network {
  static searchAsync(data) {
    return postJsonAsync('/api/history/search', data);
  }
}
