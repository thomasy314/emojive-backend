import tags from 'language-tags';
import { LanguageTag } from './languages.types';

function languagesService() {
  function languageTagToLanguageTagObj(langString: string): LanguageTag {
    const langTag = tags(langString);

    const languageCode = langTag.language()?.format();

    if (!langTag.valid() || languageCode === undefined) {
      throw new Error('Invalid language tag: ' + langString);
    }

    return {
      languageCode: languageCode,
      regionCode: langTag.region()?.format() ?? null,
    };
  }

  return {
    languageTagToLanguageTagObj,
  };
}

export default languagesService;
