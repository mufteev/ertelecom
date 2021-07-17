import { getJsonAsync, postJsonAsync } from '../../util/request';

export default class Network {
  static saveHistoryAsync(data) {
    return postJsonAsync('/api/history/save', data);
  }

  static sendCalculationAsync(data) {
    return postJsonAsync('/api/calc/calculating', data);
  }

  static loadDirectoriesAsync() {
      return getJsonAsync('/api/calc/get_directory_info');
  }

  static searchCitiesAsync(search) {
    return getJsonAsync(`/api/calc/get_cities_search?s=${ search }`);
  }
}
