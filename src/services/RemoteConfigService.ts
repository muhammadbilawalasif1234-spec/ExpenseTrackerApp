import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppConfig {
  showPaywall: boolean;
  splashPaywallCounter: number;
  splashPaywallSession: number;
  premiumScreenCloseTime: number;
  resumeAppOpen: boolean;
  introScreens: boolean;
  welcomeScreen: boolean;
  welcomeScreenCounter: number;
  splashInter: boolean;
  overallInter: boolean;
  overallNative: boolean;
  languageNative: boolean;
  onboardingNative: boolean;
  onboardingInter: boolean;
  interAdDelay: number;
  adCtaColor: string;
  homeAdValue: number; // 0 = no ad, 1 = native, 2 = collapsible banner
  sequenceOne: boolean; // true = Sequence 1 (IAP first), false = Sequence 2 (Ads first)
  splashInterSession: number;
  mainInterSession: number;
  onboardingSkipButton: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  showPaywall: true,
  splashPaywallCounter: 4,
  splashPaywallSession: 1,
  premiumScreenCloseTime: 4,
  resumeAppOpen: true,
  introScreens: true,
  welcomeScreen: true,
  welcomeScreenCounter: 4,
  splashInter: true,
  overallInter: true,
  overallNative: true,
  languageNative: true,
  onboardingNative: true,
  onboardingInter: true,
  interAdDelay: 15,
  adCtaColor: "#E39434",
  homeAdValue: 3,
  sequenceOne: true,
  splashInterSession: 1,
  mainInterSession: 1,
  onboardingSkipButton: true,
};

class RemoteConfigService {
  private config: AppConfig = DEFAULT_CONFIG;
  private sessionCount: number = 1;

  async init(): Promise<AppConfig> {
    try {
      // 1. Manage session increment
      const storedSession = await AsyncStorage.getItem(
        "@spendly_app_session_count",
      );
      const currentSession = storedSession
        ? parseInt(storedSession, 10) + 1
        : 1;
      this.sessionCount = currentSession;
      await AsyncStorage.setItem(
        "@spendly_app_session_count",
        currentSession.toString(),
      );

      // 2. Read Remote Config parameters from storage if updated remotely
      const storedConfig = await AsyncStorage.getItem(
        "@spendly_remote_config_json",
      );
      if (storedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) };
      }
    } catch (e) {
      console.log("RemoteConfigService init error:", e);
    }
    return this.config;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getSessionCount(): number {
    return this.sessionCount;
  }

  // Evaluates whether Paywall (IAP) should be displayed based on counter & session parameters
  shouldShowPaywall(): boolean {
    if (!this.config.showPaywall) return false;
    return (
      this.sessionCount >= this.config.splashPaywallSession &&
      this.sessionCount <= this.config.splashPaywallCounter
    );
  }

  // Evaluates whether Welcome Screen should be displayed
  shouldShowWelcomeScreen(): boolean {
    if (!this.config.welcomeScreen) return false;
    return this.sessionCount <= this.config.welcomeScreenCounter;
  }

  // Evaluates whether Splash Interstitial ad should run
  shouldShowSplashInter(): boolean {
    if (!this.config.splashInter) return false;
    return this.sessionCount >= this.config.splashInterSession;
  }
}

export const remoteConfigService = new RemoteConfigService();
