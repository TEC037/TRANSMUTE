import { Haptics, ImpactStyle } from '@capacitor/haptics';

const impactLight = async () => {
  await Haptics.impact({ style: ImpactStyle.Light });
};

const impactMedium = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium });
};

const impactHeavy = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });
};

const notificationSuccess = async () => {
  await Haptics.notification({ type: 'SUCCESS' });
};

const notificationError = async () => {
  await Haptics.notification({ type: 'ERROR' });
};

const vibrate = async () => {
  await Haptics.vibrate();
};

export const haptics = {
  impactLight,
  impactMedium,
  impactHeavy,
  notificationSuccess,
  notificationError,
  vibrate,
};
