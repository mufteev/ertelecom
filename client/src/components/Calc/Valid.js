import { digitValidate, isNullOrWhiteSpace, tinValidate } from '../../util/validation';

export class Valid {
  static getMissedFields(data) {
    const missedFields = [
      isNullOrWhiteSpace(data.company_name) ? 'Название компании' : '',
      !tinValidate(data.company_tin) ? 'ИНН' : '',
      data.city === null ? 'Город клиента' : '',
      data.type_provision === null ? 'Какая услуга интересна' : '',
      digitValidate(data.users_count, 1, 250) ? 'Количество пользователей' : '',
      data.archive_depth === null ? 'Количество месяцев хранения данных' : '',
      data.type_storage === null ? 'Тип жёсткого диска' : '',
      digitValidate(data.period_service, 1) ? 'Период пользования услугой' : ''
    ];
    return missedFields.filter(x => x.length > 0);
  }

  static validCompanyName(s) {
    return isNullOrWhiteSpace(s) ? 'Введите название компании' : null;
  }

  static validCompanyTin(s) {
    return !tinValidate(s) ? 'ИНН не верное' : null
  }

  static validUsersCount(s) {
    return digitValidate(s, 1, 250);
  }

  static validPeriodService(s) {
    return digitValidate(s, 1)
  }
}
