import { useEffect } from "react";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const INTERSTITIAL_ID = TestIds.INTERSTITIAL;
const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);

export const useInterstitialAd = () => {
  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {},
    );
    interstitial.load();
    return unsubscribe;
  }, []);

  const showInterstitial = () => {
    if (interstitial.loaded) {
      interstitial.show();
      interstitial.load(); // next ad load
    }
  };

  return { showInterstitial };
};
