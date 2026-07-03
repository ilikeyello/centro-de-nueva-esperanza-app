package com.centronuevaesperanza.app;

import android.content.ComponentName;
import android.content.Context;
import android.net.Uri;

import androidx.browser.customtabs.CustomTabsClient;
import androidx.browser.customtabs.CustomTabsServiceConnection;
import androidx.browser.customtabs.CustomTabsSession;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Prewarms the connection to the donation URL (Tithe.ly) using Chrome
 * Custom Tabs' mayLaunchUrl(), so that when @capacitor/inappbrowser
 * actually opens the system browser sheet, the page is already
 * connecting/prefetching instead of starting cold.
 *
 * This plugin never renders any content itself — it only asks the Custom
 * Tabs provider to pre-connect — so it has no bearing on how the donation
 * page itself is presented (that's handled by openDonationSheet() in
 * lib/donations.ts).
 */
@CapacitorPlugin(name = "DonationPrewarm")
public class DonationPrewarmPlugin extends Plugin {

    private CustomTabsClient client;
    private CustomTabsSession session;
    private CustomTabsServiceConnection connection;

    @PluginMethod
    public void prewarm(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("A valid url is required");
            return;
        }

        Context context = getContext();
        String packageName = CustomTabsClient.getPackageName(context, null);
        if (packageName == null) {
            // No browser on the device supports Custom Tabs — nothing to prewarm,
            // but this isn't an error condition for the caller.
            call.resolve();
            return;
        }

        // Tear down any previous connection before starting a new one.
        unbind();

        connection = new CustomTabsServiceConnection() {
            @Override
            public void onCustomTabsServiceConnected(ComponentName name, CustomTabsClient customTabsClient) {
                client = customTabsClient;
                client.warmup(0L);
                session = client.newSession(null);
                if (session != null) {
                    session.mayLaunchUrl(Uri.parse(url), null, null);
                }
            }

            @Override
            public void onServiceDisconnected(ComponentName name) {
                client = null;
                session = null;
            }
        };

        CustomTabsClient.bindCustomTabsService(context, packageName, connection);
        call.resolve();
    }

    @PluginMethod
    public void invalidate(PluginCall call) {
        unbind();
        call.resolve();
    }

    private void unbind() {
        if (connection != null) {
            try {
                getContext().unbindService(connection);
            } catch (IllegalArgumentException ignored) {
                // Already unbound — safe to ignore.
            }
            connection = null;
        }
        client = null;
        session = null;
    }
}
