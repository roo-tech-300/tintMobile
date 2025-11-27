import createIconSetFromIcoMoon from '@expo/vector-icons/createIconSetFromIcoMoon';
import icoMoonConfig from '../assets/icons/selection.json';

const TintIcon = createIconSetFromIcoMoon(
  icoMoonConfig,
  "TintIcons",
  "TintIcons.ttf"
);

export default TintIcon;
