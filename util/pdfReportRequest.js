function templateStorage(type, period, users_count, archive_depth, currencyPerMonth, currencyTotal) {
  return [
    {
      'text': [
        {
          'text': [
            {
              'text' : 'Стоимость услуги с использованием диска HDD на ',
              'style': 'bold'
            },
            {
              'text' : period,
              'style': 'bold'
            },
            {
              'text' : ' мес. для ',
              'style': 'bold'
            },
            {
              'text' : users_count,
              'style': 'bold'
            },
            {
              'text' : ' пользователей и ',
              'style': 'bold'
            },
            {
              'text' : archive_depth,
              'style': 'bold'
            },
            {
              'text' : ' месяцами хранения данных',
              'style': 'bold'
            }
          ]
        },
        '\n\n',
        {
          'text': [
            {
              'text': [
                {
                  'text'     : 'С ежемесячной абонентской платой ',
                  'alignment': 'right',
                  'style'    : 'colorBlue'
                },
                {
                  'text' : [
                    {
                      'text' : currencyPerMonth,
                      'style': 'colorBlue'
                    },
                    {
                      'text' : ' рублей.',
                      'style': 'colorBlue'
                    }
                  ],
                  'color': '#2F75B5'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      'text'     : `${ currencyTotal } ₽`,
      'bold'     : true,
      'alignment': 'right',
      'margin'   : [0, 25, 0, 0]
    }
  ];
}

module.exports = function templateReport(data) {
  const templateStorages = [];
  if (data.type_storage.includes('hdd')) {
    templateStorages.push(templateStorage('HDD', data.period_service, data.users_count, data.archive_depth, data.cost_service_hdd_per_month, data.cost_service_hdd));
  }
  if (data.type_storage.includes('ssd')) {
    templateStorages.push(templateStorage('SSD', data.period_service, data.users_count, data.archive_depth, data.cost_service_ssd_per_month, data.cost_service_ssd));
  }
  const template = {
    'content': [
      {
        'style': 'tbl',
        'table': {
          'widths': [
            '*',
            140
          ],
          'body'  : [
            [
              {
                'text'     : 'Уважаемый клиент! Предложение действительно до',
                'bold'     : true,
                'alignment': 'center',
                'border'   : [
                  true,
                  true,
                  false,
                  true
                ]
              },
              {
                'text'     : data.offer_until_date,
                'bold'     : true,
                'alignment': 'center',
                'border'   : [
                  false,
                  true,
                  true,
                  true
                ]
              }
            ]
          ]
        }
      },
      'Расчёт стоимости решения Офисный контроль',
      {
        'table': {
          'widths': ['*', 140],
          'body'  : [
            [
              {
                'text': 'Название компании'
              },
              {
                'text'     : data.company_name,
                'alignment': 'right'
              }
            ],
            [
              {
                'text': 'ИНН'
              },
              {
                'text'     : data.tin,
                'alignment': 'right'
              }
            ],
            [
              {
                'text': 'Город'
              },
              {
                'text'     : data.city_name,
                'alignment': 'right'
              }
            ],
            [
              {
                'text': 'Количество пользователей'
              },
              {
                'text'     : data.users_count,
                'alignment': 'right'
              }
            ],
            [
              {
                'text': 'Дата оформления'
              },
              {
                'text'     : data.create_at,
                'alignment': 'right'
              }
            ]
          ]
        }
      },
      '\n',
      {
        'table': {
          'widths': ['*'],
          'body'  : [
            [
              'Решение "Офисный контроль" возможно реализовать облаке:'
            ],
            [
              {
                'text': [
                  {
                    'text': 'Облачное',
                    'bold': true
                  },
                  ' - решение размещается в облаке ЭРТХ.',
                  'Заказчик устанавливает только клиентскую часть (агента) на свои компьютеры, которые по сети интернет соединяются с сервером.',
                  'Управление и настройка решением осуществляется удаленно, через веб-интерфейс. Сопровождение и поддержка осуществляются силами сотрудников ЭРТХ.',
                  '\n\n',
                  {
                    'text': 'HDD диск',
                    'bold': true
                  },
                  ' – средняя производительность системы ограничивается скоростью работы диска, рекомендуется применять до 50 пользователей.',
                  ' Скорость работы диска влияет на скорость работы системы - при большом количестве поступаемых событий возможно падение скорости отклика системы (в web-интерфейсе) на действия администратора.',
                  '\n',
                  {
                    'text': 'SSD диск',
                    'bold': true
                  },
                  ' – максимальная производительность системы, рекомендуется применять от 50 пользователей.',
                  ' Скорость работы SSD дисков, позволяет снизить время отклика системы и повысить ее быстродействие'
                ]
              }
            ]
          ]
        }
      },
      '\n',
      {
        'text': 'Облачное решение:',
        'bold': true
      },
      {
        'table': {
          'widths': ['*', 140],
          'body'  : [
            ...templateStorages,
            [
              {
                'colSpan': 2,
                'stack'  : [
                  {
                    'text'   : 'В стоимость входит:',
                    'italics': true
                  },
                  {
                    'italics': true,
                    'ul'     : [
                      'Серверные ресурсы в облаке ЭРТХ для функционирования решения',
                      'Система хранения данных в облаке ЭРТХ',
                      'Техническая поддержка и сопровождение ЭРТХ 24х7',
                      'Высокий SLA',
                      'База знаний по продукту',
                      'Преднастроенное решение'
                    ]
                  }
                ]
              }
            ]
          ]
        }
      }
    ],
    'styles' : {
      'bold'     : {
        'bold': true
      },
      'colorBlue': {
        'color': '#2F75B5'
      },
      'tbl'      : {
        'margin': [0, 0, 0, 20]
      }
    }
  };

  return template;
}
