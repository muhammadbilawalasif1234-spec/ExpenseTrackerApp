const {
  withAppBuildGradle,
  withMainActivity,
  withMainApplication,
  withDangerousMod,
  withAndroidManifest,
} = require("@expo/config-plugins");

function withAndroidBuildConfig(config) {
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    if (androidManifest.manifest && androidManifest.manifest.application) {
      androidManifest.manifest.application.forEach((app) => {
        if (app.activity) {
          app.activity.forEach((activity) => {
            if (activity.$ && activity.$["android:configChanges"]) {
              activity.$["android:configChanges"] = activity.$[
                "android:configChanges"
              ]
                .split("|")
                .map((item) => item.trim())
                .filter((item) => item !== "assetsPaths")
                .join("|");
            }
          });
        }
      });
    }
    return config;
  });

  config = withAppBuildGradle(config, async (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addGradleReleaseFixes(
        config.modResults.contents,
      );
    }
    return config;
  });

  config = withMainActivity(config, async (config) => {
    if (config.modResults.language === "kt") {
      let contents = config.modResults.contents;
      // REMOVE wrong imports
      contents = contents.replace(/import com\.spendly\.app\.R\n?/g, "");
      contents = contents.replace(
        /import com\.spendly\.app\.BuildConfig\n?/g,
        "",
      );

      // FIX: R.style.AppTheme ko dynamic banao, R ki zaroorat hi nahi
      contents = contents.replace(
        /setTheme\(R\.style\.AppTheme\)/g,
        'val themeId = resources.getIdentifier("AppTheme", "style", packageName)\n    if (themeId != 0) {\n      setTheme(themeId)\n    }',
      );
      if (!contents.includes("splashScreen.setOnExitAnimationListener")) {
        contents = contents.replace(
          "super.onCreate(null)",
          "if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {\n      splashScreen.setOnExitAnimationListener { splashScreenView -> splashScreenView.remove() }\n    }\n    super.onCreate(null)",
        );
      }
      config.modResults.contents = contents;
    }
    return config;
  });

  config = withMainApplication(config, async (config) => {
    if (config.modResults.language === "kt") {
      let contents = config.modResults.contents;
      // REMOVE wrong imports - yehi error de rahe the
      contents = contents.replace(/import com\.spendly\.app\.R\n?/g, "");
      contents = contents.replace(
        /import com\.spendly\.app\.BuildConfig\n?/g,
        "",
      );
      config.modResults.contents = contents;
    }
    return config;
  });

  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const fs = require("fs");
      const path = require("path");
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
      );
      const drawableDir = path.join(resDir, "drawable");
      if (!fs.existsSync(drawableDir))
        fs.mkdirSync(drawableDir, { recursive: true });
      fs.writeFileSync(
        path.join(drawableDir, "splash_empty.xml"),
        `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">\n    <solid android:color="@android:color/transparent" />\n    <size android:width="1dp" android:height="1dp" />\n</shape>\n`,
        "utf8",
      );
      const v31Dir = path.join(resDir, "values-v31");
      if (!fs.existsSync(v31Dir)) fs.mkdirSync(v31Dir, { recursive: true });
      fs.writeFileSync(
        path.join(v31Dir, "styles.xml"),
        `<?xml version="1.0" encoding="utf-8"?>\n<resources xmlns:tools="http://schemas.android.com/tools">\n  <style name="Theme.App.SplashScreen" parent="AppTheme">\n    <item name="android:windowSplashScreenBackground">@color/splashscreen_background</item>\n    <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_empty</item>\n    <item name="android:windowSplashScreenIconBackgroundColor">@android:color/transparent</item>\n    <item name="android:windowLightStatusBar">true</item>\n    <item name="android:windowLightNavigationBar" tools:targetApi="o_mr1">true</item>\n    <item name="android:statusBarColor">@android:color/transparent</item>\n    <item name="android:navigationBarColor">@android:color/transparent</item>\n  </style>\n</resources>\n`,
        "utf8",
      );
      return config;
    },
  ]);
  return config;
}

function addGradleReleaseFixes(contents) {
  if (!contents.includes("buildConfig = true")) {
    contents = contents.replace(
      /android\s*\{/,
      `android {\n    buildFeatures {\n        buildConfig = true\n    }`,
    );
  }
  if (!contents.includes("META-INF/INDEX.LIST")) {
    contents = contents.replace(
      /android\s*\{/,
      `android {\n    packagingOptions {\n        resources {\n            excludes += ['META-INF/INDEX.LIST','META-INF/DEPENDENCIES','META-INF/LICENSE','META-INF/LICENSE.txt','META-INF/NOTICE.txt']\n        }\n    }`,
    );
  }
  if (
    contents.includes("buildTypes {") &&
    contents.includes("release {") &&
    !contents.includes("signingConfig signingConfigs.")
  ) {
    contents = contents.replace(
      /release\s*\{/,
      `release {\n            signingConfig signingConfigs.debug`,
    );
  }
  if (!contents.includes("checkReleaseAarMetadata")) {
    contents += `\n\ndef ensureCodegenDirsExist = {\n    def codegenDirs = ["node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni","node_modules/react-native-gesture-handler/android/build/generated/source/codegen/jni","node_modules/react-native-safe-area-context/android/build/generated/source/codegen/jni","node_modules/react-native-svg/android/build/generated/source/codegen/jni"]\n    codegenDirs.each { dirPath ->\n        def dir = file("\${rootDir}/../\${dirPath}")\n        if (!dir.exists()) dir.mkdirs()\n        def cmakeFile = new File(dir, "CMakeLists.txt")\n        if (!cmakeFile.exists()) cmakeFile.text = '# Fallback'\n    }\n}\nensureCodegenDirsExist()\ntasks.matching { it.name.toLowerCase().contains("externalnativebuild") || it.name.toLowerCase().contains("cmake") }.configureEach { doFirst { ensureCodegenDirsExist() } }\ntasks.whenTaskAdded { task -> if (task.name.toLowerCase().contains("aarmetadata") || task.name.toLowerCase().contains("externalnativebuildclean")) task.enabled = false }\n`;
  }
  return contents;
}
module.exports = withAndroidBuildConfig;
