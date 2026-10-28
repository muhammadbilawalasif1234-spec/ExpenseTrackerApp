import React from "react";
import { View, StyleSheet, Image, ImageSourcePropType } from "react-native";
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

interface SpendlyLogoProps {
  width?: number;
  height?: number;
  useRasterImage?: boolean;
}

/**
 * SpendlyLogo - Official Spendly brand logo matching Figma specifications.
 * Features:
 * - Running stick figure with motion speed lines
 * - Navy leather wallet with white stitching, peek-through folded bills,
 *   circular dollar coin emblem, and clasp snap
 * - Bouncing dollar coin with dashed motion arc
 * - Stylized "Spendly" wordmark with dot-dash accent underline
 */
export const SpendlyLogo: React.FC<SpendlyLogoProps> = ({
  width = 145,
  height = 96,
  useRasterImage = false,
}) => {
  if (useRasterImage) {
    return (
      <View
        style={{
          width,
          height,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../assets/Appicon.png") as ImageSourcePropType}
          style={{ width, height }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View
      style={{ width, height, alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={width} height={height} viewBox="0 0 290 192" fill="none">
        <Defs>
          {/* Rich navy gradient for wallet leather body */}
          <LinearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0F3D5E" />
            <Stop offset="0.6" stopColor="#0F3D5E" />
            <Stop offset="1" stopColor="#1A5A88" />
          </LinearGradient>

          {/* Cash bill gradient */}
          <LinearGradient id="billGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#E2E8F0" />
          </LinearGradient>

          <LinearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1A5A88" />
            <Stop offset="1" stopColor="#0F3D5E" />
          </LinearGradient>
        </Defs>

        {/* ================= 1. RUNNER (Left Side) ================= */}
        {/* Speed lines behind runner */}
        <Path
          d="M 22 84 L 40 84"
          stroke="#0F3D5E"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 14 96 L 36 96"
          stroke="#0F3D5E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <Path
          d="M 24 108 L 44 108"
          stroke="#0F3D5E"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Runner figure */}
        <G>
          {/* Head */}
          <Circle
            cx="66"
            cy="80"
            r="8.5"
            fill="#0F3D5E"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Torso */}
          <Path
            d="M 68 89 L 80 110"
            stroke="#0F3D5E"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Front arm reaching forward */}
          <Path
            d="M 72 95 L 86 99 L 96 90"
            stroke="#0F3D5E"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Back arm bent back */}
          <Path
            d="M 70 95 L 56 102 L 48 96"
            stroke="#0F3D5E"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Front bent leg in stride */}
          <Path
            d="M 80 110 L 92 120 L 102 136"
            stroke="#0F3D5E"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Back trailing leg */}
          <Path
            d="M 80 110 L 68 124 L 54 130"
            stroke="#0F3D5E"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>

        {/* ================= 2. FOLDED CASH BILLS ================= */}
        {/* Back bill */}
        <Path
          d="M 116 52 L 126 24 C 128 19 133 16 138 17 L 202 30 C 207 31 210 36 208 41 L 204 54"
          fill="url(#billGrad)"
          stroke="#0F3D5E"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Front bill */}
        <Path
          d="M 124 52 L 132 32 C 134 28 138 25 143 26 L 192 35 C 196 36 199 40 197 44 L 194 54"
          fill="#FFFFFF"
          stroke="#0F3D5E"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* ================= 3. NAVY WALLET ================= */}
        {/* Wallet Main Body */}
        <Rect
          x="96"
          y="46"
          width="132"
          height="84"
          rx="18"
          fill="url(#walletGrad)"
          stroke="#0F3D5E"
          strokeWidth="4"
        />

        {/* White dashed stitching top & bottom */}
        <Path
          d="M 108 55 L 216 55"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeDasharray="5,4"
        />
        <Path
          d="M 108 121 L 216 121"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeDasharray="5,4"
        />

        {/* Center Circular Dollar Badge */}
        <Circle
          cx="156"
          cy="88"
          r="24"
          fill="#FFFFFF"
          stroke="#0F3D5E"
          strokeWidth="3"
        />
        {/* Inner Dollar Sign */}
        <SvgText
          x="156"
          y="98"
          fill="#0F3D5E"
          fontSize="30"
          fontWeight="900"
          textAnchor="middle"
        >
          $
        </SvgText>

        {/* Wallet Right Clasp Flap */}
        <Path
          d="M 198 72 C 198 70 200 68 203 68 L 228 68 C 236 68 242 74 242 82 C 242 90 236 96 228 96 L 203 96 C 200 96 198 94 198 92 Z"
          fill="url(#walletGrad)"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        {/* Snap Stud on clasp */}
        <Circle
          cx="228"
          cy="82"
          r="6"
          fill="#FFFFFF"
          stroke="#0F3D5E"
          strokeWidth="2.5"
        />

        {/* ================= 4. BOUNCING COIN ================= */}
        {/* Trajectory bounce dashed curve */}
        <Path
          d="M 230 126 C 238 108 246 108 252 116 C 258 102 268 96 276 86"
          stroke="#0F3D5E"
          strokeWidth="2"
          strokeDasharray="3.5,3.5"
          fill="none"
        />

        {/* Bouncing coin */}
        <G transform="rotate(-15 272 74)">
          <Circle
            cx="272"
            cy="74"
            r="16"
            fill="url(#coinGrad)"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          {/* Inner circle rim */}
          <Circle
            cx="272"
            cy="74"
            r="12.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <SvgText
            x="272"
            y="80"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="900"
            textAnchor="middle"
          >
            $
          </SvgText>
        </G>

        {/* Motion vibration arcs above coin */}
        <Path
          d="M 282 58 C 288 63 290 70 288 76"
          stroke="#0F3D5E"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 288 56 C 295 62 297 71 294 78"
          stroke="#0F3D5E"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* ================= 5. WORDMARK "Spendly" ================= */}
        <SvgText
          x="156"
          y="166"
          fill="#0F3D5E"
          fontSize="44"
          fontWeight="900"
          letterSpacing="-0.5"
          textAnchor="middle"
        >
          Spendly
        </SvgText>

        {/* Underline accent (dash • dot • dash) */}
        <Path
          d="M 120 180 L 144 180"
          stroke="#0F3D5E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <Circle cx="156" cy="180" r="3.5" fill="#0F3D5E" />
        <Path
          d="M 168 180 L 192 180"
          stroke="#0F3D5E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
