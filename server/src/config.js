export const config = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'catchtrace_hackathon_leap_2026_secret',
  THRESHOLDS: {
    WEIGHT_LOSS_GENERAL_PERCENT: 15,
    WEIGHT_LOSS_PROCESSING_PERCENT: 60,
    TIME_GAP_MAX_HOURS: 6,
    DUPLICATE_TIME_WINDOW_MINUTES: 5,
    COLD_CHAIN_MAX_TEMP_C: 4.0,
  }
};
