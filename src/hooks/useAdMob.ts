import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  AppOpenAd,
  RewardedInterstitialAd,
} from "react-native-google-mobile-ads";

const STORAGE_KEYS = {
  BANNER_ENABLED: "@admob_banner_enabled",
  REWARD_POINTS: "@admob_reward_points",
};

// Official AdMob Test Ad Units Initialize Karein
const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL);
const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED);
const appOpen = AppOpenAd.createForAdRequest(TestIds.APP_OPEN);
const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
  TestIds.REWARDED_INTERSTITIAL,
);

export function useAdMob() {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [isAppOpenVisible, setIsAppOpenVisible] = useState(false);
  const [isInterstitialVisible, setIsInterstitialVisible] = useState(false);
  const [isRewardedVisible, setIsRewardedVisible] = useState(false);
  const [isRewardedInterstitialVisible, setIsRewardedInterstitialVisible] =
    useState(false);
  const [isProActive, setIsProActive] = useState(false);

  useEffect(() => {
    loadSettings();

    // Rewarded Ad Listener
    const unsubscribeRewarded = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        claimReward(reward.amount || 10);
      },
    );

    // Ads pre-load karein
    interstitial.load();
    rewarded.load();
    appOpen.load();
    rewardedInterstitial.load();

    return () => {
      unsubscribeRewarded();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const bannerVal = await AsyncStorage.getItem(STORAGE_KEYS.BANNER_ENABLED);
      if (bannerVal !== null) {
        setIsBannerVisible(bannerVal === "true");
      }
      const pointsVal = await AsyncStorage.getItem(STORAGE_KEYS.REWARD_POINTS);
      if (pointsVal !== null) {
        setRewardPoints(parseInt(pointsVal, 10));
      }
    } catch (e) {}
  };

  const toggleBanner = async () => {
    const nextVal = !isBannerVisible;
    setIsBannerVisible(nextVal);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BANNER_ENABLED, String(nextVal));
    } catch (e) {}
  };

  const showAppOpen = () => {
    if (appOpen.loaded) {
      appOpen.show();
    } else {
      appOpen.load();
    }
  };

  const hideAppOpen = () => {
    setIsAppOpenVisible(false);
  };

  const showInterstitial = () => {
    if (interstitial.loaded) {
      interstitial.show();
    } else {
      interstitial.load();
    }
  };

  const hideInterstitial = () => {
    setIsInterstitialVisible(false);
  };

  const showRewarded = () => {
    if (rewarded.loaded) {
      rewarded.show();
    } else {
      rewarded.load();
    }
  };

  const hideRewarded = () => {
    setIsRewardedVisible(false);
  };

  const showRewardedInterstitial = () => {
    if (rewardedInterstitial.loaded) {
      rewardedInterstitial.show();
    } else {
      rewardedInterstitial.load();
    }
  };

  const hideRewardedInterstitial = () => {
    setIsRewardedInterstitialVisible(false);
  };

  const claimReward = async (amount: number = 10) => {
    const newPoints = rewardPoints + amount;
    setRewardPoints(newPoints);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REWARD_POINTS, String(newPoints));
    } catch (e) {}
  };

  return {
    isBannerVisible,
    toggleBanner,
    isAppOpenVisible,
    showAppOpen,
    hideAppOpen,
    isInterstitialVisible,
    showInterstitial,
    hideInterstitial,
    isRewardedVisible,
    showRewarded,
    hideRewarded,
    isRewardedInterstitialVisible,
    showRewardedInterstitial,
    hideRewardedInterstitial,
    claimReward,
    rewardPoints,
    isProActive,
    adStats: {
      bannerImpressions: 0,
      interstitialImpressions: 0,
      rewardedImpressions: 0,
    },
  };
}
