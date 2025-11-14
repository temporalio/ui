import { startOfDay } from 'date-fns';
import * as dateTz from 'date-fns-tz';

import { persistStore } from '$lib/stores/persist-store';
import { getLocalTimezone } from '$lib/utilities/format-date';

type TimeFormatTypes = 'relative' | 'absolute';

export const timestampFormats = {
  short: 'do MMM yyyy H:mm:ss.SS',
  medium: 'yyyy-MM-dd z HH:mm:ss.SS',
  long: 'MMMM do yyyy, hh:mm:ss.SS a z',
  abbreviated: 'yyyy-MM-dd HH:mm:ss a',
  abbreviatedWithoutSeconds: 'yyyy-MM-dd HH:mm a',
} as const;

export type TimestampFormat = keyof typeof timestampFormats;
export const timestampFormat = persistStore<TimestampFormat>(
  'timestampFormat',
  'medium',
);

export const TIME_UNIT_OPTIONS = ['minutes', 'hours', 'days'];

export const timeFormat = persistStore('timeFormat', 'UTC' as TimeFormat);
export const timeFormatType = persistStore(
  'timeFormatType',
  'relative' as TimeFormatTypes,
);

export const relativeTime = persistStore('relativeTime', false);
export const relativeTimeDuration = persistStore('relativeTimeDuration', '');
export const relativeTimeUnit = persistStore(
  'relativeTimeUnit',
  TIME_UNIT_OPTIONS[0],
);

export const startDate = persistStore('startDate', startOfDay(new Date()));
export const startHour = persistStore('startHour', '');
export const startMinute = persistStore('startMinute', '');
export const startSecond = persistStore('startSecond', '');

export const endDate = persistStore('endDate', startOfDay(new Date()));
export const endHour = persistStore('endHour', '');
export const endMinute = persistStore('endMinute', '');
export const endSecond = persistStore('endSecond', '');

export type TimeFormat = keyof typeof Timezones | 'UTC' | 'local';

type TimeFormatOption = {
  label: string;
  value: TimeFormat;
  abbr?: string;
  offset?: number;
  zones?: string[];
};

export type TimeFormatOptions = TimeFormatOption[];

// Use this snippet to generate the Timezones object
// import { enUS } from 'date-fns/locale';
// import { utcToZonedTime, getTimezoneOffset, format } from 'date-fns-tz';
// const generateTimezoneOptions = () => {
//   const timeZones = Intl.supportedValuesOf('timeZone');
//   return timeZones.reduce((acc, timeZone) => {
//     const zonedTime = utcToZonedTime(new Date(), timeZone);
//     const zoneString = format(zonedTime, 'zzzz', {
//       timeZone,
//       locale: enUS,
//     });
//     if (acc[zoneString]) {
//       acc[zoneString].zones.push(timeZone);
//     } else {
//       const zoneAbbr = format(zonedTime, 'z', {
//         timeZone,
//         locale: enUS,
//       });
//       const offset = Math.floor(
//         (getTimezoneOffset(timeZone) / (1000 * 60 * 60)) % 24,
//       );
//       acc[zoneString] = {
//         abbr: zoneAbbr,
//         offset,
//         zones: [timeZone],
//       };
//     }
//     return acc;
//   }, {});
// };

