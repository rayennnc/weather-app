import { useT } from '../../../shared/i18n/useT';
import {
  GEONAMES_URL,
  LICENSE_URL,
  OPEN_METEO_URL,
} from '../../../shared/lib/dataSources';
import { openLink } from '../../../shared/lib/openLink';

// one source of data, ready to draw
export type SourceView = {
  id: 'weather' | 'places';
  title: string;
  credit: string; // the credit that Open-Meteo and GeoNames ask for
  creditUrl: string;
  license: string;
  licenseUrl: string;
  note: string | null; // says that the values were changed, as CC BY asks
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
