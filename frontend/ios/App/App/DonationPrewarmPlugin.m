#import <Capacitor/Capacitor.h>

// Registers DonationPrewarmPlugin (see DonationPrewarmPlugin.swift) with
// Capacitor's runtime plugin discovery.
CAP_PLUGIN(DonationPrewarmPlugin, "DonationPrewarm",
  CAP_PLUGIN_METHOD(prewarm, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(invalidate, CAPPluginReturnPromise);
)