export const Timezones = {
  'Greenwich Mean Time': {
    abbr: 'GMT',
    offset: 0,
    zones: [
      'Africa/Abidjan',
      'Africa/Accra',
      'Africa/Bamako',
      'Africa/Banjul',
      'Africa/Bissau',
      'Africa/Conakry',
      'Africa/Dakar',
      'Africa/Freetown',
      'Africa/Lome',
      'Africa/Monrovia',
      'Africa/Nouakchott',
      'Africa/Ouagadougou',
      'Africa/Sao_Tome',
      'America/Danmarkshavn',
      'Atlantic/Reykjavik',
      'Atlantic/St_Helena',
    ],
  },
  'East Africa Time': {
    abbr: 'GMT+3',
    offset: 3,
    zones: [
      'Africa/Addis_Ababa',
      'Africa/Asmera',
      'Africa/Dar_es_Salaam',
      'Africa/Djibouti',
      'Africa/Kampala',
      'Africa/Mogadishu',
      'Africa/Nairobi',
      'Indian/Antananarivo',
      'Indian/Comoro',
      'Indian/Mayotte',
    ],
  },
  'Central European Standard Time': {
    abbr: 'GMT+1',
    offset: 1,
    zones: ['Africa/Algiers', 'Africa/Tunis'],
  },
  'West Africa Standard Time': {
    abbr: 'GMT+1',
    offset: 1,
    zones: [
      'Africa/Bangui',
      'Africa/Brazzaville',
      'Africa/Douala',
      'Africa/Kinshasa',
      'Africa/Lagos',
      'Africa/Libreville',
      'Africa/Luanda',
      'Africa/Malabo',
      'Africa/Ndjamena',
      'Africa/Niamey',
      'Africa/Porto-Novo',
    ],
  },
  'Central Africa Time': {
    abbr: 'GMT+2',
    offset: 2,
    zones: [
      'Africa/Blantyre',
      'Africa/Bujumbura',
      'Africa/Gaborone',
      'Africa/Harare',
      'Africa/Juba',
      'Africa/Khartoum',
      'Africa/Kigali',
      'Africa/Lubumbashi',
      'Africa/Lusaka',
      'Africa/Maputo',
      'Africa/Windhoek',
    ],
  },
  'Eastern European Summer Time': {
    abbr: 'GMT+3',
    offset: 3,
    zones: [
      'Africa/Cairo',
      'Asia/Beirut',
      'Asia/Gaza',
      'Asia/Hebron',
      'Asia/Nicosia',
      'Europe/Athens',
      'Europe/Bucharest',
      'Europe/Chisinau',
      'Europe/Helsinki',
      'Europe/Kiev',
      'Europe/Mariehamn',
      'Europe/Riga',
      'Europe/Sofia',
      'Europe/Tallinn',
      'Europe/Uzhgorod',
      'Europe/Vilnius',
      'Europe/Zaporozhye',
    ],
  },
  'GMT+01:00': {
    abbr: 'GMT+1',
    offset: 1,
    zones: [
      'Africa/Casablanca',
      'Africa/El_Aaiun',
      'Europe/Guernsey',
      'Europe/Isle_of_Man',
      'Europe/Jersey',
    ],
  },
  'Central European Summer Time': {
    abbr: 'GMT+2',
    offset: 2,
    zones: [
      'Africa/Ceuta',
      'Arctic/Longyearbyen',
      'Europe/Amsterdam',
      'Europe/Andorra',
      'Europe/Belgrade',
      'Europe/Berlin',
      'Europe/Bratislava',
      'Europe/Brussels',
      'Europe/Budapest',
      'Europe/Busingen',
      'Europe/Copenhagen',
      'Europe/Gibraltar',
      'Europe/Ljubljana',
      'Europe/Luxembourg',
      'Europe/Madrid',
      'Europe/Malta',
      'Europe/Monaco',
      'Europe/Oslo',
      'Europe/Paris',
      'Europe/Podgorica',
      'Europe/Prague',
      'Europe/Rome',
      'Europe/San_Marino',
      'Europe/Sarajevo',
      'Europe/Skopje',
      'Europe/Stockholm',
      'Europe/Tirane',
      'Europe/Vaduz',
      'Europe/Vatican',
      'Europe/Vienna',
      'Europe/Warsaw',
      'Europe/Zagreb',
      'Europe/Zurich',
    ],
  },
  'South Africa Standard Time': {
    abbr: 'GMT+2',
    offset: 2,
    zones: ['Africa/Johannesburg', 'Africa/Maseru', 'Africa/Mbabane'],
  },
  'Eastern European Standard Time': {
    abbr: 'GMT+2',
    offset: 2,
    zones: ['Africa/Tripoli', 'Europe/Kaliningrad'],
  },
  'Hawaii-Aleutian Daylight Time': {
    abbr: 'HADT',
    offset: -9,
    zones: ['America/Adak'],
  },
  'Alaska Daylight Time': {
    abbr: 'AKDT',
    offset: -8,
    zones: [
      'America/Anchorage',
      'America/Juneau',
      'America/Metlakatla',
      'America/Nome',
      'America/Sitka',
      'America/Yakutat',
    ],
  },
  'Atlantic Standard Time': {
    abbr: 'AST',
    offset: -4,
    zones: [
      'America/Anguilla',
      'America/Antigua',
      'America/Aruba',
      'America/Barbados',
      'America/Blanc-Sablon',
      'America/Curacao',
      'America/Dominica',
      'America/Grenada',
      'America/Guadeloupe',
      'America/Kralendijk',
      'America/Lower_Princes',
      'America/Marigot',
      'America/Martinique',
      'America/Montserrat',
      'America/Port_of_Spain',
      'America/Puerto_Rico',
      'America/Santo_Domingo',
      'America/St_Barthelemy',
      'America/St_Kitts',
      'America/St_Lucia',
      'America/St_Thomas',
      'America/St_Vincent',
      'America/Tortola',
    ],
  },
  'Brasilia Standard Time': {
    abbr: 'GMT-3',
    offset: -3,
    zones: [
      'America/Araguaina',
      'America/Bahia',
      'America/Belem',
      'America/Fortaleza',
      'America/Maceio',
      'America/Recife',
      'America/Santarem',
      'America/Sao_Paulo',
    ],
  },
  'Argentina Standard Time': {
    abbr: 'GMT-3',
    offset: -3,
    zones: [
      'America/Argentina/La_Rioja',
      'America/Argentina/Rio_Gallegos',
      'America/Argentina/Salta',
      'America/Argentina/San_Juan',
      'America/Argentina/San_Luis',
      'America/Argentina/Tucuman',
      'America/Argentina/Ushuaia',
      'America/Buenos_Aires',
      'America/Catamarca',
      'America/Cordoba',
      'America/Jujuy',
      'America/Mendoza',
    ],
  },
  'Paraguay Standard Time': {
    abbr: 'GMT-4',
    offset: -4,
    zones: ['America/Asuncion'],
  },
  'Central Standard Time': {
    abbr: 'CST',
    offset: -6,
    zones: [
      'America/Bahia_Banderas',
      'America/Belize',
      'America/Chihuahua',
      'America/Costa_Rica',
      'America/El_Salvador',
      'America/Guatemala',
      'America/Managua',
      'America/Merida',
      'America/Mexico_City',
      'America/Monterrey',
      'America/Regina',
      'America/Swift_Current',
      'America/Tegucigalpa',
    ],
  },
  'Amazon Standard Time': {
    abbr: 'GMT-4',
    offset: -4,
    zones: [
      'America/Boa_Vista',
      'America/Campo_Grande',
      'America/Cuiaba',
      'America/Manaus',
      'America/Porto_Velho',
    ],
  },
  'Colombia Standard Time': {
    abbr: 'GMT-5',
    offset: -5,
    zones: ['America/Bogota'],
  },
  'Mountain Daylight Time': {
    abbr: 'MDT',
    offset: -6,
    zones: [
      'America/Boise',
      'America/Cambridge_Bay',
      'America/Ciudad_Juarez',
      'America/Denver',
      'America/Edmonton',
      'America/Inuvik',
      'America/Yellowknife',
    ],
  },
  'Eastern Standard Time': {
    abbr: 'EST',
    offset: -5,
    zones: [
      'America/Cancun',
      'America/Cayman',
      'America/Coral_Harbour',
      'America/Jamaica',
      'America/Panama',
    ],
  },
  'Venezuela Time': {
    abbr: 'GMT-4',
    offset: -4,
    zones: ['America/Caracas'],
  },
  'French Guiana Time': {
    abbr: 'GMT-3',
    offset: -3,
    zones: ['America/Cayenne'],
  },
  'Central Daylight Time': {
    abbr: 'CDT',
    offset: -5,
    zones: [
      'America/Chicago',
      'America/Indiana/Knox',
      'America/Indiana/Tell_City',
      'America/Matamoros',
      'America/Menominee',
      'America/North_Dakota/Beulah',
      'America/North_Dakota/Center',
      'America/North_Dakota/New_Salem',
      'America/Ojinaga',
      'America/Rainy_River',
      'America/Rankin_Inlet',
      'America/Resolute',
      'America/Winnipeg',
    ],
  },
  'Mountain Standard Time': {
    abbr: 'MST',
    offset: -7,
    zones: [
      'America/Creston',
      'America/Dawson_Creek',
      'America/Fort_Nelson',
      'America/Phoenix',
    ],
  },
  'Yukon Time': {
    abbr: 'GMT-7',
    offset: -7,
    zones: ['America/Dawson', 'America/Whitehorse'],
  },
  'Eastern Daylight Time': {
    abbr: 'EDT',
    offset: -4,
    zones: [
      'America/Detroit',
      'America/Grand_Turk',
      'America/Indiana/Marengo',
      'America/Indiana/Petersburg',
      'America/Indiana/Vevay',
      'America/Indiana/Vincennes',
      'America/Indiana/Winamac',
      'America/Indianapolis',
      'America/Iqaluit',
      'America/Kentucky/Monticello',
      'America/Louisville',
      'America/Nassau',
      'America/New_York',
      'America/Nipigon',
      'America/Pangnirtung',
      'America/Port-au-Prince',
      'America/Thunder_Bay',
      'America/Toronto',
    ],
  },
  'Acre Standard Time': {
    abbr: 'GMT-5',
    offset: -5,
    zones: ['America/Eirunepe', 'America/Rio_Branco'],
  },
  'Atlantic Daylight Time': {
    abbr: 'ADT',
    offset: -3,
    zones: [
      'America/Glace_Bay',
      'America/Goose_Bay',
      'America/Halifax',
      'America/Moncton',
      'America/Thule',
      'Atlantic/Bermuda',
    ],
  },
  'West Greenland Summer Time': {
    abbr: 'GMT-2',
    offset: -2,
    zones: ['America/Godthab'],
  },
  'Ecuador Time': {
    abbr: 'GMT-5',
    offset: -5,
    zones: ['America/Guayaquil'],
  },
  'Guyana Time': {
    abbr: 'GMT-4',
    offset: -4,
    zones: ['America/Guyana'],
  },
  'Cuba Daylight Time': {
    abbr: 'GMT-4',
    offset: -4,
    zones: ['America/Havana'],
  },
  'Mexican Pacific Standard Time': {
    abbr: 'GMT-7',
    offset: -7,
    zones: ['America/Hermosillo', 'America/Mazatlan'],
  },
  'Bolivia Time': {
    abbr: 'GMT-4',
    offset: -4,
    zones: ['America/La_Paz'],
  },
  'Peru Standard Time': {
    abbr: 'GMT-5',
    offset: -5,
    zones: ['America/Lima'],
  },
  'Pacific Daylight Time': {
    abbr: 'PDT',
    offset: -7,
    zones: ['America/Los_Angeles', 'America/Tijuana', 'America/Vancouver'],
  },
  'St. Pierre & Miquelon Daylight Time': {
    abbr: 'GMT-2',
    offset: -2,
    zones: ['America/Miquelon'],
  },
  'Uruguay Standard Time': {
    abbr: 'GMT-3',
    offset: -3,
    zones: ['America/Montevideo'],
  },
  'GMT-04:00': {
    abbr: 'GMT-4',
    offset: -4,
    zones: ['America/Montreal'],
  },
  'Fernando de Noronha Standard Time': {
    abbr: 'GMT-2',
    offset: -2,
    zones: ['America/Noronha'],
  },
  'Suriname Time': {
    abbr: 'GMT-3',
    offset: -3,
    zones: ['America/Paramaribo'],
  },
  'GMT-03:00': {
    abbr: 'GMT-3',
    offset: -3,
    zones: ['America/Punta_Arenas', 'Antarctica/Palmer'],
  },
  'Northwest Mexico Daylight Time': {
    abbr: 'GMT-7',
    offset: -7,
    zones: ['America/Santa_Isabel'],
  },
  'Chile Standard Time': {
    abbr: 'GMT-4',
    offset: -4,
    zones: ['America/Santiago'],
  },
  'East Greenland Summer Time': {
    abbr: 'GMT',
    offset: 0,
    zones: ['America/Scoresbysund'],
  },
  'Newfoundland Daylight Time': {
    abbr: 'GMT-2:30',
    offset: -3,
    zones: ['America/St_Johns'],
  },
  'Casey Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Antarctica/Casey'],
  },
  'Davis Time': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Antarctica/Davis'],
  },
  'Dumont-d’Urville Time': {
    abbr: 'GMT+10',
    offset: 10,
    zones: ['Antarctica/DumontDUrville'],
  },
  'Australian Eastern Standard Time': {
    abbr: 'GMT+10',
    offset: 10,
    zones: [
      'Antarctica/Macquarie',
      'Australia/Brisbane',
      'Australia/Currie',
      'Australia/Hobart',
      'Australia/Lindeman',
      'Australia/Melbourne',
      'Australia/Sydney',
    ],
  },
  'Mawson Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Antarctica/Mawson'],
  },
  'New Zealand Standard Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Antarctica/McMurdo', 'Pacific/Auckland'],
  },
  'Rothera Time': {
    abbr: 'GMT-3',
    offset: -3,
    zones: ['Antarctica/Rothera'],
  },
  'Syowa Time': {
    abbr: 'GMT+3',
    offset: 3,
    zones: ['Antarctica/Syowa'],
  },
  'GMT+02:00': {
    abbr: 'GMT+2',
    offset: 2,
    zones: ['Antarctica/Troll'],
  },
  'Vostok Time': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Antarctica/Vostok'],
  },
  'Arabian Standard Time': {
    abbr: 'GMT+3',
    offset: 3,
    zones: [
      'Asia/Aden',
      'Asia/Baghdad',
      'Asia/Bahrain',
      'Asia/Kuwait',
      'Asia/Qatar',
      'Asia/Riyadh',
    ],
  },
  'East Kazakhstan Time': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Asia/Almaty', 'Asia/Qostanay'],
  },
  'GMT+03:00': {
    abbr: 'GMT+3',
    offset: 3,
    zones: [
      'Asia/Amman',
      'Asia/Damascus',
      'Asia/Famagusta',
      'Europe/Istanbul',
      'Europe/Kirov',
    ],
  },
  'Anadyr Standard Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Asia/Anadyr'],
  },
  'West Kazakhstan Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: [
      'Asia/Aqtau',
      'Asia/Aqtobe',
      'Asia/Atyrau',
      'Asia/Oral',
      'Asia/Qyzylorda',
    ],
  },
  'Turkmenistan Standard Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Asia/Ashgabat'],
  },
  'Azerbaijan Standard Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Asia/Baku'],
  },
  'Indochina Time': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Asia/Bangkok', 'Asia/Phnom_Penh', 'Asia/Saigon', 'Asia/Vientiane'],
  },
  'GMT+07:00': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Asia/Barnaul', 'Asia/Tomsk'],
  },
  'Kyrgyzstan Time': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Asia/Bishkek'],
  },
  'Brunei Darussalam Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Brunei'],
  },
  'India Standard Time': {
    abbr: 'GMT+5:30',
    offset: 5,
    zones: ['Asia/Calcutta', 'Asia/Colombo'],
  },
  'Yakutsk Standard Time': {
    abbr: 'GMT+9',
    offset: 9,
    zones: ['Asia/Chita', 'Asia/Khandyga', 'Asia/Yakutsk'],
  },
  'Ulaanbaatar Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Choibalsan', 'Asia/Ulaanbaatar'],
  },
  'Bangladesh Standard Time': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Asia/Dhaka'],
  },
  'East Timor Time': {
    abbr: 'GMT+9',
    offset: 9,
    zones: ['Asia/Dili'],
  },
  'Gulf Standard Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Asia/Dubai', 'Asia/Muscat'],
  },
  'Tajikistan Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Asia/Dushanbe'],
  },
  'Hong Kong Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Hong_Kong'],
  },
  'Hovd Standard Time': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Asia/Hovd'],
  },
  'Irkutsk Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Irkutsk'],
  },
  'Western Indonesia Time': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Asia/Jakarta', 'Asia/Pontianak'],
  },
  'Eastern Indonesia Time': {
    abbr: 'GMT+9',
    offset: 9,
    zones: ['Asia/Jayapura'],
  },
  'Israel Daylight Time': {
    abbr: 'GMT+3',
    offset: 3,
    zones: ['Asia/Jerusalem'],
  },
  'Afghanistan Time': {
    abbr: 'GMT+4:30',
    offset: 4,
    zones: ['Asia/Kabul'],
  },
  'Petropavlovsk-Kamchatski Standard Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Asia/Kamchatka'],
  },
  'Pakistan Standard Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Asia/Karachi'],
  },
  'Nepal Time': {
    abbr: 'GMT+5:45',
    offset: 5,
    zones: ['Asia/Katmandu'],
  },
  'Krasnoyarsk Standard Time': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Asia/Krasnoyarsk', 'Asia/Novokuznetsk'],
  },
  'Malaysia Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Kuala_Lumpur', 'Asia/Kuching'],
  },
  'China Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Macau', 'Asia/Shanghai'],
  },
  'Magadan Standard Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Asia/Magadan'],
  },
  'Central Indonesia Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Makassar'],
  },
  'Philippine Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Manila'],
  },
  'Novosibirsk Standard Time': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Asia/Novosibirsk'],
  },
  'Omsk Standard Time': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Asia/Omsk'],
  },
  'Korean Standard Time': {
    abbr: 'GMT+9',
    offset: 9,
    zones: ['Asia/Pyongyang', 'Asia/Seoul'],
  },
  'Myanmar Time': {
    abbr: 'GMT+6:30',
    offset: 6,
    zones: ['Asia/Rangoon'],
  },
  'Sakhalin Standard Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Asia/Sakhalin'],
  },
  'Uzbekistan Standard Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Asia/Samarkand', 'Asia/Tashkent'],
  },
  'Singapore Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Singapore'],
  },
  'GMT+11:00': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Asia/Srednekolymsk', 'Pacific/Bougainville'],
  },
  'Taipei Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Asia/Taipei'],
  },
  'Georgia Standard Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Asia/Tbilisi'],
  },
  'Iran Standard Time': {
    abbr: 'GMT+3:30',
    offset: 3,
    zones: ['Asia/Tehran'],
  },
  'Bhutan Time': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Asia/Thimphu'],
  },
  'Japan Standard Time': {
    abbr: 'GMT+9',
    offset: 9,
    zones: ['Asia/Tokyo'],
  },
  'GMT+06:00': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Asia/Urumqi'],
  },
  'Vladivostok Standard Time': {
    abbr: 'GMT+10',
    offset: 10,
    zones: ['Asia/Ust-Nera', 'Asia/Vladivostok'],
  },
  'Yekaterinburg Standard Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Asia/Yekaterinburg'],
  },
  'Armenia Standard Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Asia/Yerevan'],
  },
  'Azores Summer Time': {
    abbr: 'GMT',
    offset: 0,
    zones: ['Atlantic/Azores'],
  },
  'Western European Summer Time': {
    abbr: 'GMT+1',
    offset: 1,
    zones: [
      'Atlantic/Canary',
      'Atlantic/Faeroe',
      'Atlantic/Madeira',
      'Europe/Lisbon',
    ],
  },
  'Cape Verde Standard Time': {
    abbr: 'GMT-1',
    offset: -1,
    zones: ['Atlantic/Cape_Verde'],
  },
  'South Georgia Time': {
    abbr: 'GMT-2',
    offset: -2,
    zones: ['Atlantic/South_Georgia'],
  },
  'Falkland Islands Standard Time': {
    abbr: 'GMT-3',
    offset: -3,
    zones: ['Atlantic/Stanley'],
  },
  'Australian Central Standard Time': {
    abbr: 'GMT+9:30',
    offset: 9,
    zones: ['Australia/Adelaide', 'Australia/Broken_Hill', 'Australia/Darwin'],
  },
  'Australian Central Western Standard Time': {
    abbr: 'GMT+8:45',
    offset: 8,
    zones: ['Australia/Eucla'],
  },
  'Lord Howe Standard Time': {
    abbr: 'GMT+10:30',
    offset: 10,
    zones: ['Australia/Lord_Howe'],
  },
  'Australian Western Standard Time': {
    abbr: 'GMT+8',
    offset: 8,
    zones: ['Australia/Perth'],
  },
  'GMT+04:00': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Europe/Astrakhan', 'Europe/Saratov', 'Europe/Ulyanovsk'],
  },
  'Irish Standard Time': {
    abbr: 'GMT+1',
    offset: 1,
    zones: ['Europe/Dublin'],
  },
  'British Summer Time': {
    abbr: 'GMT+1',
    offset: 1,
    zones: ['Europe/London'],
  },
  'Moscow Standard Time': {
    abbr: 'GMT+3',
    offset: 3,
    zones: ['Europe/Minsk', 'Europe/Moscow', 'Europe/Simferopol'],
  },
  'Samara Standard Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Europe/Samara'],
  },
  'Volgograd Standard Time': {
    abbr: 'GMT+3',
    offset: 3,
    zones: ['Europe/Volgograd'],
  },
  'Indian Ocean Time': {
    abbr: 'GMT+6',
    offset: 6,
    zones: ['Indian/Chagos'],
  },
  'Christmas Island Time': {
    abbr: 'GMT+7',
    offset: 7,
    zones: ['Indian/Christmas'],
  },
  'Cocos Islands Time': {
    abbr: 'GMT+6:30',
    offset: 6,
    zones: ['Indian/Cocos'],
  },
  'French Southern & Antarctic Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Indian/Kerguelen'],
  },
  'Seychelles Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Indian/Mahe'],
  },
  'Maldives Time': {
    abbr: 'GMT+5',
    offset: 5,
    zones: ['Indian/Maldives'],
  },
  'Mauritius Standard Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Indian/Mauritius'],
  },
  'Réunion Time': {
    abbr: 'GMT+4',
    offset: 4,
    zones: ['Indian/Reunion'],
  },
  'Apia Standard Time': {
    abbr: 'GMT+13',
    offset: 13,
    zones: ['Pacific/Apia'],
  },
  'Chatham Standard Time': {
    abbr: 'GMT+12:45',
    offset: 12,
    zones: ['Pacific/Chatham'],
  },
  'Easter Island Standard Time': {
    abbr: 'GMT-6',
    offset: -6,
    zones: ['Pacific/Easter'],
  },
  'Vanuatu Standard Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Pacific/Efate'],
  },
  'Phoenix Islands Time': {
    abbr: 'GMT+13',
    offset: 13,
    zones: ['Pacific/Enderbury'],
  },
  'Tokelau Time': {
    abbr: 'GMT+13',
    offset: 13,
    zones: ['Pacific/Fakaofo'],
  },
  'Fiji Standard Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Pacific/Fiji'],
  },
  'Tuvalu Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Pacific/Funafuti'],
  },
  'Galapagos Time': {
    abbr: 'GMT-6',
    offset: -6,
    zones: ['Pacific/Galapagos'],
  },
  'Gambier Time': {
    abbr: 'GMT-9',
    offset: -9,
    zones: ['Pacific/Gambier'],
  },
  'Solomon Islands Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Pacific/Guadalcanal'],
  },
  'Chamorro Standard Time': {
    abbr: 'GMT+10',
    offset: 10,
    zones: ['Pacific/Guam', 'Pacific/Saipan'],
  },
  'Hawaii-Aleutian Standard Time': {
    abbr: 'HST',
    offset: -10,
    zones: ['Pacific/Honolulu', 'Pacific/Johnston'],
  },
  'Line Islands Time': {
    abbr: 'GMT+14',
    offset: 14,
    zones: ['Pacific/Kiritimati'],
  },
  'Kosrae Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Pacific/Kosrae'],
  },
  'Marshall Islands Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Pacific/Kwajalein', 'Pacific/Majuro'],
  },
  'Marquesas Time': {
    abbr: 'GMT-9:30',
    offset: -10,
    zones: ['Pacific/Marquesas'],
  },
  'Samoa Standard Time': {
    abbr: 'GMT-11',
    offset: -11,
    zones: ['Pacific/Midway', 'Pacific/Pago_Pago'],
  },
  'Nauru Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Pacific/Nauru'],
  },
  'Niue Time': {
    abbr: 'GMT-11',
    offset: -11,
    zones: ['Pacific/Niue'],
  },
  'Norfolk Island Standard Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Pacific/Norfolk'],
  },
  'New Caledonia Standard Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Pacific/Noumea'],
  },
  'Palau Time': {
    abbr: 'GMT+9',
    offset: 9,
    zones: ['Pacific/Palau'],
  },
  'Pitcairn Time': {
    abbr: 'GMT-8',
    offset: -8,
    zones: ['Pacific/Pitcairn'],
  },
  'Ponape Time': {
    abbr: 'GMT+11',
    offset: 11,
    zones: ['Pacific/Ponape'],
  },
  'Papua New Guinea Time': {
    abbr: 'GMT+10',
    offset: 10,
    zones: ['Pacific/Port_Moresby'],
  },
  'Cook Islands Standard Time': {
    abbr: 'GMT-10',
    offset: -10,
    zones: ['Pacific/Rarotonga'],
  },
  'Tahiti Time': {
    abbr: 'GMT-10',
    offset: -10,
    zones: ['Pacific/Tahiti'],
  },
  'Gilbert Islands Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Pacific/Tarawa'],
  },
  'Tonga Standard Time': {
    abbr: 'GMT+13',
    offset: 13,
    zones: ['Pacific/Tongatapu'],
  },
  'Chuuk Time': {
    abbr: 'GMT+10',
    offset: 10,
    zones: ['Pacific/Truk'],
  },
  'Wake Island Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Pacific/Wake'],
  },
  'Wallis & Futuna Time': {
    abbr: 'GMT+12',
    offset: 12,
    zones: ['Pacific/Wallis'],
  },
} as const;

export const TimezoneOptions: TimeFormatOptions = Object.entries(Timezones)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .map(([key, value]: [TimeFormat, any]) => ({
    label: key,
    value: key,
    ...value,
  }))
  .sort((a, b) => {
    if (a.label > b.label) return 1;
    if (b.label > a.label) return -1;
    return 0;
  });

export const getTimezone = (timeFormat: TimeFormat): string => {
  if (timeFormat === 'local') return getLocalTimezone();
  return Timezones[timeFormat]?.zones[0] ?? timeFormat;
};

export const formatOffset = (offset: number) => {
  const formattedOffset = String(Math.abs(offset)).padStart(2, '0');
  return offset >= 0 ? `+${formattedOffset}:00` : `-${formattedOffset}:00`;
};

export const getUTCOffset = (timeFormat: TimeFormat): string => {
  let offset: number | undefined = Timezones[timeFormat]?.offset;

  if (offset === undefined) {
    const timezone = getTimezone(timeFormat);
    const offsetInMilliseconds = dateTz.getTimezoneOffset(timezone);
    if (offsetInMilliseconds) {
      offset = offsetInMilliseconds / 1000 / 60 / 60;
    } else {
      offset = 0;
    }
  }
  return formatOffset(offset);
};
