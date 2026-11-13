import { useT } from '../../../shared/i18n/useT';
import { OPEN_METEO_URL, GEONAMES_URL, LICENSE_URL } from '../data/dataSources';
import { openLink } from '../data/openLink';

export type SourceView = {
  id: 'weather' | 'places';
  title: string;
  credit: string;
  creditUrl: string;
  license: string;
  licenseUrl: string;
  note: string | null;
};

export type AboutViewModel = {
  sources: SourceView[];
  openLink: (url: string) => void;
};

export function useAboutViewModel(): AboutViewModel {
  const t = useT();

  return {
    sources: [
      {
        id: 'weather',
        title: t('about.weatherTitle'),
        credit: t('about.weatherCredit'),
        creditUrl: OPEN_METEO_URL,
        license: t('about.license'),
        licenseUrl: LICENSE_URL,
        note: t('about.weatherNote'),
      },
      {
        id: 'places',
        title: t('about.placesTitle'),
        credit: t('about.placesCredit'),
        creditUrl: GEONAMES_URL,
        license: t('about.license'),
        licenseUrl: LICENSE_URL,
        note: null,
      },
    ],
    openLink: url => {
      openLink(url);
    },
  };
}
